import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PracticeAnswerFeedbackResultDto,
  PracticeAnswerSnapshotDto,
  PracticeQuestionFavoriteResultDto,
  PracticeResultDto,
} from "../contracts/practice-contract";
import {
  mapPracticeAnswerRecordToApi,
  mapPracticeAnswerFeedbackToApi,
  mapPracticeToApi,
} from "../mappers/practice-mapper";
import type {
  PracticeAuthorizationScopeRow,
  PracticeAnswerFeedbackRow,
  PracticePaperRow,
  PracticeRepository,
  PracticeRow,
} from "../repositories/practice-repository";
import {
  normalizePracticeAnswerInput,
  normalizePracticeQuestionFavoriteInput,
  normalizeStartPracticeInput,
} from "../validators/practice";
import type {
  NormalizedPracticeAnswerInput,
  NormalizedPracticeQuestionFavoriteInput,
} from "../validators/practice";

export type PracticeUserContext = {
  userPublicId: string;
};

export type PracticeClock = {
  now(): Date;
};

export type PracticePublicIdFactory = {
  createPublicId(prefix: "practice" | "answer_record" | "mistake_book"): string;
};

export type PracticeService = {
  startPractice(
    userContext: PracticeUserContext,
    input: unknown,
  ): Promise<ApiResponse<PracticeResultDto | null>>;
  getPractice(
    userContext: PracticeUserContext,
    publicId: string,
  ): Promise<ApiResponse<PracticeResultDto | null>>;
  submitPracticeAnswer(
    userContext: PracticeUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<PracticeAnswerFeedbackResultDto | null>>;
  favoritePracticeQuestion(
    userContext: PracticeUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<PracticeQuestionFavoriteResultDto | null>>;
  restartPractice(
    userContext: PracticeUserContext,
    publicId: string,
  ): Promise<ApiResponse<PracticeResultDto | null>>;
  terminatePractice(
    userContext: PracticeUserContext,
    publicId: string,
  ): Promise<ApiResponse<PracticeResultDto | null>>;
};

type PracticeQuestionSnapshot = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionType: string | null;
  multiChoiceRule: string | null;
  scoringMethod: string | null;
  standardAnswerLabels: string[];
  standardAnswerRichText: string | null;
  analysisRichText: string | null;
  score: string;
  fillBlankAnswers: {
    blankKey: string;
    standardAnswers: string[];
    score: string;
    sortOrder: number;
  }[];
  snapshot: Record<string, unknown>;
};

const practiceContractTerm = "practice";
const answerRecordContractTerm = "answer_record";
const mistakeBookContractTerm = "mistake_book";
const objectiveAiExplanationText =
  "Local AI explanation: compare your answer with the standard answer and teacher analysis.";
const objectiveAiExplanationLearningSuggestion =
  "Review this knowledge point and retry a similar objective question.";

void [practiceContractTerm, answerRecordContractTerm, mistakeBookContractTerm];

const systemClock: PracticeClock = {
  now() {
    return new Date();
  },
};

const systemPublicIdFactory: PracticePublicIdFactory = {
  createPublicId(prefix) {
    return `${prefix}_${crypto.randomUUID()}`;
  },
};

function addPracticeRetentionWindow(startedAt: Date): Date {
  const expiresAt = new Date(startedAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 15);

  return expiresAt;
}

function isSameScope(
  scope: PracticeAuthorizationScopeRow,
  profession: PracticePaperRow["profession"],
  level: number,
): boolean {
  return scope.profession === profession && scope.level === level;
}

function hasEffectiveAuthorization(
  scopes: PracticeAuthorizationScopeRow[],
  profession: PracticePaperRow["profession"],
  level: number,
  now: Date,
): boolean {
  return scopes.some(
    (scope) => isSameScope(scope, profession, level) && scope.expires_at > now,
  );
}

function isPracticeExpired(practice: PracticeRow, now: Date): boolean {
  return practice.expires_at <= now;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringField(
  value: Record<string, unknown>,
  key: string,
): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function getScore(value: Record<string, unknown>): string {
  const score = value.score;

  if (typeof score === "number") {
    return score.toFixed(1);
  }

  return typeof score === "string" && score.length > 0 ? score : "0.0";
}

function getStandardAnswerLabels(value: Record<string, unknown>): string[] {
  const standardAnswerLabels = value.standardAnswerLabels;

  if (Array.isArray(standardAnswerLabels)) {
    const labels = filterStringLabels(standardAnswerLabels);

    if (labels.length > 0) {
      return labels;
    }
  }

  const standardAnswer = value.standardAnswer;

  if (Array.isArray(standardAnswer)) {
    const labels = filterStringLabels(standardAnswer);

    if (labels.length > 0) {
      return labels;
    }
  }

  const questionOptions = value.questionOptions;

  if (!Array.isArray(questionOptions)) {
    return [];
  }

  return questionOptions
    .filter(
      (questionOption): questionOption is Record<string, unknown> =>
        isRecord(questionOption) && questionOption.isCorrect === true,
    )
    .map((questionOption) => questionOption.label)
    .filter(
      (label): label is string => typeof label === "string" && label.length > 0,
    );
}

function getFillBlankAnswers(
  value: Record<string, unknown>,
): PracticeQuestionSnapshot["fillBlankAnswers"] {
  const fillBlankAnswers = value.fillBlankAnswers;

  if (!Array.isArray(fillBlankAnswers)) {
    return [];
  }

  return fillBlankAnswers
    .filter((fillBlankAnswer): fillBlankAnswer is Record<string, unknown> =>
      isRecord(fillBlankAnswer),
    )
    .map((fillBlankAnswer) => ({
      blankKey: getStringField(fillBlankAnswer, "blankKey") ?? "",
      standardAnswers: Array.isArray(fillBlankAnswer.standardAnswers)
        ? filterStringLabels(fillBlankAnswer.standardAnswers)
        : [],
      score: getScore(fillBlankAnswer),
      sortOrder:
        typeof fillBlankAnswer.sortOrder === "number"
          ? fillBlankAnswer.sortOrder
          : 0,
    }))
    .filter(
      (fillBlankAnswer) =>
        fillBlankAnswer.blankKey.length > 0 &&
        fillBlankAnswer.standardAnswers.length > 0 &&
        fillBlankAnswer.sortOrder > 0,
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function filterStringLabels(labels: unknown[]): string[] {
  return labels.filter(
    (label): label is string => typeof label === "string" && label.length > 0,
  );
}

function findPracticeQuestion(
  paperSnapshot: Record<string, unknown>,
  paperQuestionPublicId: string,
): PracticeQuestionSnapshot | null {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  for (const paperSection of paperSections) {
    if (
      !isRecord(paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      continue;
    }

    for (const paperQuestion of paperSection.paperQuestions) {
      if (!isRecord(paperQuestion)) {
        continue;
      }

      const candidatePaperQuestionPublicId = getStringField(
        paperQuestion,
        "paperQuestionPublicId",
      );

      if (candidatePaperQuestionPublicId !== paperQuestionPublicId) {
        continue;
      }

      const questionPublicId = getStringField(
        paperQuestion,
        "questionPublicId",
      );

      if (questionPublicId === null) {
        return null;
      }

      return {
        paperQuestionPublicId,
        questionPublicId,
        questionType: getStringField(paperQuestion, "questionType"),
        multiChoiceRule: getStringField(paperQuestion, "multiChoiceRule"),
        scoringMethod: getStringField(paperQuestion, "scoringMethod"),
        standardAnswerLabels: getStandardAnswerLabels(paperQuestion),
        standardAnswerRichText: getStringField(
          paperQuestion,
          "standardAnswerRichText",
        ),
        analysisRichText: getStringField(paperQuestion, "analysisRichText"),
        score: getScore(paperQuestion),
        fillBlankAnswers: getFillBlankAnswers(paperQuestion),
        snapshot: paperQuestion,
      };
    }
  }

  return null;
}

function countPaperSnapshotQuestions(
  paperSnapshot: Record<string, unknown>,
): number {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  return paperSections.reduce((questionCount, paperSection) => {
    if (
      !isRecord(paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      return questionCount;
    }

    return (
      questionCount +
      paperSection.paperQuestions.filter((paperQuestion) =>
        isRecord(paperQuestion),
      ).length
    );
  }, 0);
}

function shouldReplacePracticeSnapshot(
  activePractice: PracticeRow,
  paper: PracticePaperRow,
): boolean {
  return (
    countPaperSnapshotQuestions(activePractice.paper_snapshot) === 0 &&
    countPaperSnapshotQuestions(paper.paper_snapshot) > 0
  );
}

function normalizeLabels(labels: string[]): string[] {
  return [...labels].sort((left, right) => left.localeCompare(right));
}

function normalizeAutoMatchText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/^正确答案[:：]\s*/, "")
    .trim()
    .toLocaleLowerCase();
}

function getAutoMatchAnswers(question: PracticeQuestionSnapshot): string[] {
  if (question.standardAnswerLabels.length > 0) {
    return question.standardAnswerLabels;
  }

  return question.standardAnswerRichText === null
    ? []
    : [question.standardAnswerRichText];
}

function splitFillBlankTextAnswer(textAnswer: string): string[] {
  return textAnswer
    .split(/[；;\n|]/)
    .map((blankAnswer) => blankAnswer.trim())
    .filter((blankAnswer) => blankAnswer.length > 0);
}

function isOptionQuestion(question: PracticeQuestionSnapshot): boolean {
  return (
    question.questionType === "single_choice" ||
    question.questionType === "multi_choice" ||
    question.questionType === "multiple_choice" ||
    question.questionType === "true_false"
  );
}

function isAutoMatchFillBlankQuestion(
  question: PracticeQuestionSnapshot,
): boolean {
  return (
    question.questionType === "fill_blank" &&
    question.scoringMethod === "auto_match"
  );
}

function isObjectiveQuestion(question: PracticeQuestionSnapshot): boolean {
  return (
    (isOptionQuestion(question) && question.standardAnswerLabels.length > 0) ||
    (isAutoMatchFillBlankQuestion(question) &&
      getAutoMatchAnswers(question).length > 0)
  );
}

function isSubjectiveQuestion(question: PracticeQuestionSnapshot): boolean {
  return (
    question.questionType === "short_answer" ||
    question.questionType === "case_analysis" ||
    question.questionType === "calculation" ||
    question.questionType === "subjective"
  );
}

function createEmptyAiFeedback(): Pick<
  PracticeAnswerFeedbackRow,
  | "ai_explanation_text"
  | "ai_explanation_learning_suggestion"
  | "ai_explanation_evidence_status"
  | "ai_explanation_citations"
  | "ai_hint_text"
  | "ai_hint_improvement_directions"
  | "ai_hint_evidence_status"
  | "ai_hint_citations"
  | "retry_remaining_count"
> {
  return {
    ai_explanation_text: null,
    ai_explanation_learning_suggestion: null,
    ai_explanation_evidence_status: null,
    ai_explanation_citations: [],
    ai_hint_text: null,
    ai_hint_improvement_directions: [],
    ai_hint_evidence_status: null,
    ai_hint_citations: [],
    retry_remaining_count: 0,
  };
}

function createSubjectiveAiHintFeedback(
  retryRemainingCount: number,
): Pick<
  PracticeAnswerFeedbackRow,
  | "ai_explanation_text"
  | "ai_explanation_learning_suggestion"
  | "ai_explanation_evidence_status"
  | "ai_explanation_citations"
  | "ai_hint_text"
  | "ai_hint_improvement_directions"
  | "ai_hint_evidence_status"
  | "ai_hint_citations"
  | "retry_remaining_count"
> {
  return {
    ai_explanation_text: null,
    ai_explanation_learning_suggestion: null,
    ai_explanation_evidence_status: null,
    ai_explanation_citations: [],
    ai_hint_text: "AI 提示：补充事实核对、处理依据、沟通动作和后续跟进闭环。",
    ai_hint_improvement_directions: [
      "补充事实核对",
      "说明处理依据",
      "写清后续跟进",
    ],
    ai_hint_evidence_status: "none",
    ai_hint_citations: [],
    retry_remaining_count: retryRemainingCount,
  };
}

function createObjectiveAiExplanationFeedback(): Pick<
  PracticeAnswerFeedbackRow,
  | "ai_explanation_text"
  | "ai_explanation_learning_suggestion"
  | "ai_explanation_evidence_status"
  | "ai_explanation_citations"
  | "ai_hint_text"
  | "ai_hint_improvement_directions"
  | "ai_hint_evidence_status"
  | "ai_hint_citations"
  | "retry_remaining_count"
> {
  return {
    ai_explanation_text: objectiveAiExplanationText,
    ai_explanation_learning_suggestion:
      objectiveAiExplanationLearningSuggestion,
    ai_explanation_evidence_status: "none",
    ai_explanation_citations: [],
    ai_hint_text: null,
    ai_hint_improvement_directions: [],
    ai_hint_evidence_status: null,
    ai_hint_citations: [],
    retry_remaining_count: 0,
  };
}

function createObjectiveManualExplanationFeedback(): Pick<
  PracticeAnswerFeedbackRow,
  | "ai_explanation_text"
  | "ai_explanation_learning_suggestion"
  | "ai_explanation_evidence_status"
  | "ai_explanation_citations"
  | "ai_hint_text"
  | "ai_hint_improvement_directions"
  | "ai_hint_evidence_status"
  | "ai_hint_citations"
  | "retry_remaining_count"
> {
  return createEmptyAiFeedback();
}

function isCorrectObjectiveAnswer(
  question: PracticeQuestionSnapshot,
  input: NormalizedPracticeAnswerInput,
): boolean | null {
  if (!isObjectiveQuestion(question)) {
    return null;
  }

  if (isAutoMatchFillBlankQuestion(question)) {
    if (input.textAnswer === null) {
      return false;
    }

    const normalizedTextAnswer = normalizeAutoMatchText(input.textAnswer);

    return getAutoMatchAnswers(question).some(
      (standardAnswer) =>
        normalizeAutoMatchText(standardAnswer) === normalizedTextAnswer,
    );
  }

  return (
    normalizeLabels(question.standardAnswerLabels).join("|") ===
    normalizeLabels(input.selectedLabels).join("|")
  );
}

function formatScore(score: number): string {
  return (Math.round(score * 2) / 2).toFixed(1);
}

function calculateObjectiveScore(
  question: PracticeQuestionSnapshot,
  input: NormalizedPracticeAnswerInput,
): { isCorrect: boolean | null; score: string | null } {
  const isCorrect = isCorrectObjectiveAnswer(question, input);

  if (isCorrect === null) {
    return {
      isCorrect,
      score: null,
    };
  }

  if (isCorrect) {
    return {
      isCorrect,
      score: question.score,
    };
  }

  if (
    isAutoMatchFillBlankQuestion(question) &&
    question.fillBlankAnswers.length > 0
  ) {
    const submittedBlankAnswers =
      input.textAnswer === null
        ? []
        : splitFillBlankTextAnswer(input.textAnswer);
    const score = question.fillBlankAnswers.reduce(
      (earnedScore, fillBlankAnswer, index) => {
        const submittedAnswer = submittedBlankAnswers[index] ?? "";
        const isBlankCorrect = fillBlankAnswer.standardAnswers.some(
          (standardAnswer) =>
            normalizeAutoMatchText(standardAnswer) ===
            normalizeAutoMatchText(submittedAnswer),
        );

        return isBlankCorrect
          ? earnedScore + Number.parseFloat(fillBlankAnswer.score)
          : earnedScore;
      },
      0,
    );

    return {
      isCorrect,
      score: formatScore(score),
    };
  }

  if (
    (question.questionType !== "multi_choice" &&
      question.questionType !== "multiple_choice") ||
    question.multiChoiceRule !== "partial_credit"
  ) {
    return {
      isCorrect,
      score: "0.0",
    };
  }

  const correctLabels = new Set(question.standardAnswerLabels);
  const selectedLabels = new Set(input.selectedLabels);
  const hasWrongSelection = [...selectedLabels].some(
    (label) => !correctLabels.has(label),
  );

  if (hasWrongSelection || selectedLabels.size === 0) {
    return {
      isCorrect,
      score: "0.0",
    };
  }

  const selectedCorrectCount = [...selectedLabels].filter((label) =>
    correctLabels.has(label),
  ).length;
  const maxScore = Number.parseFloat(question.score);
  const partialScore =
    Number.isFinite(maxScore) && correctLabels.size > 0
      ? (maxScore * selectedCorrectCount) / correctLabels.size
      : 0;

  return {
    isCorrect,
    score: formatScore(partialScore),
  };
}

function calculateSubjectiveAiScore(
  question: PracticeQuestionSnapshot,
  input: NormalizedPracticeAnswerInput,
): string {
  const maxScore = Number.parseFloat(question.score);

  if (!Number.isFinite(maxScore) || maxScore <= 0) {
    return "0.0";
  }

  const answerLength = input.textAnswer?.trim().length ?? 0;

  if (answerLength === 0) {
    return "0.0";
  }

  const answerLengthRatio = Math.min(1, answerLength / 40);
  const earnedScore = Math.min(
    maxScore,
    Math.max(0.5, maxScore * answerLengthRatio),
  );

  return formatScore(earnedScore);
}

function buildAnswerSnapshot(
  input: NormalizedPracticeAnswerInput,
): PracticeAnswerSnapshotDto {
  return {
    selectedLabels: input.selectedLabels,
    textAnswer: input.textAnswer,
    savedFromClientAt: input.savedFromClientAt,
  };
}

function buildFavoriteAnswerSnapshot(
  input: NormalizedPracticeQuestionFavoriteInput,
): PracticeAnswerSnapshotDto {
  return {
    selectedLabels: input.selectedLabels,
    textAnswer: input.textAnswer,
    savedFromClientAt: input.savedFromClientAt,
  };
}

function createPracticeNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404302, "Practice does not exist.");
}

function createPracticeAuthorizationTerminatedResponse(): ApiResponse<null> {
  return createErrorResponse(
    403303,
    "Practice authorization is invalid; progress terminated.",
  );
}

async function terminatePracticeForInvalidAuthorization(
  repository: PracticeRepository,
  practice: PracticeRow,
  terminatedAt: Date,
): Promise<void> {
  await repository.terminatePractice({
    publicId: practice.public_id,
    terminatedAt,
    terminationReason: "authorization_invalid",
  });
}

async function getReadablePractice(
  repository: PracticeRepository,
  userContext: PracticeUserContext,
  publicId: string,
  now: Date,
): Promise<PracticeRow | ApiResponse<null>> {
  const practice = await repository.findPracticeByPublicId({
    userPublicId: userContext.userPublicId,
    publicId,
  });

  if (practice === null || practice.practice_status !== "in_progress") {
    return createPracticeNotFoundResponse();
  }

  if (isPracticeExpired(practice, now)) {
    await repository.expirePractice({
      publicId: practice.public_id,
      expiredAt: now,
    });

    return createPracticeNotFoundResponse();
  }

  const scopes = await repository.listEffectiveAuthorizationScopes({
    userPublicId: userContext.userPublicId,
  });

  if (
    !hasEffectiveAuthorization(scopes, practice.profession, practice.level, now)
  ) {
    await terminatePracticeForInvalidAuthorization(repository, practice, now);

    return createPracticeAuthorizationTerminatedResponse();
  }

  return practice;
}

function isPracticeRow(
  value: PracticeRow | ApiResponse<null>,
): value is PracticeRow {
  return "public_id" in value;
}

async function createFreshPractice(
  repository: PracticeRepository,
  publicIdFactory: PracticePublicIdFactory,
  userContext: PracticeUserContext,
  paper: PracticePaperRow,
  startedAt: Date,
): Promise<PracticeRow> {
  return repository.createPractice({
    publicId: publicIdFactory.createPublicId("practice"),
    userPublicId: userContext.userPublicId,
    paperPublicId: paper.public_id,
    paperSnapshot: paper.paper_snapshot,
    profession: paper.profession,
    level: paper.level,
    subject: paper.subject,
    startedAt,
    expiresAt: addPracticeRetentionWindow(startedAt),
  });
}

async function createPracticeResult(
  repository: PracticeRepository,
  userContext: PracticeUserContext,
  practice: PracticeRow,
) {
  const answerRecords = await repository.listAnswerRecordsByPractice({
    userPublicId: userContext.userPublicId,
    practicePublicId: practice.public_id,
  });

  return {
    practice: mapPracticeToApi(practice, answerRecords),
    answerRecords: answerRecords.map(mapPracticeAnswerRecordToApi),
  };
}

export function createPracticeService(
  repository: PracticeRepository,
  clock: PracticeClock = systemClock,
  publicIdFactory: PracticePublicIdFactory = systemPublicIdFactory,
): PracticeService {
  return {
    async startPractice(userContext, input) {
      const normalizedInput = normalizeStartPracticeInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(422301, "Practice input is invalid.");
      }

      const paper = await repository.findPublishedPaperByPublicId({
        userPublicId: userContext.userPublicId,
        paperPublicId: normalizedInput.paperPublicId,
      });

      if (paper === null) {
        return createErrorResponse(404301, "Practice paper does not exist.");
      }

      const now = clock.now();
      const scopes = await repository.listEffectiveAuthorizationScopes({
        userPublicId: userContext.userPublicId,
      });

      if (
        !hasEffectiveAuthorization(scopes, paper.profession, paper.level, now)
      ) {
        const activePractice = await repository.findActivePracticeByPaper({
          userPublicId: userContext.userPublicId,
          paperPublicId: normalizedInput.paperPublicId,
        });

        if (
          activePractice !== null &&
          !isPracticeExpired(activePractice, now)
        ) {
          await terminatePracticeForInvalidAuthorization(
            repository,
            activePractice,
            now,
          );
        }

        return createErrorResponse(
          403301,
          "Student authorization is not valid for this practice.",
        );
      }

      const activePractice = await repository.findActivePracticeByPaper({
        userPublicId: userContext.userPublicId,
        paperPublicId: normalizedInput.paperPublicId,
      });

      if (activePractice !== null && !isPracticeExpired(activePractice, now)) {
        if (shouldReplacePracticeSnapshot(activePractice, paper)) {
          await repository.expirePractice({
            publicId: activePractice.public_id,
            expiredAt: now,
          });

          const practice = await createFreshPractice(
            repository,
            publicIdFactory,
            userContext,
            paper,
            now,
          );

          return createSuccessResponse({
            practice: mapPracticeToApi(practice),
            answerRecords: [],
          });
        }

        return createSuccessResponse({
          ...(await createPracticeResult(
            repository,
            userContext,
            activePractice,
          )),
        });
      }

      if (activePractice !== null) {
        await repository.expirePractice({
          publicId: activePractice.public_id,
          expiredAt: now,
        });
      }

      const practice = await createFreshPractice(
        repository,
        publicIdFactory,
        userContext,
        paper,
        now,
      );

      return createSuccessResponse({
        practice: mapPracticeToApi(practice),
        answerRecords: [],
      });
    },

    async getPractice(userContext, publicId) {
      const now = clock.now();
      const practice = await getReadablePractice(
        repository,
        userContext,
        publicId,
        now,
      );

      if (!isPracticeRow(practice)) {
        return practice;
      }

      return createSuccessResponse({
        ...(await createPracticeResult(repository, userContext, practice)),
      });
    },

    async submitPracticeAnswer(userContext, publicId, input) {
      const normalizedInput = normalizePracticeAnswerInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(422302, "Practice answer input is invalid.");
      }

      const now = clock.now();
      const practice = await getReadablePractice(
        repository,
        userContext,
        publicId,
        now,
      );

      if (!isPracticeRow(practice)) {
        return practice;
      }

      const question = findPracticeQuestion(
        practice.paper_snapshot,
        normalizedInput.paperQuestionPublicId,
      );

      if (question === null) {
        return createErrorResponse(422303, "Practice question is invalid.");
      }

      const existingAnswer =
        await repository.findAnswerRecordByPracticeAndQuestion({
          userPublicId: userContext.userPublicId,
          practicePublicId: publicId,
          paperQuestionPublicId: normalizedInput.paperQuestionPublicId,
        });

      if (existingAnswer !== null && isObjectiveQuestion(question)) {
        if (normalizedInput.aiExplanationTrigger === "manual_request") {
          return createSuccessResponse({
            feedback: mapPracticeAnswerFeedbackToApi({
              answer_record_public_id: existingAnswer.public_id,
              is_correct: existingAnswer.is_correct,
              score: existingAnswer.score,
              max_score: existingAnswer.max_score,
              standard_answer_rich_text: question.standardAnswerRichText,
              analysis_rich_text: question.analysisRichText,
              mistake_book_public_id: null,
              ai_explanation_status: "explained",
              ai_hint_status: null,
              ...createObjectiveAiExplanationFeedback(),
              answered_at: existingAnswer.answered_at,
            }),
          });
        }

        return createErrorResponse(
          409301,
          "Practice objective question has already been answered.",
        );
      }

      const subjectiveAnswerCount = isSubjectiveQuestion(question)
        ? (
            await repository.listAnswerRecordsByPractice({
              userPublicId: userContext.userPublicId,
              practicePublicId: publicId,
            })
          ).filter(
            (answerRecord) =>
              answerRecord.paper_question_public_id ===
              normalizedInput.paperQuestionPublicId,
          ).length
        : 0;

      if (isSubjectiveQuestion(question) && subjectiveAnswerCount >= 2) {
        return createErrorResponse(
          409302,
          "Practice subjective question retry limit reached.",
        );
      }

      const { isCorrect, score } = calculateObjectiveScore(
        question,
        normalizedInput,
      );
      const subjectiveFinalScore =
        isSubjectiveQuestion(question) &&
        (subjectiveAnswerCount >= 1 ||
          normalizedInput.aiScoringTrigger === "manual_request")
          ? calculateSubjectiveAiScore(question, normalizedInput)
          : null;
      const answerSnapshot = buildAnswerSnapshot(normalizedInput);
      const answerRecord = await repository.createPracticeAnswerRecord({
        publicId: publicIdFactory.createPublicId("answer_record"),
        userPublicId: userContext.userPublicId,
        practicePublicId: practice.public_id,
        paperQuestionPublicId: question.paperQuestionPublicId,
        questionPublicId: question.questionPublicId,
        questionSnapshot: question.snapshot,
        answerSnapshot,
        answerRecordStatus:
          isCorrect === null && subjectiveFinalScore === null
            ? "submitted"
            : "scored",
        isCorrect,
        score: subjectiveFinalScore ?? score,
        maxScore: question.score,
        answeredAt: now,
        submittedAt: now,
      });

      await repository.updatePracticeLastAnsweredAt({
        publicId: practice.public_id,
        lastAnsweredAt: now,
      });

      const mistakeBook =
        isCorrect === false
          ? await repository.upsertMistakeBookFromWrongAnswer({
              publicId: publicIdFactory.createPublicId("mistake_book"),
              userPublicId: userContext.userPublicId,
              questionPublicId: question.questionPublicId,
              paperQuestionPublicId: question.paperQuestionPublicId,
              profession: practice.profession,
              level: practice.level,
              subject: practice.subject,
              questionSnapshot: question.snapshot,
              latestAnswerSnapshot: answerSnapshot,
              latestWrongAt: now,
            })
          : null;
      const retryRemainingCount = isSubjectiveQuestion(question)
        ? subjectiveFinalScore === null
          ? Math.max(0, 1 - subjectiveAnswerCount)
          : 0
        : 0;
      const aiFeedback = isSubjectiveQuestion(question)
        ? subjectiveFinalScore === null
          ? createSubjectiveAiHintFeedback(retryRemainingCount)
          : createEmptyAiFeedback()
        : isObjectiveQuestion(question) && answerRecord.is_correct === false
          ? createObjectiveAiExplanationFeedback()
          : isObjectiveQuestion(question) && answerRecord.is_correct === true
            ? createObjectiveManualExplanationFeedback()
            : createEmptyAiFeedback();
      const aiExplanationStatus =
        isObjectiveQuestion(question) && answerRecord.is_correct === false
          ? "explained"
          : isObjectiveQuestion(question) && answerRecord.is_correct === true
            ? "available"
            : null;

      return createSuccessResponse({
        feedback: mapPracticeAnswerFeedbackToApi({
          answer_record_public_id: answerRecord.public_id,
          is_correct: answerRecord.is_correct,
          score: answerRecord.score,
          max_score: answerRecord.max_score,
          standard_answer_rich_text: question.standardAnswerRichText,
          analysis_rich_text: question.analysisRichText,
          mistake_book_public_id: mistakeBook?.public_id ?? null,
          ai_explanation_status: aiExplanationStatus,
          ai_hint_status:
            isSubjectiveQuestion(question) && subjectiveFinalScore === null
              ? "hinted"
              : null,
          ...aiFeedback,
          answered_at: answerRecord.answered_at,
        }),
      });
    },

    async favoritePracticeQuestion(userContext, publicId, input) {
      const normalizedInput = normalizePracticeQuestionFavoriteInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(
          422304,
          "Practice question cannot be added to mistake book.",
        );
      }

      const now = clock.now();
      const practice = await getReadablePractice(
        repository,
        userContext,
        publicId,
        now,
      );

      if (!isPracticeRow(practice)) {
        return practice;
      }

      const question = findPracticeQuestion(
        practice.paper_snapshot,
        normalizedInput.paperQuestionPublicId,
      );

      if (question === null || !isObjectiveQuestion(question)) {
        return createErrorResponse(
          422304,
          "Practice question cannot be added to mistake book.",
        );
      }

      const mistakeBook = await repository.upsertMistakeBookFromFavorite({
        publicId: publicIdFactory.createPublicId("mistake_book"),
        userPublicId: userContext.userPublicId,
        questionPublicId: question.questionPublicId,
        paperQuestionPublicId: question.paperQuestionPublicId,
        profession: practice.profession,
        level: practice.level,
        subject: practice.subject,
        questionSnapshot: question.snapshot,
        latestAnswerSnapshot: buildFavoriteAnswerSnapshot(normalizedInput),
        favoritedAt: now,
      });

      return createSuccessResponse({
        mistakeBookPublicId: mistakeBook.public_id,
      });
    },

    async restartPractice(userContext, publicId) {
      const now = clock.now();
      const practice = await getReadablePractice(
        repository,
        userContext,
        publicId,
        now,
      );

      if (!isPracticeRow(practice)) {
        return practice;
      }

      await repository.terminatePractice({
        publicId: practice.public_id,
        terminatedAt: now,
        terminationReason: "restart",
      });

      const freshPractice = await createFreshPractice(
        repository,
        publicIdFactory,
        userContext,
        {
          public_id: practice.paper_public_id,
          profession: practice.profession,
          level: practice.level,
          subject: practice.subject,
          paper_snapshot: practice.paper_snapshot,
        },
        now,
      );

      return createSuccessResponse({
        practice: mapPracticeToApi(freshPractice),
        answerRecords: [],
      });
    },

    async terminatePractice(userContext, publicId) {
      const now = clock.now();
      const practice = await getReadablePractice(
        repository,
        userContext,
        publicId,
        now,
      );

      if (!isPracticeRow(practice)) {
        return practice;
      }

      const terminatedPractice = await repository.terminatePractice({
        publicId: practice.public_id,
        terminatedAt: now,
        terminationReason: "student_request",
      });

      if (terminatedPractice === null) {
        return createPracticeNotFoundResponse();
      }

      return createSuccessResponse({
        ...(await createPracticeResult(
          repository,
          userContext,
          terminatedPractice,
        )),
      });
    },
  };
}

export function createUnavailablePracticeService(): PracticeService {
  return {
    async startPractice() {
      return createErrorResponse(503302, "Practice runtime is not configured.");
    },
    async getPractice() {
      return createErrorResponse(503302, "Practice runtime is not configured.");
    },
    async submitPracticeAnswer() {
      return createErrorResponse(503302, "Practice runtime is not configured.");
    },
    async favoritePracticeQuestion() {
      return createErrorResponse(503302, "Practice runtime is not configured.");
    },
    async restartPractice() {
      return createErrorResponse(503302, "Practice runtime is not configured.");
    },
    async terminatePractice() {
      return createErrorResponse(503302, "Practice runtime is not configured.");
    },
  };
}
