import type { AdminAiGenerationReviewDraftCommand } from "../contracts/admin-ai-generation-review-draft-contract";
import type {
  AdminAiGenerationFormalPaperDraftPayload,
  AdminAiGenerationFormalQuestionDraftPayload,
  AdminAiGenerationFormalQuestionReviewCandidatePayload,
  AdminAiGenerationFormalReviewedDraftPayload,
} from "../contracts/admin-ai-generation-formal-draft-adapter-contract";
import {
  multiChoiceRuleValues,
  paperTypeValues,
  professionValues,
  questionDifficultyValues,
  questionTypeValues,
  scoringMethodValues,
  subjectValues,
} from "../models/paper";
import { normalizeCreateQuestionInput } from "./question";

const invalidMessage = "Invalid admin AI generation review draft input.";
const digestPattern = /^sha256:[0-9a-f]{64}$/u;
const maximumDraftBytes = 262_144;
const maximumRichTextLength = 100_000;
const maximumShortTextLength = 2_000;
const commandKeys = [
  "expectedDraftDigest",
  "expectedRevision",
  "reviewedDraft",
  "targetType",
] as const;
const questionKeys = [
  "analysisRichText",
  "difficulty",
  "fillBlankAnswers",
  "knowledgeNodePublicIds",
  "level",
  "materialPublicId",
  "multiChoiceRule",
  "profession",
  "questionOptions",
  "questionType",
  "scoringMethod",
  "scoringPoints",
  "standardAnswerRichText",
  "stemRichText",
  "subject",
  "tagPublicIds",
] as const;
const paperRequiredKeys = [
  "durationMinute",
  "generationMethod",
  "level",
  "month",
  "name",
  "paperType",
  "profession",
  "questionBasis",
  "sourceDescription",
  "sourceOrganization",
  "sourceRegion",
  "subject",
  "totalScore",
  "year",
] as const;

type ValidationResult =
  | { success: true; value: AdminAiGenerationReviewDraftCommand }
  | { success: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isBoundedString(
  value: unknown,
  maximumLength: number,
  allowEmpty = false,
): value is string {
  return (
    typeof value === "string" &&
    value.length <= maximumLength &&
    (allowEmpty || value.trim().length > 0)
  );
}

function isNullableBoundedString(
  value: unknown,
  maximumLength: number,
): value is string | null {
  return value === null || isBoundedString(value, maximumLength, true);
}

function isStringArray(value: unknown, maximumItems = 200): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= maximumItems &&
    value.every((item) => isBoundedString(item, maximumShortTextLength)) &&
    new Set(value).size === value.length
  );
}

function isQuestionOptions(value: unknown): boolean {
  if (!Array.isArray(value) || value.length > 50) {
    return false;
  }

  return value.every(
    (item) =>
      isRecord(item) &&
      hasExactKeys(item, [
        "contentRichText",
        "isCorrect",
        "label",
        "sortOrder",
      ]) &&
      isBoundedString(item.label, 32) &&
      isBoundedString(item.contentRichText, maximumRichTextLength) &&
      typeof item.isCorrect === "boolean" &&
      Number.isSafeInteger(item.sortOrder) &&
      Number(item.sortOrder) >= 0,
  );
}

function isScoringPoints(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every(
      (item) =>
        isRecord(item) &&
        hasExactKeys(item, ["description", "score", "sortOrder"]) &&
        isBoundedString(item.description, maximumShortTextLength) &&
        isBoundedString(item.score, 64) &&
        Number.isSafeInteger(item.sortOrder) &&
        Number(item.sortOrder) >= 0,
    )
  );
}

function isFillBlankAnswers(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every(
      (item) =>
        isRecord(item) &&
        hasExactKeys(item, [
          "blankKey",
          "score",
          "sortOrder",
          "standardAnswers",
        ]) &&
        isBoundedString(item.blankKey, 128) &&
        isStringArray(item.standardAnswers, 20) &&
        isBoundedString(item.score, 64) &&
        Number.isSafeInteger(item.sortOrder) &&
        Number(item.sortOrder) >= 0,
    )
  );
}

