import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  MockExamAnswerRecordResultDto,
  MockExamAnswerSnapshotDto,
  MockExamRetryScoringResultDto,
  MockExamResultDto,
  MockExamSubmitResultDto,
} from "../contracts/mock-exam-contract";
import {
  mapMockExamAnswerRecordToApi,
  mapMockExamToApi,
} from "../mappers/mock-exam-mapper";
import type { AnswerRecordStatus } from "../models/student-experience";
import type {
  MockExamAnswerRecordRow,
  MockExamAuthorizationScopeRow,
  MockExamPaperRow,
  MockExamRepository,
  MockExamRow,
} from "../repositories/mock-exam-repository";
import {
  normalizeMockExamAnswerInput,
  normalizeStartMockExamInput,
  normalizeSubmitMockExamInput,
  type NormalizedMockExamAnswerInput,
} from "../validators/mock-exam";

export type MockExamUserContext = {
  userPublicId: string;
};

export type MockExamClock = {
  now(): Date;
};

export type MockExamPublicIdFactory = {
  createPublicId(prefix: "mock_exam" | "answer_record"): string;
};

export type MockExamService = {
  startMockExam(
    userContext: MockExamUserContext,
    input: unknown,
  ): Promise<ApiResponse<MockExamResultDto | null>>;
  getMockExam(
    userContext: MockExamUserContext,
    publicId: string,
  ): Promise<ApiResponse<MockExamResultDto | null>>;
  saveMockExamAnswer(
    userContext: MockExamUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<MockExamAnswerRecordResultDto | null>>;
  submitMockExam(
    userContext: MockExamUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<MockExamSubmitResultDto | null>>;
  retryMockExamScoring(
    userContext: MockExamUserContext,
    publicId: string,
  ): Promise<ApiResponse<MockExamRetryScoringResultDto | null>>;
  terminateMockExam(
    userContext: MockExamUserContext,
    publicId: string,
  ): Promise<ApiResponse<MockExamResultDto | null>>;
};

export type MockExamAiScoringStatus =
  | "scored"
  | "scoring_failed"
  | "retry_limit_reached";

export type MockExamAiScoringRuntimeContext = {
  userPublicId: string;
  mockExamPublicId: string;
  answerRecordPublicId: string;
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  answerSnapshot: MockExamAnswerSnapshotDto;
  questionText: string;
  standardAnswer: string;
  studentAnswer: string;
  maxScore: string;
  scoringPoints: {
    scoringPointPublicId: string;
    label: string;
    maxScore: number;
  }[];
};

export type MockExamAiScoringRuntimeResult = {
  answerRecordPublicId: string;
  scoringStatus: MockExamAiScoringStatus;
  score: string | null;
  maxScore: string;
  scoringSnapshot: Record<string, unknown> | null;
  failureReason: string | null;
};

export type MockExamAiScoringRuntime = {
  scoreSubjectiveAnswer(
    context: MockExamAiScoringRuntimeContext,
  ): Promise<MockExamAiScoringRuntimeResult>;
};

export type MockExamServiceOptions = {
  aiScoringRuntime?: MockExamAiScoringRuntime;
};

type MockExamQuestionSnapshot = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  standardAnswerLabels: string[];
  score: string;
  snapshot: Record<string, unknown>;
};

type MockExamSubjectiveScoringResult = {
  paperQuestionPublicId: string;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: null;
  score: string | null;
  submittedAt: Date;
  aiScoringSnapshot: Record<string, unknown> | null;
};

const mockExamContractTerm = "mock_exam";
const serverContractTerm = "server";
const terminatedContractTerm = "terminated";

void [mockExamContractTerm, serverContractTerm, terminatedContractTerm];

const systemClock: MockExamClock = {
  now() {
    return new Date();
  },
};

const systemPublicIdFactory: MockExamPublicIdFactory = {
  createPublicId(prefix) {
    return `${prefix}_${crypto.randomUUID()}`;
  },
};

function isSameScope(
  scope: MockExamAuthorizationScopeRow,
  profession: MockExamPaperRow["profession"],
  level: number,
): boolean {
  return scope.profession === profession && scope.level === level;
}

function hasEffectiveAuthorization(
  scopes: MockExamAuthorizationScopeRow[],
  profession: MockExamPaperRow["profession"],
  level: number,
  now: Date,
): boolean {
  return scopes.some(
    (scope) => isSameScope(scope, profession, level) && scope.expires_at > now,
  );
}

function addDurationMinute(
  startedAt: Date,
  durationMinute: number | null,
): Date | null {
  if (durationMinute === null) {
    return null;
  }

  return new Date(startedAt.getTime() + durationMinute * 60 * 1000);
}

function isDeadlineReached(mockExam: MockExamRow, now: Date): boolean {
  return (
    mockExam.exam_status === "in_progress" &&
    mockExam.server_deadline_at !== null &&
    mockExam.server_deadline_at <= now
  );
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

  if (!Array.isArray(standardAnswerLabels)) {
    return [];
  }

  return standardAnswerLabels.filter(
    (label): label is string => typeof label === "string" && label.length > 0,
  );
}

function findMockExamQuestion(
  paperSnapshot: Record<string, unknown>,
  paperQuestionPublicId: string,
): MockExamQuestionSnapshot | null {
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
        standardAnswerLabels: getStandardAnswerLabels(paperQuestion),
        score: getScore(paperQuestion),
        snapshot: paperQuestion,
      };
    }
  }

  return null;
}

