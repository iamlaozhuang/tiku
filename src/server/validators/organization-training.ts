import { evidenceStatusValues } from "../models/ai-rag";
import { professionValues } from "../models/auth";
import type { EmployeeOrganizationTrainingAnswerItemDto } from "../contracts/organization-training-contract";
import {
  type OrganizationTrainingAuditLogReferenceInput,
  type OrganizationTrainingAuditLogTargetResourceType,
  type OrganizationTrainingCapabilityContext,
  type OrganizationTrainingCopyToNewDraftInput,
  type OrganizationTrainingDraftQuestionInput,
  type OrganizationTrainingDraftSaveInput,
  type OrganizationTrainingPublishInput,
  type OrganizationTrainingPublishQuestionInput,
  type OrganizationTrainingQuestionType,
  type OrganizationTrainingSourceContextType,
  type OrganizationTrainingTakedownInput,
  organizationTrainingAuditLogTargetResourceTypeValues,
  organizationTrainingQuestionTypeValues,
  organizationTrainingSourceContextTypeValues,
} from "../models/organization-training";
import { subjectValues } from "../models/paper";
import {
  normalizeStudentAnswerItemList,
  normalizeStudentAnswerSelections,
  normalizeStudentAnswerText,
} from "./student-answer";

export const invalidOrganizationTrainingPublishInputMessage =
  "Invalid organization training publish input.";

export const invalidOrganizationTrainingDraftSaveInputMessage =
  "Invalid organization training draft save input.";

export const invalidOrganizationTrainingTakedownInputMessage =
  "Invalid organization training takedown input.";

export const invalidOrganizationTrainingManualDraftInputMessage =
  "Invalid organization training manual draft input.";

export const invalidOrganizationTrainingAiResultCopyInputMessage =
  "Invalid organization training AI result copy input.";

export const invalidOrganizationTrainingCopyToNewDraftInputMessage =
  "Invalid organization training copy-to-new-draft input.";

export const invalidOrganizationTrainingSourceContextInputMessage =
  "Invalid organization training source context input.";

export const invalidOrganizationTrainingAuditLogReferenceInputMessage =
  "Invalid organization training audit_log reference input.";

export const invalidOrganizationTrainingEmployeeAnswerDraftInputMessage =
  "Invalid organization training employee answer draft input.";

export const invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage =
  "Invalid organization training employee answer submit input.";

export type OrganizationTrainingEmployeeAnswerDraftRouteInput = {
  trainingVersionPublicId: string;
  expectedRevision: number;
  operationId: string;
  answerItems: EmployeeOrganizationTrainingAnswerItemDto[];
};

export type OrganizationTrainingEmployeeAnswerSubmitRouteInput =
  OrganizationTrainingEmployeeAnswerDraftRouteInput;

export type OrganizationTrainingManualDraftRouteInput = {
  organizationPublicId: string;
  authorizationPublicId: string;
  sourceTaskPublicId: string | null;
  profession: (typeof professionValues)[number];
  level: number;
  subject: (typeof subjectValues)[number];
  title: string;
  description: string | null;
  capabilityContext: OrganizationTrainingCapabilityContext;
};

export type OrganizationTrainingAiResultCopyRouteInput = {
  organizationPublicId: string;
  sourceTaskPublicId: string;
  sourceResultPublicId: string;
  weakEvidenceConfirmed: boolean;
};

export type OrganizationTrainingAiResultCopyValidationResult =
  | {
      success: true;
      value: OrganizationTrainingAiResultCopyRouteInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingAiResultCopyInputMessage;
    };

export type OrganizationTrainingCopyToNewDraftRouteInput =
  OrganizationTrainingCopyToNewDraftInput & {
    authorizationPublicId: string;
  };

export type OrganizationTrainingSourceContextRouteItemInput = {
  sourceType: OrganizationTrainingSourceContextType;
  sourcePublicId: string;
  title: string;
  profession: (typeof professionValues)[number];
  level: number;
  subject: (typeof subjectValues)[number];
  questionCount: number;
  totalScore: number;
  sourceStatus: string;
};

export type OrganizationTrainingSourceContextRouteInput = {
  draftPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  profession: (typeof professionValues)[number];
  level: number;
  capabilityContext: OrganizationTrainingCapabilityContext;
  sourceContexts: OrganizationTrainingSourceContextRouteItemInput[];
};

