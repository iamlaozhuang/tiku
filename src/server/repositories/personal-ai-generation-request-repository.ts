import { aiGenerationTask } from "@/db/schema";
import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import type { PersonalAiGenerationRequestHistoryDto } from "../contracts/personal-ai-generation-request-history-contract";
import type { AiGenerationTaskType } from "../models/ai-generation-task";
import type { AiGenerationTaskRequestOwnerType } from "../models/ai-generation-task-request";
import type { AiFuncType, EvidenceStatus } from "../models/ai-rag";
import {
  mapPersonalAiGenerationRequestRowToHistoryDto,
  type PersonalAiGenerationRequestPersistenceRow,
} from "../mappers/personal-ai-generation-request-mapper";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type { PersonalAiGenerationRequestPersistenceRow };

export type PersonalAiGenerationTaskType = Exclude<
  AiGenerationTaskType,
  "organization_training_generation"
>;

export type PersonalAiGenerationRequestOwnerType = Extract<
  AiGenerationTaskRequestOwnerType,
  "personal" | "organization"
>;

export type ListPersonalAiGenerationRequestHistoryQuery = {
  ownerType?: PersonalAiGenerationRequestOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskType?: PersonalAiGenerationTaskType;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
};

export type CreatePersonalAiGenerationRequestInput = {
  requestPublicId: string;
  taskPublicId: string;
  taskType: PersonalAiGenerationTaskType;
  aiFuncType: Exclude<AiFuncType, "scoring">;
  authorizationPublicId: string;
  actorPublicId: string;
  ownerType: PersonalAiGenerationRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: PersonalAiGenerationRequestOwnerType;
  quotaOwnerPublicId: string;
  effectiveEdition: string;
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  idempotencyKeyHash: string;
  requestedAt: Date;
  resultPublicId?: string | null;
  evidenceStatus?: EvidenceStatus;
  citationCount?: number;
  aiCallLogPublicId?: string | null;
  isAuthorizationActive: boolean;
  isScopeAllowed: boolean;
  isQuotaAvailable: boolean;
  isRuntimeConfigReady: boolean;
};

export type PersonalAiGenerationRequestPersistenceResult = {
  persistenceStatus: "created" | "reused";
  historyItem: PersonalAiGenerationRequestHistoryDto[number];
};

export type PersonalAiGenerationRequestRepository = {
  listRequestHistory(
    query: ListPersonalAiGenerationRequestHistoryQuery,
  ): Promise<PersonalAiGenerationRequestHistoryDto>;
  countRequestHistory?(
    query: ListPersonalAiGenerationRequestHistoryQuery,
  ): Promise<number>;
  createOrReuseRequest(
    input: CreatePersonalAiGenerationRequestInput,
  ): Promise<PersonalAiGenerationRequestPersistenceResult>;
};

export type PersonalAiGenerationRequestTaskGateway = {
  listRequestRows(query: {
    ownerType?: PersonalAiGenerationRequestOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: PersonalAiGenerationTaskType;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  }): Promise<PersonalAiGenerationRequestPersistenceRow[]>;
  countRequestRows?(query: {
    ownerType?: PersonalAiGenerationRequestOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: PersonalAiGenerationTaskType;
  }): Promise<number>;
  findRequestByIdempotencyKey(query: {
    ownerType?: PersonalAiGenerationRequestOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    idempotencyKeyHash: string;
  }): Promise<PersonalAiGenerationRequestPersistenceRow | null>;
  insertPendingRequest(
    input: CreatePersonalAiGenerationRequestInput,
  ): Promise<PersonalAiGenerationRequestPersistenceRow | null>;
};

const DEFAULT_REQUEST_HISTORY_LIMIT = 20;
const MAX_REQUEST_HISTORY_LIMIT = 50;
export const PERSONAL_AI_GENERATION_TASK_TYPES = [
  "ai_question_generation",
  "ai_paper_generation",
] as const satisfies readonly PersonalAiGenerationTaskType[];

const personalAiGenerationRequestSelection = {
  public_id: aiGenerationTask.public_id,
  request_public_id: aiGenerationTask.request_public_id,
  task_type: aiGenerationTask.task_type,
  task_status: aiGenerationTask.task_status,
  requested_at: aiGenerationTask.requested_at,
  result_public_id: aiGenerationTask.result_public_id,
  evidence_status: aiGenerationTask.evidence_status,
  citation_count: aiGenerationTask.citation_count,
  ai_call_log_public_id: aiGenerationTask.ai_call_log_public_id,
};

