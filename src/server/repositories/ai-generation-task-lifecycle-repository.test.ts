import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createModelConfigSnapshot } from "../models/ai-rag";
import { createUnavailableAiCallObservation } from "../services/ai-call-observation";
import { qwenRouteIntegratedProviderLimits } from "../services/route-integrated-provider-execution-service";
import {
  AI_GENERATION_TASK_MAX_RETRY_COUNT,
  AI_GENERATION_TASK_STALE_AFTER_MS,
  createAiGenerationTaskLifecycleRepository,
  createPostgresAiGenerationTaskLifecycleRepository,
  normalizePersistedAiCallLogObservation,
  normalizePersistedAiCallLogReservationObservation,
  normalizePersistedCurrentMeasuredAiCallObservation,
  type AiGenerationTaskLifecycleGateway,
  type AiGenerationTaskLifecycleRow,
  type PersistedAiCallLogObservation,
} from "./ai-generation-task-lifecycle-repository";
import type { RuntimeDatabase } from "./runtime-database";

const taskPublicId = "ai_generation_task_public_lifecycle_001";
const ownerPublicId = "student_public_lifecycle_001";
const startedAt = new Date("2026-07-22T12:00:00.123Z");
const claimedAt = new Date("2026-07-22T12:05:00.123Z");

function createRow(
  overrides: Partial<AiGenerationTaskLifecycleRow> = {},
): AiGenerationTaskLifecycleRow {
  return {
    taskPublicId,
    taskType: "ai_question_generation",
    ownerType: "personal",
    ownerPublicId,
    organizationPublicId: null,
    taskStatus: "pending",
    retryCount: 0,
    failureCategory: null,
    startedAt: null,
    finishedAt: null,
    resultPublicId: null,
    aiCallLogPublicId: null,
    ...overrides,
  };
}

function createGateway(row: AiGenerationTaskLifecycleRow | null) {
  let currentRow = row;
  const gateway: AiGenerationTaskLifecycleGateway = {
    findTask: vi.fn(async () => currentRow),
    claimAttempt: vi.fn(async (input) => {
      if (
        currentRow === null ||
        currentRow.taskStatus !== input.expectedStatus ||
        currentRow.retryCount !== input.expectedRetryCount ||
        currentRow.startedAt?.getTime() !== input.expectedStartedAt?.getTime()
      ) {
        return null;
      }

      currentRow = createRow({
        ...currentRow,
        taskStatus: "running",
        retryCount: input.nextRetryCount,
        failureCategory: null,
        startedAt: input.claimedAt,
        finishedAt: null,
      });
      return currentRow;
    }),
    failAttempt: vi.fn(async (input) => {
      if (
        currentRow?.taskStatus !== "running" ||
        currentRow.retryCount !== input.attempt.retryCount ||
        currentRow.startedAt?.getTime() !== input.attempt.startedAt.getTime()
      ) {
        return null;
      }

      currentRow = createRow({
        ...currentRow,
        taskStatus: "failed",
        failureCategory: input.failureCategory,
        finishedAt: input.finishedAt,
        aiCallLogPublicId: input.aiCallLogPublicId,
      });
      return currentRow;
    }),
    cancelTask: vi.fn(async (input) => {
      if (
        currentRow === null ||
        !input.expectedStatuses.includes(currentRow.taskStatus)
      ) {
        return null;
      }

      currentRow = createRow({
        ...currentRow,
        taskStatus: "cancelled",
        finishedAt: input.finishedAt,
      });
      return currentRow;
    }),
  };

  return { gateway };
}

const scope = {
  taskPublicId,
  ownerType: "personal" as const,
  ownerPublicId,
  organizationPublicId: null,
  taskTypes: ["ai_question_generation", "ai_paper_generation"] as const,
};

function createPersistedObservation(
  overrides: Partial<PersistedAiCallLogObservation> = {},
): PersistedAiCallLogObservation {
  return {
    observationSchemaVersion: 1,
    tokenSource: "unavailable",
    tokenEstimationMethod: null,
    promptTokenCount: null,
    completionTokenCount: null,
    totalTokenCount: null,
    estimatedCostCny: null,
    latencySource: "unavailable",
    latencyMs: null,
    ...overrides,
  };
}

