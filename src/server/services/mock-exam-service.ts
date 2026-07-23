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
  MockExamSupplementResultDto,
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
import type { AnswerSessionAuthorizationLineage } from "../repositories/practice-repository";
import {
  ActiveAnswerSessionClaimConflictError,
  AuthorizationStartConflictError,
} from "../repositories/practice-repository";
import type { EnqueueAiScoringTaskInput } from "../repositories/ai-scoring-task-repository";
import {
  normalizeMockExamAnswerInput,
  normalizeStartMockExamInput,
  normalizeSupplementMockExamAnswersInput,
  normalizeSubmitMockExamInput,
  type NormalizedMockExamAnswerInput,
} from "../validators/mock-exam";
import { buildExamReportSnapshot } from "./exam-report-service";
import { validatePublishedPaperQuestionCount } from "../validators/paper-draft";
import { isQuestionScoringContractValid } from "../../lib/question-scoring-contract";
import { listPublishedPaperSnapshotQuestionEntries } from "../../lib/published-paper-snapshot";
import {
  buildAiScoringQuestionContext,
  type AiScoringQuestionContext,
} from "./ai-scoring-question-context";

export type MockExamUserContext = {
  userPublicId: string;
  organizationPublicId?: string | null;
};

export type MockExamClock = {
  now(): Date;
};

