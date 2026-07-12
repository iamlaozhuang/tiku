import {
  multiChoiceRuleValues,
  professionValues,
  questionStatusValues,
  questionTypeValues,
  scoringMethodValues,
  subjectValues,
} from "../models/paper";
import type { NormalizedPagination } from "./pagination";
import { normalizePagination } from "./pagination";

export type NormalizedQuestionOptionInput = {
  label: string;
  contentRichText: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type NormalizedScoringPointInput = {
  description: string;
  score: string;
  sortOrder: number;
};

export type NormalizedFillBlankAnswerInput = {
  blankKey: string;
  standardAnswers: string[];
  score: string;
  sortOrder: number;
};

export type NormalizedCreateQuestionInput = {
  questionType: (typeof questionTypeValues)[number];
  profession: (typeof professionValues)[number];
  level: number;
  subject: (typeof subjectValues)[number];
  stemRichText: string;
  analysisRichText: string;
  standardAnswerRichText: string;
  multiChoiceRule: (typeof multiChoiceRuleValues)[number];
  scoringMethod: (typeof scoringMethodValues)[number];
  materialPublicId: string | null;
  questionOptions: NormalizedQuestionOptionInput[];
  scoringPoints: NormalizedScoringPointInput[];
  fillBlankAnswers: NormalizedFillBlankAnswerInput[];
  knowledgeNodePublicIds: string[];
  tagPublicIds: string[];
};

export type NormalizedUpdateQuestionInput = NormalizedCreateQuestionInput & {
  status: (typeof questionStatusValues)[number];
};

export type NormalizedQuestionListInput = NormalizedPagination & {
  profession: (typeof professionValues)[number] | null;
  level: number | null;
  subject: (typeof subjectValues)[number] | null;
  questionType: (typeof questionTypeValues)[number] | null;
  status: (typeof questionStatusValues)[number] | null;
  keyword: string | null;
  knowledgeNodePublicId: string | null;
  materialPublicId?: string | null;
  tagPublicId: string | null;
};

type ValidationResult<TValue> =
  | {
      success: true;
      value: TValue;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_QUESTION_INPUT_MESSAGE = "Invalid question input.";
const MAX_QUESTION_TEXT_LENGTH = 10000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 || text.length > MAX_QUESTION_TEXT_LENGTH
    ? null
    : text;
}

function normalizeOptionalPublicId(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const publicId = value.trim();

  return publicId.length === 0 ? undefined : publicId;
}

function normalizePublicIdList(value: unknown): string[] | null {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const publicIds = value.map((item) => {
    if (typeof item !== "string") {
      return null;
    }

    const publicId = item.trim();

    return publicId.length === 0 ? null : publicId;
  });

  if (publicIds.some((publicId) => publicId === null)) {
    return null;
  }

  return Array.from(new Set(publicIds as string[]));
}

function normalizeRequiredTextList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const texts = value.map((item) => normalizeRequiredText(item));

  if (texts.some((text) => text === null)) {
    return null;
  }

  return Array.from(new Set(texts as string[]));
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function normalizeQueryInteger(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function normalizeQueryPublicId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const publicId = value.trim();

  return publicId.length === 0 ? null : publicId;
}

function normalizeScore(value: unknown): string | null {
  const score = typeof value === "number" ? value : Number(value);

  if (
    !Number.isFinite(score) ||
    score < 0 ||
    score * 2 !== Math.round(score * 2)
  ) {
    return null;
  }

  return score.toFixed(1);
}

function isProfession(
  value: unknown,
): value is (typeof professionValues)[number] {
  return (
    typeof value === "string" &&
    professionValues.includes(value as (typeof professionValues)[number])
  );
}

function isSubject(value: unknown): value is (typeof subjectValues)[number] {
  return (
    typeof value === "string" &&
    subjectValues.includes(value as (typeof subjectValues)[number])
  );
}

function isQuestionType(
  value: unknown,
): value is (typeof questionTypeValues)[number] {
  return (
    typeof value === "string" &&
    questionTypeValues.includes(value as (typeof questionTypeValues)[number])
  );
}

function isSubjectiveTextQuestionType(
  questionType: (typeof questionTypeValues)[number],
): boolean {
  return (
    questionType === "short_answer" ||
    questionType === "case_analysis" ||
    questionType === "calculation"
  );
}

function isQuestionStatus(
  value: unknown,
): value is (typeof questionStatusValues)[number] {
  return (
    typeof value === "string" &&
    questionStatusValues.includes(
      value as (typeof questionStatusValues)[number],
    )
  );
}

function isMultiChoiceRule(
  value: unknown,
): value is (typeof multiChoiceRuleValues)[number] {
  return (
    typeof value === "string" &&
    multiChoiceRuleValues.includes(
      value as (typeof multiChoiceRuleValues)[number],
    )
  );
}

function isScoringMethod(
  value: unknown,
): value is (typeof scoringMethodValues)[number] {
  return (
    typeof value === "string" &&
    scoringMethodValues.includes(value as (typeof scoringMethodValues)[number])
  );
}

function normalizeQuestionOptions(
  value: unknown,
): NormalizedQuestionOptionInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const questionOptions = value.map((questionOption) => {
    if (!isRecord(questionOption)) {
      return null;
    }

    const label = normalizeRequiredText(questionOption.label);
    const contentRichText = normalizeRequiredText(
      questionOption.contentRichText,
    );
    const sortOrder = normalizePositiveInteger(questionOption.sortOrder);

    if (
      label === null ||
      contentRichText === null ||
      typeof questionOption.isCorrect !== "boolean" ||
      sortOrder === null
    ) {
      return null;
    }

    return {
      label,
      contentRichText,
      isCorrect: questionOption.isCorrect,
      sortOrder,
    };
  });

  return questionOptions.some((questionOption) => questionOption === null)
    ? null
    : (questionOptions as NormalizedQuestionOptionInput[]);
}

