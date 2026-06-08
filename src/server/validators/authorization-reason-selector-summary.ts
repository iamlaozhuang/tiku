import type { AuthorizationReasonSelectorSummaryInput } from "../models/authorization-reason-selector-summary";
import { normalizeAuthorizationReasonContextSelectorInput } from "./authorization-reason-context-selector";
import { normalizeAuthorizationReasonEvidenceSelectorInput } from "./authorization-reason-evidence-selector";
import { normalizeAuthorizationReasonStatusSelectorInput } from "./authorization-reason-status-selector";

export type AuthorizationReasonSelectorSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationReasonSelectorSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_SELECTOR_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization reason selector summary input.";

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

export function normalizeAuthorizationReasonSelectorSummaryInput(
  input: unknown,
): AuthorizationReasonSelectorSummaryValidationResult {
  if (
    !isRecord(input) ||
    input.summaryStatus !== "local_view_model_only" ||
    input.sourceSummaryStatus !== "local_view_section_only"
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_SELECTOR_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const statusModel = normalizeAuthorizationReasonStatusSelectorInput(
    input.statusModel,
  );
  const contextModel = normalizeAuthorizationReasonContextSelectorInput(
    input.contextModel,
  );
  const evidenceModel = normalizeAuthorizationReasonEvidenceSelectorInput(
    input.evidenceModel,
  );

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    !statusModel.success ||
    !contextModel.success ||
    !evidenceModel.success ||
    statusModel.value.selectedAuthorizationPublicId !== authorizationPublicId
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_SELECTOR_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      summaryStatus: "local_view_model_only",
      sourceSummaryStatus: "local_view_section_only",
      statusModel: statusModel.value,
      contextModel: contextModel.value,
      evidenceModel: evidenceModel.value,
    },
  };
}
