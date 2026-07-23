import { createHash, randomUUID } from "node:crypto";

import type {
  AiScoringTaskRecord,
  AiScoringTaskRepository,
  EnqueueAiScoringTaskInput,
} from "../repositories/ai-scoring-task-repository";
import {
  AiScoringResultContractError,
  normalizeAiScoringPointResults,
  validateAiScoringExpectedFacts,
  type AiScoringCanonicalResult,
} from "./ai-scoring-result-contract";
import {
  normalizeAiScoringQuestionContext,
  type AiScoringQuestionContext,
  type AiScoringQuestionContextExpectations,
} from "./ai-scoring-question-context";

export type EnqueueAiScoringTaskCommand = {
  answerRecordPublicId: string;
  mockExamPublicId: string;
  actorPublicId: string;
  idempotencyKey: string;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  inputSnapshot: Record<string, unknown>;
  authorizationSnapshot: Record<string, unknown>;
  ragSnapshot: Record<string, unknown> | null;
};

export type AiScoringTaskExecutionInput = {
  taskPublicId: string;
  answerRecordPublicId: string;
  mockExamPublicId: string;
  actorPublicId: string;
  attemptCount: number;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  inputSnapshot: Record<string, unknown>;
  authorizationSnapshot: Record<string, unknown>;
  ragSnapshot: Record<string, unknown> | null;
  timeoutSecond: 60;
  abortSignal: AbortSignal;
};

export type AiScoringTaskExecutionResult = {
  score: string;
  resultSnapshot: Record<string, unknown>;
  aiCallLogPublicId: string | null;
};

export type AiScoringTaskExecutor = {
  execute(
    input: AiScoringTaskExecutionInput,
  ): Promise<AiScoringTaskExecutionResult>;
};

export class AiScoringTaskExecutionError extends Error {
  constructor(
    readonly failureCode: string,
    readonly retryable: boolean,
    message = failureCode,
  ) {
    super(message);
    this.name = "AiScoringTaskExecutionError";
  }
}

type ExecuteWithTimeout = (
  operation: () => Promise<AiScoringTaskExecutionResult>,
  timeoutSecond: number,
  abortController: AbortController,
) => Promise<AiScoringTaskExecutionResult>;

export type AiScoringTaskRuntimeOptions = {
  repository: AiScoringTaskRepository;
  executor: AiScoringTaskExecutor;
  createPublicId?: () => string;
  now?: () => Date;
  executeWithTimeout?: ExecuteWithTimeout;
};

export type AiScoringTaskEnqueueInputFactoryOptions = {
  createPublicId?: () => string;
  now?: () => Date;
};

function invalidScoringResult(): never {
  throw new AiScoringTaskExecutionError("invalid_scoring_result", false);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return invalidScoringResult();
  }
  return value;
}

function readNullableString(value: unknown): string | null {
  return value === null ? null : readString(value);
}

function readStringValue(value: unknown): string {
  if (typeof value !== "string") {
    return invalidScoringResult();
  }

  return value;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return invalidScoringResult();
  }

  const result: string[] = [];
  for (let index = 0; index < value.length; index += 1) {
    if (!(index in value)) {
      return invalidScoringResult();
    }
    result.push(readString(value[index]));
  }
  return result;
}

function readCitation(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    return invalidScoringResult();
  }

  const chunkIndex = value.chunkIndex;
  const score = value.score;
  const isStale = value.isStale;

  if (
    typeof chunkIndex !== "number" ||
    !Number.isInteger(chunkIndex) ||
    chunkIndex < 0 ||
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    (isStale !== undefined && typeof isStale !== "boolean")
  ) {
    return invalidScoringResult();
  }

  return {
    chunkPublicId: readString(value.chunkPublicId),
    generationPublicId: readNullableString(value.generationPublicId),
    resourcePublicId: readString(value.resourcePublicId),
    resourceTitle: readString(value.resourceTitle),
    headingPath: readStringArray(value.headingPath),
    chunkIndex,
    chunkText: readString(value.chunkText),
    textHash: readString(value.textHash),
    ...(isStale === undefined ? {} : { isStale }),
    score,
  };
}

function copyOptionalString(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  key: string,
): void {
  if (Object.hasOwn(source, key)) {
    target[key] = readString(source[key]);
  }
}

