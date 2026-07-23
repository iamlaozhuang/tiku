import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type {
  ExamReportSnapshotDto,
  LearningSuggestionSnapshotDto,
} from "../contracts/exam-report-contract";
import type { SortOrder } from "../contracts/api-response";
import type { Profession, Subject } from "../models/paper";
import type {
  AnswerRecordStatus,
  ExamStatus,
} from "../models/student-experience";
import { sql, type SQL } from "drizzle-orm";
import { listPublishedPaperSnapshotQuestionEntries } from "../../lib/published-paper-snapshot";

const EXAM_REPORT_SCORING_FINALIZATION_LOCK_NAMESPACE = 200167;

type ExamReportScoringFinalizationExecutor = {
  execute(query: SQL): Promise<unknown>;
};

export async function lockExamReportScoringFinalization(
  database: unknown,
  mockExamPublicId: string,
): Promise<void> {
  await (database as ExamReportScoringFinalizationExecutor).execute(
    sql`select pg_advisory_xact_lock(${EXAM_REPORT_SCORING_FINALIZATION_LOCK_NAMESPACE}, hashtext(${mockExamPublicId}))`,
  );
}

type ReportPaperQuestionSnapshot = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionSnapshot: Record<string, unknown>;
  maxScore: string;
  isObjective: boolean;
  questionType: string | null;
  paperSectionTitle: string | null;
  questionGroupPublicId: string | null;
  questionGroupTitle: string | null;
  knowledgeNodePublicIds: string[];
  knowledgeNodeSnapshotState: "current" | "legacy";
  knowledgeNodeBindings: KnowledgeNodeBindingSnapshot[];
};

type KnowledgeNodeBindingSnapshot = {
  knowledgeNodePublicId: string;
  name: string;
  pathName: string;
  confirmationStatus: "confirmed";
  bindingSource: "formal_question_binding";
};

type ReportFillBlankAnswer = {
  blankKey: string;
  standardAnswers: string[];
  score: string;
  sortOrder: number;
};

type KnowledgeNodeAnalysisAccumulator = {
  knowledgeNodePublicId: string;
  name: string;
  pathName: string;
  confirmationStatus: "confirmed";
  bindingSource: "formal_question_binding";
  questionPublicIds: string[];
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  score: number;
  maxScore: number;
};

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

function parseScore(score: string | null): number {
  if (score === null) {
    return 0;
  }

  const parsedScore = Number.parseFloat(score);

  return Number.isFinite(parsedScore) ? parsedScore : 0;
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function formatRate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export class ExamReportKnowledgeSnapshotIntegrityError extends Error {
  constructor() {
    super("Paper question knowledge snapshot is invalid.");
    this.name = "ExamReportKnowledgeSnapshotIntegrityError";
  }
}

function compareOrdinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort(compareOrdinal);
  const sortedExpectedKeys = [...expectedKeys].sort(compareOrdinal);
  return (
    actualKeys.length === sortedExpectedKeys.length &&
    actualKeys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

function isCanonicalSnapshotText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    value === value.normalize("NFC") &&
    !/[\u0000-\u001f\u007f-\u009f]/u.test(value)
  );
}

