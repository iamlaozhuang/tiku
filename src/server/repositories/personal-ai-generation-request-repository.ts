import { aiGenerationTask } from "@/db/schema";
import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";

import type { PersonalAiGenerationRequestHistoryDto } from "../contracts/personal-ai-generation-request-history-contract";
import type { AiGenerationTaskType } from "../models/ai-generation-task";
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

export type ListPersonalAiGenerationRequestHistoryQuery = {
  ownerPublicId: string;
  limit?: number;
};

export type CreatePersonalAiGenerationRequestInput = {
  requestPublicId: string;
  taskPublicId: string;
  taskType: PersonalAiGenerationTaskType;
  aiFuncType: Exclude<AiFuncType, "scoring">;
  authorizationPublicId: string;
  actorPublicId: string;
  ownerPublicId: string;
  organizationPublicId: string | null;
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
  createOrReuseRequest(
    input: CreatePersonalAiGenerationRequestInput,
  ): Promise<PersonalAiGenerationRequestPersistenceResult>;
};

export type PersonalAiGenerationRequestTaskGateway = {
  listRequestRows(query: {
    ownerPublicId: string;
    limit: number;
  }): Promise<PersonalAiGenerationRequestPersistenceRow[]>;
  findRequestByIdempotencyKey(query: {
    ownerPublicId: string;
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
  task_status: aiGenerationTask.task_status,
  requested_at: aiGenerationTask.requested_at,
  result_public_id: aiGenerationTask.result_public_id,
  evidence_status: aiGenerationTask.evidence_status,
  citation_count: aiGenerationTask.citation_count,
  ai_call_log_public_id: aiGenerationTask.ai_call_log_public_id,
};

export function createPersonalAiGenerationRequestHistoryCondition(
  ownerPublicId: string,
): SQL {
  return and(
    eq(aiGenerationTask.owner_type, "personal"),
    eq(aiGenerationTask.owner_public_id, ownerPublicId),
    inArray(aiGenerationTask.task_type, PERSONAL_AI_GENERATION_TASK_TYPES),
  ) as SQL;
}

export function createPersonalAiGenerationRequestIdempotencyCondition(query: {
  ownerPublicId: string;
  idempotencyKeyHash: string;
}): SQL {
  return and(
    eq(aiGenerationTask.owner_type, "personal"),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    eq(aiGenerationTask.idempotency_key_hash, query.idempotencyKeyHash),
    inArray(aiGenerationTask.task_type, PERSONAL_AI_GENERATION_TASK_TYPES),
  ) as SQL;
}

export function createPersonalAiGenerationRequestRepository(
  gateway: PersonalAiGenerationRequestTaskGateway,
): PersonalAiGenerationRequestRepository {
  return {
    async listRequestHistory(query) {
      const rows = await gateway.listRequestRows({
        ownerPublicId: query.ownerPublicId,
        limit: resolveRequestHistoryLimit(query.limit),
      });

      return [...rows]
        .sort(comparePersonalAiGenerationRequestPersistenceRows)
        .map(mapPersonalAiGenerationRequestRowToHistoryDto);
    },
    async createOrReuseRequest(input) {
      const existingRow = await gateway.findRequestByIdempotencyKey({
        ownerPublicId: input.ownerPublicId,
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
          ownerPublicId: input.ownerPublicId,
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

      return database
        .select(personalAiGenerationRequestSelection)
        .from(aiGenerationTask)
        .where(
          createPersonalAiGenerationRequestHistoryCondition(
            query.ownerPublicId,
          ),
        )
        .orderBy(
          desc(aiGenerationTask.requested_at),
          asc(aiGenerationTask.request_public_id),
        )
        .limit(query.limit);
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
          owner_type: "personal",
          owner_public_id: input.ownerPublicId,
          organization_public_id: input.organizationPublicId,
          quota_owner_type: "personal",
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

      return row ?? null;
    },
  });
}

async function findRequestByIdempotencyKey(
  database: RuntimeDatabase,
  query: {
    ownerPublicId: string;
    idempotencyKeyHash: string;
  },
): Promise<PersonalAiGenerationRequestPersistenceRow | null> {
  const [row] = await database
    .select(personalAiGenerationRequestSelection)
    .from(aiGenerationTask)
    .where(createPersonalAiGenerationRequestIdempotencyCondition(query))
    .limit(1);

  return row ?? null;
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
