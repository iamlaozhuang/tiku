import { createHash } from "node:crypto";

const INPUT_SCHEMA_VERSION = 1 as const;
const MAX_PUBLIC_ID_LENGTH = 160;
const MAX_TITLE_LENGTH = 240;
const MAX_REASON_LENGTH = 1_000;
const MAX_QUESTIONS = 500;
const MAX_SCORING_POINTS = 100;
const MAX_KNOWLEDGE_NODES = 500;
const MAX_SCORE = 1_000_000;
const MAX_DURATION_SECOND = 31_536_000;
const CONTROL_CHARACTER_PATTERN =
  /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;
const SHA256_PATTERN = /^[0-9a-f]{64}$/u;
const QUESTION_TYPES = new Set([
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
]);
const EVIDENCE_STATUSES = new Set(["sufficient", "weak", "none"]);
const SUBJECTIVE_QUESTION_TYPES = new Set([
  "short_answer",
  "case_analysis",
  "calculation",
]);

export class LearningSuggestionInputIntegrityError extends Error {
  constructor() {
    super("Learning suggestion input is unavailable.");
    this.name = "LearningSuggestionInputIntegrityError";
  }
}

type CanonicalExamReport = {
  profession: string;
  level: number;
  subject: string;
  examStatus: "completed";
  objectiveScore: string;
  subjectiveScore: string;
  totalScore: string;
  durationSecond: number;
};

type ErrorSummary = {
  questionOrdinal: number;
  questionType: string;
  paperSectionTitle: string;
  score: string;
  maxScore: string;
  evidenceStatus: string | null;
  missedScoringPoints: Array<{
    scoringPointOrdinal: number;
    score: string;
    reason: string;
  }>;
};

type LearningSuggestionVariables = {
  examReport: CanonicalExamReport;
  answerRecordSummary: {
    questionCount: number;
    wrongQuestionCount: number;
    questionTypeSummaries: Array<{
      questionType: string;
      questionCount: number;
      wrongQuestionCount: number;
    }>;
    paperSectionSummaries: Array<{
      paperSectionTitle: string;
      questionCount: number;
      wrongQuestionCount: number;
    }>;
    errorSummaries: ErrorSummary[];
  };
  knowledgeNodeSnapshot: {
    status: "available" | "unavailable";
    weaknesses: Array<{
      weaknessRank: number;
      name: string;
      pathName: string;
      questionCount: number;
      answeredCount: number;
      correctCount: number;
      score: string;
      maxScore: string;
      scoreRate: number;
      accuracyRate: number;
    }>;
  };
};

export type LearningSuggestionInput = {
  schemaVersion: typeof INPUT_SCHEMA_VERSION;
  reportPublicId: string;
  reportRevision: number;
  variables: LearningSuggestionVariables;
  inputDigest: string;
};

function fail(): never {
  throw new LearningSuggestionInputIntegrityError();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): void {
  const actualKeys = Object.keys(value).sort(compareOrdinal);
  const sortedExpectedKeys = [...expectedKeys].sort(compareOrdinal);
  if (
    actualKeys.length !== sortedExpectedKeys.length ||
    actualKeys.some((key, index) => key !== sortedExpectedKeys[index])
  ) {
    fail();
  }
}

function requireRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : fail();
}

function requireDenseArray(value: unknown, maximum: number): unknown[] {
  if (!Array.isArray(value) || value.length > maximum) fail();
  for (let index = 0; index < value.length; index += 1) {
    if (!(index in value)) fail();
  }
  return value;
}

function requireText(value: unknown, maximum = MAX_TITLE_LENGTH): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximum ||
    value.trim() !== value ||
    CONTROL_CHARACTER_PATTERN.test(value)
  ) {
    fail();
  }
  return value;
}

function requirePublicId(value: unknown): string {
  return requireText(value, MAX_PUBLIC_ID_LENGTH);
}

function requirePositiveInteger(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) fail();
  return value as number;
}

function requireNonnegativeInteger(
  value: unknown,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  if (
    !Number.isSafeInteger(value) ||
    (value as number) < 0 ||
    (value as number) > maximum
  ) {
    fail();
  }
  return value as number;
}

