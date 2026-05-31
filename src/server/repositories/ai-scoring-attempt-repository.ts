import { sql, type SQL } from "drizzle-orm";

import type {
  AiScoringAttemptSnapshot,
  AiScoringAttemptStatus,
} from "../models/ai-rag";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type AppendAiScoringAttemptInput = {
  answerRecordPublicId: string;
  aiCallLogPublicId: string | null;
  status: AiScoringAttemptStatus;
  failureCode: string | null;
  failureMessageDigest: string | null;
  scheduledAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  retryAfterAt: Date | null;
  attemptSnapshot: AiScoringAttemptSnapshot;
};

export type AppendAiScoringAttemptResult = {
  answerRecordPublicId: string;
  attemptNumber: number;
  status: AiScoringAttemptStatus;
};

export type AiScoringAttemptRepository = {
  appendAiScoringAttempt(
    input: AppendAiScoringAttemptInput,
  ): Promise<AppendAiScoringAttemptResult>;
};

type DrizzleSqlExecutor = {
  execute<TRow extends Record<string, unknown>>(query: SQL): Promise<TRow[]>;
};

type AiScoringAttemptInsertRow = {
  attempt_number: number;
};

export function createPostgresAiScoringAttemptRepository(
  options: RuntimeDatabaseOptions = {},
): AiScoringAttemptRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for AI scoring attempt runtime.",
  );

  return {
    async appendAiScoringAttempt(input) {
      const rows = await executeSql<AiScoringAttemptInsertRow>(
        getDatabase(),
        sql`
          with answer_record_link as (
            select id
            from answer_record
            where public_id = ${input.answerRecordPublicId}
            limit 1
          ),
          next_attempt as (
            select
              ar.id as answer_record_id,
              coalesce(max(asa.attempt_number), 0) + 1 as attempt_number
            from answer_record_link ar
            left join ai_scoring_attempt asa
              on asa.answer_record_id = ar.id
            group by ar.id
          ),
          ai_call_log_link as (
            select id
            from ai_call_log
            where public_id = ${input.aiCallLogPublicId}
            limit 1
          )
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
            next_attempt.answer_record_id,
            next_attempt.attempt_number,
            (select id from ai_call_log_link),
            ${input.status}::ai_scoring_attempt_status,
            ${input.failureCode},
            ${input.failureMessageDigest},
            ${input.scheduledAt.toISOString()},
            ${input.startedAt?.toISOString() ?? null},
            ${input.finishedAt?.toISOString() ?? null},
            ${input.retryAfterAt?.toISOString() ?? null},
            ${JSON.stringify(input.attemptSnapshot)}::jsonb,
            now(),
            now()
          from next_attempt
          returning attempt_number
        `,
      );
      const row = rows[0];

      if (row === undefined) {
        throw new Error("answer_record does not exist for ai_scoring_attempt.");
      }

      return {
        answerRecordPublicId: input.answerRecordPublicId,
        attemptNumber: row.attempt_number,
        status: input.status,
      };
    },
  };
}

async function executeSql<TRow extends Record<string, unknown>>(
  database: RuntimeDatabase,
  query: SQL,
): Promise<TRow[]> {
  return (database as unknown as DrizzleSqlExecutor).execute<TRow>(query);
}
