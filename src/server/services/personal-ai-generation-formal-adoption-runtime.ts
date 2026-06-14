import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AppendAuditLogInput,
} from "../repositories/admin-flow-runtime-repository";
import {
  createPostgresPersonalAiGenerationFormalAdoptionRepository,
  type PersonalAiGenerationFormalAdoptionAuditRepository,
  type PersonalAiGenerationFormalAdoptionRepository,
} from "../repositories/personal-ai-generation-formal-adoption-repository";
import type { SessionService } from "./session-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import { createPersonalAiGenerationFormalAdoptionService } from "./personal-ai-generation-formal-adoption-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type PersonalAiGenerationFormalAdoptionRuntimeRepositories = {
  adoptionRepository: PersonalAiGenerationFormalAdoptionRepository;
  auditLogRepository: PersonalAiGenerationFormalAdoptionAuditRepository;
};

export type PersonalAiGenerationFormalAdoptionRuntimeOptions = {
  repositories?: PersonalAiGenerationFormalAdoptionRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
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

function createDefaultRepositories(): PersonalAiGenerationFormalAdoptionRuntimeRepositories {
  const adminFlowRepositories = createPostgresAdminFlowRuntimeRepositories();

  return {
    adoptionRepository:
      createPostgresPersonalAiGenerationFormalAdoptionRepository(),
    auditLogRepository: adminFlowRepositories.auditLogRepository,
  };
}

function resolveAdminActor(
  sessionResponse: ApiResponse<AuthContextDto | null>,
) {
  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = sessionResponse.data.user.adminRoles ?? [];

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles,
  };
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function withRequestIp(
  auditLogRepository: PersonalAiGenerationFormalAdoptionAuditRepository,
  request: Request,
): PersonalAiGenerationFormalAdoptionAuditRepository {
  return {
    async appendAuditLog(input: AppendAuditLogInput) {
      await auditLogRepository.appendAuditLog({
        ...input,
        requestIp: readRequestIp(request),
      });
    },
  };
}

export function createPersonalAiGenerationFormalAdoptionRuntimeRouteHandlers(
  options: PersonalAiGenerationFormalAdoptionRuntimeOptions = {},
) {
  const repositories = options.repositories ?? createDefaultRepositories();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  return createRouteHandlersWithErrorEnvelope({
    formalAdoptionReviews: {
      async POST(request: Request, context: RouteContext): Promise<Response> {
        const sessionResponse = await sessionService.getCurrentSession({
          authorization: request.headers.get("authorization"),
        });
        const actor = resolveAdminActor(sessionResponse);

        if (actor === null) {
          return createJsonResponse(adminSessionRequiredResponse);
        }

        const { publicId } = await context.params;
        const requestBody = await readRequestJson(request);
        const service = createPersonalAiGenerationFormalAdoptionService({
          adoptionRepository: repositories.adoptionRepository,
          auditLogRepository: withRequestIp(
            repositories.auditLogRepository,
            request,
          ),
        });

        return createJsonResponse(
          await service.reviewFormalAdoption({
            ...(typeof requestBody === "object" && requestBody !== null
              ? requestBody
              : {}),
            actor,
            resultPublicId: publicId,
          }),
        );
      },
    },
  });
}
