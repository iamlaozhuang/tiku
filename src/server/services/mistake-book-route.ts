import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  MistakeBookService,
  MistakeBookUserContext,
} from "./mistake-book-service";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";

type MistakeBookRouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export type MistakeBookUserResolver = (
  request: Request,
) => Promise<MistakeBookUserContext | null>;

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
  resolveUserContext: MistakeBookUserResolver,
): Promise<MistakeBookUserContext | ApiResponse<null>> {
  const userContext = await resolveUserContext(request);

  if (userContext === null) {
    return createErrorResponse(401001, "User session is required.");
  }

  return userContext;
}

function isMistakeBookUserContext(
  value: MistakeBookUserContext | ApiResponse<null>,
): value is MistakeBookUserContext {
  return "userPublicId" in value;
}

async function handleMistakeBookAction(
  request: Request,
  context: MistakeBookRouteContext,
  resolveUserContext: MistakeBookUserResolver,
  handleAction: (
    userContext: MistakeBookUserContext,
    publicId: string,
  ) => Promise<ApiResponse<unknown>>,
): Promise<Response> {
  const userContext = await resolveRequiredUserContext(
    request,
    resolveUserContext,
  );

  if (!isMistakeBookUserContext(userContext)) {
    return createJsonResponse(userContext);
  }

  const { publicId } = await context.params;

  return createJsonResponse(await handleAction(userContext, publicId));
}

export function createMistakeBookRouteHandlers(
  mistakeBookService: MistakeBookService,
  resolveUserContext: MistakeBookUserResolver,
) {
  return createRouteHandlersWithErrorEnvelope({
    collection: {
      async GET(request: Request): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isMistakeBookUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        return createJsonResponse(
          await mistakeBookService.listMistakeBooks(
            userContext,
            readSearchParams(request),
          ),
        );
      },
    },
    detail: {
      async GET(
        request: Request,
        context: MistakeBookRouteContext,
      ): Promise<Response> {
        return handleMistakeBookAction(
          request,
          context,
          resolveUserContext,
          (userContext, publicId) =>
            mistakeBookService.getMistakeBook(userContext, publicId),
        );
      },
    },
    favorite: {
      async POST(
        request: Request,
        context: MistakeBookRouteContext,
      ): Promise<Response> {
        return handleMistakeBookAction(
          request,
          context,
          resolveUserContext,
          (userContext, publicId) =>
            mistakeBookService.favoriteMistakeBook(userContext, publicId),
        );
      },
    },
    unfavorite: {
      async POST(
        request: Request,
        context: MistakeBookRouteContext,
      ): Promise<Response> {
        return handleMistakeBookAction(
          request,
          context,
          resolveUserContext,
          (userContext, publicId) =>
            mistakeBookService.unfavoriteMistakeBook(userContext, publicId),
        );
      },
    },
    markMastered: {
      async POST(
        request: Request,
        context: MistakeBookRouteContext,
      ): Promise<Response> {
        return handleMistakeBookAction(
          request,
          context,
          resolveUserContext,
          (userContext, publicId) =>
            mistakeBookService.markMistakeBookMastered(userContext, publicId),
        );
      },
    },
    remove: {
      async POST(
        request: Request,
        context: MistakeBookRouteContext,
      ): Promise<Response> {
        return handleMistakeBookAction(
          request,
          context,
          resolveUserContext,
          (userContext, publicId) =>
            mistakeBookService.removeMistakeBook(userContext, publicId),
        );
      },
    },
    aiExplanation: {
      async POST(
        request: Request,
        context: MistakeBookRouteContext,
      ): Promise<Response> {
        const userContext = await resolveRequiredUserContext(
          request,
          resolveUserContext,
        );

        if (!isMistakeBookUserContext(userContext)) {
          return createJsonResponse(userContext);
        }

        const { publicId } = await context.params;

        return createJsonResponse(
          await mistakeBookService.requestAiExplanation(
            userContext,
            publicId,
            await readRequestJson(request),
          ),
        );
      },
    },
  });
}

export function createUnavailableMistakeBookUserResolver(): MistakeBookUserResolver {
  return async () => null;
}