function requireFiniteNumber(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.length > 0
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_SCORE) fail();
  return parsed;
}

function formatScore(value: unknown): string {
  return requireFiniteNumber(value).toFixed(1);
}

function formatNullableScore(value: unknown): string {
  return value === null ? "0.0" : formatScore(value);
}

function assertUniqueIds(ids: string[]): void {
  const exact = new Set<string>();
  const folded = new Set<string>();
  for (const id of ids) {
    const lower = id.toLowerCase();
    if (exact.has(id) || folded.has(lower)) fail();
    exact.add(id);
    folded.add(lower);
  }
}

function compareOrdinal(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function requireNullableText(value: unknown): string | null {
  return value === null ? null : requireText(value);
}

function requireIsoDate(value: unknown): string {
  const text = requireText(value, 32);
  const timestamp = Date.parse(text);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString() !== text
  ) {
    fail();
  }
  return text;
}

function buildErrorScoringPoints(evidence: unknown): {
  evidenceStatus: string | null;
  missedScoringPoints: ErrorSummary["missedScoringPoints"];
  totalScore: number | null;
} {
  if (evidence === null) {
    return {
      evidenceStatus: null,
      missedScoringPoints: [],
      totalScore: null,
    };
  }
  const evidenceRecord = requireRecord(evidence);
  const result = requireRecord(evidenceRecord.resultSnapshot);
  const evidenceStatus = requireText(result.evidenceStatus, 32);
  if (!EVIDENCE_STATUSES.has(evidenceStatus)) fail();
  const scoringPoints = requireDenseArray(
    result.scoringPoints,
    MAX_SCORING_POINTS,
  ).map((value) => {
    const point = requireRecord(value);
    const publicId = requirePublicId(point.scoringPointPublicId);
    if (typeof point.isHit !== "boolean") fail();
    return {
      publicId,
      isHit: point.isHit,
      score: formatScore(point.score),
      reason: requireText(point.reason, MAX_REASON_LENGTH),
    };
  });
  assertUniqueIds(scoringPoints.map(({ publicId }) => publicId));
  scoringPoints.sort((left, right) =>
    compareOrdinal(left.publicId, right.publicId),
  );
  return {
    evidenceStatus,
    totalScore: scoringPoints.reduce(
      (total, point) => total + Number(point.score),
      0,
    ),
    missedScoringPoints: scoringPoints.flatMap((point, index) =>
      point.isHit
        ? []
        : [
            {
              scoringPointOrdinal: index + 1,
              score: point.score,
              reason: point.reason,
            },
          ],
    ),
  };
}

