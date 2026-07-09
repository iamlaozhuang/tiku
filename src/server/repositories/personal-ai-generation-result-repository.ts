import { aiGenerationTask, personalAiGenerationResult } from "@/db/schema";
import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import type { PersonalAiGenerationResultPersistenceDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationResultPersistenceInput,
  PersonalAiGenerationResultOwnerType,
  PersonalAiGenerationResultStatus,
  PersonalAiGenerationResultTaskType,
} from "../models/personal-ai-generation-result";
import {
  mapPersonalAiGenerationResultRowToDto,
  type PersonalAiGenerationResultPersistenceRow,
} from "../mappers/personal-ai-generation-result-mapper";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type { PersonalAiGenerationResultPersistenceRow };

export type PersonalAiGenerationResultTaskRow = {
  id: number;
  public_id: string;
  request_public_id: string;
  owner_public_id: string;
};

export type ListPersonalAiGenerationResultQuery = {
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
  PersonalAiGenerationResultPersistenceInput;

export type InsertPersonalAiGenerationDraftResultInput =
  CreatePersonalAiGenerationResultInput & {
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
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
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

export type PersonalAiGenerationResultTaskGateway = {
  listResultRows(query: {
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
    ownerType?: PersonalAiGenerationResultOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: PersonalAiGenerationResultTaskType;
  }): Promise<number>;
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
  insertDraftResult(
    input: InsertPersonalAiGenerationDraftResultInput,
  ): Promise<PersonalAiGenerationResultPersistenceRow | null>;
  attachResultToTask(
    input: AttachPersonalAiGenerationResultToTaskInput,
  ): Promise<void>;
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
  ownerPublicId: string;
  actorPublicId?: string;
  taskType?: PersonalAiGenerationResultTaskType;
}): SQL {
  const conditions = [
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

export function createPersonalAiGenerationResultRepository(
  gateway: PersonalAiGenerationResultTaskGateway,
): PersonalAiGenerationResultRepository {
  return {
    async listDraftResults(query) {
      const page = resolveResultHistoryPage(query.page);
      const pageSize = resolveResultHistoryLimit(query.pageSize ?? query.limit);
      const rows = await gateway.listResultRows({
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
        return {
          persistenceStatus: "reused",
          result: mapPersonalAiGenerationResultRowToDto(existingRow),
        };
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

      const insertedRow = await gateway.insertDraftResult(
        createServerOwnedDraftResultInput(input, taskRow),
      );
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

      if (insertedRow !== null) {
        await gateway.attachResultToTask({
          ownerType: input.ownerType,
          ownerPublicId: input.ownerPublicId,
          actorPublicId: input.actorPublicId,
          taskPublicId: input.taskPublicId,
          resultPublicId: input.resultPublicId,
          evidenceStatus: input.evidenceStatus,
          citationCount: input.citationCount,
          aiCallLogPublicId: input.aiCallLogPublicId,
        });
      }

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
): PersonalAiGenerationResultRepository {
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
            ownerPublicId: query.ownerPublicId,
            actorPublicId: query.actorPublicId,
            taskType: query.taskType,
          }),
        );

      return totalRow?.value ?? 0;
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
    async insertDraftResult(input) {
      const [row] = await getDatabase()
        .insert(personalAiGenerationResult)
        .values({
          public_id: input.resultPublicId,
          ai_generation_task_id: input.aiGenerationTaskId,
          task_public_id: input.taskPublicId,
          request_public_id: input.requestPublicId,
          owner_public_id: input.ownerPublicId,
          task_type: input.taskType,
          result_status: input.resultStatus,
          content_redacted_snapshot: input.contentRedactedSnapshot,
          content_digest: input.contentDigest,
          content_preview_masked: input.contentPreviewMasked,
          citation_redacted_snapshot: input.citationRedactedSnapshot,
          evidence_status: input.evidenceStatus,
          citation_count: input.citationCount,
          ai_call_log_public_id: input.aiCallLogPublicId,
          is_formal_adoption_blocked: input.isFormalAdoptionBlocked,
          created_at: input.createdAt,
          updated_at: input.createdAt,
        })
        .onConflictDoNothing({
          target: personalAiGenerationResult.ai_generation_task_id,
        })
        .returning(personalAiGenerationResultSelection);

      return (
        (row as PersonalAiGenerationResultPersistenceRow | undefined) ?? null
      );
    },
    async attachResultToTask(input) {
      await getDatabase()
        .update(aiGenerationTask)
        .set({
          result_public_id: input.resultPublicId,
          evidence_status: input.evidenceStatus,
          citation_count: input.citationCount,
          ai_call_log_public_id: input.aiCallLogPublicId,
          updated_at: new Date(),
        })
        .where(
          createPersonalAiGenerationTaskLookupCondition({
            ownerType: input.ownerType,
            ownerPublicId: input.ownerPublicId,
            actorPublicId: input.actorPublicId,
            taskPublicId: input.taskPublicId,
          }),
        );
    },
  });
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
    .where(createPersonalAiGenerationResultByTaskCondition(query))
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
