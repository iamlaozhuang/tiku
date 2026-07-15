import { describe, expect, it, vi } from "vitest";

import type {
  AiScoringTaskRecord,
  AiScoringTaskRepository,
} from "../repositories/ai-scoring-task-repository";
import {
  AiScoringTaskExecutionError,
  createAiScoringTaskRuntime,
  type AiScoringTaskRuntimeOptions,
} from "./ai-scoring-task-runtime";

const now = new Date("2026-07-15T20:10:00.000Z");

const task: AiScoringTaskRecord = {
  publicId: "ai_scoring_task_public_001",
  answerRecordPublicId: "answer_record_public_001",
  mockExamPublicId: "mock_exam_public_001",
  actorPublicId: "user_public_001",
  idempotencyKeyHash: "a".repeat(64),
  taskStatus: "running",
  attemptCount: 1,
  maxAttemptCount: 3,
  timeoutSecond: 60,
  modelConfigSnapshot: {
    modelConfigPublicId: "model_config_public_001",
    providerMode: "governed_provider",
  },
  promptTemplateKey: "ai_scoring_v1",
  promptTemplateVersion: 3,
  promptTemplateHash: "prompt_hash_001",
  inputSnapshot: {
    questionPublicId: "question_public_001",
    studentAnswer: "immutable answer",
    maxScore: "5.0",
  },
  authorizationSnapshot: {
    authorizationPublicId: "personal_auth_public_001",
    effectiveEdition: "advanced",
  },
  ragSnapshot: { evidenceStatus: "sufficient" },
  resultSnapshot: null,
  aiCallLogPublicId: null,
  failureCode: null,
  failureMessageDigest: null,
  scheduledAt: now,
  claimedAt: now,
  leaseExpiresAt: new Date("2026-07-15T20:11:00.000Z"),
  workerPublicId: "worker_public_001",
  completedAt: null,
};

function createRepository(overrides: Partial<AiScoringTaskRepository> = {}) {
  return {
    enqueueAiScoringTask: vi.fn(async () => ({
      ...task,
      taskStatus: "pending" as const,
    })),
    recoverExpiredAiScoringTasks: vi.fn(async () => 0),
    claimNextAiScoringTask: vi.fn(async () => task),
    completeAiScoringTask: vi.fn(async () => ({
      ...task,
      taskStatus: "succeeded" as const,
    })),
    failAiScoringTaskAttempt: vi.fn(async () => ({
      ...task,
      taskStatus: "pending" as const,
    })),
    ...overrides,
  } satisfies AiScoringTaskRepository;
}