function buildAnswerRecordSummary(snapshot: Record<string, unknown>) {
  const sourceQuestions = requireDenseArray(
    snapshot.questionResults,
    MAX_QUESTIONS,
  );
  if (sourceQuestions.length === 0) fail();
  const questions = sourceQuestions.map((value) => {
    const question = requireRecord(value);
    const paperQuestionPublicId = requirePublicId(
      question.paperQuestionPublicId,
    );
    const questionPublicId = requirePublicId(question.questionPublicId);
    const questionType = requireText(question.questionType, 40);
    if (!QUESTION_TYPES.has(questionType)) fail();
    const paperSectionTitle = requireText(question.paperSectionTitle);
    const questionGroupPublicId = requireNullableText(
      question.questionGroupPublicId,
    );
    const questionGroupTitle = requireNullableText(question.questionGroupTitle);
    if ((questionGroupPublicId === null) !== (questionGroupTitle === null))
      fail();
    if (
      question.isCorrect !== null &&
      typeof question.isCorrect !== "boolean"
    ) {
      fail();
    }
    const score =
      question.score === null ? 0 : requireFiniteNumber(question.score);
    const maxScore = requireFiniteNumber(question.maxScore);
    if (maxScore === 0 || score > maxScore) fail();
    const scoring = buildErrorScoringPoints(question.aiScoringEvidence);
    const isWrong = score < maxScore;
    if (
      (question.isCorrect === true && isWrong) ||
      (question.isCorrect === false && !isWrong) ||
      (scoring.totalScore !== null &&
        scoring.totalScore.toFixed(1) !== score.toFixed(1))
    ) {
      fail();
    }
    return {
      paperQuestionPublicId,
      questionPublicId,
      questionType,
      paperSectionTitle,
      isWrong,
      score: score.toFixed(1),
      maxScore: maxScore.toFixed(1),
      evidenceStatus: scoring.evidenceStatus,
      missedScoringPoints: scoring.missedScoringPoints,
    };
  });
  assertUniqueIds(
    questions.map(({ paperQuestionPublicId }) => paperQuestionPublicId),
  );
  assertUniqueIds(questions.map(({ questionPublicId }) => questionPublicId));
  questions.sort((left, right) =>
    compareOrdinal(left.paperQuestionPublicId, right.paperQuestionPublicId),
  );

  const typeCounts = new Map<
    string,
    { questionCount: number; wrongQuestionCount: number }
  >();
  const sectionCounts = new Map<
    string,
    { questionCount: number; wrongQuestionCount: number }
  >();
  for (const question of questions) {
    for (const [map, key] of [
      [typeCounts, question.questionType],
      [sectionCounts, question.paperSectionTitle],
    ] as const) {
      const current = map.get(key) ?? {
        questionCount: 0,
        wrongQuestionCount: 0,
      };
      current.questionCount += 1;
      if (question.isWrong) current.wrongQuestionCount += 1;
      map.set(key, current);
    }
  }

  return {
    questionPublicIds: new Set(
      questions.map(({ questionPublicId }) => questionPublicId),
    ),
    summary: {
      questionCount: questions.length,
      wrongQuestionCount: questions.filter(({ isWrong }) => isWrong).length,
      questionTypeSummaries: [...typeCounts]
        .sort(([left], [right]) => compareOrdinal(left, right))
        .map(([questionType, counts]) => ({ questionType, ...counts })),
      paperSectionSummaries: [...sectionCounts]
        .sort(([left], [right]) => compareOrdinal(left, right))
        .map(([paperSectionTitle, counts]) => ({
          paperSectionTitle,
          ...counts,
        })),
      errorSummaries: questions.flatMap((question, index) =>
        question.isWrong
          ? [
              {
                questionOrdinal: index + 1,
                questionType: question.questionType,
                paperSectionTitle: question.paperSectionTitle,
                score: question.score,
                maxScore: question.maxScore,
                evidenceStatus: question.evidenceStatus,
                missedScoringPoints: question.missedScoringPoints,
              },
            ]
          : [],
      ),
    },
    objectiveScore: questions
      .filter(
        ({ questionType }) => !SUBJECTIVE_QUESTION_TYPES.has(questionType),
      )
      .reduce((total, question) => total + Number(question.score), 0),
    subjectiveScore: questions
      .filter(({ questionType }) => SUBJECTIVE_QUESTION_TYPES.has(questionType))
      .reduce((total, question) => total + Number(question.score), 0),
  };
}

