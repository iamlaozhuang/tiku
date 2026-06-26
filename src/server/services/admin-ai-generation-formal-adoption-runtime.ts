import { randomUUID } from "node:crypto";

import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { AdminAiGenerationFormalAdoptionRepository } from "../contracts/admin-ai-generation-formal-adoption-contract";
import type {
  AdminAiGenerationFormalAdoptionActor,
  AdminAiGenerationFormalAdoptionAdminRole,
} from "../models/admin-ai-generation-formal-adoption";
import { createPostgresAdminAiGenerationFormalAdoptionRepository } from "../repositories/admin-ai-generation-formal-adoption-db-adapter";
import {
  ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES,
  ADMIN_AI_GENERATION_FORMAL_ADOPTION_PERMISSION_DENIED_MESSAGE,
  createAdminAiGenerationFormalAdoptionService,
} from "./admin-ai-generation-formal-adoption-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import type { SessionService } from "./session-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type AdminAiGenerationFormalAdoptionRuntimeOptions = {
  adoptionRepository?: AdminAiGenerationFormalAdoptionRepository;
  createAdoptionPublicId?: (input: {
    actorPublicId: string;
    resultPublicId: string;
  }) => string;
  requestClock?: () => Date;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type ResolvedFormalAdoptionActor =
  | {
      status: "allowed";
      actor: AdminAiGenerationFormalAdoptionActor;
    }
  | {
      status: "denied";
    }
  | {
      status: "missing";
    };

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);

const adminFormalAdoptionPermissionDeniedResponse = createErrorResponse(
  ADMIN_AI_GENERATION_FORMAL_ADOPTION_ERROR_CODES.permissionDenied,
  ADMIN_AI_GENERATION_FORMAL_ADOPTION_PERMISSION_DENIED_MESSAGE,
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createDefaultAdoptionPublicId(): string {
  return `admin_ai_formal_adoption_${randomUUID().replaceAll("-", "")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toContentFormalAdoptionRole(
  role: NonNullable<AuthContextDto["user"]["adminRoles"]>[number],
): Extract<
  AdminAiGenerationFormalAdoptionAdminRole,
  "super_admin" | "content_admin"
> | null {
  return role === "super_admin" || role === "content_admin" ? role : null;
}

function resolveFormalAdoptionActor(
  sessionResponse: ApiResponse<AuthContextDto | null>,
): ResolvedFormalAdoptionActor {
  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return { status: "missing" };
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = sessionResponse.data.user.adminRoles ?? [];

  if (adminPublicId === null || adminRoles.length === 0) {
    return { status: "missing" };
  }

  const roles = adminRoles
    .map(toContentFormalAdoptionRole)
    .filter((role): role is NonNullable<typeof role> => role !== null);

  if (roles.length === 0) {
    return { status: "denied" };
  }

  return {
    status: "allowed",
    actor: {
      publicId: adminPublicId,
      roles,
    },
  };
}

export function createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers(
  options: AdminAiGenerationFormalAdoptionRuntimeOptions = {},
) {
  const adoptionRepository =
    options.adoptionRepository ??
    createPostgresAdminAiGenerationFormalAdoptionRepository();
  const createAdoptionPublicId =
    options.createAdoptionPublicId ?? createDefaultAdoptionPublicId;
  const requestClock = options.requestClock ?? (() => new Date());
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  return createRouteHandlersWithErrorEnvelope({
    formalAdoptions: {
      async POST(request: Request, context: RouteContext): Promise<Response> {
        const sessionResponse = await sessionService.getCurrentSession({
          authorization: getRequestAuthorization(request),
        });
        const resolvedActor = resolveFormalAdoptionActor(sessionResponse);

        if (resolvedActor.status === "missing") {
          return createJsonResponse(adminSessionRequiredResponse);
        }

        if (resolvedActor.status === "denied") {
          return createJsonResponse(
            adminFormalAdoptionPermissionDeniedResponse,
          );
        }

        const { publicId } = await context.params;
        const requestBody = await readRequestJson(request);
        const service = createAdminAiGenerationFormalAdoptionService({
          adoptionRepository,
        });

        return createJsonResponse(
          await service.approveFormalAdoption({
            ...(isRecord(requestBody) ? requestBody : {}),
            adoptionPublicId: createAdoptionPublicId({
              actorPublicId: resolvedActor.actor.publicId,
              resultPublicId: publicId,
            }),
            actor: resolvedActor.actor,
            resultPublicId: publicId,
            reviewedAt: requestClock(),
          }),
        );
      },
    },
  });
}