function createReservationInput() {
  return {
    scope,
    attempt: { taskPublicId, retryCount: 0, startedAt },
    promptTemplateHash: "sha256:reservation-template",
    log: {
      publicId: "ai-call-log-generation-reservation-001",
      userPublicId: ownerPublicId,
      organizationPublicId: null,
      profession: null,
      level: null,
      answerRecordPublicId: null,
      mockExamPublicId: null,
      questionPublicId: null,
      aiFuncType: "ai_question_generation" as const,
      callStatus: "running" as const,
      modelConfigSnapshot: createModelConfigSnapshot({
        providerPublicId: "provider-public-reservation",
        providerKey: "qwen",
        providerDisplayName: "Qwen",
        modelConfigPublicId: "model-config-public-reservation",
        aiFuncType: "ai_question_generation",
        modelName: "qwen-reservation",
        displayName: "Qwen reservation",
        configVersion: 1,
        timeoutSecond: 60,
        maxRetryCount: 2,
        fallbackModelConfigPublicId: null,
        promptTemplateKey: "ai_question_generation_v2",
        promptTemplateVersion: 2,
      }),
      promptTemplateKey: "ai_question_generation_v2",
      promptTemplateVersion: 2,
      requestRedactedSnapshot: { redactionStatus: "redacted" },
      responseRedactedSnapshot: null,
      errorRedactedSnapshot: null,
      citationRedactedSnapshot: null,
      promptTokenCount: null,
      completionTokenCount: null,
      totalTokenCount: null,
      estimatedCostCny: null,
      latencyMs: null,
      observation: createUnavailableAiCallObservation(),
      startedAt,
      completedAt: null,
    },
  };
}

