import {
  isPersonalAiGenerationFormalAdoptionAdminRole,
  personalAiGenerationFormalAdoptionReviewDecisionValues,
  personalAiGenerationFormalAdoptionTargetTypeValues,
  type PersonalAiGenerationFormalAdoptionActor,
  type PersonalAiGenerationFormalAdoptionReviewDecision,
  type PersonalAiGenerationFormalAdoptionReviewInput,
  type PersonalAiGenerationFormalAdoptionTargetType,
} from "../models/personal-ai-generation-formal-adoption";

export type PersonalAiGenerationFormalAdoptionValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationFormalAdoptionReviewInput;
    }
  | {
      success: false;
      message: string;
    };

export const INVALID_PERSONAL_AI_GENERATION_FORMAL_ADOPTION_INPUT_MESSAGE =
  "Invalid formal adoption review input.";

export const FORMAL_ADOPTION_REVIEW_CONFIRMATION_REQUIRED_MESSAGE =
  "Formal adoption review confirmation is required.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedText = value.trim();

  return trimmedText.length === 0 ? null : trimmedText;
}

function normalizeActor(
  value: unknown,
): PersonalAiGenerationFormalAdoptionActor | null {
  if (!isRecord(value) || !Array.isArray(value.roles)) {
    return null;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const roles = value.roles.filter(
    (role): role is PersonalAiGenerationFormalAdoptionActor["roles"][number] =>
      typeof role === "string" &&
      isPersonalAiGenerationFormalAdoptionAdminRole(role),
  );

  if (publicId === null || roles.length === 0) {
    return null;
  }

  return { publicId, roles };
}

function normalizeTargetType(
  value: unknown,
): PersonalAiGenerationFormalAdoptionTargetType | null {
  const targetType = normalizeRequiredText(value);

  return targetType !== null &&
    personalAiGenerationFormalAdoptionTargetTypeValues.includes(
      targetType as PersonalAiGenerationFormalAdoptionTargetType,
    )
    ? (targetType as PersonalAiGenerationFormalAdoptionTargetType)
    : null;
}

function normalizeReviewDecision(
  value: unknown,
): PersonalAiGenerationFormalAdoptionReviewDecision | null {
  const reviewDecision = normalizeRequiredText(value);

  return reviewDecision !== null &&
    personalAiGenerationFormalAdoptionReviewDecisionValues.includes(
      reviewDecision as PersonalAiGenerationFormalAdoptionReviewDecision,
    )
    ? (reviewDecision as PersonalAiGenerationFormalAdoptionReviewDecision)
    : null;
}

function normalizeReviewedAt(value: unknown): Date | null {
  if (value === undefined || value === null) {
    return new Date();
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const reviewedAt = new Date(value);

  return Number.isNaN(reviewedAt.getTime()) ? null : reviewedAt;
}

export function isFormalAdoptionReviewConfirmationMissing(
  input: unknown,
): boolean {
  return isRecord(input) && input.reviewerConfirmed !== true;
}

export function normalizePersonalAiGenerationFormalAdoptionReviewInput(
  input: unknown,
): PersonalAiGenerationFormalAdoptionValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_FORMAL_ADOPTION_INPUT_MESSAGE,
    };
  }

  const actor = normalizeActor(input.actor);
  const resultPublicId = normalizeRequiredText(input.resultPublicId);
  const targetType = normalizeTargetType(input.targetType);
  const reviewDecision = normalizeReviewDecision(input.reviewDecision);
  const reviewReasonCategory = normalizeRequiredText(
    input.reviewReasonCategory,
  );
  const reviewedAt = normalizeReviewedAt(input.reviewedAt);

  if (
    actor === null ||
    resultPublicId === null ||
    targetType === null ||
    reviewDecision === null ||
    reviewReasonCategory === null ||
    input.reviewerConfirmed !== true ||
    reviewedAt === null
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_FORMAL_ADOPTION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      actor,
      resultPublicId,
      targetType,
      reviewDecision,
      reviewReasonCategory,
      reviewerConfirmed: true,
      reviewedAt,
    },
  };
}