function isQuestionDraft(
  value: unknown,
): value is AdminAiGenerationFormalQuestionDraftPayload {
  if (!isRecord(value) || !hasExactKeys(value, questionKeys)) {
    return false;
  }

  return (
    questionTypeValues.includes(value.questionType as never) &&
    professionValues.includes(value.profession as never) &&
    Number.isSafeInteger(value.level) &&
    Number(value.level) > 0 &&
    subjectValues.includes(value.subject as never) &&
    questionDifficultyValues.includes(value.difficulty as never) &&
    isBoundedString(value.stemRichText, maximumRichTextLength) &&
    isBoundedString(value.analysisRichText, maximumRichTextLength) &&
    isBoundedString(value.standardAnswerRichText, maximumRichTextLength) &&
    multiChoiceRuleValues.includes(value.multiChoiceRule as never) &&
    scoringMethodValues.includes(value.scoringMethod as never) &&
    isNullableBoundedString(value.materialPublicId, maximumShortTextLength) &&
    isQuestionOptions(value.questionOptions) &&
    isScoringPoints(value.scoringPoints) &&
    isFillBlankAnswers(value.fillBlankAnswers) &&
    isStringArray(value.knowledgeNodePublicIds) &&
    isStringArray(value.tagPublicIds)
  );
}

function isPaperQuestionGroup(value: unknown): boolean {
  return (
    value === null ||
    (isRecord(value) &&
      hasExactKeys(value, ["materialPublicId", "sortOrder", "title"]) &&
      isBoundedString(value.title, maximumShortTextLength) &&
      isBoundedString(value.materialPublicId, maximumShortTextLength) &&
      Number.isSafeInteger(value.sortOrder) &&
      Number(value.sortOrder) >= 0)
  );
}

function isPaperQuestions(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length <= 200 &&
    value.every(
      (item) =>
        isRecord(item) &&
        hasExactKeys(item, [
          "companionQuestionDraft",
          "questionGroup",
          "questionPublicId",
          "score",
          "sortOrder",
        ]) &&
        isBoundedString(item.questionPublicId, maximumShortTextLength) &&
        item.companionQuestionDraft === null &&
        isBoundedString(item.score, 64) &&
        Number.isSafeInteger(item.sortOrder) &&
        Number(item.sortOrder) >= 0 &&
        isPaperQuestionGroup(item.questionGroup),
    )
  );
}

function isPaperSections(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every(
      (item) =>
        isRecord(item) &&
        hasExactKeys(item, [
          "description",
          "paperQuestions",
          "sortOrder",
          "title",
        ]) &&
        isBoundedString(item.title, maximumShortTextLength) &&
        isNullableBoundedString(item.description, maximumShortTextLength) &&
        Number.isSafeInteger(item.sortOrder) &&
        Number(item.sortOrder) >= 0 &&
        isPaperQuestions(item.paperQuestions),
    )
  );
}

function isPaperDraft(
  value: unknown,
): value is AdminAiGenerationFormalPaperDraftPayload {
  if (!isRecord(value)) {
    return false;
  }

  const permittedKeys = [...paperRequiredKeys, "paperSections"];
  if (
    !paperRequiredKeys.every((key) => Object.hasOwn(value, key)) ||
    !hasOnlyKeys(value, permittedKeys)
  ) {
    return false;
  }

  return (
    isBoundedString(value.name, maximumShortTextLength) &&
    professionValues.includes(value.profession as never) &&
    Number.isSafeInteger(value.level) &&
    Number(value.level) > 0 &&
    subjectValues.includes(value.subject as never) &&
    (value.paperType === null ||
      paperTypeValues.includes(value.paperType as never)) &&
    (value.year === null || Number.isSafeInteger(value.year)) &&
    (value.month === null ||
      (Number.isSafeInteger(value.month) &&
        Number(value.month) >= 1 &&
        Number(value.month) <= 12)) &&
    isNullableBoundedString(value.sourceDescription, maximumShortTextLength) &&
    isNullableBoundedString(value.sourceRegion, maximumShortTextLength) &&
    isNullableBoundedString(value.sourceOrganization, maximumShortTextLength) &&
    isNullableBoundedString(value.questionBasis, maximumShortTextLength) &&
    value.generationMethod === "ai" &&
    (value.durationMinute === null ||
      (Number.isSafeInteger(value.durationMinute) &&
        Number(value.durationMinute) > 0)) &&
    isNullableBoundedString(value.totalScore, 64) &&
    (value.paperSections === undefined || isPaperSections(value.paperSections))
  );
}

function isBoundedDraft(value: unknown): boolean {
  try {
    return (
      Buffer.byteLength(JSON.stringify(value), "utf8") <= maximumDraftBytes
    );
  } catch {
    return false;
  }
}

