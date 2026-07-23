import {
  adminAiGenerationFormalAdoptionReviewDecisionValues,
  adminAiGenerationFormalAdoptionTargetTypeValues,
  type AdminAiGenerationFormalAdoptionActor,
  type AdminAiGenerationFormalAdoptionReviewDecision,
  type AdminAiGenerationFormalAdoptionTargetType,
  type AdminAiGenerationKnowledgeNodeResolutionCommand,
} from "../models/admin-ai-generation-formal-adoption";
import type { CreateAdminAiGenerationFormalAdoptionInput } from "../contracts/admin-ai-generation-formal-adoption-contract";

export type AdminAiGenerationFormalAdoptionValidationResult =
  | {
      success: true;
      value: CreateAdminAiGenerationFormalAdoptionInput;
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

function normalizeExactRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().normalize("NFC");
  return normalizedValue.length > 0 &&
    normalizedValue === value &&
    !/[\u0000-\u001f\u007f-\u009f]/u.test(normalizedValue)
    ? normalizedValue
    : null;
}

function normalizeKnowledgeNodeResolutions(
  value: unknown,
): AdminAiGenerationKnowledgeNodeResolutionCommand[] | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    return null;
  }

  const resolutions: AdminAiGenerationKnowledgeNodeResolutionCommand[] = [];
  const labelCollisionKeys = new Set<string>();
  const knowledgeNodePublicIds = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const label = normalizeExactRequiredText(item.label);
    const knowledgeNodePublicId = normalizeExactRequiredText(
      item.knowledgeNodePublicId,
    );

    if (
      label === null ||
      label.length > 128 ||
      knowledgeNodePublicId === null ||
      knowledgeNodePublicId.length > 200
    ) {
      return null;
    }

    const labelCollisionKey = label.normalize("NFKC").toLocaleLowerCase("und");

    if (
      labelCollisionKeys.has(labelCollisionKey) ||
      knowledgeNodePublicIds.has(knowledgeNodePublicId)
    ) {
      return null;
    }

    labelCollisionKeys.add(labelCollisionKey);
    knowledgeNodePublicIds.add(knowledgeNodePublicId);
    resolutions.push({ label, knowledgeNodePublicId });
  }

  return resolutions;
}

const forbiddenClientContentKeys = [
  "analysis",
  "candidate",
  "difficulty",
  "knowledgeNodeConfirmation",
  "questionDraft",
  "questionStem",
  "standardAnswer",
] as const;

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
  const expectedReviewDraftRevision = input.expectedReviewDraftRevision;
  const expectedReviewDraftDigest = normalizeRequiredText(
    input.expectedReviewDraftDigest,
  );
  const targetType = normalizeTargetType(input.targetType);
  const reviewDecision = normalizeReviewDecision(input.reviewDecision);
  const reviewedAt = normalizeReviewedAt(input.reviewedAt);
  const knowledgeNodeResolutions = normalizeKnowledgeNodeResolutions(
    input.knowledgeNodeResolutions,
  );

  if (
    adoptionPublicId === null ||
    actor === null ||
    resultPublicId === null ||
    expectedContentDigest === null ||
    typeof expectedReviewDraftRevision !== "number" ||
    !Number.isSafeInteger(expectedReviewDraftRevision) ||
    expectedReviewDraftRevision < 0 ||
    expectedReviewDraftDigest === null ||
    !/^sha256:[0-9a-f]{64}$/u.test(expectedReviewDraftDigest) ||
    targetType === null ||
    reviewDecision === null ||
    input.reviewerConfirmed !== true ||
    reviewedAt === null ||
    knowledgeNodeResolutions === null ||
    (reviewDecision === "rejected" && knowledgeNodeResolutions !== undefined) ||
    forbiddenClientContentKeys.some((key) => Object.hasOwn(input, key))
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
      expectedReviewDraftRevision,
      expectedReviewDraftDigest,
      targetType,
      reviewDecision,
      reviewerConfirmed: true,
      ...(input.weakEvidenceConfirmed === true
        ? { weakEvidenceConfirmed: true }
        : {}),
      ...(knowledgeNodeResolutions === undefined
        ? {}
        : { knowledgeNodeResolutions }),
      reviewedAt,
    },
  };
}
