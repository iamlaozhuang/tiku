import { createHash, randomUUID } from "node:crypto";

import {
  organizationTrainingAnswer,
  organizationTrainingScoringTask,
  type OrganizationTrainingQuestionResultSnapshotValue,
} from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type OrganizationTrainingScoringTaskRecord = {
  publicId: string;
  organizationTrainingAnswerId: number;
  taskStatus: "pending" | "running" | "succeeded" | "failed" | "cancelled";
  attemptCount: number;
  maxAttemptCount: 3;
  timeoutSecond: 60;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  inputSnapshot: Record<string, unknown>;
  authorizationSnapshot: Record<string, unknown>;
  ragSnapshot: Record<string, unknown> | null;
  workerPublicId: string | null;
  leaseExpiresAt: string | null;
};

export type OrganizationTrainingScoringCompletion = {
  taskPublicId: string;
  workerPublicId: string;
  score: number;
  totalScore: number;
  questionResults: OrganizationTrainingQuestionResultSnapshotValue[];
  resultSnapshot: Record<string, unknown>;
  aiCallLogId: number | null;
  completedAt: Date;
};

export type OrganizationTrainingScoringFailure = {
  taskPublicId: string;
  workerPublicId: string;
  failureCode: string;
  failureMessage: unknown;
  retryAt: Date;
  failedAt: Date;
};

export type OrganizationTrainingScoringTaskRepository = {
  claimNextTask(input: {
    workerPublicId: string;
    now: Date;
  }): Promise<OrganizationTrainingScoringTaskRecord | null>;
  recoverExpiredTasks(input: { now: Date }): Promise<number>;
  completeTask(input: OrganizationTrainingScoringCompletion): Promise<boolean>;
  failTask(
    input: OrganizationTrainingScoringFailure,
  ): Promise<"retry_scheduled" | "terminal_failed" | "conflict">;
};

const maxAttemptCount = 3 as const;
const timeoutSecond = 60 as const;

export function isValidOrganizationTrainingScoringCompletion(
  input: Pick<
    OrganizationTrainingScoringCompletion,
    "score" | "totalScore" | "questionResults"
  >,
): boolean {
  if (
    !Number.isFinite(input.score) ||
    !Number.isFinite(input.totalScore) ||
    input.totalScore <= 0 ||
    input.score < 0 ||
    input.score > input.totalScore ||
    input.questionResults.length === 0
  ) {
    return false;
  }

  const publicIds = new Set<string>();
  let scoreTotal = 0;
  let maxScoreTotal = 0;

  for (const result of input.questionResults) {
    if (
      result.questionPublicId.trim().length === 0 ||
      publicIds.has(result.questionPublicId) ||
      !Number.isFinite(result.score) ||
      !Number.isFinite(result.maxScore) ||
      result.maxScore <= 0 ||
      result.score < 0 ||
      result.score > result.maxScore
    ) {
      return false;
    }

    publicIds.add(result.questionPublicId);
    scoreTotal += result.score;
    maxScoreTotal += result.maxScore;
  }

  return (
    Math.abs(scoreTotal - input.score) < Number.EPSILON * 100 &&
    Math.abs(maxScoreTotal - input.totalScore) < Number.EPSILON * 100
  );
}

