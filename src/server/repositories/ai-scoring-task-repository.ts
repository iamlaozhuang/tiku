import { createHash } from "node:crypto";

import { sql, type SQL } from "drizzle-orm";

import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import {
  buildExamReportSnapshot,
  calculateDurationSecond,
  lockExamReportScoringFinalization,
  type ExamReportAiScoringEvidenceRow,
  type ExamReportAnswerRecordRow,
  type ExamReportMockExamRow,
} from "./exam-report-repository";

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

type ExamReportProjectionMockRow = ExamReportMockExamRow & {
  id: number;
  actor_public_id: string;
};

type ExamReportProjectionAnswerSqlRow = {
  id: number;
  public_id: string;
  paper_question_public_id: string;
  question_public_id: string;
  question_snapshot: Record<string, unknown>;
  answer_snapshot: ExamReportAnswerRecordRow["answer_snapshot"];
  answer_record_status: ExamReportAnswerRecordRow["answer_record_status"];
  is_correct: boolean | null;
  score: string | null;
  max_score: string;
  answered_at: Date | string | null;
  submitted_at: Date | string | null;
  task_public_id: string | null;
  task_status: string | null;
  attempt_number: number | null;
  attempt_status: string | null;
  model_config_snapshot: Record<string, unknown> | null;
  prompt_template_key: string | null;
  prompt_template_version: number | null;
  prompt_template_hash: string | null;
  result_snapshot: Record<string, unknown> | null;
};

type ExistingExamReportRow = {
  id: number;
  public_id: string;
  actor_public_id: string;
  mock_exam_public_id: string;
  paper_public_id: string;
  exam_status: "scoring" | "scoring_partial_failed" | "completed";
  report_snapshot: Record<string, unknown>;
  objective_score: string | null;
  subjective_score: string | null;
  total_score: string | null;
  duration_second: number;
};

type ExamReportProjectionFacts = {
  mockExam: ExamReportProjectionMockRow;
  answerRecords: ExamReportAnswerRecordRow[];
  existingReport: ExistingExamReportRow | null;
};

