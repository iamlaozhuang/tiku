import type { AuthorizationReasonViewSectionSummaryInput } from "../models/authorization-reason-view-section-summary";
import { normalizeAuthorizationReasonContextViewSectionInput } from "./authorization-reason-context-view-section";
import { normalizeAuthorizationReasonEvidenceViewSectionInput } from "./authorization-reason-evidence-view-section";
import { normalizeAuthorizationReasonStatusViewSectionInput } from "./authorization-reason-status-view-section";

export type AuthorizationReasonViewSectionSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationReasonViewSectionSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_VIEW_SECTION_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization reason view section summary input.";

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

export function normalizeAuthorizationReasonViewSectionSummaryInput(
  input: unknown,
): AuthorizationReasonViewSectionSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_VIEW_SECTION_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const statusSectionInput = normalizeAuthorizationReasonStatusViewSectionInput(
    {
      presentationStatus: input.presentationStatus,
      authorizationPublicId: input.authorizationPublicId,
      sourcePresentation: input.sourcePresentation,
      reasonItems: input.reasonItems,
    },
  );
  const contextSectionInput =
    normalizeAuthorizationReasonContextViewSectionInput(
      input.contextPresentation,
    );
  const evidenceSectionInput =
    normalizeAuthorizationReasonEvidenceViewSectionInput(
      input.evidencePresentation,
    );

  if (
    userPublicId === null ||
    !statusSectionInput.success ||
    !contextSectionInput.success ||
    !evidenceSectionInput.success
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_VIEW_SECTION_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ...statusSectionInput.value,
      userPublicId,
      contextPresentation: contextSectionInput.value,
      evidencePresentation: evidenceSectionInput.value,
    },
  };
}
