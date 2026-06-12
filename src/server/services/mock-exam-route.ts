import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  createRouteHandlerWithErrorEnvelope,
  createRouteHandlersWithErrorEnvelope,
} from "./route-error-response";
import type { MockExamService, MockExamUserContext } from "./mock-exam-service";

type MockExamRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type MockExamUserResolver = (
  request: Request,
) => Promise<MockExamUserContext | null>;

async function readRequestJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: MockExamUserResolver,
): Promise<MockExamUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isMockExamUserContext(
  value: MockExamUserContext | ApiResponse<null>,
): value is MockExamUserContext {
  return "userPublicId" in value;
}

export function createMockExamRouteHandlers(
  mockExamService: MockExamService,
  resolveUserContext: MockExamUserResolver,
) {
  return createRouteHandlersWithErrorEnvelope({
    collection: {
      async POST(request: Request): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isMockExamUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        return createJsonResponse(
          await mockExamService.startMockExam(
            userContext,
            await readRequestJson(request),
          ),
        );
      },
    },
    detail: {
      async GET(
        request: Request,
        context: MockExamRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isMockExamUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await mockExamService.getMockExam(userContext, publicId),
        );
      },
    },
    answers: {
      POST: createRouteHandlerWithErrorEnvelope(
        async (
          request: Request,
          context: MockExamRouteContext,
        ): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isMockExamUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const { publicId } = await context.params;

          return createJsonResponse(
            await mockExamService.saveMockExamAnswer(
              userContext,
              publicId,
              await readRequestJson(request),
            ),
          );
        },
      ),
    },
    submit: {
      POST: createRouteHandlerWithErrorEnvelope(
        async (
          request: Request,
          context: MockExamRouteContext,
        ): Promise<Response> => {
          const userContext = await resolveRequiredUserContext(
            request,
            resolveUserContext,
          );

          if (!isMockExamUserContext(userContext)) {
            return createJsonResponse(userContext);
          }

          const { publicId } = await context.params;

          return createJsonResponse(
            await mockExamService.submitMockExam(
              userContext,
              publicId,
              await readRequestJson(request),
            ),
          );
        },
      ),
    },
    retryScoring: {
      async POST(
        request: Request,
        context: MockExamRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isMockExamUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await mockExamService.retryMockExamScoring(userContext, publicId),
        );
      },
    },
    terminate: {
      async POST(
        request: Request,
        context: MockExamRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isMockExamUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await mockExamService.terminateMockExam(userContext, publicId),
        );
      },
    },
  });
}

export function createUnavailableMockExamUserResolver(): MockExamUserResolver {
  return async () => null;
}
