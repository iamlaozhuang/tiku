import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationFormalAdoptionReviewDecision,
  PersonalAiGenerationFormalAdoptionReviewStatus,
  PersonalAiGenerationFormalAdoptionTargetType,
  PersonalAiGenerationFormalTargetWriteStatus,
} from "../models/personal-ai-generation-formal-adoption";

export const PERSONAL_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES = {
  invalidInput: 400177,
  adminPermissionDenied: 403177,
  resultNotFound: 404177,
  resultNotEligible: 409177,
} as const;

export type PersonalAiGenerationFormalAdoptionReviewDto = {
  adoptionReview: {
    sourceResultPublicId: string;
    sourceTaskPublicId: string;
    sourceOwnerPublicId: string;
    targetType: PersonalAiGenerationFormalAdoptionTargetType;
    reviewDecision: PersonalAiGenerationFormalAdoptionReviewDecision;
    reviewStatus: PersonalAiGenerationFormalAdoptionReviewStatus;
    formalTargetWriteStatus: PersonalAiGenerationFormalTargetWriteStatus;
    reviewerPublicId: string;
    reviewedAt: string;
    sourceReference: {
      contentDigest: string;
      contentPreviewMasked: string;
      evidenceStatus: EvidenceStatus;
      citationCount: number;
      aiCallLogPublicId: string | null;
      redactionStatus: "redacted";
    };
    audit: {
      actionType: string;
      targetResourceType: "personal_ai_generation_result";
      targetPublicId: string;
      redactionStatus: "redacted";
    };
  };
};
