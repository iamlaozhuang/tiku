import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AdminAiGenerationFormalAdoptionDto } from "../contracts/admin-ai-generation-formal-adoption-contract";
import {
  ADMIN_AI_GENERATION_FORMAL_DRAFT_ADAPTER_ERROR_CODES,
  type AdminAiGenerationFormalDraftAdapterInput,
  type AdminAiGenerationFormalDraftAdapterResultDto,
  type AdminAiGenerationFormalDraftPaperWriter,
  type AdminAiGenerationFormalDraftQuestionWriter,
  type AdminAiGenerationFormalPaperDraftPayload,
  type AdminAiGenerationFormalQuestionDraftPayload,
} from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import type { QuestionOptionDto } from "../contracts/question-contract";
import {
  multiChoiceRuleValues,
  paperTypeValues,
  professionValues,
  questionTypeValues,
  scoringMethodValues,
  subjectValues,
} from "../models/paper";

export type AdminAiGenerationFormalDraftAdapterService = {
  createFormalDraft(
    input: AdminAiGenerationFormalDraftAdapterInput,
  ): Promise<ApiResponse<AdminAiGenerationFormalDraftAdapterResultDto | null>>;
};

export type AdminAiGenerationFormalDraftAdapterWriters = {
  paperWriter: AdminAiGenerationFormalDraftPaperWriter;
  questionWriter: AdminAiGenerationFormalDraftQuestionWriter;
};

const formalAdoptionNotEligibleMessage =
  "Admin AI generation formal adoption is not eligible for draft creation.";
const formalDraftWriterFailedMessage = "Formal draft writer failed.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isQuestionOptionArray(value: unknown): value is QuestionOptionDto[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.label === "string" &&
        typeof item.contentRichText === "string" &&
        typeof item.isCorrect === "boolean" &&
        typeof item.sortOrder === "number",
    )
  );
}

function isScoringPointArray(
  value: unknown,
): value is AdminAiGenerationFormalQuestionDraftPayload["scoringPoints"] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.description === "string" &&
        typeof item.score === "string" &&
        typeof item.sortOrder === "number",
    )
  );
}

function isFillBlankAnswerArray(
  value: unknown,
): value is AdminAiGenerationFormalQuestionDraftPayload["fillBlankAnswers"] {
  return Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isOptionalNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function isQuestionTypeValue(
  value: unknown,
): value is (typeof questionTypeValues)[number] {
  return (
    typeof value === "string" &&
    questionTypeValues.includes(value as (typeof questionTypeValues)[number])
  );
}

function isProfessionValue(
  value: unknown,
): value is (typeof professionValues)[number] {
  return (
    typeof value === "string" &&
    professionValues.includes(value as (typeof professionValues)[number])
  );
}

function isSubjectValue(
  value: unknown,
): value is (typeof subjectValues)[number] {
  return (
    typeof value === "string" &&
    subjectValues.includes(value as (typeof subjectValues)[number])
  );
}

function isMultiChoiceRuleValue(
  value: unknown,
): value is (typeof multiChoiceRuleValues)[number] {
  return (
    typeof value === "string" &&
    multiChoiceRuleValues.includes(
      value as (typeof multiChoiceRuleValues)[number],
    )
  );
}

function isScoringMethodValue(
  value: unknown,
): value is (typeof scoringMethodValues)[number] {
  return (
    typeof value === "string" &&
    scoringMethodValues.includes(value as (typeof scoringMethodValues)[number])
  );
}

function isPaperTypeValue(
  value: unknown,
): value is (typeof paperTypeValues)[number] {
  return (
    typeof value === "string" &&
    paperTypeValues.includes(value as (typeof paperTypeValues)[number])
  );
}

function isQuestionDraftPayload(
  value: unknown,
): value is AdminAiGenerationFormalQuestionDraftPayload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isQuestionTypeValue(value.questionType) &&
    isProfessionValue(value.profession) &&
    typeof value.level === "number" &&
    isSubjectValue(value.subject) &&
    typeof value.stemRichText === "string" &&
    typeof value.analysisRichText === "string" &&
    typeof value.standardAnswerRichText === "string" &&
    isMultiChoiceRuleValue(value.multiChoiceRule) &&
    isScoringMethodValue(value.scoringMethod) &&
    isOptionalString(value.materialPublicId) &&
    isQuestionOptionArray(value.questionOptions) &&
    isScoringPointArray(value.scoringPoints) &&
    isFillBlankAnswerArray(value.fillBlankAnswers) &&
    isStringArray(value.knowledgeNodePublicIds) &&
    isStringArray(value.tagPublicIds)
  );
}

function isPaperDraftPayload(
  value: unknown,
): value is AdminAiGenerationFormalPaperDraftPayload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    isProfessionValue(value.profession) &&
    typeof value.level === "number" &&
    isSubjectValue(value.subject) &&
    (value.paperType === null || isPaperTypeValue(value.paperType)) &&
    isOptionalNumber(value.year) &&
    isOptionalString(value.source) &&
    isOptionalNumber(value.durationMinute) &&
    isOptionalString(value.totalScore)
  );
}

