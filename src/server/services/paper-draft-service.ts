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
import {
  PaperCommandConflictError,
  type PaperDraftRepository,
} from "../repositories/paper-draft-repository";
import type {
  PaperDraftAccessRow,
  PaperQuestionAccessRow,
  PaperSectionAccessRow,
} from "../repositories/paper-draft-repository";
import type { ContentMutationContext } from "../repositories/question-repository";
import { isQuestionScoringContractValid } from "../../lib/question-scoring-contract";
import {
  normalizeAddPaperQuestionInput,
  normalizeCreatePaperInput,
  normalizePaperListInput,
  normalizePaperCommandInput,
  normalizePaperRevisionInput,
  normalizePaperSectionCommandInput,
  normalizeQuestionGroupCommandInput,
  normalizeUpdatePaperInput,
  normalizeUpdatePaperQuestionInput,
  validateDraftPaperQuestionCount,
  validatePublishedPaperQuestionCount,
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
    input: unknown,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
  mutatePaperSections(
    paperPublicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
  mutateQuestionGroups(
    paperPublicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
  publishPaper(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperPublishResultDto | null>>;
  archivePaper(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperDraftResultDto | null>>;
  deletePaper(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperDeleteResultDto | null>>;
  copyPaper(
    publicId: string,
    input: unknown,
  ): Promise<ApiResponse<PaperCopyResultDto | null>>;
};

export type PaperDraftServiceOptions = {
  mutationContext?: ContentMutationContext;
};

const INVALID_PAPER_INPUT_CODE = 422203;
const PAPER_NOT_FOUND_CODE = 404203;
const PAPER_COMPOSITION_CONFLICT_CODE = 409203;
const PAPER_PUBLISH_CONFLICT_CODE = 409204;
const PAPER_PUBLISH_VALIDATION_CODE = 422204;
const PAPER_QUESTION_COUNT_VALIDATION_CODE = 422205;
const PAPER_DELETE_CONFLICT_CODE = 409205;
const PAPER_COPY_CONFLICT_CODE = 409206;
const PAPER_COMMAND_CONFLICT_CODE = 409207;
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

function createPaperQuestionCountValidationResponse(
  message: string,
): ApiResponse<null> {
  return createErrorResponse(PAPER_QUESTION_COUNT_VALIDATION_CODE, message);
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

function createPaperCommandConflictResponse(): ApiResponse<null> {
  return createErrorResponse(
    PAPER_COMMAND_CONFLICT_CODE,
    "Paper command conflicts with an existing request.",
  );
}

function convertScoreToHalfPoints(score: string | null): number | null {
  if (score === null) {
    return null;
  }

  const parsedScore = Number(score);
  const halfPoints = parsedScore * 2;

  if (
    !Number.isFinite(parsedScore) ||
    parsedScore <= 0 ||
    !Number.isInteger(halfPoints)
  ) {
    return null;
  }

  return halfPoints;
}

function isSubjectivePaperQuestion(
  paperQuestion: PaperQuestionAccessRow,
): boolean {
  return (
    paperQuestion.question_snapshot.scoringMethod === "ai_scoring" &&
    (paperQuestion.question_snapshot.questionType === "fill_blank" ||
      paperQuestion.question_snapshot.questionType === "short_answer" ||
      paperQuestion.question_snapshot.questionType === "case_analysis" ||
      paperQuestion.question_snapshot.questionType === "calculation")
  );
}

function isFillBlankPaperQuestion(
  paperQuestion: PaperQuestionAccessRow,
): boolean {
  return (
    paperQuestion.question_snapshot.questionType === "fill_blank" &&
    paperQuestion.question_snapshot.scoringMethod === "auto_match"
  );
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
  const publishedQuestionCountValidation = validatePublishedPaperQuestionCount(
    paperQuestions.length,
  );
  const emptyPaperSection = paper.paper_sections.some(
    (paperSection) => paperSection.paper_questions.length === 0,
  );
  const populatedQuestionGroupIds = new Set(
    paperQuestions.flatMap((paperQuestion) =>
      paperQuestion.question_group_public_id === null ||
      paperQuestion.question_group_public_id === undefined
        ? []
        : [paperQuestion.question_group_public_id],
    ),
  );
  const emptyQuestionGroup = paper.question_groups.some(
    (questionGroup) => !populatedQuestionGroupIds.has(questionGroup.public_id),
  );
  const scoringPointMismatch = paperQuestions.some((paperQuestion) => {
    const questionScore = convertScoreToHalfPoints(paperQuestion.score);

    if (!isSubjectivePaperQuestion(paperQuestion)) {
      return paperQuestion.scoring_points.length > 0;
    }

    const scoringPointScores = paperQuestion.scoring_points.map(
      (scoringPoint) => convertScoreToHalfPoints(scoringPoint.score),
    );

    return (
      questionScore === null ||
      scoringPointScores.length === 0 ||
      scoringPointScores.some((score) => score === null) ||
      sumHalfPoints(scoringPointScores as number[]) !== questionScore
    );
  });
  const fillBlankScoreMismatch = paperQuestions.some((paperQuestion) => {
    const questionScore = convertScoreToHalfPoints(paperQuestion.score);

    if (questionScore === null || !isFillBlankPaperQuestion(paperQuestion)) {
      return false;
    }

    const fillBlankAnswers =
      paperQuestion.question_snapshot.fillBlankAnswers ?? [];

    if (fillBlankAnswers.length === 0) {
      return true;
    }

    const fillBlankScores = fillBlankAnswers.map((fillBlankAnswer) =>
      convertScoreToHalfPoints(fillBlankAnswer.score),
    );

    return (
      fillBlankScores.some((score) => score === null) ||
      sumHalfPoints(fillBlankScores as number[]) !== questionScore
    );
  });
  const scoringContractMismatch = paperQuestions.some(
    (paperQuestion) =>
      !isQuestionScoringContractValid({
        questionType: paperQuestion.question_snapshot.questionType,
        scoringMethod: paperQuestion.question_snapshot.scoringMethod,
        multiChoiceRule: paperQuestion.question_snapshot.multiChoiceRule,
      }),
  );
  const questionGroupByPublicId = new Map(
    paper.question_groups.map((questionGroup) => [
      questionGroup.public_id,
      questionGroup,
    ]),
  );
  const questionGroupMismatch = paper.paper_sections.some((paperSection) =>
    paperSection.paper_questions.some((paperQuestion) => {
      if (paperQuestion.question_group_id === null) {
        return paperQuestion.question_group_public_id != null;
      }

      const questionGroupPublicId = paperQuestion.question_group_public_id;
      const materialPublicId =
        paperQuestion.material_snapshot?.materialPublicId ?? null;
      const questionGroup =
        questionGroupPublicId === null || questionGroupPublicId === undefined
          ? undefined
          : questionGroupByPublicId.get(questionGroupPublicId);

      return (
        questionGroup === undefined ||
        questionGroup.id !== paperQuestion.question_group_id ||
        questionGroup.paper_section_id !== paperSection.id ||
        materialPublicId === null ||
        questionGroup.material_public_id !== materialPublicId
      );
    }),
  );
  const questionScoreTotal = sumHalfPoints(validQuestionScores);
  const issues: PaperPublishValidationIssueDto[] = [
    ...(!publishedQuestionCountValidation.success
      ? [
          {
            code: "paper_question_count_invalid" as const,
            message: publishedQuestionCountValidation.message,
          },
        ]
      : []),
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
    ...(emptyQuestionGroup
      ? [
          {
            code: "empty_question_group" as const,
            message: "Published paper cannot contain empty question_group.",
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
    ...(scoringContractMismatch
      ? [
          {
            code: "question_scoring_contract_mismatch" as const,
            message:
              "Question type, scoring method and multi-choice rule must agree.",
          },
        ]
      : []),
    ...(questionGroupMismatch
      ? [
          {
            code: "question_group_inconsistent" as const,
            message:
              "Question group identity, section and material must match every child question.",
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

      let paper: PaperDraftAccessRow;
      try {
        paper = await paperRepository.createPaper(
          paperInput.value,
          options.mutationContext,
        );
      } catch (error) {
        if (error instanceof PaperCommandConflictError) {
          return createPaperCommandConflictResponse();
        }
        throw error;
      }

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

      if (
        paper.paper_status !== "draft" ||
        paper.revision !== paperInput.value.expectedRevision
      ) {
        return createNonDraftPaperResponse();
      }

      const updatedPaper = await paperRepository.updatePaper(
        {
          publicId,
          ...paperInput.value,
        },
        options.mutationContext,
      );

      if (updatedPaper === null) {
        return createNonDraftPaperResponse();
      }

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

      if (
        paper.paper_status === "draft" &&
        paper.revision === paperQuestionInput.value.expectedRevision
      ) {
        const draftQuestionCountValidation = validateDraftPaperQuestionCount(
          listPaperQuestions(paper.paper_sections).length + 1,
        );

        if (!draftQuestionCountValidation.success) {
          return createPaperQuestionCountValidationResponse(
            draftQuestionCountValidation.message,
          );
        }
      }

      let paperQuestion: PaperQuestionAccessRow | null;
      try {
        paperQuestion = await paperRepository.addQuestionToDraftPaper(
          {
            paperPublicId,
            ...paperQuestionInput.value,
          },
          options.mutationContext,
        );
      } catch (error) {
        if (error instanceof PaperCommandConflictError) {
          return createPaperCommandConflictResponse();
        }
        throw error;
      }

      if (paperQuestion === null) {
        return createNonDraftPaperResponse();
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

      if (
        paper.paper_status !== "draft" ||
        paper.revision !== paperQuestionInput.value.expectedRevision
      ) {
        return createNonDraftPaperResponse();
      }

      const paperQuestion = await paperRepository.updatePaperQuestion(
        {
          paperPublicId,
          paperQuestionPublicId,
          ...paperQuestionInput.value,
        },
        options.mutationContext,
      );

      if (paperQuestion === null) {
        return createNonDraftPaperResponse();
      }

      return createSuccessResponse(mapPaperQuestionResultToApi(paperQuestion));
    },

    async removePaperQuestion(paperPublicId, paperQuestionPublicId, input) {
      const revisionInput = normalizePaperRevisionInput(input);

      if (!revisionInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(paperPublicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (
        paper.paper_status !== "draft" ||
        paper.revision !== revisionInput.value.expectedRevision
      ) {
        return createNonDraftPaperResponse();
      }

      const updatedPaper = await paperRepository.removePaperQuestion(
        {
          paperPublicId,
          paperQuestionPublicId,
          expectedRevision: revisionInput.value.expectedRevision,
        },
        options.mutationContext,
      );

      if (updatedPaper === null) {
        return createNonDraftPaperResponse();
      }

      return createSuccessResponse(mapPaperDraftResultToApi(updatedPaper));
    },

    async mutatePaperSections(paperPublicId, input) {
      const commandInput = normalizePaperSectionCommandInput(input);
      if (!commandInput.success) {
        return createInvalidPaperInputResponse();
      }
      const paper = await paperRepository.findPaperByPublicId(paperPublicId);
      if (paper === null) {
        return createPaperNotFoundResponse();
      }
      if (
        paper.paper_status !== "draft" ||
        paper.revision !== commandInput.value.expectedRevision
      ) {
        return createNonDraftPaperResponse();
      }
      const updatedPaper = await paperRepository.mutatePaperSections(
        { paperPublicId, ...commandInput.value },
        options.mutationContext,
      );
      return updatedPaper === null
        ? createNonDraftPaperResponse()
        : createSuccessResponse(mapPaperDraftResultToApi(updatedPaper));
    },

    async mutateQuestionGroups(paperPublicId, input) {
      const commandInput = normalizeQuestionGroupCommandInput(input);
      if (!commandInput.success) {
        return createInvalidPaperInputResponse();
      }
      const paper = await paperRepository.findPaperByPublicId(paperPublicId);
      if (paper === null) {
        return createPaperNotFoundResponse();
      }
      if (
        paper.paper_status !== "draft" ||
        paper.revision !== commandInput.value.expectedRevision
      ) {
        return createNonDraftPaperResponse();
      }
      const updatedPaper = await paperRepository.mutateQuestionGroups(
        { paperPublicId, ...commandInput.value },
        options.mutationContext,
      );
      return updatedPaper === null
        ? createNonDraftPaperResponse()
        : createSuccessResponse(mapPaperDraftResultToApi(updatedPaper));
    },

    async publishPaper(publicId, input) {
      const commandInput = normalizePaperCommandInput(input);

      if (!commandInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      const publishValidation = validatePaperForPublish(paper);

      if (publishValidation.issues.length > 0) {
        return createPaperPublishValidationResponse();
      }

      let publishedPaper: PaperDraftAccessRow | null;
      try {
        publishedPaper = await paperRepository.publishPaper(
          {
            paperPublicId: publicId,
            ...commandInput.value,
            sourceQuestionPublicIds: publishValidation.sourceQuestionPublicIds,
            materialPublicIds: publishValidation.materialPublicIds,
          },
          options.mutationContext,
        );
      } catch (error) {
        if (error instanceof PaperCommandConflictError) {
          return createPaperCommandConflictResponse();
        }
        throw error;
      }

      if (publishedPaper === null) {
        return createNonDraftPublishResponse();
      }

      return createSuccessResponse({
        paper: mapPaperDraftToApi(publishedPaper),
        lockedQuestionPublicIds: publishValidation.sourceQuestionPublicIds,
        lockedMaterialPublicIds: publishValidation.materialPublicIds,
      });
    },

    async archivePaper(publicId, input) {
      const revisionInput = normalizePaperRevisionInput(input);

      if (!revisionInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (
        paper.paper_status !== "published" ||
        paper.revision !== revisionInput.value.expectedRevision
      ) {
        return createNonPublishedArchiveResponse();
      }

      const archivedPaper = await paperRepository.archivePaper(
        {
          paperPublicId: publicId,
          expectedRevision: revisionInput.value.expectedRevision,
        },
        options.mutationContext,
      );

      if (archivedPaper === null) {
        return createNonPublishedArchiveResponse();
      }

      return createSuccessResponse(mapPaperDraftResultToApi(archivedPaper));
    },

    async deletePaper(publicId, input) {
      const revisionInput = normalizePaperRevisionInput(input);

      if (!revisionInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (
        paper.paper_status !== "draft" ||
        paper.revision !== revisionInput.value.expectedRevision
      ) {
        return createPaperDeleteConflictResponse();
      }

      const deleted = await paperRepository.deletePaper(
        {
          paperPublicId: publicId,
          expectedRevision: revisionInput.value.expectedRevision,
        },
        options.mutationContext,
      );

      if (!deleted) {
        return createPaperDeleteConflictResponse();
      }

      return createSuccessResponse({
        deletedPaperPublicId: publicId,
      });
    },

    async copyPaper(publicId, input) {
      const commandInput = normalizePaperCommandInput(input);

      if (!commandInput.success) {
        return createInvalidPaperInputResponse();
      }

      const paper = await paperRepository.findPaperByPublicId(publicId);

      if (paper === null) {
        return createPaperNotFoundResponse();
      }

      if (
        (paper.paper_status === "published" ||
          paper.paper_status === "archived") &&
        paper.revision === commandInput.value.expectedRevision
      ) {
        const copiedDraftQuestionCountValidation =
          validateDraftPaperQuestionCount(
            listPaperQuestions(paper.paper_sections).length,
          );

        if (!copiedDraftQuestionCountValidation.success) {
          return createPaperQuestionCountValidationResponse(
            copiedDraftQuestionCountValidation.message,
          );
        }
      }

      let copiedPaper: PaperDraftAccessRow | null;
      try {
        copiedPaper = await paperRepository.copyPaper(
          {
            sourcePaperPublicId: publicId,
            ...commandInput.value,
          },
          options.mutationContext,
        );
      } catch (error) {
        if (error instanceof PaperCommandConflictError) {
          return createPaperCommandConflictResponse();
        }
        throw error;
      }

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
    async mutatePaperSections() {
      return createErrorResponse(
        PAPER_RUNTIME_UNAVAILABLE_CODE,
        "Paper runtime is not configured.",
      );
    },
    async mutateQuestionGroups() {
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
