import type { ApiResponse } from "./api-response";
import type { AdminAiGenerationFormalReviewedDraftPayload } from "./admin-ai-generation-formal-draft-adapter-contract";
import type { AdminAiGenerationReviewDraftTargetType } from "../models/admin-ai-generation-review-draft";

export const ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES = {
  invalidInput: 400018,
  forbidden: 403018,
  notFound: 404018,
  conflict: 409018,
  persistenceFailed: 500018,
} as const;

export type AdminAiGenerationReviewDraftActor = {
  publicId: string;
  roles: string[];
};

export type AdminAiGenerationReviewDraftCommand = {
  expectedRevision: number | null;
  expectedDraftDigest: string | null;
  targetType: AdminAiGenerationReviewDraftTargetType;
  reviewedDraft: AdminAiGenerationFormalReviewedDraftPayload;
};

export type AdminAiGenerationReviewDraftDto = {
  status: "legacy_unversioned" | "versioned";
  resultPublicId: string;
  sourceContentDigest: string;
  targetType: AdminAiGenerationReviewDraftTargetType;
  currentRevision: number | null;
  currentDraftPublicId?: string;
  currentDraftDigest?: string;
  reviewedDraft?: AdminAiGenerationFormalReviewedDraftPayload;
  redactionStatus: "redacted";
};

export type FindAdminAiGenerationReviewDraftInput = {
  actorPublicId: string;
  resultPublicId: string;
};

export type SaveAdminAiGenerationReviewDraftInput =
  FindAdminAiGenerationReviewDraftInput & {
    actorRole: "super_admin" | "content_admin";
    command: AdminAiGenerationReviewDraftCommand;
  };

export type AdminAiGenerationReviewDraftRepository = {
  findCurrentReviewDraft(
    input: FindAdminAiGenerationReviewDraftInput,
  ): Promise<AdminAiGenerationReviewDraftDto | null>;
  saveReviewDraft(
    input: SaveAdminAiGenerationReviewDraftInput,
  ): Promise<AdminAiGenerationReviewDraftDto | null>;
};

export type AdminAiGenerationReviewDraftService = {
  getCurrentReviewDraft(input: {
    actor: AdminAiGenerationReviewDraftActor;
    resultPublicId: string;
  }): Promise<ApiResponse<AdminAiGenerationReviewDraftDto | null>>;
  saveReviewDraft(input: {
    actor: AdminAiGenerationReviewDraftActor;
    resultPublicId: string;
    command: AdminAiGenerationReviewDraftCommand;
  }): Promise<ApiResponse<AdminAiGenerationReviewDraftDto | null>>;
};
