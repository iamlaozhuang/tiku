import type {
  AuthorizationContextReasonSummaryInput,
  AuthorizationReasonContextInput,
} from "../models/authorization-context-reason-summary";
import type { Profession } from "../models/auth";

export type AuthorizationContextReasonSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationContextReasonSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_CONTEXT_REASON_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization context reason summary input.";

const professionValues = ["monopoly", "marketing", "logistics"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProfession(value: string): value is Profession {
  return professionValues.some((profession) => profession === value);
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeProfession(value: unknown): Profession | null {
  const text = normalizeRequiredText(value);

  if (text === null) {
    return null;
  }

  return isProfession(text) ? text : null;
}

function normalizeLevel(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeReasonContext(
  value: unknown,
): AuthorizationReasonContextInput | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const profession = normalizeProfession(value.profession);
  const level = normalizeLevel(value.level);

  if (publicId === null || profession === null || level === null) {
    return undefined;
  }

  return {
    publicId,
    profession,
    level,
  };
}

export function normalizeAuthorizationContextReasonSummaryInput(
  input: unknown,
): AuthorizationContextReasonSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_CONTEXT_REASON_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const authorizationProfession = normalizeProfession(
    input.authorizationProfession,
  );
  const authorizationLevel = normalizeLevel(input.authorizationLevel);
  const paperContext = normalizeReasonContext(input.paperContext);
  const mockExamContext = normalizeReasonContext(input.mockExamContext);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    authorizationProfession === null ||
    authorizationLevel === null ||
    paperContext === undefined ||
    mockExamContext === undefined
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_CONTEXT_REASON_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      authorizationProfession,
      authorizationLevel,
      paperContext,
      mockExamContext,
    },
  };
}
