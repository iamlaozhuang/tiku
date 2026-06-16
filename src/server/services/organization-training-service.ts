import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  EmployeeOrganizationTrainingAnswerDto,
  EmployeeOrganizationTrainingScoreSummaryDto,
  OrganizationTrainingAuditLogReferenceDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingScopeSnapshotDto,
  OrganizationTrainingSourceContextAttachmentDto,
  OrganizationTrainingSourceContextDto,
} from "../contracts/organization-training-contract";
import { professionValues, type Profession } from "../models/auth";
import {
  type OrganizationTrainingAuditLogReferenceInput,
  type OrganizationTrainingCopyToNewDraftInput,
  organizationTrainingQuestionTypeValues,
  type OrganizationTrainingPublishInput,
  type OrganizationTrainingQuestionTypeSummary,
  type OrganizationTrainingSourceContextType,
  organizationTrainingSourceContextTypeValues,
  type OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import { subjectValues, type Subject } from "../models/paper";
import {
  invalidOrganizationTrainingAuditLogReferenceInputMessage,
  normalizeOrganizationTrainingAuditLogReferenceInput,
} from "../validators/organization-training";

export const organizationTrainingManualDraftCreationBlockedMessage =
  "Organization training manual draft creation is blocked.";

export const organizationTrainingPublishBlockedMessage =
  "Organization training publish is blocked.";

export const organizationTrainingTakedownBlockedMessage =
  "Organization training takedown is blocked.";

export const organizationTrainingCopyToNewDraftBlockedMessage =
  "Organization training copy-to-new-draft is blocked.";

export const organizationTrainingEmployeeAnswerBlockedMessage =
  "Organization training employee answer is blocked.";

export const organizationTrainingSourceContextBlockedMessage =
  "Organization training source context is blocked.";

const INVALID_ORGANIZATION_TRAINING_AUDIT_LOG_REFERENCE_INPUT_CODE = 400184;

function mapOrganizationTrainingAuditLogReferenceToDto(
  input: OrganizationTrainingAuditLogReferenceInput,
): OrganizationTrainingAuditLogReferenceDto {
  return {
    auditLogReference: {
      publicId: input.auditLogPublicId,
      redactionStatus: "redacted",
    },
    targetReference: {
      targetResourceType: input.targetResourceType,
      trainingDraftPublicId: input.trainingDraftPublicId,
      trainingVersionPublicId: input.trainingVersionPublicId,
      employeeAnswerPublicId: input.employeeAnswerPublicId,
      organizationPublicId: input.organizationPublicId,
    },
    actorReference: {
      actorPublicId: input.actorPublicId,
      redactionStatus: "redacted",
    },
    actionType: input.actionType,
    referenceStatus: "redacted_reference",
  };
}

export function buildOrganizationTrainingAuditLogReferenceReadModel(
  input: unknown,
): ApiResponse<OrganizationTrainingAuditLogReferenceDto | null> {
  const auditLogReferenceInput =
    normalizeOrganizationTrainingAuditLogReferenceInput(input);

  if (!auditLogReferenceInput.success) {
    return createErrorResponse(
      INVALID_ORGANIZATION_TRAINING_AUDIT_LOG_REFERENCE_INPUT_CODE,
      invalidOrganizationTrainingAuditLogReferenceInputMessage,
    );
  }

  return createSuccessResponse(
    mapOrganizationTrainingAuditLogReferenceToDto(auditLogReferenceInput.value),
  );
}

export type OrganizationTrainingManualDraftCreationBlockedReason =
  | "invalid_manual_draft_input"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | "organization_scope_denied"
  | "authorization_scope_mismatch";

export type OrganizationTrainingPublishBlockedReason =
  | "invalid_publish_input"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | "organization_scope_denied";

export type OrganizationTrainingTakedownBlockedReason =
  | "invalid_takedown_input"
  | "organization_scope_denied";

export type OrganizationTrainingCopyToNewDraftBlockedReason =
  | "invalid_copy_to_new_draft_input"
  | "organization_scope_denied";

export type OrganizationTrainingEmployeeAnswerBlockedReason =
  | "invalid_employee_context"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_answer_capability_required"
  | "version_not_visible"
  | "version_not_answerable"
  | "invalid_answer_input"
  | "already_submitted"
  | "history_not_visible";

export type OrganizationTrainingSourceContextBlockedReason =
  | "invalid_source_context_input"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | "organization_scope_denied"
  | "source_context_scope_mismatch";

export type OrganizationTrainingAdminContext = {
  adminPublicId: string;
  visibleOrganizationPublicIds: readonly string[];
};

export type OrganizationTrainingEmployeeContext = {
  employeePublicId: string;
  currentOrganizationPublicId: string;
  visibleOrganizationPublicIds: readonly string[];
  authorizationContext: EffectiveAuthorizationContextDto;
};

export type OrganizationTrainingManualDraftInput = {
  organizationPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
};

export type OrganizationTrainingCreateManualDraftCommand = {
  adminContext: OrganizationTrainingAdminContext;
  authorizationContext: EffectiveAuthorizationContextDto;
  draftInput: OrganizationTrainingManualDraftInput;
};

export type OrganizationTrainingManualDraftWrite = Omit<
  OrganizationTrainingDraftDto,
  "publicId"
> & {
  contentType: "organization_training_draft";
  ownerType: "organization";
  ownerPublicId: string;
  quotaOwnerType: "organization";
  quotaOwnerPublicId: string;
};

export type OrganizationTrainingDraftStore = {
  createManualDraft(
    draftWrite: OrganizationTrainingManualDraftWrite,
  ): Promise<OrganizationTrainingDraftDto>;
};

export type OrganizationTrainingPublishedVersionWrite = Omit<
  OrganizationTrainingPublishedVersionDto,
  "publicId" | "versionNumber"
> & {
  contentType: "organization_training_version";
  ownerType: "organization";
  ownerPublicId: string;
  quotaOwnerType: "organization";
  quotaOwnerPublicId: string;
  authorizationSource: "org_auth";
  authorizationPublicId: string;
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary;
};

export type OrganizationTrainingPersistenceLineage = {
  organizationId: number;
  orgAuthId: number;
};

export type OrganizationTrainingPublishedVersionPersistenceWrite =
  OrganizationTrainingPublishedVersionWrite &
    OrganizationTrainingPersistenceLineage;

export type OrganizationTrainingTakedownAccessPolicy = {
  allowNewAnswers: false;
  allowDraftSaves: false;
  allowQuestionDetailReentry: false;
  employeeHistoryVisibility: "own_summary_only";
  preserveHistory: true;
};

export type OrganizationTrainingVersionTakedownWrite = {
  versionPublicId: string;
  organizationPublicId: string;
  status: "taken_down";
  takenDownAt: string;
  takedownReason: string;
  accessPolicy: OrganizationTrainingTakedownAccessPolicy;
};

export type OrganizationTrainingVersionCopyPolicy = {
  preserveSourceVersion: true;
  preservePublishScopeSnapshot: true;
  createFreshDraftPublicId: true;
};

export type OrganizationTrainingVersionCopyToNewDraftWrite = {
  sourceVersionPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  sourceVersion: OrganizationTrainingPublishedVersionDto;
  sourceQuestionTypeSummary: OrganizationTrainingQuestionTypeSummary;
  newDraftTitle: string;
  contentType: "organization_training_draft";
  ownerType: "organization";
  ownerPublicId: string;
  quotaOwnerType: "organization";
  quotaOwnerPublicId: string;
  createdAt: string;
  copyPolicy: OrganizationTrainingVersionCopyPolicy;
};

export type OrganizationTrainingFormalWritePolicy = {
  createPractice: false;
  createMockExam: false;
  createFormalAnswerRecord: false;
  createExamReport: false;
  createMistakeBook: false;
};

export type OrganizationTrainingEmployeeAnswerDraftWrite = {
  contentType: "organization_training_answer_draft";
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: "in_progress";
  answeredQuestionCount: number;
  scoreSummary: null;
  savedAt: string;
  submittedAt: null;
  formalWritePolicy: OrganizationTrainingFormalWritePolicy;
};

export type OrganizationTrainingEmployeeAnswerSubmissionWrite = {
  contentType: "organization_training_answer_record";
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: "submitted";
  answeredQuestionCount: number;
  scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto;
  submittedAt: string;
  formalWritePolicy: OrganizationTrainingFormalWritePolicy;
};

export type OrganizationTrainingEmployeeAnswerStore = {
  saveEmployeeAnswerDraft(
    answerDraftWrite: OrganizationTrainingEmployeeAnswerDraftWrite,
  ): Promise<EmployeeOrganizationTrainingAnswerDto>;
  submitEmployeeAnswer(
    answerSubmissionWrite: OrganizationTrainingEmployeeAnswerSubmissionWrite,
  ): Promise<EmployeeOrganizationTrainingAnswerDto>;
};

export type OrganizationTrainingSourceContextFormalUsagePolicy = {
  createFormalPaper: false;
  createMockExam: false;
  exposeQuestionBody: false;
  exposeStandardAnswer: false;
  exposeAnalysis: false;
  exposeProviderPayload: false;
};

export type OrganizationTrainingSourceContextWrite =
  OrganizationTrainingSourceContextAttachmentDto & {
    contentType: "organization_training_source_context";
    authorizationSource: "org_auth";
    authorizationPublicId: string;
    formalUsagePolicy: OrganizationTrainingSourceContextFormalUsagePolicy;
  };

export type OrganizationTrainingSourceContextStore = {
  attachSourceContext(
    sourceContextWrite: OrganizationTrainingSourceContextWrite,
  ): Promise<OrganizationTrainingSourceContextAttachmentDto>;
};

export type OrganizationTrainingVersionStore = {
  publishVersion(
    versionWrite: OrganizationTrainingPublishedVersionPersistenceWrite,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
  takeDownVersion(
    takedownWrite: OrganizationTrainingVersionTakedownWrite,
  ): Promise<OrganizationTrainingPublishedVersionDto>;
  copyVersionToNewDraft(
    copyWrite: OrganizationTrainingVersionCopyToNewDraftWrite,
  ): Promise<OrganizationTrainingDraftDto>;
};

export type OrganizationTrainingStore = OrganizationTrainingDraftStore &
  OrganizationTrainingVersionStore &
  OrganizationTrainingSourceContextStore &
  OrganizationTrainingEmployeeAnswerStore;

export type OrganizationTrainingClock = {
  now(): Date;
};

export type OrganizationTrainingCreateManualDraftResult =
  | {
      success: true;
      draft: OrganizationTrainingDraftDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingManualDraftCreationBlockedReason;
      message: typeof organizationTrainingManualDraftCreationBlockedMessage;
    };

export type OrganizationTrainingPublishVersionCommand = {
  publishInput: OrganizationTrainingPublishInput;
  persistenceLineage: OrganizationTrainingPersistenceLineage;
};

export type OrganizationTrainingTakeDownVersionCommand = {
  adminContext: OrganizationTrainingAdminContext;
  versionOrganizationPublicId: string;
  takedownInput: OrganizationTrainingTakedownInput;
};

export type OrganizationTrainingCopyVersionToNewDraftCommand = {
  adminContext: OrganizationTrainingAdminContext;
  authorizationPublicId: string;
  copyInput: OrganizationTrainingCopyToNewDraftInput;
  sourceVersion: OrganizationTrainingPublishedVersionDto;
  sourceQuestionTypeSummary: OrganizationTrainingQuestionTypeSummary;
};

export type OrganizationTrainingSourceContextInput = Omit<
  OrganizationTrainingSourceContextDto,
  "redactionStatus"
>;

export type OrganizationTrainingAttachSourceContextCommand = {
  adminContext: OrganizationTrainingAdminContext;
  authorizationContext: EffectiveAuthorizationContextDto;
  draftPublicId: string;
  organizationPublicId: string;
  sourceContexts: readonly OrganizationTrainingSourceContextInput[];
};

export type OrganizationTrainingListEmployeeVisibleVersionsCommand = {
  employeeContext: OrganizationTrainingEmployeeContext;
  sourceVersions: readonly OrganizationTrainingPublishedVersionDto[];
};

export type OrganizationTrainingEmployeeAnswerDraftInput = {
  trainingVersionPublicId: string;
  answeredQuestionCount: number;
};

export type OrganizationTrainingEmployeeAnswerSubmitInput =
  OrganizationTrainingEmployeeAnswerDraftInput & {
    scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto;
  };

export type OrganizationTrainingSaveEmployeeAnswerDraftCommand = {
  employeeContext: OrganizationTrainingEmployeeContext;
  version: OrganizationTrainingPublishedVersionDto;
  answerInput: OrganizationTrainingEmployeeAnswerDraftInput;
  existingAnswer: EmployeeOrganizationTrainingAnswerDto | null;
};

export type OrganizationTrainingSubmitEmployeeAnswerCommand = {
  employeeContext: OrganizationTrainingEmployeeContext;
  version: OrganizationTrainingPublishedVersionDto;
  answerInput: OrganizationTrainingEmployeeAnswerSubmitInput;
  existingAnswer: EmployeeOrganizationTrainingAnswerDto | null;
};

export type OrganizationTrainingGetEmployeeAnswerReadonlySummaryCommand = {
  employeeContext: OrganizationTrainingEmployeeContext;
  version: OrganizationTrainingPublishedVersionDto;
  existingAnswer: EmployeeOrganizationTrainingAnswerDto | null;
};

export type OrganizationTrainingPublishVersionResult =
  | {
      success: true;
      version: OrganizationTrainingPublishedVersionDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingPublishBlockedReason;
      message: typeof organizationTrainingPublishBlockedMessage;
    };

export type OrganizationTrainingTakeDownVersionResult =
  | {
      success: true;
      version: OrganizationTrainingPublishedVersionDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingTakedownBlockedReason;
      message: typeof organizationTrainingTakedownBlockedMessage;
    };

export type OrganizationTrainingCopyVersionToNewDraftResult =
  | {
      success: true;
      draft: OrganizationTrainingDraftDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingCopyToNewDraftBlockedReason;
      message: typeof organizationTrainingCopyToNewDraftBlockedMessage;
    };

export type OrganizationTrainingListEmployeeVisibleVersionsResult =
  | {
      success: true;
      versions: OrganizationTrainingPublishedVersionDto[];
    }
  | {
      success: false;
      reason: OrganizationTrainingEmployeeAnswerBlockedReason;
      message: typeof organizationTrainingEmployeeAnswerBlockedMessage;
    };

export type OrganizationTrainingEmployeeAnswerResult =
  | {
      success: true;
      answer: EmployeeOrganizationTrainingAnswerDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingEmployeeAnswerBlockedReason;
      message: typeof organizationTrainingEmployeeAnswerBlockedMessage;
    };

export type OrganizationTrainingSourceContextResult =
  | {
      success: true;
      context: OrganizationTrainingSourceContextAttachmentDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingSourceContextBlockedReason;
      message: typeof organizationTrainingSourceContextBlockedMessage;
    };

export type OrganizationTrainingService = {
  createManualDraft(
    command: OrganizationTrainingCreateManualDraftCommand,
  ): Promise<OrganizationTrainingCreateManualDraftResult>;
  publishVersion(
    command: OrganizationTrainingPublishVersionCommand,
  ): Promise<OrganizationTrainingPublishVersionResult>;
  takeDownVersion(
    command: OrganizationTrainingTakeDownVersionCommand,
  ): Promise<OrganizationTrainingTakeDownVersionResult>;
  copyVersionToNewDraft(
    command: OrganizationTrainingCopyVersionToNewDraftCommand,
  ): Promise<OrganizationTrainingCopyVersionToNewDraftResult>;
  attachSourceContext(
    command: OrganizationTrainingAttachSourceContextCommand,
  ): Promise<OrganizationTrainingSourceContextResult>;
  listEmployeeVisibleVersions(
    command: OrganizationTrainingListEmployeeVisibleVersionsCommand,
  ): Promise<OrganizationTrainingListEmployeeVisibleVersionsResult>;
  saveEmployeeAnswerDraft(
    command: OrganizationTrainingSaveEmployeeAnswerDraftCommand,
  ): Promise<OrganizationTrainingEmployeeAnswerResult>;
  submitEmployeeAnswer(
    command: OrganizationTrainingSubmitEmployeeAnswerCommand,
  ): Promise<OrganizationTrainingEmployeeAnswerResult>;
  getEmployeeAnswerReadonlySummary(
    command: OrganizationTrainingGetEmployeeAnswerReadonlySummaryCommand,
  ): Promise<OrganizationTrainingEmployeeAnswerResult>;
};

const systemClock: OrganizationTrainingClock = {
  now() {
    return new Date();
  },
};

function createBlockedResult(
  reason: OrganizationTrainingManualDraftCreationBlockedReason,
): OrganizationTrainingCreateManualDraftResult {
  return {
    success: false,
    reason,
    message: organizationTrainingManualDraftCreationBlockedMessage,
  };
}

function createPublishBlockedResult(
  reason: OrganizationTrainingPublishBlockedReason,
): OrganizationTrainingPublishVersionResult {
  return {
    success: false,
    reason,
    message: organizationTrainingPublishBlockedMessage,
  };
}

function createTakedownBlockedResult(
  reason: OrganizationTrainingTakedownBlockedReason,
): OrganizationTrainingTakeDownVersionResult {
  return {
    success: false,
    reason,
    message: organizationTrainingTakedownBlockedMessage,
  };
}

function createCopyToNewDraftBlockedResult(
  reason: OrganizationTrainingCopyToNewDraftBlockedReason,
): OrganizationTrainingCopyVersionToNewDraftResult {
  return {
    success: false,
    reason,
    message: organizationTrainingCopyToNewDraftBlockedMessage,
  };
}

function createEmployeeAnswerBlockedResult(
  reason: OrganizationTrainingEmployeeAnswerBlockedReason,
): OrganizationTrainingEmployeeAnswerResult {
  return {
    success: false,
    reason,
    message: organizationTrainingEmployeeAnswerBlockedMessage,
  };
}

function createEmployeeListBlockedResult(
  reason: OrganizationTrainingEmployeeAnswerBlockedReason,
): OrganizationTrainingListEmployeeVisibleVersionsResult {
  return {
    success: false,
    reason,
    message: organizationTrainingEmployeeAnswerBlockedMessage,
  };
}

function createSourceContextBlockedResult(
  reason: OrganizationTrainingSourceContextBlockedReason,
): OrganizationTrainingSourceContextResult {
  return {
    success: false,
    reason,
    message: organizationTrainingSourceContextBlockedMessage,
  };
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredText(value: string): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmedValue = normalizeRequiredText(value);
  return trimmedValue;
}

function createEmptyQuestionTypeSummary(): OrganizationTrainingQuestionTypeSummary {
  return {
    singleChoice: 0,
    multiChoice: 0,
    trueFalse: 0,
    shortAnswer: 0,
  };
}

function copyQuestionTypeSummary(
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary,
): OrganizationTrainingQuestionTypeSummary {
  return {
    singleChoice: questionTypeSummary.singleChoice,
    multiChoice: questionTypeSummary.multiChoice,
    trueFalse: questionTypeSummary.trueFalse,
    shortAnswer: questionTypeSummary.shortAnswer,
  };
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isValidLevel(value: number): boolean {
  return isPositiveInteger(value);
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function isSubject(value: unknown): value is Subject {
  return (
    typeof value === "string" &&
    subjectValues.includes(value as (typeof subjectValues)[number])
  );
}

function isProfession(value: unknown): value is Profession {
  return (
    typeof value === "string" &&
    professionValues.includes(value as (typeof professionValues)[number])
  );
}

function isOrganizationTrainingQuestionType(value: unknown): boolean {
  return (
    typeof value === "string" &&
    organizationTrainingQuestionTypeValues.includes(
      value as (typeof organizationTrainingQuestionTypeValues)[number],
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

function isAdvancedOrgAuthContext(
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.authorizationSource === "org_auth" &&
    authorizationContext.ownerType === "organization" &&
    authorizationContext.organizationPublicId !== null &&
    authorizationContext.quotaOwnerType === "organization"
  );
}

function getEmployeeContextBlockedReason(
  authorizationContext: EffectiveAuthorizationContextDto,
): OrganizationTrainingEmployeeAnswerBlockedReason | null {
  if (authorizationContext.effectiveEdition !== "advanced") {
    return "advanced_edition_required";
  }

  if (
    authorizationContext.authorizationSource !== "org_auth" ||
    authorizationContext.ownerType !== "organization" ||
    authorizationContext.organizationPublicId === null ||
    authorizationContext.quotaOwnerType !== "organization"
  ) {
    return "org_auth_required";
  }

  if (
    authorizationContext.capabilities.canAnswerOrganizationTraining !== true
  ) {
    return "organization_training_answer_capability_required";
  }

  return null;
}

function getPublishCapabilityBlockedReason(
  capabilityContext: OrganizationTrainingPublishInput["capabilityContext"],
): OrganizationTrainingPublishBlockedReason | null {
  if (capabilityContext.effectiveEdition !== "advanced") {
    return "advanced_edition_required";
  }

  if (capabilityContext.authorizationSource !== "org_auth") {
    return "org_auth_required";
  }

  if (capabilityContext.canCreateOrganizationTraining !== true) {
    return "organization_training_capability_required";
  }

  return null;
}

function getSourceContextBlockedReason(
  authorizationContext: EffectiveAuthorizationContextDto,
): OrganizationTrainingSourceContextBlockedReason | null {
  if (authorizationContext.effectiveEdition !== "advanced") {
    return "advanced_edition_required";
  }

  if (!isAdvancedOrgAuthContext(authorizationContext)) {
    return "org_auth_required";
  }

  if (
    authorizationContext.capabilities.canCreateOrganizationTraining !== true
  ) {
    return "organization_training_capability_required";
  }

  return null;
}

function isOrganizationVisibleToAdmin(
  organizationPublicId: string,
  adminContext: OrganizationTrainingAdminContext,
): boolean {
  return adminContext.visibleOrganizationPublicIds
    .map((visibleOrganizationPublicId) =>
      normalizeRequiredText(visibleOrganizationPublicId),
    )
    .includes(organizationPublicId);
}

function isOrganizationOwnedByAuthorization(
  organizationPublicId: string,
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.organizationPublicId === organizationPublicId &&
    authorizationContext.ownerPublicId === organizationPublicId &&
    authorizationContext.quotaOwnerPublicId === organizationPublicId
  );
}

function normalizePublicIdList(values: readonly string[]): string[] {
  const normalizedValues = values
    .map((value) => normalizeRequiredText(value))
    .filter((value): value is string => value !== null);

  return Array.from(new Set(normalizedValues));
}

type NormalizedEmployeeContext = {
  employeePublicId: string;
  currentOrganizationPublicId: string;
  visibleOrganizationPublicIds: string[];
  authorizationContext: EffectiveAuthorizationContextDto;
};

function normalizeEmployeeContext(
  employeeContext: OrganizationTrainingEmployeeContext,
): NormalizedEmployeeContext | null {
  const employeePublicId = normalizeRequiredText(
    employeeContext.employeePublicId,
  );
  const currentOrganizationPublicId = normalizeRequiredText(
    employeeContext.currentOrganizationPublicId,
  );
  const visibleOrganizationPublicIds = normalizePublicIdList(
    employeeContext.visibleOrganizationPublicIds,
  );

  if (
    employeePublicId === null ||
    currentOrganizationPublicId === null ||
    visibleOrganizationPublicIds.length === 0 ||
    !visibleOrganizationPublicIds.includes(currentOrganizationPublicId)
  ) {
    return null;
  }

  return {
    employeePublicId,
    currentOrganizationPublicId,
    visibleOrganizationPublicIds,
    authorizationContext: employeeContext.authorizationContext,
  };
}

function isVersionVisibleToEmployee(
  version: OrganizationTrainingPublishedVersionDto,
  employeeContext: NormalizedEmployeeContext,
): boolean {
  const publishScopeOrganizationPublicIds = normalizePublicIdList(
    version.publishScopeSnapshot.organizationPublicIds,
  );

  return employeeContext.visibleOrganizationPublicIds.some(
    (visibleOrganizationPublicId) =>
      publishScopeOrganizationPublicIds.includes(visibleOrganizationPublicId),
  );
}

function isVersionAnswerable(version: OrganizationTrainingPublishedVersionDto) {
  return version.status === "published";
}

function createAnswerOrganizationSnapshot(
  employeeContext: NormalizedEmployeeContext,
  capturedAt: string,
): OrganizationTrainingScopeSnapshotDto {
  return {
    organizationPublicIds: [...employeeContext.visibleOrganizationPublicIds],
    capturedAt,
  };
}

function createFormalWritePolicy(): OrganizationTrainingFormalWritePolicy {
  return {
    createPractice: false,
    createMockExam: false,
    createFormalAnswerRecord: false,
    createExamReport: false,
    createMistakeBook: false,
  };
}

function createSourceContextFormalUsagePolicy(): OrganizationTrainingSourceContextFormalUsagePolicy {
  return {
    createFormalPaper: false,
    createMockExam: false,
    exposeQuestionBody: false,
    exposeStandardAnswer: false,
    exposeAnalysis: false,
    exposeProviderPayload: false,
  };
}

function isScoreSummaryValid(
  scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto,
  version: OrganizationTrainingPublishedVersionDto,
): boolean {
  return (
    isNonNegativeInteger(scoreSummary.score) &&
    isNonNegativeInteger(scoreSummary.totalScore) &&
    scoreSummary.totalScore === version.totalScore &&
    scoreSummary.score <= scoreSummary.totalScore
  );
}

function normalizeAnsweredQuestionCount(
  answeredQuestionCount: number,
  version: OrganizationTrainingPublishedVersionDto,
): number | null {
  if (
    !isPositiveInteger(answeredQuestionCount) ||
    answeredQuestionCount > version.questionCount
  ) {
    return null;
  }

  return answeredQuestionCount;
}

function normalizeAnswerTrainingVersionPublicId(
  answerTrainingVersionPublicId: string,
  version: OrganizationTrainingPublishedVersionDto,
): string | null {
  const normalizedTrainingVersionPublicId = normalizeRequiredText(
    answerTrainingVersionPublicId,
  );

  return normalizedTrainingVersionPublicId === version.publicId
    ? normalizedTrainingVersionPublicId
    : null;
}

function isSubmittedAnswer(
  answer: EmployeeOrganizationTrainingAnswerDto | null,
): boolean {
  return (
    answer !== null &&
    (answer.answerStatus === "submitted" || answer.answerStatus === "read_only")
  );
}

function isOwnAnswer(
  answer: EmployeeOrganizationTrainingAnswerDto,
  employeeContext: NormalizedEmployeeContext,
  version: OrganizationTrainingPublishedVersionDto,
): boolean {
  return (
    answer.employeePublicId === employeeContext.employeePublicId &&
    answer.trainingVersionPublicId === version.publicId
  );
}

function createReadonlyAnswerSummary(
  answer: EmployeeOrganizationTrainingAnswerDto,
): EmployeeOrganizationTrainingAnswerDto {
  return {
    ...answer,
    answerOrganizationSnapshot: {
      organizationPublicIds: [
        ...answer.answerOrganizationSnapshot.organizationPublicIds,
      ],
      capturedAt: answer.answerOrganizationSnapshot.capturedAt,
    },
    answerStatus: "read_only",
    resultSummaryVisible: true,
  };
}

function isPublishQuestionsValid(
  publishInput: OrganizationTrainingPublishInput,
): boolean {
  if (
    !Array.isArray(publishInput.questions) ||
    publishInput.questions.length === 0 ||
    publishInput.questionCount !== publishInput.questions.length
  ) {
    return false;
  }

  const totalScore = publishInput.questions.reduce(
    (scoreTotal, question) => scoreTotal + question.score,
    0,
  );

  if (publishInput.totalScore !== totalScore) {
    return false;
  }

  return publishInput.questions.every(
    (question) =>
      normalizeRequiredText(question.publicId) !== null &&
      isOrganizationTrainingQuestionType(question.questionType) &&
      isPositiveInteger(question.score) &&
      normalizeRequiredText(question.standardAnswer) !== null &&
      normalizeRequiredText(question.analysisSummary) !== null &&
      isNonNegativeInteger(question.citationCount),
  );
}

function isQuestionTypeSummaryValid(
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary,
  questionCount: number,
): boolean {
  const summaryValues = [
    questionTypeSummary.singleChoice,
    questionTypeSummary.multiChoice,
    questionTypeSummary.trueFalse,
    questionTypeSummary.shortAnswer,
  ];

  return (
    summaryValues.every(isNonNegativeInteger) &&
    summaryValues.reduce((summaryTotal, value) => summaryTotal + value, 0) ===
      questionCount
  );
}

type NormalizedPublishMetadata = {
  draftPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
  publishScopeOrganizationPublicIds: string[];
};

function normalizePublishMetadata(
  publishInput: OrganizationTrainingPublishInput,
): NormalizedPublishMetadata | null {
  const draftPublicId = normalizeRequiredText(publishInput.draftPublicId);
  const organizationPublicId = normalizeRequiredText(
    publishInput.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    publishInput.authorizationPublicId,
  );
  const title = normalizeRequiredText(publishInput.title);
  const publishScopeOrganizationPublicIds = normalizePublicIdList(
    publishInput.publishScopeOrganizationPublicIds,
  );

  if (
    draftPublicId === null ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    title === null ||
    !isValidLevel(publishInput.level) ||
    !isSubject(publishInput.subject) ||
    publishScopeOrganizationPublicIds.length === 0 ||
    !isPublishQuestionsValid(publishInput) ||
    !isQuestionTypeSummaryValid(
      publishInput.questionTypeSummary,
      publishInput.questionCount,
    )
  ) {
    return null;
  }

  return {
    draftPublicId,
    organizationPublicId,
    authorizationPublicId,
    profession: publishInput.profession,
    level: publishInput.level,
    subject: publishInput.subject,
    title,
    description: normalizeOptionalText(publishInput.description),
    publishScopeOrganizationPublicIds,
  };
}

function copyPublishedVersion(
  sourceVersion: OrganizationTrainingPublishedVersionDto,
): OrganizationTrainingPublishedVersionDto {
  return {
    ...sourceVersion,
    publishScopeSnapshot: {
      organizationPublicIds: [
        ...sourceVersion.publishScopeSnapshot.organizationPublicIds,
      ],
      capturedAt: sourceVersion.publishScopeSnapshot.capturedAt,
    },
  };
}

function isCopyableVersionStatus(
  status: OrganizationTrainingPublishedVersionDto["status"],
): boolean {
  return status === "published" || status === "taken_down";
}

type NormalizedTakedownMetadata = {
  versionPublicId: string;
  organizationPublicId: string;
  takedownReason: string;
};

function normalizeTakedownMetadata(
  command: OrganizationTrainingTakeDownVersionCommand,
): NormalizedTakedownMetadata | null {
  const versionPublicId = normalizeRequiredText(
    command.takedownInput.versionPublicId,
  );
  const organizationPublicId = normalizeRequiredText(
    command.versionOrganizationPublicId,
  );
  const takedownReason = normalizeRequiredText(
    command.takedownInput.takedownReason,
  );

  if (
    versionPublicId === null ||
    organizationPublicId === null ||
    takedownReason === null
  ) {
    return null;
  }

  return {
    versionPublicId,
    organizationPublicId,
    takedownReason,
  };
}

type NormalizedCopyToNewDraftMetadata = {
  sourceVersionPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  newDraftTitle: string;
};

function normalizeCopyToNewDraftMetadata(
  command: OrganizationTrainingCopyVersionToNewDraftCommand,
): NormalizedCopyToNewDraftMetadata | null {
  const sourceVersionPublicId = normalizeRequiredText(
    command.copyInput.sourceVersionPublicId,
  );
  const sourceVersionDtoPublicId = normalizeRequiredText(
    command.sourceVersion.publicId,
  );
  const organizationPublicId = normalizeRequiredText(
    command.sourceVersion.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    command.authorizationPublicId,
  );
  const newDraftTitle = normalizeRequiredText(command.copyInput.newDraftTitle);

  if (
    sourceVersionPublicId === null ||
    sourceVersionDtoPublicId === null ||
    sourceVersionPublicId !== sourceVersionDtoPublicId ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    newDraftTitle === null ||
    !isCopyableVersionStatus(command.sourceVersion.status) ||
    !isQuestionTypeSummaryValid(
      command.sourceQuestionTypeSummary,
      command.sourceVersion.questionCount,
    )
  ) {
    return null;
  }

  return {
    sourceVersionPublicId,
    organizationPublicId,
    authorizationPublicId,
    newDraftTitle,
  };
}

function normalizeSourceContext(
  sourceContext: unknown,
): OrganizationTrainingSourceContextDto | null {
  if (!isRecord(sourceContext)) {
    return null;
  }

  const sourcePublicId = normalizeRequiredText(
    sourceContext.sourcePublicId as string,
  );
  const title = normalizeRequiredText(sourceContext.title as string);
  const sourceStatus = normalizeRequiredText(
    sourceContext.sourceStatus as string,
  );
  const level =
    typeof sourceContext.level === "number" ? sourceContext.level : null;
  const questionCount =
    typeof sourceContext.questionCount === "number"
      ? sourceContext.questionCount
      : null;
  const totalScore =
    typeof sourceContext.totalScore === "number"
      ? sourceContext.totalScore
      : null;

  if (
    !isOrganizationTrainingSourceContextType(sourceContext.sourceType) ||
    sourcePublicId === null ||
    title === null ||
    !isProfession(sourceContext.profession) ||
    level === null ||
    !isValidLevel(level) ||
    !isSubject(sourceContext.subject) ||
    questionCount === null ||
    !isPositiveInteger(questionCount) ||
    totalScore === null ||
    !isNonNegativeInteger(totalScore) ||
    sourceStatus === null
  ) {
    return null;
  }

  return {
    sourceType: sourceContext.sourceType,
    sourcePublicId,
    title,
    profession: sourceContext.profession,
    level,
    subject: sourceContext.subject,
    questionCount,
    totalScore,
    sourceStatus,
    redactionStatus: "metadata_only",
  };
}

function normalizeSourceContexts(
  sourceContexts: readonly OrganizationTrainingSourceContextInput[],
): OrganizationTrainingSourceContextDto[] | null {
  if (!Array.isArray(sourceContexts) || sourceContexts.length === 0) {
    return null;
  }

  const normalizedSourceContexts = sourceContexts.map(normalizeSourceContext);

  if (
    normalizedSourceContexts.some((sourceContext) => sourceContext === null)
  ) {
    return null;
  }

  return normalizedSourceContexts as OrganizationTrainingSourceContextDto[];
}

function areSourceContextsMatchedToAuthorization(
  sourceContexts: readonly OrganizationTrainingSourceContextDto[],
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return sourceContexts.every(
    (sourceContext) =>
      sourceContext.profession === authorizationContext.profession &&
      sourceContext.level === authorizationContext.level,
  );
}

function normalizePersistenceLineage(
  persistenceLineage: OrganizationTrainingPersistenceLineage | undefined,
): OrganizationTrainingPersistenceLineage | null {
  if (persistenceLineage === undefined) {
    return null;
  }

  if (
    !isPositiveInteger(persistenceLineage.organizationId) ||
    !isPositiveInteger(persistenceLineage.orgAuthId)
  ) {
    return null;
  }

  return {
    organizationId: persistenceLineage.organizationId,
    orgAuthId: persistenceLineage.orgAuthId,
  };
}

function isAuthorizationContentScopeMatched(
  draftInput: OrganizationTrainingManualDraftInput,
  authorizationContext: EffectiveAuthorizationContextDto,
): boolean {
  return (
    authorizationContext.profession === draftInput.profession &&
    authorizationContext.level === draftInput.level
  );
}

export function createOrganizationTrainingService(
  trainingStore: OrganizationTrainingStore,
  clock: OrganizationTrainingClock = systemClock,
): OrganizationTrainingService {
  return {
    async createManualDraft(command) {
      const organizationPublicId = normalizeRequiredText(
        command.draftInput.organizationPublicId,
      );
      const title = normalizeRequiredText(command.draftInput.title);

      if (
        organizationPublicId === null ||
        title === null ||
        !isValidLevel(command.draftInput.level) ||
        !isSubject(command.draftInput.subject)
      ) {
        return createBlockedResult("invalid_manual_draft_input");
      }

      if (command.authorizationContext.effectiveEdition !== "advanced") {
        return createBlockedResult("advanced_edition_required");
      }

      if (!isAdvancedOrgAuthContext(command.authorizationContext)) {
        return createBlockedResult("org_auth_required");
      }

      if (
        command.authorizationContext.capabilities
          .canCreateOrganizationTraining !== true
      ) {
        return createBlockedResult("organization_training_capability_required");
      }

      if (
        !isOrganizationVisibleToAdmin(
          organizationPublicId,
          command.adminContext,
        ) ||
        !isOrganizationOwnedByAuthorization(
          organizationPublicId,
          command.authorizationContext,
        )
      ) {
        return createBlockedResult("organization_scope_denied");
      }

      if (
        !isAuthorizationContentScopeMatched(
          command.draftInput,
          command.authorizationContext,
        )
      ) {
        return createBlockedResult("authorization_scope_mismatch");
      }

      const createdAt = clock.now().toISOString();
      const draftWrite: OrganizationTrainingManualDraftWrite = {
        contentType: "organization_training_draft",
        ownerType: "organization",
        ownerPublicId: organizationPublicId,
        quotaOwnerType: "organization",
        quotaOwnerPublicId: organizationPublicId,
        sourceTaskPublicId: null,
        organizationPublicId,
        authorizationSource: "org_auth",
        authorizationPublicId:
          command.authorizationContext.authorizationPublicId,
        profession: command.draftInput.profession,
        level: command.draftInput.level,
        subject: command.draftInput.subject,
        title,
        description: normalizeOptionalText(command.draftInput.description),
        questionCount: 0,
        totalScore: 0,
        questionTypeSummary: createEmptyQuestionTypeSummary(),
        evidenceStatus: "none",
        validationStatus: "needs_review",
        retentionStatus: "active",
        createdAt,
        expiresAt: null,
      };

      return {
        success: true,
        draft: await trainingStore.createManualDraft(draftWrite),
      };
    },

    async publishVersion(command) {
      const publishInput = command.publishInput;
      const normalizedMetadata = normalizePublishMetadata(publishInput);
      const normalizedPersistenceLineage = normalizePersistenceLineage(
        command.persistenceLineage,
      );

      if (
        normalizedMetadata === null ||
        normalizedPersistenceLineage === null
      ) {
        return createPublishBlockedResult("invalid_publish_input");
      }

      const capabilityBlockedReason = getPublishCapabilityBlockedReason(
        publishInput.capabilityContext,
      );

      if (capabilityBlockedReason !== null) {
        return createPublishBlockedResult(capabilityBlockedReason);
      }

      if (
        !normalizedMetadata.publishScopeOrganizationPublicIds.includes(
          normalizedMetadata.organizationPublicId,
        )
      ) {
        return createPublishBlockedResult("organization_scope_denied");
      }

      const publishedAt = clock.now().toISOString();
      const versionWrite: OrganizationTrainingPublishedVersionPersistenceWrite =
        {
          contentType: "organization_training_version",
          ownerType: "organization",
          ownerPublicId: normalizedMetadata.organizationPublicId,
          quotaOwnerType: "organization",
          quotaOwnerPublicId: normalizedMetadata.organizationPublicId,
          authorizationSource: "org_auth",
          authorizationPublicId: normalizedMetadata.authorizationPublicId,
          draftPublicId: normalizedMetadata.draftPublicId,
          organizationPublicId: normalizedMetadata.organizationPublicId,
          publishScopeSnapshot: {
            organizationPublicIds: [
              ...normalizedMetadata.publishScopeOrganizationPublicIds,
            ],
            capturedAt: publishedAt,
          },
          profession: normalizedMetadata.profession,
          level: normalizedMetadata.level,
          subject: normalizedMetadata.subject,
          title: normalizedMetadata.title,
          description: normalizedMetadata.description,
          questionCount: publishInput.questionCount,
          totalScore: publishInput.totalScore,
          questionTypeSummary: copyQuestionTypeSummary(
            publishInput.questionTypeSummary,
          ),
          status: "published",
          publishedAt,
          takenDownAt: null,
          takedownReason: null,
          organizationId: normalizedPersistenceLineage.organizationId,
          orgAuthId: normalizedPersistenceLineage.orgAuthId,
        };

      return {
        success: true,
        version: await trainingStore.publishVersion(versionWrite),
      };
    },

    async takeDownVersion(command) {
      const normalizedMetadata = normalizeTakedownMetadata(command);

      if (normalizedMetadata === null) {
        return createTakedownBlockedResult("invalid_takedown_input");
      }

      if (
        !isOrganizationVisibleToAdmin(
          normalizedMetadata.organizationPublicId,
          command.adminContext,
        )
      ) {
        return createTakedownBlockedResult("organization_scope_denied");
      }

      const takenDownAt = clock.now().toISOString();

      return {
        success: true,
        version: await trainingStore.takeDownVersion({
          versionPublicId: normalizedMetadata.versionPublicId,
          organizationPublicId: normalizedMetadata.organizationPublicId,
          status: "taken_down",
          takenDownAt,
          takedownReason: normalizedMetadata.takedownReason,
          accessPolicy: {
            allowNewAnswers: false,
            allowDraftSaves: false,
            allowQuestionDetailReentry: false,
            employeeHistoryVisibility: "own_summary_only",
            preserveHistory: true,
          },
        }),
      };
    },

    async copyVersionToNewDraft(command) {
      const normalizedMetadata = normalizeCopyToNewDraftMetadata(command);

      if (normalizedMetadata === null) {
        return createCopyToNewDraftBlockedResult(
          "invalid_copy_to_new_draft_input",
        );
      }

      if (
        !isOrganizationVisibleToAdmin(
          normalizedMetadata.organizationPublicId,
          command.adminContext,
        )
      ) {
        return createCopyToNewDraftBlockedResult("organization_scope_denied");
      }

      return {
        success: true,
        draft: await trainingStore.copyVersionToNewDraft({
          sourceVersionPublicId: normalizedMetadata.sourceVersionPublicId,
          organizationPublicId: normalizedMetadata.organizationPublicId,
          authorizationPublicId: normalizedMetadata.authorizationPublicId,
          sourceVersion: copyPublishedVersion(command.sourceVersion),
          sourceQuestionTypeSummary: copyQuestionTypeSummary(
            command.sourceQuestionTypeSummary,
          ),
          newDraftTitle: normalizedMetadata.newDraftTitle,
          contentType: "organization_training_draft",
          ownerType: "organization",
          ownerPublicId: normalizedMetadata.organizationPublicId,
          quotaOwnerType: "organization",
          quotaOwnerPublicId: normalizedMetadata.organizationPublicId,
          createdAt: clock.now().toISOString(),
          copyPolicy: {
            preserveSourceVersion: true,
            preservePublishScopeSnapshot: true,
            createFreshDraftPublicId: true,
          },
        }),
      };
    },

    async attachSourceContext(command) {
      const draftPublicId = normalizeRequiredText(command.draftPublicId);
      const organizationPublicId = normalizeRequiredText(
        command.organizationPublicId,
      );
      const sourceContexts = normalizeSourceContexts(command.sourceContexts);

      if (
        draftPublicId === null ||
        organizationPublicId === null ||
        sourceContexts === null
      ) {
        return createSourceContextBlockedResult("invalid_source_context_input");
      }

      const contextBlockedReason = getSourceContextBlockedReason(
        command.authorizationContext,
      );

      if (contextBlockedReason !== null) {
        return createSourceContextBlockedResult(contextBlockedReason);
      }

      if (
        !isOrganizationVisibleToAdmin(
          organizationPublicId,
          command.adminContext,
        ) ||
        !isOrganizationOwnedByAuthorization(
          organizationPublicId,
          command.authorizationContext,
        )
      ) {
        return createSourceContextBlockedResult("organization_scope_denied");
      }

      if (
        !areSourceContextsMatchedToAuthorization(
          sourceContexts,
          command.authorizationContext,
        )
      ) {
        return createSourceContextBlockedResult(
          "source_context_scope_mismatch",
        );
      }

      return {
        success: true,
        context: await trainingStore.attachSourceContext({
          draftPublicId,
          organizationPublicId,
          authorizationSource: "org_auth",
          authorizationPublicId:
            command.authorizationContext.authorizationPublicId,
          contentType: "organization_training_source_context",
          sourceContexts,
          formalUsagePolicy: createSourceContextFormalUsagePolicy(),
          redactionStatus: "metadata_only",
        }),
      };
    },

    async listEmployeeVisibleVersions(command) {
      const normalizedEmployeeContext = normalizeEmployeeContext(
        command.employeeContext,
      );
      if (normalizedEmployeeContext === null) {
        return createEmployeeListBlockedResult("invalid_employee_context");
      }

      const contextBlockedReason = getEmployeeContextBlockedReason(
        normalizedEmployeeContext.authorizationContext,
      );
      if (contextBlockedReason !== null) {
        return createEmployeeListBlockedResult(contextBlockedReason);
      }

      return {
        success: true,
        versions: command.sourceVersions
          .filter(
            (version) =>
              isVersionAnswerable(version) &&
              isVersionVisibleToEmployee(version, normalizedEmployeeContext),
          )
          .map(copyPublishedVersion),
      };
    },

    async saveEmployeeAnswerDraft(command) {
      const normalizedEmployeeContext = normalizeEmployeeContext(
        command.employeeContext,
      );
      if (normalizedEmployeeContext === null) {
        return createEmployeeAnswerBlockedResult("invalid_employee_context");
      }

      const contextBlockedReason = getEmployeeContextBlockedReason(
        normalizedEmployeeContext.authorizationContext,
      );
      if (contextBlockedReason !== null) {
        return createEmployeeAnswerBlockedResult(contextBlockedReason);
      }

      if (
        !isVersionVisibleToEmployee(command.version, normalizedEmployeeContext)
      ) {
        return createEmployeeAnswerBlockedResult("version_not_visible");
      }

      if (!isVersionAnswerable(command.version)) {
        return createEmployeeAnswerBlockedResult("version_not_answerable");
      }

      if (isSubmittedAnswer(command.existingAnswer)) {
        return createEmployeeAnswerBlockedResult("already_submitted");
      }

      const trainingVersionPublicId = normalizeAnswerTrainingVersionPublicId(
        command.answerInput.trainingVersionPublicId,
        command.version,
      );
      const answeredQuestionCount = normalizeAnsweredQuestionCount(
        command.answerInput.answeredQuestionCount,
        command.version,
      );

      if (trainingVersionPublicId === null || answeredQuestionCount === null) {
        return createEmployeeAnswerBlockedResult("invalid_answer_input");
      }

      const savedAt = clock.now().toISOString();

      return {
        success: true,
        answer: await trainingStore.saveEmployeeAnswerDraft({
          contentType: "organization_training_answer_draft",
          trainingVersionPublicId,
          employeePublicId: normalizedEmployeeContext.employeePublicId,
          organizationPublicId:
            normalizedEmployeeContext.currentOrganizationPublicId,
          answerOrganizationSnapshot: createAnswerOrganizationSnapshot(
            normalizedEmployeeContext,
            savedAt,
          ),
          answerStatus: "in_progress",
          answeredQuestionCount,
          scoreSummary: null,
          savedAt,
          submittedAt: null,
          formalWritePolicy: createFormalWritePolicy(),
        }),
      };
    },

    async submitEmployeeAnswer(command) {
      const normalizedEmployeeContext = normalizeEmployeeContext(
        command.employeeContext,
      );
      if (normalizedEmployeeContext === null) {
        return createEmployeeAnswerBlockedResult("invalid_employee_context");
      }

      const contextBlockedReason = getEmployeeContextBlockedReason(
        normalizedEmployeeContext.authorizationContext,
      );
      if (contextBlockedReason !== null) {
        return createEmployeeAnswerBlockedResult(contextBlockedReason);
      }

      if (
        !isVersionVisibleToEmployee(command.version, normalizedEmployeeContext)
      ) {
        return createEmployeeAnswerBlockedResult("version_not_visible");
      }

      if (!isVersionAnswerable(command.version)) {
        return createEmployeeAnswerBlockedResult("version_not_answerable");
      }

      if (isSubmittedAnswer(command.existingAnswer)) {
        return createEmployeeAnswerBlockedResult("already_submitted");
      }

      const trainingVersionPublicId = normalizeAnswerTrainingVersionPublicId(
        command.answerInput.trainingVersionPublicId,
        command.version,
      );
      const answeredQuestionCount = normalizeAnsweredQuestionCount(
        command.answerInput.answeredQuestionCount,
        command.version,
      );

      if (
        trainingVersionPublicId === null ||
        answeredQuestionCount === null ||
        !isScoreSummaryValid(command.answerInput.scoreSummary, command.version)
      ) {
        return createEmployeeAnswerBlockedResult("invalid_answer_input");
      }

      const submittedAt = clock.now().toISOString();

      return {
        success: true,
        answer: await trainingStore.submitEmployeeAnswer({
          contentType: "organization_training_answer_record",
          trainingVersionPublicId,
          employeePublicId: normalizedEmployeeContext.employeePublicId,
          organizationPublicId:
            normalizedEmployeeContext.currentOrganizationPublicId,
          answerOrganizationSnapshot: createAnswerOrganizationSnapshot(
            normalizedEmployeeContext,
            submittedAt,
          ),
          answerStatus: "submitted",
          answeredQuestionCount,
          scoreSummary: {
            score: command.answerInput.scoreSummary.score,
            totalScore: command.answerInput.scoreSummary.totalScore,
          },
          submittedAt,
          formalWritePolicy: createFormalWritePolicy(),
        }),
      };
    },

    async getEmployeeAnswerReadonlySummary(command) {
      const normalizedEmployeeContext = normalizeEmployeeContext(
        command.employeeContext,
      );
      if (normalizedEmployeeContext === null) {
        return createEmployeeAnswerBlockedResult("invalid_employee_context");
      }

      const contextBlockedReason = getEmployeeContextBlockedReason(
        normalizedEmployeeContext.authorizationContext,
      );
      if (contextBlockedReason !== null) {
        return createEmployeeAnswerBlockedResult(contextBlockedReason);
      }

      if (
        !isVersionVisibleToEmployee(command.version, normalizedEmployeeContext)
      ) {
        return createEmployeeAnswerBlockedResult("version_not_visible");
      }

      if (
        command.existingAnswer === null ||
        !isOwnAnswer(
          command.existingAnswer,
          normalizedEmployeeContext,
          command.version,
        ) ||
        command.existingAnswer.scoreSummary === null ||
        command.existingAnswer.submittedAt === null
      ) {
        return createEmployeeAnswerBlockedResult("history_not_visible");
      }

      return {
        success: true,
        answer: createReadonlyAnswerSummary(command.existingAnswer),
      };
    },
  };
}