function normalizeScoringPoints(
  value: unknown,
): NormalizedScoringPointInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const scoringPoints = value.map((scoringPoint) => {
    if (!isRecord(scoringPoint)) {
      return null;
    }

    const description = normalizeRequiredText(scoringPoint.description);
    const score = normalizeScore(scoringPoint.score);
    const sortOrder = normalizePositiveInteger(scoringPoint.sortOrder);

    if (description === null || score === null || sortOrder === null) {
      return null;
    }

    return {
      description,
      score,
      sortOrder,
    };
  });

  return scoringPoints.some((scoringPoint) => scoringPoint === null)
    ? null
    : (scoringPoints as NormalizedScoringPointInput[]);
}

function normalizeFillBlankAnswers(
  value: unknown,
): NormalizedFillBlankAnswerInput[] | null {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const fillBlankAnswers = value.map((fillBlankAnswer) => {
    if (!isRecord(fillBlankAnswer)) {
      return null;
    }

    const blankKey = normalizeRequiredText(fillBlankAnswer.blankKey);
    const standardAnswers = normalizeRequiredTextList(
      fillBlankAnswer.standardAnswers,
    );
    const score = normalizeScore(fillBlankAnswer.score);
    const sortOrder = normalizePositiveInteger(fillBlankAnswer.sortOrder);

    if (
      blankKey === null ||
      standardAnswers === null ||
      score === null ||
      sortOrder === null
    ) {
      return null;
    }

    return {
      blankKey,
      standardAnswers,
      score,
      sortOrder,
    };
  });

  return fillBlankAnswers.some((fillBlankAnswer) => fillBlankAnswer === null)
    ? null
    : (fillBlankAnswers as NormalizedFillBlankAnswerInput[]);
}

