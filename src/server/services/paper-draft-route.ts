import type { ApiResponse } from "../contracts/api-response";
import type { PaperDraftService } from "./paper-draft-service";

type PaperRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type PaperQuestionRouteContext = {
  params: Promise<{
    publicId: string;
    paperQuestionPublicId: string;
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

function readPaperQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    paperStatus: searchParams.get("paperStatus") ?? undefined,
  };
}

export function createPaperDraftRouteHandlers(paperService: PaperDraftService) {
  return {
    async GET(
      request: Request,
      context?: PaperRouteContext,
    ): Promise<Response> {
      if (context !== undefined) {
        const { publicId } = await context.params;

        return createJsonResponse(await paperService.getPaper(publicId));
      }

      return createJsonResponse(
        await paperService.listPapers(readPaperQuery(request)),
      );
    },
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);

      return createJsonResponse(await paperService.createPaper(input));
    },
    async PATCH(
      request: Request,
      context: PaperRouteContext,
    ): Promise<Response> {
      const input = await readRequestJson(request);
      const { publicId } = await context.params;

      return createJsonResponse(
        await paperService.updatePaper(publicId, input),
      );
    },
    questions: {
      async POST(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const input = await readRequestJson(request);
        const { publicId } = await context.params;

        return createJsonResponse(
          await paperService.addQuestionToDraftPaper(publicId, input),
        );
      },
      async PATCH(
        request: Request,
        context: PaperQuestionRouteContext,
      ): Promise<Response> {
        const input = await readRequestJson(request);
        const { publicId, paperQuestionPublicId } = await context.params;

        return createJsonResponse(
          await paperService.updatePaperQuestion(
            publicId,
            paperQuestionPublicId,
            input,
          ),
        );
      },
      async DELETE(
        _request: Request,
        context: PaperQuestionRouteContext,
      ): Promise<Response> {
        const { publicId, paperQuestionPublicId } = await context.params;

        return createJsonResponse(
          await paperService.removePaperQuestion(
            publicId,
            paperQuestionPublicId,
          ),
        );
      },
    },
    publish: {
      async POST(
        _request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await paperService.publishPaper(publicId));
      },
    },
  };
}
