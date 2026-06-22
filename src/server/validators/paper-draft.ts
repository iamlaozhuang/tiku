import {
  paperStatusValues,
  paperTypeValues,
  professionValues,
  subjectValues,
} from "../models/paper";
import type { NormalizedPagination } from "./pagination";
import { normalizePagination } from "./pagination";

export type NormalizedPaperSectionInput = {
  title: string;
  description: string | null;
  sortOrder: number;
};

export type NormalizedQuestionGroupInput = {
  title: string;
  materialPublicId: string;
  sortOrder: number;
};

export type NormalizedPaperScoringPointInput = {
  description: string;
  score: string;
  sortOrder: number;
};

export type NormalizedCreatePaperInput = {
  name: string;
  profession: (typeof professionValues)[number];
  level: number;
  subject: (typeof subjectValues)[number];
  paperType: (typeof paperTypeValues)[number] | null;
  year: number | null;
  source: string | null;
  durationMinute: number | null;
  totalScore: string | null;
};

export type NormalizedUpdatePaperInput = NormalizedCreatePaperInput;

export type NormalizedAddPaperQuestionInput = {
  questionPublicId: string;
  score: string;
  sortOrder: number;
  paperSection: NormalizedPaperSectionInput;
  questionGroup: NormalizedQuestionGroupInput | null;
};

export type NormalizedUpdatePaperQuestionInput = {
  score: string;
  sortOrder: number;
  scoringPoints: NormalizedPaperScoringPointInput[];
};

export type NormalizedPaperListInput = NormalizedPagination & {
  profession: (typeof professionValues)[number] | null;
  level: number | null;
  subject: (typeof subjectValues)[number] | null;
  paperStatus: (typeof paperStatusValues)[number] | null;
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

export type PaperQuestionCountValidationResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export const PAPER_QUESTION_COUNT_LIMIT = 100;

const INVALID_PAPER_INPUT_MESSAGE = "Invalid paper input.";
const DRAFT_PAPER_QUESTION_COUNT_LIMIT_MESSAGE =
  "Draft paper cannot contain more than 100 questions.";
const PUBLISHED_PAPER_QUESTION_COUNT_LIMIT_MESSAGE =
  "Published paper must contain 1 to 100 questions.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

export function validateDraftPaperQuestionCount(
  questionCount: number,
): PaperQuestionCountValidationResult {
  if (
    !Number.isInteger(questionCount) ||
    questionCount < 0 ||
    questionCount > PAPER_QUESTION_COUNT_LIMIT
  ) {
    return {
      success: false,
      message: DRAFT_PAPER_QUESTION_COUNT_LIMIT_MESSAGE,
    };
  }

  return { success: true };
}

export function validatePublishedPaperQuestionCount(
  questionCount: number,
): PaperQuestionCountValidationResult {
  if (
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > PAPER_QUESTION_COUNT_LIMIT
  ) {
    return {
      success: false,
      message: PUBLISHED_PAPER_QUESTION_COUNT_LIMIT_MESSAGE,
    };
  }

  return { success: true };
}

function normalizeOptionalText(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function normalizeOptionalPositiveInteger(
  value: unknown,
): number | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  const positiveInteger = normalizePositiveInteger(value);

  return positiveInteger === null ? undefined : positiveInteger;
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

function normalizeOptionalScore(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeScore(value) ?? undefined;
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

function isPaperType(
  value: unknown,
): value is (typeof paperTypeValues)[number] {
  return (
    typeof value === "string" &&
    paperTypeValues.includes(value as (typeof paperTypeValues)[number])
  );
}

function isPaperStatus(
  value: unknown,
): value is (typeof paperStatusValues)[number] {
  return (
    typeof value === "string" &&
    paperStatusValues.includes(value as (typeof paperStatusValues)[number])
  );
}

function normalizePaperType(
  value: unknown,
): (typeof paperTypeValues)[number] | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return isPaperType(value) ? value : undefined;
}

function normalizeDurationMinute(value: unknown): number | null | undefined {
  const durationMinute = normalizeOptionalPositiveInteger(value);

  if (durationMinute === undefined || durationMinute === null) {
    return durationMinute;
  }

  return durationMinute >= 10 && durationMinute <= 300
    ? durationMinute
    : undefined;
}

function normalizePaperMetadata(
  input: unknown,
): ValidationResult<NormalizedCreatePaperInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  const name = normalizeRequiredText(input.name);
  const level = normalizePositiveInteger(input.level);
  const paperType = normalizePaperType(input.paperType);
  const year = normalizeOptionalPositiveInteger(input.year);
  const source = normalizeOptionalText(input.source);
  const durationMinute = normalizeDurationMinute(input.durationMinute);
  const totalScore = normalizeOptionalScore(input.totalScore);

  if (
    name === null ||
    !isProfession(input.profession) ||
    level === null ||
    !isSubject(input.subject) ||
    paperType === undefined ||
    year === undefined ||
    source === undefined ||
    durationMinute === undefined ||
    totalScore === undefined
  ) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      name,
      profession: input.profession,
      level,
      subject: input.subject,
      paperType,
      year,
      source,
      durationMinute,
      totalScore,
    },
  };
}

