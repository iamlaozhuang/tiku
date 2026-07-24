import {
  aiCallLog,
  aiGenerationTask,
  personalAiGenerationResult,
} from "@/db/schema";
import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";

import type {
  PersonalAiGenerationPrivatePaperQuestionSnapshotDto,
  PersonalAiGenerationPrivateQuestionDraftSnapshotDto,
  PersonalAiGenerationResultPersistenceDto,
} from "../contracts/personal-ai-generation-result-persistence-contract";
import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationResultPersistenceInput,
  PersonalAiGenerationResultOwnerType,
  PersonalAiGenerationResultStatus,
  PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";
import type { AiGenerationTaskAttemptIdentity } from "./ai-generation-task-lifecycle-repository";
import {
  createCurrentMeasuredAiCallObservationCondition,
  createRunningAttemptCondition,
  normalizePersistedCurrentMeasuredAiCallObservation,
} from "./ai-generation-task-lifecycle-repository";
import {
  mapPersonalAiGenerationResultRowToDto,
  type PersonalAiGenerationResultPersistenceRow,
} from "../mappers/personal-ai-generation-result-mapper";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import {
  normalizePersonalAiGenerationPrivateQuestionDraftSnapshot,
  normalizePersonalAiGenerationPrivatePaperQuestionSnapshot,
  serializePersonalAiGenerationPaperQuestionSnapshot,
  serializePersonalAiGenerationQuestionDraftSnapshot,
} from "../validators/personal-ai-generation-result-persistence";

export type { PersonalAiGenerationResultPersistenceRow };

export type PersonalAiGenerationResultTaskRow = {
  id: number;
  public_id: string;
  request_public_id: string;
  owner_public_id: string;
};

export type ListPersonalAiGenerationResultQuery = {
  authorizationPublicId: string;
  ownerType?: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskType?: PersonalAiGenerationResultTaskType;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
};

export type CreatePersonalAiGenerationResultInput =
  PersonalAiGenerationResultPersistenceInput & {
    attempt?: AiGenerationTaskAttemptIdentity;
  };

export type GetPersonalAiGenerationResultQuery = {
  authorizationPublicId: string;
  ownerType?: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId: string;
  resultPublicId: string;
};

export type GetPersonalAiGenerationResultOwnerQuery = Omit<
  GetPersonalAiGenerationResultQuery,
  "authorizationPublicId"
>;

type PersonalAiGenerationResultLookupQuery =
  | GetPersonalAiGenerationResultQuery
  | GetPersonalAiGenerationResultOwnerQuery;

export type InsertPersonalAiGenerationDraftResultInput =
  PersonalAiGenerationResultPersistenceInput & {
    aiGenerationTaskId: number;
    requestPublicId: string;
    resultStatus: Extract<PersonalAiGenerationResultStatus, "draft">;
    isFormalAdoptionBlocked: true;
  };

export type AttachPersonalAiGenerationResultToTaskInput = {
  ownerType?: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskPublicId: string;
  resultPublicId: string;
  taskStatus: "succeeded";
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
  attempt: AiGenerationTaskAttemptIdentity;
};

export type InsertPersonalAiGenerationDraftResultAndCompleteTaskInput = {
  result: InsertPersonalAiGenerationDraftResultInput;
  task: AttachPersonalAiGenerationResultToTaskInput;
};

export type PersonalAiGenerationResultPersistenceResult =
  PersonalAiGenerationResultPersistenceDto;

export type PersonalAiGenerationResultRepository = {
  listDraftResults(
    query: ListPersonalAiGenerationResultQuery,
  ): Promise<PersonalAiGenerationResultPersistenceResult["result"][]>;
  countDraftResults?(
    query: ListPersonalAiGenerationResultQuery,
  ): Promise<number>;
  createOrReuseDraftResult(
    input: CreatePersonalAiGenerationResultInput,
  ): Promise<PersonalAiGenerationResultPersistenceResult>;
};

export type PersonalAiGenerationResultLookupRepository = {
  findDraftResultByPublicId(
    query: GetPersonalAiGenerationResultOwnerQuery,
  ): Promise<PersonalAiGenerationResultPersistenceResult["result"] | null>;
};

