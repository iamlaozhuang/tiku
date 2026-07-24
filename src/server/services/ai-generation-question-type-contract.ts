import { questionTypeValues, type QuestionType } from "../models/paper";

export const aiGenerationQuestionTypeValues = questionTypeValues;

const reviewRequiredQuestionTypes = new Set<QuestionType>([
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
]);

const legacyQuestionTypeAliases = new Map<string, QuestionType>([
  ["multiple_choice", "multi_choice"],
  ["subjective", "short_answer"],
]);

export function parseCurrentAiGenerationQuestionType(
  value: unknown,
): QuestionType | null {
  if (typeof value !== "string") {
    return null;
  }

  return (
    aiGenerationQuestionTypeValues.find(
      (questionType) => questionType === value,
    ) ?? null
  );
}

export function parseLegacyAiGenerationQuestionType(
  value: unknown,
): QuestionType | null {
  return (
    parseCurrentAiGenerationQuestionType(value) ??
    (typeof value === "string"
      ? (legacyQuestionTypeAliases.get(value) ?? null)
      : null)
  );
}

export function parseCurrentAiGenerationQuestionTypeList(
  value: unknown,
): QuestionType[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalizedValues: QuestionType[] = [];
  const seen = new Set<QuestionType>();

  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      return null;
    }

    const questionType = parseCurrentAiGenerationQuestionType(value[index]);
    if (questionType === null || seen.has(questionType)) {
      return null;
    }

    seen.add(questionType);
    normalizedValues.push(questionType);
  }

  return normalizedValues;
}

export function isAiGenerationReviewRequiredQuestionType(
  questionType: QuestionType,
): boolean {
  return reviewRequiredQuestionTypes.has(questionType);
}