function listMockExamQuestions(
  paperSnapshot: Record<string, unknown>,
): MockExamQuestionSnapshot[] {
  const paperSections = Array.isArray(paperSnapshot.paperSections)
    ? paperSnapshot.paperSections
    : [];

  return paperSections.flatMap((paperSection) => {
    if (
      !isRecord(paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      return [];
    }

    return paperSection.paperQuestions.flatMap((paperQuestion) => {
      if (!isRecord(paperQuestion)) {
        return [];
      }

      const paperQuestionPublicId = getStringField(
        paperQuestion,
        "paperQuestionPublicId",
      );
      const questionPublicId = getStringField(
        paperQuestion,
        "questionPublicId",
      );

      if (paperQuestionPublicId === null || questionPublicId === null) {
        return [];
      }

      return [
        {
          paperQuestionPublicId,
          questionPublicId,
          standardAnswerLabels: getStandardAnswerLabels(paperQuestion),
          score: getScore(paperQuestion),
          snapshot: paperQuestion,
        },
      ];
    });
  });
}

function shouldReplaceMockExamSnapshot(
  activeMockExam: MockExamRow,
  paper: MockExamPaperRow,
): boolean {
  return (
    listMockExamQuestions(activeMockExam.paper_snapshot).length === 0 &&
    listMockExamQuestions(paper.paper_snapshot).length > 0
  );
}

function normalizeLabels(labels: string[]): string[] {
  return [...labels].sort((left, right) => left.localeCompare(right));
}

function isObjectiveQuestion(question: MockExamQuestionSnapshot): boolean {
  return question.standardAnswerLabels.length > 0;
}

function isAiScoringQuestion(question: MockExamQuestionSnapshot): boolean {
  return getStringField(question.snapshot, "scoringMethod") === "ai_scoring";
}

function isCorrectObjectiveAnswer(
  question: MockExamQuestionSnapshot,
  answerRecord: MockExamAnswerRecordRow,
): boolean {
  return (
    normalizeLabels(question.standardAnswerLabels).join("|") ===
    normalizeLabels(answerRecord.answer_snapshot.selectedLabels).join("|")
  );
}

function addScore(left: number, right: string): number {
  return left + Number.parseFloat(right);
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function parseScore(score: string | null): number {
  return score === null ? 0 : Number.parseFloat(score);
}

function getRichTextField(value: Record<string, unknown>, key: string): string {
  return getStringField(value, key) ?? "";
}

function getStudentAnswer(answerSnapshot: MockExamAnswerSnapshotDto): string {
  const textAnswer = answerSnapshot.textAnswer?.trim();

  if (textAnswer !== undefined && textAnswer.length > 0) {
    return textAnswer;
  }

  return answerSnapshot.selectedLabels.join(",");
}

function listScoringPointInputs(question: MockExamQuestionSnapshot) {
  const scoringPoints = Array.isArray(question.snapshot.scoringPoints)
    ? question.snapshot.scoringPoints
    : [];
  const normalizedScoringPoints = scoringPoints.flatMap(
    (scoringPoint, index) => {
      if (!isRecord(scoringPoint)) {
        return [];
      }

      const scoringPointPublicId =
        getStringField(scoringPoint, "scoringPointPublicId") ??
        `${question.paperQuestionPublicId}_scoring_point_${index + 1}`;
      const label =
        getStringField(scoringPoint, "label") ??
        getStringField(scoringPoint, "description") ??
        `scoring_point_${index + 1}`;
      const maxScoreValue = scoringPoint.score;
      const maxScore =
        typeof maxScoreValue === "number"
          ? maxScoreValue
          : typeof maxScoreValue === "string"
            ? Number.parseFloat(maxScoreValue)
            : 0;

      return [
        {
          scoringPointPublicId,
          label,
          maxScore: Number.isFinite(maxScore) ? maxScore : 0,
        },
      ];
    },
  );

  return normalizedScoringPoints.length > 0
    ? normalizedScoringPoints
    : [
        {
          scoringPointPublicId: `${question.paperQuestionPublicId}_scoring_point_1`,
          label: "overall",
          maxScore: parseScore(question.score),
        },
      ];
}

function buildAnswerSnapshot(
  input: NormalizedMockExamAnswerInput,
): MockExamAnswerSnapshotDto {
  return {
    selectedLabels: input.selectedLabels,
    textAnswer: input.textAnswer,
    savedFromClientAt: input.savedFromClientAt,
  };
}

function buildSubmittedAnswerRecordResult(
  question: MockExamQuestionSnapshot,
  answerRecord: MockExamAnswerRecordRow,
  submittedAt: Date,
): {
  paperQuestionPublicId: string;
  answerRecordStatus: AnswerRecordStatus;
  isCorrect: boolean | null;
  score: string | null;
  submittedAt: Date;
} {
  if (!isObjectiveQuestion(question)) {
    return {
      paperQuestionPublicId: question.paperQuestionPublicId,
      answerRecordStatus: "submitted",
      isCorrect: null,
      score: null,
      submittedAt,
    };
  }

  const isCorrect = isCorrectObjectiveAnswer(question, answerRecord);

  return {
    paperQuestionPublicId: question.paperQuestionPublicId,
    answerRecordStatus: "scored",
    isCorrect,
    score: isCorrect ? question.score : "0.0",
    submittedAt,
  };
}

function buildAiScoringRuntimeContext(input: {
  userContext: MockExamUserContext;
  mockExam: MockExamRow;
  question: MockExamQuestionSnapshot;
  answerRecord: MockExamAnswerRecordRow;
}): MockExamAiScoringRuntimeContext {
  const questionSnapshot =
    input.answerRecord.question_snapshot ?? input.question.snapshot;

  return {
    userPublicId: input.userContext.userPublicId,
    mockExamPublicId: input.mockExam.public_id,
    answerRecordPublicId: input.answerRecord.public_id,
    paperQuestionPublicId: input.question.paperQuestionPublicId,
    questionPublicId: input.question.questionPublicId,
    questionSnapshot,
    answerSnapshot: input.answerRecord.answer_snapshot,
    questionText: getRichTextField(questionSnapshot, "stemRichText"),
    standardAnswer: getRichTextField(
      questionSnapshot,
      "standardAnswerRichText",
    ),
    studentAnswer: getStudentAnswer(input.answerRecord.answer_snapshot),
    maxScore: input.question.score,
    scoringPoints: listScoringPointInputs(input.question),
  };
}

function createSuccessfulSubjectiveResult(input: {
  question: MockExamQuestionSnapshot;
  answerRecord: MockExamAnswerRecordRow;
  scoringResult: MockExamAiScoringRuntimeResult;
  submittedAt: Date;
}): MockExamSubjectiveScoringResult {
  return {
    paperQuestionPublicId: input.question.paperQuestionPublicId,
    answerRecordStatus:
      input.scoringResult.scoringStatus === "scored"
        ? "scored"
        : "scoring_failed",
    isCorrect: null,
    score:
      input.scoringResult.scoringStatus === "scored"
        ? input.scoringResult.score
        : null,
    submittedAt: input.submittedAt,
    aiScoringSnapshot:
      input.scoringResult.scoringStatus === "scored"
        ? input.scoringResult.scoringSnapshot
        : {
            scoringStatus: input.scoringResult.scoringStatus,
            failureReason: input.scoringResult.failureReason,
          },
  };
}

function createUnansweredSubjectiveResult(
  question: MockExamQuestionSnapshot,
  submittedAt: Date,
): MockExamSubjectiveScoringResult {
  return {
    paperQuestionPublicId: question.paperQuestionPublicId,
    answerRecordStatus: "scored",
    isCorrect: null,
    score: "0.0",
    submittedAt,
    aiScoringSnapshot: {
      scoringStatus: "scored",
      reason: "unanswered",
    },
  };
}

async function scoreSubjectiveQuestions(input: {
  aiScoringRuntime: MockExamAiScoringRuntime;
  userContext: MockExamUserContext;
  mockExam: MockExamRow;
  answerByPaperQuestion: Map<string, MockExamAnswerRecordRow>;
  questions: MockExamQuestionSnapshot[];
  submittedAt: Date;
  onlyFailedRecords: boolean;
}): Promise<MockExamSubjectiveScoringResult[]> {
  const results: MockExamSubjectiveScoringResult[] = [];

  for (const question of input.questions.filter(isAiScoringQuestion)) {
    const answerRecord = input.answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );

    if (answerRecord === undefined) {
      if (!input.onlyFailedRecords) {
        results.push(
          createUnansweredSubjectiveResult(question, input.submittedAt),
        );
      }

      continue;
    }

    if (
      input.onlyFailedRecords &&
      answerRecord.answer_record_status !== "scoring_failed"
    ) {
      continue;
    }

    const studentAnswer = getStudentAnswer(answerRecord.answer_snapshot);

    if (studentAnswer.trim().length === 0) {
      if (!input.onlyFailedRecords) {
        results.push(
          createUnansweredSubjectiveResult(question, input.submittedAt),
        );
      }

      continue;
    }

    const scoringResult = await input.aiScoringRuntime.scoreSubjectiveAnswer(
      buildAiScoringRuntimeContext({
        userContext: input.userContext,
        mockExam: input.mockExam,
        question,
        answerRecord,
      }),
    );

    results.push(
      createSuccessfulSubjectiveResult({
        question,
        answerRecord,
        scoringResult,
        submittedAt: input.submittedAt,
      }),
    );
  }

  return results;
}

function calculateSubjectiveScore(
  subjectiveResults: MockExamSubjectiveScoringResult[],
): string | null {
  return subjectiveResults.some(
    (result) => result.answerRecordStatus === "scoring_failed",
  )
    ? null
    : formatScore(
        subjectiveResults.reduce(
          (scoreTotal, result) => scoreTotal + parseScore(result.score),
          0,
        ),
      );
}

function calculateExamStatus(
  subjectiveResults: MockExamSubjectiveScoringResult[],
): Extract<MockExamRow["exam_status"], "completed" | "scoring_partial_failed"> {
  return subjectiveResults.some(
    (result) => result.answerRecordStatus === "scoring_failed",
  )
    ? "scoring_partial_failed"
    : "completed";
}

function createMockExamNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404312, "Mock exam does not exist.");
}