export function createPersonalAiGenerationRequestHistoryCondition(query: {
  ownerType?: PersonalAiGenerationRequestOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  taskType?: PersonalAiGenerationTaskType;
}): SQL {
  const conditions = [
    eq(aiGenerationTask.owner_type, query.ownerType ?? "personal"),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    query.taskType === undefined
      ? inArray(aiGenerationTask.task_type, PERSONAL_AI_GENERATION_TASK_TYPES)
      : eq(aiGenerationTask.task_type, query.taskType),
  ];

  if (query.actorPublicId !== undefined) {
    conditions.push(eq(aiGenerationTask.actor_public_id, query.actorPublicId));
  }

  return and(...conditions) as SQL;
}

export function createPersonalAiGenerationRequestIdempotencyCondition(query: {
  ownerType?: PersonalAiGenerationRequestOwnerType;
  ownerPublicId: string;
  actorPublicId?: string;
  idempotencyKeyHash: string;
}): SQL {
  const conditions = [
    eq(aiGenerationTask.owner_type, query.ownerType ?? "personal"),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    eq(aiGenerationTask.idempotency_key_hash, query.idempotencyKeyHash),
    inArray(aiGenerationTask.task_type, PERSONAL_AI_GENERATION_TASK_TYPES),
  ];

  if (query.actorPublicId !== undefined) {
    conditions.push(eq(aiGenerationTask.actor_public_id, query.actorPublicId));
  }

  return and(...conditions) as SQL;
}

