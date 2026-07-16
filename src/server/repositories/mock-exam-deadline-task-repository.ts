import { createHash } from "node:crypto";

import { sql, type SQL } from "drizzle-orm";

import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type MockExamDeadlineTaskRecord = {
  publicId: string;
  mockExamPublicId: string;
  userPublicId: string;
  taskStatus: "pending" | "running" | "completed" | "failed" | "cancelled";
  scheduledAt: Date;
  attemptCount: number;
  maxAttemptCount: number;
  claimedAt: Date | null;
  leaseExpiresAt: Date | null;
  workerPublicId: string | null;
  completedAt: Date | null;
};

export type MockExamDeadlineTaskRepository = {
  recoverExpiredTasks(input: { recoveredAt: Date }): Promise<number>;
  claimNextDueTask(input: {
    workerPublicId: string;
    claimedAt: Date;
    leaseExpiresAt: Date;
  }): Promise<MockExamDeadlineTaskRecord | null>;
  completeTask(input: {
    taskPublicId: string;
    workerPublicId: string;
    completedAt: Date;
  }): Promise<void>;
  failTaskAttempt(input: {
    taskPublicId: string;
    workerPublicId: string;
    failureMessageDigest: string;
    failedAt: Date;
    retryAfterAt: Date;
  }): Promise<void>;
};

type DrizzleSqlExecutor = {
  execute<TRow extends Record<string, unknown>>(query: SQL): Promise<TRow[]>;
};

type MockExamDeadlineTaskRow = {
  public_id: string;
  mock_exam_public_id: string;
  user_public_id: string;
  task_status: MockExamDeadlineTaskRecord["taskStatus"];
  scheduled_at: Date | string;
  attempt_count: number;
  max_attempt_count: number;
  claimed_at: Date | string | null;
  lease_expires_at: Date | string | null;
  worker_public_id: string | null;
  completed_at: Date | string | null;
};

const selectedTaskQuery = sql`
  select
    selected_task.public_id,
    mock_exam.public_id as mock_exam_public_id,
    user_account.public_id as user_public_id,
    selected_task.task_status,
    selected_task.scheduled_at,
    selected_task.attempt_count,
    selected_task.max_attempt_count,
    selected_task.claimed_at,
    selected_task.lease_expires_at,
    selected_task.worker_public_id,
    selected_task.completed_at
  from selected_task
  join mock_exam on mock_exam.id = selected_task.mock_exam_id
  join user_account on user_account.id = mock_exam.user_id
`;

