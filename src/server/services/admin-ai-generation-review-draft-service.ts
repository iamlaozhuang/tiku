import {
  ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES,
  type AdminAiGenerationReviewDraftRepository,
  type AdminAiGenerationReviewDraftService,
} from "../contracts/admin-ai-generation-review-draft-contract";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../contracts/api-response";

const allowedRoles = new Set(["super_admin", "content_admin"]);

function canReviewContent(roles: string[]): boolean {
  return roles.some((role) => allowedRoles.has(role));
}

function resolveReviewRole(
  roles: string[],
): "super_admin" | "content_admin" | null {
  if (roles.includes("super_admin")) {
    return "super_admin";
  }
  return roles.includes("content_admin") ? "content_admin" : null;
}

export function createAdminAiGenerationReviewDraftService(
  repository: AdminAiGenerationReviewDraftRepository,
): AdminAiGenerationReviewDraftService {
  return {
    async getCurrentReviewDraft(input) {
      if (!canReviewContent(input.actor.roles)) {
        return createErrorResponse(
          ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES.forbidden,
          "Admin AI generation review draft access denied.",
        );
      }

      const current = await repository.findCurrentReviewDraft({
        actorPublicId: input.actor.publicId,
        resultPublicId: input.resultPublicId,
      });
      if (current === null) {
        return createErrorResponse(
          ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES.notFound,
          "Admin AI generation review draft not found.",
        );
      }
      return createSuccessResponse(current);
    },

    async saveReviewDraft(input) {
      const actorRole = resolveReviewRole(input.actor.roles);
      if (actorRole === null) {
        return createErrorResponse(
          ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES.forbidden,
          "Admin AI generation review draft access denied.",
        );
      }

      const saved = await repository.saveReviewDraft({
        actorPublicId: input.actor.publicId,
        actorRole,
        resultPublicId: input.resultPublicId,
        command: input.command,
      });
      if (saved === null) {
        return createErrorResponse(
          ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES.conflict,
          "Admin AI generation review draft conflict.",
        );
      }
      return createSuccessResponse(saved);
    },
  };
}
