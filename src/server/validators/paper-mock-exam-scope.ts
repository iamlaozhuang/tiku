import {
  paperTypeValues,
  professionValues,
  subjectValues,
  type PaperType,
  type Profession,
  type Subject,
} from "../models/paper";
import type { PaperMockExamScopeInput } from "../models/paper-mock-exam-scope";

export type PaperMockExamScopeValidationResult =
  | {
      success: true;
      value: PaperMockExamScopeInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PAPER_MOCK_EXAM_SCOPE_INPUT_MESSAGE =
  "Invalid paper mock_exam scope input.";

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

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizePositiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeProfession(value: unknown): Profession | null {
  return typeof value === "string" &&
    professionValues.includes(value as Profession)
    ? (value as Profession)
    : null;
}

function normalizeSubject(value: unknown): Subject | null {
  return typeof value === "string" && subjectValues.includes(value as Subject)
    ? (value as Subject)
    : null;
}

function normalizePaperType(value: unknown): PaperType | null {
  return typeof value === "string" &&
    paperTypeValues.includes(value as PaperType)
    ? (value as PaperType)
    : null;
}

export function normalizePaperMockExamScopeInput(
  input: unknown,
): PaperMockExamScopeValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PAPER_MOCK_EXAM_SCOPE_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const paperPublicId = normalizeRequiredText(input.paperPublicId);
  const profession = normalizeProfession(input.profession);
  const level = normalizePositiveInteger(input.level);
  const subject = normalizeSubject(input.subject);
  const paperType = normalizePaperType(input.paperType);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    paperPublicId === null ||
    profession === null ||
    level === null ||
    subject === null ||
    paperType === null
  ) {
    return {
      success: false,
      message: INVALID_PAPER_MOCK_EXAM_SCOPE_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      paperPublicId,
      mockExamPublicId: normalizeOptionalText(input.mockExamPublicId),
      profession,
      level,
      subject,
      paperType,
    },
  };
}
