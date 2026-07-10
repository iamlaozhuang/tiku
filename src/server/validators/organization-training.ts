import { evidenceStatusValues } from "../models/ai-rag";
import { professionValues } from "../models/auth";
import type {
  EmployeeOrganizationTrainingAnswerItemDto,
  EmployeeOrganizationTrainingScoreSummaryDto,
} from "../contracts/organization-training-contract";
import {
  type OrganizationTrainingAuditLogReferenceInput,
  type OrganizationTrainingAuditLogTargetResourceType,
  type OrganizationTrainingCapabilityContext,
  type OrganizationTrainingCopyToNewDraftInput,
  type OrganizationTrainingPublishInput,
  type OrganizationTrainingPublishQuestionInput,
  type OrganizationTrainingQuestionType,
  type OrganizationTrainingQuestionTypeSummary,
  type OrganizationTrainingSourceContextType,
  type OrganizationTrainingTakedownInput,
  organizationTrainingAuditLogTargetResourceTypeValues,
  organizationTrainingQuestionTypeValues,
  organizationTrainingSourceContextTypeValues,
} from "../models/organization-training";
import { subjectValues } from "../models/paper";

export const invalidOrganizationTrainingPublishInputMessage =
  "Invalid organization training publish input.";

export const invalidOrganizationTrainingTakedownInputMessage =
  "Invalid organization training takedown input.";

export const invalidOrganizationTrainingManualDraftInputMessage =
  "Invalid organization training manual draft input.";

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
  answeredQuestionCount: number;
  answerItems: EmployeeOrganizationTrainingAnswerItemDto[];
};

export type OrganizationTrainingEmployeeAnswerSubmitRouteInput =
  OrganizationTrainingEmployeeAnswerDraftRouteInput & {
    scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto;
  };

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

const organizationTrainingQuestionTypeSummaryKeyByType: Record<
  OrganizationTrainingQuestionType,
  keyof OrganizationTrainingQuestionTypeSummary
> = {
  single_choice: "singleChoice",
  multi_choice: "multiChoice",
  true_false: "trueFalse",
  short_answer: "shortAnswer",
};

const forbiddenEmployeeAnswerPayloadKeys = [
  "answerBody",
  "answers",
  "questionAnswers",
  "rawAnswer",
  "providerPayload",
  "rawPrompt",
  "standardAnswer",
  "analysis",
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

function normalizePublicIdArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return Array.from(
    new Set(
      value
        .map((item) => normalizeRequiredText(item))
        .filter((item): item is string => item !== null),
    ),
  );
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
  const selectedOptionPublicIds = normalizePublicIdArray(
    value.selectedOptionPublicIds,
  );
  const textAnswer = normalizeOptionalText(value.textAnswer);

  if (questionPublicId === null || selectedOptionPublicIds === null) {
    return null;
  }

  return {
    questionPublicId,
    selectedOptionPublicIds,
    textAnswer,
  };
}

function normalizeAnswerItems(
  value: unknown,
): EmployeeOrganizationTrainingAnswerItemDto[] | null {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedAnswerItems = value.map(normalizeAnswerItem);

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

function createEmptyQuestionTypeSummary(): OrganizationTrainingQuestionTypeSummary {
  return {
    singleChoice: 0,
    multiChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
  };
}

function buildQuestionTypeSummary(
  questions: OrganizationTrainingPublishQuestionInput[],
): OrganizationTrainingQuestionTypeSummary {
  return questions.reduce((summary, question) => {
    const summaryKey =
      organizationTrainingQuestionTypeSummaryKeyByType[question.questionType];

    return {
      ...summary,
      [summaryKey]: summary[summaryKey] + 1,
    };
  }, createEmptyQuestionTypeSummary());
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
    citationCount === null
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

function normalizePublishQuestions(
  value: unknown,
): OrganizationTrainingPublishQuestionInput[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const normalizedQuestions = value.map((item, index) =>
    normalizePublishQuestion(item, index),
  );

  if (normalizedQuestions.some((question) => question === null)) {
    return null;
  }

  return normalizedQuestions as OrganizationTrainingPublishQuestionInput[];
}

export function normalizeOrganizationTrainingPublishInput(
  input: unknown,
): OrganizationTrainingPublishValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: invalidOrganizationTrainingPublishInputMessage,
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
  const title = normalizeRequiredText(input.title);
  const description = normalizeOptionalText(input.description);
  const answerDeadlineAt = normalizeOptionalIsoTimestamp(
    input.answerDeadlineAt,
  );
  const questions = normalizePublishQuestions(input.questions);
  const publishScopeOrganizationPublicIds = normalizePublicIdList(
    input.publishScopeOrganizationPublicIds,
  );
  const capabilityContext = normalizeCapabilityContext(input.capabilityContext);
  const weakEvidenceConfirmed = input.weakEvidenceConfirmed === true;

  if (
    draftPublicId === null ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    !isProfession(input.profession) ||
    level === null ||
    !isSubject(input.subject) ||
    title === null ||
    answerDeadlineAt === undefined ||
    questions === null ||
    publishScopeOrganizationPublicIds === null ||
    capabilityContext === null
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingPublishInputMessage,
    };
  }

  const totalScore = questions.reduce(
    (scoreTotal, question) => scoreTotal + question.score,
    0,
  );

  return {
    success: true,
    value: {
      draftPublicId,
      organizationPublicId,
      authorizationPublicId,
      profession: input.profession,
      level,
      subject: input.subject,
      title,
      description,
      answerDeadlineAt,
      questions,
      publishScopeOrganizationPublicIds,
      capabilityContext,
      questionCount: questions.length,
      totalScore,
      questionTypeSummary: buildQuestionTypeSummary(questions),
      weakEvidenceConfirmed,
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
  const answeredQuestionCount = normalizePositiveInteger(
    input.answeredQuestionCount,
  );
  const answerItems = normalizeAnswerItems(input.answerItems);

  if (
    trainingVersionPublicId === null ||
    answeredQuestionCount === null ||
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
      answeredQuestionCount,
      answerItems,
    },
  };
}

export function normalizeOrganizationTrainingEmployeeAnswerSubmitInput(
  input: unknown,
): OrganizationTrainingEmployeeAnswerSubmitValidationResult {
  const draftInput =
    normalizeOrganizationTrainingEmployeeAnswerDraftInput(input);

  if (
    !draftInput.success ||
    !isRecord(input) ||
    !isRecord(input.scoreSummary)
  ) {
    return {
      success: false,
      message: invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage,
    };
  }

  const score = normalizeNonNegativeInteger(input.scoreSummary.score);
  const totalScore = normalizeNonNegativeInteger(input.scoreSummary.totalScore);

  if (score === null || totalScore === null) {
    return {
      success: false,
      message: invalidOrganizationTrainingEmployeeAnswerSubmitInputMessage,
    };
  }

  return {
    success: true,
    value: {
      ...draftInput.value,
      scoreSummary: {
        score,
        totalScore,
      },
    },
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