function buildKnowledgeNodeSnapshot(
  snapshot: Record<string, unknown>,
  reportQuestionPublicIds: ReadonlySet<string>,
) {
  const status = requireText(snapshot.knowledgeNodeAnalyticsStatus, 32);
  if (status === "unavailable") {
    if (
      requireDenseArray(snapshot.knowledgeNodeAnalysis, MAX_KNOWLEDGE_NODES)
        .length !== 0
    )
      fail();
    return { status: "unavailable" as const, weaknesses: [] };
  }
  if (status !== "available") fail();
  const values = requireDenseArray(
    snapshot.knowledgeNodeAnalysis,
    MAX_KNOWLEDGE_NODES,
  ).map((value) => {
    const node = requireRecord(value);
    const publicId = requirePublicId(node.knowledgeNodePublicId);
    if (
      node.confirmationStatus !== "confirmed" ||
      node.bindingSource !== "formal_question_binding"
    ) {
      fail();
    }
    const questionCount = requireNonnegativeInteger(node.questionCount);
    const answeredCount = requireNonnegativeInteger(node.answeredCount);
    const correctCount = requireNonnegativeInteger(node.correctCount);
    if (correctCount > answeredCount || answeredCount > questionCount) fail();
    const score = requireFiniteNumber(node.score);
    const maxScore = requireFiniteNumber(node.maxScore);
    if (score > maxScore) fail();
    const scoreRate = requireFiniteNumber(node.scoreRate);
    const accuracyRate = requireFiniteNumber(node.accuracyRate);
    if (scoreRate > 100 || accuracyRate > 100) fail();
    const questionPublicIds = requireDenseArray(
      node.questionPublicIds,
      MAX_QUESTIONS,
    ).map(requirePublicId);
    assertUniqueIds(questionPublicIds);
    if (
      questionPublicIds.length !== questionCount ||
      questionPublicIds.some(
        (questionPublicId) => !reportQuestionPublicIds.has(questionPublicId),
      )
    ) {
      fail();
    }
    return {
      publicId,
      weaknessRank: requirePositiveInteger(node.weaknessRank),
      name: requireText(node.name),
      pathName: requireText(node.pathName, 1_000),
      questionCount,
      answeredCount,
      correctCount,
      score: score.toFixed(1),
      maxScore: maxScore.toFixed(1),
      scoreRate,
      accuracyRate,
    };
  });
  assertUniqueIds(values.map(({ publicId }) => publicId));
  const ranks = values.map(({ weaknessRank }) => String(weaknessRank));
  if (new Set(ranks).size !== ranks.length) fail();
  values.sort(
    (left, right) =>
      left.weaknessRank - right.weaknessRank ||
      compareOrdinal(left.publicId, right.publicId),
  );
  if (values.some((value, index) => value.weaknessRank !== index + 1)) fail();
  return {
    status: "available" as const,
    weaknesses: values.map((value) => ({
      weaknessRank: value.weaknessRank,
      name: value.name,
      pathName: value.pathName,
      questionCount: value.questionCount,
      answeredCount: value.answeredCount,
      correctCount: value.correctCount,
      score: value.score,
      maxScore: value.maxScore,
      scoreRate: value.scoreRate,
      accuracyRate: value.accuracyRate,
    })),
  };
}

export function buildLearningSuggestionInput(
  source: unknown,
): LearningSuggestionInput {
  const sourceRecord = requireRecord(source);
  const report = requireRecord(sourceRecord.report);
  const reportPublicId = requirePublicId(report.publicId);
  const reportRevision = requirePositiveInteger(report.reportRevision);
  if (report.examStatus !== "completed") fail();
  const snapshot = requireRecord(report.reportSnapshot);
  if (
    snapshot.paperPublicId !== report.paperPublicId ||
    snapshot.profession !== report.profession ||
    snapshot.level !== report.level ||
    snapshot.subject !== report.subject ||
    snapshot.examStatus !== report.examStatus
  ) {
    fail();
  }
  requirePublicId(report.mockExamPublicId);
  requirePublicId(report.paperPublicId);
  const profession = requireText(report.profession, 40);
  const level = requirePositiveInteger(report.level);
  const subject = requireText(report.subject, 40);
  const scoreSummary = requireRecord(snapshot.scoreSummary);
  const objectiveScore = formatNullableScore(report.objectiveScore);
  const subjectiveScore = formatNullableScore(report.subjectiveScore);
  const totalScore = formatScore(report.totalScore);
  if (
    formatNullableScore(scoreSummary.objectiveScore) !== objectiveScore ||
    formatNullableScore(scoreSummary.subjectiveScore) !== subjectiveScore ||
    formatScore(scoreSummary.totalScore) !== totalScore ||
    (
      requireFiniteNumber(objectiveScore) + requireFiniteNumber(subjectiveScore)
    ).toFixed(1) !== totalScore
  ) {
    fail();
  }
  const answerRecordFacts = buildAnswerRecordSummary(snapshot);
  if (
    answerRecordFacts.objectiveScore.toFixed(1) !== objectiveScore ||
    answerRecordFacts.subjectiveScore.toFixed(1) !== subjectiveScore
  ) {
    fail();
  }
  const variables: LearningSuggestionVariables = {
    examReport: {
      profession,
      level,
      subject,
      examStatus: "completed",
      objectiveScore,
      subjectiveScore,
      totalScore,
      durationSecond: requireNonnegativeInteger(
        report.durationSecond,
        MAX_DURATION_SECOND,
      ),
    },
    answerRecordSummary: answerRecordFacts.summary,
    knowledgeNodeSnapshot: buildKnowledgeNodeSnapshot(
      snapshot,
      answerRecordFacts.questionPublicIds,
    ),
  };
  const digestPreimage = {
    schemaVersion: INPUT_SCHEMA_VERSION,
    reportPublicId,
    reportRevision,
    variables,
  };
  return {
    ...digestPreimage,
    inputDigest: createHash("sha256")
      .update(JSON.stringify(digestPreimage))
      .digest("hex"),
  };
}

