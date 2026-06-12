import type { AuthorizationContextSourceType } from "../models/authorization-context";
import type {
  AuthorizationMockExamAccessContextInput,
  AuthorizationPaperAccessContextInput,
  AuthorizationPaperMockExamAccessContextInput,
} from "../models/authorization-paper-mock-exam-access-context";
import {
  paperTypeValues,
  professionValues,
  subjectValues,
  type PaperType,
  type Profession,
  type Subject,
} from "../models/paper";
import type { EffectiveAuthorizationEdition } from "../contracts/effective-authorization-contract";

export type AuthorizationPaperMockExamAccessContextValidationResult =
  | {
      success: true;
      value: AuthorizationPaperMockExamAccessContextInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_PAPER_MOCK_EXAM_ACCESS_CONTEXT_INPUT_MESSAGE =
  "Invalid authorization paper mock_exam access context input.";

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

function normalizeAuthorizationType(
  value: unknown,
): AuthorizationContextSourceType | null {
  return value === "personal_auth" || value === "org_auth" ? value : null;
}

function normalizeEffectiveEdition(
  value: unknown,
): EffectiveAuthorizationEdition | null {
  if (value === null || value === undefined) {
    return "standard";
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue === "standard" || normalizedValue === "advanced"
    ? normalizedValue
    : null;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizePaperContext(
  value: unknown,
): AuthorizationPaperAccessContextInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const paperPublicId = normalizeRequiredText(value.paperPublicId);
  const profession = normalizeProfession(value.profession);
  const level = normalizePositiveInteger(value.level);
  const subject = normalizeSubject(value.subject);
  const paperType = normalizePaperType(value.paperType);

  if (
    paperPublicId === null ||
    profession === null ||
    level === null ||
    subject === null ||
    paperType === null
  ) {
    return null;
  }

  return {
    paperPublicId,
    profession,
    level,
    subject,
    paperType,
  };
}

function normalizeNullablePaperContext(
  value: unknown,
): AuthorizationPaperAccessContextInput | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizePaperContext(value) ?? undefined;
}

function normalizeMockExamContext(
  value: unknown,
): AuthorizationMockExamAccessContextInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const paperContext = normalizePaperContext(value);
  const mockExamPublicId = normalizeRequiredText(value.mockExamPublicId);

  if (paperContext === null || mockExamPublicId === null) {
    return null;
  }

  return {
    ...paperContext,
    mockExamPublicId,
  };
}

function normalizeNullableMockExamContext(
  value: unknown,
): AuthorizationMockExamAccessContextInput | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeMockExamContext(value) ?? undefined;
}

export function normalizeAuthorizationPaperMockExamAccessContextInput(
  input: unknown,
): AuthorizationPaperMockExamAccessContextValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message:
        INVALID_AUTHORIZATION_PAPER_MOCK_EXAM_ACCESS_CONTEXT_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const authorizationSource = normalizeAuthorizationType(
    input.authorizationSource ?? input.authorizationType,
  );
  const effectiveEdition = normalizeEffectiveEdition(input.effectiveEdition);
  const organizationPublicId = normalizeOptionalText(
    input.organizationPublicId,
  );
  const authorizationProfession = normalizeProfession(
    input.authorizationProfession,
  );
  const authorizationLevel = normalizePositiveInteger(input.authorizationLevel);
  const paperContext = normalizeNullablePaperContext(input.paperContext);
  const mockExamContext = normalizeNullableMockExamContext(
    input.mockExamContext,
  );

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    authorizationSource === null ||
    effectiveEdition === null ||
    authorizationProfession === null ||
    authorizationLevel === null ||
    paperContext === undefined ||
    mockExamContext === undefined
  ) {
    return {
      success: false,
      message:
        INVALID_AUTHORIZATION_PAPER_MOCK_EXAM_ACCESS_CONTEXT_INPUT_MESSAGE,
    };
  }

  if (
    (authorizationSource === "personal_auth" &&
      organizationPublicId !== null) ||
    (authorizationSource === "org_auth" && organizationPublicId === null)
  ) {
    return {
      success: false,
      message:
        INVALID_AUTHORIZATION_PAPER_MOCK_EXAM_ACCESS_CONTEXT_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      authorizationSource,
      effectiveEdition,
      organizationPublicId,
      authorizationProfession,
      authorizationLevel,
      paperContext,
      mockExamContext,
    },
  };
}