export type OrganizationTrainingPublishValidationResult =
  | {
      success: true;
      value: OrganizationTrainingPublishInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingPublishInputMessage;
    };

export type OrganizationTrainingDraftSaveValidationResult =
  | {
      success: true;
      value: OrganizationTrainingDraftSaveInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingDraftSaveInputMessage;
    };

export type OrganizationTrainingManualDraftValidationResult =
  | {
      success: true;
      value: OrganizationTrainingManualDraftRouteInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingManualDraftInputMessage;
    };

export type OrganizationTrainingTakedownValidationResult =
  | {
      success: true;
      value: OrganizationTrainingTakedownInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingTakedownInputMessage;
    };

export type OrganizationTrainingCopyToNewDraftRouteValidationResult =
  | {
      success: true;
      value: OrganizationTrainingCopyToNewDraftRouteInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingCopyToNewDraftInputMessage;
    };

export type OrganizationTrainingSourceContextValidationResult =
  | {
      success: true;
      value: OrganizationTrainingSourceContextRouteInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingSourceContextInputMessage;
    };

export type OrganizationTrainingCopyToNewDraftValidationResult =
  | {
      success: true;
      value: OrganizationTrainingCopyToNewDraftInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingCopyToNewDraftInputMessage;
    };

export type OrganizationTrainingAuditLogReferenceValidationResult =
  | {
      success: true;
      value: OrganizationTrainingAuditLogReferenceInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingAuditLogReferenceInputMessage;
    };

export type OrganizationTrainingEmployeeAnswerDraftValidationResult =
  | {
      success: true;
      value: OrganizationTrainingEmployeeAnswerDraftRouteInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingEmployeeAnswerDraftInputMessage;
    };

export type OrganizationTrainingEmployeeAnswerSubmitValidationResult =
  | {
      success: true;
      value: OrganizationTrainingEmployeeAnswerSubmitRouteInput;
    }
  | {
      success: false;
      message: typeof invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage;
    };

type JsonRecord = Record<string, unknown>;

const forbiddenEmployeeAnswerPayloadKeys = [
  "answerBody",
  "answers",
  "questionAnswers",
  "rawAnswer",
  "providerPayload",
  "rawPrompt",
  "standardAnswer",
  "analysis",
  "answeredQuestionCount",
  "score",
  "totalScore",
  "scoreSummary",
  "questionResults",
] as const;

const forbiddenPublishPayloadKeys = [
  "organizationPublicId",
  "authorizationPublicId",
  "profession",
  "level",
  "subject",
  "title",
  "description",
  "questions",
  "capabilityContext",
  "questionCount",
  "totalScore",
  "questionTypeSummary",
  "evidenceStatus",
  "citationCount",
] as const;

const forbiddenDraftQuestionPayloadKeys = [
  "evidenceStatus",
  "citationCount",
] as const;

const forbiddenSourceMetadataPayloadKeys = [
  "answerBody",
  "answers",
  "questions",
  "questionBody",
  "fullQuestionBody",
  "fullPaperContent",
  "standardAnswer",
  "analysis",
  "rawAnswer",
  "rawPrompt",
  "providerPayload",
] as const;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizePositiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeNonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeOptionalIsoTimestamp(
  value: unknown,
): string | null | undefined {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  const timestampValue = new Date(trimmedValue);

  return Number.isNaN(timestampValue.getTime())
    ? undefined
    : timestampValue.toISOString();
}

function hasForbiddenEmployeeAnswerPayload(value: JsonRecord): boolean {
  return forbiddenEmployeeAnswerPayloadKeys.some((payloadKey) =>
    Object.hasOwn(value, payloadKey),
  );
}

function hasForbiddenSourceMetadataPayload(value: JsonRecord): boolean {
  return forbiddenSourceMetadataPayloadKeys.some((payloadKey) =>
    Object.hasOwn(value, payloadKey),
  );
}

function hasForbiddenPublishPayload(value: JsonRecord): boolean {
  return forbiddenPublishPayloadKeys.some((payloadKey) =>
    Object.hasOwn(value, payloadKey),
  );
}

function hasForbiddenDraftQuestionPayload(value: JsonRecord): boolean {
  return forbiddenDraftQuestionPayloadKeys.some((payloadKey) =>
    Object.hasOwn(value, payloadKey),
  );
}

