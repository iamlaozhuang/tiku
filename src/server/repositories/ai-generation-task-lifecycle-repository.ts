import {
  aiCallLog,
  aiGenerationTask,
  modelConfig,
  promptTemplate,
} from "@/db/schema";
import { and, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";

import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import { isRetryableAiGenerationTaskFailureCategory } from "../models/ai-generation-task";
import type { AiGenerationTaskRequestOwnerType } from "../models/ai-generation-task-request";
import type { AppendAiCallLogInput } from "./admin-ai-audit-log-runtime-repository";
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
  aiCallLogPublicId?: string | null;
};

export type AiGenerationTaskLifecycleProjection = Omit<
  AiGenerationTaskLifecycleRow,
  "aiCallLogPublicId"
> & {
  aiCallLogPublicId?: string | null;
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
  aiCallLogPublicId?: string | null;
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
  reserveAiCallLog?(input: {
    scope: AiGenerationTaskLifecycleScope;
    attempt: AiGenerationTaskAttemptIdentity;
    promptTemplateHash: string;
    log: Omit<AppendAiCallLogInput, "aiFuncType" | "callStatus"> & {
      aiFuncType: "ai_question_generation" | "ai_paper_generation";
      callStatus: "running";
      publicId: string;
    };
  }): Promise<{ publicId: string }>;
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
  aiCallLogPublicId: aiGenerationTask.ai_call_log_public_id,
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

  const lifecycleRepository = createAiGenerationTaskLifecycleRepository({
    async findTask(scope) {
      const [row] = await getDatabase()
        .select(lifecycleSelection)
        .from(aiGenerationTask)
        .where(createLifecycleScopeCondition(scope))
        .limit(1);

      return normalizeLifecycleRow(row);
    },
    async claimAttempt(input) {
      return getDatabase().transaction(async (transaction) => {
        if (input.expectedStatus === "running") {
          const staleTasks = await transaction
            .select({
              aiCallLogId: aiGenerationTask.ai_call_log_id,
              aiCallLogPublicId: aiGenerationTask.ai_call_log_public_id,
            })
            .from(aiGenerationTask)
            .where(
              and(
                createLifecycleScopeCondition(input),
                eq(aiGenerationTask.task_status, "running"),
                eq(aiGenerationTask.retry_count, input.expectedRetryCount),
                createNullableStartedAtCondition(input.expectedStartedAt),
              ),
            )
            .for("update")
            .limit(2);

          if (staleTasks.length !== 1) {
            return null;
          }
          const staleTask = staleTasks[0];

          if (
            staleTask.aiCallLogId === null ||
            staleTask.aiCallLogPublicId === null
          ) {
            if (
              staleTask.aiCallLogId !== null ||
              staleTask.aiCallLogPublicId !== null
            ) {
              throw new Error(
                "stale AI generation log binding is inconsistent",
              );
            }
          } else {
            const finalizedLogs = await transaction
              .update(aiCallLog)
              .set({
                call_status: "failed",
                error_redacted_snapshot: {
                  failureCategory: "running_timeout",
                  redactionStatus: "redacted",
                },
                completed_at: input.claimedAt,
              })
              .where(
                and(
                  eq(aiCallLog.id, staleTask.aiCallLogId),
                  eq(aiCallLog.public_id, staleTask.aiCallLogPublicId),
                  sql`${aiCallLog.call_status} = 'running'::ai_call_status`,
                ),
              )
              .returning({ id: aiCallLog.id });

            if (finalizedLogs.length !== 1) {
              throw new Error("stale AI generation log finalization was lost");
            }
          }
        }

        const rows = await transaction
          .update(aiGenerationTask)
          .set({
            task_status: "running",
            retry_count: input.nextRetryCount,
            failure_category: null,
            ai_call_log_id: null,
            ai_call_log_public_id: null,
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

        return rows.length === 1 ? normalizeLifecycleRow(rows[0]) : null;
      });
    },
    async failAttempt(input) {
      return getDatabase().transaction(async (transaction) => {
        const tasks = await transaction
          .select({
            aiCallLogId: aiGenerationTask.ai_call_log_id,
            aiCallLogPublicId: aiGenerationTask.ai_call_log_public_id,
          })
          .from(aiGenerationTask)
          .where(
            and(
              createLifecycleScopeCondition(input),
              createRunningAttemptCondition(input.attempt),
            ),
          )
          .for("update")
          .limit(2);

        if (tasks.length !== 1) {
          return null;
        }
        const task = tasks[0];
        const requestedLogPublicId = input.aiCallLogPublicId ?? null;

        if (requestedLogPublicId === null) {
          if (task.aiCallLogId !== null || task.aiCallLogPublicId !== null) {
            throw new Error(
              "AI generation failure omitted the bound log identity",
            );
          }
        } else {
          if (
            task.aiCallLogId === null ||
            task.aiCallLogPublicId !== requestedLogPublicId
          ) {
            throw new Error("AI generation failure log identity drifted");
          }
          const finalizedLogs = await transaction
            .update(aiCallLog)
            .set({
              call_status: "failed",
              error_redacted_snapshot: {
                failureCategory: input.failureCategory,
                redactionStatus: "redacted",
              },
              completed_at: input.finishedAt,
            })
            .where(
              and(
                eq(aiCallLog.id, task.aiCallLogId),
                eq(aiCallLog.public_id, requestedLogPublicId),
                sql`${aiCallLog.call_status} = 'running'::ai_call_status`,
              ),
            )
            .returning({ id: aiCallLog.id });

          if (finalizedLogs.length !== 1) {
            throw new Error("AI generation failure log finalization was lost");
          }
        }

        const rows = await transaction
          .update(aiGenerationTask)
          .set({
            task_status: "failed",
            failure_category: input.failureCategory,
            ai_call_log_public_id: requestedLogPublicId,
            finished_at: input.finishedAt,
            updated_at: input.finishedAt,
          })
          .where(
            and(
              createLifecycleScopeCondition(input),
              createRunningAttemptCondition(input.attempt),
              createNullableAiCallLogIdCondition(task.aiCallLogId),
              requestedLogPublicId === null
                ? isNull(aiGenerationTask.ai_call_log_public_id)
                : eq(
                    aiGenerationTask.ai_call_log_public_id,
                    requestedLogPublicId,
                  ),
            ),
          )
          .returning(lifecycleSelection);

        if (rows.length !== 1) {
          throw new Error("AI generation failure task CAS was lost");
        }
        return normalizeLifecycleRow(rows[0]);
      });
    },
    async cancelTask(input) {
      return getDatabase().transaction(async (transaction) => {
        const tasks = await transaction
          .select({
            taskStatus: aiGenerationTask.task_status,
            aiCallLogId: aiGenerationTask.ai_call_log_id,
            aiCallLogPublicId: aiGenerationTask.ai_call_log_public_id,
          })
          .from(aiGenerationTask)
          .where(
            and(
              createLifecycleScopeCondition(input),
              inArray(aiGenerationTask.task_status, [
                ...input.expectedStatuses,
              ]),
            ),
          )
          .for("update")
          .limit(2);

        if (tasks.length !== 1) {
          return null;
        }
        const task = tasks[0];

        if (task.aiCallLogId !== null || task.aiCallLogPublicId !== null) {
          if (
            task.taskStatus !== "running" ||
            task.aiCallLogId === null ||
            task.aiCallLogPublicId === null
          ) {
            throw new Error(
              "AI generation cancellation log binding is inconsistent",
            );
          }
          const finalizedLogs = await transaction
            .update(aiCallLog)
            .set({
              call_status: "failed",
              error_redacted_snapshot: {
                failureCategory: "cancelled_by_owner",
                redactionStatus: "redacted",
              },
              completed_at: input.finishedAt,
            })
            .where(
              and(
                eq(aiCallLog.id, task.aiCallLogId),
                eq(aiCallLog.public_id, task.aiCallLogPublicId),
                sql`${aiCallLog.call_status} = 'running'::ai_call_status`,
              ),
            )
            .returning({ id: aiCallLog.id });

          if (finalizedLogs.length !== 1) {
            throw new Error(
              "AI generation cancellation log finalization was lost",
            );
          }
        }

        const rows = await transaction
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
              eq(aiGenerationTask.task_status, task.taskStatus),
              task.aiCallLogId === null
                ? isNull(aiGenerationTask.ai_call_log_id)
                : eq(aiGenerationTask.ai_call_log_id, task.aiCallLogId),
              task.aiCallLogPublicId === null
                ? isNull(aiGenerationTask.ai_call_log_public_id)
                : eq(
                    aiGenerationTask.ai_call_log_public_id,
                    task.aiCallLogPublicId,
                  ),
            ),
          )
          .returning(lifecycleSelection);

        if (rows.length !== 1) {
          throw new Error("AI generation cancellation task CAS was lost");
        }
        return normalizeLifecycleRow(rows[0]);
      });
    },
  });

  return {
    ...lifecycleRepository,
    async reserveAiCallLog(input) {
      return getDatabase().transaction(async (transaction) => {
        const [taskRow] = await transaction
          .select({
            id: aiGenerationTask.id,
            aiCallLogId: aiGenerationTask.ai_call_log_id,
            aiCallLogPublicId: aiGenerationTask.ai_call_log_public_id,
          })
          .from(aiGenerationTask)
          .where(
            and(
              createLifecycleScopeCondition(input.scope),
              createRunningAttemptCondition(input.attempt),
            ),
          )
          .for("update")
          .limit(1);

        if (taskRow === undefined) {
          throw new Error("AI generation log reservation attempt was lost.");
        }

        if (
          taskRow.aiCallLogId !== null ||
          taskRow.aiCallLogPublicId !== null
        ) {
          if (
            taskRow.aiCallLogId === null ||
            taskRow.aiCallLogPublicId !== input.log.publicId
          ) {
            throw new Error("AI generation attempt already has another log.");
          }
          const boundAiCallLogId = taskRow.aiCallLogId;

          const existingLogs = await transaction
            .select({ id: aiCallLog.id })
            .from(aiCallLog)
            .where(
              and(
                eq(aiCallLog.id, boundAiCallLogId),
                eq(aiCallLog.public_id, input.log.publicId),
                sql`${aiCallLog.call_status} = 'running'::ai_call_status`,
              ),
            )
            .limit(2);

          if (existingLogs.length !== 1) {
            throw new Error(
              "AI generation attempt log replay is inconsistent.",
            );
          }

          return { publicId: input.log.publicId };
        }

        const governanceRows = await transaction
          .select({
            modelConfigId: modelConfig.id,
            promptTemplateId: promptTemplate.id,
          })
          .from(modelConfig)
          .innerJoin(
            promptTemplate,
            and(
              eq(
                promptTemplate.prompt_template_key,
                input.log.promptTemplateKey,
              ),
              eq(promptTemplate.version, input.log.promptTemplateVersion),
              eq(promptTemplate.ai_func_type, input.log.aiFuncType),
              eq(promptTemplate.template_hash, input.promptTemplateHash),
              eq(promptTemplate.is_active, true),
              eq(promptTemplate.status, "active"),
            ),
          )
          .where(
            and(
              eq(
                modelConfig.public_id,
                input.log.modelConfigSnapshot.modelConfigPublicId,
              ),
              eq(modelConfig.ai_func_type, input.log.aiFuncType),
              eq(modelConfig.is_enabled, true),
              eq(modelConfig.status, "enabled"),
            ),
          )
          .limit(2);

        if (governanceRows.length !== 1) {
          throw new Error("AI generation governance selection is unavailable.");
        }
        const governanceRow = governanceRows[0];

        const insertedLogs = await transaction
          .insert(aiCallLog)
          .values({
            public_id: input.log.publicId,
            user_public_id: input.log.userPublicId,
            organization_public_id: input.log.organizationPublicId ?? null,
            profession: input.log.profession ?? null,
            level: input.log.level ?? null,
            answer_record_public_id: input.log.answerRecordPublicId,
            mock_exam_public_id: input.log.mockExamPublicId,
            question_public_id: input.log.questionPublicId,
            ai_func_type: input.log.aiFuncType,
            call_status: sql`'running'::ai_call_status`,
            model_config_id: governanceRow.modelConfigId,
            prompt_template_id: governanceRow.promptTemplateId,
            model_config_snapshot: input.log.modelConfigSnapshot,
            prompt_template_key: input.log.promptTemplateKey,
            prompt_template_version: input.log.promptTemplateVersion,
            request_redacted_snapshot: input.log.requestRedactedSnapshot,
            response_redacted_snapshot: null,
            error_redacted_snapshot: null,
            citation_redacted_snapshot: input.log.citationRedactedSnapshot,
            prompt_token_count: null,
            completion_token_count: null,
            total_token_count: null,
            estimated_cost_cny: null,
            latency_ms: null,
            started_at: input.log.startedAt,
            completed_at: null,
          })
          .onConflictDoNothing({ target: aiCallLog.public_id })
          .returning({ id: aiCallLog.id });

        if (insertedLogs.length !== 1) {
          throw new Error("AI generation log identity already exists.");
        }
        const insertedLog = insertedLogs[0];

        const attachedTasks = await transaction
          .update(aiGenerationTask)
          .set({
            ai_call_log_id: insertedLog.id,
            ai_call_log_public_id: input.log.publicId,
            updated_at: input.log.startedAt,
          })
          .where(
            and(
              createLifecycleScopeCondition(input.scope),
              createRunningAttemptCondition(input.attempt),
              isNull(aiGenerationTask.ai_call_log_id),
              isNull(aiGenerationTask.ai_call_log_public_id),
            ),
          )
          .returning({ publicId: aiGenerationTask.public_id });

        if (attachedTasks.length !== 1) {
          throw new Error("AI generation log attachment was lost.");
        }

        return { publicId: input.log.publicId };
      });
    },
  };
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
    aiCallLogPublicId: row.aiCallLogPublicId ?? null,
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

function createNullableAiCallLogIdCondition(aiCallLogId: number | null): SQL {
  return aiCallLogId === null
    ? (isNull(aiGenerationTask.ai_call_log_id) as SQL)
    : (eq(aiGenerationTask.ai_call_log_id, aiCallLogId) as SQL);
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
        aiCallLogPublicId: string | null;
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