type CompletionTaskStateRow = AiScoringTaskRow & {
  answer_record_status: string;
  answer_score: string | null;
  attempt_status: string | null;
  attempt_ai_call_log_public_id: string | null;
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
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const mockExamPublicId = await resolveAiScoringTaskMockExamIdentity(
          transaction,
          input.taskPublicId,
        );
        await lockExamReportScoringFinalization(transaction, mockExamPublicId);
        await lockAiScoringTaskMockExam(
          transaction,
          input.taskPublicId,
          input.workerPublicId,
          mockExamPublicId,
          true,
        );

        const completionStateRows = await loadCompletionTaskState(
          transaction,
          input.taskPublicId,
        );

        if (completionStateRows.length !== 1) {
          throw new Error("AI scoring task completion cardinality is invalid.");
        }

        const completionState = completionStateRows[0]!;

        if (completionState.task_status === "succeeded") {
          await assertTerminalCompletionReplay(
            transaction,
            completionState,
            input,
          );

          return mapTaskRow(completionState);
        }

        if (
          completionState.task_status !== "running" ||
          completionState.worker_public_id !== input.workerPublicId
        ) {
          throw new Error("AI scoring task completion lost its lease.");
        }

        const existingReportRows = await loadExistingExamReportRows(
          transaction,
          mockExamPublicId,
          completionState.actor_public_id,
        );

        if (existingReportRows.length > 1) {
          throw new Error("Exam report cardinality is invalid.");
        }

        if (existingReportRows[0]?.exam_status === "completed") {
          throw new Error(
            "Completed exam report cannot coexist with a running scoring task.",
          );
        }

        const rows = await executeSql<AiScoringTaskRow>(
          transaction,
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
              and (select count(*) from ai_call_log_link) = 1
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
              and answer_record.mock_exam_id = (
                select id
                from mock_exam
                where public_id = completed_task.mock_exam_public_id
              )
              and answer_record.answer_record_status = 'pending_scoring'::answer_record_status
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
          mock_exam_update as (
            update mock_exam
            set
              exam_status = case
                when exists (
                  select 1
                  from ai_scoring_task remaining_task
                  where remaining_task.mock_exam_public_id = completed_task.mock_exam_public_id
                    and remaining_task.id <> completed_task.id
                    and remaining_task.task_status in (
                      'pending'::ai_scoring_task_status,
                      'running'::ai_scoring_task_status
                    )
                ) then 'scoring'::exam_status
                when exists (
                  select 1
                  from ai_scoring_task remaining_task
                  where remaining_task.mock_exam_public_id = completed_task.mock_exam_public_id
                    and remaining_task.id <> completed_task.id
                    and remaining_task.task_status in (
                      'failed'::ai_scoring_task_status,
                      'cancelled'::ai_scoring_task_status
                    )
                ) then 'scoring_partial_failed'::exam_status
                else 'completed'::exam_status
              end,
              subjective_score = (
                select coalesce(sum(existing_answer.score), 0::numeric)
                from answer_record existing_answer
                where existing_answer.mock_exam_id = mock_exam.id
                  and existing_answer.id <> completed_task.answer_record_id
                  and existing_answer.is_correct is null
              ) + ${input.score}::numeric,
              total_score = coalesce(mock_exam.objective_score, 0::numeric) + (
                select coalesce(sum(existing_answer.score), 0::numeric)
                from answer_record existing_answer
                where existing_answer.mock_exam_id = mock_exam.id
                  and existing_answer.id <> completed_task.answer_record_id
                  and existing_answer.is_correct is null
              ) + ${input.score}::numeric,
              updated_at = ${input.completedAt.toISOString()}
            from completed_task
            where mock_exam.public_id = completed_task.mock_exam_public_id
              and mock_exam.exam_status in (
                'scoring'::exam_status,
                'scoring_partial_failed'::exam_status
              )
            returning mock_exam.id
          ),
          selected_task as (
            select completed_task.*
            from completed_task
            where (select count(*) from answer_record_update) = 1
              and (select count(*) from attempt_insert) = 1
              and (select count(*) from mock_exam_update) = 1
          )
          ${scoringTaskSelection}
          `,
        );

        if (rows.length !== 1) {
          throw new Error("AI scoring task completion lost its lease.");
        }

        const projectionFacts = await loadExamReportProjectionFacts(
          transaction,
          mockExamPublicId,
          completionState.actor_public_id,
        );
        assertCompleteAiScoringEvidenceSet(projectionFacts);

        if (projectionFacts.existingReport !== null) {
          const reportSnapshot = buildExamReportSnapshot(
            projectionFacts.mockExam,
            projectionFacts.answerRecords,
          );
          await finalizeExistingExamReport(
            transaction,
            projectionFacts,
            reportSnapshot,
            input.completedAt,
          );
        }

        return mapTaskRow(rows[0]!);
      });
    },

    async failAiScoringTaskAttempt(input) {
      const attemptStatus =
        input.failureCode === "scoring_timeout" ? "timeout" : "failed";
      const attemptSnapshot = {
        taskPublicId: input.taskPublicId,
        scoringStatus: "scoring_failed",
        failureCode: input.failureCode,
      };
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const mockExamPublicId = await resolveAiScoringTaskMockExamIdentity(
          transaction,
          input.taskPublicId,
        );
        await lockExamReportScoringFinalization(transaction, mockExamPublicId);
        await lockAiScoringTaskMockExam(
          transaction,
          input.taskPublicId,
          input.workerPublicId,
          mockExamPublicId,
        );
        const rows = await executeSql<AiScoringTaskRow>(
          transaction,
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
              task_status = case
                when ${input.retryable}
                  and task.attempt_count < task.max_attempt_count
                  then 'pending'::ai_scoring_task_status
                else 'failed'::ai_scoring_task_status
              end,
              failure_code = ${input.failureCode},
              failure_message_digest = ${input.failureMessageDigest},
              scheduled_at = case
                when ${input.retryable}
                  and task.attempt_count < task.max_attempt_count
                  then ${input.retryAfterAt.toISOString()}::timestamptz
                else task.scheduled_at
              end,
              claimed_at = null,
              lease_expires_at = null,
              worker_public_id = null,
              completed_at = case
                when ${input.retryable}
                  and task.attempt_count < task.max_attempt_count
                  then null
                else ${input.failedAt.toISOString()}::timestamptz
              end,
              updated_at = ${input.failedAt.toISOString()}
            from leased_task
            where task.id = leased_task.id
            returning
              task.*,
              leased_task.scheduled_at as attempt_scheduled_at,
              leased_task.claimed_at as attempt_started_at
          ),
          terminal_answer_record_update as (
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
          mock_exam_update as (
            update mock_exam
            set
              exam_status = case
                when failed_task.task_status = 'pending'::ai_scoring_task_status
                  or exists (
                    select 1
                    from ai_scoring_task remaining_task
                    where remaining_task.mock_exam_public_id = failed_task.mock_exam_public_id
                      and remaining_task.id <> failed_task.id
                      and remaining_task.task_status in (
                        'pending'::ai_scoring_task_status,
                        'running'::ai_scoring_task_status
                      )
                  ) then 'scoring'::exam_status
                else 'scoring_partial_failed'::exam_status
              end,
              updated_at = ${input.failedAt.toISOString()}
            from failed_task
            where mock_exam.public_id = failed_task.mock_exam_public_id
              and mock_exam.exam_status in (
                'scoring'::exam_status,
                'scoring_partial_failed'::exam_status
              )
            returning mock_exam.id
          ),
          selected_task as (
            select failed_task.*
            from failed_task
            where exists (select 1 from attempt_insert)
              and exists (select 1 from mock_exam_update)
              and (
                failed_task.task_status = 'pending'::ai_scoring_task_status
                or exists (select 1 from terminal_answer_record_update)
              )
          )
          ${scoringTaskSelection}
          `,
        );

        return requireTaskRow(
          rows[0],
          "AI scoring task failure lost its lease.",
        );
      });
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
  database: unknown,
  query: SQL,
): Promise<TRow[]> {
  return (database as unknown as DrizzleSqlExecutor).execute<TRow>(query);
}

