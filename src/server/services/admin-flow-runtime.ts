import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
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
  createAdminContentKnowledgeListQuery,
  type AdminContentKnowledgeListQuery,
  type AdminContentKnowledgePageSize,
} from "../contracts/admin-content-knowledge-ops-contract";
import {
  ADMIN_AUTH_OPERATION_ERROR_CODES,
  createAdminAuthOperationListQuery,
  type AdminAuthOperationListQuery,
  type AdminAuthOperationPageSize,
} from "../contracts/admin-user-org-auth-ops-contract";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AdminFlowRuntimeRepositories,
  type AdminFlowRuntimeRepositoryOptions,
} from "../repositories/admin-flow-runtime-repository";
import { normalizeUserPasswordResetInput } from "../validators/user-password-reset";
import type { SessionService } from "./session-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

export type { AdminFlowRuntimeRepositories };

export type AdminFlowRuntimeOptions = AdminFlowRuntimeRepositoryOptions & {
  repositories?: AdminFlowRuntimeRepositories;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type AdminFlowRole = "super_admin" | "ops_admin" | "content_admin";

type AdminFlowActor = {
  publicId: string;
  roles: [AdminFlowRole, ...AdminFlowRole[]];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AI_AUDIT_LOG_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const adminUserPermissionDeniedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);
const userNotFoundResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.resourceNotFound,
  "User does not exist.",
);
const userPasswordResetUnavailableResponse = createErrorResponse(
  503601,
  "Admin user password reset runtime is not configured.",
);
const userPasswordResetValidationFailedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
  "Invalid password reset input.",
);
const userLifecycleMutationUnavailableResponse = createErrorResponse(
  503602,
  "Admin user lifecycle runtime is not configured.",
);
const userDetailUnavailableResponse = createErrorResponse(
  503603,
  "Admin user detail runtime is not configured.",
);
const cookieBackedSessionAuthorization = "Bearer __cookie_backed_session__";

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isAdminFlowRole(role: string): role is AdminFlowRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

function getAdminFlowAuthorization(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (
    authorization !== null &&
    authorization !== cookieBackedSessionAuthorization
  ) {
    return authorization;
  }

  return getRequestAuthorization(request);
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminFlowActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getAdminFlowAuthorization(request),
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
    roles: adminRoles as [AdminFlowRole, ...AdminFlowRole[]],
  };
}

