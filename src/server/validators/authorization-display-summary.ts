import type {
  AuthorizationDisplayContextInput,
  AuthorizationDisplaySummaryInput,
} from "../models/authorization-display-summary";
import type { Profession } from "../models/auth";
import { normalizeAuthorizationAudienceSummaryInput } from "./authorization-audience-summary";
import { normalizeAuthorizationEvidenceReferenceSummaryInput } from "./authorization-evidence-reference-summary";
import { normalizeAuthorizationWindowSummaryInput } from "./authorization-window-summary";

export type AuthorizationDisplaySummaryValidationResult =
  | {
      success: true;
      value: AuthorizationDisplaySummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_DISPLAY_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization display summary input.";

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
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return isProfession(text) ? text : null;
}

function normalizeLevel(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeDisplayContext(
  value: unknown,
): AuthorizationDisplayContextInput | null | undefined {
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

export function normalizeAuthorizationDisplaySummaryInput(
  input: unknown,
): AuthorizationDisplaySummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_DISPLAY_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );

  if (userPublicId === null || authorizationPublicId === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_DISPLAY_SUMMARY_INPUT_MESSAGE,
    };
  }

  const windowSummary = normalizeAuthorizationWindowSummaryInput({
    userPublicId,
    authorizationPublicId,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    currentAt: input.currentAt,
  });
  const audienceSummary = normalizeAuthorizationAudienceSummaryInput({
    userPublicId,
    authorizationSources: input.authorizationSources,
  });
  const evidenceReferenceSummary =
    normalizeAuthorizationEvidenceReferenceSummaryInput({
      userPublicId,
      authorizationPublicId,
      redeemCodePublicId: input.redeemCodePublicId,
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
    });
  const paperContext = normalizeDisplayContext(input.paperContext);
  const mockExamContext = normalizeDisplayContext(input.mockExamContext);

  if (
    !windowSummary.success ||
    !audienceSummary.success ||
    !evidenceReferenceSummary.success ||
    paperContext === undefined ||
    mockExamContext === undefined
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_DISPLAY_SUMMARY_INPUT_MESSAGE,
    };
  }

  const hasSelectedAuthorizationSource =
    audienceSummary.value.authorizationSources.some(
      (authorizationSource) =>
        authorizationSource.publicId === authorizationPublicId,
    );

  if (!hasSelectedAuthorizationSource) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_DISPLAY_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      windowSummary: windowSummary.value,
      audienceSummary: audienceSummary.value,
      evidenceReferenceSummary: evidenceReferenceSummary.value,
      paperContext,
      mockExamContext,
    },
  };
}
