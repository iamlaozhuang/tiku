import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  ExamReportService,
  ExamReportUserContext,
} from "./exam-report-service";

type ExamReportRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type ExamReportUserResolver = (
  request: Request,
) => Promise<ExamReportUserContext | null>;

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function readSearchParams(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: ExamReportUserResolver,
): Promise<ExamReportUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isExamReportUserContext(
  value: ExamReportUserContext | ApiResponse<null>,
): value is ExamReportUserContext {
  return "userPublicId" in value;
}

export function createExamReportRouteHandlers(
  examReportService: ExamReportService,
  resolveUserContext: ExamReportUserResolver,
) {
  return {
    collection: {
      async GET(request: Request): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isExamReportUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        return createJsonResponse(
          await examReportService.listExamReports(
            userContext,
            readSearchParams(request),
          ),
        );
      },
    },
    generation: {
      async POST(request: Request): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isExamReportUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        return createJsonResponse(
          await examReportService.generateExamReport(
            userContext,
            await readRequestJson(request),
          ),
        );
      },
    },
    detail: {
      async GET(
        request: Request,
        context: ExamReportRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isExamReportUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await examReportService.getExamReport(userContext, publicId),
        );
      },
    },
    retryLearningSuggestion: {
      async POST(
        request: Request,
        context: ExamReportRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isExamReportUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await examReportService.retryLearningSuggestion(
            userContext,
            publicId,
            await readRequestJson(request),
          ),
        );
      },
    },
  };
}

export function createUnavailableExamReportUserResolver(): ExamReportUserResolver {
  return async () => null;
}
