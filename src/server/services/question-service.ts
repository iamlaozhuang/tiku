import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  QuestionDto,
  QuestionResultDto,
} from "../contracts/question-contract";
import {
  mapQuestionResultToApi,
  mapQuestionToApi,
} from "../mappers/question-mapper";
import type {
  ContentMutationContext,
  QuestionRepository,
} from "../repositories/question-repository";
import type { QuestionStatus } from "../models/paper";
import {
  normalizeCreateQuestionInput,
  normalizeQuestionListInput,
  normalizeUpdateQuestionInput,
} from "../validators/question";

export type QuestionService = {
  listQuestions(
    input?: Record<string, unknown>,
  ): Promise<ApiResponse<QuestionDto[] | null>>;
  createQuestion(
    input: unknown,
    options?: QuestionCreationOptions,
  ): Promise<ApiResponse<QuestionResultDto | null>>;
  getQuestion(publicId: string): Promise<ApiResponse<QuestionResultDto | null>>;
  updateQuestion(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<QuestionResultDto | null>>;
  disableQuestion(
    publicId: string,
  ): Promise<ApiResponse<QuestionResultDto | null>>;
  copyQuestion(
    publicId: string,
  ): Promise<ApiResponse<QuestionResultDto | null>>;
};

export type QuestionCreationOptions = {
  initialStatus?: QuestionStatus;
};

export type QuestionServiceOptions = {
  mutationContext?: ContentMutationContext;
};

const INVALID_QUESTION_INPUT_CODE = 422202;
const QUESTION_NOT_FOUND_CODE = 404202;
const QUESTION_LOCKED_CODE = 409202;
const QUESTION_VERSION_CONFLICT_CODE = 409203;
const QUESTION_RUNTIME_UNAVAILABLE_CODE = 503202;

function createInvalidQuestionInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    INVALID_QUESTION_INPUT_CODE,
    "Invalid question input.",
  );
}

function createQuestionNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(
    QUESTION_NOT_FOUND_CODE,
    "Question does not exist.",
  );
}

export function createQuestionService(
  questionRepository: QuestionRepository,
  options: QuestionServiceOptions = {},
): QuestionService {
  return {
    async listQuestions(input = {}) {
      const questionQuery = normalizeQuestionListInput(input);
      const questionList =
        await questionRepository.listQuestions(questionQuery);

      return createPaginatedResponse(
        questionList.rows.map((question) => mapQuestionToApi(question)),
        {
          page: questionQuery.page,
          pageSize: questionQuery.pageSize,
          total: questionList.total,
          sortBy: questionQuery.sortBy,
          sortOrder: questionQuery.sortOrder,
        },
      );
    },

    async createQuestion(input, createOptions) {
      const questionInput = normalizeCreateQuestionInput(input);

      if (!questionInput.success) {
        return createInvalidQuestionInputResponse();
      }

      const question = await questionRepository.createQuestion(
        questionInput.value,
        options.mutationContext,
        createOptions,
      );

      return createSuccessResponse(mapQuestionResultToApi(question));
    },

    async getQuestion(publicId) {
      const question =
        await questionRepository.findQuestionByPublicId(publicId);

      if (question === null) {
        return createQuestionNotFoundResponse();
      }

      return createSuccessResponse(mapQuestionResultToApi(question));
    },

    async updateQuestion(publicId, input) {
      const questionInput = normalizeUpdateQuestionInput(input);

      if (!questionInput.success) {
        return createInvalidQuestionInputResponse();
      }

      const question =
        await questionRepository.findQuestionByPublicId(publicId);

      if (question === null) {
        return createQuestionNotFoundResponse();
      }

      if (question.is_locked) {
        return createErrorResponse(
          QUESTION_LOCKED_CODE,
          "Locked question cannot be edited.",
        );
      }

      const updatedQuestion = await questionRepository.updateQuestion(
        {
          publicId,
          ...questionInput.value,
        },
        options.mutationContext,
      );

      if (updatedQuestion === null) {
        return createErrorResponse(
          QUESTION_VERSION_CONFLICT_CODE,
          "Question changed after it was loaded.",
        );
      }

      return createSuccessResponse(mapQuestionResultToApi(updatedQuestion));
    },

    async disableQuestion(publicId) {
      const question = await questionRepository.disableQuestion(
        publicId,
        options.mutationContext,
      );

      if (question === null) {
        return createQuestionNotFoundResponse();
      }

      return createSuccessResponse(mapQuestionResultToApi(question));
    },

    async copyQuestion(publicId) {
      const question = await questionRepository.copyQuestion(
        publicId,
        options.mutationContext,
      );

      if (question === null) {
        return createQuestionNotFoundResponse();
      }

      return createSuccessResponse(mapQuestionResultToApi(question));
    },
  };
}

export function createUnavailableQuestionService(): QuestionService {
  return {
    async listQuestions() {
      return createErrorResponse(
        QUESTION_RUNTIME_UNAVAILABLE_CODE,
        "Question runtime is not configured.",
      );
    },
    async createQuestion() {
      return createErrorResponse(
        QUESTION_RUNTIME_UNAVAILABLE_CODE,
        "Question runtime is not configured.",
      );
    },
    async getQuestion() {
      return createErrorResponse(
        QUESTION_RUNTIME_UNAVAILABLE_CODE,
        "Question runtime is not configured.",
      );
    },
    async updateQuestion() {
      return createErrorResponse(
        QUESTION_RUNTIME_UNAVAILABLE_CODE,
        "Question runtime is not configured.",
      );
    },
    async disableQuestion() {
      return createErrorResponse(
        QUESTION_RUNTIME_UNAVAILABLE_CODE,
        "Question runtime is not configured.",
      );
    },
    async copyQuestion() {
      return createErrorResponse(
        QUESTION_RUNTIME_UNAVAILABLE_CODE,
        "Question runtime is not configured.",
      );
    },
  };
}
