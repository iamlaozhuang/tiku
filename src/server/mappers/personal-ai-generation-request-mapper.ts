import type { PersonalAiGenerationRequestHistoryItemDto } from "../contracts/personal-ai-generation-request-history-contract";
import type {
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "../models/ai-generation-task";
import type { EvidenceStatus } from "../models/ai-rag";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";
import { parseCurrentAiGenerationQuestionType } from "../services/ai-generation-question-type-contract";

export type PersonalAiGenerationRequestPersistenceRow = {
  public_id: string;
  request_public_id: string;
  task_type: Exclude<AiGenerationTaskType, "organization_training_generation">;
  task_status: AiGenerationTaskStatus;
  requested_at: Date;
  result_public_id: string | null;
  evidence_status: EvidenceStatus;
  citation_count: number;
  ai_call_log_public_id: string | null;
  owner_public_id?: string;
  actor_public_id?: string;
  idempotency_key_hash?: string;
  generation_snapshot_version: number | null;
  generation_input_snapshot: unknown | null;
  generation_constraint_snapshot: unknown | null;
  generation_snapshot_digest: string | null;
};

const generationParameterKeys = [
  "difficulty",
  "includeDescendants",
  "knowledgeNode",
  "knowledgeNodeMode",
  "knowledgeNodePublicIds",
  "knowledgeNodeSupplement",
  "learningObjective",
  "level",
  "paperStructure",
  "profession",
  "questionCount",
  "questionType",
  "questionTypeDistribution",
  "sourcePreference",
  "subject",
] as const;

const constraintSnapshotKeys = [
  "authorizationPublicId",
  "authorizationSource",
  "effectiveEdition",
  "level",
  "organizationPublicId",
  "ownerPublicId",
  "ownerType",
  "profession",
  "quotaOwnerPublicId",
  "quotaOwnerType",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();

  return (
    actualKeys.length === sortedExpectedKeys.length &&
    actualKeys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

function isNormalizedOptionalText(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === "string" && value.length > 0 && value.trim() === value)
  );
}

function isNormalizedRequiredText(value: unknown): value is string {
  return (
    typeof value === "string" && value.length > 0 && value.trim() === value
  );
}

function mapGenerationParameters(
  value: unknown,
): AiGenerationRouteIntegratedGenerationParameters | null {
  if (!isRecord(value) || !hasExactKeys(value, generationParameterKeys)) {
    return null;
  }

  const profession = value.profession;
  const level = value.level;
  const subject = value.subject;
  const knowledgeNodeMode = value.knowledgeNodeMode;
  const knowledgeNodePublicIds = value.knowledgeNodePublicIds;
  const sourcePreference = value.sourcePreference;
  const questionTypeDistribution = value.questionTypeDistribution;
  const paperStructure = value.paperStructure;
  const questionType =
    value.questionType === null
      ? null
      : parseCurrentAiGenerationQuestionType(value.questionType);

  if (
    (profession !== "monopoly" &&
      profession !== "marketing" &&
      profession !== "logistics") ||
    (level !== 1 && level !== 2 && level !== 3 && level !== 4 && level !== 5) ||
    (subject !== "theory" && subject !== "skill") ||
    (knowledgeNodeMode !== "balanced" &&
      knowledgeNodeMode !== "selected" &&
      knowledgeNodeMode !== "weak_point_priority" &&
      knowledgeNodeMode !== "comprehensive") ||
    !Array.isArray(knowledgeNodePublicIds) ||
    !knowledgeNodePublicIds.every(isNormalizedRequiredText) ||
    !knowledgeNodePublicIds.every(
      (publicId, index) =>
        index === 0 || knowledgeNodePublicIds[index - 1] < publicId,
    ) ||
    typeof value.includeDescendants !== "boolean" ||
    !isNormalizedOptionalText(value.knowledgeNode) ||
    !isNormalizedOptionalText(value.knowledgeNodeSupplement) ||
    (sourcePreference !== null &&
      sourcePreference !== "balanced" &&
      sourcePreference !== "prefer_platform" &&
      sourcePreference !== "prefer_enterprise") ||
    (value.questionType !== null && questionType === null) ||
    typeof value.questionCount !== "number" ||
    !Number.isInteger(value.questionCount) ||
    value.questionCount < 1 ||
    value.questionCount > 100 ||
    !isNormalizedOptionalText(value.difficulty) ||
    !isNormalizedOptionalText(value.learningObjective) ||
    (questionTypeDistribution !== null &&
      questionTypeDistribution !== "balanced_40_30_30" &&
      questionTypeDistribution !== "single_50_multi_25_true_false_25" &&
      questionTypeDistribution !== "weak_point_priority") ||
    (paperStructure !== null &&
      paperStructure !== "by_question_type" &&
      paperStructure !== "by_knowledge_node")
  ) {
    return null;
  }

  return {
    profession,
    level,
    subject,
    knowledgeNode: value.knowledgeNode,
    knowledgeNodeMode,
    knowledgeNodePublicIds,
    includeDescendants: value.includeDescendants,
    knowledgeNodeSupplement: value.knowledgeNodeSupplement,
    sourcePreference,
    questionType,
    questionCount: value.questionCount,
    difficulty: value.difficulty,
    learningObjective: value.learningObjective,
    questionTypeDistribution,
    paperStructure,
  };
}

function mapGenerationSnapshot(
  row: PersonalAiGenerationRequestPersistenceRow,
): PersonalAiGenerationRequestHistoryItemDto["generationSnapshot"] {
  const inputSnapshot = row.generation_input_snapshot;
  const constraintSnapshot = row.generation_constraint_snapshot;
  const generationParameters =
    isRecord(inputSnapshot) &&
    hasExactKeys(inputSnapshot, ["generationParameters"])
      ? mapGenerationParameters(inputSnapshot.generationParameters)
      : null;

  if (
    row.generation_snapshot_version !== 1 ||
    generationParameters === null ||
    !isRecord(constraintSnapshot) ||
    !hasExactKeys(constraintSnapshot, constraintSnapshotKeys) ||
    row.generation_snapshot_digest === null ||
    !/^sha256:[0-9a-f]{64}$/u.test(row.generation_snapshot_digest) ||
    (constraintSnapshot.authorizationSource !== "personal_auth" &&
      constraintSnapshot.authorizationSource !== "org_auth") ||
    !isNormalizedRequiredText(constraintSnapshot.authorizationPublicId) ||
    (constraintSnapshot.ownerType !== "personal" &&
      constraintSnapshot.ownerType !== "organization") ||
    !isNormalizedRequiredText(constraintSnapshot.ownerPublicId) ||
    !isNormalizedOptionalText(constraintSnapshot.organizationPublicId) ||
    (constraintSnapshot.quotaOwnerType !== "personal" &&
      constraintSnapshot.quotaOwnerType !== "organization") ||
    !isNormalizedRequiredText(constraintSnapshot.quotaOwnerPublicId) ||
    !isNormalizedRequiredText(constraintSnapshot.effectiveEdition) ||
    constraintSnapshot.profession !== generationParameters.profession ||
    constraintSnapshot.level !== generationParameters.level ||
    (constraintSnapshot.authorizationSource === "personal_auth" &&
      (constraintSnapshot.ownerType !== "personal" ||
        constraintSnapshot.organizationPublicId !== null ||
        constraintSnapshot.quotaOwnerType !== "personal" ||
        constraintSnapshot.ownerPublicId !==
          constraintSnapshot.quotaOwnerPublicId)) ||
    (constraintSnapshot.authorizationSource === "org_auth" &&
      (constraintSnapshot.ownerType !== "organization" ||
        constraintSnapshot.organizationPublicId === null ||
        constraintSnapshot.quotaOwnerType !== "organization" ||
        constraintSnapshot.ownerPublicId !==
          constraintSnapshot.organizationPublicId ||
        constraintSnapshot.quotaOwnerPublicId !==
          constraintSnapshot.organizationPublicId))
  ) {
    return {
      status: "unavailable",
      reason: "legacy_snapshot_unavailable",
    };
  }

  return {
    status: "available",
    schemaVersion: 1,
    generationParameters,
    constraints: {
      authorizationSource: constraintSnapshot.authorizationSource,
      effectiveEdition: constraintSnapshot.effectiveEdition,
      profession: generationParameters.profession,
      level: generationParameters.level,
      redactionStatus: "redacted",
    },
  };
}

export function mapPersonalAiGenerationRequestRowToHistoryDto(
  row: PersonalAiGenerationRequestPersistenceRow,
): PersonalAiGenerationRequestHistoryItemDto {
  const effectiveTaskStatus =
    row.task_status === "pending" && row.result_public_id !== null
      ? "succeeded"
      : row.task_status;

  return {
    requestPublicId: row.request_public_id,
    taskPublicId: row.public_id,
    taskType: row.task_type,
    status: effectiveTaskStatus,
    requestedAt: row.requested_at.toISOString(),
    resultPublicId: row.result_public_id,
    evidenceStatus: row.evidence_status,
    citationCount: row.citation_count,
    aiCallLogPublicId: row.ai_call_log_public_id,
    generationSnapshot: mapGenerationSnapshot(row),
    redactionStatus: "redacted",
  };
}
