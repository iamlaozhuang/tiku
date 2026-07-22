import {
  adminAiGenerationFormalAdoption,
  adminAiGenerationResult,
  adminAiGenerationTaskMetadata,
  aiGenerationTask,
} from "@/db/schema";
import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";

import type {
  AdminAiGenerationResultPersistenceGateway,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceRow,
  AdminAiGenerationResultTaskRow,
  AttachAdminAiGenerationResultToTaskInput,
  CreateAdminAiGenerationResultInput,
  FindAdminAiGenerationResultByTaskQuery,
  InsertAdminAiGenerationDraftResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type {
  AdminAiGenerationResultOwnerType,
  AdminAiGenerationResultStatus,
  AdminAiGenerationResultTaskType,
} from "../models/admin-ai-generation-result";
import type {
  AdminAiGenerationFormalAdoptionReviewStatus,
  AdminAiGenerationFormalTargetWriteStatus,
} from "../models/admin-ai-generation-formal-adoption";
import type { EvidenceStatus, RedactedJsonObject } from "../models/ai-rag";
import {
  createAdminAiGenerationResultByTaskCondition,
  createAdminAiGenerationResultHistoryCondition,
  createAdminAiGenerationResultPersistenceRepository,
  createAdminAiGenerationResultsByTaskPublicIdsCondition,
} from "./admin-ai-generation-result-persistence-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabase,
  type RuntimeDatabaseOptions,
} from "./runtime-database";
import { createRunningAttemptCondition } from "./ai-generation-task-lifecycle-repository";

type AdminAiGenerationResultInsertValue =
  typeof adminAiGenerationResult.$inferInsert;

type AdminAiGenerationTaskUpdateValue = Pick<
  typeof aiGenerationTask.$inferInsert,
  | "task_status"
  | "result_public_id"
  | "evidence_status"
  | "citation_count"
  | "ai_call_log_public_id"
  | "failure_category"
  | "finished_at"
  | "updated_at"
>;

