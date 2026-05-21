import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  createPaginatedResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  createAdminAiAuditLogListQuery,
  type AdminAiAuditLogListQuery,
  type AdminAiAuditLogPageSize,
} from "../contracts/admin-ai-audit-log-ops-contract";
import {
  createAdminContentKnowledgeListQuery,
  type AdminContentKnowledgeListQuery,
  type AdminContentKnowledgePageSize,
} from "../contracts/admin-content-knowledge-ops-contract";
import {
  createAdminAuthOperationListQuery,
  type AdminAuthOperationListQuery,
  type AdminAuthOperationPageSize,
} from "../contracts/admin-user-org-auth-ops-contract";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AdminFlowRuntimeRepositories,
  type AdminFlowRuntimeRepositoryOptions,
} from "../repositories/admin-flow-runtime-repository";
import type { SessionService } from "./session-service";

export type { AdminFlowRuntimeRepositories };

export type AdminFlowRuntimeOptions = AdminFlowRuntimeRepositoryOptions & {
  repositories?: AdminFlowRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type AdminFlowRole = "super_admin" | "ops_admin" | "content_admin";

type AdminFlowActor = {
  publicId: string;
  roles: AdminFlowRole[];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isAdminFlowRole(role: string): role is AdminFlowRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminFlowActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminFlowRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles,
  };
}

function readAdminAuthOperationListQuery(
  request: Request,
): AdminAuthOperationListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));

  return createAdminAuthOperationListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    keyword: searchParams.get("keyword"),
  });
}

function readAdminContentKnowledgeListQuery(
  request: Request,
): AdminContentKnowledgeListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));
  const level = Number(searchParams.get("level"));

  return createAdminContentKnowledgeListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminContentKnowledgePageSize,
    keyword: searchParams.get("keyword"),
    level: Number.isFinite(level) && level > 0 ? level : null,
  });
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

export function createAdminFlowRuntimeRouteHandlers(
  options: AdminFlowRuntimeOptions = {},
) {
  const repositories =
    options.repositories ?? createPostgresAdminFlowRuntimeRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireAdminActor(request: Request) {
    return resolveAdminActor(request, sessionService);
  }

  return {
    users: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          void actor;

          const result = await repositories.userOrgAuthRepository.listUsers(
            readAdminAuthOperationListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse({ users: result.users }, result.pagination),
          );
        },
      },
    },
    questions: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          void actor;

          const result =
            await repositories.contentKnowledgeRepository.listQuestions(
              readAdminContentKnowledgeListQuery(request),
            );

          return createJsonResponse(
            createPaginatedResponse(
              { questions: result.questions },
              result.pagination,
            ),
          );
        },
      },
    },
    papers: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          void actor;

          const result =
            await repositories.contentKnowledgeRepository.listPapers(
              readAdminContentKnowledgeListQuery(request),
            );

          return createJsonResponse(
            createPaginatedResponse(
              { papers: result.papers },
              result.pagination,
            ),
          );
        },
      },
    },
    auditLogs: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          void actor;

          const result = await repositories.auditLogRepository.listAuditLogs(
            readAdminAiAuditLogListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse(
              { auditLogs: result.auditLogs },
              result.pagination,
            ),
          );
        },
      },
    },
  };
}
