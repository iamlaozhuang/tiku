import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import {
  createErrorResponse,
  createPaginatedResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_AUTH_OPERATION_ERROR_CODES,
  ADMIN_AUTH_OPERATION_SORT_FIELDS,
  createAdminAuthOperationListQuery,
  type AdminAuthOperationListQuery,
  type AdminAuthOperationPageSize,
  type AdminAuthOperationSortField,
} from "../contracts/admin-user-org-auth-ops-contract";
import {
  createPostgresAdminRedeemCodeRuntimeRepositories,
  type AdminRedeemCodeRuntimeRepositories,
  type AdminRedeemCodeRuntimeRepositoryOptions,
} from "../repositories/admin-redeem-code-runtime-repository";
import type { SessionService } from "./session-service";

export type { AdminRedeemCodeRuntimeRepositories };

export type AdminRedeemCodeRuntimeOptions =
  AdminRedeemCodeRuntimeRepositoryOptions & {
    repositories?: AdminRedeemCodeRuntimeRepositories;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

type AdminRedeemCodeRole = "super_admin" | "ops_admin" | "content_admin";

type AdminRedeemCodeActor = {
  publicId: string;
  roles: [AdminRedeemCodeRole, ...AdminRedeemCodeRole[]];
};

const adminSessionRequiredResponse = createErrorResponse(
  401001,
  "Admin session is required.",
);
const adminPermissionDeniedResponse = createErrorResponse(
  ADMIN_AUTH_OPERATION_ERROR_CODES.adminPermissionDenied,
  "Admin permission denied.",
);

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function isAdminRedeemCodeRole(role: string): role is AdminRedeemCodeRole {
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

async function resolveAdminActor(
  request: Request,
  sessionService: Pick<SessionService, "getCurrentSession">,
): Promise<AdminRedeemCodeActor | null> {
  const sessionResponse = await sessionService.getCurrentSession({
    authorization: request.headers.get("authorization"),
  });

  if (sessionResponse.code !== 0 || sessionResponse.data === null) {
    return null;
  }

  const adminPublicId = sessionResponse.data.user.adminPublicId ?? null;
  const adminRoles = (sessionResponse.data.user.adminRoles ?? []).filter(
    isAdminRedeemCodeRole,
  );

  if (adminPublicId === null || adminRoles.length === 0) {
    return null;
  }

  return {
    publicId: adminPublicId,
    roles: adminRoles as [AdminRedeemCodeRole, ...AdminRedeemCodeRole[]],
  };
}

function canReadRedeemCode(actor: AdminRedeemCodeActor): boolean {
  return (
    actor.roles.includes("super_admin") || actor.roles.includes("ops_admin")
  );
}

function readAdminAuthOperationListQuery(
  request: Request,
): AdminAuthOperationListQuery {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = readPageSize(searchParams, [20, 50, 100], 20);
  const sortBy = readSortBy(searchParams);
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  return createAdminAuthOperationListQuery({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: pageSize as AdminAuthOperationPageSize,
    sortBy,
    sortOrder,
    keyword: searchParams.get("keyword"),
    status: readStatus(searchParams),
    userType: "all",
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

function readSortBy(
  searchParams: URLSearchParams,
): AdminAuthOperationSortField {
  const sortBy = searchParams.get("sortBy");

  return ADMIN_AUTH_OPERATION_SORT_FIELDS.includes(
    sortBy as AdminAuthOperationSortField,
  )
    ? (sortBy as AdminAuthOperationSortField)
    : "updatedAt";
}

function readStatus(
  searchParams: URLSearchParams,
): AdminAuthOperationListQuery["status"] {
  const status = searchParams.get("status");

  if (status === "unused" || status === "used" || status === "expired") {
    return status;
  }

  return "all";
}

export function createAdminRedeemCodeRuntimeRouteHandlers(
  options: AdminRedeemCodeRuntimeOptions = {},
) {
  const repositories =
    options.repositories ??
    createPostgresAdminRedeemCodeRuntimeRepositories(options);
  const sessionService = options.sessionService ?? createLocalSessionRuntime();

  async function requireReadableAdminActor(
    request: Request,
  ): Promise<ApiResponse<null> | null> {
    const actor = await resolveAdminActor(request, sessionService);

    if (actor === null) {
      return adminSessionRequiredResponse;
    }

    void actor.publicId;

    return canReadRedeemCode(actor) ? null : adminPermissionDeniedResponse;
  }

  return {
    redeemCodes: {
      async GET(request: Request): Promise<Response> {
        const authError = await requireReadableAdminActor(request);

        if (authError !== null) {
          return createJsonResponse(authError);
        }

        const result = await repositories.listRedeemCodes(
          readAdminAuthOperationListQuery(request),
        );

        return createJsonResponse(
          createPaginatedResponse(
            { redeemCodes: result.redeemCodes },
            result.pagination,
          ),
        );
      },
    },
  };
}