export function isValidOrganizationTrainingScoringCompletionForInput(
  completion: Pick<
    OrganizationTrainingScoringCompletion,
    "score" | "totalScore" | "questionResults"
  >,
  inputSnapshot: unknown,
): boolean {
  if (
    !isValidOrganizationTrainingScoringCompletion(completion) ||
    !isRecord(inputSnapshot) ||
    typeof inputSnapshot.objectiveScore !== "number" ||
    !Number.isFinite(inputSnapshot.objectiveScore) ||
    typeof inputSnapshot.totalScore !== "number" ||
    !Number.isFinite(inputSnapshot.totalScore) ||
    !Array.isArray(inputSnapshot.questionResults) ||
    !inputSnapshot.questionResults.every(isQuestionResultSnapshot) ||
    !Array.isArray(inputSnapshot.shortAnswerQuestionPublicIds) ||
    !inputSnapshot.shortAnswerQuestionPublicIds.every(
      (publicId) => typeof publicId === "string" && publicId.trim().length > 0,
    )
  ) {
    return false;
  }

  const canonicalQuestionResults = inputSnapshot.questionResults;
  if (
    !isValidOrganizationTrainingScoringCompletion({
      score: inputSnapshot.objectiveScore,
      totalScore: inputSnapshot.totalScore,
      questionResults: canonicalQuestionResults,
    }) ||
    completion.totalScore !== inputSnapshot.totalScore ||
    completion.questionResults.length !== canonicalQuestionResults.length
  ) {
    return false;
  }

  const shortAnswerQuestionPublicIds = new Set(
    inputSnapshot.shortAnswerQuestionPublicIds,
  );
  if (
    shortAnswerQuestionPublicIds.size !==
      inputSnapshot.shortAnswerQuestionPublicIds.length ||
    [...shortAnswerQuestionPublicIds].some((publicId) => {
      const canonicalResult = canonicalQuestionResults.find(
        (result) => result.questionPublicId === publicId,
      );
      return canonicalResult === undefined || canonicalResult.score !== 0;
    }) ||
    Math.abs(
      canonicalQuestionResults
        .filter(
          (result) =>
            !shortAnswerQuestionPublicIds.has(result.questionPublicId),
        )
        .reduce((score, result) => score + result.score, 0) -
        inputSnapshot.objectiveScore,
    ) >=
      Number.EPSILON * 100
  ) {
    return false;
  }
  const completionByQuestionPublicId = new Map(
    completion.questionResults.map((result) => [
      result.questionPublicId,
      result,
    ]),
  );

  return canonicalQuestionResults.every((canonicalResult) => {
    const completionResult = completionByQuestionPublicId.get(
      canonicalResult.questionPublicId,
    );
    if (
      completionResult === undefined ||
      completionResult.maxScore !== canonicalResult.maxScore ||
      completionResult.standardAnswer !== canonicalResult.standardAnswer ||
      completionResult.analysis !== canonicalResult.analysis
    ) {
      return false;
    }

    if (shortAnswerQuestionPublicIds.has(canonicalResult.questionPublicId)) {
      return true;
    }

    return (
      completionResult.score === canonicalResult.score &&
      JSON.stringify(completionResult.scoringPointResults) ===
        JSON.stringify(canonicalResult.scoringPointResults)
    );
  });
}

export function createPostgresOrganizationTrainingScoringTaskRepository(
  options: RuntimeDatabaseOptions = {},
): OrganizationTrainingScoringTaskRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for organization training scoring task persistence.",
  );

  return createOrganizationTrainingScoringTaskRepository(getDatabase);
}

