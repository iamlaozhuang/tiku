import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PaperDraftDto,
  PaperDraftResultDto,
  PaperQuestionResultDto,
} from "../contracts/paper-draft-contract";
import {
  mapPaperDraftResultToApi,
  mapPaperDraftToApi,
  mapPaperQuestionResultToApi,
} from "../mappers/paper-draft-mapper";
import type { PaperDraftRepository } from "../repositories/paper-draft-repository";
import {
  normalizeAddPaperQuestionInput,
  normalizeCreatePaperInput,
  normalizePaperListInput,
  normalizeUpdatePaperInput,
  normalizeUpdatePaperQuestionInput,
} from "../validators/paper-draft";

export type PaperDraftService = {
  listPapers(
    input?: Record<string, unknown>,
  ): Promise<ApiResponse<PaperDraftDto[] | null>>;
  createPaper(input: unknown): Promise<ApiResponse<PaperDraftResultDto | null>>;
  getPaper(publicId: string): Promise<ApiResponse<PaperDraftResultDto | null>>;
  updatePaper(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
  addQuestionToDraftPaper(
    paperPublicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperQuestionResultDto | null>>;
  updatePaperQuestion(
    paperPublicId: string,
    paperQuestionPublicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperQuestionResultDto | null>>;
  removePaperQuestion(
    paperPublicId: string,
    paperQuestionPublicId: string,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
};

const INVALID_PAPER_INPUT_CODE = 422203;
const PAPER_NOT_FOUND_CODE = 404203;
const PAPER_COMPOSITION_CONFLICT_CODE = 409203;
const PAPER_RUNTIME_UNAVAILABLE_CODE = 503203;
const PAPER_SECTION_CONTRACT_TERM = "paper_section";
const QUESTION_GROUP_CONTRACT_TERM = "question_group";
const SORT_ORDER_CONTRACT_TERM = "sort_order";

void [
  PAPER_SECTION_CONTRACT_TERM,
  QUESTION_GROUP_CONTRACT_TERM,
  SORT_ORDER_CONTRACT_TERM,
];

function createInvalidPaperInputResponse(): ApiResponse<null> {
  return createErrorResponse(INVALID_PAPER_INPUT_CODE, "Invalid paper input.");
}

function createPaperNotFoundResponse(): ApiResponse<null> {
  return createErrorResponse(PAPER_NOT_FOUND_CODE, "Paper does not exist.");
}

function createNonDraftPaperResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_COMPOSITION_CONFLICT_CODE,
    "Only draft paper can be composed.",
  );
}

export function createPaperDraftService(
  paperRepository: PaperDraftRepository,
): PaperDraftService {
  return {
    async listPapers(input = {}) {
      const paperQuery = normalizePaperListInput(input);
      const paperList = await paperRepository.listPapers(paperQuery);

      return createPaginatedResponse(
        paperList.rows.map((paper) => mapPaperDraftToApi(paper)),
        {
          page: paperQuery.page,
          pageSize: paperQuery.pageSize,
          total: paperList.total,
          sortBy: paperQuery.sortBy,
          sortOrder: paperQuery.sortOrder,
        },
      );
    },

    async createPaper(input) {
      const paperInput = normalizeCreatePaperInput(input);

      if (!paperInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.createPaper(paperInput.value);

      return createSuccessResponse(mapPaperDraftResultToApi(paper));
    },

    async getPaper(publicId) {
      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      return createSuccessResponse(mapPaperDraftResultToApi(paper));
    },

    async updatePaper(publicId, input) {
      const paperInput = normalizeUpdatePaperInput(input);

      if (!paperInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (paper.paper_status !== "draft") {
        return createNonDraftPaperResponse();
      }

      const updatedPaper = await paperRepository.updatePaper({
        publicId,
        ...paperInput.value,
      });

      return createSuccessResponse(mapPaperDraftResultToApi(updatedPaper));
    },

    async addQuestionToDraftPaper(paperPublicId, input) {
      const paperQuestionInput = normalizeAddPaperQuestionInput(input);

      if (!paperQuestionInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(paperPublicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (paper.paper_status !== "draft") {
        return createNonDraftPaperResponse();
      }

      const paperQuestion = await paperRepository.addQuestionToDraftPaper({
        paperPublicId,
        ...paperQuestionInput.value,
      });

      if (paperQuestion === null) {
        return createPaperNotFoundResponse();
      }

      return createSuccessResponse(mapPaperQuestionResultToApi(paperQuestion));
    },

    async updatePaperQuestion(paperPublicId, paperQuestionPublicId, input) {
      const paperQuestionInput = normalizeUpdatePaperQuestionInput(input);

      if (!paperQuestionInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(paperPublicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (paper.paper_status !== "draft") {
        return createNonDraftPaperResponse();
      }

      const paperQuestion = await paperRepository.updatePaperQuestion({
        paperPublicId,
        paperQuestionPublicId,
        ...paperQuestionInput.value,
      });

      if (paperQuestion === null) {
        return createPaperNotFoundResponse();
      }

      return createSuccessResponse(mapPaperQuestionResultToApi(paperQuestion));
    },

    async removePaperQuestion(paperPublicId, paperQuestionPublicId) {
      const paper = await paperRepository.findPaperByPublicId(paperPublicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (paper.paper_status !== "draft") {
        return createNonDraftPaperResponse();
      }

      const updatedPaper = await paperRepository.removePaperQuestion({
        paperPublicId,
        paperQuestionPublicId,
      });

      if (updatedPaper === null) {
        return createPaperNotFoundResponse();
      }

      return createSuccessResponse(mapPaperDraftResultToApi(updatedPaper));
    },
  };
}

export function createUnavailablePaperDraftService(): PaperDraftService {
  return {
    async listPapers() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async createPaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async getPaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async updatePaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async addQuestionToDraftPaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async updatePaperQuestion() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async removePaperQuestion() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
  };
}
