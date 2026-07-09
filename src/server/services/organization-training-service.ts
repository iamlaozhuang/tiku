import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  EmployeeOrganizationTrainingAnswerItemDto,
  EmployeeOrganizationTrainingAnswerDto,
  EmployeeOrganizationTrainingQuestionResultDto,
  EmployeeOrganizationTrainingScoreSummaryDto,
  OrganizationTrainingAdminDetailDto,
  OrganizationTrainingAdminLifecycleFlowDto,
  OrganizationTrainingAdminLifecycleContentKind,
  OrganizationTrainingAdminLifecycleItemDto,
  OrganizationTrainingAdminPublishedVersionDetailDto,
  OrganizationTrainingAdminLifecycleSourceKind,
  OrganizationTrainingAdminLifecycleSourceMetadataDto,
  OrganizationTrainingAdminPaperSectionDetailDto,
  OrganizationTrainingAdminQuestionDetailDto,
  OrganizationTrainingAuditLogRedactedReferencePolicyDto,
  OrganizationTrainingEmployeeAnswerLifecycleFlowDto,
  OrganizationTrainingEmployeeAnswerLifecycleItemDto,
  OrganizationTrainingAuditLogReferenceDto,
  OrganizationTrainingDraftDto,
  OrganizationTrainingPublishedVersionDto,
  OrganizationTrainingScopeSnapshotDto,
  OrganizationTrainingSourceContextAttachmentDto,
  OrganizationTrainingSourceContextDto,
  OrganizationTrainingSourceContextUsageDto,
} from "../contracts/organization-training-contract";
import { professionValues, type Profession } from "../models/auth";
import {
  organizationTrainingAuditLogTargetResourceTypeValues,
  type OrganizationTrainingAuditLogReferenceInput,
  type OrganizationTrainingCopyToNewDraftInput,
  organizationTrainingQuestionTypeValues,
  type OrganizationTrainingPublishInput,
  type OrganizationTrainingPublishQuestionInput,
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
const ORGANIZATION_TRAINING_ADMIN_DETAIL_SCOPE_DENIED_CODE = 403092;

const organizationTrainingAdminDetailScopeDeniedMessage =
  "Organization training detail organization scope is denied.";

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

export function buildOrganizationTrainingAuditLogRedactedReferencePolicyReadModel(
  input?: unknown,
): ApiResponse<OrganizationTrainingAuditLogRedactedReferencePolicyDto> {
  void input;

  return createSuccessResponse({
    targetResourceTypes: [
      ...organizationTrainingAuditLogTargetResourceTypeValues,
    ],
    referenceStatus: "redacted_reference",
    redactionStatus: "redacted",
    exposeRawPayload: false,
    exposeRawPrompt: false,
    exposeRawAnswer: false,
    exposeProviderPayload: false,
    exposeRowData: false,
    exposePrivateData: false,
  });
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
  | "organization_scope_denied"
  | "insufficient_evidence"
  | "weak_evidence_confirmation_required";

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
  sourceTaskPublicId?: string | null;
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

export type OrganizationTrainingAdminLifecycleFlowReadModelInput = {
  adminContext: OrganizationTrainingAdminContext;
  drafts: readonly OrganizationTrainingDraftDto[];
  versions: readonly OrganizationTrainingPublishedVersionDto[];
  sourceMetadata?: readonly OrganizationTrainingAdminLifecycleSourceMetadataDto[];
  query?: OrganizationTrainingAdminLifecycleQuery;
};

export type OrganizationTrainingAdminDetailReadModelInput =
  | {
      adminContext: OrganizationTrainingAdminContext;
      version: OrganizationTrainingAdminPublishedVersionDetailDto;
      sourceMetadata?: OrganizationTrainingAdminLifecycleSourceMetadataDto | null;
    }
  | {
      adminContext: OrganizationTrainingAdminContext;
      draft: OrganizationTrainingDraftDto;
      draftQuestions?: readonly OrganizationTrainingAdminQuestionDetailDto[];
      draftPaperSections?: readonly OrganizationTrainingAdminPaperSectionDetailDto[];
      sourceMetadata?: OrganizationTrainingAdminLifecycleSourceMetadataDto | null;
    };

export const organizationTrainingAdminLifecycleStatusFilterValues = [
  "all",
  "draft",
  "published",
  "taken_down",
] as const;

export const organizationTrainingAdminLifecycleSourceKindFilterValues = [
  "all",
  "ai_question",
  "ai_paper",
  "platform_paper",
  "manual_group",
  "unknown",
] as const;

export const organizationTrainingAdminLifecycleContentKindFilterValues = [
  "all",
  "question_training",
  "paper_training",
  "unknown",
] as const;

export type OrganizationTrainingAdminLifecycleStatusFilter =
  (typeof organizationTrainingAdminLifecycleStatusFilterValues)[number];

export type OrganizationTrainingAdminLifecycleSourceKindFilter =
  (typeof organizationTrainingAdminLifecycleSourceKindFilterValues)[number];

export type OrganizationTrainingAdminLifecycleContentKindFilter =
  (typeof organizationTrainingAdminLifecycleContentKindFilterValues)[number];

export type OrganizationTrainingAdminLifecycleQuery = {
  page: number;
  pageSize: number;
  status: OrganizationTrainingAdminLifecycleStatusFilter;
  sourceKind: OrganizationTrainingAdminLifecycleSourceKindFilter;
  contentKind: OrganizationTrainingAdminLifecycleContentKindFilter;
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
  questionSnapshot: OrganizationTrainingPublishQuestionInput[];
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
  answerItems: EmployeeOrganizationTrainingAnswerItemDto[];
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
  answerItems: EmployeeOrganizationTrainingAnswerItemDto[];
  questionResults: EmployeeOrganizationTrainingQuestionResultDto[];
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

export type OrganizationTrainingSourceContextUsageReadModelInput = {
  draftPublicId: string;
  organizationPublicId: string;
  sourceContexts: readonly OrganizationTrainingSourceContextInput[];
};

export type OrganizationTrainingListEmployeeVisibleVersionsCommand = {
  employeeContext: OrganizationTrainingEmployeeContext;
  sourceVersions: readonly OrganizationTrainingPublishedVersionDto[];
};

export type OrganizationTrainingEmployeeAnswerLifecycleFlowReadModelInput = {
  employeeContext: OrganizationTrainingEmployeeContext;
  versions: readonly OrganizationTrainingPublishedVersionDto[];
  answers: readonly EmployeeOrganizationTrainingAnswerDto[];
};

export type OrganizationTrainingEmployeeAnswerDraftInput = {
  trainingVersionPublicId: string;
  answeredQuestionCount: number;
  answerItems?: EmployeeOrganizationTrainingAnswerItemDto[];
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

function normalizeAdminLifecycleQuery(
  query: OrganizationTrainingAdminLifecycleQuery | undefined,
): OrganizationTrainingAdminLifecycleQuery {
  return {
    page: Math.max(1, Math.floor(query?.page ?? 1)),
    pageSize: Math.min(50, Math.max(1, Math.floor(query?.pageSize ?? 10))),
    status: query?.status ?? "all",
    sourceKind: query?.sourceKind ?? "all",
    contentKind: query?.contentKind ?? "all",
  };
}

function buildSourceMetadataMap(
  sourceMetadata:
    | readonly OrganizationTrainingAdminLifecycleSourceMetadataDto[]
    | undefined,
): Map<string, OrganizationTrainingAdminLifecycleSourceMetadataDto> {
  return new Map(
    (sourceMetadata ?? []).map((metadata) => [
      metadata.draftPublicId,
      metadata,
    ]),
  );
}

function resolveLifecycleSourceAndContentKind(
  metadata: OrganizationTrainingAdminLifecycleSourceMetadataDto | null,
  fallbackSourceTaskPublicId: string | null,
  options: { allowManualFallback: boolean } = { allowManualFallback: true },
): {
  sourceKind: OrganizationTrainingAdminLifecycleSourceKind;
  contentKind: OrganizationTrainingAdminLifecycleContentKind;
} {
  if (metadata === null) {
    return options.allowManualFallback && fallbackSourceTaskPublicId === null
      ? { sourceKind: "manual_group", contentKind: "question_training" }
      : { sourceKind: "unknown", contentKind: "unknown" };
  }

  if (metadata.sourceType === "organization_ai_result") {
    if (metadata.generationKind === "question") {
      return { sourceKind: "ai_question", contentKind: "question_training" };
    }

    if (metadata.generationKind === "paper") {
      return { sourceKind: "ai_paper", contentKind: "paper_training" };
    }

    return { sourceKind: "unknown", contentKind: "unknown" };
  }

  if (metadata.sourceType === "paper") {
    return { sourceKind: "platform_paper", contentKind: "paper_training" };
  }

  if (
    metadata.sourceType === null &&
    metadata.sourceTaskPublicId === null &&
    metadata.sourceVersionPublicId === null
  ) {
    return { sourceKind: "manual_group", contentKind: "question_training" };
  }

  return { sourceKind: "unknown", contentKind: "unknown" };
}

function buildDraftLifecycleItem(
  draft: OrganizationTrainingDraftDto,
  sourceMetadataMap: ReadonlyMap<
    string,
    OrganizationTrainingAdminLifecycleSourceMetadataDto
  >,
): OrganizationTrainingAdminLifecycleItemDto {
  const kind = resolveLifecycleSourceAndContentKind(
    sourceMetadataMap.get(draft.publicId) ?? null,
    draft.sourceTaskPublicId,
  );

  return {
    publicId: draft.publicId,
    resourceType: "organization_training_draft",
    organizationPublicId: draft.organizationPublicId,
    authorizationPublicId: draft.authorizationPublicId,
    profession: draft.profession,
    level: draft.level,
    subject: draft.subject,
    title: draft.title,
    description: draft.description,
    questionCount: draft.questionCount,
    totalScore: draft.totalScore,
    questionTypeSummary: copyQuestionTypeSummary(draft.questionTypeSummary),
    status: "draft",
    sourceKind: kind.sourceKind,
    contentKind: kind.contentKind,
    availableActions: ["publish"],
  };
}

function buildVersionLifecycleItem(
  version: OrganizationTrainingPublishedVersionDto,
  sourceMetadataMap: ReadonlyMap<
    string,
    OrganizationTrainingAdminLifecycleSourceMetadataDto
  >,
): OrganizationTrainingAdminLifecycleItemDto {
  const availableActions =
    version.status === "published"
      ? (["take_down", "copy_to_new_draft"] as const)
      : (["copy_to_new_draft"] as const);
  const kind = resolveLifecycleSourceAndContentKind(
    sourceMetadataMap.get(version.draftPublicId) ?? null,
    null,
    { allowManualFallback: false },
  );

  return {
    publicId: version.publicId,
    resourceType: "organization_training_version",
    organizationPublicId: version.organizationPublicId,
    profession: version.profession,
    level: version.level,
    subject: version.subject,
    title: version.title,
    description: version.description,
    questionCount: version.questionCount,
    totalScore: version.totalScore,
    status: version.status,
    sourceKind: kind.sourceKind,
    contentKind: kind.contentKind,
    availableActions: [...availableActions],
  };
}

function matchesAdminLifecycleQuery(
  item: OrganizationTrainingAdminLifecycleItemDto,
  query: OrganizationTrainingAdminLifecycleQuery,
): boolean {
  const statusMatches = query.status === "all" || item.status === query.status;
  const sourceMatches =
    query.sourceKind === "all" || item.sourceKind === query.sourceKind;
  const contentMatches =
    query.contentKind === "all" || item.contentKind === query.contentKind;

  return statusMatches && sourceMatches && contentMatches;
}

export function buildOrganizationTrainingAdminLifecycleFlowReadModel(
  input: OrganizationTrainingAdminLifecycleFlowReadModelInput,
): ApiResponse<OrganizationTrainingAdminLifecycleFlowDto> {
  const query = normalizeAdminLifecycleQuery(input.query);
  const sourceMetadataMap = buildSourceMetadataMap(input.sourceMetadata);
  const draftItems = input.drafts
    .filter((draft) =>
      isOrganizationVisibleToAdmin(
        draft.organizationPublicId,
        input.adminContext,
      ),
    )
    .map((draft) => buildDraftLifecycleItem(draft, sourceMetadataMap));
  const versionItems = input.versions
    .filter((version) =>
      isOrganizationVisibleToAdmin(
        version.organizationPublicId,
        input.adminContext,
      ),
    )
    .map((version) => buildVersionLifecycleItem(version, sourceMetadataMap));
  const filteredItems = [...draftItems, ...versionItems].filter((item) =>
    matchesAdminLifecycleQuery(item, query),
  );
  const startIndex = (query.page - 1) * query.pageSize;

  return createPaginatedResponse(
    {
      items: filteredItems.slice(startIndex, startIndex + query.pageSize),
      redactionStatus: "metadata_only",
    },
    {
      page: query.page,
      pageSize: query.pageSize,
      total: filteredItems.length,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  );
}

function buildQuestionTypeSummaryFromAdminDetailQuestions(
  questions: readonly OrganizationTrainingAdminPublishedVersionDetailDto["questions"][number][],
): OrganizationTrainingQuestionTypeSummary {
  return questions.reduce((summary, question) => {
    if (question.questionType === "single_choice") {
      return { ...summary, singleChoice: summary.singleChoice + 1 };
    }

    if (question.questionType === "multi_choice") {
      return { ...summary, multiChoice: summary.multiChoice + 1 };
    }

    if (question.questionType === "true_false") {
      return { ...summary, trueFalse: summary.trueFalse + 1 };
    }

    if (question.questionType === "short_answer") {
      return { ...summary, shortAnswer: summary.shortAnswer + 1 };
    }

    return summary;
  }, createEmptyQuestionTypeSummary());
}

function copyAdminDetailQuestions(
  questions: readonly OrganizationTrainingAdminPublishedVersionDetailDto["questions"][number][],
): OrganizationTrainingAdminPublishedVersionDetailDto["questions"] {
  return questions.map((question) => ({
    publicId: question.publicId,
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    materialTitle: question.materialTitle,
    materialContent: question.materialContent,
    stem: question.stem,
    options: question.options.map((option) => ({ ...option })),
    score: question.score,
    evidenceSummary: {
      evidenceStatus: question.evidenceSummary.evidenceStatus,
      citationCount: question.evidenceSummary.citationCount,
    },
    answerAndAnalysis: {
      visibility: "collapsed_by_default",
      standardAnswer: question.answerAndAnalysis.standardAnswer,
      analysis: question.answerAndAnalysis.analysis,
    },
  }));
}

function copyAdminPaperSections(
  paperSections:
    | readonly OrganizationTrainingAdminPaperSectionDetailDto[]
    | undefined,
): OrganizationTrainingAdminPaperSectionDetailDto[] {
  return (paperSections ?? []).map((paperSection) => ({
    sectionKey: paperSection.sectionKey,
    title: paperSection.title,
    questionType: paperSection.questionType,
    targetQuestionCount: paperSection.targetQuestionCount,
    selectedQuestionCount: paperSection.selectedQuestionCount,
    totalScore: paperSection.totalScore,
    questions: copyAdminDetailQuestions(paperSection.questions),
  }));
}

export function buildOrganizationTrainingAdminDetailReadModel(
  input: OrganizationTrainingAdminDetailReadModelInput,
): ApiResponse<OrganizationTrainingAdminDetailDto | null> {
  const organizationPublicId =
    "version" in input
      ? input.version.organizationPublicId
      : input.draft.organizationPublicId;

  if (!isOrganizationVisibleToAdmin(organizationPublicId, input.adminContext)) {
    return createErrorResponse(
      ORGANIZATION_TRAINING_ADMIN_DETAIL_SCOPE_DENIED_CODE,
      organizationTrainingAdminDetailScopeDeniedMessage,
    );
  }

  if ("draft" in input) {
    const kind = resolveLifecycleSourceAndContentKind(
      input.sourceMetadata ?? null,
      input.draft.sourceTaskPublicId,
    );
    const draftQuestions =
      input.draftQuestions === undefined
        ? []
        : copyAdminDetailQuestions(input.draftQuestions);
    const draftPaperSections = copyAdminPaperSections(input.draftPaperSections);

    if (draftQuestions.length > 0) {
      return createSuccessResponse({
        publicId: input.draft.publicId,
        resourceType: "organization_training_draft",
        detailAvailability: "available",
        organizationPublicId: input.draft.organizationPublicId,
        title: input.draft.title,
        description: input.draft.description,
        profession: input.draft.profession,
        level: input.draft.level,
        subject: input.draft.subject,
        status: "draft",
        sourceKind: kind.sourceKind,
        contentKind: kind.contentKind,
        structure: {
          questionCount: draftQuestions.length,
          totalScore: draftQuestions.reduce(
            (totalScore, question) => totalScore + question.score,
            0,
          ),
          questionTypeSummary:
            buildQuestionTypeSummaryFromAdminDetailQuestions(draftQuestions),
        },
        questions: draftQuestions,
        ...(draftPaperSections.length === 0
          ? {}
          : { paperSections: draftPaperSections }),
        redactionStatus: "admin_safe_detail",
      });
    }

    return createSuccessResponse({
      publicId: input.draft.publicId,
      resourceType: "organization_training_draft",
      detailAvailability: "unavailable",
      unavailableReason: "draft_snapshot_unavailable",
      organizationPublicId: input.draft.organizationPublicId,
      title: input.draft.title,
      description: input.draft.description,
      profession: input.draft.profession,
      level: input.draft.level,
      subject: input.draft.subject,
      status: "draft",
      sourceKind: kind.sourceKind,
      contentKind: kind.contentKind,
      recommendedAction: "continue_configuration",
      redactionStatus: "metadata_only",
    });
  }

  const kind = resolveLifecycleSourceAndContentKind(
    input.sourceMetadata ?? null,
    null,
    { allowManualFallback: false },
  );
  const questions = copyAdminDetailQuestions(input.version.questions);
  const paperSections = copyAdminPaperSections(input.version.paperSections);

  return createSuccessResponse({
    publicId: input.version.publicId,
    resourceType: "organization_training_version",
    detailAvailability: "available",
    organizationPublicId: input.version.organizationPublicId,
    title: input.version.title,
    description: input.version.description,
    profession: input.version.profession,
    level: input.version.level,
    subject: input.version.subject,
    status: input.version.status,
    sourceKind: kind.sourceKind,
    contentKind: kind.contentKind,
    structure: {
      questionCount: input.version.questionCount,
      totalScore: input.version.totalScore,
      questionTypeSummary:
        buildQuestionTypeSummaryFromAdminDetailQuestions(questions),
    },
    questions,
    ...(paperSections.length === 0 ? {} : { paperSections }),
    redactionStatus: "admin_safe_detail",
  });
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

function isFirstReleaseOrganizationTrainingSourceContextType(
  value: unknown,
): value is OrganizationTrainingSourceContextType {
  return (
    isOrganizationTrainingSourceContextType(value) && value !== "mock_exam"
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

function normalizeAnswerItemList(
  answerItems: OrganizationTrainingEmployeeAnswerDraftInput["answerItems"],
  version: OrganizationTrainingPublishedVersionDto,
): EmployeeOrganizationTrainingAnswerItemDto[] | null {
  if (answerItems === undefined) {
    return [];
  }

  if (!Array.isArray(answerItems)) {
    return null;
  }

  const allowedQuestionPublicIds =
    version.questions === undefined
      ? null
      : new Set(version.questions.map((question) => question.publicId));

  const normalizedAnswerItems = answerItems.map((answerItem) => {
    const questionPublicId = normalizeRequiredText(answerItem.questionPublicId);
    const selectedOptionPublicIds = Array.isArray(
      answerItem.selectedOptionPublicIds,
    )
      ? [
          ...new Set(
            answerItem.selectedOptionPublicIds
              .map(normalizeRequiredText)
              .filter((publicId): publicId is string => publicId !== null),
          ),
        ]
      : null;

    if (
      questionPublicId === null ||
      selectedOptionPublicIds === null ||
      (allowedQuestionPublicIds !== null &&
        !allowedQuestionPublicIds.has(questionPublicId))
    ) {
      return null;
    }

    return {
      questionPublicId,
      selectedOptionPublicIds,
      textAnswer: normalizeOptionalText(answerItem.textAnswer),
    };
  });

  if (normalizedAnswerItems.some((answerItem) => answerItem === null)) {
    return null;
  }

  return normalizedAnswerItems as EmployeeOrganizationTrainingAnswerItemDto[];
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

function findOwnEmployeeAnswerForVersion(
  version: OrganizationTrainingPublishedVersionDto,
  employeeContext: NormalizedEmployeeContext,
  answers: readonly EmployeeOrganizationTrainingAnswerDto[],
): EmployeeOrganizationTrainingAnswerDto | null {
  return (
    answers.find((answer) => isOwnAnswer(answer, employeeContext, version)) ??
    null
  );
}

function buildEmployeeAnswerLifecycleItem(
  version: OrganizationTrainingPublishedVersionDto,
  answer: EmployeeOrganizationTrainingAnswerDto | null,
): OrganizationTrainingEmployeeAnswerLifecycleItemDto | null {
  if (answer === null) {
    if (!isVersionAnswerable(version)) {
      return null;
    }

    return {
      trainingVersionPublicId: version.publicId,
      organizationPublicId: version.organizationPublicId,
      title: version.title,
      versionStatus: version.status,
      answerStatus: "not_started",
      availableActions: ["start_answer"],
      resultSummaryVisible: false,
    };
  }

  if (answer.answerStatus === "in_progress") {
    if (!isVersionAnswerable(version)) {
      return null;
    }

    return {
      trainingVersionPublicId: version.publicId,
      organizationPublicId: version.organizationPublicId,
      title: version.title,
      versionStatus: version.status,
      answerStatus: "in_progress",
      availableActions: ["continue_answer", "submit_answer"],
      resultSummaryVisible: false,
    };
  }

  if (answer.answerStatus === "submitted" && isVersionAnswerable(version)) {
    return {
      trainingVersionPublicId: version.publicId,
      organizationPublicId: version.organizationPublicId,
      title: version.title,
      versionStatus: version.status,
      answerStatus: "submitted",
      availableActions: ["view_result"],
      resultSummaryVisible: true,
    };
  }

  if (isSubmittedAnswer(answer)) {
    return {
      trainingVersionPublicId: version.publicId,
      organizationPublicId: version.organizationPublicId,
      title: version.title,
      versionStatus: version.status,
      answerStatus: "read_only",
      availableActions: ["view_result"],
      resultSummaryVisible: true,
    };
  }

  return null;
}

export function buildOrganizationTrainingEmployeeAnswerLifecycleFlowReadModel(
  input: OrganizationTrainingEmployeeAnswerLifecycleFlowReadModelInput,
): ApiResponse<OrganizationTrainingEmployeeAnswerLifecycleFlowDto> {
  const normalizedEmployeeContext = normalizeEmployeeContext(
    input.employeeContext,
  );

  if (
    normalizedEmployeeContext === null ||
    getEmployeeContextBlockedReason(
      normalizedEmployeeContext.authorizationContext,
    ) !== null
  ) {
    return createSuccessResponse({
      items: [],
      redactionStatus: "metadata_only",
    });
  }

  const items = input.versions
    .filter((version) =>
      isVersionVisibleToEmployee(version, normalizedEmployeeContext),
    )
    .map((version) =>
      buildEmployeeAnswerLifecycleItem(
        version,
        findOwnEmployeeAnswerForVersion(
          version,
          normalizedEmployeeContext,
          input.answers,
        ),
      ),
    )
    .filter(
      (item): item is OrganizationTrainingEmployeeAnswerLifecycleItemDto =>
        item !== null,
    );

  return createSuccessResponse({
    items,
    redactionStatus: "metadata_only",
  });
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
      isPositiveInteger(question.sequenceNumber) &&
      isOrganizationTrainingQuestionType(question.questionType) &&
      normalizeRequiredText(question.stem) !== null &&
      Array.isArray(question.options) &&
      question.options.every(
        (option) =>
          normalizeRequiredText(option.publicId) !== null &&
          normalizeRequiredText(option.label) !== null &&
          normalizeRequiredText(option.content) !== null,
      ) &&
      (question.questionType === "short_answer" ||
        question.options.length > 0) &&
      isPositiveInteger(question.score) &&
      normalizeRequiredText(question.standardAnswer) !== null &&
      normalizeRequiredText(question.analysisSummary) !== null &&
      (question.evidenceStatus === "sufficient" ||
        question.evidenceStatus === "weak" ||
        question.evidenceStatus === "none") &&
      isNonNegativeInteger(question.citationCount),
  );
}

function hasNoEvidenceQuestion(
  publishInput: OrganizationTrainingPublishInput,
): boolean {
  return publishInput.questions.some(
    (question) => question.evidenceStatus === "none",
  );
}

function hasUnconfirmedWeakEvidenceQuestion(
  publishInput: OrganizationTrainingPublishInput,
): boolean {
  return (
    publishInput.weakEvidenceConfirmed !== true &&
    publishInput.questions.some(
      (question) => question.evidenceStatus === "weak",
    )
  );
}

function copyPublishQuestionSnapshot(
  question: OrganizationTrainingPublishInput["questions"][number],
): OrganizationTrainingPublishQuestionInput {
  return {
    publicId: question.publicId,
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    materialTitle: normalizeOptionalText(question.materialTitle),
    materialContent: normalizeOptionalText(question.materialContent),
    stem: question.stem,
    options: question.options.map((option) => ({
      publicId: option.publicId,
      label: option.label,
      content: option.content,
    })),
    score: question.score,
    standardAnswer: question.standardAnswer,
    analysisSummary: question.analysisSummary,
    evidenceStatus: question.evidenceStatus,
    citationCount: question.citationCount,
  };
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
    !isFirstReleaseOrganizationTrainingSourceContextType(
      sourceContext.sourceType,
    ) ||
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

export function buildOrganizationTrainingSourceContextUsageReadModel(
  input: OrganizationTrainingSourceContextUsageReadModelInput,
): ApiResponse<OrganizationTrainingSourceContextUsageDto | null> {
  const draftPublicId = normalizeRequiredText(input.draftPublicId);
  const organizationPublicId = normalizeRequiredText(
    input.organizationPublicId,
  );
  const sourceContexts = normalizeSourceContexts(input.sourceContexts);

  if (
    draftPublicId === null ||
    organizationPublicId === null ||
    sourceContexts === null
  ) {
    return createSuccessResponse(null);
  }

  return createSuccessResponse({
    draftPublicId,
    organizationPublicId,
    sourceContexts,
    formalUsagePolicy: createSourceContextFormalUsagePolicy(),
    redactionStatus: "metadata_only",
  });
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
        sourceTaskPublicId: normalizeOptionalText(
          command.draftInput.sourceTaskPublicId ?? null,
        ),
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

      if (hasNoEvidenceQuestion(publishInput)) {
        return createPublishBlockedResult("insufficient_evidence");
      }

      if (hasUnconfirmedWeakEvidenceQuestion(publishInput)) {
        return createPublishBlockedResult(
          "weak_evidence_confirmation_required",
        );
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
          questionSnapshot: publishInput.questions.map(
            copyPublishQuestionSnapshot,
          ),
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
      const answerItems = normalizeAnswerItemList(
        command.answerInput.answerItems,
        command.version,
      );

      if (
        trainingVersionPublicId === null ||
        answeredQuestionCount === null ||
        answerItems === null
      ) {
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
          answerItems,
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
      const answerItems = normalizeAnswerItemList(
        command.answerInput.answerItems,
        command.version,
      );

      if (
        trainingVersionPublicId === null ||
        answeredQuestionCount === null ||
        answerItems === null ||
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
          answerItems,
          questionResults: [],
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