function createMockExamAuthorizationTerminatedResponse(): ApiResponse<null> {
  return createErrorResponse(
    403313,
    "Mock exam authorization is invalid; session terminated.",
  );
}

async function terminateMockExamForInvalidAuthorization(
  repository: MockExamRepository,
  mockExam: MockExamRow,
  terminatedAt: Date,
): Promise<void> {
  await repository.terminateMockExam({
    publicId: mockExam.public_id,
    terminatedAt,
    terminationReason: "authorization_invalid",
  });
}

function isMockExamRow(
  value: MockExamRow | ApiResponse<null>,
): value is MockExamRow {
  return "public_id" in value;
}

async function submitReadableMockExam(
  repository: MockExamRepository,
  userContext: MockExamUserContext,
  mockExam: MockExamRow,
  submittedAt: Date,
  options: MockExamServiceOptions,
): Promise<
  { mockExam: MockExamRow; unansweredCount: number } | ApiResponse<null>
> {
  const answerRecords = await repository.listMockExamAnswerRecords({
    userPublicId: userContext.userPublicId,
    mockExamPublicId: mockExam.public_id,
  });
  const questions = listMockExamQuestions(mockExam.paper_snapshot);
  const answerByPaperQuestion = new Map(
    answerRecords.map((answerRecord) => [
      answerRecord.paper_question_public_id,
      answerRecord,
    ]),
  );
  const objectiveScore = questions
    .filter(isObjectiveQuestion)
    .reduce((scoreTotal, question) => {
      const answerRecord = answerByPaperQuestion.get(
        question.paperQuestionPublicId,
      );

      if (
        answerRecord === undefined ||
        !isCorrectObjectiveAnswer(question, answerRecord)
      ) {
        return scoreTotal;
      }

      return addScore(scoreTotal, question.score);
    }, 0);
  const unansweredCount = questions.filter(
    (question) => !answerByPaperQuestion.has(question.paperQuestionPublicId),
  ).length;
  const subjectiveResults =
    options.aiScoringRuntime === undefined
      ? []
      : await scoreSubjectiveQuestions({
          aiScoringRuntime: options.aiScoringRuntime,
          userContext,
          mockExam,
          answerByPaperQuestion,
          questions,
          submittedAt,
          onlyFailedRecords: false,
        });
  const subjectiveScore =
    options.aiScoringRuntime === undefined
      ? null
      : calculateSubjectiveScore(subjectiveResults);
  const examStatus =
    options.aiScoringRuntime === undefined
      ? "completed"
      : calculateExamStatus(subjectiveResults);
  const totalScore = formatScore(
    objectiveScore +
      (subjectiveScore === null ? 0 : parseScore(subjectiveScore)),
  );
  const submittedMockExam = await repository.submitMockExam({
    publicId: mockExam.public_id,
    examStatus,
    submittedAt,
    objectiveScore: formatScore(objectiveScore),
    subjectiveScore,
    totalScore,
    unansweredCount,
    answerRecordResults: [
      ...questions.flatMap((question) => {
        const answerRecord = answerByPaperQuestion.get(
          question.paperQuestionPublicId,
        );

        if (
          answerRecord === undefined ||
          (options.aiScoringRuntime !== undefined &&
            isAiScoringQuestion(question))
        ) {
          return [];
        }

        return [
          buildSubmittedAnswerRecordResult(question, answerRecord, submittedAt),
        ];
      }),
      ...subjectiveResults,
    ],
  });

  if (submittedMockExam === null) {
    return createMockExamNotFoundResponse();
  }

  return {
    mockExam: submittedMockExam,
    unansweredCount,
  };
}

