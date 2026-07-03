import type {
  AdminUserAuthFilter,
  AdminUserCategory,
  AdminAuthOperationListQuery,
  AdminAuthOperationPageSize,
} from "../contracts/admin-user-org-auth-ops-contract";
import type {
  AdminOpsApiResponse,
  AdminUserOrgAuthOpsService,
} from "./admin-user-org-auth-ops-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

function createJsonResponse<TData>(
  response: AdminOpsApiResponse<TData>,
): Response {
  return Response.json(response);
}

function readUserCategory(value: string | null): AdminUserCategory | "all" {
  if (
    value === "no_auth_personal" ||
    value === "personal_standard" ||
    value === "personal_advanced" ||
    value === "employee" ||
    value === "backend_admin" ||
    value === "disabled"
  ) {
    return value;
  }

  return "all";
}

function readAuthFilter(value: string | null): AdminUserAuthFilter {
  if (
    value === "none" ||
    value === "standard" ||
    value === "advanced" ||
    value === "expired"
  ) {
    return value;
  }

  return "all";
}

function readListQuery(request: Request): Partial<AdminAuthOperationListQuery> {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const keyword = searchParams.get("keyword");
  const safePageSize: AdminAuthOperationPageSize =
    pageSize === 50 || pageSize === 100 ? pageSize : 20;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: safePageSize,
    keyword,
    userCategory: readUserCategory(searchParams.get("userCategory")),
    authFilter: readAuthFilter(searchParams.get("authFilter")),
  };
}

export function createAdminUserOrgAuthOpsRouteHandlers(
  service: AdminUserOrgAuthOpsService,
) {
  return createRouteHandlersWithErrorEnvelope({
    users: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listUsers(readListQuery(request)),
        );
      },
      detail: {
        async GET(_request: Request, context: RouteContext): Promise<Response> {
          const { publicId } = await context.params;

          return createJsonResponse(await service.getUserDetail(publicId));
        },
      },
    },
    organizations: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listOrganizations(readListQuery(request)),
        );
      },
    },
    authorizations: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listAuthorizations(readListQuery(request)),
        );
      },
    },
    redeemCodes: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listRedeemCodes(readListQuery(request)),
        );
      },
    },
    resetPassword: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await service.resetUserPassword(publicId));
      },
    },
  });
}