function normalizePublicIdList(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalizedValues = value
    .map((item) => normalizeRequiredText(item))
    .filter((item): item is string => item !== null);
  const uniqueValues = Array.from(new Set(normalizedValues));

  return uniqueValues.length > 0 ? uniqueValues : null;
}

function normalizeQuestionOption(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const label = normalizeRequiredText(value.label);
  const content = normalizeRequiredText(value.content);

  if (publicId === null || label === null || content === null) {
    return null;
  }

  return {
    publicId,
    label,
    content,
  };
}

function normalizeQuestionOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalizedOptions = value.map(normalizeQuestionOption);

  if (normalizedOptions.some((option) => option === null)) {
    return null;
  }

  return normalizedOptions as NonNullable<
    OrganizationTrainingPublishQuestionInput["options"]
  >;
}

function normalizeAnswerItem(
  value: unknown,
): EmployeeOrganizationTrainingAnswerItemDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const questionPublicId = normalizeRequiredText(value.questionPublicId);
  const selectedOptionPublicIdsResult = normalizeStudentAnswerSelections(
    value.selectedOptionPublicIds,
  );
  const textAnswerResult = normalizeStudentAnswerText(value.textAnswer);

  if (
    questionPublicId === null ||
    !selectedOptionPublicIdsResult.success ||
    !textAnswerResult.success
  ) {
    return null;
  }

  return {
    questionPublicId,
    selectedOptionPublicIds: selectedOptionPublicIdsResult.value,
    textAnswer: textAnswerResult.value,
  };
}

function normalizeAnswerItems(
  value: unknown,
): EmployeeOrganizationTrainingAnswerItemDto[] | null {
  if (value === undefined || value === null) {
    return [];
  }

  const answerItems = normalizeStudentAnswerItemList(value);
  if (answerItems === null) {
    return null;
  }

  const normalizedAnswerItems = answerItems.map(normalizeAnswerItem);

  if (normalizedAnswerItems.some((answerItem) => answerItem === null)) {
    return null;
  }

  return normalizedAnswerItems as EmployeeOrganizationTrainingAnswerItemDto[];
}

function isProfession(
  value: unknown,
): value is (typeof professionValues)[number] {
  return (
    typeof value === "string" &&
    professionValues.includes(value as (typeof professionValues)[number])
  );
}

function isSubject(value: unknown): value is (typeof subjectValues)[number] {
  return (
    typeof value === "string" &&
    subjectValues.includes(value as (typeof subjectValues)[number])
  );
}

function isEvidenceStatus(
  value: unknown,
): value is (typeof evidenceStatusValues)[number] {
  return (
    typeof value === "string" &&
    evidenceStatusValues.includes(
      value as (typeof evidenceStatusValues)[number],
    )
  );
}

function isOrganizationTrainingQuestionType(
  value: unknown,
): value is OrganizationTrainingQuestionType {
  return (
    typeof value === "string" &&
    organizationTrainingQuestionTypeValues.includes(
      value as OrganizationTrainingQuestionType,
    )
  );
}

function isOrganizationTrainingSourceContextType(
  value: unknown,
): value is OrganizationTrainingSourceContextType {
  return (
    typeof value === "string" &&
    organizationTrainingSourceContextTypeValues.includes(
      value as OrganizationTrainingSourceContextType,
    )
  );
}

function isFirstReleaseOrganizationTrainingSourceContextType(
  value: unknown,
): value is OrganizationTrainingSourceContextType {
  return (
    isOrganizationTrainingSourceContextType(value) && value !== "mock_exam"
  );
}

function isOrganizationTrainingAuditLogTargetResourceType(
  value: unknown,
): value is OrganizationTrainingAuditLogTargetResourceType {
  return (
    typeof value === "string" &&
    organizationTrainingAuditLogTargetResourceTypeValues.includes(
      value as OrganizationTrainingAuditLogTargetResourceType,
    )
  );
}

