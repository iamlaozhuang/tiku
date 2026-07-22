import { aiGenerationTask } from "@/db/schema";
import { and, eq, inArray, isNull, type SQL } from "drizzle-orm";

import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import { isRetryableAiGenerationTaskFailureCategory } from "../models/ai-generation-task";
import type { AiGenerationTaskRequestOwnerType } from "../models/ai-generation-task-request";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export const AI_GENERATION_TASK_STALE_AFTER_MS = 300_000;
export const AI_GENERATION_TASK_MAX_RETRY_COUNT = 2;

export type AiGenerationTaskAttemptIdentity = {
  taskPublicId: string;
  retryCount: number;
  startedAt: Date;
};

export type AiGenerationTaskLifecycleRow = {
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskStatus: AiGenerationTaskStatus;
  retryCount: number;
  failureCategory: AiGenerationTaskFailureCategory | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  resultPublicId: string | null;
};

export type AiGenerationTaskLifecycleProjection =
  AiGenerationTaskLifecycleRow & {
    canCancel: boolean;
    canRetry: boolean;
  };

export type AiGenerationTaskLifecycleScope = {
  taskPublicId: string;
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskTypes: readonly AiGenerationTaskType[];
};

type ClaimAttemptInput = AiGenerationTaskLifecycleScope & {
  expectedStatus: "pending" | "running" | "failed";
  expectedRetryCount: number;
  expectedStartedAt: Date | null;
  nextRetryCount: number;
  claimedAt: Date;
};

type FailAttemptInput = AiGenerationTaskLifecycleScope & {
  attempt: AiGenerationTaskAttemptIdentity;
  failureCategory: AiGenerationTaskFailureCategory;
  finishedAt: Date;
};

type CancelTaskInput = AiGenerationTaskLifecycleScope & {
  expectedStatuses: readonly ("pending" | "running")[];
  finishedAt: Date;
};

export type AiGenerationTaskLifecycleGateway = {
  findTask(
    scope: AiGenerationTaskLifecycleScope,
  ): Promise<AiGenerationTaskLifecycleRow | null>;
  claimAttempt(
    input: ClaimAttemptInput,
  ): Promise<AiGenerationTaskLifecycleRow | null>;
  failAttempt(
    input: FailAttemptInput,
  ): Promise<AiGenerationTaskLifecycleRow | null>;
  cancelTask(
    input: CancelTaskInput,
  ): Promise<AiGenerationTaskLifecycleRow | null>;
};

export type AiGenerationTaskClaimResult = {
  disposition: "claimed" | "not_claimed";
  attempt: AiGenerationTaskAttemptIdentity | null;
  task: AiGenerationTaskLifecycleProjection | null;
};

export type AiGenerationTaskFailureResult = {
  disposition: "failed" | "attempt_lost";
  task: AiGenerationTaskLifecycleProjection | null;
};

export type AiGenerationTaskCancellationResult = {
  disposition: "cancelled" | "not_cancelled";
  task: AiGenerationTaskLifecycleProjection | null;
};

export type AiGenerationTaskLifecycleRepository = {
  claimTask(
    input: AiGenerationTaskLifecycleScope & { claimedAt: Date },
  ): Promise<AiGenerationTaskClaimResult>;
  failTask(input: FailAttemptInput): Promise<AiGenerationTaskFailureResult>;
  cancelTask(
    input: AiGenerationTaskLifecycleScope & { finishedAt: Date },
  ): Promise<AiGenerationTaskCancellationResult>;
};

type ClaimPlan = Pick<
  ClaimAttemptInput,
  | "expectedStatus"
  | "expectedRetryCount"
  | "expectedStartedAt"
  | "nextRetryCount"
>;

const lifecycleSelection = {
  taskPublicId: aiGenerationTask.public_id,
  taskType: aiGenerationTask.task_type,
  ownerType: aiGenerationTask.owner_type,
  ownerPublicId: aiGenerationTask.owner_public_id,
  organizationPublicId: aiGenerationTask.organization_public_id,
  taskStatus: aiGenerationTask.task_status,
  retryCount: aiGenerationTask.retry_count,
  failureCategory: aiGenerationTask.failure_category,
  startedAt: aiGenerationTask.started_at,
  finishedAt: aiGenerationTask.finished_at,
  resultPublicId: aiGenerationTask.result_public_id,
};

