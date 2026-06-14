import type { EvidenceStatus } from "./ai-rag";
import type {
  PersonalAiGenerationResultStatus,
  PersonalAiGenerationResultTaskType,
} from "./personal-ai-generation-result";

export const personalAiGenerationFormalAdoptionTargetTypeValues = [
  "question",
  "paper",
] as const;

export const personalAiGenerationFormalAdoptionReviewDecisionValues = [
  "approved",
  "rejected",
] as const;

export type PersonalAiGenerationFormalAdoptionTargetType =
  (typeof personalAiGenerationFormalAdoptionTargetTypeValues)[number];

export type PersonalAiGenerationFormalAdoptionReviewDecision =
  (typeof personalAiGenerationFormalAdoptionReviewDecisionValues)[number];

export type PersonalAiGenerationFormalAdoptionReviewStatus =
  | "approved_for_manual_adoption"
  | "rejected";

export type PersonalAiGenerationFormalTargetWriteStatus =
  "blocked_without_follow_up_task";

export type PersonalAiGenerationFormalAdoptionAdminRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin";

export type PersonalAiGenerationFormalAdoptionActor = {
  publicId: string;
  roles: readonly PersonalAiGenerationFormalAdoptionAdminRole[];
};

export type PersonalAiGenerationFormalAdoptionSourceResult = {
  resultPublicId: string;
  taskPublicId: string;
  requestPublicId: string;
  ownerPublicId: string;
  taskType: PersonalAiGenerationResultTaskType;
  resultStatus: PersonalAiGenerationResultStatus;
  isFormalAdoptionBlocked: boolean;
  contentDigest: string;
  contentPreviewMasked: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
  aiCallLogPublicId: string | null;
};

export type PersonalAiGenerationFormalAdoptionReviewInput = {
  actor: PersonalAiGenerationFormalAdoptionActor;
  resultPublicId: string;
  targetType: PersonalAiGenerationFormalAdoptionTargetType;
  reviewDecision: PersonalAiGenerationFormalAdoptionReviewDecision;
  reviewReasonCategory: string;
  reviewerConfirmed: true;
  reviewedAt: Date;
};

export function isPersonalAiGenerationFormalAdoptionAdminRole(
  role: string,
): role is PersonalAiGenerationFormalAdoptionAdminRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

export function canReviewPersonalAiGenerationFormalAdoption(
  actor: PersonalAiGenerationFormalAdoptionActor,
): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("content_admin")
  );
}
