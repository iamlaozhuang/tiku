import type {
  AdminContentKnowledgeListQuery,
  AdminContentKnowledgePageSize,
} from "../contracts/admin-content-knowledge-ops-contract";
import type {
  AdminContentKnowledgeApiResponse,
  AdminContentKnowledgeOpsService,
} from "./admin-content-knowledge-ops-service";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

function createJsonResponse<TData>(
  response: AdminContentKnowledgeApiResponse<TData>,
): Response {
  return Response.json(response);
}

function readListQuery(
  request: Request,
): Partial<AdminContentKnowledgeListQuery> {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const keyword = searchParams.get("keyword");
  const safePageSize: AdminContentKnowledgePageSize =
    pageSize === 50 || pageSize === 100 ? pageSize : 20;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: safePageSize,
    keyword,
  };
}

export function createAdminContentKnowledgeOpsRouteHandlers(
  service: AdminContentKnowledgeOpsService,
) {
  return {
    questions: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listQuestions(readListQuery(request)),
        );
      },
    },
    papers: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listPapers(readListQuery(request)),
        );
      },
    },
    resources: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listResources(readListQuery(request)),
        );
      },
    },
    knowledgeNodes: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await service.listKnowledgeNodes(readListQuery(request)),
        );
      },
    },
    rebuildResourceVector: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(
          await service.triggerResourceVectorRebuild(publicId),
        );
      },
    },
  };
}