async function resolveAiScoringTaskMockExamIdentity(
  database: unknown,
  taskPublicId: string,
): Promise<string> {
  const rows = await executeSql<{ mock_exam_public_id: string }>(
    database,
    sql`
      select mock_exam_public_id
      from ai_scoring_task
      where public_id = ${taskPublicId}
    `,
  );

  if (rows.length !== 1) {
    throw new Error("AI scoring task mock_exam identity is ambiguous.");
  }

  return rows[0]!.mock_exam_public_id;
}

async function loadCompletionTaskState(
  database: unknown,
  taskPublicId: string,
): Promise<CompletionTaskStateRow[]> {
  return executeSql<CompletionTaskStateRow>(
    database,
    sql`
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
        task.completed_at,
        answer_record.answer_record_status,
        answer_record.score as answer_score,
        attempt.status as attempt_status,
        attempt_call_log.public_id as attempt_ai_call_log_public_id
      from ai_scoring_task task
      join answer_record on answer_record.id = task.answer_record_id
      left join ai_call_log on ai_call_log.id = task.ai_call_log_id
      left join ai_scoring_attempt attempt
        on attempt.answer_record_id = task.answer_record_id
       and attempt.attempt_number = task.attempt_count
      left join ai_call_log attempt_call_log
        on attempt_call_log.id = attempt.ai_call_log_id
      where task.public_id = ${taskPublicId}
      for update of task, answer_record
    `,
  );
}

