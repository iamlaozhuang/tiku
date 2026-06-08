import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type {
  AuthorizationReasonContextPresentationInput,
  AuthorizationReasonContextPresentationReference,
} from "../models/authorization-reason-context-presentation";

export type AuthorizationReasonContextPresentationValidationResult =
  | {
      success: true;
      value: AuthorizationReasonContextPresentationInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_CONTEXT_PRESENTATION_INPUT_MESSAGE =
  "Invalid authorization reason context presentation input.";

const AUTHORIZATION_CONTEXT_REASON_CODES: readonly AuthorizationContextReasonCode[] =
  ["context_matches_authorization", "context_mismatch"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length > 0 ? text : null;
}

function normalizeContextReasonCode(
  value: unknown,
): AuthorizationContextReasonCode | null {
  const reasonCode = normalizeRequiredText(value);

  if (reasonCode === null) {
    return null;
  }

  return AUTHORIZATION_CONTEXT_REASON_CODES.includes(
    reasonCode as AuthorizationContextReasonCode,
  )
    ? (reasonCode as AuthorizationContextReasonCode)
    : null;
}

function normalizeContextReference(
  value: unknown,
): AuthorizationReasonContextPresentationReference | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const reasonCode = normalizeContextReasonCode(value.reasonCode);

  if (publicId === null || reasonCode === null) {
    return undefined;
  }

  return {
    publicId,
    reasonCode,
  };
}

export function normalizeAuthorizationReasonContextPresentationInput(
  input: unknown,
): AuthorizationReasonContextPresentationValidationResult {
  if (!isRecord(input) || input.reasonStatus !== "reason_summary_only") {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_PRESENTATION_INPUT_MESSAGE,
    };
  }

  const paperContext = normalizeContextReference(input.paperContext);
  const mockExamContext = normalizeContextReference(input.mockExamContext);

  if (paperContext === undefined || mockExamContext === undefined) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_CONTEXT_PRESENTATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      reasonStatus: "reason_summary_only",
      paperContext,
      mockExamContext,
    },
  };
}