function canReadAuditLogs(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canResetUserPassword(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canManageUserLifecycle(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function canReadUserManagement(actor: AdminFlowActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function readRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor !== null) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
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

async function appendUserLifecycleAuditLog(input: {
  repositories: AdminFlowRuntimeRepositories;
  request: Request;
  actor: AdminFlowActor;
  actionType: "user.disable" | "user.enable";
  targetPublicId: string;
  resultStatus: "success" | "failed";
  metadataSummary: string;
}): Promise<void> {
  await input.repositories.auditLogRepository.appendAuditLog({
    actorPublicId: input.actor.publicId,
    actorRole: input.actor.roles[0],
    actionType: input.actionType,
    targetResourceType: "user",
    targetPublicId: input.targetPublicId,
    resultStatus: input.resultStatus,
    metadataSummary: input.metadataSummary,
    requestIp: readRequestIp(input.request),
  });
}

function matchesAuditLogFilter(
  value: string,
  expected: string | "all",
): boolean {
  return expected === "all" || value === expected;
}

function matchesAuditLogKeyword(input: {
  auditLog: Awaited<
    ReturnType<
      AdminFlowRuntimeRepositories["auditLogRepository"]["listAuditLogs"]
    >
  >["auditLogs"][number];
  keyword: string | null;
}): boolean {
  if (input.keyword === null) {
    return true;
  }

  const keyword = input.keyword.toLowerCase();
  const searchableText = [
    input.auditLog.actorPublicId,
    input.auditLog.actorRole,
    input.auditLog.actionType,
    input.auditLog.targetResourceType,
    input.auditLog.targetPublicId ?? "",
    input.auditLog.resultStatus,
    input.auditLog.metadataSummary ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(keyword);
}

function filterAuditLogsForQuery(
  result: Awaited<
    ReturnType<
      AdminFlowRuntimeRepositories["auditLogRepository"]["listAuditLogs"]
    >
  >,
  query: AdminAiAuditLogListQuery,
) {
  const auditLogs = result.auditLogs.filter(
    (auditLog) =>
      matchesAuditLogFilter(auditLog.actionType, query.actionType) &&
      matchesAuditLogFilter(
        auditLog.targetResourceType,
        query.targetResourceType,
      ) &&
      matchesAuditLogFilter(auditLog.resultStatus, query.resultStatus) &&
      matchesAuditLogKeyword({ auditLog, keyword: query.keyword }),
  );

  return {
    auditLogs,
    pagination: {
      ...result.pagination,
      total: auditLogs.length,
    },
  };
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

  async function updateUserLifecycle(input: {
    request: Request;
    context: { params: Promise<{ publicId: string }> };
    actionType: "user.disable" | "user.enable";
    mutate: ((publicId: string) => Promise<boolean>) | undefined;
    revokeSessions: boolean;
    terminateActiveFlows: boolean;
    successMetadataSummary: string;
  }): Promise<Response> {
    const actor = await requireAdminActor(input.request);
    const { publicId } = await input.context.params;

    if (actor === null) {
      return createJsonResponse(adminSessionRequiredResponse);
    }

    if (!canManageUserLifecycle(actor)) {
      await appendUserLifecycleAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: "failed",
        metadataSummary: "redacted user lifecycle permission denial metadata",
      });

      return createJsonResponse(adminUserPermissionDeniedResponse);
    }

    if (input.mutate === undefined) {
      await appendUserLifecycleAuditLog({
        repositories,
        request: input.request,
        actor,
        actionType: input.actionType,
        targetPublicId: publicId,
        resultStatus: "failed",
        metadataSummary: "redacted user lifecycle unavailable metadata",
      });

      return createJsonResponse(userLifecycleMutationUnavailableResponse);
    }

    const didMutate = await input.mutate(publicId);

    if (
      didMutate &&
      input.revokeSessions &&
      repositories.userOrgAuthRepository.revokeUserSessions !== undefined
    ) {
      await repositories.userOrgAuthRepository.revokeUserSessions(publicId);
    }

    if (
      didMutate &&
      input.terminateActiveFlows &&
      repositories.userOrgAuthRepository.terminateUserActiveFlows !== undefined
    ) {
      await repositories.userOrgAuthRepository.terminateUserActiveFlows(
        publicId,
      );
    }

    await appendUserLifecycleAuditLog({
      repositories,
      request: input.request,
      actor,
      actionType: input.actionType,
      targetPublicId: publicId,
      resultStatus: didMutate ? "success" : "failed",
      metadataSummary: input.successMetadataSummary,
    });

    return createJsonResponse(
      didMutate ? createSuccessResponse(null) : userNotFoundResponse,
    );
  }

  return createRouteHandlersWithErrorEnvelope({
    users: {
      collection: {
        async GET(request: Request): Promise<Response> {
          const actor = await requireAdminActor(request);

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canReadUserManagement(actor)) {
            return createJsonResponse(adminUserPermissionDeniedResponse);
          }

          const result = await repositories.userOrgAuthRepository.listUsers(
            readAdminAuthOperationListQuery(request),
          );

          return createJsonResponse(
            createPaginatedResponse({ users: result.users }, result.pagination),
          );
        },
      },
      detail: {
        async GET(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          const actor = await requireAdminActor(request);
          const { publicId } = await context.params;

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canReadUserManagement(actor)) {
            return createJsonResponse(adminUserPermissionDeniedResponse);
          }

          if (repositories.userOrgAuthRepository.getUserDetail === undefined) {
            return createJsonResponse(userDetailUnavailableResponse);
          }

          const userDetail =
            await repositories.userOrgAuthRepository.getUserDetail(publicId);

          return createJsonResponse(
            userDetail === null
              ? userNotFoundResponse
              : createSuccessResponse(userDetail),
          );
        },
      },
      resetPassword: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          const actor = await requireAdminActor(request);
          const { publicId } = await context.params;

          if (actor === null) {
            return createJsonResponse(adminSessionRequiredResponse);
          }

          if (!canResetUserPassword(actor)) {
            await repositories.auditLogRepository.appendAuditLog({
              actorPublicId: actor.publicId,
              actorRole: actor.roles[0],
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted user credential reset permission denial metadata",
              requestIp: readRequestIp(request),
            });

            return createJsonResponse(adminUserPermissionDeniedResponse);
          }

          const resetInput = normalizeUserPasswordResetInput(
            await readJsonBody(request),
          );

          if (!resetInput.success) {
            await repositories.auditLogRepository.appendAuditLog({
              actorPublicId: actor.publicId,
              actorRole: actor.roles[0],
              actionType: "user.reset_password",
              targetResourceType: "user",
              targetPublicId: publicId,
              resultStatus: "failed",
              metadataSummary:
                "redacted user credential reset validation metadata",
              requestIp: readRequestIp(request),
            });

            return createJsonResponse(
              userPasswordResetValidationFailedResponse,
            );
          }

          const didReset =
            (await repositories.userOrgAuthRepository.resetUserPassword?.(
              publicId,
              resetInput.value,
            )) ?? false;

          if (
            didReset &&
            repositories.userOrgAuthRepository.revokeUserSessions !== undefined
          ) {
            await repositories.userOrgAuthRepository.revokeUserSessions(
              publicId,
            );
          }

          await repositories.auditLogRepository.appendAuditLog({
            actorPublicId: actor.publicId,
            actorRole: actor.roles[0],
            actionType: "user.reset_password",
            targetResourceType: "user",
            targetPublicId: publicId,
            resultStatus: didReset ? "success" : "failed",
            metadataSummary: "redacted user credential reset metadata",
            requestIp: readRequestIp(request),
          });

          if (
            repositories.userOrgAuthRepository.resetUserPassword === undefined
          ) {
            return createJsonResponse(userPasswordResetUnavailableResponse);
          }

          return createJsonResponse(
            didReset ? createSuccessResponse(null) : userNotFoundResponse,
          );
        },
      },
      disable: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return updateUserLifecycle({
            request,
            context,
            actionType: "user.disable",
            mutate: repositories.userOrgAuthRepository.disableUser,
            revokeSessions: true,
            terminateActiveFlows: true,
            successMetadataSummary: "redacted user disable metadata",
          });
        },
      },
      enable: {
        async POST(
          request: Request,
          context: { params: Promise<{ publicId: string }> },
        ): Promise<Response> {
          return updateUserLifecycle({
            request,
            context,
            actionType: "user.enable",
            mutate: repositories.userOrgAuthRepository.enableUser,
            revokeSessions: false,
            terminateActiveFlows: false,
            successMetadataSummary: "redacted user enable metadata",
          });
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

          if (!canReadAuditLogs(actor)) {
            await repositories.auditLogRepository.appendAuditLog({
              actorPublicId: actor.publicId,
              actorRole: actor.roles[0],
              actionType: "audit_log.list",
              targetResourceType: "audit_log",
              targetPublicId: null,
              resultStatus: "failed",
              metadataSummary: "redacted audit_log permission denial metadata",
              requestIp: readRequestIp(request),
            });

            return createJsonResponse(adminPermissionDeniedResponse);
          }

          await repositories.auditLogRepository.appendAuditLog({
            actorPublicId: actor.publicId,
            actorRole: actor.roles[0],
            actionType: "audit_log.list",
            targetResourceType: "audit_log",
            targetPublicId: null,
            resultStatus: "success",
            metadataSummary: "redacted audit_log list operation metadata",
            requestIp: readRequestIp(request),
          });

          const query = readAdminAiAuditLogListQuery(request);
          const result = filterAuditLogsForQuery(
            await repositories.auditLogRepository.listAuditLogs(query),
            query,
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
  });
}
