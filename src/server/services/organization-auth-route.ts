import type { ApiResponse } from "../contracts/api-response";
import type { OrganizationAuthService } from "./organization-auth-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

export function createOrganizationRouteHandlers(
  organizationAuthService: OrganizationAuthService,
) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);

      return createJsonResponse(
        await organizationAuthService.createOrganization(input),
      );
    },
    async PATCH(request: Request, context: RouteContext): Promise<Response> {
      const input = await readRequestJson(request);
      const { publicId } = await context.params;

      return createJsonResponse(
        await organizationAuthService.updateOrganization(publicId, input),
      );
    },
    disable: {
      async POST(request: Request, context: RouteContext): Promise<Response> {
        const input = await readRequestJson(request);
        const { publicId } = await context.params;

        return createJsonResponse(
          await organizationAuthService.disableOrganization(publicId, input),
        );
      },
    },
  };
}

export function createOrgAuthRouteHandlers(
  organizationAuthService: OrganizationAuthService,
) {
  return {
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);

      return createJsonResponse(
        await organizationAuthService.createOrgAuth(input),
      );
    },
    cancel: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(
          await organizationAuthService.cancelOrgAuth(publicId),
        );
      },
    },
  };
}