export type PersonalAiGenerationResultSelectedAuthorizationLookupRepository = {
  findDraftResultByPublicId(
    query: GetPersonalAiGenerationResultQuery,
  ): Promise<PersonalAiGenerationResultPersistenceResult["result"] | null>;
  findPrivateQuestionDraftSnapshotByPublicId?(
    query: GetPersonalAiGenerationResultQuery,
  ): Promise<PersonalAiGenerationPrivateQuestionDraftSnapshotDto | null>;
  findPrivatePaperQuestionSnapshotByPublicId?(
    query: GetPersonalAiGenerationResultQuery,
  ): Promise<PersonalAiGenerationPrivatePaperQuestionSnapshotDto | null>;
};

export type PersonalAiGenerationResultTaskGateway = {
  listResultRows(query: {
    authorizationPublicId: string;
    ownerType?: PersonalAiGenerationResultOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: PersonalAiGenerationResultTaskType;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  }): Promise<PersonalAiGenerationResultPersistenceRow[]>;
  countResultRows?(query: {
    authorizationPublicId: string;
    ownerType?: PersonalAiGenerationResultOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: PersonalAiGenerationResultTaskType;
  }): Promise<number>;
  findResultByPublicId(
    query: PersonalAiGenerationResultLookupQuery,
  ): Promise<PersonalAiGenerationResultPersistenceRow | null>;
  findResultByTaskPublicId(query: {
    ownerType?: PersonalAiGenerationResultOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskPublicId: string;
  }): Promise<PersonalAiGenerationResultPersistenceRow | null>;
  findTaskByPublicId(query: {
    ownerType?: PersonalAiGenerationResultOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskPublicId: string;
  }): Promise<PersonalAiGenerationResultTaskRow | null>;
  insertDraftResultAndCompleteTask(
    input: InsertPersonalAiGenerationDraftResultAndCompleteTaskInput,
  ): Promise<PersonalAiGenerationResultPersistenceRow | null>;
};

const DEFAULT_RESULT_HISTORY_LIMIT = 20;
const MAX_RESULT_HISTORY_LIMIT = 50;
const PERSONAL_AI_GENERATION_RESULT_TASK_TYPES = [
  "ai_question_generation",
  "ai_paper_generation",
] as const satisfies readonly PersonalAiGenerationResultTaskType[];

const personalAiGenerationResultSelection = {
  id: personalAiGenerationResult.id,
  public_id: personalAiGenerationResult.public_id,
  ai_generation_task_id: personalAiGenerationResult.ai_generation_task_id,
  task_public_id: personalAiGenerationResult.task_public_id,
  request_public_id: personalAiGenerationResult.request_public_id,
  owner_public_id: personalAiGenerationResult.owner_public_id,
  task_type: personalAiGenerationResult.task_type,
  result_status: personalAiGenerationResult.result_status,
  content_redacted_snapshot:
    personalAiGenerationResult.content_redacted_snapshot,
  content_digest: personalAiGenerationResult.content_digest,
  content_preview_masked: personalAiGenerationResult.content_preview_masked,
  question_draft_schema_version:
    personalAiGenerationResult.question_draft_schema_version,
  question_draft_snapshot: personalAiGenerationResult.question_draft_snapshot,
  question_draft_digest: personalAiGenerationResult.question_draft_digest,
  paper_question_snapshot_schema_version:
    personalAiGenerationResult.paper_question_snapshot_schema_version,
  paper_question_snapshot: personalAiGenerationResult.paper_question_snapshot,
  paper_question_snapshot_digest:
    personalAiGenerationResult.paper_question_snapshot_digest,
  citation_redacted_snapshot:
    personalAiGenerationResult.citation_redacted_snapshot,
  evidence_status: personalAiGenerationResult.evidence_status,
  citation_count: personalAiGenerationResult.citation_count,
  ai_call_log_public_id: personalAiGenerationResult.ai_call_log_public_id,
  is_formal_adoption_blocked:
    personalAiGenerationResult.is_formal_adoption_blocked,
  created_at: personalAiGenerationResult.created_at,
  updated_at: personalAiGenerationResult.updated_at,
};