describe("AI generation task lifecycle repository", () => {
  it("persists and revalidates current unavailable reservation provenance before terminal mutations", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/ai-generation-task-lifecycle-repository.ts",
      ),
      "utf8",
    );

    expect(source).toMatch(
      /normalizeAiGenerationRunningReservationObservation\(\s*input\.log\.observation/gu,
    );
    expect(source).toContain(
      "observation_schema_version: reservationObservation.schemaVersion",
    );
    expect(source).toContain(
      "token_count_source: reservationObservation.tokenSource",
    );
    expect(source).toContain(
      "latency_source: reservationObservation.latencySource",
    );
    expect(source).toContain(
      "normalizePersistedAiCallLogReservationObservation(existingLogs[0])",
    );
    expect(
      source.match(/createTerminalAiCallObservationCondition\(\),/gu),
    ).toHaveLength(3);
  });

  it("accepts only exact current-unavailable reservation observations", () => {
    expect(
      normalizePersistedAiCallLogReservationObservation(
        createPersistedObservation(),
      ),
    ).toMatchObject({
      schemaVersion: 1,
      tokenSource: "unavailable",
      latencySource: "unavailable",
    });

    for (const invalid of [
      createPersistedObservation({ observationSchemaVersion: null }),
      createPersistedObservation({
        latencySource: "client_observed",
        latencyMs: 1,
      }),
      createPersistedObservation({ estimatedCostCny: "0.000001" }),
      createPersistedObservation({
        tokenSource: "provider_reported",
        promptTokenCount: 1,
        completionTokenCount: 2,
        totalTokenCount: 3,
      }),
    ]) {
      expect(() =>
        normalizePersistedAiCallLogReservationObservation(invalid),
      ).toThrow("AI call observation is invalid.");
    }
  });

  it("writes the exact current-unavailable observation when reserving a new log", async () => {
    let selectCallCount = 0;
    let insertedValue: Record<string, unknown> | null = null;
    const transactionDatabase = {
      select: () => {
        selectCallCount += 1;
        return selectCallCount === 1
          ? {
              from: () => ({
                where: () => ({
                  for: () => ({
                    limit: async () => [
                      {
                        id: 701,
                        aiCallLogId: null,
                        aiCallLogPublicId: null,
                      },
                    ],
                  }),
                }),
              }),
            }
          : {
              from: () => ({
                innerJoin: () => ({
                  where: () => ({
                    limit: async () => [
                      { modelConfigId: 801, promptTemplateId: 901 },
                    ],
                  }),
                }),
              }),
            };
      },
      insert: () => ({
        values: (value: Record<string, unknown>) => {
          insertedValue = value;
          return {
            onConflictDoNothing: () => ({
              returning: async () => [{ id: 1_001 }],
            }),
          };
        },
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: async () => [{ publicId: taskPublicId }],
          }),
        }),
      }),
    };
    const database = {
      transaction: async (callback: (transaction: unknown) => unknown) =>
        callback(transactionDatabase),
    } as unknown as RuntimeDatabase;
    const repository = createPostgresAiGenerationTaskLifecycleRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.reserveAiCallLog?.(createReservationInput()),
    ).resolves.toEqual({ publicId: "ai-call-log-generation-reservation-001" });
    expect(insertedValue).toMatchObject({
      prompt_token_count: null,
      completion_token_count: null,
      total_token_count: null,
      estimated_cost_cny: null,
      latency_ms: null,
      observation_schema_version: 1,
      token_count_source: "unavailable",
      token_estimation_method: null,
      latency_source: "unavailable",
    });
  });

  it("replays only an exact current-unavailable bound reservation and rejects legacy or partial rows", async () => {
    const rows = [
      createPersistedObservation(),
      createPersistedObservation({
        observationSchemaVersion: null,
        tokenSource: null,
        latencySource: null,
      }),
      createPersistedObservation({ tokenSource: null }),
    ];

    for (const [index, observation] of rows.entries()) {
      let selectCallCount = 0;
      const insert = vi.fn();
      const transactionDatabase = {
        select: () => {
          selectCallCount += 1;
          return {
            from: () => ({
              where: () =>
                selectCallCount === 1
                  ? {
                      for: () => ({
                        limit: async () => [
                          {
                            id: 701,
                            aiCallLogId: 1_001,
                            aiCallLogPublicId:
                              "ai-call-log-generation-reservation-001",
                          },
                        ],
                      }),
                    }
                  : {
                      limit: async () => [{ id: 1_001, ...observation }],
                    },
            }),
          };
        },
        insert,
      };
      const database = {
        transaction: async (callback: (transaction: unknown) => unknown) =>
          callback(transactionDatabase),
      } as unknown as RuntimeDatabase;
      const repository = createPostgresAiGenerationTaskLifecycleRepository({
        createDatabase: () => database,
      });
      const replay = repository.reserveAiCallLog?.(createReservationInput());

      if (index === 0) {
        await expect(replay).resolves.toEqual({
          publicId: "ai-call-log-generation-reservation-001",
        });
      } else {
        await expect(replay).rejects.toThrow("AI call observation is invalid.");
      }
      expect(insert).not.toHaveBeenCalled();
    }
  });

  it("keeps legacy terminal observations distinct and only accepts measured current success", () => {
    expect(
      normalizePersistedAiCallLogObservation(
        createPersistedObservation({
          observationSchemaVersion: null,
          tokenSource: null,
          latencySource: null,
        }),
      ),
    ).toEqual({ kind: "legacy", observation: null });

    const providerReported = createPersistedObservation({
      tokenSource: "provider_reported",
      promptTokenCount: 10,
      completionTokenCount: 20,
      totalTokenCount: 30,
      latencySource: "client_observed",
      latencyMs: 50,
    });
    const estimated = createPersistedObservation({
      tokenSource: "estimated",
      tokenEstimationMethod: "canonical_json_unicode_code_point_ceiling_v1",
      promptTokenCount: 12,
      completionTokenCount: 18,
      totalTokenCount: 30,
      latencySource: "provider_reported",
      latencyMs: 40,
    });
    expect(
      normalizePersistedCurrentMeasuredAiCallObservation(providerReported),
    ).toMatchObject({ tokenSource: "provider_reported", totalTokenCount: 30 });
    expect(
      normalizePersistedCurrentMeasuredAiCallObservation(estimated),
    ).toMatchObject({ tokenSource: "estimated", totalTokenCount: 30 });

    for (const invalid of [
      createPersistedObservation(),
      createPersistedObservation({
        observationSchemaVersion: null,
        tokenSource: null,
        latencySource: null,
      }),
      createPersistedObservation({ tokenSource: "provider_reported" }),
      createPersistedObservation({
        tokenSource: "provider_reported",
        promptTokenCount: 10,
        completionTokenCount: 20,
        totalTokenCount: 31,
        latencySource: "client_observed",
        latencyMs: 50,
      }),
    ]) {
      expect(() =>
        normalizePersistedCurrentMeasuredAiCallObservation(invalid),
      ).toThrow("AI call observation is invalid.");
    }
  });

  it("claims pending work before execution with database-returned attempt identity", async () => {
    const { gateway } = createGateway(createRow());
    const repository = createAiGenerationTaskLifecycleRepository(gateway);

    const result = await repository.claimTask({ ...scope, claimedAt });

    expect(result).toEqual({
      disposition: "claimed",
      attempt: {
        taskPublicId,
        retryCount: 0,
        startedAt: claimedAt,
      },
      task: expect.objectContaining({
        taskStatus: "running",
        canCancel: true,
        canRetry: false,
      }),
    });
  });

  it("fails closed when pending work carries a non-initial retry count", async () => {
    const { gateway } = createGateway(createRow({ retryCount: 1 }));
    const repository = createAiGenerationTaskLifecycleRepository(gateway);

    const result = await repository.claimTask({ ...scope, claimedAt });

    expect(result).toMatchObject({
      disposition: "not_claimed",
      attempt: null,
      task: { taskStatus: "pending", retryCount: 1 },
    });
    expect(gateway.claimAttempt).not.toHaveBeenCalled();
  });

  it("allows exactly two retry claims for retryable failures", async () => {
    for (const retryCount of [0, 1]) {
      const { gateway } = createGateway(
        createRow({
          taskStatus: "failed",
          retryCount,
          failureCategory: "provider_temporary_error",
          startedAt,
          finishedAt: new Date(startedAt.getTime() + 1_000),
        }),
      );
      const result = await createAiGenerationTaskLifecycleRepository(
        gateway,
      ).claimTask({ ...scope, claimedAt });

      expect(result.disposition).toBe("claimed");
      expect(result.task?.retryCount).toBe(retryCount + 1);
    }

    const { gateway } = createGateway(
      createRow({
        taskStatus: "failed",
        retryCount: AI_GENERATION_TASK_MAX_RETRY_COUNT,
        failureCategory: "network_error",
        startedAt,
        finishedAt: claimedAt,
      }),
    );
    const exhausted = await createAiGenerationTaskLifecycleRepository(
      gateway,
    ).claimTask({ ...scope, claimedAt });

    expect(exhausted).toMatchObject({
      disposition: "not_claimed",
      task: { canRetry: false, retryCount: 2 },
    });
    expect(gateway.claimAttempt).not.toHaveBeenCalled();
  });

  it("does not claim active running terminal or non-retryable failed work", async () => {
    const rows = [
      createRow({ taskStatus: "running", startedAt: claimedAt }),
      createRow({ taskStatus: "succeeded", resultPublicId: "result_001" }),
      createRow({ taskStatus: "cancelled" }),
      createRow({
        taskStatus: "failed",
        failureCategory: "authorization_invalid",
        startedAt,
      }),
    ];

    for (const row of rows) {
      const { gateway } = createGateway(row);
      const result = await createAiGenerationTaskLifecycleRepository(
        gateway,
      ).claimTask({ ...scope, claimedAt });

      expect(result.disposition).toBe("not_claimed");
      expect(gateway.claimAttempt).not.toHaveBeenCalled();
    }
  });

  it("claims running work only at the five-minute stale boundary and has provider timeout safety margin", async () => {
    expect(AI_GENERATION_TASK_STALE_AFTER_MS).toBe(300_000);
    expect(qwenRouteIntegratedProviderLimits.timeoutMs).toBe(60_000);
    expect(qwenRouteIntegratedProviderLimits.timeoutMs).toBeLessThan(
      AI_GENERATION_TASK_STALE_AFTER_MS,
    );

    const activeStartedAt = new Date(claimedAt.getTime() - 299_999);
    const activeGateway = createGateway(
      createRow({ taskStatus: "running", startedAt: activeStartedAt }),
    ).gateway;
    const activeResult = await createAiGenerationTaskLifecycleRepository(
      activeGateway,
    ).claimTask({ ...scope, claimedAt });
    expect(activeResult.disposition).toBe("not_claimed");

    const staleStartedAt = new Date(
      claimedAt.getTime() - AI_GENERATION_TASK_STALE_AFTER_MS,
    );
    const staleGateway = createGateway(
      createRow({ taskStatus: "running", startedAt: staleStartedAt }),
    ).gateway;
    const staleResult = await createAiGenerationTaskLifecycleRepository(
      staleGateway,
    ).claimTask({ ...scope, claimedAt });
    expect(staleResult).toMatchObject({
      disposition: "claimed",
      attempt: { retryCount: 1, startedAt: claimedAt },
    });
  });

  it("has a single CAS winner for concurrent stale claims", async () => {
    const { gateway } = createGateway(
      createRow({ taskStatus: "running", startedAt }),
    );
    const repository = createAiGenerationTaskLifecycleRepository(gateway);

    const results = await Promise.all([
      repository.claimTask({ ...scope, claimedAt }),
      repository.claimTask({ ...scope, claimedAt }),
    ]);

    expect(
      results.filter((result) => result.disposition === "claimed"),
    ).toHaveLength(1);
  });

  it("rejects late failure after cancellation or a newer retry attempt", async () => {
    const cancelledGateway = createGateway(
      createRow({ taskStatus: "cancelled", startedAt, finishedAt: claimedAt }),
    ).gateway;
    const cancelledResult = await createAiGenerationTaskLifecycleRepository(
      cancelledGateway,
    ).failTask({
      ...scope,
      attempt: { taskPublicId, retryCount: 0, startedAt },
      failureCategory: "system_error",
      finishedAt: claimedAt,
    });
    expect(cancelledResult.disposition).toBe("attempt_lost");

    const retryGateway = createGateway(
      createRow({ taskStatus: "running", retryCount: 1, startedAt: claimedAt }),
    ).gateway;
    const staleResult = await createAiGenerationTaskLifecycleRepository(
      retryGateway,
    ).failTask({
      ...scope,
      attempt: { taskPublicId, retryCount: 0, startedAt },
      failureCategory: "network_error",
      finishedAt: claimedAt,
    });
    expect(staleResult.disposition).toBe("attempt_lost");
  });

  it("attaches the exact attempt ai_call_log through the running-attempt failure CAS", async () => {
    const { gateway } = createGateway(
      createRow({ taskStatus: "running", startedAt }),
    );
    const result = await createAiGenerationTaskLifecycleRepository(
      gateway,
    ).failTask({
      ...scope,
      attempt: { taskPublicId, retryCount: 0, startedAt },
      failureCategory: "provider_temporary_error",
      aiCallLogPublicId: "ai-call-log-generation-failed-001",
      finishedAt: claimedAt,
    });

    expect(result).toMatchObject({
      disposition: "failed",
      task: {
        taskStatus: "failed",
        aiCallLogPublicId: "ai-call-log-generation-failed-001",
      },
    });
    expect(gateway.failAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        aiCallLogPublicId: "ai-call-log-generation-failed-001",
      }),
    );
  });

  it("cancels only pending or running work and projects a terminal safe state", async () => {
    const { gateway } = createGateway(
      createRow({ taskStatus: "running", startedAt }),
    );
    const result = await createAiGenerationTaskLifecycleRepository(
      gateway,
    ).cancelTask({ ...scope, finishedAt: claimedAt });

    expect(result).toMatchObject({
      disposition: "cancelled",
      task: {
        taskStatus: "cancelled",
        canCancel: false,
        canRetry: false,
        failureCategory: null,
      },
    });
  });
});