function hasRequiredOrganizationTrainingAuditTargetReference(
  targetResourceType: OrganizationTrainingAuditLogTargetResourceType,
  referenceInput: Pick<
    OrganizationTrainingAuditLogReferenceInput,
    | "trainingDraftPublicId"
    | "trainingVersionPublicId"
    | "employeeAnswerPublicId"
  >,
): boolean {
  if (targetResourceType === "organization_training_draft") {
    return referenceInput.trainingDraftPublicId !== null;
  }

  if (targetResourceType === "organization_training_version") {
    return referenceInput.trainingVersionPublicId !== null;
  }

  if (targetResourceType === "organization_training_answer") {
    return referenceInput.employeeAnswerPublicId !== null;
  }

  if (targetResourceType === "organization_training_source_context") {
    return referenceInput.trainingDraftPublicId !== null;
  }

  return true;
}

function normalizeCapabilityContext(
  value: unknown,
): OrganizationTrainingCapabilityContext | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.effectiveEdition !== "advanced" ||
    value.authorizationSource !== "org_auth" ||
    value.canCreateOrganizationTraining !== true
  ) {
    return null;
  }

  return {
    effectiveEdition: "advanced",
    authorizationSource: "org_auth",
    canCreateOrganizationTraining: true,
  };
}

function normalizePublishQuestion(
  value: unknown,
  index: number,
): OrganizationTrainingPublishQuestionInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const sequenceNumber = normalizePositiveInteger(value.sequenceNumber);
  const materialTitle = normalizeOptionalText(value.materialTitle);
  const materialContent = normalizeOptionalText(value.materialContent);
  const stem = normalizeRequiredText(value.stem);
  const options = normalizeQuestionOptions(value.options);
  const score = normalizePositiveInteger(value.score);
  const standardAnswer = normalizeRequiredText(value.standardAnswer);
  const analysisSummary = normalizeRequiredText(value.analysisSummary);
  const citationCount = normalizeNonNegativeInteger(value.citationCount);
  const hasPaperSectionMetadata = [
    "paperSectionKey",
    "paperSectionTitle",
    "paperSectionSortOrder",
    "questionSortOrder",
  ].some((key) => value[key] !== null && value[key] !== undefined);
  const paperSectionKey = hasPaperSectionMetadata
    ? normalizeRequiredText(value.paperSectionKey)
    : null;
  const paperSectionTitle = hasPaperSectionMetadata
    ? normalizeRequiredText(value.paperSectionTitle)
    : null;
  const paperSectionSortOrder = hasPaperSectionMetadata
    ? normalizePositiveInteger(value.paperSectionSortOrder)
    : null;
  const questionSortOrder = hasPaperSectionMetadata
    ? normalizePositiveInteger(value.questionSortOrder)
    : null;

  if (
    publicId === null ||
    sequenceNumber === null ||
    !isOrganizationTrainingQuestionType(value.questionType) ||
    stem === null ||
    options === null ||
    score === null ||
    standardAnswer === null ||
    analysisSummary === null ||
    !isEvidenceStatus(value.evidenceStatus) ||
    citationCount === null ||
    (hasPaperSectionMetadata &&
      (paperSectionKey === null ||
        paperSectionTitle === null ||
        paperSectionSortOrder === null ||
        questionSortOrder === null))
  ) {
    return null;
  }

  if (sequenceNumber !== index + 1) {
    return null;
  }

  if (value.questionType !== "short_answer" && options.length === 0) {
    return null;
  }

  return {
    publicId,
    sequenceNumber,
    questionType: value.questionType,
    ...(hasPaperSectionMetadata
      ? {
          paperSectionKey: paperSectionKey as string,
          paperSectionTitle: paperSectionTitle as string,
          paperSectionSortOrder: paperSectionSortOrder as number,
          questionSortOrder: questionSortOrder as number,
        }
      : {}),
    materialTitle,
    materialContent,
    stem,
    options,
    score,
    standardAnswer,
    analysisSummary,
    evidenceStatus: value.evidenceStatus,
    citationCount,
  };
}

export function normalizeOrganizationTrainingPublishInput(
  input: unknown,
): OrganizationTrainingPublishValidationResult {
  if (!isRecord(input) || hasForbiddenPublishPayload(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingPublishInputMessage,
    };
  }

  const draftPublicId = normalizeRequiredText(input.draftPublicId);
  const expectedRevision = normalizePositiveInteger(input.expectedRevision);
  const operationId = normalizeRequiredText(input.operationId);
  const answerDeadlineAt = normalizeOptionalIsoTimestamp(
    input.answerDeadlineAt,
  );
  const publishScopeOrganizationPublicIds = normalizePublicIdList(
    input.publishScopeOrganizationPublicIds,
  );
  const weakEvidenceConfirmed = input.weakEvidenceConfirmed === true;

  if (
    draftPublicId === null ||
    expectedRevision === null ||
    operationId === null ||
    answerDeadlineAt === undefined ||
    publishScopeOrganizationPublicIds === null
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingPublishInputMessage,
    };
  }

  return {
    success: true,
    value: {
      draftPublicId,
      expectedRevision,
      operationId,
      answerDeadlineAt,
      publishScopeOrganizationPublicIds,
      weakEvidenceConfirmed,
    },
  };
}

