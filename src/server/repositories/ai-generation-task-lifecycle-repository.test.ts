import { describe, expect, it, vi } from "vitest";

import { qwenRouteIntegratedProviderLimits } from "../services/route-integrated-provider-execution-service";
import {
  AI_GENERATION_TASK_MAX_RETRY_COUNT,
  AI_GENERATION_TASK_STALE_AFTER_MS,
  createAiGenerationTaskLifecycleRepository,
  type AiGenerationTaskLifecycleGateway,
  type AiGenerationTaskLifecycleRow,
} from "./ai-generation-task-lifecycle-repository";

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

describe("AI generation task lifecycle repository", () => {
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