function normalizePaperSectionInput(
  value: unknown,
): NormalizedPaperSectionInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = normalizeRequiredText(value.title);
  const description = normalizeOptionalText(value.description);
  const sortOrder = normalizePositiveInteger(value.sortOrder);

  if (title === null || description === undefined || sortOrder === null) {
    return null;
  }

  return {
    title,
    description,
    sortOrder,
  };
}

function normalizeQuestionGroupInput(
  value: unknown,
): NormalizedQuestionGroupInput | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const title = normalizeRequiredText(value.title);
  const materialPublicId = normalizeRequiredText(value.materialPublicId);
  const sortOrder = normalizePositiveInteger(value.sortOrder);

  if (title === null || materialPublicId === null || sortOrder === null) {
    return undefined;
  }

  return {
    title,
    materialPublicId,
    sortOrder,
  };
}

function normalizeScoringPoints(
  value: unknown,
): NormalizedPaperScoringPointInput[] | null {
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
    : (scoringPoints as NormalizedPaperScoringPointInput[]);
}

export function normalizeCreatePaperInput(
  input: unknown,
): ValidationResult<NormalizedCreatePaperInput> {
  return normalizePaperMetadata(input);
}

export function normalizeUpdatePaperInput(
  input: unknown,
): ValidationResult<NormalizedUpdatePaperInput> {
  return normalizePaperMetadata(input);
}

export function normalizeAddPaperQuestionInput(
  input: unknown,
): ValidationResult<NormalizedAddPaperQuestionInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  const questionPublicId = normalizeRequiredText(input.questionPublicId);
  const score = normalizeScore(input.score);
  const sortOrder = normalizePositiveInteger(input.sortOrder);
  const paperSection = normalizePaperSectionInput(input.paperSection);
  const questionGroup = normalizeQuestionGroupInput(input.questionGroup);

  if (
    questionPublicId === null ||
    score === null ||
    sortOrder === null ||
    paperSection === null ||
    questionGroup === undefined
  ) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      questionPublicId,
      score,
      sortOrder,
      paperSection,
      questionGroup,
    },
  };
}

export function normalizeUpdatePaperQuestionInput(
  input: unknown,
): ValidationResult<NormalizedUpdatePaperQuestionInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  const score = normalizeScore(input.score);
  const sortOrder = normalizePositiveInteger(input.sortOrder);
  const scoringPoints = normalizeScoringPoints(input.scoringPoints);

  if (score === null || sortOrder === null || scoringPoints === null) {
    return {
      success: false,
      message: INVALID_PAPER_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      score,
      sortOrder,
      scoringPoints,
    },
  };
}

export function normalizePaperListInput(
  input: Record<string, unknown> = {},
): NormalizedPaperListInput {
  const pagination = normalizePagination({
    page: normalizeQueryInteger(input.page),
    pageSize: normalizeQueryInteger(input.pageSize),
    sortBy: typeof input.sortBy === "string" ? input.sortBy : undefined,
    sortOrder:
      typeof input.sortOrder === "string" ? input.sortOrder : undefined,
  });

  return {
    ...pagination,
    profession: isProfession(input.profession) ? input.profession : null,
    level: normalizeQueryInteger(input.level) ?? null,
    subject: isSubject(input.subject) ? input.subject : null,
    paperStatus: isPaperStatus(input.paperStatus) ? input.paperStatus : null,
  };
}
