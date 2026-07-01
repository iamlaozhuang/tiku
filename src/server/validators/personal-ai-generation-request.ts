import { aiFuncTypeValues } from "../models/ai-rag";
import type {
  AiGenerationTaskRequestAuthorizationSource,
  AiGenerationTaskRequestOwnerType,
} from "../models/ai-generation-task-request";
import type {
  PersonalAiGenerationFuncType,
  PersonalAiGenerationRequestInput,
} from "../models/personal-ai-generation-request";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedProfession,
  AiGenerationRouteIntegratedSubject,
} from "../contracts/route-integrated-provider-execution-contract";

export type PersonalAiGenerationRequestValidationResult =
  | {
      success: true;
      value: PersonalAiGenerationRequestInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE =
  "Invalid personal AI generation request input.";
type PersonalAiGenerationAuthorizationSource = Extract<
  AiGenerationTaskRequestAuthorizationSource,
  "personal_auth" | "org_auth"
>;

const authorizationSourceValues = [
  "personal_auth",
  "org_auth",
] as const satisfies readonly PersonalAiGenerationAuthorizationSource[];
const ownerTypeValues = ["personal", "organization", "platform"] as const;
const professionValues = ["monopoly", "marketing", "logistics"] as const;
const subjectValues = ["theory", "skill"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizePersonalAiGenerationFuncType(
  value: unknown,
): PersonalAiGenerationFuncType | null {
  return typeof value === "string" &&
    value !== "scoring" &&
    aiFuncTypeValues.includes(value as PersonalAiGenerationFuncType)
    ? (value as PersonalAiGenerationFuncType)
    : null;
}

function normalizeAuthorizationSource(
  value: unknown,
): PersonalAiGenerationAuthorizationSource | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    authorizationSourceValues.includes(
      text as PersonalAiGenerationAuthorizationSource,
    )
    ? (text as PersonalAiGenerationAuthorizationSource)
    : null;
}

function normalizeOwnerType(
  value: unknown,
): AiGenerationTaskRequestOwnerType | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    ownerTypeValues.includes(text as AiGenerationTaskRequestOwnerType)
    ? (text as AiGenerationTaskRequestOwnerType)
    : null;
}

function normalizeProfession(
  value: unknown,
): AiGenerationRouteIntegratedProfession | null {
  return typeof value === "string" &&
    professionValues.includes(value as AiGenerationRouteIntegratedProfession)
    ? (value as AiGenerationRouteIntegratedProfession)
    : null;
}

function normalizeSubject(
  value: unknown,
): AiGenerationRouteIntegratedSubject | null {
  return typeof value === "string" &&
    subjectValues.includes(value as AiGenerationRouteIntegratedSubject)
    ? (value as AiGenerationRouteIntegratedSubject)
    : null;
}

function normalizeLevel(
  value: unknown,
): AiGenerationRouteIntegratedGenerationParameters["level"] | null {
  const parsedLevel =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  return parsedLevel === 1 ||
    parsedLevel === 2 ||
    parsedLevel === 3 ||
    parsedLevel === 4 ||
    parsedLevel === 5
    ? parsedLevel
    : null;
}

function normalizePositiveCount(value: unknown): number | null {
  const parsedCount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : null;

  return parsedCount !== null &&
    Number.isInteger(parsedCount) &&
    parsedCount > 0 &&
    parsedCount <= 100
    ? parsedCount
    : null;
}

function normalizeGenerationParameters(
  value: unknown,
): AiGenerationRouteIntegratedGenerationParameters | null {
  if (!isRecord(value)) {
    return null;
  }

  const profession = normalizeProfession(value.profession);
  const level = normalizeLevel(value.level);
  const subject = normalizeSubject(value.subject);
  const questionCount = normalizePositiveCount(value.questionCount);

  if (
    profession === null ||
    level === null ||
    subject === null ||
    questionCount === null
  ) {
    return null;
  }

  return {
    profession,
    level,
    subject,
    knowledgeNode: normalizeOptionalText(value.knowledgeNode),
    questionType: normalizeOptionalText(value.questionType),
    questionCount,
    difficulty: normalizeOptionalText(value.difficulty),
    learningObjective: normalizeOptionalText(value.learningObjective),
  };
}

