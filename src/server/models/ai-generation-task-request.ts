import type {
  AiGenerationTaskFailureCategory,
  AiGenerationTaskStatus,
  AiGenerationTaskType,
} from "./ai-generation-task";
import type { EvidenceStatus } from "./ai-rag";

export type AiGenerationTaskRequestRuntimeStatus = "local_contract_only";

export type AiGenerationTaskRequestDecision =
  | "create_pending_task"
  | "reuse_existing_task"
  | "reject_request";

export type AiGenerationTaskRequestAuthorizationSource =
  | "personal_auth"
  | "org_auth";

export type AiGenerationTaskRequestOwnerType =
  | "personal"
  | "organization"
  | "platform";

export type AiGenerationTaskRequestEffectiveEdition = "advanced" | "standard";

export type AiGenerationTaskResultKind =
  | "ai_generated_question_set"
  | "ai_generated_paper_draft"
  | "organization_training_draft";

export type AiGenerationTaskResultContentVisibility = "summary_only";

export type AiGenerationTaskRequestPolicyInput = {
  taskPublicId: string;
  taskType: AiGenerationTaskType;
  actorPublicId: string;
  authorizationSource: AiGenerationTaskRequestAuthorizationSource;
  authorizationPublicId: string;
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: AiGenerationTaskRequestOwnerType;
  quotaOwnerPublicId: string;
  effectiveEdition: AiGenerationTaskRequestEffectiveEdition;
  isAuthorizationActive: boolean;
  isScopeAllowed: boolean;
  isQuotaAvailable: boolean;
  isRuntimeConfigReady: boolean;
  idempotencyKeyHash: string;
  existingTaskPublicId: string | null;
  existingTaskStatus: AiGenerationTaskStatus | null;
  resultPublicId: string | null;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
};

export type AiGenerationTaskRequestPolicy = {
  decision: AiGenerationTaskRequestDecision;
  taskPublicId: string;
  initialStatus: AiGenerationTaskStatus | null;
  blockedFailureCategory: AiGenerationTaskFailureCategory | null;
};

export function resolveAiGenerationTaskResultKind(
  taskType: AiGenerationTaskType,
): AiGenerationTaskResultKind {
  if (taskType === "ai_question_generation") {
    return "ai_generated_question_set";
  }

  if (taskType === "ai_paper_generation") {
    return "ai_generated_paper_draft";
  }

  return "organization_training_draft";
}

export function resolveAiGenerationTaskRequestPolicy(
  input: AiGenerationTaskRequestPolicyInput,
): AiGenerationTaskRequestPolicy {
  if (
    input.existingTaskPublicId !== null &&
    input.existingTaskStatus !== null
  ) {
    return {
      decision: "reuse_existing_task",
      taskPublicId: input.existingTaskPublicId,
      initialStatus: input.existingTaskStatus,
      blockedFailureCategory: null,
    };
  }

  const blockedFailureCategory =
    resolveBlockedAiGenerationTaskRequestFailureCategory(input);

  if (blockedFailureCategory !== null) {
    return {
      decision: "reject_request",
      taskPublicId: input.taskPublicId,
      initialStatus: null,
      blockedFailureCategory,
    };
  }

  return {
    decision: "create_pending_task",
    taskPublicId: input.taskPublicId,
    initialStatus: "pending",
    blockedFailureCategory: null,
  };
}

export function resolveAiGenerationTaskResultReferencePublicId(
  input: AiGenerationTaskRequestPolicyInput,
  policy: AiGenerationTaskRequestPolicy,
): string | null {
  if (policy.decision === "reuse_existing_task") {
    return input.resultPublicId;
  }

  return null;
}

function resolveBlockedAiGenerationTaskRequestFailureCategory(
  input: AiGenerationTaskRequestPolicyInput,
): AiGenerationTaskFailureCategory | null {
  if (input.effectiveEdition !== "advanced") {
    return "edition_not_allowed";
  }

  if (!input.isAuthorizationActive) {
    return "authorization_invalid";
  }

  if (!matchesTaskAuthorizationBoundary(input)) {
    return "authorization_invalid";
  }

  if (!input.isScopeAllowed) {
    return "scope_forbidden";
  }

  if (!input.isQuotaAvailable) {
    return "quota_insufficient";
  }

  if (!input.isRuntimeConfigReady) {
    return "production_enablement_blocked";
  }

  return null;
}

function matchesTaskAuthorizationBoundary(
  input: AiGenerationTaskRequestPolicyInput,
): boolean {
  if (input.taskType === "organization_training_generation") {
    return (
      input.authorizationSource === "org_auth" &&
      input.ownerType === "organization" &&
      input.quotaOwnerType === "organization" &&
      input.organizationPublicId !== null
    );
  }

  return matchesLearnerAiGenerationAuthorizationBoundary(input);
}

function matchesLearnerAiGenerationAuthorizationBoundary(
  input: AiGenerationTaskRequestPolicyInput,
): boolean {
  if (input.authorizationSource === "personal_auth") {
    return (
      input.ownerType === "personal" &&
      input.quotaOwnerType === "personal" &&
      input.organizationPublicId === null
    );
  }

  return (
    input.ownerType === "organization" &&
    input.quotaOwnerType === "organization" &&
    input.organizationPublicId !== null &&
    input.ownerPublicId === input.organizationPublicId &&
    input.quotaOwnerPublicId === input.organizationPublicId
  );
}
