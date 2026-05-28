import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  PaperDraftDto,
  PaperDraftResultDto,
  PaperCopyResultDto,
  PaperDeleteResultDto,
  PaperPublishResultDto,
  PaperPublishValidationIssueDto,
  PaperQuestionResultDto,
} from "../contracts/paper-draft-contract";
import {
  mapPaperDraftResultToApi,
  mapPaperDraftToApi,
  mapPaperQuestionResultToApi,
} from "../mappers/paper-draft-mapper";
import type { PaperDraftRepository } from "../repositories/paper-draft-repository";
import type {
  PaperDraftAccessRow,
  PaperQuestionAccessRow,
  PaperSectionAccessRow,
} from "../repositories/paper-draft-repository";
import type { ContentMutationContext } from "../repositories/question-repository";
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
  publishPaper(
    publicId: string,
  ): Promise<ApiResponse<PaperPublishResultDto | null>>;
  archivePaper(
    publicId: string,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
  deletePaper(
    publicId: string,
  ): Promise<ApiResponse<PaperDeleteResultDto | null>>;
  copyPaper(publicId: string): Promise<ApiResponse<PaperCopyResultDto | null>>;
};

export type PaperDraftServiceOptions = {
  mutationContext?: ContentMutationContext;
};

const INVALID_PAPER_INPUT_CODE = 422203;
const PAPER_NOT_FOUND_CODE = 404203;
const PAPER_COMPOSITION_CONFLICT_CODE = 409203;
const PAPER_PUBLISH_CONFLICT_CODE = 409204;
const PAPER_PUBLISH_VALIDATION_CODE = 422204;
const PAPER_DELETE_CONFLICT_CODE = 409205;
const PAPER_COPY_CONFLICT_CODE = 409206;
const PAPER_RUNTIME_UNAVAILABLE_CODE = 503203;
const PAPER_SECTION_CONTRACT_TERM = "paper_section";
const QUESTION_GROUP_CONTRACT_TERM = "question_group";
const SORT_ORDER_CONTRACT_TERM = "sort_order";
const SCORING_POINT_CONTRACT_TERM = "scoring_point";
const STANDARD_ANSWER_CONTRACT_TERM = "standard_answer";
const DISABLE_CONTRACT_TERM = "disable";

void [
  PAPER_SECTION_CONTRACT_TERM,
  QUESTION_GROUP_CONTRACT_TERM,
  SORT_ORDER_CONTRACT_TERM,
  SCORING_POINT_CONTRACT_TERM,
  STANDARD_ANSWER_CONTRACT_TERM,
  DISABLE_CONTRACT_TERM,
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

function createNonDraftPublishResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_PUBLISH_CONFLICT_CODE,
    "Only draft paper can be published.",
  );
}

function createPaperPublishValidationResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_PUBLISH_VALIDATION_CODE,
    "Paper publish validation failed.",
  );
}

function createNonPublishedArchiveResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_PUBLISH_CONFLICT_CODE,
    "Only published paper can be archived.",
  );
}

function createPaperDeleteConflictResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_DELETE_CONFLICT_CODE,
    "Only unreferenced draft paper can be deleted.",
  );
}

function createPaperCopyConflictResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_COPY_CONFLICT_CODE,
    "Only published or archived paper can be copied.",
  );
}

function convertScoreToHalfPoints(score: string | null): number | null {
  if (score === null) {
    return null;
  }

  const parsedScore = Number(score);

  if (!Number.isFinite(parsedScore)) {
    return null;
  }

  return Math.round(parsedScore * 2);
}

function isSubjectivePaperQuestion(
  paperQuestion: PaperQuestionAccessRow,
): boolean {
  return (
    paperQuestion.question_snapshot.questionType === "short_answer" ||
    paperQuestion.question_snapshot.questionType === "case_analysis" ||
    paperQuestion.question_snapshot.questionType === "calculation" ||
    paperQuestion.question_snapshot.scoringMethod === "ai_scoring"
  );
}