describe("durable AI scoring task runtime", () => {
  it("hashes the idempotency key and preserves immutable execution snapshots", async () => {
    const enqueueAiScoringTask = vi.fn<
      AiScoringTaskRepository["enqueueAiScoringTask"]
    >(async () => ({ ...task, taskStatus: "pending" as const }));
    const repository = createRepository({ enqueueAiScoringTask });
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor: { execute: vi.fn() },
      createPublicId: () => "ai_scoring_task_public_001",
      now: () => now,
    });

    await runtime.enqueueTask({
      answerRecordPublicId: task.answerRecordPublicId,
      mockExamPublicId: task.mockExamPublicId,
      actorPublicId: task.actorPublicId,
      idempotencyKey: "mock_exam_public_001:answer_record_public_001",
      modelConfigSnapshot: task.modelConfigSnapshot,
      promptTemplateKey: task.promptTemplateKey,
      promptTemplateVersion: task.promptTemplateVersion,
      promptTemplateHash: task.promptTemplateHash,
      inputSnapshot: task.inputSnapshot,
      authorizationSnapshot: task.authorizationSnapshot,
      ragSnapshot: task.ragSnapshot,
    });

    expect(enqueueAiScoringTask).toHaveBeenCalledWith({
      publicId: "ai_scoring_task_public_001",
      answerRecordPublicId: task.answerRecordPublicId,
      mockExamPublicId: task.mockExamPublicId,
      actorPublicId: task.actorPublicId,
      idempotencyKeyHash: expect.stringMatching(/^[a-f0-9]{64}$/u),
      maxAttemptCount: 3,
      timeoutSecond: 60,
      modelConfigSnapshot: task.modelConfigSnapshot,
      promptTemplateKey: task.promptTemplateKey,
      promptTemplateVersion: task.promptTemplateVersion,
      promptTemplateHash: task.promptTemplateHash,
      inputSnapshot: task.inputSnapshot,
      authorizationSnapshot: task.authorizationSnapshot,
      ragSnapshot: task.ragSnapshot,
      scheduledAt: now,
    });
    expect(
      JSON.stringify(enqueueAiScoringTask.mock.calls[0]?.[0]),
    ).not.toContain("mock_exam_public_001:answer_record_public_001");
  });

  it("claims one FIFO task and enforces the persisted 60-second timeout contract", async () => {
    const repository = createRepository();
    const executor = {
      execute: vi.fn(async () => ({
        score: "4.0",
        resultSnapshot: {
          scoringStatus: "scored",
          modelConfigPublicId: "model_config_public_001",
          promptTemplateKey: "ai_scoring_v1",
          promptTemplateVersion: 3,
        },
        aiCallLogPublicId: "ai_call_log_public_001",
      })),
    };
    const executeWithTimeout: NonNullable<
      AiScoringTaskRuntimeOptions["executeWithTimeout"]
    > = vi.fn(async (operation, timeoutSecond) => {
      expect(timeoutSecond).toBe(60);
      return operation();
    });
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor,
      executeWithTimeout,
      now: () => now,
    });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({
      status: "succeeded",
      taskPublicId: task.publicId,
      attemptCount: 1,
    });
    expect(repository.claimNextAiScoringTask).toHaveBeenCalledWith({
      workerPublicId: "worker_public_001",
      claimedAt: now,
      leaseExpiresAt: new Date("2026-07-15T20:11:00.000Z"),
    });
    expect(repository.recoverExpiredAiScoringTasks).toHaveBeenCalledWith({
      recoveredAt: now,
    });
    expect(
      vi.mocked(repository.recoverExpiredAiScoringTasks).mock
        .invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(repository.claimNextAiScoringTask).mock.invocationCallOrder[0]!,
    );
    expect(executor.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        taskPublicId: task.publicId,
        modelConfigSnapshot: task.modelConfigSnapshot,
        inputSnapshot: task.inputSnapshot,
        authorizationSnapshot: task.authorizationSnapshot,
        timeoutSecond: 60,
        abortSignal: expect.any(AbortSignal),
      }),
    );
    expect(repository.completeAiScoringTask).toHaveBeenCalledWith({
      taskPublicId: task.publicId,
      workerPublicId: "worker_public_001",
      score: "4.0",
      resultSnapshot: {
        scoringStatus: "scored",
        modelConfigPublicId: "model_config_public_001",
        promptTemplateKey: "ai_scoring_v1",
        promptTemplateVersion: 3,
        provenance: {
          aiScoringTaskPublicId: task.publicId,
          attemptCount: 1,
          modelConfigSnapshot: task.modelConfigSnapshot,
          promptTemplateKey: task.promptTemplateKey,
          promptTemplateVersion: task.promptTemplateVersion,
          promptTemplateHash: task.promptTemplateHash,
          aiCallLogPublicId: "ai_call_log_public_001",
        },
      },
      aiCallLogPublicId: "ai_call_log_public_001",
      completedAt: now,
    });
  });

  it("fails closed when an executor omits durable call provenance", async () => {
    const repository = createRepository({
      failAiScoringTaskAttempt: vi.fn(async () => ({
        ...task,
        taskStatus: "failed" as const,
      })),
    });
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor: {
        execute: vi.fn(async () => ({
          score: "4.0",
          resultSnapshot: { scoringStatus: "scored" },
          aiCallLogPublicId: null,
        })),
      },
      executeWithTimeout: vi.fn(async (operation) => operation()),
      now: () => now,
    });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({
      status: "failed",
      taskPublicId: task.publicId,
      failureCode: "missing_scoring_call_provenance",
    });
    expect(repository.completeAiScoringTask).not.toHaveBeenCalled();
    expect(repository.failAiScoringTaskAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        failureCode: "missing_scoring_call_provenance",
        retryable: false,
      }),
    );
  });

  it("rejects a non-finite or out-of-range scoring result", async () => {
    const repository = createRepository({
      failAiScoringTaskAttempt: vi.fn(async () => ({
        ...task,
        taskStatus: "failed" as const,
      })),
    });
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor: {
        execute: vi.fn(async () => ({
          score: "6.0",
          resultSnapshot: { scoringStatus: "scored" },
          aiCallLogPublicId: "ai_call_log_public_001",
        })),
      },
      executeWithTimeout: vi.fn(async (operation) => operation()),
      now: () => now,
    });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({
      status: "failed",
      failureCode: "invalid_scoring_result",
    });
    expect(repository.completeAiScoringTask).not.toHaveBeenCalled();
    expect(repository.failAiScoringTaskAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        failureCode: "invalid_scoring_result",
        retryable: false,
      }),
    );
  });

  it("persists retryable timeout failure instead of claiming success", async () => {
    const repository = createRepository({
      failAiScoringTaskAttempt: vi.fn(async () => ({
        ...task,
        taskStatus: "failed" as const,
      })),
    });
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor: { execute: vi.fn() },
      executeWithTimeout: vi.fn(async () => {
        throw new AiScoringTaskExecutionError("scoring_timeout", true);
      }),
      now: () => now,
    });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({
      status: "failed",
      taskPublicId: task.publicId,
      failureCode: "scoring_timeout",
    });
    expect(repository.completeAiScoringTask).not.toHaveBeenCalled();
    expect(repository.failAiScoringTaskAttempt).toHaveBeenCalledWith({
      taskPublicId: task.publicId,
      workerPublicId: "worker_public_001",
      failureCode: "scoring_timeout",
      failureMessageDigest: expect.stringMatching(/^[a-f0-9]{64}$/u),
      retryable: true,
      failedAt: now,
      retryAfterAt: new Date("2026-07-15T20:10:01.000Z"),
    });
  });

  it("does not execute when the durable queue is empty", async () => {
    const repository = createRepository({
      claimNextAiScoringTask: vi.fn(async () => null),
    });
    const executor = { execute: vi.fn() };
    const runtime = createAiScoringTaskRuntime({ repository, executor });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toEqual({ status: "empty" });
    expect(executor.execute).not.toHaveBeenCalled();
  });
});