export type AdminAiGenerationResultPersistenceDbRow = {
  id: number;
  public_id: string;
  ai_generation_task_id: number;
  task_public_id: string;
  request_public_id: string;
  workspace: string;
  generation_kind: string;
  owner_type: string;
  owner_public_id: string;
  organization_public_id: string | null;
  task_type: string;
  result_status: string;
  content_redacted_snapshot: unknown;
  content_digest: string;
  content_preview_masked: string;
  citation_redacted_snapshot: unknown | null;
  evidence_status: string;
  citation_count: number;
  ai_call_log_public_id: string | null;
  source_question_public_id: string | null;
  source_paper_public_id: string | null;
  is_formal_adoption_blocked: boolean;
  formal_adoption_review_status: string | null;
  formal_adoption_target_write_status: string | null;
  formal_adoption_question_public_id: string | null;
  formal_adoption_paper_public_id: string | null;
  formal_adoption_reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type AdminAiGenerationResultTaskDbRow = {
  id: number;
  public_id: string;
  request_public_id: string;
  workspace: string;
  owner_type: string;
  owner_public_id: string;
  organization_public_id: string | null;
  task_type: string;
};

const ADMIN_AI_GENERATION_RESULT_TASK_TYPES = [
  "ai_question_generation",
  "ai_paper_generation",
] as const satisfies readonly AdminAiGenerationResultTaskType[];

const adminAiGenerationResultSelection = {
  id: adminAiGenerationResult.id,
  public_id: adminAiGenerationResult.public_id,
  ai_generation_task_id: adminAiGenerationResult.ai_generation_task_id,
  task_public_id: adminAiGenerationResult.task_public_id,
  request_public_id: adminAiGenerationResult.request_public_id,
  workspace: adminAiGenerationResult.workspace,
  generation_kind: adminAiGenerationResult.generation_kind,
  owner_type: adminAiGenerationResult.owner_type,
  owner_public_id: adminAiGenerationResult.owner_public_id,
  organization_public_id: adminAiGenerationResult.organization_public_id,
  task_type: adminAiGenerationResult.task_type,
  result_status: adminAiGenerationResult.result_status,
  content_redacted_snapshot: adminAiGenerationResult.content_redacted_snapshot,
  content_digest: adminAiGenerationResult.content_digest,
  content_preview_masked: adminAiGenerationResult.content_preview_masked,
  citation_redacted_snapshot:
    adminAiGenerationResult.citation_redacted_snapshot,
  evidence_status: adminAiGenerationResult.evidence_status,
  citation_count: adminAiGenerationResult.citation_count,
  ai_call_log_public_id: adminAiGenerationResult.ai_call_log_public_id,
  source_question_public_id: adminAiGenerationResult.source_question_public_id,
  source_paper_public_id: adminAiGenerationResult.source_paper_public_id,
  is_formal_adoption_blocked:
    adminAiGenerationResult.is_formal_adoption_blocked,
  created_at: adminAiGenerationResult.created_at,
  updated_at: adminAiGenerationResult.updated_at,
};

const adminAiGenerationResultFormalAdoptionReadSelection = {
  formal_adoption_review_status: adminAiGenerationFormalAdoption.review_status,
  formal_adoption_target_write_status:
    adminAiGenerationFormalAdoption.formal_target_write_status,
  formal_adoption_question_public_id:
    adminAiGenerationFormalAdoption.formal_question_public_id,
  formal_adoption_paper_public_id:
    adminAiGenerationFormalAdoption.formal_paper_public_id,
  formal_adoption_reviewed_at: adminAiGenerationFormalAdoption.reviewed_at,
};

const adminAiGenerationResultWithFormalAdoptionSelection = {
  ...adminAiGenerationResultSelection,
  ...adminAiGenerationResultFormalAdoptionReadSelection,
};

const adminAiGenerationResultTaskSelection = {
  id: aiGenerationTask.id,
  public_id: aiGenerationTask.public_id,
  request_public_id: aiGenerationTask.request_public_id,
  workspace: adminAiGenerationTaskMetadata.workspace,
  owner_type: aiGenerationTask.owner_type,
  owner_public_id: aiGenerationTask.owner_public_id,
  organization_public_id: aiGenerationTask.organization_public_id,
  task_type: aiGenerationTask.task_type,
};

export function createAdminAiGenerationResultInsertValue(
  input: InsertAdminAiGenerationDraftResultInput,
): AdminAiGenerationResultInsertValue {
  return {
    public_id: input.resultPublicId,
    ai_generation_task_id: input.aiGenerationTaskId,
    task_public_id: input.taskPublicId,
    request_public_id: input.requestPublicId,
    workspace: input.workspace,
    generation_kind: input.generationKind,
    owner_type: input.ownerType,
    owner_public_id: input.ownerPublicId,
    organization_public_id: input.organizationPublicId,
    task_type: input.taskType,
    result_status: input.resultStatus,
    content_redacted_snapshot: input.contentRedactedSnapshot,
    content_digest: input.contentDigest,
    content_preview_masked: input.contentPreviewMasked,
    citation_redacted_snapshot: input.citationRedactedSnapshot,
    evidence_status: input.evidenceStatus,
    citation_count: input.citationCount,
    ai_call_log_public_id: input.aiCallLogPublicId,
    source_question_public_id: input.sourceQuestionPublicId,
    source_paper_public_id: input.sourcePaperPublicId,
    is_formal_adoption_blocked: input.isFormalAdoptionBlocked,
    created_at: input.createdAt,
    updated_at: input.createdAt,
  };
}

export function createAdminAiGenerationResultTaskUpdateValue(
  input: Pick<
    CreateAdminAiGenerationResultInput,
    | "resultPublicId"
    | "evidenceStatus"
    | "citationCount"
    | "aiCallLogPublicId"
    | "createdAt"
  >,
): AdminAiGenerationTaskUpdateValue {
  return {
    task_status: "succeeded",
    result_public_id: input.resultPublicId,
    evidence_status: input.evidenceStatus,
    citation_count: input.citationCount,
    ai_call_log_public_id: input.aiCallLogPublicId,
    failure_category: null,
    finished_at: input.createdAt,
    updated_at: input.createdAt,
  };
}

export function createPostgresAdminAiGenerationResultPersistenceGateway(
  options: RuntimeDatabaseOptions = {},
): AdminAiGenerationResultPersistenceGateway {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for admin AI generation result persistence.",
  );

  return {
    async listResultRows(query) {
      const rows = await getDatabase()
        .select(adminAiGenerationResultWithFormalAdoptionSelection)
        .from(adminAiGenerationResult)
        .leftJoin(
          adminAiGenerationFormalAdoption,
          createAdminAiGenerationFormalAdoptionReadCondition(),
        )
        .where(createAdminAiGenerationResultHistoryCondition(query))
        .orderBy(
          desc(adminAiGenerationResult.created_at),
          asc(adminAiGenerationResult.public_id),
        )
        .offset(query.offset)
        .limit(query.limit);

      return rows.map((row) =>
        mapAdminAiGenerationResultDbRowToRow(
          normalizeAdminAiGenerationResultDbRow(row),
        ),
      );
    },
    async listResultRowsByTaskPublicIds(query) {
      const rows = await getDatabase()
        .select(adminAiGenerationResultWithFormalAdoptionSelection)
        .from(adminAiGenerationResult)
        .leftJoin(
          adminAiGenerationFormalAdoption,
          createAdminAiGenerationFormalAdoptionReadCondition(),
        )
        .where(createAdminAiGenerationResultsByTaskPublicIdsCondition(query))
        .orderBy(asc(adminAiGenerationResult.task_public_id));

      return rows.map((row) =>
        mapAdminAiGenerationResultDbRowToRow(
          normalizeAdminAiGenerationResultDbRow(row),
        ),
      );
    },
    async findResultByTaskPublicId(query) {
      return findResultByTaskPublicId(getDatabase(), query);
    },
    async findTaskByPublicId(query) {
      const [row] = await getDatabase()
        .select(adminAiGenerationResultTaskSelection)
        .from(aiGenerationTask)
        .innerJoin(
          adminAiGenerationTaskMetadata,
          eq(
            adminAiGenerationTaskMetadata.ai_generation_task_id,
            aiGenerationTask.id,
          ),
        )
        .where(createAdminAiGenerationTaskLookupCondition(query))
        .limit(1);

      return row === undefined
        ? null
        : mapAdminAiGenerationResultTaskDbRowToRow(
            normalizeAdminAiGenerationResultTaskDbRow(row),
          );
    },
    async insertDraftResult(input) {
      const [row] = await getDatabase()
        .insert(adminAiGenerationResult)
        .values(createAdminAiGenerationResultInsertValue(input))
        .onConflictDoNothing({
          target: adminAiGenerationResult.ai_generation_task_id,
        })
        .returning(adminAiGenerationResultSelection);

      return row === undefined
        ? null
        : mapAdminAiGenerationResultDbRowToRow(
            normalizeAdminAiGenerationResultDbRow(
              createAdminAiGenerationResultDbRowWithoutFormalAdoption(row),
            ),
          );
    },
    async insertDraftResultAndCompleteTask(input) {
      return persistAdminAiGenerationDraftResultAndCompleteTask(
        getDatabase(),
        input,
      );
    },
    async attachResultToTask(input) {
      await getDatabase()
        .update(aiGenerationTask)
        .set(createAdminAiGenerationResultTaskUpdateValue(toTaskUpdate(input)))
        .where(createAdminAiGenerationTaskUpdateCondition(input));
    },
  };
}

