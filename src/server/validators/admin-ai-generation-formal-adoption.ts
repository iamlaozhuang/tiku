import {
  adminAiGenerationFormalAdoptionReviewDecisionValues,
  adminAiGenerationFormalAdoptionTargetTypeValues,
  type AdminAiGenerationFormalAdoptionActor,
  type AdminAiGenerationFormalAdoptionCommandInput,
  type AdminAiGenerationFormalAdoptionReviewDecision,
  type AdminAiGenerationFormalAdoptionTargetType,
} from "../models/admin-ai-generation-formal-adoption";

export type AdminAiGenerationFormalAdoptionValidationResult =
  | {
      success: true;
      value: AdminAiGenerationFormalAdoptionCommandInput;
    }
  | {
      success: false;
      message: string;
    };

export const INVALID_ADMIN_AI_GENERATION_FORMAL_ADOPTION_INPUT_MESSAGE =
  "Invalid admin AI generation formal adoption input.";

export const ADMIN_AI_GENERATION_FORMAL_ADOPTION_CONFIRMATION_REQUIRED_MESSAGE =
  "Admin AI generation formal adoption confirmation is required.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? null : trimmedValue;
}

function normalizeActor(
  value: unknown,
): AdminAiGenerationFormalAdoptionActor | null {
  if (!isRecord(value) || !Array.isArray(value.roles)) {
    return null;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const roles = value.roles.filter(
    (role): role is AdminAiGenerationFormalAdoptionActor["roles"][number] =>
      role === "super_admin" || role === "content_admin",
  );

  if (publicId === null || roles.length === 0) {
    return null;
  }

  return { publicId, roles };
}

function normalizeTargetType(
  value: unknown,
): AdminAiGenerationFormalAdoptionTargetType | null {
  const targetType = normalizeRequiredText(value);

  return targetType !== null &&
    adminAiGenerationFormalAdoptionTargetTypeValues.includes(
      targetType as AdminAiGenerationFormalAdoptionTargetType,
    )
    ? (targetType as AdminAiGenerationFormalAdoptionTargetType)
    : null;
}

function normalizeReviewDecision(
  value: unknown,
): AdminAiGenerationFormalAdoptionReviewDecision | null {
  const reviewDecision = normalizeRequiredText(value);

  return reviewDecision !== null &&
    adminAiGenerationFormalAdoptionReviewDecisionValues.includes(
      reviewDecision as AdminAiGenerationFormalAdoptionReviewDecision,
    )
    ? (reviewDecision as AdminAiGenerationFormalAdoptionReviewDecision)
    : null;
}

function normalizeReviewedAt(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const reviewedAt = new Date(value);

  return Number.isNaN(reviewedAt.getTime()) ? null : reviewedAt;
}

export function isAdminAiGenerationFormalAdoptionConfirmationMissing(
  input: unknown,
): boolean {
  return isRecord(input) && input.reviewerConfirmed !== true;
}

export function normalizeAdminAiGenerationFormalAdoptionInput(
  input: unknown,
): AdminAiGenerationFormalAdoptionValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ADMIN_AI_GENERATION_FORMAL_ADOPTION_INPUT_MESSAGE,
    };
  }

  const adoptionPublicId = normalizeRequiredText(input.adoptionPublicId);
  const actor = normalizeActor(input.actor);
  const resultPublicId = normalizeRequiredText(input.resultPublicId);
  const expectedContentDigest = normalizeRequiredText(
    input.expectedContentDigest,
  );
  const targetType = normalizeTargetType(input.targetType);
  const reviewDecision = normalizeReviewDecision(input.reviewDecision);
  const reviewedAt = normalizeReviewedAt(input.reviewedAt);

  if (
    adoptionPublicId === null ||
    actor === null ||
    resultPublicId === null ||
    expectedContentDigest === null ||
    targetType === null ||
    reviewDecision === null ||
    input.reviewerConfirmed !== true ||
    reviewedAt === null
  ) {
    return {
      success: false,
      message: INVALID_ADMIN_AI_GENERATION_FORMAL_ADOPTION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      adoptionPublicId,
      actor,
      resultPublicId,
      expectedContentDigest,
      targetType,
      reviewDecision,
      reviewerConfirmed: true,
      ...(input.weakEvidenceConfirmed === true
        ? { weakEvidenceConfirmed: true }
        : {}),
      reviewedAt,
    },
  };
}
