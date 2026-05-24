import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
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
  type AppendModelConfigAuditLogInput,
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

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const modelConfigNotFoundResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.resourceNotFound,
  "Model config does not exist.",
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

function canManageModelConfig(actor: AdminAiAuditLogActor): boolean {
  return actor.roles.includes("super_admin");
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function readAdminAiAuditLogListQuery(
  request: Request,
): AdminAiAuditLogListQuery {
  const searchParams = new URL(request.url).searchParams;
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const page = Number(searchParams.get("page"));
  const level = Number(searchParams.get("level"));
  const resultStatus = searchParams.get("resultStatus");

  return createAdminAiAuditLogListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAiAuditLogPageSize,
    keyword: searchParams.get("keyword"),
    level: Number.isFinite(level) && level > 0 ? level : null,
    actionType: searchParams.get("actionType") ?? "all",
    targetResourceType: searchParams.get("targetResourceType") ?? "all",
    resultStatus:
      resultStatus === "success" || resultStatus === "failed"
        ? resultStatus
        : "all",
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

  async function appendModelConfigAuditLog(
    request: Request,
    actor: AdminAiAuditLogActor,
    input: Omit<
      AppendModelConfigAuditLogInput,
      "actorPublicId" | "actorRole" | "requestIp"
    >,
  ): Promise<void> {
    if (repositories.appendAuditLog === undefined) {
      return;
    }

    await repositories.appendAuditLog({
      actorPublicId: actor.publicId,
      actorRole: actor.roles[0],
      requestIp: readRequestIp(request),
      ...input,
    });
  }

  async function resolveModelConfigAdminActor(
    request: Request,
    actionType: string,
    targetPublicId: string,
  ): Promise<AdminAiAuditLogActor | ApiResponse<null>> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    if (!canManageModelConfig(actor)) {
      await appendModelConfigAuditLog(request, actor, {
        actionType,
        targetResourceType: "model_config",
        targetPublicId,
        resultStatus: "failed",
        metadataSummary: "redacted model_config permission denial metadata",
      });

      return adminPermissionDeniedResponse;
    }

    return actor;
  }

  async function updateModelConfigEnabled(input: {
    request: Request;
    context: RouteContext;
    actionType: "model_config.enable" | "model_config.disable";
    update: (publicId: string) => Promise<boolean>;
  }): Promise<Response> {
    const { publicId } = await input.context.params;
    const actorOrError = await resolveModelConfigAdminActor(
      input.request,
      input.actionType,
      publicId,
    );

    if ("code" in actorOrError) {
      return createJsonResponse(actorOrError);
    }

    const didUpdate = await input.update(publicId);
    const response = didUpdate
      ? createSuccessResponse(null)
      : modelConfigNotFoundResponse;

    await appendModelConfigAuditLog(input.request, actorOrError, {
      actionType: input.actionType,
      targetResourceType: "model_config",
      targetPublicId: publicId,
      resultStatus: didUpdate ? "success" : "failed",
      metadataSummary: "redacted model_config mutation metadata",
    });

    return createJsonResponse(response);
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
      enable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateModelConfigEnabled({
            request,
            context,
            actionType: "model_config.enable",
            update: repositories.enableModelConfig ?? (async () => false),
          });
        },
      },
      disable: {
        async POST(request: Request, context: RouteContext): Promise<Response> {
          return updateModelConfigEnabled({
            request,
            context,
            actionType: "model_config.disable",
            update: repositories.disableModelConfig ?? (async () => false),
          });
        },
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
