import type { AuthorizationReasonSelectorActionContractInput } from "../models/authorization-reason-selector-action-contract";
import { normalizeAuthorizationReasonSelectorApiContractInput } from "./authorization-reason-selector-api-contract";

export type AuthorizationReasonSelectorActionContractValidationResult =
  | {
      success: true;
      value: AuthorizationReasonSelectorActionContractInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_SELECTOR_ACTION_CONTRACT_INPUT_MESSAGE =
  "Invalid authorization reason selector action contract input.";

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

export function normalizeAuthorizationReasonSelectorActionContractInput(
  input: unknown,
): AuthorizationReasonSelectorActionContractValidationResult {
  if (!isRecord(input) || !isRecord(input.userContext)) {
    return {
      success: false,
      message:
        INVALID_AUTHORIZATION_REASON_SELECTOR_ACTION_CONTRACT_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userContext.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );

  if (userPublicId === null || authorizationPublicId === null) {
    return {
      success: false,
      message:
        INVALID_AUTHORIZATION_REASON_SELECTOR_ACTION_CONTRACT_INPUT_MESSAGE,
    };
  }

  const apiContractInput = normalizeAuthorizationReasonSelectorApiContractInput(
    {
      method: "POST",
      userPublicId,
      authorizationPublicId,
      selectorSummary: input.selectorSummary,
    },
  );

  if (!apiContractInput.success) {
    return {
      success: false,
      message:
        INVALID_AUTHORIZATION_REASON_SELECTOR_ACTION_CONTRACT_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userContext: {
        userPublicId,
      },
      authorizationPublicId,
      selectorSummary: apiContractInput.value.selectorSummary,
    },
  };
}
