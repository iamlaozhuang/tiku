import type { ApiResponse } from "../contracts/api-response";
import type { PaperDraftService } from "./paper-draft-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

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

async function readStructureCommandJson(
  request: Request,
  allowedActions: string[],
): Promise<unknown> {
  const input = await readRequestJson(request);

  return typeof input === "object" &&
    input !== null &&
    "action" in input &&
    allowedActions.includes(String((input as { action: unknown }).action))
    ? input
    : null;
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
  return createRouteHandlersWithErrorEnvelope({
    collection: {
      async GET(request: Request): Promise<Response> {
        return createJsonResponse(
          await paperService.listPapers(readPaperQuery(request)),
        );
      },
      async POST(request: Request): Promise<Response> {
        const input = await readRequestJson(request);

        return createJsonResponse(await paperService.createPaper(input));
      },
    },
    detail: {
      async GET(
        _request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await paperService.getPaper(publicId));
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
      async DELETE(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        const input = await readRequestJson(request);

        return createJsonResponse(
          await paperService.deletePaper(publicId, input),
        );
      },
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
        request: Request,
        context: PaperQuestionRouteContext,
      ): Promise<Response> {
        const { publicId, paperQuestionPublicId } = await context.params;
        const input = await readRequestJson(request);

        return createJsonResponse(
          await paperService.removePaperQuestion(
            publicId,
            paperQuestionPublicId,
            input,
          ),
        );
      },
    },
    paperSections: {
      async POST(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        return createJsonResponse(
          await paperService.mutatePaperSections(
            publicId,
            await readStructureCommandJson(request, ["create"]),
          ),
        );
      },
      async PATCH(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        return createJsonResponse(
          await paperService.mutatePaperSections(
            publicId,
            await readStructureCommandJson(request, ["update", "reorder"]),
          ),
        );
      },
      async DELETE(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        return createJsonResponse(
          await paperService.mutatePaperSections(
            publicId,
            await readStructureCommandJson(request, ["delete"]),
          ),
        );
      },
    },
    questionGroups: {
      async POST(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        return createJsonResponse(
          await paperService.mutateQuestionGroups(
            publicId,
            await readStructureCommandJson(request, ["create"]),
          ),
        );
      },
      async PATCH(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        return createJsonResponse(
          await paperService.mutateQuestionGroups(
            publicId,
            await readStructureCommandJson(request, [
              "update",
              "reorder",
              "set_question_membership",
            ]),
          ),
        );
      },
      async DELETE(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        return createJsonResponse(
          await paperService.mutateQuestionGroups(
            publicId,
            await readStructureCommandJson(request, ["delete"]),
          ),
        );
      },
    },
    publish: {
      async POST(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        const input = await readRequestJson(request);

        return createJsonResponse(
          await paperService.publishPaper(publicId, input),
        );
      },
    },
    archive: {
      async POST(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        const input = await readRequestJson(request);

        return createJsonResponse(
          await paperService.archivePaper(publicId, input),
        );
      },
    },
    copy: {
      async POST(
        request: Request,
        context: PaperRouteContext,
      ): Promise<Response> {
        const { publicId } = await context.params;
        const input = await readRequestJson(request);

        return createJsonResponse(
          await paperService.copyPaper(publicId, input),
        );
      },
    },
  });
}
