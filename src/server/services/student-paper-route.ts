import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  StudentPaperService,
  StudentPaperUserContext,
} from "./student-paper-service";
import { createRouteHandlerWithErrorEnvelope } from "./route-error-response";

type StudentPaperRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type StudentPaperUserResolver = (
  request: Request,
) => Promise<StudentPaperUserContext | null>;

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function readStudentPaperQuery(request: Request): Record<string, unknown> {
  const searchParams = new URL(request.url).searchParams;

  return {
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    profession: searchParams.get("profession") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
  };
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: StudentPaperUserResolver,
): Promise<StudentPaperUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isStudentPaperUserContext(
  value: StudentPaperUserContext | ApiResponse<null>,
): value is StudentPaperUserContext {
  return "userPublicId" in value;
}

export function createStudentPaperRouteHandlers(
  studentPaperService: StudentPaperService,
  resolveUserContext: StudentPaperUserResolver,
) {
  return {
    scopes: {
      GET: createRouteHandlerWithErrorEnvelope(
        async (request: Request): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isStudentPaperUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          return createJsonResponse(
            await studentPaperService.listScopes(userContext),
          );
        },
      ),
    },
    collection: {
      GET: createRouteHandlerWithErrorEnvelope(
        async (request: Request): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isStudentPaperUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          return createJsonResponse(
            await studentPaperService.listStudentPapers(
              userContext,
              readStudentPaperQuery(request),
            ),
          );
        },
      ),
    },
    detail: {
      GET: createRouteHandlerWithErrorEnvelope(
        async (
          request: Request,
          context: StudentPaperRouteContext,
        ): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isStudentPaperUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const { publicId } = await context.params;

          return createJsonResponse(
            await studentPaperService.getStudentPaper(userContext, publicId),
          );
        },
      ),
    },
  };
}

export function createUnavailableStudentPaperUserResolver(): StudentPaperUserResolver {
  return async () => null;
}
