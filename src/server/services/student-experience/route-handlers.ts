import { createStudentMistakeBookRuntimeRouteHandlers } from "@/server/services/student-mistake-book-runtime";
import { createStudentFlowRuntimeRouteHandlers } from "@/server/services/student-flow-runtime";
import type {
  StudentExperienceApiEnvelope,
  StudentExperienceUserContext,
} from "@/server/contracts/student-experience/student-experience-contract";
import {
  createUnavailableStudentExperienceRepository,
  type StudentExperienceRepository,
} from "@/server/repositories/student-experience/student-experience-repository";
import { mapMistakeBookRecord } from "@/server/mappers/student-experience/student-experience-mapper";
import { createRouteHandlersWithErrorEnvelope } from "@/server/services/route-error-response";
import { parseMistakeBookListQuery } from "@/server/validators/student-experience/student-experience-query";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type LegacyFlowRouteHandlers = ReturnType<
  typeof createStudentFlowRuntimeRouteHandlers
>;

type LegacyMistakeBookRouteHandlers = ReturnType<
  typeof createStudentMistakeBookRuntimeRouteHandlers
>;

export type StudentExperienceUserResolver = (
  request: Request,
) => Promise<StudentExperienceUserContext | null>;

export type StudentExperienceRouteHandlerOptions = {
  legacyFlowRouteHandlers?: LegacyFlowRouteHandlers;
  legacyMistakeBookRouteHandlers?: LegacyMistakeBookRouteHandlers;
  repository?: StudentExperienceRepository;
  resolveUserContext?: StudentExperienceUserResolver;
};

function createJsonResponse<TData>(
  envelope: StudentExperienceApiEnvelope<TData>,
  init?: ResponseInit,
) {
  return Response.json(envelope, init);
}

function createUserSessionRequiredResponse() {
  return createJsonResponse(
    {
      code: 401001,
      data: null,
      message: "User session is required.",
    },
    { status: 401 },
  );
}

async function resolveRequiredUserContext(
  request: Request,
  resolveUserContext: StudentExperienceUserResolver | undefined,
): Promise<StudentExperienceUserContext | Response> {
  if (resolveUserContext === undefined) {
    return createUserSessionRequiredResponse();
  }

  const userContext = await resolveUserContext(request);

  return userContext ?? createUserSessionRequiredResponse();
}

function isUserContext(
  value: StudentExperienceUserContext | Response,
): value is StudentExperienceUserContext {
  return !(value instanceof Response);
}

export function createStudentExperienceRouteHandlers(
  options: StudentExperienceRouteHandlerOptions = {},
) {
  const repository =
    options.repository ?? createUnavailableStudentExperienceRepository();
  let legacyFlowRouteHandlers = options.legacyFlowRouteHandlers;
  let legacyMistakeBookRouteHandlers = options.legacyMistakeBookRouteHandlers;

  function readLegacyFlowRouteHandlers() {
    legacyFlowRouteHandlers ??= createStudentFlowRuntimeRouteHandlers();

    return legacyFlowRouteHandlers;
  }

  function readLegacyMistakeBookRouteHandlers() {
    legacyMistakeBookRouteHandlers ??=
      createStudentMistakeBookRuntimeRouteHandlers();

    return legacyMistakeBookRouteHandlers;
  }

  return createRouteHandlersWithErrorEnvelope({
    examReports: {
      collection: {
        GET: (request: Request) =>
          readLegacyFlowRouteHandlers().examReports.collection.GET(request),
      },
      detail: {
        GET: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().examReports.detail.GET(
            request,
            context,
          ),
      },
      generation: {
        POST: (request: Request) =>
          readLegacyFlowRouteHandlers().examReports.generation.POST(request),
      },
      retryLearningSuggestion: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().examReports.retryLearningSuggestion.POST(
            request,
            context,
          ),
      },
    },
    mistakeBooks: {
      aiExplanation: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyMistakeBookRouteHandlers().aiExplanation.POST(
            request,
            context,
          ),
      },
      collection: {
        async GET(request: Request) {
          if (repository.listMistakeBooks === undefined) {
            return readLegacyMistakeBookRouteHandlers().collection.GET(request);
          }

          const userContext = await resolveRequiredUserContext(
            request,
            options.resolveUserContext,
          );

          if (!isUserContext(userContext)) {
            return userContext;
          }

          const listResult = await repository.listMistakeBooks(
            userContext,
            parseMistakeBookListQuery(request),
          );

          return createJsonResponse({
            code: 0,
            data: {
              mistakeBooks: listResult.mistakeBooks.map(mapMistakeBookRecord),
            },
            message: "ok",
            pagination: listResult.pagination,
          });
        },
      },
      detail: {
        GET: (request: Request, context: RouteContext) =>
          readLegacyMistakeBookRouteHandlers().detail.GET(request, context),
      },
      favorite: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyMistakeBookRouteHandlers().favorite.POST(request, context),
      },
      markMastered: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyMistakeBookRouteHandlers().markMastered.POST(
            request,
            context,
          ),
      },
      remove: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyMistakeBookRouteHandlers().remove.POST(request, context),
      },
      unfavorite: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyMistakeBookRouteHandlers().unfavorite.POST(
            request,
            context,
          ),
      },
    },
    mockExams: {
      answers: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().mockExams.answers.POST(
            request,
            context,
          ),
      },
      supplementAnswers: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().mockExams.supplementAnswers.POST(
            request,
            context,
          ),
      },
      collection: {
        POST: (request: Request) =>
          readLegacyFlowRouteHandlers().mockExams.collection.POST(request),
      },
      detail: {
        GET: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().mockExams.detail.GET(request, context),
      },
      retryScoring: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().mockExams.retryScoring.POST(
            request,
            context,
          ),
      },
      submit: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().mockExams.submit.POST(request, context),
      },
      terminate: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().mockExams.terminate.POST(
            request,
            context,
          ),
      },
    },
    practices: {
      answers: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().practices.answers.POST(
            request,
            context,
          ),
      },
      collection: {
        POST: (request: Request) =>
          readLegacyFlowRouteHandlers().practices.collection.POST(request),
      },
      detail: {
        GET: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().practices.detail.GET(request, context),
      },
      favoriteQuestion: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().practices.favoriteQuestion.POST(
            request,
            context,
          ),
      },
      restart: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().practices.restart.POST(
            request,
            context,
          ),
      },
      terminate: {
        POST: (request: Request, context: RouteContext) =>
          readLegacyFlowRouteHandlers().practices.terminate.POST(
            request,
            context,
          ),
      },
    },
  });
}
