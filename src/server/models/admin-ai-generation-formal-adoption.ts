import type {
  AdminAiGenerationKind,
  AdminAiGenerationWorkspace,
} from "../contracts/admin-ai-generation-local-contract";
import type {
  AdminAiGenerationResultOwnerType,
  AdminAiGenerationResultStatus,
  AdminAiGenerationResultTaskType,
} from "./admin-ai-generation-result";
import type { EvidenceStatus } from "./ai-rag";

export const adminAiGenerationFormalAdoptionTargetTypeValues = [
  "question",
  "paper",
] as const;

export const adminAiGenerationFormalAdoptionReviewDecisionValues = [
  "approved",
  "rejected",
] as const;

export type AdminAiGenerationFormalAdoptionTargetType =
  (typeof adminAiGenerationFormalAdoptionTargetTypeValues)[number];

export type AdminAiGenerationFormalAdoptionTargetDomain =
  "platform_formal_content";

export type AdminAiGenerationFormalAdoptionReviewDecision =
  (typeof adminAiGenerationFormalAdoptionReviewDecisionValues)[number];

export type AdminAiGenerationFormalAdoptionReviewStatus =
  | "approved_for_formal_adoption"
  | "rejected";

export type AdminAiGenerationFormalTargetWriteStatus =
  | "blocked_without_follow_up_task"
  | "draft_created";

export type AdminAiGenerationFormalAdoptionAdminRole =
  | "super_admin"
  | "content_admin"
  | "org_admin";

export type AdminAiGenerationFormalAdoptionActor = {
  publicId: string;
  roles: readonly AdminAiGenerationFormalAdoptionAdminRole[];
};

export type AdminAiGenerationFormalAdoptionSourceResult = {
  resultPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  generationKind: AdminAiGenerationKind;
  ownerType: AdminAiGenerationResultOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskType: AdminAiGenerationResultTaskType;
  resultStatus: AdminAiGenerationResultStatus;
  isFormalAdoptionBlocked: boolean;
  contentDigest: string;
  contentPreviewMasked: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
};

export type AdminAiGenerationFormalAdoptionCommandInput = {
  adoptionPublicId: string;
  actor: AdminAiGenerationFormalAdoptionActor;
  resultPublicId: string;
  targetType: AdminAiGenerationFormalAdoptionTargetType;
  reviewDecision: AdminAiGenerationFormalAdoptionReviewDecision;
  reviewerConfirmed: boolean;
  weakEvidenceConfirmed?: boolean;
  reviewedAt: Date;
};

export function canAdoptAdminAiGenerationPlatformFormalContent(
  actor: AdminAiGenerationFormalAdoptionActor,
): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("content_admin")
  );
}

export function resolveAdminAiGenerationTaskTypeForFormalTarget(
  targetType: AdminAiGenerationFormalAdoptionTargetType,
): AdminAiGenerationResultTaskType {
  return targetType === "question"
    ? "ai_question_generation"
    : "ai_paper_generation";
}