function parseKnowledgeNodeSnapshot(paperQuestion: Record<string, unknown>): {
  state: "current" | "legacy";
  publicIds: string[];
  bindings: KnowledgeNodeBindingSnapshot[];
} {
  if (!Object.hasOwn(paperQuestion, "knowledgeNodeSnapshot")) {
    return {
      state: "legacy",
      publicIds: getStringArrayField(paperQuestion, "knowledgeNodePublicIds"),
      bindings: [],
    };
  }

  const snapshot = paperQuestion.knowledgeNodeSnapshot;
  const publicIds = paperQuestion.knowledgeNodePublicIds;
  if (
    !isRecord(snapshot) ||
    !hasExactKeys(snapshot, ["schemaVersion", "bindings"]) ||
    snapshot.schemaVersion !== 1 ||
    !Array.isArray(snapshot.bindings) ||
    !Array.isArray(publicIds) ||
    !publicIds.every(isCanonicalSnapshotText)
  ) {
    throw new ExamReportKnowledgeSnapshotIntegrityError();
  }

  const bindings: KnowledgeNodeBindingSnapshot[] = snapshot.bindings.map(
    (value): KnowledgeNodeBindingSnapshot => {
      if (
        !isRecord(value) ||
        !hasExactKeys(value, [
          "knowledgeNodePublicId",
          "name",
          "pathName",
          "confirmationStatus",
          "bindingSource",
        ]) ||
        !isCanonicalSnapshotText(value.knowledgeNodePublicId) ||
        !isCanonicalSnapshotText(value.name) ||
        !isCanonicalSnapshotText(value.pathName) ||
        value.confirmationStatus !== "confirmed" ||
        value.bindingSource !== "formal_question_binding" ||
        value.pathName.split("/").some((part) => part.length === 0) ||
        value.pathName.split("/").at(-1) !== value.name
      ) {
        throw new ExamReportKnowledgeSnapshotIntegrityError();
      }

      return {
        knowledgeNodePublicId: value.knowledgeNodePublicId,
        name: value.name,
        pathName: value.pathName,
        confirmationStatus: value.confirmationStatus,
        bindingSource: value.bindingSource,
      };
    },
  );
  const foldedPublicIds = new Set<string>();
  for (let index = 0; index < bindings.length; index += 1) {
    const binding = bindings[index];
    const foldedPublicId = binding.knowledgeNodePublicId.toLowerCase();
    if (
      foldedPublicIds.has(foldedPublicId) ||
      binding.knowledgeNodePublicId !== publicIds[index] ||
      (index > 0 &&
        compareOrdinal(
          bindings[index - 1].knowledgeNodePublicId,
          binding.knowledgeNodePublicId,
        ) >= 0)
    ) {
      throw new ExamReportKnowledgeSnapshotIntegrityError();
    }
    foldedPublicIds.add(foldedPublicId);
  }

  if (bindings.length !== publicIds.length) {
    throw new ExamReportKnowledgeSnapshotIntegrityError();
  }

  return { state: "current", publicIds: [...publicIds], bindings };
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

function getStringArrayField(
  value: Record<string, unknown>,
  key: string,
): string[] {
  const fieldValue = value[key];

  if (!Array.isArray(fieldValue)) {
    return [];
  }

  return fieldValue.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

function getFillBlankAnswers(
  value: Record<string, unknown>,
): ReportFillBlankAnswer[] {
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
        ? fillBlankAnswer.standardAnswers.filter(
            (standardAnswer): standardAnswer is string =>
              typeof standardAnswer === "string" && standardAnswer.length > 0,
          )
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

function formatFillBlankStandardAnswer(
  fillBlankAnswers: ReportFillBlankAnswer[],
): string | null {
  if (fillBlankAnswers.length === 0) {
    return null;
  }

  return fillBlankAnswers
    .map(
      (fillBlankAnswer) =>
        `${fillBlankAnswer.blankKey}: ${fillBlankAnswer.standardAnswers.join("/")}`,
    )
    .join("; ");
}

export function getPaperName(paperSnapshot: Record<string, unknown>): string {
  return getStringField(paperSnapshot, "name") ?? "Untitled paper";
}

export function calculateDurationSecond(
  mockExam: ExamReportMockExamRow,
): number {
  if (mockExam.submitted_at === null) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (mockExam.submitted_at.getTime() - mockExam.started_at.getTime()) / 1000,
    ),
  );
}

function listReportPaperQuestions(
  paperSnapshot: Record<string, unknown>,
): ReportPaperQuestionSnapshot[] {
  return listPublishedPaperSnapshotQuestionEntries(paperSnapshot).flatMap(
    ({ paperSection, questionGroup, paperQuestion }) => {
      const paperSectionTitle =
        getStringField(paperSection, "paperSectionTitle") ??
        getStringField(paperSection, "title");

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

      const knowledgeNodeSnapshot = parseKnowledgeNodeSnapshot(paperQuestion);

      return [
        {
          paperQuestionPublicId,
          questionPublicId,
          questionSnapshot: paperQuestion,
          maxScore: getScore(paperQuestion),
          isObjective: getStandardAnswerLabels(paperQuestion).length > 0,
          questionType: getStringField(paperQuestion, "questionType"),
          paperSectionTitle,
          questionGroupPublicId:
            questionGroup === null
              ? null
              : getStringField(questionGroup, "publicId"),
          questionGroupTitle:
            questionGroup === null
              ? null
              : getStringField(questionGroup, "title"),
          knowledgeNodePublicIds: knowledgeNodeSnapshot.publicIds,
          knowledgeNodeSnapshotState: knowledgeNodeSnapshot.state,
          knowledgeNodeBindings: knowledgeNodeSnapshot.bindings,
        },
      ];
    },
  );
}

function buildSavedQuestionDetail(answerRecord: ExamReportAnswerRecordRow) {
  return {
    answerRecordPublicId: answerRecord.public_id,
    paperQuestionPublicId: answerRecord.paper_question_public_id,
    questionPublicId: answerRecord.question_public_id,
    questionSnapshot: answerRecord.question_snapshot,
    answerSnapshot: answerRecord.answer_snapshot,
    answerRecordStatus: answerRecord.answer_record_status,
    isCorrect: answerRecord.is_correct,
    score: answerRecord.score,
    maxScore: answerRecord.max_score,
    answeredAt: answerRecord.answered_at?.toISOString() ?? null,
    submittedAt: answerRecord.submitted_at?.toISOString() ?? null,
  };
}

function buildUnansweredQuestionDetail(question: ReportPaperQuestionSnapshot) {
  return {
    answerRecordPublicId: null,
    paperQuestionPublicId: question.paperQuestionPublicId,
    questionPublicId: question.questionPublicId,
    questionSnapshot: question.questionSnapshot,
    answerSnapshot: null,
    answerRecordStatus: null,
    isCorrect: question.isObjective ? false : null,
    score: question.isObjective ? "0.0" : null,
    maxScore: question.maxScore,
    answeredAt: null,
    submittedAt: null,
  };
}

function buildQuestionDetails(
  paperSnapshot: Record<string, unknown>,
  answerRecords: ExamReportAnswerRecordRow[],
) {
  const answerByPaperQuestion = new Map(
    answerRecords.map((answerRecord) => [
      answerRecord.paper_question_public_id,
      answerRecord,
    ]),
  );

  return listReportPaperQuestions(paperSnapshot).map((question) => {
    const answerRecord = answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );

    return answerRecord === undefined
      ? buildUnansweredQuestionDetail(question)
      : buildSavedQuestionDetail(answerRecord);
  });
}