export function createAiGenerationTaskLifecycleRepository(
  gateway: AiGenerationTaskLifecycleGateway,
): AiGenerationTaskLifecycleRepository {
  return {
    async claimTask(input) {
      const currentRow = await gateway.findTask(input);
      const claimPlan = resolveClaimPlan(currentRow, input.claimedAt);

      if (currentRow === null || claimPlan === null) {
        return {
          disposition: "not_claimed",
          attempt: null,
          task:
            currentRow === null
              ? null
              : createAiGenerationTaskLifecycleProjection(
                  currentRow,
                  input.claimedAt,
                ),
        };
      }

      const claimedRow = await gateway.claimAttempt({
        ...input,
        ...claimPlan,
      });

      if (claimedRow === null || claimedRow.startedAt === null) {
        const latestRow = await gateway.findTask(input);

        return {
          disposition: "not_claimed",
          attempt: null,
          task:
            latestRow === null
              ? null
              : createAiGenerationTaskLifecycleProjection(
                  latestRow,
                  input.claimedAt,
                ),
        };
      }

      return {
        disposition: "claimed",
        attempt: {
          taskPublicId: claimedRow.taskPublicId,
          retryCount: claimedRow.retryCount,
          startedAt: claimedRow.startedAt,
        },
        task: createAiGenerationTaskLifecycleProjection(
          claimedRow,
          input.claimedAt,
        ),
      };
    },
    async failTask(input) {
      const failedRow = await gateway.failAttempt(input);

      if (failedRow === null) {
        const latestRow = await gateway.findTask(input);

        return {
          disposition: "attempt_lost",
          task:
            latestRow === null
              ? null
              : createAiGenerationTaskLifecycleProjection(
                  latestRow,
                  input.finishedAt,
                ),
        };
      }

      return {
        disposition: "failed",
        task: createAiGenerationTaskLifecycleProjection(
          failedRow,
          input.finishedAt,
        ),
      };
    },
    async cancelTask(input) {
      const currentRow = await gateway.findTask(input);

      if (
        currentRow === null ||
        (currentRow.taskStatus !== "pending" &&
          currentRow.taskStatus !== "running")
      ) {
        return {
          disposition: "not_cancelled",
          task:
            currentRow === null
              ? null
              : createAiGenerationTaskLifecycleProjection(
                  currentRow,
                  input.finishedAt,
                ),
        };
      }

      const cancelledRow = await gateway.cancelTask({
        ...input,
        expectedStatuses: ["pending", "running"],
      });

      if (cancelledRow === null) {
        const latestRow = await gateway.findTask(input);

        return {
          disposition: "not_cancelled",
          task:
            latestRow === null
              ? null
              : createAiGenerationTaskLifecycleProjection(
                  latestRow,
                  input.finishedAt,
                ),
        };
      }

      return {
        disposition: "cancelled",
        task: createAiGenerationTaskLifecycleProjection(
          cancelledRow,
          input.finishedAt,
        ),
      };
    },
  };
}

export function createPostgresAiGenerationTaskLifecycleRepository(
  options: RuntimeDatabaseOptions = {},
): AiGenerationTaskLifecycleRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for AI generation task lifecycle persistence.",
  );

  return createAiGenerationTaskLifecycleRepository({
    async findTask(scope) {
      const [row] = await getDatabase()
        .select(lifecycleSelection)
        .from(aiGenerationTask)
        .where(createLifecycleScopeCondition(scope))
        .limit(1);

      return normalizeLifecycleRow(row);
    },
    async claimAttempt(input) {
      const [row] = await getDatabase()
        .update(aiGenerationTask)
        .set({
          task_status: "running",
          retry_count: input.nextRetryCount,
          failure_category: null,
          started_at: input.claimedAt,
          finished_at: null,
          updated_at: input.claimedAt,
        })
        .where(
          and(
            createLifecycleScopeCondition(input),
            eq(aiGenerationTask.task_status, input.expectedStatus),
            eq(aiGenerationTask.retry_count, input.expectedRetryCount),
            createNullableStartedAtCondition(input.expectedStartedAt),
          ),
        )
        .returning(lifecycleSelection);

      return normalizeLifecycleRow(row);
    },
    async failAttempt(input) {
      const [row] = await getDatabase()
        .update(aiGenerationTask)
        .set({
          task_status: "failed",
          failure_category: input.failureCategory,
          finished_at: input.finishedAt,
          updated_at: input.finishedAt,
        })
        .where(
          and(
            createLifecycleScopeCondition(input),
            eq(aiGenerationTask.task_status, "running"),
            eq(aiGenerationTask.retry_count, input.attempt.retryCount),
            eq(aiGenerationTask.started_at, input.attempt.startedAt),
          ),
        )
        .returning(lifecycleSelection);

      return normalizeLifecycleRow(row);
    },
    async cancelTask(input) {
      const [row] = await getDatabase()
        .update(aiGenerationTask)
        .set({
          task_status: "cancelled",
          failure_category: null,
          finished_at: input.finishedAt,
          updated_at: input.finishedAt,
        })
        .where(
          and(
            createLifecycleScopeCondition(input),
            inArray(aiGenerationTask.task_status, [...input.expectedStatuses]),
          ),
        )
        .returning(lifecycleSelection);

      return normalizeLifecycleRow(row);
    },
  });
}

