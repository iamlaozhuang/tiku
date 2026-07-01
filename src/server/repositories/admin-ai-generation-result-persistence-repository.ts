import { adminAiGenerationResult } from "@/db/schema";
import { and, eq, type SQL } from "drizzle-orm";

import type {
  AdminAiGenerationResultDto,
  AdminAiGenerationResultHistoryQuery,
  AdminAiGenerationResultPersistenceGateway,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  AdminAiGenerationResultPersistenceRow,
  AdminAiGenerationResultTaskRow,
  CreateAdminAiGenerationResultInput,
  FindAdminAiGenerationResultByTaskQuery,
  InsertAdminAiGenerationDraftResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";

const DEFAULT_RESULT_HISTORY_LIMIT = 20;
const MAX_RESULT_HISTORY_LIMIT = 50;

export function createAdminAiGenerationResultHistoryCondition(
  query: Pick<
    AdminAiGenerationResultHistoryQuery,
    "workspace" | "ownerType" | "ownerPublicId" | "generationKind"
  >,
): SQL {
  return and(
    eq(adminAiGenerationResult.workspace, query.workspace),
    eq(adminAiGenerationResult.owner_type, query.ownerType),
    eq(adminAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(adminAiGenerationResult.generation_kind, query.generationKind),
    eq(adminAiGenerationResult.result_status, "draft"),
  ) as SQL;
}

export function createAdminAiGenerationResultByTaskCondition(
  query: FindAdminAiGenerationResultByTaskQuery,
): SQL {
  return and(
    eq(adminAiGenerationResult.workspace, query.workspace),
    eq(adminAiGenerationResult.owner_type, query.ownerType),
    eq(adminAiGenerationResult.owner_public_id, query.ownerPublicId),
    eq(adminAiGenerationResult.task_public_id, query.taskPublicId),
  ) as SQL;
}

export function createAdminAiGenerationResultPersistenceRepository(
  gateway: AdminAiGenerationResultPersistenceGateway,
): AdminAiGenerationResultPersistenceRepository {
  return {
    async listDraftResults(query) {
      const rows = await gateway.listResultRows({
        workspace: query.workspace,
        ownerType: query.ownerType,
        ownerPublicId: query.ownerPublicId,
        generationKind: query.generationKind,
        page: query.page,
        pageSize: query.pageSize,
        limit: resolveResultHistoryLimit(query.limit),
        offset: query.offset,
      });

      return [...rows]
        .sort(compareAdminAiGenerationResultRows)
        .map(mapAdminAiGenerationResultRowToDto);
    },
    async createOrReuseDraftResult(input) {
      const lookupQuery = {
        workspace: input.workspace,
        ownerType: input.ownerType,
        ownerPublicId: input.ownerPublicId,
        taskPublicId: input.taskPublicId,
      };
      const existingRow = await gateway.findResultByTaskPublicId(lookupQuery);

      if (existingRow !== null) {
        return createResultPersistenceResponse("reused", existingRow);
      }

      const taskRow = await gateway.findTaskByPublicId(lookupQuery);

      if (taskRow === null) {
        throw new Error("admin AI generation task was not found.");
      }

      assertTaskMatchesInput(input, taskRow);

      const insertedRow = await gateway.insertDraftResult(
        createServerOwnedDraftResultInput(input, taskRow),
      );
      const resolvedRow =
        insertedRow ?? (await gateway.findResultByTaskPublicId(lookupQuery));

      if (resolvedRow === null) {
        throw new Error("admin AI generation result persistence failed.");
      }

      if (insertedRow !== null) {
        await gateway.attachResultToTask({
          ...lookupQuery,
          resultPublicId: input.resultPublicId,
          evidenceStatus: input.evidenceStatus,
          citationCount: input.citationCount,
          aiCallLogPublicId: input.aiCallLogPublicId,
        });
      }

      return createResultPersistenceResponse(
        insertedRow === null ? "reused" : "created",
        resolvedRow,
      );
    },
  };
}

function createServerOwnedDraftResultInput(
  input: CreateAdminAiGenerationResultInput,
  taskRow: AdminAiGenerationResultTaskRow,
): InsertAdminAiGenerationDraftResultInput {
  return {
    ...input,
    aiGenerationTaskId: taskRow.id,
    requestPublicId: taskRow.request_public_id,
    resultStatus: "draft",
    isFormalAdoptionBlocked: true,
  };
}

function assertTaskMatchesInput(
  input: CreateAdminAiGenerationResultInput,
  taskRow: AdminAiGenerationResultTaskRow,
): void {
  if (
    taskRow.workspace !== input.workspace ||
    taskRow.owner_type !== input.ownerType ||
    taskRow.owner_public_id !== input.ownerPublicId ||
    taskRow.organization_public_id !== input.organizationPublicId ||
    taskRow.task_type !== input.taskType
  ) {
    throw new Error("unsafe admin AI generation result task scope.");
  }
}

function createResultPersistenceResponse(
  persistenceStatus: AdminAiGenerationResultPersistenceResult["persistenceStatus"],
  row: AdminAiGenerationResultPersistenceRow,
): AdminAiGenerationResultPersistenceResult {
  return {
    persistenceStatus,
    result: mapAdminAiGenerationResultRowToDto(row),
  };
}

function mapAdminAiGenerationResultRowToDto(
  row: AdminAiGenerationResultPersistenceRow,
): AdminAiGenerationResultDto {
  return {
    resultPublicId: row.public_id,
    taskPublicId: row.task_public_id,
    requestPublicId: row.request_public_id,
    workspace: row.workspace,
    generationKind: row.generation_kind,
    ownerType: row.owner_type,
    ownerPublicId: row.owner_public_id,
    organizationPublicId: row.organization_public_id,
    taskType: row.task_type,
    status: row.result_status,
    persistedAt: row.created_at.toISOString(),
    contentReference: {
      contentDigest: row.content_digest,
      contentPreviewMasked: row.content_preview_masked,
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      redactionStatus: "redacted",
    },
    sourceReference: {
      sourceQuestionPublicId: row.source_question_public_id,
      sourcePaperPublicId: row.source_paper_public_id,
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
    },
  };
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

function compareAdminAiGenerationResultRows(
  leftRow: AdminAiGenerationResultPersistenceRow,
  rightRow: AdminAiGenerationResultPersistenceRow,
): number {
  const createdAtComparison =
    rightRow.created_at.getTime() - leftRow.created_at.getTime();

  return createdAtComparison === 0
    ? leftRow.public_id.localeCompare(rightRow.public_id)
    : createdAtComparison;
}
