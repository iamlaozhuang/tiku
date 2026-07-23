import {
  adminAiGenerationFormalAdoption,
  adminAiGenerationResult,
  knowledgeBase,
  knowledgeNode,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

import type {
  AdminAiGenerationFormalAdoptionGateway,
  AdminAiGenerationFormalAdoptionRepository,
  AdminAiGenerationFormalAdoptionRow,
  AdminAiGenerationKnowledgeNodeCandidateSnapshot,
  AdminAiGenerationKnowledgeNodeResolutionSnapshot,
  FindAdminAiGenerationFormalAdoptionQuery,
  InsertAdminAiGenerationFormalAdoptionInput,
  MarkAdminAiGenerationFormalDraftCreatedInput,
} from "../contracts/admin-ai-generation-formal-adoption-contract";
import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type {
  AdminAiGenerationFormalAdoptionReviewStatus,
  AdminAiGenerationFormalAdoptionSourceResult,
  AdminAiGenerationFormalAdoptionTargetDomain,
  AdminAiGenerationFormalAdoptionTargetType,
  AdminAiGenerationFormalTargetWriteStatus,
} from "../models/admin-ai-generation-formal-adoption";
import type {
  AdminAiGenerationResultOwnerType,
  AdminAiGenerationResultStatus,
  AdminAiGenerationResultTaskType,
} from "../models/admin-ai-generation-result";
import type { EvidenceStatus } from "../models/ai-rag";
import { createAdminAiGenerationFormalAdoptionRepository } from "./admin-ai-generation-formal-adoption-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

type AdminAiGenerationFormalAdoptionInsertValue =
  typeof adminAiGenerationFormalAdoption.$inferInsert;

export type AdminAiGenerationFormalAdoptionDbRow = {
  id: number;
  public_id: string;
  source_result_public_id: string;
  source_task_public_id: string;
  source_request_public_id: string;
  workspace: string;
  generation_kind: string;
  owner_type: string;
  owner_public_id: string;
  organization_public_id: string | null;
  target_type: string;
  target_domain: string;
  review_status: string;
  formal_target_write_status: string;
  formal_question_public_id: string | null;
  formal_paper_public_id: string | null;
  reviewer_public_id: string;
  reviewed_at: Date;
  content_digest: string;
  content_preview_masked: string;
  evidence_status: string;
  citation_count: number;
  ai_call_log_public_id: string | null;
  knowledge_node_candidate_snapshot: AdminAiGenerationKnowledgeNodeCandidateSnapshot | null;
  knowledge_node_candidate_digest: string | null;
  knowledge_node_resolution_snapshot: AdminAiGenerationKnowledgeNodeResolutionSnapshot | null;
  knowledge_node_resolution_digest: string | null;
  created_at: Date;
  updated_at: Date;
};

export type AdminAiGenerationFormalAdoptionSourceResultDbRow = {
  public_id: string;
  task_public_id: string;
  request_public_id: string;
  workspace: string;
  generation_kind: string;
  owner_type: string;
  owner_public_id: string;
  organization_public_id: string | null;
  task_type: string;
  result_status: string;
  is_formal_adoption_blocked: boolean;
  content_redacted_snapshot: unknown;
  content_digest: string;
  content_preview_masked: string;
  evidence_status: string;
  citation_count: number;
  ai_call_log_public_id: string | null;
};

const adminAiGenerationFormalAdoptionSelection = {
  id: adminAiGenerationFormalAdoption.id,
  public_id: adminAiGenerationFormalAdoption.public_id,
  source_result_public_id:
    adminAiGenerationFormalAdoption.source_result_public_id,
  source_task_public_id: adminAiGenerationFormalAdoption.source_task_public_id,
  source_request_public_id:
    adminAiGenerationFormalAdoption.source_request_public_id,
  workspace: adminAiGenerationFormalAdoption.workspace,
  generation_kind: adminAiGenerationFormalAdoption.generation_kind,
  owner_type: adminAiGenerationFormalAdoption.owner_type,
  owner_public_id: adminAiGenerationFormalAdoption.owner_public_id,
  organization_public_id:
    adminAiGenerationFormalAdoption.organization_public_id,
  target_type: adminAiGenerationFormalAdoption.target_type,
  target_domain: adminAiGenerationFormalAdoption.target_domain,
  review_status: adminAiGenerationFormalAdoption.review_status,
  formal_target_write_status:
    adminAiGenerationFormalAdoption.formal_target_write_status,
  formal_question_public_id:
    adminAiGenerationFormalAdoption.formal_question_public_id,
  formal_paper_public_id:
    adminAiGenerationFormalAdoption.formal_paper_public_id,
  reviewer_public_id: adminAiGenerationFormalAdoption.reviewer_public_id,
  reviewed_at: adminAiGenerationFormalAdoption.reviewed_at,
  content_digest: adminAiGenerationFormalAdoption.content_digest,
  content_preview_masked:
    adminAiGenerationFormalAdoption.content_preview_masked,
  evidence_status: adminAiGenerationFormalAdoption.evidence_status,
  citation_count: adminAiGenerationFormalAdoption.citation_count,
  ai_call_log_public_id: adminAiGenerationFormalAdoption.ai_call_log_public_id,
  knowledge_node_candidate_snapshot:
    adminAiGenerationFormalAdoption.knowledge_node_candidate_snapshot,
  knowledge_node_candidate_digest:
    adminAiGenerationFormalAdoption.knowledge_node_candidate_digest,
  knowledge_node_resolution_snapshot:
    adminAiGenerationFormalAdoption.knowledge_node_resolution_snapshot,
  knowledge_node_resolution_digest:
    adminAiGenerationFormalAdoption.knowledge_node_resolution_digest,
  created_at: adminAiGenerationFormalAdoption.created_at,
  updated_at: adminAiGenerationFormalAdoption.updated_at,
};

const adminAiGenerationFormalAdoptionSourceSelection = {
  public_id: adminAiGenerationResult.public_id,
  task_public_id: adminAiGenerationResult.task_public_id,
  request_public_id: adminAiGenerationResult.request_public_id,
  workspace: adminAiGenerationResult.workspace,
  generation_kind: adminAiGenerationResult.generation_kind,
  owner_type: adminAiGenerationResult.owner_type,
  owner_public_id: adminAiGenerationResult.owner_public_id,
  organization_public_id: adminAiGenerationResult.organization_public_id,
  task_type: adminAiGenerationResult.task_type,
  result_status: adminAiGenerationResult.result_status,
  is_formal_adoption_blocked:
    adminAiGenerationResult.is_formal_adoption_blocked,
  content_redacted_snapshot: adminAiGenerationResult.content_redacted_snapshot,
  content_digest: adminAiGenerationResult.content_digest,
  content_preview_masked: adminAiGenerationResult.content_preview_masked,
  evidence_status: adminAiGenerationResult.evidence_status,
  citation_count: adminAiGenerationResult.citation_count,
  ai_call_log_public_id: adminAiGenerationResult.ai_call_log_public_id,
};

const blockedFormalTargetWriteStatus = "blocked_without_follow_up_task";
const draftCreatedFormalTargetWriteStatus = "draft_created";

export function createAdminAiGenerationFormalAdoptionInsertValue(
  input: InsertAdminAiGenerationFormalAdoptionInput,
): AdminAiGenerationFormalAdoptionInsertValue {
  return {
    public_id: input.adoptionPublicId,
    source_result_public_id: input.sourceResultPublicId,
    source_task_public_id: input.sourceTaskPublicId,
    source_request_public_id: input.sourceRequestPublicId,
    workspace: input.workspace,
    generation_kind: input.generationKind,
    owner_type: input.ownerType,
    owner_public_id: input.ownerPublicId,
    organization_public_id: input.organizationPublicId,
    target_type: input.targetType,
    target_domain: input.targetDomain,
    review_status: input.reviewStatus,
    formal_target_write_status: input.formalTargetWriteStatus,
    formal_question_public_id: input.formalQuestionPublicId,
    formal_paper_public_id: input.formalPaperPublicId,
    reviewer_public_id: input.reviewerPublicId,
    reviewed_at: input.reviewedAt,
    content_digest: input.contentDigest,
    content_preview_masked: input.contentPreviewMasked,
    evidence_status: input.evidenceStatus,
    citation_count: input.citationCount,
    ai_call_log_public_id: input.aiCallLogPublicId,
    knowledge_node_candidate_snapshot: input.knowledgeNodeCandidateSnapshot,
    knowledge_node_candidate_digest: input.knowledgeNodeCandidateDigest,
    knowledge_node_resolution_snapshot: input.knowledgeNodeResolutionSnapshot,
    knowledge_node_resolution_digest: input.knowledgeNodeResolutionDigest,
    created_at: input.createdAt,
    updated_at: input.createdAt,
  };
}

export function createAdminAiGenerationFormalDraftMetadataUpdateValue(
  input: MarkAdminAiGenerationFormalDraftCreatedInput,
): Pick<
  AdminAiGenerationFormalAdoptionInsertValue,
  | "formal_target_write_status"
  | "formal_question_public_id"
  | "formal_paper_public_id"
> {
  assertFormalDraftCreatedInput(input);

  return {
    formal_target_write_status: draftCreatedFormalTargetWriteStatus,
    formal_question_public_id: input.formalQuestionPublicId,
    formal_paper_public_id: input.formalPaperPublicId,
  };
}

export function createPostgresAdminAiGenerationFormalAdoptionGateway(
  options: RuntimeDatabaseOptions = {},
): AdminAiGenerationFormalAdoptionGateway {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for admin AI generation formal adoption.",
  );

  return {
    async findAdoptionBySourceResult(query) {
      const [row] = await getDatabase()
        .select(adminAiGenerationFormalAdoptionSelection)
        .from(adminAiGenerationFormalAdoption)
        .where(createAdminAiGenerationFormalAdoptionLookupCondition(query))
        .limit(1);

      return row === undefined
        ? null
        : mapAdminAiGenerationFormalAdoptionDbRowToRow(
            normalizeAdminAiGenerationFormalAdoptionDbRow(row),
          );
    },
    async findSourceResultForAdoption(resultPublicId) {
      const [row] = await getDatabase()
        .select(adminAiGenerationFormalAdoptionSourceSelection)
        .from(adminAiGenerationResult)
        .where(eq(adminAiGenerationResult.public_id, resultPublicId))
        .limit(1);

      return row === undefined
        ? null
        : mapAdminAiGenerationFormalAdoptionSourceResultDbRowToSourceResult(
            normalizeAdminAiGenerationFormalAdoptionSourceResultDbRow(row),
          );
    },
    async findKnowledgeNodesForResolution(input) {
      if (input.knowledgeNodePublicIds.length === 0) {
        return [];
      }

      const rows = await getDatabase()
        .select({
          publicId: knowledgeNode.public_id,
          knowledgeBasePublicId: knowledgeBase.public_id,
          profession: knowledgeNode.profession,
          levelList: knowledgeNode.level_list,
          knStatus: knowledgeNode.kn_status,
          isRecommendable: knowledgeNode.is_recommendable,
          isKnowledgeBaseEnabled: knowledgeBase.is_enabled,
        })
        .from(knowledgeNode)
        .innerJoin(
          knowledgeBase,
          and(
            eq(knowledgeBase.id, knowledgeNode.knowledge_base_id),
            eq(knowledgeBase.profession, knowledgeNode.profession),
          ),
        )
        .where(inArray(knowledgeNode.public_id, input.knowledgeNodePublicIds))
        .for("share");

      return rows.map((row) => ({
        publicId: row.publicId,
        knowledgeBasePublicId: row.knowledgeBasePublicId,
        profession: toProfession(row.profession),
        levelList: toLevelList(row.levelList),
        isActive: row.knStatus === "active" && row.isKnowledgeBaseEnabled,
        isRecommendable: row.isRecommendable,
      }));
    },
    async insertAdoptionRecord(input) {
      const [row] = await getDatabase()
        .insert(adminAiGenerationFormalAdoption)
        .values(createAdminAiGenerationFormalAdoptionInsertValue(input))
        .onConflictDoNothing({
          target: [
            adminAiGenerationFormalAdoption.source_result_public_id,
            adminAiGenerationFormalAdoption.target_type,
            adminAiGenerationFormalAdoption.target_domain,
          ],
        })
        .returning(adminAiGenerationFormalAdoptionSelection);

      return row === undefined
        ? null
        : mapAdminAiGenerationFormalAdoptionDbRowToRow(
            normalizeAdminAiGenerationFormalAdoptionDbRow(row),
          );
    },
    async updateFormalDraftMetadata(input) {
      const [row] = await getDatabase()
        .update(adminAiGenerationFormalAdoption)
        .set({
          ...createAdminAiGenerationFormalDraftMetadataUpdateValue(input),
          updated_at: new Date(),
        })
        .where(
          and(
            eq(
              adminAiGenerationFormalAdoption.public_id,
              input.adoptionPublicId,
            ),
            eq(adminAiGenerationFormalAdoption.target_type, input.targetType),
          ),
        )
        .returning(adminAiGenerationFormalAdoptionSelection);

      return row === undefined
        ? null
        : mapAdminAiGenerationFormalAdoptionDbRowToRow(
            normalizeAdminAiGenerationFormalAdoptionDbRow(row),
          );
    },
  };
}

