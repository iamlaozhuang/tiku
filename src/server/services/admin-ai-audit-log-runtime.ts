import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  createPaginatedResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_AI_AUDIT_LOG_ERROR_CODES,
  createAdminAiAuditLogListQuery,
  type AdminAiAuditLogListQuery,
  type AdminAiAuditLogPageSize,
} from "../contracts/admin-ai-audit-log-ops-contract";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositoryOptions,
} from "../repositories/admin-ai-audit-log-runtime-repository";
import type { SessionService } from "./session-service";

export type { AdminAiAuditLogRuntimeRepositories };

export type AdminAiAuditLogRuntimeOptions =
  AdminAiAuditLogRuntimeRepositoryOptions & {
    repositories?: AdminAiAuditLogRuntimeRepositories;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

type AdminAiAuditLogRole = "super_admin" | "ops_admin" | "content_admin";

type AdminAiAuditLogActor = {
  publicId: string;
  roles: [AdminAiAuditLogRole, ...AdminAiAuditLogRole[]];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isAdminAiAuditLogRole(role: string): role is AdminAiAuditLogRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminAiAuditLogActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminAiAuditLogRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [AdminAiAuditLogRole, ...AdminAiAuditLogRole[]],
  };
}

function canReadAiAuditLog(actor: AdminAiAuditLogActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function readAdminAiAuditLogListQuery(
  request: Request,
): AdminAiAuditLogListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));
  const level = Number(searchParams.get("level"));

  return createAdminAiAuditLogListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAiAuditLogPageSize,
    keyword: searchParams.get("keyword"),
    level: Number.isFinite(level) && level > 0 ? level : null,
  });
}

function readPageSize(
  searchParams: URLSearchParams,
  options: readonly number[],
  fallback: number,
): number {
  const pageSize = Number(searchParams.get("pageSize"));

  return options.includes(pageSize) ? pageSize : fallback;
}

export function createAdminAiAuditLogRuntimeRouteHandlers(
  options: AdminAiAuditLogRuntimeOptions = {},
) {
  const repositories =
    options.repositories ??
    createPostgresAdminAiAuditLogRuntimeRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireReadableAdminActor(
    request: Request,
  ): Promise<ApiResponse<null> | null> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    void actor.publicId;

    return canReadAiAuditLog(actor) ? null : adminPermissionDeniedResponse;
  }

  return {
    modelConfigs: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const result = await repositories.listModelConfigs(
          readAdminAiAuditLogListQuery(request),
        );

        return createJsonResponse(
          createPaginatedResponse(
            { modelConfigs: result.modelConfigs },
            result.pagination,
          ),
        );
      },
    },
    aiCallLogs: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const result = await repositories.listAiCallLogs(
          readAdminAiAuditLogListQuery(request),
        );

        return createJsonResponse(
          createPaginatedResponse(
            { aiCallLogs: result.aiCallLogs },
            result.pagination,
          ),
        );
      },
    },
    aiCallLogSummary: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const result = await repositories.summarizeAiCallLogs(
          readAdminAiAuditLogListQuery(request),
        );

        return createJsonResponse(
          createPaginatedResponse(
            { dailySummaries: result.dailySummaries },
            result.pagination,
          ),
        );
      },
    },
  };
}