async function getOwnedMockExam(
  repository: MockExamRepository,
  userContext: MockExamUserContext,
  publicId: string,
  now: Date,
): Promise<MockExamRow | ApiResponse<null>> {
  const mockExam = await repository.findMockExamByPublicId({
    userPublicId: userContext.userPublicId,
    publicId,
  });

  if (mockExam === null) {
    return createMockExamNotFoundResponse();
  }

  const scopes = await repository.listEffectiveAuthorizationScopes({
    userPublicId: userContext.userPublicId,
  });

  if (
    !hasEffectiveAuthorization(scopes, mockExam.profession, mockExam.level, now)
  ) {
    if (mockExam.exam_status === "in_progress") {
      await terminateMockExamForInvalidAuthorization(repository, mockExam, now);

      return createMockExamAuthorizationTerminatedResponse();
    }

    return createMockExamNotFoundResponse();
  }

  return mockExam;
}

async function getReadableMockExam(
  repository: MockExamRepository,
  userContext: MockExamUserContext,
  publicId: string,
  now: Date,
  options: MockExamServiceOptions,
): Promise<MockExamRow | ApiResponse<null>> {
  const mockExam = await getOwnedMockExam(
    repository,
    userContext,
    publicId,
    now,
  );

  if (!isMockExamRow(mockExam)) {
    return mockExam;
  }

  if (isDeadlineReached(mockExam, now)) {
    const submittedResult = await submitReadableMockExam(
      repository,
      userContext,
      mockExam,
      now,
      options,
    );

    if ("code" in submittedResult) {
      return submittedResult;
    }

    return submittedResult.mockExam;
  }

  return mockExam;
}

