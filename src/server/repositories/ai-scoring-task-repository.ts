import { createHash } from "node:crypto";

import { sql, type SQL } from "drizzle-orm";

import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type AiScoringTaskStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type AiScoringTaskRecord = {
  publicId: string;
  answerRecordPublicId: string;
  mockExamPublicId: string;
  actorPublicId: string;
  idempotencyKeyHash: string;
  taskStatus: AiScoringTaskStatus;
  attemptCount: number;
  maxAttemptCount: number;
  timeoutSecond: number;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  inputSnapshot: Record<string, unknown>;
  authorizationSnapshot: Record<string, unknown>;
  ragSnapshot: Record<string, unknown> | null;
  resultSnapshot: Record<string, unknown> | null;
  aiCallLogPublicId: string | null;
  failureCode: string | null;
  failureMessageDigest: string | null;
  scheduledAt: Date;
  claimedAt: Date | null;
  leaseExpiresAt: Date | null;
  workerPublicId: string | null;
  completedAt: Date | null;
};

export type EnqueueAiScoringTaskInput = {
  publicId: string;
  answerRecordPublicId: string;
  mockExamPublicId: string;
  actorPublicId: string;
  idempotencyKeyHash: string;
  maxAttemptCount: 3;
  timeoutSecond: 60;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  inputSnapshot: Record<string, unknown>;
  authorizationSnapshot: Record<string, unknown>;
  ragSnapshot: Record<string, unknown> | null;
  scheduledAt: Date;
};

export type ClaimNextAiScoringTaskInput = {
  workerPublicId: string;
  claimedAt: Date;
  leaseExpiresAt: Date;
};

export type RecoverExpiredAiScoringTasksInput = {
  recoveredAt: Date;
};

export type CompleteAiScoringTaskInput = {
  taskPublicId: string;
  workerPublicId: string;
  score: string;
  resultSnapshot: Record<string, unknown>;
  aiCallLogPublicId: string;
  completedAt: Date;
};

export type FailAiScoringTaskAttemptInput = {
  taskPublicId: string;
  workerPublicId: string;
  failureCode: string;
  failureMessageDigest: string;
  retryable: boolean;
  failedAt: Date;
  retryAfterAt: Date;
};

export type AiScoringTaskRepository = {
  enqueueAiScoringTask(
    input: EnqueueAiScoringTaskInput,
  ): Promise<AiScoringTaskRecord>;
  recoverExpiredAiScoringTasks(
    input: RecoverExpiredAiScoringTasksInput,
  ): Promise<number>;
  claimNextAiScoringTask(
    input: ClaimNextAiScoringTaskInput,
  ): Promise<AiScoringTaskRecord | null>;
  completeAiScoringTask(
    input: CompleteAiScoringTaskInput,
  ): Promise<AiScoringTaskRecord>;
  failAiScoringTaskAttempt(
    input: FailAiScoringTaskAttemptInput,
  ): Promise<AiScoringTaskRecord>;
};

type DrizzleSqlExecutor = {
  execute<TRow extends Record<string, unknown>>(query: SQL): Promise<TRow[]>;
};

type AiScoringTaskRow = {
  public_id: string;
  answer_record_public_id: string;
  mock_exam_public_id: string;
  actor_public_id: string;
  idempotency_key_hash: string;
  task_status: AiScoringTaskStatus;
  attempt_count: number;
  max_attempt_count: number;
  timeout_second: number;
  model_config_snapshot: Record<string, unknown>;
  prompt_template_key: string;
  prompt_template_version: number;
  prompt_template_hash: string;
  input_snapshot: Record<string, unknown>;
  authorization_snapshot: Record<string, unknown>;
  rag_snapshot: Record<string, unknown> | null;
  result_snapshot: Record<string, unknown> | null;
  ai_call_log_public_id: string | null;
  failure_code: string | null;
  failure_message_digest: string | null;
  scheduled_at: Date | string;
  claimed_at: Date | string | null;
  lease_expires_at: Date | string | null;
  worker_public_id: string | null;
  completed_at: Date | string | null;
};