export function createPostgresMockExamDeadlineTaskRepository(
  options: RuntimeDatabaseOptions = {},
): MockExamDeadlineTaskRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for durable mock exam deadline tasks.",
  );

  return {
    async recoverExpiredTasks(input) {
      const failureMessageDigest = digest(
        "Mock exam deadline task lease expired before completion.",
      );
      const rows = await executeSql<{ public_id: string }>(
        getDatabase(),
        sql`
          with expired_task as (
            select task.id
            from mock_exam_deadline_task task
            where task.task_status = 'running'::mock_exam_deadline_task_status
              and task.lease_expires_at <= ${input.recoveredAt.toISOString()}
            order by task.lease_expires_at asc, task.id asc
            for update skip locked
            limit 100
          )
          update mock_exam_deadline_task task
          set
            task_status = case
              when task.attempt_count >= task.max_attempt_count
                then 'failed'::mock_exam_deadline_task_status
              else 'pending'::mock_exam_deadline_task_status
            end,
            scheduled_at = ${input.recoveredAt.toISOString()},
            claimed_at = null,
            lease_expires_at = null,
            worker_public_id = null,
            failure_message_digest = ${failureMessageDigest},
            completed_at = case
              when task.attempt_count >= task.max_attempt_count
                then ${input.recoveredAt.toISOString()}::timestamptz
              else null
            end,
            updated_at = ${input.recoveredAt.toISOString()}
          from expired_task
          where task.id = expired_task.id
          returning task.public_id
        `,
      );

      return rows.length;
    },

    async claimNextDueTask(input) {
      const rows = await executeSql<MockExamDeadlineTaskRow>(
        getDatabase(),
        sql`
          with due_task as (
            select task.id
            from mock_exam_deadline_task task
            join mock_exam on mock_exam.id = task.mock_exam_id
            where task.task_status = 'pending'::mock_exam_deadline_task_status
              and task.scheduled_at <= ${input.claimedAt.toISOString()}
              and task.attempt_count < task.max_attempt_count
              and mock_exam.exam_status = 'in_progress'::exam_status
            order by task.scheduled_at asc, task.id asc
            for update of task skip locked
            limit 1
          ),
          selected_task as (
            update mock_exam_deadline_task task
            set
              task_status = 'running'::mock_exam_deadline_task_status,
              attempt_count = task.attempt_count + 1,
              claimed_at = ${input.claimedAt.toISOString()},
              lease_expires_at = ${input.leaseExpiresAt.toISOString()},
              worker_public_id = ${input.workerPublicId},
              failure_message_digest = null,
              completed_at = null,
              updated_at = ${input.claimedAt.toISOString()}
            from due_task
            where task.id = due_task.id
            returning task.*
          )
          ${selectedTaskQuery}
        `,
      );

      return rows[0] === undefined ? null : mapTaskRecord(rows[0]);
    },

    async completeTask(input) {
      const rows = await executeSql<{ public_id: string }>(
        getDatabase(),
        sql`
          update mock_exam_deadline_task
          set
            task_status = case
              when task_status = 'cancelled'::mock_exam_deadline_task_status
                then task_status
              else 'completed'::mock_exam_deadline_task_status
            end,
            lease_expires_at = null,
            worker_public_id = null,
            failure_message_digest = null,
            completed_at = case
              when task_status in (
                'completed'::mock_exam_deadline_task_status,
                'cancelled'::mock_exam_deadline_task_status
              )
                then completed_at
              else ${input.completedAt.toISOString()}::timestamptz
            end,
            updated_at = case
              when task_status in (
                'completed'::mock_exam_deadline_task_status,
                'cancelled'::mock_exam_deadline_task_status
              )
                then updated_at
              else ${input.completedAt.toISOString()}::timestamptz
            end
          where public_id = ${input.taskPublicId}
            and (
              (
                task_status = 'running'::mock_exam_deadline_task_status
                and worker_public_id = ${input.workerPublicId}
              )
              or task_status in (
                'completed'::mock_exam_deadline_task_status,
                'cancelled'::mock_exam_deadline_task_status
              )
            )
          returning public_id
        `,
      );

      requireUpdatedTask(rows[0], "Deadline task completion lost its lease.");
    },

    async failTaskAttempt(input) {
      const rows = await executeSql<{ public_id: string }>(
        getDatabase(),
        sql`
          update mock_exam_deadline_task task
          set
            task_status = case
              when task.attempt_count >= task.max_attempt_count
                then 'failed'::mock_exam_deadline_task_status
              else 'pending'::mock_exam_deadline_task_status
            end,
            scheduled_at = ${input.retryAfterAt.toISOString()},
            claimed_at = null,
            lease_expires_at = null,
            worker_public_id = null,
            failure_message_digest = ${input.failureMessageDigest},
            completed_at = case
              when task.attempt_count >= task.max_attempt_count
                then ${input.failedAt.toISOString()}::timestamptz
              else null
            end,
            updated_at = ${input.failedAt.toISOString()}
          where task.public_id = ${input.taskPublicId}
            and task.task_status = 'running'::mock_exam_deadline_task_status
            and task.worker_public_id = ${input.workerPublicId}
          returning task.public_id
        `,
      );

      const terminalRows =
        rows[0] === undefined
          ? await executeSql<{ public_id: string }>(
              getDatabase(),
              sql`
                select task.public_id
                from mock_exam_deadline_task task
                where task.public_id = ${input.taskPublicId}
                  and task.task_status in (
                    'completed'::mock_exam_deadline_task_status,
                    'cancelled'::mock_exam_deadline_task_status
                  )
                limit 1
              `,
            )
          : [];

      requireUpdatedTask(
        rows[0] ?? terminalRows[0],
        "Deadline task failure lost its lease.",
      );
    },
  };
}

function mapTaskRecord(
  row: MockExamDeadlineTaskRow,
): MockExamDeadlineTaskRecord {
  return {
    publicId: row.public_id,
    mockExamPublicId: row.mock_exam_public_id,
    userPublicId: row.user_public_id,
    taskStatus: row.task_status,
    scheduledAt: toDate(row.scheduled_at),
    attemptCount: row.attempt_count,
    maxAttemptCount: row.max_attempt_count,
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

function requireUpdatedTask(
  row: { public_id: string } | undefined,
  message: string,
): void {
  if (row === undefined) {
    throw new Error(message);
  }
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