export function normalizeCreateQuestionInput(
  input: unknown,
): ValidationResult<NormalizedCreateQuestionInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_QUESTION_INPUT_MESSAGE,
    };
  }

  const level = normalizePositiveInteger(input.level);
  const stemRichText = normalizeRequiredText(input.stemRichText);
  const analysisRichText = normalizeRequiredText(input.analysisRichText);
  const standardAnswerRichText = normalizeRequiredText(
    input.standardAnswerRichText,
  );
  const materialPublicId = normalizeOptionalPublicId(input.materialPublicId);
  const questionOptions = normalizeQuestionOptions(input.questionOptions);
  const scoringPoints = normalizeScoringPoints(input.scoringPoints);
  const fillBlankAnswers = normalizeFillBlankAnswers(input.fillBlankAnswers);
  const knowledgeNodePublicIds = normalizePublicIdList(
    input.knowledgeNodePublicIds,
  );
  const tagPublicIds = normalizePublicIdList(input.tagPublicIds);

  if (
    !isQuestionType(input.questionType) ||
    !isProfession(input.profession) ||
    level === null ||
    !isSubject(input.subject) ||
    stemRichText === null ||
    analysisRichText === null ||
    standardAnswerRichText === null ||
    !isMultiChoiceRule(input.multiChoiceRule) ||
    !isScoringMethod(input.scoringMethod) ||
    materialPublicId === undefined ||
    questionOptions === null ||
    scoringPoints === null ||
    fillBlankAnswers === null ||
    knowledgeNodePublicIds === null ||
    tagPublicIds === null
  ) {
    return {
      success: false,
      message: INVALID_QUESTION_INPUT_MESSAGE,
    };
  }

  if (
    isSubjectiveTextQuestionType(input.questionType) &&
    questionOptions.length > 0
  ) {
    return {
      success: false,
      message: INVALID_QUESTION_INPUT_MESSAGE,
    };
  }

  if (
    fillBlankAnswers.length > 0 &&
    (input.questionType !== "fill_blank" ||
      input.scoringMethod !== "auto_match")
  ) {
    return {
      success: false,
      message: INVALID_QUESTION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      questionType: input.questionType,
      profession: input.profession,
      level,
      subject: input.subject,
      stemRichText,
      analysisRichText,
      standardAnswerRichText,
      multiChoiceRule: input.multiChoiceRule,
      scoringMethod: input.scoringMethod,
      materialPublicId,
      questionOptions,
      scoringPoints,
      fillBlankAnswers,
      knowledgeNodePublicIds,
      tagPublicIds,
    },
  };
}

export function normalizeUpdateQuestionInput(
  input: unknown,
): ValidationResult<NormalizedUpdateQuestionInput> {
  const questionInput = normalizeCreateQuestionInput(input);

  if (
    !questionInput.success ||
    !isRecord(input) ||
    !isQuestionStatus(input.status)
  ) {
    return {
      success: false,
      message: INVALID_QUESTION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ...questionInput.value,
      status: input.status,
    },
  };
}

export function normalizeQuestionListInput(
  input: Record<string, unknown> = {},
): NormalizedQuestionListInput {
  const pagination = normalizePagination({
    page: normalizeQueryInteger(input.page),
    pageSize: normalizeQueryInteger(input.pageSize),
    sortBy: typeof input.sortBy === "string" ? input.sortBy : undefined,
    sortOrder:
      typeof input.sortOrder === "string" ? input.sortOrder : undefined,
  });
  const keyword =
    typeof input.keyword === "string" && input.keyword.trim().length > 0
      ? input.keyword.trim()
      : null;

  return {
    ...pagination,
    profession: isProfession(input.profession) ? input.profession : null,
    level: normalizeQueryInteger(input.level) ?? null,
    subject: isSubject(input.subject) ? input.subject : null,
    questionType: isQuestionType(input.questionType)
      ? input.questionType
      : null,
    status: isQuestionStatus(input.status) ? input.status : null,
    keyword,
    knowledgeNodePublicId: normalizeQueryPublicId(input.knowledgeNodePublicId),
    materialPublicId: normalizeQueryPublicId(input.materialPublicId),
    tagPublicId: normalizeQueryPublicId(input.tagPublicId),
  };
}