function resolveAuthorizationSource(
  value: unknown,
): PersonalAiGenerationAuthorizationSource | null {
  if (value === null || value === undefined) {
    return "personal_auth";
  }

  return normalizeAuthorizationSource(value);
}

function resolveOwnerType(
  value: unknown,
): AiGenerationTaskRequestOwnerType | null {
  if (value === null || value === undefined) {
    return "personal";
  }

  return normalizeOwnerType(value);
}

function matchesPersonalAiGenerationAuthorizationBoundary(
  input: Pick<
    PersonalAiGenerationRequestInput,
    | "userPublicId"
    | "authorizationSource"
    | "ownerType"
    | "ownerPublicId"
    | "organizationPublicId"
    | "quotaOwnerType"
    | "quotaOwnerPublicId"
  >,
): boolean {
  if (input.authorizationSource === "personal_auth") {
    return (
      input.ownerType === "personal" &&
      input.ownerPublicId === input.userPublicId &&
      input.organizationPublicId === null &&
      input.quotaOwnerType === "personal" &&
      input.quotaOwnerPublicId === input.userPublicId
    );
  }

  return (
    input.ownerType === "organization" &&
    input.organizationPublicId !== null &&
    input.ownerPublicId === input.organizationPublicId &&
    input.quotaOwnerType === "organization" &&
    input.quotaOwnerPublicId === input.organizationPublicId
  );
}

export function normalizePersonalAiGenerationRequestInput(
  input: unknown,
): PersonalAiGenerationRequestValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationSource = resolveAuthorizationSource(
    input.authorizationSource,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const ownerType = resolveOwnerType(input.ownerType);
  const ownerPublicId =
    normalizeOptionalText(input.ownerPublicId) ?? userPublicId;
  const organizationPublicId = normalizeOptionalText(
    input.organizationPublicId,
  );
  const quotaOwnerType = resolveOwnerType(input.quotaOwnerType);
  const quotaOwnerPublicId =
    normalizeOptionalText(input.quotaOwnerPublicId) ?? userPublicId;
  const aiFuncType = normalizePersonalAiGenerationFuncType(input.aiFuncType);
  const questionPublicId = normalizeRequiredText(input.questionPublicId);
  const paperPublicId = normalizeOptionalText(input.paperPublicId);
  const mockExamPublicId = normalizeOptionalText(input.mockExamPublicId);
  const generationParameters = normalizeGenerationParameters(
    input.generationParameters,
  );

  if (
    userPublicId === null ||
    authorizationSource === null ||
    authorizationPublicId === null ||
    ownerType === null ||
    ownerPublicId === null ||
    quotaOwnerType === null ||
    quotaOwnerPublicId === null ||
    aiFuncType === null ||
    questionPublicId === null
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE,
    };
  }

  if (paperPublicId !== null && mockExamPublicId !== null) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE,
    };
  }

  const normalizedAuthorizationBoundary = {
    userPublicId,
    authorizationSource,
    ownerType,
    ownerPublicId,
    organizationPublicId,
    quotaOwnerType,
    quotaOwnerPublicId,
  };

  if (
    !matchesPersonalAiGenerationAuthorizationBoundary(
      normalizedAuthorizationBoundary,
    )
  ) {
    return {
      success: false,
      message: INVALID_PERSONAL_AI_GENERATION_REQUEST_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationSource,
      authorizationPublicId,
      ownerType,
      ownerPublicId,
      organizationPublicId,
      quotaOwnerType,
      quotaOwnerPublicId,
      aiFuncType,
      questionPublicId,
      answerRecordPublicId: normalizeOptionalText(input.answerRecordPublicId),
      paperPublicId,
      mockExamPublicId,
      redeemCodePublicId: normalizeOptionalText(input.redeemCodePublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
      generationParameters,
    },
  };
}
