import type { AuthorizationReasonViewModelSummaryInput } from "../models/authorization-reason-view-model-summary";
import { normalizeAuthorizationReasonContextViewModelInput } from "./authorization-reason-context-view-model";
import { normalizeAuthorizationReasonEvidenceViewModelInput } from "./authorization-reason-evidence-view-model";
import { normalizeAuthorizationReasonStatusViewModelInput } from "./authorization-reason-status-view-model";

export type AuthorizationReasonViewModelSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationReasonViewModelSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_VIEW_MODEL_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization reason view model summary input.";

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

export function normalizeAuthorizationReasonViewModelSummaryInput(
  input: unknown,
): AuthorizationReasonViewModelSummaryValidationResult {
  if (!isRecord(input) || input.summaryStatus !== "local_view_section_only") {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_VIEW_MODEL_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const statusSection = normalizeAuthorizationReasonStatusViewModelInput(
    input.statusSection,
  );
  const contextSection = normalizeAuthorizationReasonContextViewModelInput(
    input.contextSection,
  );
  const evidenceSection = normalizeAuthorizationReasonEvidenceViewModelInput(
    input.evidenceSection,
  );

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    !statusSection.success ||
    !contextSection.success ||
    !evidenceSection.success ||
    statusSection.value.selectedAuthorizationPublicId !== authorizationPublicId
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_VIEW_MODEL_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      summaryStatus: "local_view_section_only",
      statusSection: statusSection.value,
      contextSection: contextSection.value,
      evidenceSection: evidenceSection.value,
    },
  };
}
