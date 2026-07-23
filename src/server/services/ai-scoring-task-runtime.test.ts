import { describe, expect, it, vi } from "vitest";

import type {
  AiScoringTaskRecord,
  AiScoringTaskRepository,
} from "../repositories/ai-scoring-task-repository";
import {
  AiScoringTaskExecutionError,
  createAiScoringTaskRuntime as createProductionAiScoringTaskRuntime,
  type AiScoringTaskExecutor,
  type AiScoringTaskRuntimeOptions,
} from "./ai-scoring-task-runtime";

function createAiScoringTaskRuntime(
  options: Omit<AiScoringTaskRuntimeOptions, "onCompletedScoringReport"> &
    Partial<Pick<AiScoringTaskRuntimeOptions, "onCompletedScoringReport">>,
) {
  return createProductionAiScoringTaskRuntime({
    ...options,
    onCompletedScoringReport:
      options.onCompletedScoringReport ?? (async () => {}),
  });
}

const now = new Date("2026-07-15T20:10:00.000Z");

const questionContext = {
  schemaVersion: 1,
  paperQuestionPublicId: "paper_question_public_001",
  questionPublicId: "question_public_001",
  paperSection: {
    publicId: "paper_section_public_001",
    title: "案例分析",
    sortOrder: 1,
  },
  questionGroup: {
    publicId: "question_group_public_001",
    title: "案例材料题",
    sortOrder: 1,
    paperQuestionPublicIds: ["paper_question_public_001"],
    material: {
      materialPublicId: "material_public_001",
      title: "营销材料",
      contentRichText: "<p>发布时材料。</p>",
      profession: "marketing",
      level: 3,
      subject: "theory",
    },
  },
};

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
    paperQuestionPublicId: "paper_question_public_001",
    questionContext,
    questionSnapshot: {
      questionPublicId: "question_public_001",
      profession: "marketing",
      level: 3,
    },
    answerSnapshot: {
      selectedLabels: [],
      textAnswer: "immutable answer",
      savedFromClientAt: null,
    },
    questionText: "question text",
    standardAnswer: "standard answer",
    studentAnswer: "immutable answer",
    maxScore: "5.0",
    scoringPoints: [
      {
        scoringPointPublicId: "scoring_point_public_1",
        label: "first",
        maxScore: 2,
      },
      {
        scoringPointPublicId: "scoring_point_public_2",
        label: "second",
        maxScore: 3,
      },
    ],
  },
  authorizationSnapshot: {
    authorizationPublicId: "personal_auth_public_001",
    effectiveEdition: "advanced",
    profession: "marketing",
    level: 3,
    subject: "theory",
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
  it("fails non-retryably before executor for a malformed question context", async () => {
    const invalidTask = {
      ...task,
      inputSnapshot: {
        ...task.inputSnapshot,
        questionContext: {
          ...questionContext,
          questionPublicId: "question_public_other",
        },
      },
    };
    const repository = createRepository({
      claimNextAiScoringTask: vi.fn(async () => invalidTask),
      failAiScoringTaskAttempt: vi.fn(async () => ({
        ...invalidTask,
        taskStatus: "failed" as const,
      })),
    });
    const executor = { execute: vi.fn() };
    const runtime = createAiScoringTaskRuntime({ repository, executor });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({
      status: "failed",
      failureCode: "invalid_scoring_question_context",
    });
    expect(executor.execute).not.toHaveBeenCalled();
    expect(repository.completeAiScoringTask).not.toHaveBeenCalled();
  });

  it("rejects grouped context scope drift before executor", async () => {
    const invalidTask = {
      ...task,
      authorizationSnapshot: {
        ...task.authorizationSnapshot,
        profession: "logistics",
      },
    };
    const repository = createRepository({
      claimNextAiScoringTask: vi.fn(async () => invalidTask),
      failAiScoringTaskAttempt: vi.fn(async () => ({
        ...invalidTask,
        taskStatus: "failed" as const,
      })),
    });
    const executor = { execute: vi.fn() };
    const runtime = createAiScoringTaskRuntime({ repository, executor });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({
      status: "failed",
      failureCode: "invalid_scoring_question_context",
    });
    expect(executor.execute).not.toHaveBeenCalled();
  });

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

  it("binds the immutable question context into the idempotency hash", async () => {
    const enqueueAiScoringTask = vi.fn<
      AiScoringTaskRepository["enqueueAiScoringTask"]
    >(async (input) => ({
      ...task,
      taskStatus: "pending" as const,
      idempotencyKeyHash: input.idempotencyKeyHash,
    }));
    const runtime = createAiScoringTaskRuntime({
      repository: createRepository({ enqueueAiScoringTask }),
      executor: { execute: vi.fn() },
    });
    const command = {
      answerRecordPublicId: task.answerRecordPublicId,
      mockExamPublicId: task.mockExamPublicId,
      actorPublicId: task.actorPublicId,
      idempotencyKey: "same-key",
      modelConfigSnapshot: task.modelConfigSnapshot,
      promptTemplateKey: task.promptTemplateKey,
      promptTemplateVersion: task.promptTemplateVersion,
      promptTemplateHash: task.promptTemplateHash,
      inputSnapshot: task.inputSnapshot,
      authorizationSnapshot: task.authorizationSnapshot,
      ragSnapshot: task.ragSnapshot,
    };

    await runtime.enqueueTask(command);
    await runtime.enqueueTask({
      ...command,
      inputSnapshot: {
        ...command.inputSnapshot,
        questionContext: {
          ...questionContext,
          paperSection: {
            ...questionContext.paperSection,
            title: "不同的发布时模块",
          },
        },
      },
    });

    const firstHash =
      enqueueAiScoringTask.mock.calls[0]?.[0].idempotencyKeyHash;
    const secondHash =
      enqueueAiScoringTask.mock.calls[1]?.[0].idempotencyKeyHash;
    expect(firstHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(secondHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(secondHash).not.toBe(firstHash);
  });

  it("claims one FIFO task and enforces the persisted 60-second timeout contract", async () => {
    const claimedTask = {
      ...task,
      inputSnapshot: {
        ...task.inputSnapshot,
        unexpectedExecutorField: "must not pass",
      },
    };
    const repository = createRepository({
      claimNextAiScoringTask: vi.fn(async () => claimedTask),
    });
    const executor = {
      execute: vi.fn<AiScoringTaskExecutor["execute"]>(async () => ({
        score: "4.0",
        resultSnapshot: {
          scoringStatus: "scored",
          scoringPoints: [
            {
              scoringPointPublicId: "scoring_point_public_2",
              isHit: true,
              score: 2.4,
              reason: "second",
            },
            {
              scoringPointPublicId: "scoring_point_public_1",
              isHit: true,
              score: 1.7,
              reason: "first",
            },
          ],
          overallComment: "valid",
          improvementSuggestion: null,
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
    const onCompletedScoringReport = vi.fn(async () => {});
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor,
      executeWithTimeout,
      now: () => now,
      onCompletedScoringReport,
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
    expect(onCompletedScoringReport).toHaveBeenCalledWith({
      userPublicId: task.actorPublicId,
      mockExamPublicId: task.mockExamPublicId,
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
        inputSnapshot: expect.objectContaining({
          questionContext,
          questionPublicId: "question_public_001",
          paperQuestionPublicId: "paper_question_public_001",
        }),
        authorizationSnapshot: task.authorizationSnapshot,
        timeoutSecond: 60,
        abortSignal: expect.any(AbortSignal),
      }),
    );
    const executorInputSnapshot =
      vi.mocked(executor.execute).mock.calls[0]?.[0].inputSnapshot ?? {};
    expect(executorInputSnapshot).not.toBe(claimedTask.inputSnapshot);
    expect(executorInputSnapshot).not.toHaveProperty("unexpectedExecutorField");
    expect(executorInputSnapshot.questionContext).not.toBe(questionContext);
    expect(repository.completeAiScoringTask).toHaveBeenCalledWith({
      taskPublicId: task.publicId,
      workerPublicId: "worker_public_001",
      score: "4.0",
      resultSnapshot: {
        scoringStatus: "scored",
        scoringPoints: [
          {
            scoringPointPublicId: "scoring_point_public_1",
            isHit: true,
            score: 1.5,
            reason: "first",
          },
          {
            scoringPointPublicId: "scoring_point_public_2",
            isHit: true,
            score: 2.5,
            reason: "second",
          },
        ],
        totalScore: 4,
        overallComment: "valid",
        improvementSuggestion: null,
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

  it("fails instead of completing a durable task with duplicate scoring points", async () => {
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
          resultSnapshot: {
            scoringStatus: "scored",
            scoringPoints: [
              {
                scoringPointPublicId: "scoring_point_public_1",
                isHit: true,
                score: 2,
                reason: "first",
              },
              {
                scoringPointPublicId: "scoring_point_public_1",
                isHit: true,
                score: 2,
                reason: "duplicate",
              },
            ],
            overallComment: "invalid",
            improvementSuggestion: null,
          },
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
  });

  it("rejects an executor scalar score that differs from canonical points", async () => {
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
          score: "5.0",
          resultSnapshot: {
            scoringStatus: "scored",
            scoringPoints: [
              {
                scoringPointPublicId: "scoring_point_public_1",
                isHit: true,
                score: 1,
                reason: "first",
              },
              {
                scoringPointPublicId: "scoring_point_public_2",
                isHit: true,
                score: 2,
                reason: "second",
              },
            ],
            overallComment: "scalar mismatch",
            improvementSuggestion: null,
          },
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
  });

  it("rejects corrupt persisted expected facts before executing", async () => {
    const corruptTask = {
      ...task,
      inputSnapshot: {
        ...task.inputSnapshot,
        scoringPoints: [
          {
            scoringPointPublicId: "scoring_point_public_1",
            label: "first",
            maxScore: 2,
          },
          {
            scoringPointPublicId: "scoring_point_public_1",
            label: "duplicate first",
            maxScore: 2,
          },
        ],
      },
    };
    const repository = createRepository({
      claimNextAiScoringTask: vi.fn(async () => corruptTask),
      failAiScoringTaskAttempt: vi.fn(async () => ({
        ...corruptTask,
        taskStatus: "failed" as const,
      })),
    });
    const executor = { execute: vi.fn() };
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor,
      now: () => now,
    });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({
      status: "failed",
      failureCode: "invalid_scoring_result",
    });
    expect(executor.execute).not.toHaveBeenCalled();
    expect(repository.completeAiScoringTask).not.toHaveBeenCalled();
  });

  it("persists only a detached canonical allowlist snapshot", async () => {
    const providerScoringPoints = [
      {
        scoringPointPublicId: "scoring_point_public_2",
        isHit: true,
        score: 2.4,
        reason: "second",
      },
      {
        scoringPointPublicId: "scoring_point_public_1",
        isHit: true,
        score: 1.7,
        reason: "first",
      },
    ];
    const repository = createRepository();
    const runtime = createAiScoringTaskRuntime({
      repository,
      executor: {
        execute: vi.fn(async () => ({
          score: "4.0",
          resultSnapshot: {
            scoringStatus: "scored",
            scoringPoints: providerScoringPoints,
            overallComment: "valid",
            improvementSuggestion: null,
            rawProviderPayload: "must-not-persist",
          },
          aiCallLogPublicId: "ai_call_log_public_001",
        })),
      },
      executeWithTimeout: vi.fn(async (operation) => operation()),
      now: () => now,
    });

    await expect(
      runtime.processNext({ workerPublicId: "worker_public_001" }),
    ).resolves.toMatchObject({ status: "succeeded" });

    providerScoringPoints[1]!.reason = "mutated after completion";
    const completionInput = vi.mocked(repository.completeAiScoringTask).mock
      .calls[0]?.[0];
    expect(completionInput?.resultSnapshot).toMatchObject({
      scoringStatus: "scored",
      scoringPoints: [
        {
          scoringPointPublicId: "scoring_point_public_1",
          score: 1.5,
          reason: "first",
        },
        {
          scoringPointPublicId: "scoring_point_public_2",
          score: 2.5,
          reason: "second",
        },
      ],
      totalScore: 4,
    });
    expect(JSON.stringify(completionInput?.resultSnapshot)).not.toContain(
      "rawProviderPayload",
    );
    expect(JSON.stringify(completionInput?.resultSnapshot)).not.toContain(
      "must-not-persist",
    );
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