async function loadExistingExamReportRows(
  database: unknown,
  mockExamPublicId: string,
  actorPublicId: string,
): Promise<ExistingExamReportRow[]> {
  const rows = await executeSql<ExistingExamReportRow>(
    database,
    sql`
      select
        report.id,
        report.public_id,
        actor.public_id as actor_public_id,
        owned_mock_exam.public_id as mock_exam_public_id,
        report.paper_public_id,
        report.exam_status,
        report.report_snapshot,
        report.objective_score,
        report.subjective_score,
        report.total_score,
        report.duration_second
      from exam_report report
      join mock_exam owned_mock_exam on owned_mock_exam.id = report.mock_exam_id
      join user_account actor on actor.id = report.user_id
      where owned_mock_exam.public_id = ${mockExamPublicId}
      for update of report
    `,
  );

  if (
    rows.some(
      (row) =>
        row.actor_public_id !== actorPublicId ||
        row.mock_exam_public_id !== mockExamPublicId,
    )
  ) {
    throw new Error("Exam report ownership identity is inconsistent.");
  }

  return rows;
}

async function loadExamReportProjectionFacts(
  database: unknown,
  mockExamPublicId: string,
  actorPublicId: string,
): Promise<ExamReportProjectionFacts> {
  const mockExamRows = await executeSql<ExamReportProjectionMockRow>(
    database,
    sql`
      select
        owned_mock_exam.id,
        owned_mock_exam.public_id,
        owned_mock_exam.paper_public_id,
        owned_mock_exam.paper_snapshot,
        owned_mock_exam.profession,
        owned_mock_exam.level,
        owned_mock_exam.subject,
        owned_mock_exam.exam_status,
        owned_mock_exam.started_at,
        owned_mock_exam.submitted_at,
        owned_mock_exam.objective_score,
        owned_mock_exam.subjective_score,
        owned_mock_exam.total_score,
        actor.public_id as actor_public_id
      from mock_exam owned_mock_exam
      join user_account actor on actor.id = owned_mock_exam.user_id
      where owned_mock_exam.public_id = ${mockExamPublicId}
        and actor.public_id = ${actorPublicId}
      for update of owned_mock_exam
    `,
  );

  if (mockExamRows.length !== 1) {
    throw new Error("Mock exam report projection cardinality is invalid.");
  }

  const mockExamRow = mockExamRows[0]!;
  const answerRows = await executeSql<ExamReportProjectionAnswerSqlRow>(
    database,
    sql`
      select
        answer_record.id,
        answer_record.public_id,
        answer_record.paper_question_public_id,
        answer_record.question_public_id,
        answer_record.question_snapshot,
        answer_record.answer_snapshot,
        answer_record.answer_record_status,
        answer_record.is_correct,
        answer_record.score,
        answer_record.max_score,
        answer_record.answered_at,
        answer_record.submitted_at,
        task.public_id as task_public_id,
        task.task_status,
        task.attempt_count as attempt_number,
        attempt.status as attempt_status,
        task.model_config_snapshot,
        task.prompt_template_key,
        task.prompt_template_version,
        task.prompt_template_hash,
        task.result_snapshot
      from answer_record
      left join ai_scoring_task task
        on task.answer_record_id = answer_record.id
      left join ai_scoring_attempt attempt
        on attempt.answer_record_id = answer_record.id
       and attempt.attempt_number = task.attempt_count
      where answer_record.mock_exam_id = ${mockExamRow.id}
        and answer_record.exam_mode = 'mock_exam'::exam_mode
      order by answer_record.id asc, task.id asc, attempt.id asc
    `,
  );
  const seenAnswerRecordIds = new Set<number>();
  const answerRecords = answerRows.map((row) => {
    if (seenAnswerRecordIds.has(row.id)) {
      throw new Error("AI scoring evidence cardinality is invalid.");
    }
    seenAnswerRecordIds.add(row.id);

    let aiScoringEvidence: ExamReportAiScoringEvidenceRow | null = null;

    if (row.task_public_id !== null) {
      if (
        row.task_status === null ||
        row.attempt_number === null ||
        row.model_config_snapshot === null ||
        row.prompt_template_key === null ||
        row.prompt_template_version === null ||
        row.prompt_template_hash === null
      ) {
        throw new Error("AI scoring evidence identity is incomplete.");
      }

      aiScoringEvidence = {
        taskPublicId: row.task_public_id,
        taskStatus: row.task_status,
        attemptNumber: row.attempt_number,
        attemptStatus: row.attempt_status,
        modelConfigSnapshot: row.model_config_snapshot,
        promptTemplateKey: row.prompt_template_key,
        promptTemplateVersion: row.prompt_template_version,
        promptTemplateHash: row.prompt_template_hash,
        resultSnapshot: row.result_snapshot,
      };
    }

    return {
      public_id: row.public_id,
      paper_question_public_id: row.paper_question_public_id,
      question_public_id: row.question_public_id,
      question_snapshot: row.question_snapshot,
      answer_snapshot: row.answer_snapshot,
      ai_scoring_evidence: aiScoringEvidence,
      answer_record_status: row.answer_record_status,
      is_correct: row.is_correct,
      score: row.score,
      max_score: row.max_score,
      answered_at: toNullableDate(row.answered_at),
      submitted_at: toNullableDate(row.submitted_at),
    } satisfies ExamReportAnswerRecordRow;
  });
  const existingReportRows = await loadExistingExamReportRows(
    database,
    mockExamPublicId,
    actorPublicId,
  );

  if (existingReportRows.length > 1) {
    throw new Error("Exam report cardinality is invalid.");
  }

  return {
    mockExam: {
      ...mockExamRow,
      started_at: toDate(mockExamRow.started_at),
      submitted_at: toNullableDate(mockExamRow.submitted_at),
    },
    answerRecords,
    existingReport: existingReportRows[0] ?? null,
  };
}