export type MockExamPublicIdFactory = {
  createPublicId(
    prefix: "mock_exam" | "mock_exam_deadline_task" | "answer_record",
  ): string;
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
  supplementMockExamAnswers(
    userContext: MockExamUserContext,
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<MockExamSupplementResultDto | null>>;
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

export type MockExamAiScoringRuntimeContext = {
  userPublicId: string;
  organizationPublicId?: string | null;
  mockExamPublicId: string;
  profession: MockExamRow["profession"];
  level: number;
  subject: MockExamRow["subject"];
  answerRecordPublicId: string;
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionContext: AiScoringQuestionContext;
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

export type MockExamAiScoringStatus =
  | "scored"
  | "scoring_failed"
  | "retry_limit_reached";

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

export type MockExamAiScoringQueueReceipt = {
  jobPublicId: string;
  mockExamPublicId: string;
  queuedAt: Date;
  answerRecordPublicIds: string[];
};

export type MockExamAiScoringQueueJob = MockExamAiScoringQueueReceipt & {
  process(): Promise<void>;
};

export type MockExamAiScoringQueue = {
  enqueue(
    job: MockExamAiScoringQueueJob,
  ): Promise<MockExamAiScoringQueueReceipt>;
};

export type MockExamAiScoringQueueDrainResult =
  | { status: "empty" }
  | {
      status: "processed";
      jobPublicId: string;
      mockExamPublicId: string;
      answerRecordPublicIds: string[];
    };

export type DeterministicMockExamAiScoringQueue = MockExamAiScoringQueue & {
  listPendingJobs(): MockExamAiScoringQueueReceipt[];
  drainNext(): Promise<MockExamAiScoringQueueDrainResult>;
  drainAll(): Promise<MockExamAiScoringQueueDrainResult[]>;
};

export type MockExamAiScoringTaskPreparer = {
  prepareTask(
    context: MockExamAiScoringRuntimeContext,
  ): Promise<EnqueueAiScoringTaskInput>;
};

export type MockExamServiceOptions = {
  aiScoringTaskPreparer?: MockExamAiScoringTaskPreparer;
};

type MockExamQuestionSnapshot = {
  paperQuestionPublicId: string;
  questionPublicId: string;
  questionType: string | null;
  scoringMethod: string | null;
  standardAnswerLabels: string[];
  standardAnswerRichText: string | null;
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
export const MOCK_EXAM_AUTHORIZATION_TERMINATED_CODE = 403313;
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

export function createDeterministicMockExamAiScoringQueue(): DeterministicMockExamAiScoringQueue {
  const pendingJobs: MockExamAiScoringQueueJob[] = [];
  return {
    async enqueue(job) {
      pendingJobs.push(job);
      return {
        jobPublicId: job.jobPublicId,
        mockExamPublicId: job.mockExamPublicId,
        queuedAt: job.queuedAt,
        answerRecordPublicIds: [...job.answerRecordPublicIds],
      };
    },
    listPendingJobs() {
      return pendingJobs.map((job) => ({
        jobPublicId: job.jobPublicId,
        mockExamPublicId: job.mockExamPublicId,
        queuedAt: job.queuedAt,
        answerRecordPublicIds: [...job.answerRecordPublicIds],
      }));
    },
    async drainNext() {
      const job = pendingJobs.shift();
      if (job === undefined) {
        return { status: "empty" };
      }
      await job.process();
      return {
        status: "processed",
        jobPublicId: job.jobPublicId,
        mockExamPublicId: job.mockExamPublicId,
        answerRecordPublicIds: [...job.answerRecordPublicIds],
      };
    },
    async drainAll() {
      const results: MockExamAiScoringQueueDrainResult[] = [];
      while (pendingJobs.length > 0) {
        results.push(await this.drainNext());
      }
      return results;
    },
  };
}

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

function selectEffectiveAuthorization(
  scopes: MockExamAuthorizationScopeRow[],
  profession: MockExamPaperRow["profession"],
  level: number,
  now: Date,
  requestedSource: "personal_auth" | "org_auth" | null,
  requestedPublicId: string | null,
): MockExamAuthorizationScopeRow | null {
  const candidates = scopes.filter(
    (scope) => isSameScope(scope, profession, level) && scope.expires_at > now,
  );
  if (requestedSource === null || requestedPublicId === null) {
    return candidates.length === 1 ? candidates[0]! : null;
  }
  const matches = candidates.filter(
    (scope) =>
      scope.authorization_source === requestedSource &&
      scope.authorization_public_id === requestedPublicId,
  );
  return matches.length === 1 ? matches[0]! : null;
}

function toAuthorizationLineage(
  scope: MockExamAuthorizationScopeRow,
): AnswerSessionAuthorizationLineage {
  return {
    authorizationSource: scope.authorization_source,
    authorizationPublicId: scope.authorization_public_id,
    organizationPublicId: scope.organization_public_id,
    quotaOwnerType: scope.quota_owner_type,
    quotaOwnerPublicId: scope.quota_owner_public_id,
  };
}

function hasEffectiveAuthorizationForMockExam(
  scopes: MockExamAuthorizationScopeRow[],
  mockExam: MockExamRow,
  now: Date,
): boolean {
  if (
    mockExam.authorization_source === null ||
    mockExam.authorization_public_id === null
  ) {
    return hasEffectiveAuthorization(
      scopes,
      mockExam.profession,
      mockExam.level,
      now,
    );
  }
  return scopes.some(
    (scope) =>
      isSameScope(scope, mockExam.profession, mockExam.level) &&
      scope.expires_at > now &&
      scope.authorization_source === mockExam.authorization_source &&
      scope.authorization_public_id === mockExam.authorization_public_id &&
      scope.organization_public_id ===
        mockExam.authorization_organization_public_id &&
      scope.quota_owner_type === mockExam.quota_owner_type &&
      scope.quota_owner_public_id === mockExam.quota_owner_public_id,
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

function filterStringLabels(labels: unknown[]): string[] {
  return labels.filter(
    (label): label is string => typeof label === "string" && label.length > 0,
  );
}

function findMockExamQuestion(
  paperSnapshot: Record<string, unknown>,
  paperQuestionPublicId: string,
): MockExamQuestionSnapshot | null {
  for (const { paperQuestion } of listPublishedPaperSnapshotQuestionEntries(
    paperSnapshot,
  )) {
    const candidatePaperQuestionPublicId = getStringField(
      paperQuestion,
      "paperQuestionPublicId",
    );

    if (candidatePaperQuestionPublicId !== paperQuestionPublicId) {
      continue;
    }

    const questionPublicId = getStringField(paperQuestion, "questionPublicId");

    if (questionPublicId === null) {
      return null;
    }

    return {
      paperQuestionPublicId,
      questionPublicId,
      questionType: getStringField(paperQuestion, "questionType"),
      scoringMethod: getStringField(paperQuestion, "scoringMethod"),
      standardAnswerLabels: getStandardAnswerLabels(paperQuestion),
      standardAnswerRichText: getStringField(
        paperQuestion,
        "standardAnswerRichText",
      ),
      score: getScore(paperQuestion),
      snapshot: paperQuestion,
    };
  }

  return null;
}

function listMockExamQuestions(
  paperSnapshot: Record<string, unknown>,
): MockExamQuestionSnapshot[] {
  return listPublishedPaperSnapshotQuestionEntries(paperSnapshot).flatMap(
    ({ paperQuestion }) => {
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
          questionType: getStringField(paperQuestion, "questionType"),
          scoringMethod: getStringField(paperQuestion, "scoringMethod"),
          standardAnswerLabels: getStandardAnswerLabels(paperQuestion),
          standardAnswerRichText: getStringField(
            paperQuestion,
            "standardAnswerRichText",
          ),
          score: getScore(paperQuestion),
          snapshot: paperQuestion,
        },
      ];
    },
  );
}

function countPaperSnapshotQuestions(
  paperSnapshot: Record<string, unknown>,
): number {
  return listPublishedPaperSnapshotQuestionEntries(paperSnapshot).length;
}

function shouldReplaceMockExamSnapshot(
  activeMockExam: MockExamRow,
  paper: MockExamPaperRow,
): boolean {
  return (
    listValidatedMockExamQuestions(activeMockExam.paper_snapshot) === null &&
    listValidatedMockExamQuestions(paper.paper_snapshot) !== null
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

function getAutoMatchAnswers(question: MockExamQuestionSnapshot): string[] {
  if (question.standardAnswerLabels.length > 0) {
    return question.standardAnswerLabels;
  }

  return question.standardAnswerRichText === null
    ? []
    : [question.standardAnswerRichText];
}

function isOptionQuestion(question: MockExamQuestionSnapshot): boolean {
  return (
    question.questionType === "single_choice" ||
    question.questionType === "multi_choice" ||
    question.questionType === "multiple_choice" ||
    question.questionType === "true_false"
  );
}

function isAutoMatchFillBlankQuestion(
  question: MockExamQuestionSnapshot,
): boolean {
  return (
    question.questionType === "fill_blank" &&
    question.scoringMethod === "auto_match"
  );
}

function isObjectiveQuestion(question: MockExamQuestionSnapshot): boolean {
  return (
    question.scoringMethod === "auto_match" &&
    ((isOptionQuestion(question) && question.standardAnswerLabels.length > 0) ||
      (isAutoMatchFillBlankQuestion(question) &&
        getAutoMatchAnswers(question).length > 0))
  );
}

function isAiScoringQuestion(question: MockExamQuestionSnapshot): boolean {
  return (
    question.scoringMethod === "ai_scoring" &&
    (question.questionType === "fill_blank" ||
      question.questionType === "short_answer" ||
      question.questionType === "case_analysis" ||
      question.questionType === "calculation")
  );
}

function isCorrectObjectiveAnswer(
  question: MockExamQuestionSnapshot,
  answerRecord: MockExamAnswerRecordRow,
): boolean {
  if (isAutoMatchFillBlankQuestion(question)) {
    const textAnswer = answerRecord.answer_snapshot.textAnswer;

    if (textAnswer === null) {
      return false;
    }

    const normalizedTextAnswer = normalizeAutoMatchText(textAnswer);

    return getAutoMatchAnswers(question).some(
      (standardAnswer) =>
        normalizeAutoMatchText(standardAnswer) === normalizedTextAnswer,
    );
  }

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
  const normalizedScoringPoints = [];
  const sortOrders: number[] = [];

  for (const scoringPoint of scoringPoints) {
    if (!isRecord(scoringPoint)) {
      return null;
    }

    const scoringPointPublicId = getStringField(
      scoringPoint,
      "scoringPointPublicId",
    );
    const label =
      getStringField(scoringPoint, "label") ??
      getStringField(scoringPoint, "description");
    const sortOrder = scoringPoint.sortOrder;
    const maxScoreValue = scoringPoint.score;
    const maxScore =
      typeof maxScoreValue === "number"
        ? maxScoreValue
        : typeof maxScoreValue === "string"
          ? Number.parseFloat(maxScoreValue)
          : 0;

    if (
      scoringPointPublicId === null ||
      scoringPointPublicId.trim().length === 0 ||
      label === null ||
      label.trim().length === 0 ||
      typeof sortOrder !== "number" ||
      !Number.isInteger(sortOrder) ||
      sortOrder <= 0 ||
      !Number.isFinite(maxScore) ||
      maxScore <= 0 ||
      !Number.isInteger(maxScore * 2)
    ) {
      return null;
    }

    normalizedScoringPoints.push({
      scoringPointPublicId,
      label,
      maxScore,
    });
    sortOrders.push(sortOrder);
  }

  const publicIds = normalizedScoringPoints.map(
    (scoringPoint) => scoringPoint.scoringPointPublicId,
  );
  if (
    new Set(publicIds).size !== publicIds.length ||
    new Set(sortOrders).size !== sortOrders.length
  ) {
    return null;
  }

  return normalizedScoringPoints;
}

function requireScoringPointInputs(question: MockExamQuestionSnapshot) {
  const scoringPoints = listScoringPointInputs(question);

  if (scoringPoints === null) {
    throw new Error("Mock exam scoring point snapshot is malformed.");
  }

  return scoringPoints;
}

function hasValidQuestionScoringContract(
  question: MockExamQuestionSnapshot,
): boolean {
  if (
    !isQuestionScoringContractValid({
      questionType: question.questionType,
      scoringMethod: question.scoringMethod,
      multiChoiceRule: getStringField(question.snapshot, "multiChoiceRule"),
    })
  ) {
    return false;
  }

  const questionScore = Number.parseFloat(question.score);

  if (!Number.isFinite(questionScore) || questionScore <= 0) {
    return false;
  }

  const scoringPoints = listScoringPointInputs(question);

  if (scoringPoints === null) {
    return false;
  }

  if (isObjectiveQuestion(question)) {
    return scoringPoints.length === 0;
  }

  if (!isAiScoringQuestion(question)) {
    return false;
  }

  const scoringPointTotal = scoringPoints.reduce(
    (total, scoringPoint) => total + scoringPoint.maxScore,
    0,
  );

  return (
    scoringPoints.length > 0 &&
    Math.abs(scoringPointTotal - parseScore(question.score)) < 0.001
  );
}

function listValidatedMockExamQuestions(
  paperSnapshot: Record<string, unknown>,
): MockExamQuestionSnapshot[] | null {
  const questions = listMockExamQuestions(paperSnapshot);
  const questionCountValidation = validatePublishedPaperQuestionCount(
    countPaperSnapshotQuestions(paperSnapshot),
  );
  const paperQuestionPublicIds = questions.map(
    (question) => question.paperQuestionPublicId,
  );
  const questionPublicIds = questions.map(
    (question) => question.questionPublicId,
  );

  return !questionCountValidation.success ||
    questions.length !== countPaperSnapshotQuestions(paperSnapshot) ||
    new Set(paperQuestionPublicIds).size !== paperQuestionPublicIds.length ||
    new Set(questionPublicIds).size !== questionPublicIds.length ||
    questions.some((question) => !hasValidQuestionScoringContract(question))
    ? null
    : questions;
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
  aiScoringSnapshot: Record<string, unknown> | null;
} {
  if (!isObjectiveQuestion(question)) {
    return {
      paperQuestionPublicId: question.paperQuestionPublicId,
      answerRecordStatus: "submitted",
      isCorrect: null,
      score: null,
      submittedAt,
      aiScoringSnapshot: null,
    };
  }

  const isCorrect = isCorrectObjectiveAnswer(question, answerRecord);

  return {
    paperQuestionPublicId: question.paperQuestionPublicId,
    answerRecordStatus: "scored",
    isCorrect,
    score: isCorrect ? question.score : "0.0",
    submittedAt,
    aiScoringSnapshot: null,
  };
}

function buildAiScoringRuntimeContext(input: {
  userContext: MockExamUserContext;
  mockExam: MockExamRow;
  question: MockExamQuestionSnapshot;
  answerRecord: MockExamAnswerRecordRow;
}): MockExamAiScoringRuntimeContext {
  if (
    input.answerRecord.paper_question_public_id !==
      input.question.paperQuestionPublicId ||
    input.answerRecord.question_public_id !== input.question.questionPublicId
  ) {
    throw new Error("Invalid AI scoring question identity.");
  }

  const questionSnapshot =
    input.answerRecord.question_snapshot ?? input.question.snapshot;
  const questionContext = buildAiScoringQuestionContext({
    paperSnapshot: input.mockExam.paper_snapshot,
    paperQuestionPublicId: input.question.paperQuestionPublicId,
    profession: input.mockExam.profession,
    level: input.mockExam.level,
    subject: input.mockExam.subject,
  });

  if (questionContext === null) {
    throw new Error("Invalid AI scoring question context.");
  }

  return {
    userPublicId: input.userContext.userPublicId,
    organizationPublicId: input.userContext.organizationPublicId ?? null,
    mockExamPublicId: input.mockExam.public_id,
    profession: input.mockExam.profession,
    level: input.mockExam.level,
    subject: input.mockExam.subject,
    answerRecordPublicId: input.answerRecord.public_id,
    paperQuestionPublicId: input.question.paperQuestionPublicId,
    questionPublicId: input.question.questionPublicId,
    questionContext,
    questionSnapshot,
    answerSnapshot: input.answerRecord.answer_snapshot,
    questionText: getRichTextField(questionSnapshot, "stemRichText"),
    standardAnswer: getRichTextField(
      questionSnapshot,
      "standardAnswerRichText",
    ),
    studentAnswer: getStudentAnswer(input.answerRecord.answer_snapshot),
    maxScore: input.question.score,
    scoringPoints: requireScoringPointInputs(input.question),
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

function createSubmittedSubjectiveResult(input: {
  question: MockExamQuestionSnapshot;
  submittedAt: Date;
}): MockExamSubjectiveScoringResult {
  return {
    paperQuestionPublicId: input.question.paperQuestionPublicId,
    answerRecordStatus: "submitted",
    isCorrect: null,
    score: null,
    submittedAt: input.submittedAt,
    aiScoringSnapshot: {
      scoringStatus: "queued",
    },
  };
}

function listQueueableSubjectiveAnswerRecords(input: {
  answerByPaperQuestion: Map<string, MockExamAnswerRecordRow>;
  questions: MockExamQuestionSnapshot[];
}): MockExamAnswerRecordRow[] {
  return input.questions.filter(isAiScoringQuestion).flatMap((question) => {
    const answerRecord = input.answerByPaperQuestion.get(
      question.paperQuestionPublicId,
    );

    if (answerRecord === undefined) {
      return [];
    }

    return getStudentAnswer(answerRecord.answer_snapshot).trim().length > 0
      ? [answerRecord]
      : [];
  });
}

function createMockExamNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(404312, "Mock exam does not exist.");
}

function createMockExamAuthorizationTerminatedResponse(): ApiResponse<null> {
  return createErrorResponse(
    MOCK_EXAM_AUTHORIZATION_TERMINATED_CODE,
    "Mock exam authorization is invalid; session terminated.",
  );
}

function createMockExamPaperQuestionCountInvalidResponse(): ApiResponse<null> {
  return createErrorResponse(
    422316,
    "Mock exam paper question count is invalid.",
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
  const questions = listValidatedMockExamQuestions(mockExam.paper_snapshot);
  if (questions === null) {
    return createErrorResponse(
      422317,
      "Mock exam paper scoring contract is invalid.",
    );
  }
  const answerByPaperQuestion = new Map<string, MockExamAnswerRecordRow>();
  const questionByPaperQuestion = new Map(
    questions.map((question) => [question.paperQuestionPublicId, question]),
  );
  for (const answerRecord of answerRecords) {
    if (
      answerByPaperQuestion.has(answerRecord.paper_question_public_id) ||
      !questionByPaperQuestion.has(answerRecord.paper_question_public_id)
    ) {
      return createErrorResponse(
        409311,
        "Mock exam answer set is inconsistent.",
      );
    }
    answerByPaperQuestion.set(
      answerRecord.paper_question_public_id,
      answerRecord,
    );
  }
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
  const queueableSubjectiveAnswerRecords = listQueueableSubjectiveAnswerRecords(
    {
      answerByPaperQuestion,
      questions,
    },
  );
  if (
    queueableSubjectiveAnswerRecords.length > 0 &&
    options.aiScoringTaskPreparer === undefined
  ) {
    return createErrorResponse(503318, "Durable AI scoring is unavailable.");
  }
  let aiScoringTasks: EnqueueAiScoringTaskInput[] = [];

  if (options.aiScoringTaskPreparer !== undefined) {
    try {
      aiScoringTasks = await Promise.all(
        queueableSubjectiveAnswerRecords.map((answerRecord) => {
          const question = questions.find(
            (candidate) =>
              candidate.paperQuestionPublicId ===
              answerRecord.paper_question_public_id,
          );

          if (question === undefined) {
            throw new Error("AI scoring task question snapshot is missing.");
          }

          return options.aiScoringTaskPreparer!.prepareTask(
            buildAiScoringRuntimeContext({
              userContext,
              mockExam,
              question,
              answerRecord,
            }),
          );
        }),
      );
    } catch {
      return createErrorResponse(
        503318,
        "AI scoring configuration is unavailable.",
      );
    }
  }
  const subjectiveScore =
    aiScoringTasks.length > 0
      ? null
      : answerRecords.every((answerRecord) => {
            const question = questionByPaperQuestion.get(
              answerRecord.paper_question_public_id,
            );
            return question === undefined || !isAiScoringQuestion(question);
          })
        ? null
        : formatScore(
            answerRecords
              .filter((answerRecord) => {
                const question = questionByPaperQuestion.get(
                  answerRecord.paper_question_public_id,
                );
                return question !== undefined && isAiScoringQuestion(question);
              })
              .reduce(
                (total, answerRecord) => total + parseScore(answerRecord.score),
                0,
              ),
          );
  const examStatus = aiScoringTasks.length > 0 ? "scoring" : "completed";
  const totalScore = formatScore(
    objectiveScore +
      (subjectiveScore === null ? 0 : parseScore(subjectiveScore)),
  );
  const submittedMockExam = await repository.submitMockExam({
    publicId: mockExam.public_id,
    userPublicId: userContext.userPublicId,
    examStatus,
    submittedAt,
    objectiveScore: formatScore(objectiveScore),
    subjectiveScore,
    totalScore,
    unansweredCount,
    aiScoringTasks,
    answerRecordResults: answerRecords.map((answerRecord) => {
      const question = questionByPaperQuestion.get(
        answerRecord.paper_question_public_id,
      );
      if (question === undefined) {
        throw new Error("Mock exam answer question snapshot is missing.");
      }
      const result = isAiScoringQuestion(question)
        ? getStudentAnswer(answerRecord.answer_snapshot).trim().length === 0
          ? createUnansweredSubjectiveResult(question, submittedAt)
          : createSubmittedSubjectiveResult({ question, submittedAt })
        : buildSubmittedAnswerRecordResult(question, answerRecord, submittedAt);
      return {
        answerRecordPublicId: answerRecord.public_id,
        paperQuestionPublicId: result.paperQuestionPublicId,
        expectedRevision: answerRecord.answer_revision,
        expectedAnswerRecordStatus: "saved" as const,
        answerRecordStatus: result.answerRecordStatus,
        isCorrect: result.isCorrect,
        score: result.score,
        submittedAt: result.submittedAt,
        aiScoringSnapshot: result.aiScoringSnapshot,
      };
    }),
  });

  if (submittedMockExam === null) {
    return createErrorResponse(
      409311,
      "Mock exam submit state changed; retry with current state.",
    );
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

  if (!hasEffectiveAuthorizationForMockExam(scopes, mockExam, now)) {
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
  authorizationScope: MockExamAuthorizationScopeRow,
  replaceActivePublicId: string | null,
): Promise<MockExamRow | null | "authorization_invalid" | "claim_conflict"> {
  const serverDeadlineAt = addDurationMinute(startedAt, paper.duration_minute);

  try {
    return await repository.createMockExam({
      publicId: publicIdFactory.createPublicId("mock_exam"),
      deadlineTaskPublicId:
        serverDeadlineAt === null
          ? null
          : publicIdFactory.createPublicId("mock_exam_deadline_task"),
      userPublicId: userContext.userPublicId,
      paperPublicId: paper.public_id,
      paperSnapshot: paper.paper_snapshot,
      profession: paper.profession,
      level: paper.level,
      subject: paper.subject,
      startedAt,
      serverDeadlineAt,
      durationMinute: paper.duration_minute,
      authorizationLineage: toAuthorizationLineage(authorizationScope),
      replaceActivePublicId,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "PaperStartConflictError") {
      return null;
    }
    if (error instanceof AuthorizationStartConflictError) {
      return "authorization_invalid";
    }
    if (error instanceof ActiveAnswerSessionClaimConflictError) {
      return "claim_conflict";
    }
    throw error;
  }
}

async function buildMockExamResult(
  repository: MockExamRepository,
  userContext: MockExamUserContext,
  mockExam: MockExamRow,
  now: Date,
): Promise<MockExamResultDto> {
  const answerRecords = await repository.listMockExamAnswerRecords({
    userPublicId: userContext.userPublicId,
    mockExamPublicId: mockExam.public_id,
  });

  return {
    mockExam: mapMockExamToApi(mockExam, now),
    answerRecords: answerRecords.map((answerRecord) => {
      const mappedAnswerRecord = mapMockExamAnswerRecordToApi(answerRecord);

      return mockExam.exam_status === "in_progress"
        ? {
            ...mappedAnswerRecord,
            isCorrect: null,
            score: null,
          }
        : mappedAnswerRecord;
    }),
  };
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

      const questionCountValidation = validatePublishedPaperQuestionCount(
        countPaperSnapshotQuestions(paper.paper_snapshot),
      );

      if (!questionCountValidation.success) {
        return createMockExamPaperQuestionCountInvalidResponse();
      }

      if (listValidatedMockExamQuestions(paper.paper_snapshot) === null) {
        return createErrorResponse(
          422317,
          "Mock exam paper scoring contract is invalid.",
        );
      }

      const now = clock.now();
      const scopes = await repository.listEffectiveAuthorizationScopes({
        userPublicId: userContext.userPublicId,
      });
      const authorizationScope = selectEffectiveAuthorization(
        scopes,
        paper.profession,
        paper.level,
        now,
        normalizedInput.authorizationSource,
        normalizedInput.authorizationPublicId,
      );

      if (authorizationScope === null) {
        const activeMockExam = await repository.findActiveMockExamByPaper({
          userPublicId: userContext.userPublicId,
          paperPublicId: normalizedInput.paperPublicId,
        });

        if (
          activeMockExam !== null &&
          !hasEffectiveAuthorizationForMockExam(scopes, activeMockExam, now)
        ) {
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
        if (
          activeMockExam.authorization_source !== null &&
          (activeMockExam.authorization_source !==
            authorizationScope.authorization_source ||
            activeMockExam.authorization_public_id !==
              authorizationScope.authorization_public_id)
        ) {
          return createErrorResponse(
            409318,
            "Active mock exam uses a different authorization context.",
          );
        }
        if (shouldReplaceMockExamSnapshot(activeMockExam, paper)) {
          const mockExam = await createFreshMockExam(
            repository,
            publicIdFactory,
            userContext,
            paper,
            now,
            authorizationScope,
            activeMockExam.public_id,
          );

          if (mockExam === "authorization_invalid") {
            return createErrorResponse(
              403311,
              "Student authorization is not valid for this mock exam.",
            );
          }
          if (mockExam === null) {
            return createErrorResponse(
              409313,
              "Mock exam paper is no longer published.",
            );
          }
          if (mockExam === "claim_conflict") {
            return createErrorResponse(
              409319,
              "Active mock exam claim conflicts with this request.",
            );
          }

          return createSuccessResponse(
            await buildMockExamResult(repository, userContext, mockExam, now),
          );
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

          return createSuccessResponse(
            await buildMockExamResult(
              repository,
              userContext,
              submittedResult.mockExam,
              now,
            ),
          );
        }

        return createSuccessResponse(
          await buildMockExamResult(
            repository,
            userContext,
            activeMockExam,
            now,
          ),
        );
      }

      const mockExam = await createFreshMockExam(
        repository,
        publicIdFactory,
        userContext,
        paper,
        now,
        authorizationScope,
        null,
      );

      if (mockExam === "authorization_invalid") {
        return createErrorResponse(
          403311,
          "Student authorization is not valid for this mock exam.",
        );
      }
      if (mockExam === null) {
        return createErrorResponse(
          409313,
          "Mock exam paper is no longer published.",
        );
      }
      if (mockExam === "claim_conflict") {
        return createErrorResponse(
          409319,
          "Active mock exam claim conflicts with this request.",
        );
      }

      return createSuccessResponse(
        await buildMockExamResult(repository, userContext, mockExam, now),
      );
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

      return createSuccessResponse(
        await buildMockExamResult(repository, userContext, mockExam, now),
      );
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

      const saveResult = await repository.saveMockExamAnswerRecord({
        publicId: publicIdFactory.createPublicId("answer_record"),
        userPublicId: userContext.userPublicId,
        mockExamPublicId: mockExam.public_id,
        paperQuestionPublicId: question.paperQuestionPublicId,
        questionPublicId: question.questionPublicId,
        questionSnapshot: question.snapshot,
        answerSnapshot: buildAnswerSnapshot(normalizedInput),
        operationId: normalizedInput.operationId,
        expectedRevision: normalizedInput.expectedRevision,
        answerRecordStatus: "saved",
        isCorrect: null,
        score: null,
        maxScore: question.score,
        answeredAt: now,
      });

      if (saveResult.status === "stale") {
        return createErrorResponse(
          409316,
          "Mock exam answer revision is stale.",
        );
      }

      if (saveResult.status === "not_writable") {
        return createErrorResponse(409311, "Mock exam is not in progress.");
      }

      if (saveResult.status === "operation_conflict") {
        return createErrorResponse(
          409318,
          "Mock exam answer operation id conflicts with another question.",
        );
      }

      if (saveResult.answerRecord === null) {
        throw new Error("Saved mock exam answer record is unavailable.");
      }

      return createSuccessResponse({
        answerRecord: mapMockExamAnswerRecordToApi(saveResult.answerRecord),
      });
    },

    async supplementMockExamAnswers(userContext, publicId, input) {
      const normalizedInput = normalizeSupplementMockExamAnswersInput(input);

      if (normalizedInput === null) {
        return createErrorResponse(
          422318,
          "Mock exam supplemental answer input is invalid.",
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

      if (
        !["completed", "scoring", "scoring_partial_failed"].includes(
          mockExam.exam_status,
        ) ||
        mockExam.server_deadline_at === null ||
        mockExam.submitted_at === null ||
        mockExam.submitted_at < mockExam.server_deadline_at
      ) {
        return createErrorResponse(
          409317,
          "Mock exam does not allow terminal answer supplementation.",
        );
      }

      const normalizedAnswersWithTime = normalizedInput.answers.map(
        (answer) => ({
          answer,
          clientSavedAt: new Date(answer.savedFromClientAt!),
        }),
      );

      if (
        normalizedAnswersWithTime.some(
          ({ clientSavedAt }) =>
            clientSavedAt < mockExam.started_at ||
            clientSavedAt > mockExam.server_deadline_at!,
        )
      ) {
        return createErrorResponse(
          422319,
          "Mock exam supplemental answer was saved after the deadline.",
        );
      }

      const preparedAnswers = [];

      try {
        for (const { answer, clientSavedAt } of normalizedAnswersWithTime) {
          const question = findMockExamQuestion(
            mockExam.paper_snapshot,
            answer.paperQuestionPublicId,
          );

          if (question === null) {
            return createErrorResponse(
              422313,
              "Mock exam question is invalid.",
            );
          }

          const publicId = publicIdFactory.createPublicId("answer_record");
          const answerSnapshot = buildAnswerSnapshot(answer);
          const answerRecord: MockExamAnswerRecordRow = {
            public_id: publicId,
            exam_mode: "mock_exam",
            paper_question_public_id: question.paperQuestionPublicId,
            question_public_id: question.questionPublicId,
            question_snapshot: question.snapshot,
            answer_snapshot: answerSnapshot,
            answer_revision: 1,
            client_operation_id: answer.operationId,
            client_saved_at: clientSavedAt,
            answer_record_status: "submitted",
            is_correct: null,
            score: null,
            max_score: question.score,
            answered_at: now,
            submitted_at: now,
          };

          if (isAiScoringQuestion(question)) {
            if (options.aiScoringTaskPreparer === undefined) {
              return createErrorResponse(
                503318,
                "AI scoring configuration is unavailable.",
              );
            }

            preparedAnswers.push({
              publicId,
              paperQuestionPublicId: question.paperQuestionPublicId,
              questionPublicId: question.questionPublicId,
              questionSnapshot: question.snapshot,
              answerSnapshot,
              operationId: answer.operationId,
              clientSavedAt,
              answerRecordStatus: "submitted" as const,
              isCorrect: null,
              score: null,
              maxScore: question.score,
              aiScoringTask: await options.aiScoringTaskPreparer.prepareTask(
                buildAiScoringRuntimeContext({
                  userContext,
                  mockExam,
                  question,
                  answerRecord,
                }),
              ),
            });
            continue;
          }

          const objectiveResult = buildSubmittedAnswerRecordResult(
            question,
            answerRecord,
            now,
          );
          preparedAnswers.push({
            publicId,
            paperQuestionPublicId: question.paperQuestionPublicId,
            questionPublicId: question.questionPublicId,
            questionSnapshot: question.snapshot,
            answerSnapshot,
            operationId: answer.operationId,
            clientSavedAt,
            answerRecordStatus: objectiveResult.answerRecordStatus,
            isCorrect: objectiveResult.isCorrect,
            score: objectiveResult.score,
            maxScore: question.score,
            aiScoringTask: null,
          });
        }
      } catch {
        return createErrorResponse(
          503318,
          "AI scoring configuration is unavailable.",
        );
      }

      const supplementResult =
        await repository.supplementMissingMockExamAnswers({
          userPublicId: userContext.userPublicId,
          mockExamPublicId: mockExam.public_id,
          supplementedAt: now,
          answers: preparedAnswers,
        });

      if (supplementResult === null) {
        return createMockExamNotFoundResponse();
      }

      const rebuiltReport = await repository.rebuildExistingExamReport({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: supplementResult.mockExam.public_id,
        hasChanges: supplementResult.supplementedCount > 0,
        examStatus: supplementResult.mockExam.exam_status,
        objectiveScore: supplementResult.mockExam.objective_score,
        subjectiveScore: supplementResult.mockExam.subjective_score,
        totalScore: supplementResult.mockExam.total_score,
        reportSnapshot: buildExamReportSnapshot(
          {
            public_id: supplementResult.mockExam.public_id,
            paper_public_id: supplementResult.mockExam.paper_public_id,
            paper_snapshot: supplementResult.mockExam.paper_snapshot,
            profession: supplementResult.mockExam.profession,
            level: supplementResult.mockExam.level,
            subject: supplementResult.mockExam.subject,
            exam_status: supplementResult.mockExam.exam_status,
            started_at: supplementResult.mockExam.started_at,
            submitted_at: supplementResult.mockExam.submitted_at,
            objective_score: supplementResult.mockExam.objective_score,
            subjective_score: supplementResult.mockExam.subjective_score,
            total_score: supplementResult.mockExam.total_score,
          },
          supplementResult.answerRecords.map((answerRecord) => ({
            ...answerRecord,
            question_snapshot: answerRecord.question_snapshot ?? {},
            ai_scoring_evidence: answerRecord.ai_scoring_evidence ?? null,
          })),
        ),
        rebuiltAt: now,
      });

      return createSuccessResponse({
        mockExam: mapMockExamToApi(supplementResult.mockExam, now),
        supplementedCount: supplementResult.supplementedCount,
        skippedExistingCount: supplementResult.skippedExistingCount,
        examReportPublicId: rebuiltReport?.publicId ?? null,
        reportRevision: rebuiltReport?.reportRevision ?? null,
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

      if (
        ["completed", "scoring", "scoring_partial_failed"].includes(
          mockExam.exam_status,
        )
      ) {
        const questionCount =
          listValidatedMockExamQuestions(mockExam.paper_snapshot)?.length ?? 0;

        return createSuccessResponse({
          mockExam: mapMockExamToApi(mockExam, now),
          unansweredCount: Math.max(0, questionCount - mockExam.answered_count),
        });
      }

      if (mockExam.exam_status !== "in_progress") {
        return createErrorResponse(409311, "Mock exam is not in progress.");
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
      if (options.aiScoringTaskPreparer === undefined) {
        return createErrorResponse(
          503318,
          "Durable AI scoring retry is unavailable.",
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

      if (repository.retryFailedAiScoringTasks === undefined) {
        return createErrorResponse(
          503318,
          "Durable AI scoring retry is unavailable.",
        );
      }

      const retryResult = await repository.retryFailedAiScoringTasks({
        userPublicId: userContext.userPublicId,
        mockExamPublicId: mockExam.public_id,
        retriedAt: now,
      });

      if (retryResult === null) {
        return createMockExamNotFoundResponse();
      }

      return createSuccessResponse({
        mockExam: mapMockExamToApi(retryResult.mockExam, now),
        retriedCount: retryResult.retriedCount,
        failedCount: retryResult.failedCount,
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

      return createSuccessResponse(
        await buildMockExamResult(
          repository,
          userContext,
          terminatedMockExam,
          now,
        ),
      );
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
    async supplementMockExamAnswers() {
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
