import { personalAiGenerationResult } from "@/db/schema";
import { eq } from "drizzle-orm";

import type { PersonalAiGenerationFormalAdoptionSourceResult } from "../models/personal-ai-generation-formal-adoption";
import type { AppendAuditLogInput } from "./admin-flow-runtime-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type PersonalAiGenerationFormalAdoptionRepository = {
  findDraftResultForReview(
    resultPublicId: string,
  ): Promise<PersonalAiGenerationFormalAdoptionSourceResult | null>;
};

export type PersonalAiGenerationFormalAdoptionAuditRepository = {
  appendAuditLog(input: AppendAuditLogInput): Promise<void>;
};

const formalAdoptionResultSelection = {
  public_id: personalAiGenerationResult.public_id,
  task_public_id: personalAiGenerationResult.task_public_id,
  request_public_id: personalAiGenerationResult.request_public_id,
  owner_public_id: personalAiGenerationResult.owner_public_id,
  task_type: personalAiGenerationResult.task_type,
  result_status: personalAiGenerationResult.result_status,
  content_digest: personalAiGenerationResult.content_digest,
  content_preview_masked: personalAiGenerationResult.content_preview_masked,
  evidence_status: personalAiGenerationResult.evidence_status,
  citation_count: personalAiGenerationResult.citation_count,
  ai_call_log_public_id: personalAiGenerationResult.ai_call_log_public_id,
  is_formal_adoption_blocked:
    personalAiGenerationResult.is_formal_adoption_blocked,
};

type PersonalAiGenerationFormalAdoptionResultRow = {
  public_id: string;
  task_public_id: string;
  request_public_id: string;
  owner_public_id: string;
  task_type: PersonalAiGenerationFormalAdoptionSourceResult["taskType"];
  result_status: PersonalAiGenerationFormalAdoptionSourceResult["resultStatus"];
  content_digest: string;
  content_preview_masked: string;
  evidence_status: PersonalAiGenerationFormalAdoptionSourceResult["evidenceStatus"];
  citation_count: number;
  ai_call_log_public_id: string | null;
  is_formal_adoption_blocked: boolean;
};

export function createPostgresPersonalAiGenerationFormalAdoptionRepository(
  options: RuntimeDatabaseOptions = {},
): PersonalAiGenerationFormalAdoptionRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for personal AI formal adoption review.",
  );

  return {
    async findDraftResultForReview(resultPublicId) {
      const [row] = await getDatabase()
        .select(formalAdoptionResultSelection)
        .from(personalAiGenerationResult)
        .where(eq(personalAiGenerationResult.public_id, resultPublicId))
        .limit(1);

      return row === undefined
        ? null
        : mapFormalAdoptionResultRow(
            row as PersonalAiGenerationFormalAdoptionResultRow,
          );
    },
  };
}

function mapFormalAdoptionResultRow(
  row: PersonalAiGenerationFormalAdoptionResultRow,
): PersonalAiGenerationFormalAdoptionSourceResult {
  return {
    resultPublicId: row.public_id,
    taskPublicId: row.task_public_id,
    requestPublicId: row.request_public_id,
    ownerPublicId: row.owner_public_id,
    taskType: row.task_type,
    resultStatus: row.result_status,
    isFormalAdoptionBlocked: row.is_formal_adoption_blocked,
    contentDigest: row.content_digest,
    contentPreviewMasked: row.content_preview_masked,
    evidenceStatus: row.evidence_status,
    citationCount: row.citation_count,
    aiCallLogPublicId: row.ai_call_log_public_id,
  };
}