function assertCompleteAiScoringEvidenceSet(
  facts: ExamReportProjectionFacts,
): void {
  const taskPublicIds = new Set<string>();

  for (const answerRecord of facts.answerRecords) {
    const evidence = answerRecord.ai_scoring_evidence;

    if (answerRecord.is_correct === null && evidence === null) {
      throw new Error("Subjective answer is missing durable scoring evidence.");
    }

    if (answerRecord.is_correct !== null && evidence !== null) {
      throw new Error("Objective answer cannot own AI scoring evidence.");
    }

    if (evidence !== null) {
      if (taskPublicIds.has(evidence.taskPublicId)) {
        throw new Error("AI scoring task identity is duplicated.");
      }
      taskPublicIds.add(evidence.taskPublicId);

      if (
        evidence.taskStatus === "succeeded" &&
        (evidence.attemptStatus !== "succeeded" ||
          evidence.resultSnapshot === null)
      ) {
        throw new Error("Succeeded scoring evidence is incomplete.");
      }
    }
  }
}

async function finalizeExistingExamReport(
  database: unknown,
  facts: ExamReportProjectionFacts,
  reportSnapshot: Record<string, unknown>,
  completedAt: Date,
): Promise<void> {
  const existingReport = facts.existingReport;

  if (existingReport === null) {
    return;
  }

  if (
    !["scoring", "scoring_partial_failed"].includes(
      existingReport.exam_status,
    ) ||
    existingReport.paper_public_id !== facts.mockExam.paper_public_id
  ) {
    throw new Error("Exam report cannot be finalized from its current state.");
  }

  const updatedReportRows = await executeSql<{ id: number }>(
    database,
    sql`
      update exam_report
      set
        report_snapshot = ${JSON.stringify(reportSnapshot)}::jsonb,
        report_revision = report_revision + 1,
        exam_status = ${facts.mockExam.exam_status}::exam_status,
        objective_score = ${facts.mockExam.objective_score}::numeric,
        subjective_score = ${facts.mockExam.subjective_score}::numeric,
        total_score = ${facts.mockExam.total_score}::numeric,
        duration_second = ${calculateDurationSecond(facts.mockExam)},
        learning_suggestion_snapshot = null,
        updated_at = ${completedAt.toISOString()}
      where id = ${existingReport.id}
        and exam_status in (
          'scoring'::exam_status,
          'scoring_partial_failed'::exam_status
        )
        and (
          report_snapshot is distinct from ${JSON.stringify(reportSnapshot)}::jsonb
          or exam_status is distinct from ${facts.mockExam.exam_status}::exam_status
          or objective_score is distinct from ${facts.mockExam.objective_score}::numeric
          or subjective_score is distinct from ${facts.mockExam.subjective_score}::numeric
          or total_score is distinct from ${facts.mockExam.total_score}::numeric
          or duration_second is distinct from ${calculateDurationSecond(facts.mockExam)}
        )
      returning id
    `,
  );

  if (updatedReportRows.length !== 1) {
    throw new Error("Exam report finalization lost its conditional update.");
  }
}