export async function persistAdminAiGenerationDraftResultAndCompleteTask(
  database: RuntimeDatabase,
  input: InsertAdminAiGenerationDraftResultInput,
): Promise<AdminAiGenerationResultPersistenceRow | null> {
  return database.transaction(async (transaction) => {
    const [insertedRow] = await transaction
      .insert(adminAiGenerationResult)
      .values(createAdminAiGenerationResultInsertValue(input))
      .onConflictDoNothing({
        target: adminAiGenerationResult.ai_generation_task_id,
      })
      .returning(adminAiGenerationResultSelection);

    if (insertedRow === undefined) {
      return null;
    }

    const [updatedTaskRow] = await transaction
      .update(aiGenerationTask)
      .set(createAdminAiGenerationResultTaskUpdateValue(input))
      .where(
        and(
          createAdminAiGenerationTaskUpdateCondition(input),
          createRunningAttemptCondition(input.attempt),
        ),
      )
      .returning({ public_id: aiGenerationTask.public_id });

    if (updatedTaskRow === undefined) {
      throw new Error("admin AI generation task completion attempt was lost.");
    }

    return mapAdminAiGenerationResultDbRowToRow(
      normalizeAdminAiGenerationResultDbRow(
        createAdminAiGenerationResultDbRowWithoutFormalAdoption(insertedRow),
      ),
    );
  });
}

export function createPostgresAdminAiGenerationResultPersistenceRepository(
  options: RuntimeDatabaseOptions = {},
): AdminAiGenerationResultPersistenceRepository {
  return createAdminAiGenerationResultPersistenceRepository(
    createPostgresAdminAiGenerationResultPersistenceGateway(options),
  );
}

