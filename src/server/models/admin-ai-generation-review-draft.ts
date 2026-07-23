import type { AdminAiGenerationFormalReviewedDraftPayload } from "../contracts/admin-ai-generation-formal-draft-adapter-contract";

export const adminAiGenerationReviewDraftTargetTypeValues = [
  "question",
  "paper",
] as const;

export type AdminAiGenerationReviewDraftTargetType =
  (typeof adminAiGenerationReviewDraftTargetTypeValues)[number];

export type AdminAiGenerationReviewDraftStatus =
  | "legacy_unversioned"
  | "versioned";

export type AdminAiGenerationReviewDraft = {
  resultPublicId: string;
  sourceContentDigest: string;
  targetType: AdminAiGenerationReviewDraftTargetType;
  reviewedDraft: AdminAiGenerationFormalReviewedDraftPayload;
};