function sanitizeQuestionDraftPayload(
  payload: AdminAiGenerationFormalQuestionDraftPayload,
): AdminAiGenerationFormalQuestionDraftPayload {
  return {
    questionType: payload.questionType,
    profession: payload.profession,
    level: payload.level,
    subject: payload.subject,
    stemRichText: payload.stemRichText,
    analysisRichText: payload.analysisRichText,
    standardAnswerRichText: payload.standardAnswerRichText,
    multiChoiceRule: payload.multiChoiceRule,
    scoringMethod: payload.scoringMethod,
    materialPublicId: payload.materialPublicId,
    questionOptions: payload.questionOptions,
    scoringPoints: payload.scoringPoints,
    fillBlankAnswers: payload.fillBlankAnswers,
    knowledgeNodePublicIds: payload.knowledgeNodePublicIds,
    tagPublicIds: payload.tagPublicIds,
  };
}

function sanitizePaperDraftPayload(
  payload: AdminAiGenerationFormalPaperDraftPayload,
): AdminAiGenerationFormalPaperDraftPayload {
  return {
    name: payload.name,
    profession: payload.profession,
    level: payload.level,
    subject: payload.subject,
    paperType: payload.paperType,
    year: payload.year,
    source: payload.source,
    durationMinute: payload.durationMinute,
    totalScore: payload.totalScore,
  };
}

function isEligibleAdoption(
  adoption: AdminAiGenerationFormalAdoptionDto,
  targetType: "question" | "paper",
): boolean {
  return (
    adoption.redactionStatus === "redacted" &&
    adoption.sourceReference.workspace === "content" &&
    adoption.sourceReference.generationKind === targetType &&
    adoption.sourceReference.ownerType === "platform" &&
    adoption.sourceReference.organizationPublicId === null &&
    adoption.targetReference.targetType === targetType &&
    adoption.targetReference.targetDomain === "platform_formal_content" &&
    adoption.targetReference.formalTargetWriteStatus ===
      "blocked_without_follow_up_task" &&
    adoption.targetReference.formalQuestionPublicId === null &&
    adoption.targetReference.formalPaperPublicId === null &&
    adoption.review.reviewDecision === "approved" &&
    adoption.review.reviewStatus === "approved_for_formal_adoption"
  );
}

function createNotEligibleResponse(): ApiResponse<null> {
  return createErrorResponse(
    ADMIN_AI_GENERATION_FORMAL_DRAFT_ADAPTER_ERROR_CODES.notEligible,
    formalAdoptionNotEligibleMessage,
  );
}

function createInvalidInputResponse(): ApiResponse<null> {
  return createErrorResponse(
    ADMIN_AI_GENERATION_FORMAL_DRAFT_ADAPTER_ERROR_CODES.invalidInput,
    "Invalid formal draft adapter input.",
  );
}

function createWriterFailedResponse(): ApiResponse<null> {
  return createErrorResponse(
    ADMIN_AI_GENERATION_FORMAL_DRAFT_ADAPTER_ERROR_CODES.writerFailed,
    formalDraftWriterFailedMessage,
  );
}

function createWriterContext(adoption: AdminAiGenerationFormalAdoptionDto): {
  actorPublicId: string;
} {
  return {
    actorPublicId: adoption.review.reviewerPublicId,
  };
}

export function createAdminAiGenerationFormalDraftAdapterService(
  writers: AdminAiGenerationFormalDraftAdapterWriters,
): AdminAiGenerationFormalDraftAdapterService {
  return {
    async createFormalDraft(input) {
      if (!isEligibleAdoption(input.adoption, input.targetType)) {
        return createNotEligibleResponse();
      }

      if (input.targetType === "question") {
        if (!isQuestionDraftPayload(input.reviewedDraft)) {
          return createInvalidInputResponse();
        }

        const writerResponse = await writers.questionWriter.createQuestion(
          sanitizeQuestionDraftPayload(input.reviewedDraft),
          createWriterContext(input.adoption),
        );
        const questionPublicId = writerResponse.data?.question.publicId ?? null;

        if (writerResponse.code !== 0 || questionPublicId === null) {
          return createWriterFailedResponse();
        }

        return createSuccessResponse({
          adoptionPublicId: input.adoption.adoptionPublicId,
          sourceResultPublicId: input.adoption.sourceReference.resultPublicId,
          targetType: "question",
          formalTargetWriteStatus: "draft_created",
          formalQuestionPublicId: questionPublicId,
          formalPaperPublicId: null,
          redactionStatus: "redacted",
        });
      }

      if (!isPaperDraftPayload(input.reviewedDraft)) {
        return createInvalidInputResponse();
      }

      const writerResponse = await writers.paperWriter.createPaper(
        sanitizePaperDraftPayload(input.reviewedDraft),
        createWriterContext(input.adoption),
      );
      const paperPublicId = writerResponse.data?.paper.publicId ?? null;

      if (writerResponse.code !== 0 || paperPublicId === null) {
        return createWriterFailedResponse();
      }

      return createSuccessResponse({
        adoptionPublicId: input.adoption.adoptionPublicId,
        sourceResultPublicId: input.adoption.sourceReference.resultPublicId,
        targetType: "paper",
        formalTargetWriteStatus: "draft_created",
        formalQuestionPublicId: null,
        formalPaperPublicId: paperPublicId,
        redactionStatus: "redacted",
      });
    },
  };
}