export function createRunningAttemptCondition(input: {
  taskPublicId: string;
  retryCount: number;
  startedAt: Date;
}): SQL {
  return and(
    eq(aiGenerationTask.public_id, input.taskPublicId),
    eq(aiGenerationTask.task_status, "running"),
    eq(aiGenerationTask.retry_count, input.retryCount),
    eq(aiGenerationTask.started_at, input.startedAt),
  ) as SQL;
}

function resolveClaimPlan(
  row: AiGenerationTaskLifecycleRow | null,
  claimedAt: Date,
): ClaimPlan | null {
  if (row === null) {
    return null;
  }

  if (row.taskStatus === "pending" && row.retryCount === 0) {
    return {
      expectedStatus: "pending",
      expectedRetryCount: row.retryCount,
      expectedStartedAt: row.startedAt,
      nextRetryCount: row.retryCount,
    };
  }

  if (
    row.taskStatus === "failed" &&
    row.failureCategory !== null &&
    isRetryableAiGenerationTaskFailureCategory(row.failureCategory) &&
    row.retryCount < AI_GENERATION_TASK_MAX_RETRY_COUNT
  ) {
    return {
      expectedStatus: "failed",
      expectedRetryCount: row.retryCount,
      expectedStartedAt: row.startedAt,
      nextRetryCount: row.retryCount + 1,
    };
  }

  if (
    row.taskStatus === "running" &&
    row.startedAt !== null &&
    row.retryCount < AI_GENERATION_TASK_MAX_RETRY_COUNT &&
    claimedAt.getTime() - row.startedAt.getTime() >=
      AI_GENERATION_TASK_STALE_AFTER_MS
  ) {
    return {
      expectedStatus: "running",
      expectedRetryCount: row.retryCount,
      expectedStartedAt: row.startedAt,
      nextRetryCount: row.retryCount + 1,
    };
  }

  return null;
}

export function createAiGenerationTaskLifecycleProjection(
  row: AiGenerationTaskLifecycleRow,
  now: Date,
): AiGenerationTaskLifecycleProjection {
  return {
    ...row,
    canCancel: row.taskStatus === "pending" || row.taskStatus === "running",
    canRetry:
      resolveClaimPlan(row, now) !== null && row.taskStatus !== "pending",
  };
}

function createLifecycleScopeCondition(
  scope: AiGenerationTaskLifecycleScope,
): SQL {
  return and(
    eq(aiGenerationTask.public_id, scope.taskPublicId),
    eq(aiGenerationTask.owner_type, scope.ownerType),
    eq(aiGenerationTask.owner_public_id, scope.ownerPublicId),
    scope.organizationPublicId === null
      ? isNull(aiGenerationTask.organization_public_id)
      : eq(aiGenerationTask.organization_public_id, scope.organizationPublicId),
    inArray(aiGenerationTask.task_type, [...scope.taskTypes]),
  ) as SQL;
}

function createNullableStartedAtCondition(startedAt: Date | null): SQL {
  return startedAt === null
    ? (isNull(aiGenerationTask.started_at) as SQL)
    : (eq(aiGenerationTask.started_at, startedAt) as SQL);
}

function normalizeLifecycleRow(
  row:
    | {
        taskPublicId: string;
        taskType: AiGenerationTaskType;
        ownerType: string;
        ownerPublicId: string;
        organizationPublicId: string | null;
        taskStatus: AiGenerationTaskStatus;
        retryCount: number;
        failureCategory: AiGenerationTaskFailureCategory | null;
        startedAt: Date | null;
        finishedAt: Date | null;
        resultPublicId: string | null;
      }
    | undefined,
): AiGenerationTaskLifecycleRow | null {
  if (row === undefined) {
    return null;
  }

  if (
    row.ownerType !== "platform" &&
    row.ownerType !== "organization" &&
    row.ownerType !== "personal"
  ) {
    throw new Error("unsafe AI generation lifecycle owner type");
  }

  return {
    ...row,
    ownerType: row.ownerType,
  };
}
