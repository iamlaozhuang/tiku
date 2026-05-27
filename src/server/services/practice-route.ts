import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PracticeService, PracticeUserContext } from "./practice-service";

type PracticeRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type PracticeUserResolver = (
  request: Request,
) => Promise<PracticeUserContext | null>;

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

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: PracticeUserResolver,
): Promise<PracticeUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isPracticeUserContext(
  value: PracticeUserContext | ApiResponse<null>,
): value is PracticeUserContext {
  return "userPublicId" in value;
}

export function createPracticeRouteHandlers(
  practiceService: PracticeService,
  resolveUserContext: PracticeUserResolver,
) {
  return {
    collection: {
      async POST(request: Request): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isPracticeUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        return createJsonResponse(
          await practiceService.startPractice(
            userContext,
            await readRequestJson(request),
          ),
        );
      },
    },
    detail: {
      async GET(
        request: Request,
        context: PracticeRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isPracticeUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await practiceService.getPractice(userContext, publicId),
        );
      },
    },
    answers: {
      async POST(
        request: Request,
        context: PracticeRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isPracticeUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await practiceService.submitPracticeAnswer(
            userContext,
            publicId,
            await readRequestJson(request),
          ),
        );
      },
    },
    favoriteQuestion: {
      async POST(
        request: Request,
        context: PracticeRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isPracticeUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await practiceService.favoritePracticeQuestion(
            userContext,
            publicId,
            await readRequestJson(request),
          ),
        );
      },
    },
    restart: {
      async POST(
        request: Request,
        context: PracticeRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isPracticeUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await practiceService.restartPractice(userContext, publicId),
        );
      },
    },
    terminate: {
      async POST(
        request: Request,
        context: PracticeRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isPracticeUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await practiceService.terminatePractice(userContext, publicId),
        );
      },
    },
  };
}

export function createUnavailablePracticeUserResolver(): PracticeUserResolver {
  return async () => null;
}
