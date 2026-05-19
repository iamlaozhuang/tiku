import type { ApiResponse } from "../contracts/api-response";
import type { MaterialService } from "./material-service";

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

function readMaterialQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  };
}

export function createMaterialRouteHandlers(materialService: MaterialService) {
  return {
    collection: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await materialService.listMaterials(readMaterialQuery(request)),
        );
      },
      async POST(request: Request): Promise<Response> {
        const input = await readRequestJson(request);

        return createJsonResponse(await materialService.createMaterial(input));
      },
    },
    detail: {
      async GET(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await materialService.getMaterial(publicId));
      },
      async PATCH(request: Request, context: RouteContext): Promise<Response> {
        const input = await readRequestJson(request);
        const { publicId } = await context.params;

        return createJsonResponse(
          await materialService.updateMaterial(publicId, input),
        );
      },
    },
    disable: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(
          await materialService.disableMaterial(publicId),
        );
      },
    },
    copy: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await materialService.copyMaterial(publicId));
      },
    },
  };
}