export function createPersonalAiGenerationRequestRepository(
  gateway: PersonalAiGenerationRequestTaskGateway,
): PersonalAiGenerationRequestRepository {
  return {
    async listRequestHistory(query) {
      const page = resolveRequestHistoryPage(query.page);
      const pageSize = resolveRequestHistoryLimit(
        query.pageSize ?? query.limit,
      );
      const rows = await gateway.listRequestRows({
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
        .sort(comparePersonalAiGenerationRequestPersistenceRows)
        .map(mapPersonalAiGenerationRequestRowToHistoryDto);
    },
    async createOrReuseRequest(input) {
      const existingRow = await gateway.findRequestByIdempotencyKey({
        ownerType: input.ownerType,
        ownerPublicId: input.ownerPublicId,
        actorPublicId: input.actorPublicId,
        idempotencyKeyHash: input.idempotencyKeyHash,
      });

      if (existingRow !== null) {
        return {
          persistenceStatus: "reused",
          historyItem:
            mapPersonalAiGenerationRequestRowToHistoryDto(existingRow),
        };
      }

      const insertedRow = await gateway.insertPendingRequest(
        createServerOwnedPendingRequestInput(input),
      );
      const resolvedRow =
        insertedRow ??
        (await gateway.findRequestByIdempotencyKey({
          ownerType: input.ownerType,
          ownerPublicId: input.ownerPublicId,
          actorPublicId: input.actorPublicId,
          idempotencyKeyHash: input.idempotencyKeyHash,
        }));

      if (resolvedRow === null) {
        throw new Error("personal AI generation request persistence failed.");
      }

      return {
        persistenceStatus: insertedRow === null ? "reused" : "created",
        historyItem: mapPersonalAiGenerationRequestRowToHistoryDto(resolvedRow),
      };
    },
    countRequestHistory:
      gateway.countRequestRows === undefined
        ? undefined
        : async (query) =>
            gateway.countRequestRows?.({
              ownerType: query.ownerType,
              ownerPublicId: query.ownerPublicId,
              ...(query.actorPublicId === undefined
                ? {}
                : { actorPublicId: query.actorPublicId }),
              taskType: query.taskType,
            }) ?? 0,
  };
}

function createServerOwnedPendingRequestInput(
  input: CreatePersonalAiGenerationRequestInput,
): CreatePersonalAiGenerationRequestInput {
  return {
    ...input,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    aiCallLogPublicId: null,
  };
}

export function createPostgresPersonalAiGenerationRequestRepository(
  options: RuntimeDatabaseOptions = {},
): PersonalAiGenerationRequestRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for personal AI generation request persistence.",
  );

  return createPersonalAiGenerationRequestRepository({
    async listRequestRows(query) {
      const database = getDatabase();

      const rows = await database
        .select(personalAiGenerationRequestSelection)
        .from(aiGenerationTask)
        .where(
          createPersonalAiGenerationRequestHistoryCondition({
            ownerType: query.ownerType,
            ownerPublicId: query.ownerPublicId,
            actorPublicId: query.actorPublicId,
            taskType: query.taskType,
          }),
        )
        .orderBy(
          desc(aiGenerationTask.requested_at),
          asc(aiGenerationTask.request_public_id),
        )
        .offset(query.offset)
        .limit(query.limit);

      return rows as PersonalAiGenerationRequestPersistenceRow[];
    },
    async countRequestRows(query) {
      const [totalRow] = await getDatabase()
        .select({ value: count() })
        .from(aiGenerationTask)
        .where(
          createPersonalAiGenerationRequestHistoryCondition({
            ownerType: query.ownerType,
            ownerPublicId: query.ownerPublicId,
            actorPublicId: query.actorPublicId,
            taskType: query.taskType,
          }),
        );

      return totalRow?.value ?? 0;
    },
    async findRequestByIdempotencyKey(query) {
      const row = await findRequestByIdempotencyKey(getDatabase(), query);

      return row;
    },
    async insertPendingRequest(input) {
      const [row] = await getDatabase()
        .insert(aiGenerationTask)
        .values({
          public_id: input.taskPublicId,
          request_public_id: input.requestPublicId,
          task_type: input.taskType,
          ai_func_type: input.aiFuncType,
          authorization_public_id: input.authorizationPublicId,
          actor_public_id: input.actorPublicId,
          owner_type: input.ownerType,
          owner_public_id: input.ownerPublicId,
          organization_public_id: input.organizationPublicId,
          quota_owner_type: input.quotaOwnerType,
          quota_owner_public_id: input.quotaOwnerPublicId,
          effective_edition: input.effectiveEdition,
          question_public_id: input.questionPublicId,
          answer_record_public_id: input.answerRecordPublicId,
          paper_public_id: input.paperPublicId,
          mock_exam_public_id: input.mockExamPublicId,
          idempotency_key_hash: input.idempotencyKeyHash,
          task_status: "pending",
          retry_count: 0,
          result_public_id: input.resultPublicId ?? null,
          evidence_status: input.evidenceStatus ?? "none",
          citation_count: input.citationCount ?? 0,
          is_authorization_active: input.isAuthorizationActive,
          is_scope_allowed: input.isScopeAllowed,
          is_quota_available: input.isQuotaAvailable,
          is_runtime_config_ready: input.isRuntimeConfigReady,
          ai_call_log_public_id: input.aiCallLogPublicId ?? null,
          requested_at: input.requestedAt,
          created_at: input.requestedAt,
          updated_at: input.requestedAt,
        })
        .onConflictDoNothing({
          target: [
            aiGenerationTask.owner_public_id,
            aiGenerationTask.idempotency_key_hash,
          ],
        })
        .returning(personalAiGenerationRequestSelection);

      return (
        (row as PersonalAiGenerationRequestPersistenceRow | undefined) ?? null
      );
    },
  });
}

async function findRequestByIdempotencyKey(
  database: RuntimeDatabase,
  query: {
    ownerType?: PersonalAiGenerationRequestOwnerType;
    ownerPublicId: string;
    actorPublicId?: string;
    idempotencyKeyHash: string;
  },
): Promise<PersonalAiGenerationRequestPersistenceRow | null> {
  const [row] = await database
    .select(personalAiGenerationRequestSelection)
    .from(aiGenerationTask)
    .where(createPersonalAiGenerationRequestIdempotencyCondition(query))
    .limit(1);

  return (row as PersonalAiGenerationRequestPersistenceRow | undefined) ?? null;
}

function resolveRequestHistoryLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return DEFAULT_REQUEST_HISTORY_LIMIT;
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    return DEFAULT_REQUEST_HISTORY_LIMIT;
  }

  return Math.min(limit, MAX_REQUEST_HISTORY_LIMIT);
}

function resolveRequestHistoryPage(page: number | undefined): number {
  if (page === undefined) {
    return 1;
  }

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function comparePersonalAiGenerationRequestPersistenceRows(
  leftRow: PersonalAiGenerationRequestPersistenceRow,
  rightRow: PersonalAiGenerationRequestPersistenceRow,
): number {
  const requestedAtComparison =
    rightRow.requested_at.getTime() - leftRow.requested_at.getTime();

  return requestedAtComparison === 0
    ? leftRow.request_public_id.localeCompare(rightRow.request_public_id)
    : requestedAtComparison;
}