function normalizeGeneratedKnowledgeCandidate(
  reviewedDraft: unknown,
): AdminAiGenerationFormalQuestionReviewCandidatePayload | null {
  if (!isRecord(reviewedDraft)) {
    return null;
  }
  const candidateKeys = [...questionKeys, "knowledgeNodeConfirmation"];
  if (!hasExactKeys(reviewedDraft, candidateKeys)) {
    return null;
  }
  const { knowledgeNodeConfirmation, ...baseDraft } = reviewedDraft;
  if (!isQuestionDraft(baseDraft)) {
    return null;
  }
  const normalizedBase = normalizeCreateQuestionInput(baseDraft);
  if (
    !normalizedBase.success ||
    normalizedBase.value.difficulty == null ||
    normalizedBase.value.knowledgeNodePublicIds.length !== 0 ||
    !isRecord(knowledgeNodeConfirmation) ||
    !hasExactKeys(knowledgeNodeConfirmation, [
      "generatedLabels",
      "generationMode",
      "requestPublicId",
      "resultPublicId",
      "schemaVersion",
      "sourceContentDigest",
      "status",
      "taskPublicId",
    ]) ||
    knowledgeNodeConfirmation.schemaVersion !== 1 ||
    knowledgeNodeConfirmation.status !== "unresolved" ||
    (knowledgeNodeConfirmation.generationMode !== "balanced" &&
      knowledgeNodeConfirmation.generationMode !== "comprehensive") ||
    !isBoundedString(knowledgeNodeConfirmation.requestPublicId, 200) ||
    !isBoundedString(knowledgeNodeConfirmation.resultPublicId, 200) ||
    !isBoundedString(knowledgeNodeConfirmation.taskPublicId, 200) ||
    typeof knowledgeNodeConfirmation.sourceContentDigest !== "string" ||
    !digestPattern.test(knowledgeNodeConfirmation.sourceContentDigest) ||
    !isStringArray(knowledgeNodeConfirmation.generatedLabels, 50) ||
    knowledgeNodeConfirmation.generatedLabels.length === 0
  ) {
    return null;
  }

  return {
    ...normalizedBase.value,
    difficulty: normalizedBase.value.difficulty,
    knowledgeNodePublicIds: [],
    knowledgeNodeConfirmation: {
      schemaVersion: 1,
      status: "unresolved",
      generationMode: knowledgeNodeConfirmation.generationMode,
      requestPublicId: knowledgeNodeConfirmation.requestPublicId,
      resultPublicId: knowledgeNodeConfirmation.resultPublicId,
      taskPublicId: knowledgeNodeConfirmation.taskPublicId,
      sourceContentDigest: knowledgeNodeConfirmation.sourceContentDigest,
      generatedLabels: [...knowledgeNodeConfirmation.generatedLabels],
    },
  };
}

export function normalizeAdminAiGenerationReviewedDraft(
  targetType: "question" | "paper",
  reviewedDraft: unknown,
  options: { allowUnresolvedKnowledgeCandidate?: boolean } = {},
): AdminAiGenerationFormalReviewedDraftPayload | null {
  if (!isBoundedDraft(reviewedDraft)) {
    return null;
  }

  if (targetType === "question") {
    if (options.allowUnresolvedKnowledgeCandidate === true) {
      const candidate = normalizeGeneratedKnowledgeCandidate(reviewedDraft);
      if (candidate !== null) {
        return candidate;
      }
    }
    if (!isQuestionDraft(reviewedDraft)) {
      return null;
    }
    const normalized = normalizeCreateQuestionInput(reviewedDraft);
    if (!normalized.success || normalized.value.difficulty == null) {
      return null;
    }
    return {
      ...normalized.value,
      difficulty: normalized.value.difficulty,
    };
  }

  if (!isPaperDraft(reviewedDraft)) {
    return null;
  }
  return reviewedDraft;
}

export function normalizeAdminAiGenerationReviewDraftCommand(
  input: unknown,
): ValidationResult {
  if (!isRecord(input) || !hasExactKeys(input, commandKeys)) {
    return { success: false, message: invalidMessage };
  }

  const expectedRevision = input.expectedRevision;
  const expectedDraftDigest = input.expectedDraftDigest;
  const predecessorIsValid =
    (expectedRevision === null && expectedDraftDigest === null) ||
    (Number.isSafeInteger(expectedRevision) &&
      Number(expectedRevision) >= 0 &&
      typeof expectedDraftDigest === "string" &&
      digestPattern.test(expectedDraftDigest));

  if (
    !predecessorIsValid ||
    (input.targetType !== "question" && input.targetType !== "paper") ||
    !isBoundedDraft(input.reviewedDraft)
  ) {
    return { success: false, message: invalidMessage };
  }

  const reviewedDraft = normalizeAdminAiGenerationReviewedDraft(
    input.targetType,
    input.reviewedDraft,
  );

  if (reviewedDraft === null) {
    return { success: false, message: invalidMessage };
  }

  return {
    success: true,
    value: {
      expectedRevision: expectedRevision as number | null,
      expectedDraftDigest: expectedDraftDigest as string | null,
      targetType: input.targetType,
      reviewedDraft,
    },
  };
}