function isFillBlankPaperQuestion(
  paperQuestion: PaperQuestionAccessRow,
): boolean {
  return paperQuestion.question_snapshot.questionType === "fill_blank";
}

function listPaperQuestions(
  paperSections: PaperSectionAccessRow[],
): PaperQuestionAccessRow[] {
  return paperSections.flatMap((paperSection) => paperSection.paper_questions);
}

function listSourceQuestionPublicIds(
  paperQuestions: PaperQuestionAccessRow[],
): string[] {
  return Array.from(
    new Set(
      paperQuestions.map(
        (paperQuestion) => paperQuestion.source_question_public_id,
      ),
    ),
  );
}

function listMaterialPublicIds(
  paperQuestions: PaperQuestionAccessRow[],
): string[] {
  return Array.from(
    new Set(
      paperQuestions.flatMap((paperQuestion) =>
        paperQuestion.material_snapshot === null
          ? []
          : [paperQuestion.material_snapshot.materialPublicId],
      ),
    ),
  );
}

function sumHalfPoints(values: number[]): number {
  return values.reduce((totalScore, score) => totalScore + score, 0);
}

function validatePaperForPublish(paper: PaperDraftAccessRow): {
  issues: PaperPublishValidationIssueDto[];
  sourceQuestionPublicIds: string[];
  materialPublicIds: string[];
} {
  const paperQuestions = listPaperQuestions(paper.paper_sections);
  const paperQuestionScores = paperQuestions.map((paperQuestion) =>
    convertScoreToHalfPoints(paperQuestion.score),
  );
  const validQuestionScores = paperQuestionScores.filter(
    (score): score is number => score !== null,
  );
  const missingQuestionScore = paperQuestionScores.some(
    (score) => score === null,
  );
  const paperTotalScore = convertScoreToHalfPoints(paper.total_score);
  const hasCountingQuestion = validQuestionScores.some((score) => score > 0);
  const emptyPaperSection = paper.paper_sections.some(
    (paperSection) => paperSection.paper_questions.length === 0,
  );
  const scoringPointMismatch = paperQuestions.some((paperQuestion) => {
    const questionScore = convertScoreToHalfPoints(paperQuestion.score);

    if (questionScore === null || !isSubjectivePaperQuestion(paperQuestion)) {
      return false;
    }

    const scoringPointScores = paperQuestion.scoring_points.map(
      (scoringPoint) => convertScoreToHalfPoints(scoringPoint.score) ?? 0,
    );

    return sumHalfPoints(scoringPointScores) !== questionScore;
  });
  const fillBlankScoreMismatch = paperQuestions.some((paperQuestion) => {
    const questionScore = convertScoreToHalfPoints(paperQuestion.score);

    if (
      questionScore === null ||
      !isFillBlankPaperQuestion(paperQuestion) ||
      (paperQuestion.question_snapshot.fillBlankAnswers ?? []).length === 0
    ) {
      return false;
    }

    const fillBlankScores = (
      paperQuestion.question_snapshot.fillBlankAnswers ?? []
    ).map(
      (fillBlankAnswer) => convertScoreToHalfPoints(fillBlankAnswer.score) ?? 0,
    );

    return sumHalfPoints(fillBlankScores) !== questionScore;
  });
  const questionScoreTotal = sumHalfPoints(validQuestionScores);
  const issues: PaperPublishValidationIssueDto[] = [
    ...(missingQuestionScore
      ? [
          {
            code: "paper_question_score_missing" as const,
            message: "Every paper question must have score before publish.",
          },
        ]
      : []),
    ...(paperTotalScore === null
      ? [
          {
            code: "paper_total_score_missing" as const,
            message: "Paper total score must be set before publish.",
          },
        ]
      : []),
    ...(!missingQuestionScore &&
    paperTotalScore !== null &&
    paperTotalScore !== questionScoreTotal
      ? [
          {
            code: "paper_total_score_mismatch" as const,
            message: "Paper total score must equal paper question score sum.",
          },
        ]
      : []),
    ...(!hasCountingQuestion
      ? [
          {
            code: "paper_has_no_counting_question" as const,
            message: "Paper must contain at least one counting question.",
          },
        ]
      : []),
    ...(emptyPaperSection
      ? [
          {
            code: "empty_paper_section" as const,
            message: "Published paper cannot contain empty paper_section.",
          },
        ]
      : []),
    ...(scoringPointMismatch
      ? [
          {
            code: "scoring_point_total_mismatch" as const,
            message:
              "Subjective scoring_point total must equal paper question score.",
          },
        ]
      : []),
    ...(fillBlankScoreMismatch
      ? [
          {
            code: "fill_blank_score_total_mismatch" as const,
            message:
              "Fill_blank per-blank score total must equal paper question score.",
          },
        ]
      : []),
  ];

  return {
    issues,
    sourceQuestionPublicIds: listSourceQuestionPublicIds(paperQuestions),
    materialPublicIds: listMaterialPublicIds(paperQuestions),
  };
}

