import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES,
  type AdminAiGenerationReviewDraftActor,
  type AdminAiGenerationReviewDraftRepository,
} from "../contracts/admin-ai-generation-review-draft-contract";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import { createPostgresAdminAiGenerationReviewDraftRepository } from "../repositories/admin-ai-generation-review-draft-db-adapter";
import { createAdminAiGenerationReviewDraftService } from "./admin-ai-generation-review-draft-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import type { SessionService } from "./session-service";
import { normalizeAdminAiGenerationReviewDraftCommand } from "../validators/admin-ai-generation-review-draft";

type RouteContext = {
  params: Promise<{ publicId: string }>;
};

export type AdminAiGenerationReviewDraftRuntimeOptions = {
  repository?: AdminAiGenerationReviewDraftRepository;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

function createJsonResponse<T>(response: ApiResponse<T>, status = 200) {
  return Response.json(response, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function resolveActor(
  response: ApiResponse<AuthContextDto | null>,
): AdminAiGenerationReviewDraftActor | null {
  if (response.code !== 0 || response.data === null) {
    return null;
  }
  const publicId = response.data.user.adminPublicId ?? null;
  const roles = response.data.user.adminRoles ?? [];
  return publicId === null ? null : { publicId, roles };
}

export function createAdminAiGenerationReviewDraftRuntimeRouteHandlers(
  options: AdminAiGenerationReviewDraftRuntimeOptions = {},
) {
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const repository =
    options.repository ??
    createPostgresAdminAiGenerationReviewDraftRepository();

  async function authenticate(request: Request) {
    return resolveActor(
      await sessionService.getCurrentSession({
        authorization: getRequestAuthorization(request),
      }),
    );
  }

  return createRouteHandlersWithErrorEnvelope({
    reviewDrafts: {
      async GET(request: Request, context: RouteContext) {
        const actor = await authenticate(request);
        if (actor === null) {
          return createJsonResponse(
            createErrorResponse(401001, "Admin session is required."),
            401,
          );
        }
        const { publicId } = await context.params;
        return createJsonResponse(
          await createAdminAiGenerationReviewDraftService(
            repository,
          ).getCurrentReviewDraft({ actor, resultPublicId: publicId }),
        );
      },
      async PUT(request: Request, context: RouteContext) {
        const actor = await authenticate(request);
        if (actor === null) {
          return createJsonResponse(
            createErrorResponse(401001, "Admin session is required."),
            401,
          );
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          body = null;
        }
        const normalized = normalizeAdminAiGenerationReviewDraftCommand(body);
        if (!normalized.success) {
          return createJsonResponse(
            createErrorResponse(
              ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES.invalidInput,
              normalized.message,
            ),
            400,
          );
        }
        const { publicId } = await context.params;
        return createJsonResponse(
          await createAdminAiGenerationReviewDraftService(
            repository,
          ).saveReviewDraft({
            actor,
            resultPublicId: publicId,
            command: normalized.value,
          }),
        );
      },
    },
  });
}