async function getWritableMockExam(
  repository: MockExamRepository,
  userContext: MockExamUserContext,
  publicId: string,
  now: Date,
  options: MockExamServiceOptions,
): Promise<MockExamRow | ApiResponse<null>> {
  const mockExam = await getReadableMockExam(
    repository,
    userContext,
    publicId,
    now,
    options,
  );

  if (!isMockExamRow(mockExam)) {
    return mockExam;
  }

  if (mockExam.exam_status !== "in_progress") {
    return createErrorResponse(409311, "Mock exam is not in progress.");
  }

  return mockExam;
}

async function createFreshMockExam(
  repository: MockExamRepository,
  publicIdFactory: MockExamPublicIdFactory,
  userContext: MockExamUserContext,
  paper: MockExamPaperRow,
  startedAt: Date,
): Promise<MockExamRow> {
  return repository.createMockExam({
    publicId: publicIdFactory.createPublicId("mock_exam"),
    userPublicId: userContext.userPublicId,
    paperPublicId: paper.public_id,
    paperSnapshot: paper.paper_snapshot,
    profession: paper.profession,
    level: paper.level,
    subject: paper.subject,
    startedAt,
    serverDeadlineAt: addDurationMinute(startedAt, paper.duration_minute),
    durationMinute: paper.duration_minute,
  });
}