function normalizeDraftQuestion(
  value: unknown,
  index: number,
): OrganizationTrainingDraftQuestionInput | null {
  if (!isRecord(value) || hasForbiddenDraftQuestionPayload(value)) {
    return null;
  }

  const normalizedQuestion = normalizePublishQuestion(
    {
      ...value,
      evidenceStatus: "weak",
      citationCount: 0,
    },
    index,
  );

  if (normalizedQuestion === null) {
    return null;
  }

  return {
    publicId: normalizedQuestion.publicId,
    sequenceNumber: normalizedQuestion.sequenceNumber,
    questionType: normalizedQuestion.questionType,
    ...(normalizedQuestion.paperSectionKey !== undefined &&
    normalizedQuestion.paperSectionTitle !== undefined &&
    normalizedQuestion.paperSectionSortOrder !== undefined &&
    normalizedQuestion.questionSortOrder !== undefined
      ? {
          paperSectionKey: normalizedQuestion.paperSectionKey,
          paperSectionTitle: normalizedQuestion.paperSectionTitle,
          paperSectionSortOrder: normalizedQuestion.paperSectionSortOrder,
          questionSortOrder: normalizedQuestion.questionSortOrder,
        }
      : {}),
    materialTitle: normalizedQuestion.materialTitle,
    materialContent: normalizedQuestion.materialContent,
    stem: normalizedQuestion.stem,
    options: normalizedQuestion.options,
    score: normalizedQuestion.score,
    standardAnswer: normalizedQuestion.standardAnswer,
    analysisSummary: normalizedQuestion.analysisSummary,
  };
}

function normalizeDraftQuestions(
  value: unknown,
): OrganizationTrainingDraftQuestionInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const questions = value.map(normalizeDraftQuestion);

  if (questions.some((question) => question === null)) {
    return null;
  }

  const normalizedQuestions =
    questions as OrganizationTrainingDraftQuestionInput[];

  return new Set(normalizedQuestions.map((question) => question.publicId))
    .size === normalizedQuestions.length
    ? normalizedQuestions
    : null;
}

export function normalizeOrganizationTrainingDraftSaveInput(
  input: unknown,
): OrganizationTrainingDraftSaveValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingDraftSaveInputMessage,
    };
  }

  const draftPublicId = normalizeRequiredText(input.draftPublicId);
  const expectedRevision = normalizePositiveInteger(input.expectedRevision);
  const operationId = normalizeRequiredText(input.operationId);
  const title = normalizeRequiredText(input.title);
  const description = normalizeOptionalText(input.description);
  const questions = normalizeDraftQuestions(input.questions);

  if (
    draftPublicId === null ||
    expectedRevision === null ||
    operationId === null ||
    title === null ||
    questions === null
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingDraftSaveInputMessage,
    };
  }

  return {
    success: true,
    value: {
      draftPublicId,
      expectedRevision,
      operationId,
      title,
      description,
      questions,
    },
  };
}

export function normalizeOrganizationTrainingManualDraftInput(
  input: unknown,
): OrganizationTrainingManualDraftValidationResult {
  if (!isRecord(input) || hasForbiddenSourceMetadataPayload(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingManualDraftInputMessage,
    };
  }

  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const level = normalizePositiveInteger(input.level);
  const title = normalizeRequiredText(input.title);
  const description = normalizeOptionalText(input.description);
  const sourceTaskPublicId = normalizeOptionalText(input.sourceTaskPublicId);
  const capabilityContext = normalizeCapabilityContext(input.capabilityContext);

  if (
    organizationPublicId === null ||
    authorizationPublicId === null ||
    !isProfession(input.profession) ||
    level === null ||
    !isSubject(input.subject) ||
    title === null ||
    capabilityContext === null
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingManualDraftInputMessage,
    };
  }

  return {
    success: true,
    value: {
      organizationPublicId,
      authorizationPublicId,
      sourceTaskPublicId,
      profession: input.profession,
      level,
      subject: input.subject,
      title,
      description,
      capabilityContext,
    },
  };
}

