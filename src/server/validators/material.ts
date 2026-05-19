import {
  materialStatusValues,
  professionValues,
  subjectValues,
} from "../models/paper";
import type { NormalizedPagination } from "./pagination";
import { normalizePagination } from "./pagination";

export type NormalizedCreateMaterialInput = {
  title: string;
  contentRichText: string;
  profession: (typeof professionValues)[number];
  level: number;
  subject: (typeof subjectValues)[number];
};

export type NormalizedUpdateMaterialInput = NormalizedCreateMaterialInput & {
  status: (typeof materialStatusValues)[number];
};

export type NormalizedMaterialListInput = NormalizedPagination & {
  profession: (typeof professionValues)[number] | null;
  level: number | null;
  subject: (typeof subjectValues)[number] | null;
  status: (typeof materialStatusValues)[number] | null;
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

const INVALID_MATERIAL_INPUT_MESSAGE = "Invalid material input.";
const MAX_MATERIAL_CONTENT_LENGTH = 30000;

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

function isMaterialStatus(
  value: unknown,
): value is (typeof materialStatusValues)[number] {
  return (
    typeof value === "string" &&
    materialStatusValues.includes(
      value as (typeof materialStatusValues)[number],
    )
  );
}

export function normalizeCreateMaterialInput(
  input: unknown,
): ValidationResult<NormalizedCreateMaterialInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_MATERIAL_INPUT_MESSAGE,
    };
  }

  const title = normalizeRequiredText(input.title);
  const contentRichText = normalizeRequiredText(input.contentRichText);
  const level = normalizePositiveInteger(input.level);

  if (
    title === null ||
    contentRichText === null ||
    contentRichText.length > MAX_MATERIAL_CONTENT_LENGTH ||
    !isProfession(input.profession) ||
    level === null ||
    !isSubject(input.subject)
  ) {
    return {
      success: false,
      message: INVALID_MATERIAL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      title,
      contentRichText,
      profession: input.profession,
      level,
      subject: input.subject,
    },
  };
}

export function normalizeUpdateMaterialInput(
  input: unknown,
): ValidationResult<NormalizedUpdateMaterialInput> {
  const materialInput = normalizeCreateMaterialInput(input);

  if (
    !materialInput.success ||
    !isRecord(input) ||
    !isMaterialStatus(input.status)
  ) {
    return {
      success: false,
      message: INVALID_MATERIAL_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ...materialInput.value,
      status: input.status,
    },
  };
}

export function normalizeMaterialListInput(
  input: Record<string, unknown> = {},
): NormalizedMaterialListInput {
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
    status: isMaterialStatus(input.status) ? input.status : null,
  };
}