export function createPostgresAdminAiGenerationFormalAdoptionRepository(
  options: RuntimeDatabaseOptions = {},
): AdminAiGenerationFormalAdoptionRepository {
  return createAdminAiGenerationFormalAdoptionRepository(
    createPostgresAdminAiGenerationFormalAdoptionGateway(options),
  );
}

export function mapAdminAiGenerationFormalAdoptionDbRowToRow(
  row: AdminAiGenerationFormalAdoptionDbRow,
): AdminAiGenerationFormalAdoptionRow {
  assertFormalTargetWriteSafe(row);

  return {
    adoption_public_id: row.public_id,
    source_result_public_id: row.source_result_public_id,
    source_task_public_id: row.source_task_public_id,
    source_request_public_id: row.source_request_public_id,
    workspace: toAdminAiGenerationWorkspace(row.workspace),
    generation_kind: toAdminAiGenerationKind(row.generation_kind),
    owner_type: toAdminAiGenerationResultOwnerType(row.owner_type),
    owner_public_id: row.owner_public_id,
    organization_public_id: row.organization_public_id,
    target_type: toFormalAdoptionTargetType(row.target_type),
    target_domain: toFormalAdoptionTargetDomain(row.target_domain),
    review_status: toFormalAdoptionReviewStatus(row.review_status),
    formal_target_write_status: toFormalTargetWriteStatus(
      row.formal_target_write_status,
    ),
    formal_question_public_id: row.formal_question_public_id,
    formal_paper_public_id: row.formal_paper_public_id,
    reviewer_public_id: row.reviewer_public_id,
    reviewed_at: row.reviewed_at,
    content_digest: row.content_digest,
    content_preview_masked: row.content_preview_masked,
    evidence_status: toEvidenceStatus(row.evidence_status),
    citation_count: row.citation_count,
    ai_call_log_public_id: row.ai_call_log_public_id,
    knowledge_node_candidate_snapshot: row.knowledge_node_candidate_snapshot,
    knowledge_node_candidate_digest: row.knowledge_node_candidate_digest,
    knowledge_node_resolution_snapshot: row.knowledge_node_resolution_snapshot,
    knowledge_node_resolution_digest: row.knowledge_node_resolution_digest,
    created_at: row.created_at,
  };
}