export function serializeLearningSuggestionProviderVariables(
  input: LearningSuggestionInput,
): string {
  const digestPreimage = {
    schemaVersion: input.schemaVersion,
    reportPublicId: requirePublicId(input.reportPublicId),
    reportRevision: requirePositiveInteger(input.reportRevision),
    variables: input.variables,
  };
  const expectedDigest = createHash("sha256")
    .update(JSON.stringify(digestPreimage))
    .digest("hex");
  if (
    input.schemaVersion !== INPUT_SCHEMA_VERSION ||
    !SHA256_PATTERN.test(input.inputDigest) ||
    input.inputDigest !== expectedDigest
  ) {
    fail();
  }
  return JSON.stringify({
    examReport: input.variables.examReport,
    answerRecordSummary: input.variables.answerRecordSummary,
    knowledgeNodeSnapshot: input.variables.knowledgeNodeSnapshot,
  });
}

export function validatePersistedLearningSuggestionSnapshot<T>(
  value: T,
  input: LearningSuggestionInput,
  expectedProvenance?: {
    modelConfigSnapshot: {
      modelConfigPublicId: string;
      aiFuncType: string;
      modelName: string;
      providerDisplayName: string;
      configVersion: number;
    };
    promptTemplate: {
      promptTemplateKey: string;
      version: number;
      templateHash: string;
    };
  },
): T {
  const snapshot = requireRecord(value);
  requireExactKeys(snapshot, [
    "status",
    "inputSchemaVersion",
    "inputDigest",
    "reportRevision",
    "learningSuggestion",
    "evidenceStatus",
    "generatedAt",
    "modelConfigSnapshot",
    "promptTemplate",
  ]);
  const modelConfigSnapshot = requireRecord(snapshot.modelConfigSnapshot);
  const promptTemplate = requireRecord(snapshot.promptTemplate);
  requireExactKeys(modelConfigSnapshot, [
    "modelConfigPublicId",
    "aiFuncType",
    "modelName",
    "providerDisplayName",
    "configVersion",
  ]);
  requireExactKeys(promptTemplate, [
    "promptTemplateKey",
    "version",
    "templateHash",
  ]);
  requireIsoDate(snapshot.generatedAt);
  if (
    snapshot.status !== "generated" ||
    snapshot.inputSchemaVersion !== INPUT_SCHEMA_VERSION ||
    snapshot.inputDigest !== input.inputDigest ||
    snapshot.reportRevision !== input.reportRevision ||
    !SHA256_PATTERN.test(String(snapshot.inputDigest)) ||
    requireText(snapshot.learningSuggestion, 5_000).length === 0 ||
    !EVIDENCE_STATUSES.has(String(snapshot.evidenceStatus)) ||
    requirePublicId(modelConfigSnapshot.modelConfigPublicId).length === 0 ||
    modelConfigSnapshot.aiFuncType !== "learning_suggestion" ||
    requireText(modelConfigSnapshot.modelName).length === 0 ||
    requireText(modelConfigSnapshot.providerDisplayName).length === 0 ||
    requirePositiveInteger(modelConfigSnapshot.configVersion) < 1 ||
    promptTemplate.promptTemplateKey !== "learning_suggestion_v1" ||
    promptTemplate.version !== 1 ||
    promptTemplate.templateHash !== "learning_suggestion_v1_baseline"
  ) {
    fail();
  }
  if (
    expectedProvenance !== undefined &&
    JSON.stringify({ modelConfigSnapshot, promptTemplate }) !==
      JSON.stringify(expectedProvenance)
  ) {
    fail();
  }
  return value;
}
