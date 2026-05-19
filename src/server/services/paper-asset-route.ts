import type { ApiResponse } from "../contracts/api-response";
import type { PaperAssetService } from "./paper-asset-service";

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

function readPaperAssetQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    paperPublicId: searchParams.get("paperPublicId") ?? undefined,
    paperAttachmentUsage: searchParams.get("paperAttachmentUsage") ?? undefined,
  };
}

export function createPaperAssetRouteHandlers(
  paperAssetService: PaperAssetService,
) {
  return {
    collection: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await paperAssetService.listPaperAssets(readPaperAssetQuery(request)),
        );
      },
      async POST(request: Request): Promise<Response> {
        const input = await readRequestJson(request);

        return createJsonResponse(
          await paperAssetService.createPaperAsset(input),
        );
      },
    },
    detail: {
      async GET(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(
          await paperAssetService.getPaperAsset(publicId),
        );
      },
      async DELETE(
        _request: Request,
        context: RouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(
          await paperAssetService.deletePaperAsset(publicId),
        );
      },
    },
  };
}
