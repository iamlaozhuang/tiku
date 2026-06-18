import { createLocalSessionRuntime } from "@/server/auth/local-session-runtime";
import { getRequestAuthorization } from "@/server/auth/session-cookie";
import {
  createErrorResponse,
  createPaginatedResponse,
  type ApiResponse,
} from "@/server/contracts/api-response";
import {
  AUDIT_LOG_RETENTION_DAY,
  type AuditLogGovernanceHandoff,
  type AuditLogListDto,
} from "@/server/contracts/audit-log/log-governance-contract";
import { mapAuditLogRecordToDto } from "@/server/mappers/audit-log/audit-log-mapper";
import { createPostgresAuditLogRepository } from "@/server/repositories/audit-log/postgres-audit-log-repository";
import type { AuditLogRepository } from "@/server/repositories/audit-log/audit-log-repository";
import { parseAuditLogListQuery } from "@/server/validators/audit-log/list-query";
import type { SessionService } from "@/server/services/session-service";
import { createRouteHandlersWithErrorEnvelope } from "@/server/services/route-error-response";

export type AuditLogRouteHandlerOptions = {
  repository?: AuditLogRepository;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

type AdminLogActor = {
  publicId: string;
  roles: ("super_admin" | "ops_admin" | "content_admin")[];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  403641,
  "Admin permission denied.",
);

export function createBlockedAuditLogGovernanceHandoff(): AuditLogGovernanceHandoff {
  return {
    auditLogRetentionDay: AUDIT_LOG_RETENTION_DAY,
    blockedCapabilities: [
      "raw_prompt_provider_response_viewer",
      "raw_sensitive_viewer",
      "hard_delete_executor",
      "export_file_generation_download",
      "provider_env_secret",
      "schema_migration",
    ],
    exportStatus: "blocked",
    hardDeleteStatus: "blocked",
    rawViewerStatus: "blocked",
    readOnly: true,
    status: "blocked",
  };
}

export function createAuditLogRouteHandlers(
  options: AuditLogRouteHandlerOptions = {},
) {
  const repository = options.repository ?? createPostgresAuditLogRepository();
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  return createRouteHandlersWithErrorEnvelope({
    collection: {
      async GET(request: Request): Promise<Response> {
        const actorOrError = await resolveReadableAdminActor(
          request,
          sessionService,
        );

        if ("code" in actorOrError) {
          return createJsonResponse(actorOrError);
        }

        void actorOrError.publicId;

        const query = parseAuditLogListQuery(request);
        const listResult = await repository.listAuditLogs(query);

        return createJsonResponse(
          createPaginatedResponse<AuditLogListDto>(
            {
              auditLogs: listResult.auditLogs.map(mapAuditLogRecordToDto),
              governance: createBlockedAuditLogGovernanceHandoff(),
            },
            listResult.pagination,
          ),
        );
      },
    },
  });
}

function createJsonResponse<TResponse>(
  response: ApiResponse<TResponse>,
): Response {
  return Response.json(response);
}

async function resolveReadableAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminLogActor | ApiResponse<null>> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getRequestAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return adminSessionRequiredResponse;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminRole,
  );

  if (
    adminPublicId === null ||
    adminPublicId === undefined ||
    adminRoles.length === 0
  ) {
    return adminSessionRequiredResponse;
  }

  if (
    !adminRoles.includes("super_admin") &&
    !adminRoles.includes("ops_admin")
  ) {
    return adminPermissionDeniedResponse;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles,
  };
}

function isAdminRole(
  value: string,
): value is "super_admin" | "ops_admin" | "content_admin" {
  return (
    value === "super_admin" ||
    value === "ops_admin" ||
    value === "content_admin"
  );
}