function createCanonicalDurableResultSnapshot(
  snapshot: unknown,
  canonicalResult: AiScoringCanonicalResult,
): Record<string, unknown> {
  if (!isRecord(snapshot) || snapshot.scoringStatus !== "scored") {
    return invalidScoringResult();
  }

  const canonicalSnapshot: Record<string, unknown> = {
    scoringStatus: "scored",
    scoringPoints: canonicalResult.scoringPoints.map((scoringPoint) => ({
      ...scoringPoint,
    })),
    totalScore: canonicalResult.totalScore,
    overallComment: readString(snapshot.overallComment),
    improvementSuggestion: readNullableString(snapshot.improvementSuggestion),
  };

  for (const key of ["modelConfigPublicId", "modelName", "promptTemplateKey"]) {
    copyOptionalString(snapshot, canonicalSnapshot, key);
  }

  if (Object.hasOwn(snapshot, "promptTemplateVersion")) {
    const promptTemplateVersion = snapshot.promptTemplateVersion;
    if (
      typeof promptTemplateVersion !== "number" ||
      !Number.isInteger(promptTemplateVersion) ||
      promptTemplateVersion < 1
    ) {
      return invalidScoringResult();
    }
    canonicalSnapshot.promptTemplateVersion = promptTemplateVersion;
  }

  if (Object.hasOwn(snapshot, "evidenceStatus")) {
    const evidenceStatus = snapshot.evidenceStatus;
    if (
      evidenceStatus !== "sufficient" &&
      evidenceStatus !== "weak" &&
      evidenceStatus !== "none"
    ) {
      return invalidScoringResult();
    }
    canonicalSnapshot.evidenceStatus = evidenceStatus;
  }

  if (Object.hasOwn(snapshot, "citations")) {
    const citations = snapshot.citations;
    if (!Array.isArray(citations)) {
      return invalidScoringResult();
    }
    const canonicalCitations: Record<string, unknown>[] = [];
    for (let index = 0; index < citations.length; index += 1) {
      if (!(index in citations)) {
        return invalidScoringResult();
      }
      canonicalCitations.push(readCitation(citations[index]));
    }
    canonicalSnapshot.citations = canonicalCitations;
  }

  return canonicalSnapshot;
}

function createCanonicalExpectedScoringPoints(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return invalidScoringResult();
  }

  return value.map((scoringPoint) => {
    if (!isRecord(scoringPoint)) {
      return invalidScoringResult();
    }

    const maxScore = scoringPoint.maxScore;
    if (typeof maxScore !== "number" || !Number.isFinite(maxScore)) {
      return invalidScoringResult();
    }

    return {
      scoringPointPublicId: readString(scoringPoint.scoringPointPublicId),
      label: readString(scoringPoint.label),
      maxScore,
    };
  });
}

function createCanonicalExecutionInputSnapshot(
  value: Record<string, unknown>,
  questionContext: AiScoringQuestionContext,
): Record<string, unknown> {
  if (!isRecord(value.questionSnapshot) || !isRecord(value.answerSnapshot)) {
    return invalidScoringResult();
  }

  return {
    questionPublicId: readString(value.questionPublicId),
    paperQuestionPublicId: readString(value.paperQuestionPublicId),
    questionContext,
    questionSnapshot: structuredClone(value.questionSnapshot),
    answerSnapshot: structuredClone(value.answerSnapshot),
    questionText: readString(value.questionText),
    standardAnswer: readString(value.standardAnswer),
    studentAnswer: readStringValue(value.studentAnswer),
    maxScore: value.maxScore,
    scoringPoints: createCanonicalExpectedScoringPoints(value.scoringPoints),
  };
}

function readQuestionContextExpectations(input: {
  inputSnapshot: Record<string, unknown>;
  authorizationSnapshot: Record<string, unknown>;
}): AiScoringQuestionContextExpectations | null {
  const paperQuestionPublicId = input.inputSnapshot.paperQuestionPublicId;
  const questionPublicId = input.inputSnapshot.questionPublicId;
  const profession = input.authorizationSnapshot.profession;
  const level = input.authorizationSnapshot.level;
  const subject = input.authorizationSnapshot.subject;

  if (
    typeof paperQuestionPublicId !== "string" ||
    typeof questionPublicId !== "string" ||
    (profession !== "monopoly" &&
      profession !== "marketing" &&
      profession !== "logistics") ||
    typeof level !== "number" ||
    !Number.isSafeInteger(level) ||
    level <= 0 ||
    (subject !== "theory" && subject !== "skill")
  ) {
    return null;
  }

  return {
    paperQuestionPublicId,
    questionPublicId,
    profession,
    level,
    subject,
  };
}

export type AiScoringTaskProcessResult =
  | { status: "empty" }
  | {
      status: "succeeded";
      taskPublicId: string;
      attemptCount: number;
    }
  | {
      status: "retry_scheduled" | "failed";
      taskPublicId: string;
      attemptCount: number;
      failureCode: string;
    };

