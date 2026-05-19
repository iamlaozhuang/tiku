import type { ApiResponse } from "../contracts/api-response";
import type { QuestionService } from "./question-service";

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

function readQuestionQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    questionType: searchParams.get("questionType") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
  };
}

export function createQuestionRouteHandlers(questionService: QuestionService) {
  return {
    async GET(request: Request, context?: RouteContext): Promise<Response> {
      if (context !== undefined) {
        const { publicId } = await context.params;

        return createJsonResponse(await questionService.getQuestion(publicId));
      }

      return createJsonResponse(
        await questionService.listQuestions(readQuestionQuery(request)),
      );
    },
    async POST(request: Request): Promise<Response> {
      const input = await readRequestJson(request);

      return createJsonResponse(await questionService.createQuestion(input));
    },
    async PATCH(request: Request, context: RouteContext): Promise<Response> {
      const input = await readRequestJson(request);
      const { publicId } = await context.params;

      return createJsonResponse(
        await questionService.updateQuestion(publicId, input),
      );
    },
    disable: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(
          await questionService.disableQuestion(publicId),
        );
      },
    },
    copy: {
      async POST(_request: Request, context: RouteContext): Promise<Response> {
        const { publicId } = await context.params;

        return createJsonResponse(await questionService.copyQuestion(publicId));
      },
    },
  };
}