export function normalizeOrganizationTrainingAiResultCopyInput(
  input: unknown,
): OrganizationTrainingAiResultCopyValidationResult {
  const allowedKeys = new Set([
    "organizationPublicId",
    "sourceTaskPublicId",
    "sourceResultPublicId",
    "weakEvidenceConfirmed",
  ]);

  if (
    !isRecord(input) ||
    Object.keys(input).some((key) => !allowedKeys.has(key))
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingAiResultCopyInputMessage,
    };
  }

  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const sourceTaskPublicId = normalizeRequiredText(input.sourceTaskPublicId);
  const sourceResultPublicId = normalizeRequiredText(
    input.sourceResultPublicId,
  );

  if (
    organizationPublicId === null ||
    sourceTaskPublicId === null ||
    sourceResultPublicId === null ||
    typeof input.weakEvidenceConfirmed !== "boolean"
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingAiResultCopyInputMessage,
    };
  }

  return {
    success: true,
    value: {
      organizationPublicId,
      sourceTaskPublicId,
      sourceResultPublicId,
      weakEvidenceConfirmed: input.weakEvidenceConfirmed,
    },
  };
}

export function normalizeOrganizationTrainingTakedownInput(
  input: unknown,
): OrganizationTrainingTakedownValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingTakedownInputMessage,
    };
  }

  const versionPublicId = normalizeRequiredText(input.versionPublicId);
  const takedownReason = normalizeRequiredText(input.takedownReason);

  if (versionPublicId === null || takedownReason === null) {
    return {
      success: false,
      message: invalidOrganizationTrainingTakedownInputMessage,
    };
  }

  return {
    success: true,
    value: {
      versionPublicId,
      takedownReason,
    },
  };
}

export function normalizeOrganizationTrainingEmployeeAnswerDraftInput(
  input: unknown,
): OrganizationTrainingEmployeeAnswerDraftValidationResult {
  if (!isRecord(input) || hasForbiddenEmployeeAnswerPayload(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingEmployeeAnswerDraftInputMessage,
    };
  }

  const trainingVersionPublicId = normalizeRequiredText(
    input.trainingVersionPublicId,
  );
  const expectedRevision = normalizeNonNegativeInteger(input.expectedRevision);
  const operationId = normalizeRequiredText(input.operationId);
  const answerItems = normalizeAnswerItems(input.answerItems);

  if (
    trainingVersionPublicId === null ||
    expectedRevision === null ||
    operationId === null ||
    answerItems === null
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingEmployeeAnswerDraftInputMessage,
    };
  }

  return {
    success: true,
    value: {
      trainingVersionPublicId,
      expectedRevision,
      operationId,
      answerItems,
    },
  };
}

export function normalizeOrganizationTrainingEmployeeAnswerSubmitInput(
  input: unknown,
): OrganizationTrainingEmployeeAnswerSubmitValidationResult {
  const draftInput =
    normalizeOrganizationTrainingEmployeeAnswerDraftInput(input);

  if (!draftInput.success) {
    return {
      success: false,
      message: invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage,
    };
  }

  return {
    success: true,
    value: draftInput.value,
  };
}

export function normalizeOrganizationTrainingCopyToNewDraftInput(
  input: unknown,
): OrganizationTrainingCopyToNewDraftValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingCopyToNewDraftInputMessage,
    };
  }

  const sourceVersionPublicId = normalizeRequiredText(
    input.sourceVersionPublicId,
  );
  const newDraftTitle = normalizeRequiredText(input.newDraftTitle);

  if (sourceVersionPublicId === null || newDraftTitle === null) {
    return {
      success: false,
      message: invalidOrganizationTrainingCopyToNewDraftInputMessage,
    };
  }

  return {
    success: true,
    value: {
      sourceVersionPublicId,
      newDraftTitle,
    },
  };
}