async function assertTerminalCompletionReplay(
  database: unknown,
  taskState: CompletionTaskStateRow,
  input: CompleteAiScoringTaskInput,
): Promise<void> {
  if (
    taskState.worker_public_id !== input.workerPublicId ||
    taskState.ai_call_log_public_id !== input.aiCallLogPublicId ||
    taskState.attempt_ai_call_log_public_id !== input.aiCallLogPublicId ||
    taskState.answer_record_status !== "scored" ||
    taskState.answer_score !== input.score ||
    taskState.attempt_status !== "succeeded" ||
    canonicalizeJson(taskState.result_snapshot) !==
      canonicalizeJson(input.resultSnapshot)
  ) {
    throw new Error("AI scoring task completion replay does not match.");
  }

  const projectionFacts = await loadExamReportProjectionFacts(
    database,
    taskState.mock_exam_public_id,
    taskState.actor_public_id,
  );
  assertCompleteAiScoringEvidenceSet(projectionFacts);

  if (projectionFacts.existingReport !== null) {
    const expectedSnapshot = buildExamReportSnapshot(
      projectionFacts.mockExam,
      projectionFacts.answerRecords,
    );

    if (
      projectionFacts.existingReport.exam_status !==
        projectionFacts.mockExam.exam_status ||
      canonicalizeJson(projectionFacts.existingReport.report_snapshot) !==
        canonicalizeJson(expectedSnapshot)
    ) {
      throw new Error("Exam report terminal replay is inconsistent.");
    }
  }
}

function canonicalizeJson(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJson).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    );

    return `{${entries
      .map(
        ([key, entryValue]) =>
          `${JSON.stringify(key)}:${canonicalizeJson(entryValue)}`,
      )
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

async function lockAiScoringTaskMockExam(
  database: unknown,
  taskPublicId: string,
  workerPublicId: string,
  expectedMockExamPublicId?: string,
  allowSucceeded = false,
): Promise<void> {
  const rows = await executeSql<{ id: number; public_id: string }>(
    database,
    sql`
      select owned_mock_exam.id, owned_mock_exam.public_id
      from mock_exam owned_mock_exam
      join ai_scoring_task task
        on task.mock_exam_public_id = owned_mock_exam.public_id
      where task.public_id = ${taskPublicId}
        and (
          task.task_status = 'running'::ai_scoring_task_status
          or (
            ${allowSucceeded}
            and task.task_status = 'succeeded'::ai_scoring_task_status
          )
        )
        and task.worker_public_id = ${workerPublicId}
      for update of owned_mock_exam, task
    `,
  );

  if (
    rows.length !== 1 ||
    (expectedMockExamPublicId !== undefined &&
      rows[0]?.public_id !== expectedMockExamPublicId)
  ) {
    throw new Error("AI scoring task lost its mock_exam lease boundary.");
  }
}