export function createPaperDraftService(
  paperRepository: PaperDraftRepository,
  options: PaperDraftServiceOptions = {},
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

      const paper = await paperRepository.createPaper(
        paperInput.value,
        options.mutationContext,
      );

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

      const updatedPaper = await paperRepository.updatePaper(
        {
          publicId,
          ...paperInput.value,
        },
        options.mutationContext,
      );

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

    async publishPaper(publicId) {
      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (paper.paper_status !== "draft") {
        return createNonDraftPublishResponse();
      }

      const publishValidation = validatePaperForPublish(paper);

      if (publishValidation.issues.length > 0) {
        return createPaperPublishValidationResponse();
      }

      const publishedPaper = await paperRepository.publishPaper(
        {
          paperPublicId: publicId,
          sourceQuestionPublicIds: publishValidation.sourceQuestionPublicIds,
          materialPublicIds: publishValidation.materialPublicIds,
        },
        options.mutationContext,
      );

      if (publishedPaper === null) {
        return createPaperPublishValidationResponse();
      }

      return createSuccessResponse({
        paper: mapPaperDraftToApi(publishedPaper),
        lockedQuestionPublicIds: publishValidation.sourceQuestionPublicIds,
        lockedMaterialPublicIds: publishValidation.materialPublicIds,
      });
    },

    async archivePaper(publicId) {
      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (paper.paper_status !== "published") {
        return createNonPublishedArchiveResponse();
      }

      const archivedPaper = await paperRepository.archivePaper(
        {
          paperPublicId: publicId,
        },
        options.mutationContext,
      );

      if (archivedPaper === null) {
        return createPaperDeleteConflictResponse();
      }

      return createSuccessResponse(mapPaperDraftResultToApi(archivedPaper));
    },

    async deletePaper(publicId) {
      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (paper.paper_status !== "draft") {
        return createPaperDeleteConflictResponse();
      }

      const deleted = await paperRepository.deletePaper({
        paperPublicId: publicId,
      });

      if (!deleted) {
        return createPaperDeleteConflictResponse();
      }

      return createSuccessResponse({
        deletedPaperPublicId: publicId,
      });
    },

    async copyPaper(publicId) {
      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (
        paper.paper_status !== "published" &&
        paper.paper_status !== "archived"
      ) {
        return createPaperCopyConflictResponse();
      }

      const copiedPaper = await paperRepository.copyPaper(
        {
          sourcePaper: paper,
        },
        options.mutationContext,
      );

      if (copiedPaper === null) {
        return createPaperCopyConflictResponse();
      }

      return createSuccessResponse({
        copiedFromPaperPublicId: publicId,
        paper: mapPaperDraftToApi(copiedPaper),
      });
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
    async publishPaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async archivePaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async deletePaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async copyPaper() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
  };
}