export function createAiScoringTaskRuntime(
  options: AiScoringTaskRuntimeOptions,
) {
  const now = options.now ?? (() => new Date());
  const enqueueInputFactory = createAiScoringTaskEnqueueInputFactory({
    createPublicId: options.createPublicId,
    now,
  });
  const executeWithTimeout =
    options.executeWithTimeout ?? executeAiScoringWithTimeout;

  return {
    async enqueueTask(
      command: EnqueueAiScoringTaskCommand,
    ): Promise<AiScoringTaskRecord> {
      return options.repository.enqueueAiScoringTask(
        enqueueInputFactory.create(command),
      );
    },

    async processNext(input: {
      workerPublicId: string;
    }): Promise<AiScoringTaskProcessResult> {
      const claimedAt = now();
      await options.repository.recoverExpiredAiScoringTasks({
        recoveredAt: claimedAt,
      });
      const task = await options.repository.claimNextAiScoringTask({
        workerPublicId: input.workerPublicId,
        claimedAt,
        leaseExpiresAt: new Date(claimedAt.getTime() + 60_000),
      });

      if (task === null) {
        return { status: "empty" };
      }

      if (task.timeoutSecond !== 60 || task.maxAttemptCount !== 3) {
        return failTask(
          task,
          new AiScoringTaskExecutionError("invalid_scoring_task_policy", false),
          input.workerPublicId,
          now(),
          options.repository,
        );
      }

      const contextExpectations = readQuestionContextExpectations({
        inputSnapshot: task.inputSnapshot,
        authorizationSnapshot: task.authorizationSnapshot,
      });
      const questionContext = normalizeAiScoringQuestionContext(
        task.inputSnapshot.questionContext,
        contextExpectations ?? undefined,
      );

      if (contextExpectations === null || questionContext === null) {
        return failTask(
          task,
          new AiScoringTaskExecutionError(
            "invalid_scoring_question_context",
            false,
          ),
          input.workerPublicId,
          now(),
          options.repository,
        );
      }

      try {
        validateAiScoringExpectedFacts({
          expectedScoringPoints: task.inputSnapshot.scoringPoints,
          questionMaxScore: task.inputSnapshot.maxScore,
        });
      } catch (error) {
        if (!(error instanceof AiScoringResultContractError)) {
          throw error;
        }

        return failTask(
          task,
          new AiScoringTaskExecutionError("invalid_scoring_result", false),
          input.workerPublicId,
          now(),
          options.repository,
        );
      }

      const abortController = new AbortController();

      try {
        const canonicalInputSnapshot = createCanonicalExecutionInputSnapshot(
          task.inputSnapshot,
          questionContext,
        );
        const executionResult = await executeWithTimeout(
          () =>
            options.executor.execute({
              taskPublicId: task.publicId,
              answerRecordPublicId: task.answerRecordPublicId,
              mockExamPublicId: task.mockExamPublicId,
              actorPublicId: task.actorPublicId,
              attemptCount: task.attemptCount,
              modelConfigSnapshot: task.modelConfigSnapshot,
              promptTemplateKey: task.promptTemplateKey,
              promptTemplateVersion: task.promptTemplateVersion,
              promptTemplateHash: task.promptTemplateHash,
              inputSnapshot: canonicalInputSnapshot,
              authorizationSnapshot: task.authorizationSnapshot,
              ragSnapshot: task.ragSnapshot,
              timeoutSecond: 60,
              abortSignal: abortController.signal,
            }),
          60,
          abortController,
        );
        if (
          executionResult.aiCallLogPublicId === null ||
          executionResult.aiCallLogPublicId.trim().length === 0
        ) {
          throw new AiScoringTaskExecutionError(
            "missing_scoring_call_provenance",
            false,
          );
        }
        let canonicalResult: AiScoringCanonicalResult;

        try {
          canonicalResult = normalizeAiScoringPointResults({
            expectedScoringPoints: task.inputSnapshot.scoringPoints,
            actualScoringPoints: executionResult.resultSnapshot.scoringPoints,
            questionMaxScore: task.inputSnapshot.maxScore,
          });
        } catch (error) {
          if (!(error instanceof AiScoringResultContractError)) {
            throw error;
          }
          throw new AiScoringTaskExecutionError(
            "invalid_scoring_result",
            false,
          );
        }

        const score = Number(executionResult.score);

        if (
          !Number.isFinite(score) ||
          score !== canonicalResult.totalScore ||
          executionResult.resultSnapshot.scoringStatus !== "scored"
        ) {
          throw new AiScoringTaskExecutionError(
            "invalid_scoring_result",
            false,
          );
        }

        const resultSnapshot = createCanonicalDurableResultSnapshot(
          executionResult.resultSnapshot,
          canonicalResult,
        );
        const resultSnapshotWithProvenance = {
          ...resultSnapshot,
          provenance: {
            aiScoringTaskPublicId: task.publicId,
            attemptCount: task.attemptCount,
            modelConfigSnapshot: task.modelConfigSnapshot,
            promptTemplateKey: task.promptTemplateKey,
            promptTemplateVersion: task.promptTemplateVersion,
            promptTemplateHash: task.promptTemplateHash,
            aiCallLogPublicId: executionResult.aiCallLogPublicId,
          },
        };
        const completedTask = await options.repository.completeAiScoringTask({
          taskPublicId: task.publicId,
          workerPublicId: input.workerPublicId,
          score: executionResult.score,
          resultSnapshot: resultSnapshotWithProvenance,
          aiCallLogPublicId: executionResult.aiCallLogPublicId,
          completedAt: now(),
        });

        return {
          status: "succeeded",
          taskPublicId: completedTask.publicId,
          attemptCount: completedTask.attemptCount,
        };
      } catch (error) {
        return failTask(
          task,
          normalizeExecutionError(error),
          input.workerPublicId,
          now(),
          options.repository,
        );
      }
    },
  };
}