function toProfession(value: string): "monopoly" | "marketing" | "logistics" {
  if (value === "monopoly" || value === "marketing" || value === "logistics") {
    return value;
  }

  throw new Error("unsafe admin AI generation knowledge node profession");
}

function toLevelList(value: unknown): number[] {
  if (
    !Array.isArray(value) ||
    value.some((level) => !Number.isSafeInteger(level) || level < 1)
  ) {
    throw new Error("unsafe admin AI generation knowledge node level list");
  }

  return value as number[];
}

export function mapAdminAiGenerationFormalAdoptionSourceResultDbRowToSourceResult(
  row: AdminAiGenerationFormalAdoptionSourceResultDbRow,
): AdminAiGenerationFormalAdoptionSourceResult {
  if (row.is_formal_adoption_blocked !== true) {
    throw new Error("unsafe admin AI generation formal adoption boundary");
  }

  return {
    resultPublicId: row.public_id,
    taskPublicId: row.task_public_id,
    requestPublicId: row.request_public_id,
    workspace: toAdminAiGenerationWorkspace(row.workspace),
    generationKind: toAdminAiGenerationKind(row.generation_kind),
    ownerType: toAdminAiGenerationResultOwnerType(row.owner_type),
    ownerPublicId: row.owner_public_id,
    organizationPublicId: row.organization_public_id,
    taskType: toAdminAiGenerationResultTaskType(row.task_type),
    resultStatus: toAdminAiGenerationResultStatus(row.result_status),
    isFormalAdoptionBlocked: true,
    reviewedDraft: resolveTrustedReviewedDraft(row.content_redacted_snapshot),
    contentDigest: row.content_digest,
    contentPreviewMasked: row.content_preview_masked,
    evidenceStatus: toEvidenceStatus(row.evidence_status),
    citationCount: row.citation_count,
    aiCallLogPublicId: row.ai_call_log_public_id,
  };
}