const scoringTaskSelection = sql`
  select
    task.public_id,
    answer_record.public_id as answer_record_public_id,
    task.mock_exam_public_id,
    task.actor_public_id,
    task.idempotency_key_hash,
    task.task_status,
    task.attempt_count,
    task.max_attempt_count,
    task.timeout_second,
    task.model_config_snapshot,
    task.prompt_template_key,
    task.prompt_template_version,
    task.prompt_template_hash,
    task.input_snapshot,
    task.authorization_snapshot,
    task.rag_snapshot,
    task.result_snapshot,
    ai_call_log.public_id as ai_call_log_public_id,
    task.failure_code,
    task.failure_message_digest,
    task.scheduled_at,
    task.claimed_at,
    task.lease_expires_at,
    task.worker_public_id,
    task.completed_at
  from selected_task task
  join answer_record on answer_record.id = task.answer_record_id
  left join ai_call_log on ai_call_log.id = task.ai_call_log_id
`;

export function createPostgresAiScoringTaskRepository(
  options: RuntimeDatabaseOptions = {},
): AiScoringTaskRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for durable AI scoring task runtime.",
  );

  return {
    async enqueueAiScoringTask(input) {
      const rows = await executeSql<AiScoringTaskRow>(
        getDatabase(),
        sql`
          with answer_record_link as (
            select answer_record.id
            from answer_record
            join mock_exam on mock_exam.id = answer_record.mock_exam_id
            join user_account on user_account.id = answer_record.user_id
            where answer_record.public_id = ${input.answerRecordPublicId}
              and answer_record.exam_mode = 'mock_exam'::exam_mode
              and mock_exam.public_id = ${input.mockExamPublicId}
              and user_account.public_id = ${input.actorPublicId}
            limit 1
          ),
          inserted_task as (
            insert into ai_scoring_task (
              public_id,
              answer_record_id,
              mock_exam_public_id,
              actor_public_id,
              idempotency_key_hash,
              task_status,
              attempt_count,
              max_attempt_count,
              timeout_second,
              model_config_snapshot,
              prompt_template_key,
              prompt_template_version,
              prompt_template_hash,
              input_snapshot,
              authorization_snapshot,
              rag_snapshot,
              scheduled_at,
              created_at,
              updated_at
            )
            select
              ${input.publicId},
              answer_record_link.id,
              ${input.mockExamPublicId},
              ${input.actorPublicId},
              ${input.idempotencyKeyHash},
              'pending'::ai_scoring_task_status,
              0,
              ${input.maxAttemptCount},
              ${input.timeoutSecond},
              ${JSON.stringify(input.modelConfigSnapshot)}::jsonb,
              ${input.promptTemplateKey},
              ${input.promptTemplateVersion},
              ${input.promptTemplateHash},
              ${JSON.stringify(input.inputSnapshot)}::jsonb,
              ${JSON.stringify(input.authorizationSnapshot)}::jsonb,
              ${input.ragSnapshot === null ? null : JSON.stringify(input.ragSnapshot)}::jsonb,
              ${input.scheduledAt.toISOString()},
              now(),
              now()
            from answer_record_link
            on conflict (answer_record_id, idempotency_key_hash) do nothing
            returning *
          ),
          selected_task as (
            select * from inserted_task
            union all
            select existing_task.*
            from ai_scoring_task existing_task
            join answer_record_link
              on answer_record_link.id = existing_task.answer_record_id
            where existing_task.idempotency_key_hash = ${input.idempotencyKeyHash}
              and not exists (select 1 from inserted_task)
            limit 1
          )
          ${scoringTaskSelection}
        `,
      );

      return requireTaskRow(
        rows[0],
        "answer_record does not exist for AI scoring task.",
      );
    },

    async recoverExpiredAiScoringTasks(input) {
      const failureCode = "scoring_lease_expired";
      const failureMessageDigest = digest(
        "AI scoring task lease expired before completion.",
      );
      const rows = await executeSql<{ recovered_count: number | string }>(
        getDatabase(),
        sql`
          with expired_task as (
            select
              task.id,
              task.scheduled_at as attempt_scheduled_at,
              task.claimed_at as attempt_started_at,
              task.lease_expires_at as attempt_finished_at
            from ai_scoring_task task
            where task.task_status = 'running'::ai_scoring_task_status
              and task.attempt_count > 0
              and task.lease_expires_at <= ${input.recoveredAt.toISOString()}
            order by task.lease_expires_at asc, task.id asc
            for update skip locked
            limit 100
          ),
          recovered_task as (
            update ai_scoring_task task
            set
              task_status = 'failed'::ai_scoring_task_status,
              failure_code = ${failureCode},
              failure_message_digest = ${failureMessageDigest},
              scheduled_at = task.scheduled_at,
              claimed_at = null,
              lease_expires_at = null,
              worker_public_id = null,
              completed_at = ${input.recoveredAt.toISOString()}::timestamptz,
              updated_at = ${input.recoveredAt.toISOString()}
            from expired_task
            where task.id = expired_task.id
            returning
              task.*,
              expired_task.attempt_scheduled_at,
              expired_task.attempt_started_at,
              expired_task.attempt_finished_at
          ),
          answer_record_update as (
            update answer_record
            set
              answer_record_status = 'scoring_failed'::answer_record_status,
              score = null,
              updated_at = ${input.recoveredAt.toISOString()}
            from recovered_task
            where answer_record.id = recovered_task.answer_record_id
            returning answer_record.id as answer_record_id
          ),
          attempt_insert as (
            insert into ai_scoring_attempt (
              answer_record_id,
              attempt_number,
              ai_call_log_id,
              status,
              failure_code,
              failure_message_digest,
              scheduled_at,
              started_at,
              finished_at,
              retry_after_at,
              attempt_snapshot,
              created_at,
              updated_at
            )
            select
              recovered_task.answer_record_id,
              recovered_task.attempt_count,
              null,
              'timeout'::ai_scoring_attempt_status,
              ${failureCode},
              ${failureMessageDigest},
              recovered_task.attempt_scheduled_at,
              recovered_task.attempt_started_at,
              recovered_task.attempt_finished_at,
              case
                when recovered_task.attempt_count < recovered_task.max_attempt_count
                  then ${input.recoveredAt.toISOString()}::timestamptz
                else null
              end,
              jsonb_build_object(
                'taskPublicId', recovered_task.public_id,
                'scoringStatus', 'scoring_failed',
                'failureCode', ${failureCode}
              ),
              ${input.recoveredAt.toISOString()},
              ${input.recoveredAt.toISOString()}
            from recovered_task
            returning answer_record_id, attempt_number
          ),
          selected_recovery as (
            select recovered_task.id
            from recovered_task
            join attempt_insert
              on attempt_insert.answer_record_id = recovered_task.answer_record_id
              and attempt_insert.attempt_number = recovered_task.attempt_count
            left join answer_record_update
              on answer_record_update.answer_record_id = recovered_task.answer_record_id
            where answer_record_update.answer_record_id is not null
          )
          select count(*)::integer as recovered_count
          from selected_recovery
        `,
      );

      return Number(rows[0]?.recovered_count ?? 0);
    },

    async claimNextAiScoringTask(input) {
      const rows = await executeSql<AiScoringTaskRow>(
        getDatabase(),
        sql`
          with next_task as (
            select id
            from ai_scoring_task
            where attempt_count < max_attempt_count
              and task_status = 'pending'::ai_scoring_task_status
              and scheduled_at <= ${input.claimedAt.toISOString()}
            order by scheduled_at asc, id asc
            for update skip locked
            limit 1
          ),
          selected_task as (
            update ai_scoring_task task
            set
              task_status = 'running'::ai_scoring_task_status,
              attempt_count = task.attempt_count + 1,
              claimed_at = ${input.claimedAt.toISOString()},
              lease_expires_at = ${input.leaseExpiresAt.toISOString()},
              worker_public_id = ${input.workerPublicId},
              failure_code = null,
              failure_message_digest = null,
              updated_at = ${input.claimedAt.toISOString()}
            from next_task
            where task.id = next_task.id
            returning task.*
          )
          ${scoringTaskSelection}
        `,
      );

      return rows[0] === undefined ? null : mapTaskRow(rows[0]);
    },

    async completeAiScoringTask(input) {
      const attemptSnapshot = {
        taskPublicId: input.taskPublicId,
        scoringStatus: "scored",
        resultSnapshot: input.resultSnapshot,
      };
      const rows = await executeSql<AiScoringTaskRow>(
        getDatabase(),
        sql`
          with ai_call_log_link as (
            select
              id,
              user_public_id,
              answer_record_public_id,
              mock_exam_public_id,
              prompt_template_key,
              prompt_template_version,
              model_config_snapshot ->> 'modelConfigPublicId' as model_config_public_id
            from ai_call_log
            where public_id = ${input.aiCallLogPublicId}
              and call_status = 'success'::ai_call_status
              and ai_func_type = 'scoring'::ai_func_type
            limit 1
          ),
          completed_task as (
            update ai_scoring_task task
            set
              task_status = 'succeeded'::ai_scoring_task_status,
              result_snapshot = ${JSON.stringify(input.resultSnapshot)}::jsonb,
              ai_call_log_id = (select id from ai_call_log_link),
              failure_code = null,
              failure_message_digest = null,
              lease_expires_at = null,
              completed_at = ${input.completedAt.toISOString()},
              updated_at = ${input.completedAt.toISOString()}
            where task.public_id = ${input.taskPublicId}
              and task.task_status = 'running'::ai_scoring_task_status
              and task.worker_public_id = ${input.workerPublicId}
              and exists (
                select 1
                from ai_call_log_link
                join answer_record
                  on answer_record.id = task.answer_record_id
                where ai_call_log_link.user_public_id = task.actor_public_id
                  and ai_call_log_link.mock_exam_public_id = task.mock_exam_public_id
                  and ai_call_log_link.answer_record_public_id = answer_record.public_id
                  and ai_call_log_link.prompt_template_key = task.prompt_template_key
                  and ai_call_log_link.prompt_template_version = task.prompt_template_version
                  and ai_call_log_link.model_config_public_id = (task.model_config_snapshot ->> 'modelConfigPublicId')
              )
            returning task.*
          ),
          answer_record_update as (
            update answer_record
            set
              answer_record_status = 'scored'::answer_record_status,
              score = ${input.score},
              updated_at = ${input.completedAt.toISOString()}
            from completed_task
            where answer_record.id = completed_task.answer_record_id
            returning answer_record.id
          ),
          attempt_insert as (
            insert into ai_scoring_attempt (
              answer_record_id,
              attempt_number,
              ai_call_log_id,
              status,
              failure_code,
              failure_message_digest,
              scheduled_at,
              started_at,
              finished_at,
              retry_after_at,
              attempt_snapshot,
              created_at,
              updated_at
            )
            select
              completed_task.answer_record_id,
              completed_task.attempt_count,
              completed_task.ai_call_log_id,
              'succeeded'::ai_scoring_attempt_status,
              null,
              null,
              completed_task.scheduled_at,
              completed_task.claimed_at,
              completed_task.completed_at,
              null,
              ${JSON.stringify(attemptSnapshot)}::jsonb,
              ${input.completedAt.toISOString()},
              ${input.completedAt.toISOString()}
            from completed_task
            returning id
          ),
          selected_task as (
            select completed_task.*
            from completed_task
            where exists (select 1 from answer_record_update)
              and exists (select 1 from attempt_insert)
          )
          ${scoringTaskSelection}
        `,
      );

      return requireTaskRow(
        rows[0],
        "AI scoring task completion lost its lease.",
      );
    },

    async failAiScoringTaskAttempt(input) {
      const attemptStatus =
        input.failureCode === "scoring_timeout" ? "timeout" : "failed";
      const attemptSnapshot = {
        taskPublicId: input.taskPublicId,
        scoringStatus: "scoring_failed",
        failureCode: input.failureCode,
      };
      const rows = await executeSql<AiScoringTaskRow>(
        getDatabase(),
        sql`
          with leased_task as (
            select id, scheduled_at, claimed_at
            from ai_scoring_task
            where public_id = ${input.taskPublicId}
              and task_status = 'running'::ai_scoring_task_status
              and worker_public_id = ${input.workerPublicId}
            for update
          ),
          failed_task as (
            update ai_scoring_task task
            set
              task_status = 'failed'::ai_scoring_task_status,
              failure_code = ${input.failureCode},
              failure_message_digest = ${input.failureMessageDigest},
              scheduled_at = task.scheduled_at,
              lease_expires_at = null,
              worker_public_id = null,
              completed_at = ${input.failedAt.toISOString()}::timestamptz,
              updated_at = ${input.failedAt.toISOString()}
            from leased_task
            where task.id = leased_task.id
            returning
              task.*,
              leased_task.scheduled_at as attempt_scheduled_at,
              leased_task.claimed_at as attempt_started_at
          ),
          answer_record_update as (
            update answer_record
            set
              answer_record_status = 'scoring_failed'::answer_record_status,
              score = null,
              updated_at = ${input.failedAt.toISOString()}
            from failed_task
            where answer_record.id = failed_task.answer_record_id
              and failed_task.task_status = 'failed'::ai_scoring_task_status
            returning answer_record.id
          ),
          attempt_insert as (
            insert into ai_scoring_attempt (
              answer_record_id,
              attempt_number,
              ai_call_log_id,
              status,
              failure_code,
              failure_message_digest,
              scheduled_at,
              started_at,
              finished_at,
              retry_after_at,
              attempt_snapshot,
              created_at,
              updated_at
            )
            select
              failed_task.answer_record_id,
              failed_task.attempt_count,
              null,
              ${attemptStatus}::ai_scoring_attempt_status,
              ${input.failureCode},
              ${input.failureMessageDigest},
              failed_task.attempt_scheduled_at,
              failed_task.attempt_started_at,
              ${input.failedAt.toISOString()},
              case
                when ${input.retryable}
                  and failed_task.attempt_count < failed_task.max_attempt_count
                  then ${input.retryAfterAt.toISOString()}::timestamptz
                else null
              end,
              ${JSON.stringify(attemptSnapshot)}::jsonb,
              ${input.failedAt.toISOString()},
              ${input.failedAt.toISOString()}
            from failed_task
            returning id
          ),
          selected_task as (
            select failed_task.*
            from failed_task
            where exists (select 1 from attempt_insert)
              and exists (select 1 from answer_record_update)
          )
          ${scoringTaskSelection}
        `,
      );

      return requireTaskRow(rows[0], "AI scoring task failure lost its lease.");
    },
  };
}