export function createAiScoringTaskEnqueueInputFactory(
  options: AiScoringTaskEnqueueInputFactoryOptions = {},
) {
  const now = options.now ?? (() => new Date());
  const createPublicId =
    options.createPublicId ?? (() => `ai_scoring_task_${randomUUID()}`);

  return {
    create(command: EnqueueAiScoringTaskCommand): EnqueueAiScoringTaskInput {
      if (!isRecord(command.inputSnapshot)) {
        throw new AiScoringTaskExecutionError(
          "invalid_scoring_question_context",
          false,
        );
      }

      const contextExpectations = readQuestionContextExpectations(command);
      const questionContext = normalizeAiScoringQuestionContext(
        command.inputSnapshot.questionContext,
        contextExpectations ?? undefined,
      );

      if (contextExpectations === null || questionContext === null) {
        throw new AiScoringTaskExecutionError(
          "invalid_scoring_question_context",
          false,
        );
      }

      const inputSnapshot = structuredClone(command.inputSnapshot);
      inputSnapshot.questionContext = questionContext;

      return {
        publicId: createPublicId(),
        answerRecordPublicId: command.answerRecordPublicId,
        mockExamPublicId: command.mockExamPublicId,
        actorPublicId: command.actorPublicId,
        idempotencyKeyHash: digest(
          `${command.idempotencyKey}:${JSON.stringify(questionContext)}`,
        ),
        maxAttemptCount: 3,
        timeoutSecond: 60,
        modelConfigSnapshot: command.modelConfigSnapshot,
        promptTemplateKey: command.promptTemplateKey,
        promptTemplateVersion: command.promptTemplateVersion,
        promptTemplateHash: command.promptTemplateHash,
        inputSnapshot,
        authorizationSnapshot: command.authorizationSnapshot,
        ragSnapshot: command.ragSnapshot,
        scheduledAt: now(),
      };
    },
  };
}

async function failTask(
  task: AiScoringTaskRecord,
  error: AiScoringTaskExecutionError,
  workerPublicId: string,
  failedAt: Date,
  repository: AiScoringTaskRepository,
): Promise<AiScoringTaskProcessResult> {
  const failedTask = await repository.failAiScoringTaskAttempt({
    taskPublicId: task.publicId,
    workerPublicId,
    failureCode: error.failureCode,
    failureMessageDigest: digest(error.message),
    retryable: error.retryable,
    failedAt,
    retryAfterAt: new Date(failedAt.getTime() + task.attemptCount * 1_000),
  });

  return {
    status: failedTask.taskStatus === "pending" ? "retry_scheduled" : "failed",
    taskPublicId: failedTask.publicId,
    attemptCount: failedTask.attemptCount,
    failureCode: error.failureCode,
  };
}

function normalizeExecutionError(error: unknown): AiScoringTaskExecutionError {
  if (error instanceof AiScoringTaskExecutionError) {
    return error;
  }

  return new AiScoringTaskExecutionError(
    "scoring_execution_failed",
    true,
    error instanceof Error ? error.message : "unknown scoring execution error",
  );
}

async function executeAiScoringWithTimeout(
  operation: () => Promise<AiScoringTaskExecutionResult>,
  timeoutSecond: number,
  abortController: AbortController,
): Promise<AiScoringTaskExecutionResult> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          abortController.abort();
          reject(new AiScoringTaskExecutionError("scoring_timeout", true));
        }, timeoutSecond * 1_000);
      }),
    ]);
  } finally {
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