function formatCountSummary(
  label: string,
  counts: Map<string, number>,
): string | null {
  if (counts.size === 0) {
    return null;
  }

  const summary = [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key} ${value}`)
    .join(", ");

  return `${label}: ${summary}`;
}

function incrementCount(counts: Map<string, number>, key: string | null) {
  if (key === null || key.length === 0) {
    return;
  }

  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function isSameKnowledgeBinding(
  left: KnowledgeNodeBindingSnapshot,
  right: KnowledgeNodeBindingSnapshot,
): boolean {
  return (
    left.knowledgeNodePublicId === right.knowledgeNodePublicId &&
    left.name === right.name &&
    left.pathName === right.pathName &&
    left.confirmationStatus === right.confirmationStatus &&
    left.bindingSource === right.bindingSource
  );
}

function formatKnowledgeNodeCountSummary(
  counts: Map<string, { binding: KnowledgeNodeBindingSnapshot; count: number }>,
): string | null {
  if (counts.size === 0) {
    return null;
  }

  const summary = [...counts.entries()]
    .sort(([left], [right]) => compareOrdinal(left, right))
    .map(([, value]) => `${value.binding.pathName} ${value.count}`)
    .join(", ");

  return `knowledge_node analytics: ${summary}`;
}

function buildAnalyticsSummary(questions: ReportPaperQuestionSnapshot[]) {
  const questionTypeCounts = new Map<string, number>();
  const paperSectionCounts = new Map<string, number>();
  const questionGroupCounts = new Map<string, number>();
  const knowledgeNodeCounts = new Map<
    string,
    { binding: KnowledgeNodeBindingSnapshot; count: number }
  >();
  const knowledgeNodeAnalyticsAvailable = questions.every(
    (question) => question.knowledgeNodeSnapshotState === "current",
  );

  questions.forEach((question) => {
    incrementCount(questionTypeCounts, question.questionType);
    incrementCount(paperSectionCounts, question.paperSectionTitle);
    incrementCount(questionGroupCounts, question.questionGroupTitle);
    if (knowledgeNodeAnalyticsAvailable) {
      question.knowledgeNodeBindings.forEach((binding) => {
        const existing = knowledgeNodeCounts.get(binding.knowledgeNodePublicId);
        if (
          existing !== undefined &&
          !isSameKnowledgeBinding(existing.binding, binding)
        ) {
          throw new ExamReportKnowledgeSnapshotIntegrityError();
        }
        knowledgeNodeCounts.set(binding.knowledgeNodePublicId, {
          binding,
          count: (existing?.count ?? 0) + 1,
        });
      });
    }
  });

  return {
    questionTypeSummaryText: formatCountSummary(
      "question_type analytics",
      questionTypeCounts,
    ),
    paperSectionSummaryText: formatCountSummary(
      "paper_section analytics",
      paperSectionCounts,
    ),
    questionGroupSummaryText: formatCountSummary(
      "question_group analytics",
      questionGroupCounts,
    ),
    knowledgeNodeSummaryText:
      formatKnowledgeNodeCountSummary(knowledgeNodeCounts),
    knowledgeNodeAnalyticsStatus: knowledgeNodeAnalyticsAvailable
      ? "available"
      : "unavailable",
  };
}

function buildKnowledgeNodeAnalysis(
  questions: ReportPaperQuestionSnapshot[],
  answerRecords: ExamReportAnswerRecordRow[],
) {
  if (
    questions.some(
      (question) => question.knowledgeNodeSnapshotState === "legacy",
    )
  ) {
    return {
      knowledgeNodeAnalysis: [],
      knowledgeNodeWeaknessSummaryText: null,
    };
  }

  const answerByPaperQuestion = new Map(
    answerRecords.map((answerRecord) => [
      answerRecord.paper_question_public_id,
      answerRecord,
    ]),
  );
  const accumulatorByKnowledgeNodePublicId = new Map<
    string,
    KnowledgeNodeAnalysisAccumulator
  >();

  questions.forEach((question) => {
    const answerRecord = answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );
    const score = parseScore(
      answerRecord?.score ?? (question.isObjective ? "0.0" : null),
    );
    const maxScore = parseScore(question.maxScore);
    const isAnswered = answerRecord !== undefined;
    const isCorrect = answerRecord?.is_correct === true;

    question.knowledgeNodeBindings.forEach((binding) => {
      const knowledgeNodePublicId = binding.knowledgeNodePublicId;
      const accumulator = accumulatorByKnowledgeNodePublicId.get(
        knowledgeNodePublicId,
      ) ?? {
        knowledgeNodePublicId,
        name: binding.name,
        pathName: binding.pathName,
        confirmationStatus: binding.confirmationStatus,
        bindingSource: binding.bindingSource,
        questionPublicIds: [],
        questionCount: 0,
        answeredCount: 0,
        correctCount: 0,
        score: 0,
        maxScore: 0,
      };

      if (!isSameKnowledgeBinding(accumulator, binding)) {
        throw new ExamReportKnowledgeSnapshotIntegrityError();
      }

      accumulator.questionPublicIds.push(question.questionPublicId);
      accumulator.questionCount += 1;
      accumulator.answeredCount += isAnswered ? 1 : 0;
      accumulator.correctCount += isCorrect ? 1 : 0;
      accumulator.score += score;
      accumulator.maxScore += maxScore;
      accumulatorByKnowledgeNodePublicId.set(
        knowledgeNodePublicId,
        accumulator,
      );
    });
  });

  const knowledgeNodeAnalysis = [...accumulatorByKnowledgeNodePublicId.values()]
    .map((accumulator) => ({
      knowledgeNodePublicId: accumulator.knowledgeNodePublicId,
      name: accumulator.name,
      pathName: accumulator.pathName,
      confirmationStatus: accumulator.confirmationStatus,
      bindingSource: accumulator.bindingSource,
      questionCount: accumulator.questionCount,
      answeredCount: accumulator.answeredCount,
      correctCount: accumulator.correctCount,
      score: formatScore(accumulator.score),
      maxScore: formatScore(accumulator.maxScore),
      scoreRate: formatRate(accumulator.score, accumulator.maxScore),
      accuracyRate: formatRate(
        accumulator.correctCount,
        accumulator.questionCount,
      ),
      questionPublicIds: accumulator.questionPublicIds,
    }))
    .sort(
      (left, right) =>
        left.scoreRate - right.scoreRate ||
        left.accuracyRate - right.accuracyRate ||
        compareOrdinal(left.knowledgeNodePublicId, right.knowledgeNodePublicId),
    )
    .map((analysisItem, index) => ({
      ...analysisItem,
      weaknessRank: index + 1,
    }));

  return {
    knowledgeNodeAnalysis,
    knowledgeNodeWeaknessSummaryText:
      knowledgeNodeAnalysis.length === 0
        ? null
        : `知识点薄弱项：${knowledgeNodeAnalysis
            .map(
              (analysisItem) =>
                `${analysisItem.pathName} 得分率 ${analysisItem.scoreRate}% 正确率 ${analysisItem.accuracyRate}% 得分 ${analysisItem.score}/${analysisItem.maxScore}`,
            )
            .join("；")}`,
  };
}

function formatSelectedAnswer(
  answerSnapshot: ExamReportAnswerRecordRow["answer_snapshot"] | null,
): string | null {
  if (answerSnapshot === null) {
    return null;
  }

  if (answerSnapshot.textAnswer !== null && answerSnapshot.textAnswer !== "") {
    return answerSnapshot.textAnswer;
  }

  return answerSnapshot.selectedLabels.length === 0
    ? null
    : answerSnapshot.selectedLabels.join(", ");
}

function projectStoredAiScoringEvidence(
  answerRecord: ExamReportAnswerRecordRow | undefined,
): Record<string, unknown> | null {
  const evidence = answerRecord?.ai_scoring_evidence;
  const resultSnapshot = evidence?.resultSnapshot;

  if (
    evidence === null ||
    evidence === undefined ||
    !isRecord(resultSnapshot) ||
    resultSnapshot.scoringStatus !== "scored"
  ) {
    return null;
  }

  const scoringPoints = Array.isArray(resultSnapshot.scoringPoints)
    ? resultSnapshot.scoringPoints.flatMap((candidate) => {
        if (!isRecord(candidate)) {
          return [];
        }

        const scoringPointPublicId = getStringField(
          candidate,
          "scoringPointPublicId",
        );
        const isHit = candidate.isHit;
        const score = candidate.score;

        if (
          scoringPointPublicId === null ||
          typeof isHit !== "boolean" ||
          (typeof score !== "number" && typeof score !== "string")
        ) {
          return [];
        }

        return [
          {
            scoringPointPublicId,
            isHit,
            score,
            reason: getStringField(candidate, "reason"),
          },
        ];
      })
    : [];
  const citations = Array.isArray(resultSnapshot.citations)
    ? resultSnapshot.citations.flatMap((candidate) => {
        if (!isRecord(candidate)) {
          return [];
        }

        const resourcePublicId = getStringField(candidate, "resourcePublicId");
        const chunkPublicId = getStringField(candidate, "chunkPublicId");
        const generationPublicId = getStringField(
          candidate,
          "generationPublicId",
        );
        const chunkIndex = candidate.chunkIndex;

        if (
          resourcePublicId === null ||
          chunkPublicId === null ||
          generationPublicId === null ||
          typeof chunkIndex !== "number" ||
          !Number.isInteger(chunkIndex)
        ) {
          return [];
        }

        return [
          {
            resourcePublicId,
            resourceTitle: getStringField(candidate, "resourceTitle"),
            chunkPublicId,
            generationPublicId,
            headingPath: getStringArrayField(candidate, "headingPath"),
            chunkIndex,
            textHash: getStringField(candidate, "textHash"),
          },
        ];
      })
    : [];
  const modelConfigSnapshot = evidence.modelConfigSnapshot;

  return {
    taskPublicId: evidence.taskPublicId,
    taskStatus: evidence.taskStatus,
    attemptNumber: evidence.attemptNumber,
    attemptStatus: evidence.attemptStatus,
    modelConfig: {
      modelConfigPublicId: getStringField(
        modelConfigSnapshot,
        "modelConfigPublicId",
      ),
      modelName: getStringField(modelConfigSnapshot, "modelName"),
      providerDisplayName: getStringField(
        modelConfigSnapshot,
        "providerDisplayName",
      ),
      configVersion:
        typeof modelConfigSnapshot.configVersion === "number"
          ? modelConfigSnapshot.configVersion
          : null,
    },
    promptTemplate: {
      promptTemplateKey: evidence.promptTemplateKey,
      version: evidence.promptTemplateVersion,
      templateHash: evidence.promptTemplateHash,
    },
    scoringPoints,
    overallComment: getStringField(resultSnapshot, "overallComment"),
    improvementSuggestion: getStringField(
      resultSnapshot,
      "improvementSuggestion",
    ),
    evidenceStatus: getStringField(resultSnapshot, "evidenceStatus"),
    citations,
  };
}

function buildQuestionResults(
  paperSnapshot: Record<string, unknown>,
  answerRecords: ExamReportAnswerRecordRow[],
) {
  const answerByPaperQuestion = new Map(
    answerRecords.map((answerRecord) => [
      answerRecord.paper_question_public_id,
      answerRecord,
    ]),
  );

  return listReportPaperQuestions(paperSnapshot).map((question, index) => {
    const answerRecord = answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );
    const standardAnswerLabels = getStandardAnswerLabels(
      question.questionSnapshot,
    );
    const fillBlankAnswers = getFillBlankAnswers(question.questionSnapshot);

    return {
      paperQuestionPublicId: question.paperQuestionPublicId,
      questionPublicId: question.questionPublicId,
      questionType: question.questionType,
      paperSectionTitle: question.paperSectionTitle,
      questionGroupPublicId: question.questionGroupPublicId,
      questionGroupTitle: question.questionGroupTitle,
      scoringMethod: getStringField(question.questionSnapshot, "scoringMethod"),
      title:
        getStringField(question.questionSnapshot, "title") ??
        getStringField(question.questionSnapshot, "stemText") ??
        `Question ${index + 1}`,
      isCorrect:
        answerRecord?.is_correct ?? (question.isObjective ? false : null),
      score: answerRecord?.score ?? (question.isObjective ? "0.0" : null),
      maxScore: question.maxScore,
      selectedAnswer: formatSelectedAnswer(
        answerRecord?.answer_snapshot ?? null,
      ),
      standardAnswer:
        standardAnswerLabels.length === 0
          ? formatFillBlankStandardAnswer(fillBlankAnswers)
          : standardAnswerLabels.join(", "),
      fillBlankAnswers,
      aiScoringEvidence: projectStoredAiScoringEvidence(answerRecord),
      mistakeBookPublicId: null,
    };
  });
}

export function buildExamReportSnapshot(
  mockExam: ExamReportMockExamRow,
  answerRecords: ExamReportAnswerRecordRow[],
): ExamReportSnapshotDto {
  const questions = listReportPaperQuestions(mockExam.paper_snapshot);

  return {
    paperPublicId: mockExam.paper_public_id,
    paperName: getPaperName(mockExam.paper_snapshot),
    profession: mockExam.profession,
    level: mockExam.level,
    subject: mockExam.subject,
    examStatus: mockExam.exam_status,
    scoreSummary: {
      objectiveScore: mockExam.objective_score,
      subjectiveScore: mockExam.subjective_score,
      totalScore: mockExam.total_score,
    },
    paperSnapshot: mockExam.paper_snapshot,
    questionDetails: buildQuestionDetails(
      mockExam.paper_snapshot,
      answerRecords,
    ),
    questionResults: buildQuestionResults(
      mockExam.paper_snapshot,
      answerRecords,
    ),
    ...buildAnalyticsSummary(questions),
    ...buildKnowledgeNodeAnalysis(questions, answerRecords),
    learningSuggestionStatus: null,
  };
}

export type ExamReportAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
};

export type ExamReportRow = {
  id: number;
  public_id: string;
  exam_report_public_id: string | null;
  mock_exam_public_id: string;
  paper_public_id: string;
  paper_name: string;
  profession: Profession;
  level: number;
  subject: Subject;
  exam_status: ExamStatus;
  objective_score: string | null;
  subjective_score: string | null;
  total_score: string | null;
  duration_second: number;
  report_snapshot: ExamReportSnapshotDto;
  learning_suggestion_snapshot: LearningSuggestionSnapshotDto;
  generated_at: Date;
  started_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type ExamReportMockExamRow = {
  public_id: string;
  paper_public_id: string;
  paper_snapshot: Record<string, unknown>;
  profession: Profession;
  level: number;
  subject: Subject;
  exam_status: ExamStatus;
  started_at: Date;
  submitted_at: Date | null;
  objective_score: string | null;
  subjective_score: string | null;
  total_score: string | null;
};

export type ExamReportAnswerSnapshot = {
  selectedLabels: string[];
  textAnswer: string | null;
  savedFromClientAt: string | null;
};

export type ExamReportAiScoringEvidenceRow = {
  taskPublicId: string;
  taskStatus: string;
  attemptNumber: number;
  attemptStatus: string | null;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  resultSnapshot: Record<string, unknown> | null;
};

export type ExamReportAnswerRecordRow = {
  public_id: string;
  paper_question_public_id: string;
  question_public_id: string;
  question_snapshot: Record<string, unknown>;
  answer_snapshot: ExamReportAnswerSnapshot;
  ai_scoring_evidence: ExamReportAiScoringEvidenceRow | null;
  answer_record_status: AnswerRecordStatus;
  is_correct: boolean | null;
  score: string | null;
  max_score: string;
  answered_at: Date | null;
  submitted_at: Date | null;
};

export type UpdateExamReportLearningSuggestionInput = {
  userPublicId: string;
  publicId: string;
  learningSuggestionSnapshot: LearningSuggestionSnapshotDto;
};

export type ExamReportListQuery = {
  userPublicId: string;
  page: number;
  pageSize: number;
  status: ExamStatus | null;
  search: string | null;
  sortBy: "startedAt";
  sortOrder: SortOrder;
};

export type CreateExamReportInput = {
  publicId: string;
  userPublicId: string;
  mockExamPublicId: string;
  paperPublicId: string;
  paperName: string;
  profession: Profession;
  level: number;
  subject: Subject;
  examStatus: ExamStatus;
  objectiveScore: string | null;
  subjectiveScore: string | null;
  totalScore: string | null;
  durationSecond: number;
  reportSnapshot: ExamReportSnapshotDto;
  learningSuggestionSnapshot: LearningSuggestionSnapshotDto;
  generatedAt: Date;
};

export type RebuildExamReportInput = CreateExamReportInput & {
  learningSuggestionSnapshot: null;
};

export type ExamReportRepository = {
  listEffectiveAuthorizationScopes(query: {
    userPublicId: string;
  }): Promise<ExamReportAuthorizationScopeRow[]>;
  listExamReports(query: ExamReportListQuery): Promise<{
    rows: ExamReportRow[];
    total: number;
  }>;
  findExamReportByPublicId(query: {
    userPublicId: string;
    publicId: string;
  }): Promise<ExamReportRow | null>;
  findExamReportByMockExamPublicId(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<ExamReportRow | null>;
  findSubmittedMockExamByPublicId(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<ExamReportMockExamRow | null>;
  listMockExamAnswerRecords(query: {
    userPublicId: string;
    mockExamPublicId: string;
  }): Promise<ExamReportAnswerRecordRow[]>;
  createExamReport(input: CreateExamReportInput): Promise<ExamReportRow>;
  rebuildExamReport(input: RebuildExamReportInput): Promise<ExamReportRow>;
  updateExamReportLearningSuggestionSnapshot(
    input: UpdateExamReportLearningSuggestionInput,
  ): Promise<void>;
};