export function createPersonalAiGenerationResultHistoryCondition(query: {
  authorizationPublicId: string;
  ownerType?: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskType?: PersonalAiGenerationResultTaskType;
}): SQL {
  const conditions = [
    eq(aiGenerationTask.authorization_public_id, query.authorizationPublicId),
    eq(aiGenerationTask.owner_type, query.ownerType ?? "personal"),
    eq(personalAiGenerationResult.owner_public_id, query.ownerPublicId),
    query.taskType === undefined
      ? inArray(
          personalAiGenerationResult.task_type,
          PERSONAL_AI_GENERATION_RESULT_TASK_TYPES,
        )
      : eq(personalAiGenerationResult.task_type, query.taskType),
    eq(personalAiGenerationResult.result_status, "draft"),
  ];

  if (query.actorPublicId !== undefined) {
    conditions.push(eq(aiGenerationTask.actor_public_id, query.actorPublicId));
  }

  return and(...conditions) as SQL;
}

export function createPersonalAiGenerationResultByTaskCondition(query: {
  ownerPublicId: string;
  actorPublicId?: string;
  taskPublicId: string;
}): SQL {
  const conditions = [
    eq(personalAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(personalAiGenerationResult.task_public_id, query.taskPublicId),
  ];

  if (query.actorPublicId !== undefined) {
    conditions.push(eq(aiGenerationTask.actor_public_id, query.actorPublicId));
  }

  return and(...conditions) as SQL;
}

function createPersonalAiGenerationResultLookupCondition(
  query: PersonalAiGenerationResultLookupQuery,
): SQL {
  const conditions = [
    eq(personalAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(personalAiGenerationResult.public_id, query.resultPublicId),
    eq(personalAiGenerationResult.result_status, "draft"),
    eq(aiGenerationTask.owner_type, query.ownerType ?? "personal"),
    eq(aiGenerationTask.actor_public_id, query.actorPublicId),
  ];

  const authorizationConditions =
    "authorizationPublicId" in query &&
    query.authorizationPublicId !== undefined
      ? [
          eq(
            aiGenerationTask.authorization_public_id,
            query.authorizationPublicId,
          ),
        ]
      : [];

  return and(...conditions, ...authorizationConditions) as SQL;
}

export function createPersonalAiGenerationResultByPublicIdCondition(
  query: GetPersonalAiGenerationResultOwnerQuery,
): SQL {
  return createPersonalAiGenerationResultLookupCondition(query);
}

export function createPersonalAiGenerationResultBySelectedAuthorizationCondition(
  query: GetPersonalAiGenerationResultQuery,
): SQL {
  return createPersonalAiGenerationResultLookupCondition(query);
}

export function createPersonalAiGenerationResultRepository(
  gateway: PersonalAiGenerationResultTaskGateway,
): PersonalAiGenerationResultRepository &
  PersonalAiGenerationResultLookupRepository &
  PersonalAiGenerationResultSelectedAuthorizationLookupRepository {
  const findDraftResultByPublicId = async (
    query: PersonalAiGenerationResultLookupQuery,
  ): Promise<PersonalAiGenerationResultPersistenceResult["result"] | null> => {
    const row = await gateway.findResultByPublicId(query);

    return row === null ? null : mapPersonalAiGenerationResultRowToDto(row);
  };

  return {
    findDraftResultByPublicId,
    async findPrivateQuestionDraftSnapshotByPublicId(query) {
      const row = await gateway.findResultByPublicId(query);

      return row === null ? null : readPrivateQuestionDraftSnapshot(row);
    },
    async findPrivatePaperQuestionSnapshotByPublicId(query) {
      const row = await gateway.findResultByPublicId(query);

      return row === null ? null : readPrivatePaperQuestionSnapshot(row);
    },
    async listDraftResults(query) {
      const page = resolveResultHistoryPage(query.page);
      const pageSize = resolveResultHistoryLimit(query.pageSize ?? query.limit);
      const rows = await gateway.listResultRows({
        authorizationPublicId: query.authorizationPublicId,
        ownerType: query.ownerType,
        ownerPublicId: query.ownerPublicId,
        ...(query.actorPublicId === undefined
          ? {}
          : { actorPublicId: query.actorPublicId }),
        taskType: query.taskType,
        page,
        pageSize,
        limit: pageSize,
        offset: query.offset ?? (page - 1) * pageSize,
      });

      return [...rows]
        .sort(comparePersonalAiGenerationResultRows)
        .map(mapPersonalAiGenerationResultRowToDto);
    },
    async createOrReuseDraftResult(input) {
      const existingRow = await gateway.findResultByTaskPublicId({
        ownerType: input.ownerType,
        ownerPublicId: input.ownerPublicId,
        actorPublicId: input.actorPublicId,
        taskPublicId: input.taskPublicId,
      });

      if (existingRow !== null) {
        assertReusablePrivateSnapshots(existingRow, input);
        return {
          persistenceStatus: "reused",
          result: mapPersonalAiGenerationResultRowToDto(existingRow),
        };
      }

      if (input.attempt === undefined) {
        throw new Error(
          "personal AI generation result requires a claimed task attempt.",
        );
      }

      const taskRow = await gateway.findTaskByPublicId({
        ownerType: input.ownerType,
        ownerPublicId: input.ownerPublicId,
        actorPublicId: input.actorPublicId,
        taskPublicId: input.taskPublicId,
      });

      if (taskRow === null) {
        throw new Error("personal AI generation task was not found.");
      }

      const resultInput = createServerOwnedDraftResultInput(input, taskRow);
      const insertedRow = await gateway.insertDraftResultAndCompleteTask({
        result: resultInput,
        task: {
          ownerType: input.ownerType,
          ownerPublicId: input.ownerPublicId,
          actorPublicId: input.actorPublicId,
          taskPublicId: input.taskPublicId,
          resultPublicId: input.resultPublicId,
          taskStatus: "succeeded",
          evidenceStatus: input.evidenceStatus,
          citationCount: input.citationCount,
          aiCallLogPublicId: input.aiCallLogPublicId,
          attempt: input.attempt,
        },
      });
      const resolvedRow =
        insertedRow ??
        (await gateway.findResultByTaskPublicId({
          ownerType: input.ownerType,
          ownerPublicId: input.ownerPublicId,
          actorPublicId: input.actorPublicId,
          taskPublicId: input.taskPublicId,
        }));

      if (resolvedRow === null) {
        throw new Error("personal AI generation result persistence failed.");
      }
      assertReusablePrivateSnapshots(resolvedRow, input);

      return {
        persistenceStatus: insertedRow === null ? "reused" : "created",
        result: mapPersonalAiGenerationResultRowToDto(resolvedRow),
      };
    },
    countDraftResults:
      gateway.countResultRows === undefined
        ? undefined
        : async (query) =>
            gateway.countResultRows?.({
              authorizationPublicId: query.authorizationPublicId,
              ownerType: query.ownerType,
              ownerPublicId: query.ownerPublicId,
              ...(query.actorPublicId === undefined
                ? {}
                : { actorPublicId: query.actorPublicId }),
              taskType: query.taskType,
            }) ?? 0,
  };
}

export function createPostgresPersonalAiGenerationResultRepository(
  options: RuntimeDatabaseOptions = {},
): PersonalAiGenerationResultRepository &
  PersonalAiGenerationResultLookupRepository &
  PersonalAiGenerationResultSelectedAuthorizationLookupRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for personal AI generation result persistence.",
  );

  return createPersonalAiGenerationResultRepository({
    async listResultRows(query) {
      const rows = await getDatabase()
        .select(personalAiGenerationResultSelection)
        .from(personalAiGenerationResult)
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(
          createPersonalAiGenerationResultHistoryCondition({
            authorizationPublicId: query.authorizationPublicId,
            ownerType: query.ownerType,
            ownerPublicId: query.ownerPublicId,
            actorPublicId: query.actorPublicId,
            taskType: query.taskType,
          }),
        )
        .orderBy(
          desc(personalAiGenerationResult.created_at),
          asc(personalAiGenerationResult.public_id),
        )
        .offset(query.offset)
        .limit(query.limit);

      return rows as PersonalAiGenerationResultPersistenceRow[];
    },
    async countResultRows(query) {
      const [totalRow] = await getDatabase()
        .select({ value: count() })
        .from(personalAiGenerationResult)
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(
          createPersonalAiGenerationResultHistoryCondition({
            authorizationPublicId: query.authorizationPublicId,
            ownerType: query.ownerType,
            ownerPublicId: query.ownerPublicId,
            actorPublicId: query.actorPublicId,
            taskType: query.taskType,
          }),
        );

      return totalRow?.value ?? 0;
    },
    async findResultByPublicId(query) {
      const [row] = await getDatabase()
        .select(personalAiGenerationResultSelection)
        .from(personalAiGenerationResult)
        .innerJoin(
          aiGenerationTask,
          eq(
            personalAiGenerationResult.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(createPersonalAiGenerationResultLookupCondition(query))
        .limit(1);

      return (
        (row as PersonalAiGenerationResultPersistenceRow | undefined) ?? null
      );
    },
    async findResultByTaskPublicId(query) {
      return findResultByTaskPublicId(getDatabase(), query);
    },
    async findTaskByPublicId(query) {
      const [row] = await getDatabase()
        .select({
          id: aiGenerationTask.id,
          public_id: aiGenerationTask.public_id,
          request_public_id: aiGenerationTask.request_public_id,
          owner_public_id: aiGenerationTask.owner_public_id,
        })
        .from(aiGenerationTask)
        .where(createPersonalAiGenerationTaskLookupCondition(query))
        .limit(1);

      return row ?? null;
    },
    async insertDraftResultAndCompleteTask(input) {
      return persistPersonalAiGenerationDraftResultAndCompleteTask(
        getDatabase(),
        input,
      );
    },
  });
}

export async function persistPersonalAiGenerationDraftResultAndCompleteTask(
  database: RuntimeDatabase,
  input: InsertPersonalAiGenerationDraftResultAndCompleteTaskInput,
): Promise<PersonalAiGenerationResultPersistenceRow | null> {
  return database.transaction(async (transaction) => {
    if (input.result.aiCallLogPublicId === null) {
      throw new Error(
        "personal AI generation success requires an ai_call_log.",
      );
    }

    const boundTasks = await transaction
      .select({ aiCallLogId: aiGenerationTask.ai_call_log_id })
      .from(aiGenerationTask)
      .where(
        and(
          createPersonalAiGenerationTaskLookupCondition({
            ownerType: input.task.ownerType,
            ownerPublicId: input.task.ownerPublicId,
            actorPublicId: input.task.actorPublicId,
            taskPublicId: input.task.taskPublicId,
          }),
          createRunningAttemptCondition(input.task.attempt),
          eq(
            aiGenerationTask.ai_call_log_public_id,
            input.result.aiCallLogPublicId,
          ),
        ),
      )
      .for("update")
      .limit(2);

    if (boundTasks.length !== 1) {
      throw new Error("personal AI generation attempt/log binding was lost.");
    }
    const boundTask = boundTasks[0];
    const boundAiCallLogId = boundTask.aiCallLogId;
    if (boundAiCallLogId === null) {
      throw new Error("personal AI generation attempt/log binding was lost.");
    }

    const finalizedLogs = await transaction
      .update(aiCallLog)
      .set({
        call_status: "success",
        completed_at: input.result.createdAt,
      })
      .where(
        and(
          eq(aiCallLog.id, boundAiCallLogId),
          eq(aiCallLog.public_id, input.result.aiCallLogPublicId),
          sql`${aiCallLog.call_status} = 'running'::ai_call_status`,
          createCurrentMeasuredAiCallObservationCondition(),
        ),
      )
      .returning({
        id: aiCallLog.id,
        observationSchemaVersion: aiCallLog.observation_schema_version,
        tokenSource: aiCallLog.token_count_source,
        tokenEstimationMethod: aiCallLog.token_estimation_method,
        promptTokenCount: aiCallLog.prompt_token_count,
        completionTokenCount: aiCallLog.completion_token_count,
        totalTokenCount: aiCallLog.total_token_count,
        estimatedCostCny: aiCallLog.estimated_cost_cny,
        latencySource: aiCallLog.latency_source,
        latencyMs: aiCallLog.latency_ms,
      });

    if (
      finalizedLogs.length !== 1 ||
      finalizedLogs[0].id !== boundAiCallLogId
    ) {
      throw new Error(
        "personal AI generation ai_call_log finalization was lost.",
      );
    }
    normalizePersistedCurrentMeasuredAiCallObservation(finalizedLogs[0]);

    const insertedRows = await transaction
      .insert(personalAiGenerationResult)
      .values({
        public_id: input.result.resultPublicId,
        ai_generation_task_id: input.result.aiGenerationTaskId,
        task_public_id: input.result.taskPublicId,
        request_public_id: input.result.requestPublicId,
        owner_public_id: input.result.ownerPublicId,
        task_type: input.result.taskType,
        result_status: input.result.resultStatus,
        content_redacted_snapshot: input.result.contentRedactedSnapshot,
        content_digest: input.result.contentDigest,
        content_preview_masked: input.result.contentPreviewMasked,
        question_draft_schema_version:
          input.result.privateQuestionDraftSnapshot?.schemaVersion ?? null,
        question_draft_snapshot:
          input.result.privateQuestionDraftSnapshot?.snapshot ?? null,
        question_draft_digest:
          input.result.privateQuestionDraftSnapshot?.digest ?? null,
        paper_question_snapshot_schema_version:
          input.result.privatePaperQuestionSnapshot?.schemaVersion ?? null,
        paper_question_snapshot:
          input.result.privatePaperQuestionSnapshot?.snapshot ?? null,
        paper_question_snapshot_digest:
          input.result.privatePaperQuestionSnapshot?.digest ?? null,
        citation_redacted_snapshot: input.result.citationRedactedSnapshot,
        evidence_status: input.result.evidenceStatus,
        citation_count: input.result.citationCount,
        ai_call_log_public_id: input.result.aiCallLogPublicId,
        is_formal_adoption_blocked: input.result.isFormalAdoptionBlocked,
        created_at: input.result.createdAt,
        updated_at: input.result.createdAt,
      })
      .onConflictDoNothing({
        target: personalAiGenerationResult.ai_generation_task_id,
      })
      .returning(personalAiGenerationResultSelection);

    if (insertedRows.length !== 1) {
      throw new Error("personal AI generation result persistence conflicted.");
    }
    const row = insertedRows[0];

    const updatedTaskRows = await transaction
      .update(aiGenerationTask)
      .set({
        task_status: input.task.taskStatus,
        failure_category: null,
        result_public_id: input.task.resultPublicId,
        evidence_status: input.task.evidenceStatus,
        citation_count: input.task.citationCount,
        ai_call_log_public_id: input.task.aiCallLogPublicId,
        finished_at: input.result.createdAt,
        updated_at: input.result.createdAt,
      })
      .where(
        and(
          createPersonalAiGenerationTaskLookupCondition({
            ownerType: input.task.ownerType,
            ownerPublicId: input.task.ownerPublicId,
            actorPublicId: input.task.actorPublicId,
            taskPublicId: input.task.taskPublicId,
          }),
          createRunningAttemptCondition(input.task.attempt),
          eq(aiGenerationTask.ai_call_log_id, boundAiCallLogId),
          eq(
            aiGenerationTask.ai_call_log_public_id,
            input.result.aiCallLogPublicId,
          ),
        ),
      )
      .returning({ public_id: aiGenerationTask.public_id });

    if (updatedTaskRows.length !== 1) {
      throw new Error(
        "personal AI generation task completion persistence failed.",
      );
    }

    return row as PersonalAiGenerationResultPersistenceRow;
  });
}

function readPrivateQuestionDraftSnapshot(
  row: PersonalAiGenerationResultPersistenceRow,
): PersonalAiGenerationPrivateQuestionDraftSnapshotDto | null {
  if (
    row.question_draft_schema_version == null &&
    row.question_draft_snapshot == null &&
    row.question_draft_digest == null
  ) {
    return null;
  }

  return normalizePersonalAiGenerationPrivateQuestionDraftSnapshot({
    schemaVersion: row.question_draft_schema_version,
    snapshot: row.question_draft_snapshot,
    digest: row.question_draft_digest,
  });
}

function readPrivatePaperQuestionSnapshot(
  row: PersonalAiGenerationResultPersistenceRow,
): PersonalAiGenerationPrivatePaperQuestionSnapshotDto | null {
  if (
    row.paper_question_snapshot_schema_version == null &&
    row.paper_question_snapshot == null &&
    row.paper_question_snapshot_digest == null
  ) {
    return null;
  }

  return normalizePersonalAiGenerationPrivatePaperQuestionSnapshot({
    schemaVersion: row.paper_question_snapshot_schema_version,
    snapshot: row.paper_question_snapshot,
    digest: row.paper_question_snapshot_digest,
  });
}

function assertReusablePrivateSnapshots(
  row: PersonalAiGenerationResultPersistenceRow,
  input: CreatePersonalAiGenerationResultInput,
): void {
  const existingSnapshot = readPrivateQuestionDraftSnapshot(row);
  const requestedSnapshot = input.privateQuestionDraftSnapshot;
  const existingPaperSnapshot = readPrivatePaperQuestionSnapshot(row);
  const requestedPaperSnapshot = input.privatePaperQuestionSnapshot;

  if (
    row.public_id !== input.resultPublicId ||
    row.task_public_id !== input.taskPublicId ||
    row.owner_public_id !== input.ownerPublicId ||
    row.task_type !== input.taskType ||
    (row.task_type === "ai_paper_generation" &&
      row.content_digest !== input.contentDigest) ||
    (requestedSnapshot === null
      ? existingSnapshot !== null
      : existingSnapshot === null ||
        existingSnapshot.digest !== requestedSnapshot.digest ||
        serializePersonalAiGenerationQuestionDraftSnapshot(
          existingSnapshot.snapshot,
        ) !==
          serializePersonalAiGenerationQuestionDraftSnapshot(
            requestedSnapshot.snapshot,
          )) ||
    (requestedPaperSnapshot === null
      ? existingPaperSnapshot !== null
      : existingPaperSnapshot === null ||
        existingPaperSnapshot.digest !== requestedPaperSnapshot.digest ||
        serializePersonalAiGenerationPaperQuestionSnapshot(
          existingPaperSnapshot.snapshot,
        ) !==
          serializePersonalAiGenerationPaperQuestionSnapshot(
            requestedPaperSnapshot.snapshot,
          ))
  ) {
    throw new Error("personal AI generation result snapshot conflicted.");
  }
}

function createServerOwnedDraftResultInput(
  input: CreatePersonalAiGenerationResultInput,
  taskRow: PersonalAiGenerationResultTaskRow,
): InsertPersonalAiGenerationDraftResultInput {
  return {
    ...input,
    aiGenerationTaskId: taskRow.id,
    requestPublicId: taskRow.request_public_id,
    resultStatus: "draft",
    isFormalAdoptionBlocked: true,
  };
}

async function findResultByTaskPublicId(
  database: RuntimeDatabase,
  query: {
    ownerType?: PersonalAiGenerationResultOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskPublicId: string;
  },
): Promise<PersonalAiGenerationResultPersistenceRow | null> {
  const [row] = await database
    .select(personalAiGenerationResultSelection)
    .from(personalAiGenerationResult)
    .innerJoin(
      aiGenerationTask,
      eq(personalAiGenerationResult.ai_generation_task_id, aiGenerationTask.id),
    )
    .innerJoin(
      aiCallLog,
      and(
        eq(aiGenerationTask.ai_call_log_id, aiCallLog.id),
        eq(
          personalAiGenerationResult.ai_call_log_public_id,
          aiCallLog.public_id,
        ),
      ),
    )
    .where(
      and(
        createPersonalAiGenerationResultByTaskCondition(query),
        eq(aiGenerationTask.task_status, "succeeded"),
        eq(
          aiGenerationTask.result_public_id,
          personalAiGenerationResult.public_id,
        ),
        eq(
          aiGenerationTask.ai_call_log_public_id,
          personalAiGenerationResult.ai_call_log_public_id,
        ),
        eq(aiCallLog.call_status, "success"),
      ),
    )
    .limit(1);

  return (row as PersonalAiGenerationResultPersistenceRow | undefined) ?? null;
}

function createPersonalAiGenerationTaskLookupCondition(query: {
  ownerType?: PersonalAiGenerationResultOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskPublicId: string;
}): SQL {
  const conditions = [
    eq(aiGenerationTask.owner_type, query.ownerType ?? "personal"),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    eq(aiGenerationTask.public_id, query.taskPublicId),
    inArray(
      aiGenerationTask.task_type,
      PERSONAL_AI_GENERATION_RESULT_TASK_TYPES,
    ),
  ];

  if (query.actorPublicId !== undefined) {
    conditions.push(eq(aiGenerationTask.actor_public_id, query.actorPublicId));
  }

  return and(...conditions) as SQL;
}

function resolveResultHistoryLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return DEFAULT_RESULT_HISTORY_LIMIT;
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    return DEFAULT_RESULT_HISTORY_LIMIT;
  }

  return Math.min(limit, MAX_RESULT_HISTORY_LIMIT);
}

function resolveResultHistoryPage(page: number | undefined): number {
  if (page === undefined) {
    return 1;
  }

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function comparePersonalAiGenerationResultRows(
  leftRow: PersonalAiGenerationResultPersistenceRow,
  rightRow: PersonalAiGenerationResultPersistenceRow,
): number {
  const createdAtComparison =
    rightRow.created_at.getTime() - leftRow.created_at.getTime();

  return createdAtComparison === 0
    ? leftRow.public_id.localeCompare(rightRow.public_id)
    : createdAtComparison;
}