export function createOrganizationTrainingScoringTaskRepository(
  getDatabase: () => RuntimeDatabase,
): OrganizationTrainingScoringTaskRepository {
  return {
    async claimNextTask(input) {
      return getDatabase().transaction(async (transaction) => {
        const rows = await transaction.execute<{
          id: number;
          public_id: string;
          organization_training_answer_id: number;
          task_status: OrganizationTrainingScoringTaskRecord["taskStatus"];
          attempt_count: number;
          model_config_snapshot: Record<string, unknown>;
          prompt_template_key: string;
          prompt_template_version: number;
          prompt_template_hash: string;
          input_snapshot: Record<string, unknown>;
          authorization_snapshot: Record<string, unknown>;
          rag_snapshot: Record<string, unknown> | null;
        }>(sql`
          select
            id,
            public_id,
            organization_training_answer_id,
            task_status,
            attempt_count,
            model_config_snapshot,
            prompt_template_key,
            prompt_template_version,
            prompt_template_hash,
            input_snapshot,
            authorization_snapshot,
            rag_snapshot
          from organization_training_scoring_task
          where task_status = 'pending'
            and scheduled_at <= ${input.now}
            and attempt_count < ${maxAttemptCount}
          order by scheduled_at asc, id asc
          for update skip locked
          limit 1
        `);
        const row = rows[0];

        if (row === undefined) {
          return null;
        }

        const leaseExpiresAt = new Date(
          input.now.getTime() + timeoutSecond * 1_000,
        );
        const [claimed] = await transaction
          .update(organizationTrainingScoringTask)
          .set({
            task_status: "running",
            attempt_count: row.attempt_count + 1,
            claimed_at: input.now,
            lease_expires_at: leaseExpiresAt,
            worker_public_id: input.workerPublicId,
            updated_at: input.now,
          })
          .where(eq(organizationTrainingScoringTask.id, row.id))
          .returning({ id: organizationTrainingScoringTask.id });

        return claimed === undefined
          ? null
          : {
              publicId: row.public_id,
              organizationTrainingAnswerId: row.organization_training_answer_id,
              taskStatus: "running",
              attemptCount: row.attempt_count + 1,
              maxAttemptCount,
              timeoutSecond,
              modelConfigSnapshot: row.model_config_snapshot,
              promptTemplateKey: row.prompt_template_key,
              promptTemplateVersion: row.prompt_template_version,
              promptTemplateHash: row.prompt_template_hash,
              inputSnapshot: row.input_snapshot,
              authorizationSnapshot: row.authorization_snapshot,
              ragSnapshot: row.rag_snapshot,
              workerPublicId: input.workerPublicId,
              leaseExpiresAt: leaseExpiresAt.toISOString(),
            };
      });
    },

    async recoverExpiredTasks(input) {
      return getDatabase().transaction(async (transaction) => {
        const terminalRows = await transaction.execute<{
          answer_id: number;
        }>(sql`
          update organization_training_scoring_task
          set task_status = 'failed',
              failure_code = 'lease_expired',
              failure_message_digest = ${createFailureDigest("lease_expired")},
              completed_at = ${input.now},
              lease_expires_at = null,
              worker_public_id = null,
              updated_at = ${input.now}
          where task_status = 'running'
            and lease_expires_at <= ${input.now}
            and attempt_count >= ${maxAttemptCount}
          returning organization_training_answer_id as answer_id
        `);

        if (terminalRows.length > 0) {
          await transaction
            .update(organizationTrainingAnswer)
            .set({
              organization_training_answer_status: "scoring_failed",
              updated_at: input.now,
            })
            .where(
              and(
                sql`${organizationTrainingAnswer.id} in (${sql.join(
                  terminalRows.map((row) => sql`${row.answer_id}`),
                  sql`, `,
                )})`,
                eq(
                  organizationTrainingAnswer.organization_training_answer_status,
                  "scoring",
                ),
              ),
            );
        }

        const retryRows = await transaction.execute<{ id: number }>(sql`
          update organization_training_scoring_task
          set task_status = 'pending',
              scheduled_at = ${input.now},
              claimed_at = null,
              lease_expires_at = null,
              worker_public_id = null,
              updated_at = ${input.now}
          where task_status = 'running'
            and lease_expires_at <= ${input.now}
            and attempt_count < ${maxAttemptCount}
          returning id
        `);

        return terminalRows.length + retryRows.length;
      });
    },

    async completeTask(input) {
      if (!isValidOrganizationTrainingScoringCompletion(input)) {
        return false;
      }

      return getDatabase().transaction(async (transaction) => {
        const [task] = await transaction
          .select({
            id: organizationTrainingScoringTask.id,
            answerId:
              organizationTrainingScoringTask.organization_training_answer_id,
            inputSnapshot: organizationTrainingScoringTask.input_snapshot,
          })
          .from(organizationTrainingScoringTask)
          .where(
            and(
              eq(organizationTrainingScoringTask.public_id, input.taskPublicId),
              eq(organizationTrainingScoringTask.task_status, "running"),
              eq(
                organizationTrainingScoringTask.worker_public_id,
                input.workerPublicId,
              ),
              gt(
                organizationTrainingScoringTask.lease_expires_at,
                input.completedAt,
              ),
            ),
          )
          .limit(1)
          .for("update");

        if (
          task === undefined ||
          !isValidOrganizationTrainingScoringCompletionForInput(
            input,
            task.inputSnapshot,
          )
        ) {
          return false;
        }

        const [completedTask] = await transaction
          .update(organizationTrainingScoringTask)
          .set({
            task_status: "succeeded",
            result_snapshot: input.resultSnapshot,
            ai_call_log_id: input.aiCallLogId,
            completed_at: input.completedAt,
            lease_expires_at: null,
            worker_public_id: null,
            updated_at: input.completedAt,
          })
          .where(
            and(
              eq(organizationTrainingScoringTask.id, task.id),
              eq(organizationTrainingScoringTask.task_status, "running"),
              eq(
                organizationTrainingScoringTask.worker_public_id,
                input.workerPublicId,
              ),
              gt(
                organizationTrainingScoringTask.lease_expires_at,
                input.completedAt,
              ),
            ),
          )
          .returning({ id: organizationTrainingScoringTask.id });

        if (completedTask === undefined) {
          return false;
        }

        const [answer] = await transaction
          .update(organizationTrainingAnswer)
          .set({
            organization_training_answer_status: "submitted",
            score: String(input.score),
            total_score: String(input.totalScore),
            question_result_snapshot: input.questionResults,
            updated_at: input.completedAt,
          })
          .where(
            and(
              eq(organizationTrainingAnswer.id, task.answerId),
              eq(
                organizationTrainingAnswer.organization_training_answer_status,
                "scoring",
              ),
            ),
          )
          .returning({ id: organizationTrainingAnswer.id });

        if (answer === undefined) {
          throw new Error("organization training scoring completion conflict.");
        }

        return true;
      });
    },

    async failTask(input) {
      return getDatabase().transaction(async (transaction) => {
        const rows = await transaction.execute<{
          id: number;
          answer_id: number;
          attempt_count: number;
        }>(sql`
          select id,
                 organization_training_answer_id as answer_id,
                 attempt_count
          from organization_training_scoring_task
          where public_id = ${input.taskPublicId}
            and task_status = 'running'
            and worker_public_id = ${input.workerPublicId}
            and lease_expires_at > ${input.failedAt}
          for update
        `);
        const task = rows[0];

        if (task === undefined) {
          return "conflict";
        }

        const isTerminal = task.attempt_count >= maxAttemptCount;

        await transaction
          .update(organizationTrainingScoringTask)
          .set({
            task_status: isTerminal ? "failed" : "pending",
            failure_code: input.failureCode,
            failure_message_digest: createFailureDigest(input.failureMessage),
            scheduled_at: isTerminal ? input.failedAt : input.retryAt,
            completed_at: isTerminal ? input.failedAt : null,
            claimed_at: null,
            lease_expires_at: null,
            worker_public_id: null,
            updated_at: input.failedAt,
          })
          .where(eq(organizationTrainingScoringTask.id, task.id));

        if (isTerminal) {
          await transaction
            .update(organizationTrainingAnswer)
            .set({
              organization_training_answer_status: "scoring_failed",
              updated_at: input.failedAt,
            })
            .where(
              and(
                eq(organizationTrainingAnswer.id, task.answer_id),
                eq(
                  organizationTrainingAnswer.organization_training_answer_status,
                  "scoring",
                ),
              ),
            );
        }

        return isTerminal ? "terminal_failed" : "retry_scheduled";
      });
    },
  };
}

export function createOrganizationTrainingScoringTaskPublicId(): string {
  return `organization_training_scoring_task_${randomUUID()}`;
}

function createFailureDigest(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value) ?? "null")
    .digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isQuestionResultSnapshot(
  value: unknown,
): value is OrganizationTrainingQuestionResultSnapshotValue {
  return (
    isRecord(value) &&
    typeof value.questionPublicId === "string" &&
    typeof value.score === "number" &&
    typeof value.maxScore === "number" &&
    typeof value.standardAnswer === "string" &&
    typeof value.analysis === "string" &&
    Array.isArray(value.scoringPointResults)
  );
}