function resolveTrustedReviewedDraft(snapshot: unknown): unknown {
  if (
    typeof snapshot !== "object" ||
    snapshot === null ||
    Array.isArray(snapshot)
  ) {
    return null;
  }

  return (snapshot as Record<string, unknown>).formalReviewedDraft ?? null;
}

function createAdminAiGenerationFormalAdoptionLookupCondition(
  query: FindAdminAiGenerationFormalAdoptionQuery,
) {
  return and(
    eq(
      adminAiGenerationFormalAdoption.source_result_public_id,
      query.sourceResultPublicId,
    ),
    eq(adminAiGenerationFormalAdoption.target_type, query.targetType),
    eq(adminAiGenerationFormalAdoption.target_domain, query.targetDomain),
  );
}

function normalizeAdminAiGenerationFormalAdoptionDbRow(
  row: unknown,
): AdminAiGenerationFormalAdoptionDbRow {
  return row as AdminAiGenerationFormalAdoptionDbRow;
}

function normalizeAdminAiGenerationFormalAdoptionSourceResultDbRow(
  row: unknown,
): AdminAiGenerationFormalAdoptionSourceResultDbRow {
  return row as AdminAiGenerationFormalAdoptionSourceResultDbRow;
}

function assertFormalTargetWriteSafe(
  row: Pick<
    AdminAiGenerationFormalAdoptionDbRow,
    | "target_type"
    | "review_status"
    | "formal_target_write_status"
    | "formal_question_public_id"
    | "formal_paper_public_id"
  >,
): void {
  if (
    row.review_status === "rejected" &&
    row.formal_target_write_status === blockedFormalTargetWriteStatus &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (row.review_status === "rejected") {
    throw new Error("admin AI generation formal rejection cannot write draft");
  }

  if (
    row.formal_target_write_status === blockedFormalTargetWriteStatus &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (
    row.formal_target_write_status === draftCreatedFormalTargetWriteStatus &&
    row.target_type === "question" &&
    row.formal_question_public_id !== null &&
    row.formal_paper_public_id === null
  ) {
    return;
  }

  if (
    row.formal_target_write_status === draftCreatedFormalTargetWriteStatus &&
    row.target_type === "paper" &&
    row.formal_question_public_id === null &&
    row.formal_paper_public_id !== null
  ) {
    return;
  }

  throw new Error("admin AI generation formal target write is not approved");
}

function assertFormalDraftCreatedInput(
  input: MarkAdminAiGenerationFormalDraftCreatedInput,
): void {
  if (
    input.targetType === "question" &&
    (input.formalQuestionPublicId === null ||
      input.formalPaperPublicId !== null)
  ) {
    throw new Error("admin AI generation formal question draft id required");
  }

  if (
    input.targetType === "paper" &&
    (input.formalPaperPublicId === null ||
      input.formalQuestionPublicId !== null)
  ) {
    throw new Error("admin AI generation formal paper draft id required");
  }
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
  if (value === "ai_question_generation" || value === "ai_paper_generation") {
    return value;
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

function toFormalAdoptionTargetType(
  value: string,
): AdminAiGenerationFormalAdoptionTargetType {
  if (value === "question" || value === "paper") {
    return value;
  }

  throw new Error("invalid admin AI generation formal adoption target type.");
}

function toFormalAdoptionTargetDomain(
  value: string,
): AdminAiGenerationFormalAdoptionTargetDomain {
  if (value === "platform_formal_content") {
    return value;
  }

  throw new Error("invalid admin AI generation formal adoption target domain.");
}

function toFormalAdoptionReviewStatus(
  value: string,
): AdminAiGenerationFormalAdoptionReviewStatus {
  if (value === "approved_for_formal_adoption" || value === "rejected") {
    return value;
  }

  throw new Error("invalid admin AI generation formal adoption review status.");
}

function toFormalTargetWriteStatus(
  value: string,
): AdminAiGenerationFormalTargetWriteStatus {
  if (
    value === blockedFormalTargetWriteStatus ||
    value === draftCreatedFormalTargetWriteStatus
  ) {
    return value;
  }

  throw new Error("admin AI generation formal target write is not approved");
}

function toEvidenceStatus(value: string): EvidenceStatus {
  if (value === "sufficient" || value === "weak" || value === "none") {
    return value;
  }

  throw new Error("invalid evidence status.");
}
