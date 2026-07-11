import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  isAdminOverviewScope,
  type AdminRoleOverviewDto,
} from "../contracts/admin-role-overview-contract";
import type { AdminRole } from "../models/auth";
import { createPostgresAdminRoleOverviewRepository } from "../repositories/admin-role-overview-repository";
import type { RuntimeDatabaseOptions } from "../repositories/runtime-database";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import {
  buildAdminRoleOverview,
  type AdminRoleOverviewActor,
  type AdminRoleOverviewRepository,
} from "./admin-role-overview-service";
import type { SessionService } from "./session-service";

export type { AdminRoleOverviewRepository } from "./admin-role-overview-service";

export const ADMIN_ROLE_OVERVIEW_INVALID_SCOPE_CODE = 400190;
export const ADMIN_ROLE_OVERVIEW_SESSION_REQUIRED_CODE = 401190;

export type AdminRoleOverviewRouteOptions = RuntimeDatabaseOptions & {
  now?: () => Date;
  repository?: AdminRoleOverviewRepository;
  sessionService?: Pick<SessionService, "getCurrentSession">;
};

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isAdminRole(value: string): value is AdminRole {
  return (
    value === "super_admin" ||
    value === "ops_admin" ||
    value === "content_admin" ||
    value === "org_standard_admin" ||
    value === "org_advanced_admin"
  );
}

async function resolveActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminRoleOverviewActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: getRequestAuthorization(request),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId?.trim() ?? "";
  const roles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminRole,
  );

  return adminPublicId.length > 0 && roles.length > 0 ? { roles } : null;
}

export function createAdminRoleOverviewRuntimeRouteHandlers(
  options: AdminRoleOverviewRouteOptions = {},
) {
  const repository =
    options.repository ??
    createPostgresAdminRoleOverviewRepository({
      createDatabase: options.createDatabase,
    });
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const readNow = options.now ?? (() => new Date());

  return createRouteHandlersWithErrorEnvelope({
    overview: {
      async GET(request: Request): Promise<Response> {
        const scopeValue = new URL(request.url).searchParams.get("scope");

        if (!isAdminOverviewScope(scopeValue)) {
          return createJsonResponse(
            createErrorResponse(
              ADMIN_ROLE_OVERVIEW_INVALID_SCOPE_CODE,
              "Invalid admin overview scope.",
            ),
          );
        }

        const actor = await resolveActor(request, sessionService);

        if (actor === null) {
          return createJsonResponse(
            createErrorResponse(
              ADMIN_ROLE_OVERVIEW_SESSION_REQUIRED_CODE,
              "Admin overview session is required.",
            ),
          );
        }

        return createJsonResponse<AdminRoleOverviewDto | null>(
          await buildAdminRoleOverview({
            actor,
            now: readNow(),
            repository,
            scope: scopeValue,
          }),
        );
      },
    },
  });
}