function requireTaskRow(
  row: AiScoringTaskRow | undefined,
  message: string,
): AiScoringTaskRecord {
  if (row === undefined) {
    throw new Error(message);
  }

  return mapTaskRow(row);
}

function mapTaskRow(row: AiScoringTaskRow): AiScoringTaskRecord {
  return {
    publicId: row.public_id,
    answerRecordPublicId: row.answer_record_public_id,
    mockExamPublicId: row.mock_exam_public_id,
    actorPublicId: row.actor_public_id,
    idempotencyKeyHash: row.idempotency_key_hash,
    taskStatus: row.task_status,
    attemptCount: row.attempt_count,
    maxAttemptCount: row.max_attempt_count,
    timeoutSecond: row.timeout_second,
    modelConfigSnapshot: row.model_config_snapshot,
    promptTemplateKey: row.prompt_template_key,
    promptTemplateVersion: row.prompt_template_version,
    promptTemplateHash: row.prompt_template_hash,
    inputSnapshot: row.input_snapshot,
    authorizationSnapshot: row.authorization_snapshot,
    ragSnapshot: row.rag_snapshot,
    resultSnapshot: row.result_snapshot,
    aiCallLogPublicId: row.ai_call_log_public_id,
    failureCode: row.failure_code,
    failureMessageDigest: row.failure_message_digest,
    scheduledAt: toDate(row.scheduled_at),
    claimedAt: toNullableDate(row.claimed_at),
    leaseExpiresAt: toNullableDate(row.lease_expires_at),
    workerPublicId: row.worker_public_id,
    completedAt: toNullableDate(row.completed_at),
  };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function toNullableDate(value: Date | string | null): Date | null {
  return value === null ? null : toDate(value);
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function executeSql<TRow extends Record<string, unknown>>(
  database: RuntimeDatabase,
  query: SQL,
): Promise<TRow[]> {
  return (database as unknown as DrizzleSqlExecutor).execute<TRow>(query);
}
