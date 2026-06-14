import {
  type ApiEnvelope,
  type ExamPaperDetailData,
  type ExamPaperListData,
  type ExamPaperTransport,
} from "@/server/contracts/question-paper/exam-paper-contract";
import {
  createUnavailableQuestionPaperRepository,
  mapExamPaperRecord,
  type QuestionPaperRepository,
} from "@/server/repositories/question-paper/question-paper-repository";
import {
  parseExamPaperListQuery,
  validateExamPaperPublicId,
} from "@/server/validators/question-paper/exam-paper-validator";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

type QuestionPaperRouteHandlerOptions = {
  repository?: QuestionPaperRepository;
};

function createJsonResponse<TData>(
  envelope: ApiEnvelope<TData>,
  init?: ResponseInit,
) {
  return Response.json(envelope, init);
}

function createUnavailableResponse() {
  return createJsonResponse(
    {
      code: 503001,
      data: null,
      message: "Question paper repository is not configured.",
    },
    { status: 503 },
  );
}

function createNotFoundResponse() {
  return createJsonResponse(
    {
      code: 404001,
      data: null,
      message: "Exam paper not found.",
    },
    { status: 404 },
  );
}

function createInvalidPublicIdResponse(message: string, code: number) {
  return createJsonResponse(
    {
      code,
      data: null,
      message,
    },
    { status: 400 },
  );
}

function createExamPaperEnvelope(
  examPaper: ExamPaperTransport,
): ApiEnvelope<ExamPaperDetailData> {
  return {
    code: 0,
    data: { examPaper },
    message: "ok",
  };
}

export function createQuestionPaperRouteHandlers(
  options: QuestionPaperRouteHandlerOptions = {},
) {
  const repository =
    options.repository ?? createUnavailableQuestionPaperRepository();

  async function readValidPublicId(context: RouteContext) {
    const routeParams = await context.params;
    const validationResult = validateExamPaperPublicId(routeParams.publicId);

    return validationResult;
  }

  return {
    examPapers: {
      collection: {
        async GET(request: Request) {
          if (repository.listExamPapers === undefined) {
            return createUnavailableResponse();
          }

          const query = parseExamPaperListQuery(request);
          const listResult = await repository.listExamPapers(query);

          return createJsonResponse<ExamPaperListData>({
            code: 0,
            data: {
              examPapers: listResult.examPapers.map(mapExamPaperRecord),
            },
            message: "ok",
            pagination: listResult.pagination,
          });
        },
        async POST() {
          if (repository.createExamPaperDraft === undefined) {
            return createUnavailableResponse();
          }

          const examPaper = await repository.createExamPaperDraft();

          return createJsonResponse(
            createExamPaperEnvelope(mapExamPaperRecord(examPaper)),
          );
        },
      },
      copy: {
        async POST(_request: Request, context: RouteContext) {
          if (repository.copyExamPaper === undefined) {
            return createUnavailableResponse();
          }

          const validationResult = await readValidPublicId(context);

          if (!validationResult.ok) {
            return createInvalidPublicIdResponse(
              validationResult.message,
              validationResult.code,
            );
          }

          const examPaper = await repository.copyExamPaper(
            validationResult.value,
          );

          return examPaper === null
            ? createNotFoundResponse()
            : createJsonResponse(
                createExamPaperEnvelope(mapExamPaperRecord(examPaper)),
              );
        },
      },
      detail: {
        async GET(_request: Request, context: RouteContext) {
          if (repository.findExamPaperByPublicId === undefined) {
            return createUnavailableResponse();
          }

          const validationResult = await readValidPublicId(context);

          if (!validationResult.ok) {
            return createInvalidPublicIdResponse(
              validationResult.message,
              validationResult.code,
            );
          }

          const examPaper = await repository.findExamPaperByPublicId(
            validationResult.value,
          );

          return examPaper === null
            ? createNotFoundResponse()
            : createJsonResponse(
                createExamPaperEnvelope(mapExamPaperRecord(examPaper)),
              );
        },
        async PATCH(_request: Request, context: RouteContext) {
          if (repository.updateExamPaper === undefined) {
            return createUnavailableResponse();
          }

          const validationResult = await readValidPublicId(context);

          if (!validationResult.ok) {
            return createInvalidPublicIdResponse(
              validationResult.message,
              validationResult.code,
            );
          }

          const examPaper = await repository.updateExamPaper(
            validationResult.value,
          );

          return examPaper === null
            ? createNotFoundResponse()
            : createJsonResponse(
                createExamPaperEnvelope(mapExamPaperRecord(examPaper)),
              );
        },
      },
      publish: {
        async POST(_request: Request, context: RouteContext) {
          if (repository.publishExamPaper === undefined) {
            return createUnavailableResponse();
          }

          const validationResult = await readValidPublicId(context);

          if (!validationResult.ok) {
            return createInvalidPublicIdResponse(
              validationResult.message,
              validationResult.code,
            );
          }

          const examPaper = await repository.publishExamPaper(
            validationResult.value,
          );

          return examPaper === null
            ? createNotFoundResponse()
            : createJsonResponse(
                createExamPaperEnvelope(mapExamPaperRecord(examPaper)),
              );
        },
      },
      unpublish: {
        async POST(_request: Request, context: RouteContext) {
          if (repository.unpublishExamPaper === undefined) {
            return createUnavailableResponse();
          }

          const validationResult = await readValidPublicId(context);

          if (!validationResult.ok) {
            return createInvalidPublicIdResponse(
              validationResult.message,
              validationResult.code,
            );
          }

          const examPaper = await repository.unpublishExamPaper(
            validationResult.value,
          );

          return examPaper === null
            ? createNotFoundResponse()
            : createJsonResponse(
                createExamPaperEnvelope(mapExamPaperRecord(examPaper)),
              );
        },
      },
    },
  };
}
