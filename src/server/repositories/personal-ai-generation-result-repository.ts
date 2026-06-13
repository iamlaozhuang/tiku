import { aiGenerationTask, personalAiGenerationResult } from "@/db/schema";
import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";

import type { PersonalAiGenerationResultPersistenceDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationResultPersistenceInput,
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
  ownerPublicId: string;
  limit?: number;
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
  ownerPublicId: string;
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
  createOrReuseDraftResult(
    input: CreatePersonalAiGenerationResultInput,
  ): Promise<PersonalAiGenerationResultPersistenceResult>;
};

export type PersonalAiGenerationResultTaskGateway = {
  listResultRows(query: {
    ownerPublicId: string;
    limit: number;
  }): Promise<PersonalAiGenerationResultPersistenceRow[]>;
  findResultByTaskPublicId(query: {
    ownerPublicId: string;
    taskPublicId: string;
  }): Promise<PersonalAiGenerationResultPersistenceRow | null>;
  findTaskByPublicId(query: {
    ownerPublicId: string;
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

export function createPersonalAiGenerationResultHistoryCondition(
  ownerPublicId: string,
): SQL {
  return and(
    eq(personalAiGenerationResult.owner_public_id, ownerPublicId),
    eq(personalAiGenerationResult.result_status, "draft"),
  ) as SQL;
}

export function createPersonalAiGenerationResultByTaskCondition(query: {
  ownerPublicId: string;
  taskPublicId: string;
}): SQL {
  return and(
    eq(personalAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(personalAiGenerationResult.task_public_id, query.taskPublicId),
  ) as SQL;
}

export function createPersonalAiGenerationResultRepository(
  gateway: PersonalAiGenerationResultTaskGateway,
): PersonalAiGenerationResultRepository {
  return {
    async listDraftResults(query) {
      const rows = await gateway.listResultRows({
        ownerPublicId: query.ownerPublicId,
        limit: resolveResultHistoryLimit(query.limit),
      });

      return [...rows]
        .sort(comparePersonalAiGenerationResultRows)
        .map(mapPersonalAiGenerationResultRowToDto);
    },
    async createOrReuseDraftResult(input) {
      const existingRow = await gateway.findResultByTaskPublicId({
        ownerPublicId: input.ownerPublicId,
        taskPublicId: input.taskPublicId,
      });

      if (existingRow !== null) {
        return {
          persistenceStatus: "reused",
          result: mapPersonalAiGenerationResultRowToDto(existingRow),
        };
      }

      const taskRow = await gateway.findTaskByPublicId({
        ownerPublicId: input.ownerPublicId,
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
          ownerPublicId: input.ownerPublicId,
          taskPublicId: input.taskPublicId,
        }));

      if (resolvedRow === null) {
        throw new Error("personal AI generation result persistence failed.");
      }

      if (insertedRow !== null) {
        await gateway.attachResultToTask({
          ownerPublicId: input.ownerPublicId,
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
        .where(
          createPersonalAiGenerationResultHistoryCondition(query.ownerPublicId),
        )
        .orderBy(
          desc(personalAiGenerationResult.created_at),
          asc(personalAiGenerationResult.public_id),
        )
        .limit(query.limit);

      return rows as PersonalAiGenerationResultPersistenceRow[];
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
            ownerPublicId: input.ownerPublicId,
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
    ownerPublicId: string;
    taskPublicId: string;
  },
): Promise<PersonalAiGenerationResultPersistenceRow | null> {
  const [row] = await database
    .select(personalAiGenerationResultSelection)
    .from(personalAiGenerationResult)
    .where(createPersonalAiGenerationResultByTaskCondition(query))
    .limit(1);

  return (row as PersonalAiGenerationResultPersistenceRow | undefined) ?? null;
}

function createPersonalAiGenerationTaskLookupCondition(query: {
  ownerPublicId: string;
  taskPublicId: string;
}): SQL {
  return and(
    eq(aiGenerationTask.owner_type, "personal"),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    eq(aiGenerationTask.public_id, query.taskPublicId),
    inArray(
      aiGenerationTask.task_type,
      PERSONAL_AI_GENERATION_RESULT_TASK_TYPES,
    ),
  ) as SQL;
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