export function normalizeOrganizationTrainingCopyToNewDraftRouteInput(
  input: unknown,
): OrganizationTrainingCopyToNewDraftRouteValidationResult {
  const copyInput = normalizeOrganizationTrainingCopyToNewDraftInput(input);

  if (!copyInput.success || !isRecord(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingCopyToNewDraftInputMessage,
    };
  }

  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );

  if (authorizationPublicId === null) {
    return {
      success: false,
      message: invalidOrganizationTrainingCopyToNewDraftInputMessage,
    };
  }

  return {
    success: true,
    value: {
      ...copyInput.value,
      authorizationPublicId,
    },
  };
}

function normalizeSourceContextItem(
  input: unknown,
): OrganizationTrainingSourceContextRouteItemInput | null {
  if (!isRecord(input) || hasForbiddenSourceMetadataPayload(input)) {
    return null;
  }

  const sourcePublicId = normalizeRequiredText(input.sourcePublicId);
  const title = normalizeRequiredText(input.title);
  const level = normalizePositiveInteger(input.level);
  const questionCount = normalizePositiveInteger(input.questionCount);
  const totalScore = normalizeNonNegativeInteger(input.totalScore);
  const sourceStatus = normalizeRequiredText(input.sourceStatus);

  if (
    !isFirstReleaseOrganizationTrainingSourceContextType(input.sourceType) ||
    sourcePublicId === null ||
    title === null ||
    !isProfession(input.profession) ||
    level === null ||
    !isSubject(input.subject) ||
    questionCount === null ||
    totalScore === null ||
    sourceStatus === null
  ) {
    return null;
  }

  return {
    sourceType: input.sourceType,
    sourcePublicId,
    title,
    profession: input.profession,
    level,
    subject: input.subject,
    questionCount,
    totalScore,
    sourceStatus,
  };
}

function normalizeSourceContextItems(
  input: unknown,
): OrganizationTrainingSourceContextRouteItemInput[] | null {
  if (!Array.isArray(input) || input.length === 0) {
    return null;
  }

  const sourceContexts = input.map(normalizeSourceContextItem);

  if (sourceContexts.some((sourceContext) => sourceContext === null)) {
    return null;
  }

  return sourceContexts as OrganizationTrainingSourceContextRouteItemInput[];
}

export function normalizeOrganizationTrainingSourceContextInput(
  input: unknown,
): OrganizationTrainingSourceContextValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingSourceContextInputMessage,
    };
  }

  const draftPublicId = normalizeRequiredText(input.draftPublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const level = normalizePositiveInteger(input.level);
  const capabilityContext = normalizeCapabilityContext(input.capabilityContext);
  const sourceContexts = normalizeSourceContextItems(input.sourceContexts);

  if (
    draftPublicId === null ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    !isProfession(input.profession) ||
    level === null ||
    capabilityContext === null ||
    sourceContexts === null
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingSourceContextInputMessage,
    };
  }

  return {
    success: true,
    value: {
      draftPublicId,
      organizationPublicId,
      authorizationPublicId,
      profession: input.profession,
      level,
      capabilityContext,
      sourceContexts,
    },
  };
}

export function normalizeOrganizationTrainingAuditLogReferenceInput(
  input: unknown,
): OrganizationTrainingAuditLogReferenceValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingAuditLogReferenceInputMessage,
    };
  }

  const auditLogPublicId = normalizeRequiredText(input.auditLogPublicId);
  const actionType = normalizeRequiredText(input.actionType);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );

  if (
    auditLogPublicId === null ||
    actionType === null ||
    !isOrganizationTrainingAuditLogTargetResourceType(
      input.targetResourceType,
    ) ||
    organizationPublicId === null
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingAuditLogReferenceInputMessage,
    };
  }

  const referenceInput: OrganizationTrainingAuditLogReferenceInput = {
    auditLogPublicId,
    actionType,
    targetResourceType: input.targetResourceType,
    trainingDraftPublicId: normalizeOptionalText(input.trainingDraftPublicId),
    trainingVersionPublicId: normalizeOptionalText(
      input.trainingVersionPublicId,
    ),
    employeeAnswerPublicId: normalizeOptionalText(input.employeeAnswerPublicId),
    organizationPublicId,
    actorPublicId: normalizeOptionalText(input.actorPublicId),
  };

  if (
    !hasRequiredOrganizationTrainingAuditTargetReference(
      referenceInput.targetResourceType,
      referenceInput,
    )
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingAuditLogReferenceInputMessage,
    };
  }

  return {
    success: true,
    value: referenceInput,
  };
}