export function mapAdminAiGenerationResultDbRowToRow(
  row: AdminAiGenerationResultPersistenceDbRow,
): AdminAiGenerationResultPersistenceRow {
  if (row.is_formal_adoption_blocked !== true) {
    throw new Error("unsafe admin AI generation formal adoption boundary");
  }

  return {
    public_id: row.public_id,
    ai_generation_task_id: row.ai_generation_task_id,
    task_public_id: row.task_public_id,
    request_public_id: row.request_public_id,
    workspace: toAdminAiGenerationWorkspace(row.workspace),
    generation_kind: toAdminAiGenerationKind(row.generation_kind),
    owner_type: toAdminAiGenerationResultOwnerType(row.owner_type),
    owner_public_id: row.owner_public_id,
    organization_public_id: row.organization_public_id,
    task_type: toAdminAiGenerationResultTaskType(row.task_type),
    result_status: toAdminAiGenerationResultStatus(row.result_status),
    content_redacted_snapshot: toRedactedJsonObject(
      row.content_redacted_snapshot,
    ),
    content_digest: row.content_digest,
    content_preview_masked: row.content_preview_masked,
    citation_redacted_snapshot:
      row.citation_redacted_snapshot === null
        ? null
        : toRedactedJsonObject(row.citation_redacted_snapshot),
    evidence_status: toEvidenceStatus(row.evidence_status),
    citation_count: row.citation_count,
    ai_call_log_public_id: row.ai_call_log_public_id,
    source_question_public_id: row.source_question_public_id,
    source_paper_public_id: row.source_paper_public_id,
    is_formal_adoption_blocked: true,
    formal_adoption_review_status: toFormalAdoptionReviewStatus(
      row.formal_adoption_review_status,
    ),
    formal_adoption_target_write_status: toFormalTargetWriteStatus(
      row.formal_adoption_target_write_status,
    ),
    formal_adoption_question_public_id: row.formal_adoption_question_public_id,
    formal_adoption_paper_public_id: row.formal_adoption_paper_public_id,
    formal_adoption_reviewed_at: row.formal_adoption_reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function findResultByTaskPublicId(
  database: RuntimeDatabase,
  query: FindAdminAiGenerationResultByTaskQuery,
): Promise<AdminAiGenerationResultPersistenceRow | null> {
  const [row] = await database
    .select(adminAiGenerationResultWithFormalAdoptionSelection)
    .from(adminAiGenerationResult)
    .leftJoin(
      adminAiGenerationFormalAdoption,
      createAdminAiGenerationFormalAdoptionReadCondition(),
    )
    .where(createAdminAiGenerationResultByTaskCondition(query))
    .limit(1);

  return row === undefined
    ? null
    : mapAdminAiGenerationResultDbRowToRow(
        normalizeAdminAiGenerationResultDbRow(row),
      );
}

function createAdminAiGenerationTaskLookupCondition(
  query: FindAdminAiGenerationResultByTaskQuery,
): SQL {
  return and(
    eq(adminAiGenerationTaskMetadata.workspace, query.workspace),
    eq(aiGenerationTask.owner_type, query.ownerType),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    eq(aiGenerationTask.public_id, query.taskPublicId),
    inArray(aiGenerationTask.task_type, ADMIN_AI_GENERATION_RESULT_TASK_TYPES),
  ) as SQL;
}

function createAdminAiGenerationFormalAdoptionReadCondition(): SQL {
  return and(
    eq(
      adminAiGenerationFormalAdoption.source_result_public_id,
      adminAiGenerationResult.public_id,
    ),
    eq(
      adminAiGenerationFormalAdoption.target_type,
      adminAiGenerationResult.generation_kind,
    ),
    eq(
      adminAiGenerationFormalAdoption.target_domain,
      "platform_formal_content",
    ),
  ) as SQL;
}

function createAdminAiGenerationTaskUpdateCondition(
  query: AttachAdminAiGenerationResultToTaskInput,
): SQL {
  return and(
    eq(aiGenerationTask.owner_type, query.ownerType),
    eq(aiGenerationTask.owner_public_id, query.ownerPublicId),
    eq(aiGenerationTask.public_id, query.taskPublicId),
    inArray(aiGenerationTask.task_type, ADMIN_AI_GENERATION_RESULT_TASK_TYPES),
  ) as SQL;
}

function toTaskUpdate(
  input: AttachAdminAiGenerationResultToTaskInput,
): Pick<
  CreateAdminAiGenerationResultInput,
  | "resultPublicId"
  | "evidenceStatus"
  | "citationCount"
  | "aiCallLogPublicId"
  | "createdAt"
> {
  return {
    resultPublicId: input.resultPublicId,
    evidenceStatus: input.evidenceStatus,
    citationCount: input.citationCount,
    aiCallLogPublicId: input.aiCallLogPublicId,
    createdAt: new Date(),
  };
}

function normalizeAdminAiGenerationResultDbRow(
  row: unknown,
): AdminAiGenerationResultPersistenceDbRow {
  return row as AdminAiGenerationResultPersistenceDbRow;
}

function createAdminAiGenerationResultDbRowWithoutFormalAdoption(
  row: Omit<
    AdminAiGenerationResultPersistenceDbRow,
    | "formal_adoption_paper_public_id"
    | "formal_adoption_question_public_id"
    | "formal_adoption_review_status"
    | "formal_adoption_reviewed_at"
    | "formal_adoption_target_write_status"
  >,
): AdminAiGenerationResultPersistenceDbRow {
  return {
    ...row,
    formal_adoption_review_status: null,
    formal_adoption_target_write_status: null,
    formal_adoption_question_public_id: null,
    formal_adoption_paper_public_id: null,
    formal_adoption_reviewed_at: null,
  };
}

function normalizeAdminAiGenerationResultTaskDbRow(
  row: unknown,
): AdminAiGenerationResultTaskDbRow {
  return row as AdminAiGenerationResultTaskDbRow;
}

function mapAdminAiGenerationResultTaskDbRowToRow(
  row: AdminAiGenerationResultTaskDbRow,
): AdminAiGenerationResultTaskRow {
  return {
    id: row.id,
    public_id: row.public_id,
    request_public_id: row.request_public_id,
    workspace: toAdminAiGenerationWorkspace(row.workspace),
    owner_type: toAdminAiGenerationResultOwnerType(row.owner_type),
    owner_public_id: row.owner_public_id,
    organization_public_id: row.organization_public_id,
    task_type: toAdminAiGenerationResultTaskType(row.task_type),
  };
}

function toAdminAiGenerationWorkspace(
  value: string,
): AdminAiGenerationWorkspace {
  if (value === "content" || value === "organization") {
    return value;
  }

  throw new Error("invalid admin AI generation workspace.");
}

function toAdminAiGenerationKind(value: string): AdminAiGenerationKind {
  if (value === "question" || value === "paper") {
    return value;
  }

  throw new Error("invalid admin AI generation kind.");
}

function toAdminAiGenerationResultOwnerType(
  value: string,
): AdminAiGenerationResultOwnerType {
  if (value === "platform" || value === "organization") {
    return value;
  }

  throw new Error("invalid admin AI generation result owner type.");
}

function toAdminAiGenerationResultTaskType(
  value: string,
): AdminAiGenerationResultTaskType {
  if (
    ADMIN_AI_GENERATION_RESULT_TASK_TYPES.includes(
      value as AdminAiGenerationResultTaskType,
    )
  ) {
    return value as AdminAiGenerationResultTaskType;
  }

  throw new Error("invalid admin AI generation result task type.");
}

function toAdminAiGenerationResultStatus(
  value: string,
): AdminAiGenerationResultStatus {
  if (value === "draft" || value === "discarded") {
    return value;
  }

  throw new Error("invalid admin AI generation result status.");
}

function toEvidenceStatus(value: string): EvidenceStatus {
  if (value === "sufficient" || value === "weak" || value === "none") {
    return value;
  }

  throw new Error("invalid evidence status.");
}

function toFormalAdoptionReviewStatus(
  value: string | null,
): AdminAiGenerationFormalAdoptionReviewStatus | null {
  if (value === null) {
    return null;
  }

  if (value === "approved_for_formal_adoption" || value === "rejected") {
    return value;
  }

  throw new Error("invalid admin AI generation formal adoption review status.");
}

function toFormalTargetWriteStatus(
  value: string | null,
): AdminAiGenerationFormalTargetWriteStatus | null {
  if (value === null) {
    return null;
  }

  if (value === "blocked_without_follow_up_task" || value === "draft_created") {
    return value;
  }

  throw new Error("invalid admin AI generation formal target write status.");
}

function toRedactedJsonObject(value: unknown): RedactedJsonObject {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as RedactedJsonObject;
  }

  throw new Error("invalid admin AI generation redacted result snapshot.");
}