export function createMockExamService(
  repository: MockExamRepository,
  clock: MockExamClock = systemClock,
  publicIdFactory: MockExamPublicIdFactory = systemPublicIdFactory,
  options: MockExamServiceOptions = {},
): MockExamService {
  return {
    async startMockExam(userContext, input) {
      const normalizedInput = normalizeStartMockExamInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(422311, "Mock exam input is invalid.");
      }

      const paper = await repository.findPublishedPaperByPublicId({
        userPublicId: userContext.userPublicId,
        paperPublicId: normalizedInput.paperPublicId,
      });

      if (paper === null) {
        return createErrorResponse(404311, "Mock exam paper does not exist.");
      }

      const now = clock.now();
      const scopes = await repository.listEffectiveAuthorizationScopes({
        userPublicId: userContext.userPublicId,
      });

      if (
        !hasEffectiveAuthorization(scopes, paper.profession, paper.level, now)
      ) {
        const activeMockExam = await repository.findActiveMockExamByPaper({
          userPublicId: userContext.userPublicId,
          paperPublicId: normalizedInput.paperPublicId,
        });

        if (activeMockExam !== null) {
          await terminateMockExamForInvalidAuthorization(
            repository,
            activeMockExam,
            now,
          );
        }

        return createErrorResponse(
          403311,
          "Student authorization is not valid for this mock exam.",
        );
      }

      const activeMockExam = await repository.findActiveMockExamByPaper({
        userPublicId: userContext.userPublicId,
        paperPublicId: normalizedInput.paperPublicId,
      });

      if (activeMockExam !== null) {
        if (shouldReplaceMockExamSnapshot(activeMockExam, paper)) {
          await repository.terminateMockExam({
            publicId: activeMockExam.public_id,
            terminatedAt: now,
            terminationReason: "stale_empty_snapshot",
          });

          const mockExam = await createFreshMockExam(
            repository,
            publicIdFactory,
            userContext,
            paper,
            now,
          );

          return createSuccessResponse({
            mockExam: mapMockExamToApi(mockExam, now),
          });
        }

        if (isDeadlineReached(activeMockExam, now)) {
          const submittedResult = await submitReadableMockExam(
            repository,
            userContext,
            activeMockExam,
            now,
            options,
          );

          if ("code" in submittedResult) {
            return submittedResult;
          }

          return createSuccessResponse({
            mockExam: mapMockExamToApi(submittedResult.mockExam, now),
          });
        }

        return createSuccessResponse({
          mockExam: mapMockExamToApi(activeMockExam, now),
        });
      }

      const mockExam = await createFreshMockExam(
        repository,
        publicIdFactory,
        userContext,
        paper,
        now,
      );

      return createSuccessResponse({
        mockExam: mapMockExamToApi(mockExam, now),
      });
    },

    async getMockExam(userContext, publicId) {
      const now = clock.now();
      const mockExam = await getReadableMockExam(
        repository,
        userContext,
        publicId,
        now,
        options,
      );

      if (!isMockExamRow(mockExam)) {
        return mockExam;
      }

      return createSuccessResponse({
        mockExam: mapMockExamToApi(mockExam, now),
      });
    },

    async saveMockExamAnswer(userContext, publicId, input) {
      const normalizedInput = normalizeMockExamAnswerInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(
          422312,
          "Mock exam answer input is invalid.",
        );
      }

      const now = clock.now();
      const mockExam = await getWritableMockExam(
        repository,
        userContext,
        publicId,
        now,
        options,
      );

      if (!isMockExamRow(mockExam)) {
        return mockExam;
      }

      const question = findMockExamQuestion(
        mockExam.paper_snapshot,
        normalizedInput.paperQuestionPublicId,
      );

      if (question === null) {
        return createErrorResponse(422313, "Mock exam question is invalid.");
      }

      const answerRecord = await repository.saveMockExamAnswerRecord({
        publicId: publicIdFactory.createPublicId("answer_record"),
        userPublicId: userContext.userPublicId,
        mockExamPublicId: mockExam.public_id,
        paperQuestionPublicId: question.paperQuestionPublicId,
        questionPublicId: question.questionPublicId,
        questionSnapshot: question.snapshot,
        answerSnapshot: buildAnswerSnapshot(normalizedInput),
        answerRecordStatus: "saved",
        isCorrect: null,
        score: null,
        maxScore: question.score,
        answeredAt: now,
      });

      return createSuccessResponse({
        answerRecord: mapMockExamAnswerRecordToApi(answerRecord),
      });
    },

    async submitMockExam(userContext, publicId, input) {
      const normalizedInput = normalizeSubmitMockExamInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(
          422314,
          "Mock exam submit input is invalid.",
        );
      }

      void normalizedInput;

      const now = clock.now();
      const mockExam = await getWritableMockExam(
        repository,
        userContext,
        publicId,
        now,
        options,
      );

      if (!isMockExamRow(mockExam)) {
        return mockExam;
      }

      const submittedResult = await submitReadableMockExam(
        repository,
        userContext,
        mockExam,
        now,
        options,
      );

      if ("code" in submittedResult) {
        return submittedResult;
      }

      return createSuccessResponse({
        mockExam: mapMockExamToApi(submittedResult.mockExam, now),
        unansweredCount: submittedResult.unansweredCount,
      });
    },

    async retryMockExamScoring(userContext, publicId) {
      if (options.aiScoringRuntime === undefined) {
        return createErrorResponse(
          422315,
          "AI scoring retry is not configured.",
        );
      }

      const now = clock.now();
      const mockExam = await getOwnedMockExam(
        repository,
        userContext,
        publicId,
        now,
      );

      if (!isMockExamRow(mockExam)) {
        return mockExam;
      }

      if (mockExam.exam_status !== "scoring_partial_failed") {
        return createErrorResponse(
          409312,
          "Mock exam has no failed subjective scoring records.",
        );
      }

      const answerRecords = await repository.listMockExamAnswerRecords({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: mockExam.public_id,
      });
      const questions = listMockExamQuestions(mockExam.paper_snapshot);
      const answerByPaperQuestion = new Map(
        answerRecords.map((answerRecord) => [
          answerRecord.paper_question_public_id,
          answerRecord,
        ]),
      );
      const subjectiveResults = await scoreSubjectiveQuestions({
        aiScoringRuntime: options.aiScoringRuntime,
        userContext,
        mockExam,
        answerByPaperQuestion,
        questions,
        submittedAt: now,
        onlyFailedRecords: true,
      });
      const existingSubjectiveScore = answerRecords
        .filter(
          (answerRecord) =>
            answerRecord.answer_record_status === "scored" &&
            answerRecord.is_correct === null,
        )
        .reduce(
          (scoreTotal, answerRecord) =>
            scoreTotal + parseScore(answerRecord.score),
          0,
        );
      const retriedSubjectiveScore = subjectiveResults.reduce(
        (scoreTotal, result) => scoreTotal + parseScore(result.score),
        0,
      );
      const failedCount = subjectiveResults.filter(
        (result) => result.answerRecordStatus === "scoring_failed",
      ).length;
      const examStatus =
        failedCount === 0 ? "completed" : "scoring_partial_failed";
      const objectiveScore = mockExam.objective_score ?? "0.0";
      const subjectiveScore =
        failedCount === 0
          ? formatScore(existingSubjectiveScore + retriedSubjectiveScore)
          : null;
      const totalScore = formatScore(
        parseScore(objectiveScore) +
          (subjectiveScore === null ? 0 : parseScore(subjectiveScore)),
      );
      const updatedMockExam = await repository.applyMockExamScoringResults({
        publicId: mockExam.public_id,
        examStatus,
        scoredAt: now,
        objectiveScore,
        subjectiveScore,
        totalScore,
        answerRecordResults: subjectiveResults,
      });

      if (updatedMockExam === null) {
        return createMockExamNotFoundResponse();
      }

      return createSuccessResponse({
        mockExam: mapMockExamToApi(updatedMockExam, now),
        retriedCount: subjectiveResults.length,
        failedCount,
      });
    },

    async terminateMockExam(userContext, publicId) {
      const now = clock.now();
      const mockExam = await getWritableMockExam(
        repository,
        userContext,
        publicId,
        now,
        options,
      );

      if (!isMockExamRow(mockExam)) {
        return mockExam;
      }

      const terminatedMockExam = await repository.terminateMockExam({
        publicId: mockExam.public_id,
        terminatedAt: now,
        terminationReason: "student_request",
      });

      if (terminatedMockExam === null) {
        return createMockExamNotFoundResponse();
      }

      return createSuccessResponse({
        mockExam: mapMockExamToApi(terminatedMockExam, now),
      });
    },
  };
}

export function createUnavailableMockExamService(): MockExamService {
  return {
    async startMockExam() {
      return createErrorResponse(
        503312,
        "Mock exam runtime is not configured.",
      );
    },
    async getMockExam() {
      return createErrorResponse(
        503312,
        "Mock exam runtime is not configured.",
      );
    },
    async saveMockExamAnswer() {
      return createErrorResponse(
        503312,
        "Mock exam runtime is not configured.",
      );
    },
    async submitMockExam() {
      return createErrorResponse(
        503312,
        "Mock exam runtime is not configured.",
      );
    },
    async retryMockExamScoring() {
      return createErrorResponse(
        503312,
        "Mock exam runtime is not configured.",
      );
    },
    async terminateMockExam() {
      return createErrorResponse(
        503312,
        "Mock exam runtime is not configured.",
      );
    },
  };
}
