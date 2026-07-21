import { createHash } from "node:crypto";

import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import { isOrganizationTrainingPersistenceConflictError } from "../contracts/organization-training-persistence-contract";
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
  OrganizationTrainingAdminLifecyclePageResult,
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
  OrganizationTrainingVersionListIntegrityStatus,
  OrganizationTrainingVersionListWarningCode,
} from "../contracts/organization-training-contract";
import { professionValues, type Profession } from "../models/auth";
import {
  organizationTrainingAuditLogTargetResourceTypeValues,
  type OrganizationTrainingAuditLogReferenceInput,
  type OrganizationTrainingCopyToNewDraftInput,
  type OrganizationTrainingDraftQuestionInput,
  type OrganizationTrainingDraftSaveInput,
  organizationTrainingQuestionTypeValues,
  type OrganizationTrainingPublishInput,
  type OrganizationTrainingPublishQuestionInput,
  type OrganizationTrainingQuestionTypeSummary,
  type OrganizationTrainingSourceContextType,
  organizationTrainingSourceContextTypeValues,
  type OrganizationTrainingTakedownInput,
} from "../models/organization-training";
import { subjectValues, type Subject } from "../models/paper";
import { selectAuthorizationObjectScope } from "./authorization-object-scope";
import {
  invalidOrganizationTrainingAuditLogReferenceInputMessage,
  normalizeOrganizationTrainingAuditLogReferenceInput,
} from "../validators/organization-training";

export const organizationTrainingManualDraftCreationBlockedMessage =
  "Organization training manual draft creation is blocked.";

export const organizationTrainingDraftSaveBlockedMessage =
  "Organization training draft save is blocked.";

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
  | "weak_evidence_confirmation_required"
  | "persistence_conflict";

export type OrganizationTrainingDraftSaveBlockedReason =
  | "invalid_draft_input"
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | "organization_scope_denied"
  | "authorization_scope_mismatch"
  | "draft_not_editable"
  | "stale_revision"
  | "persistence_conflict";

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
  | "answer_deadline_expired"
  | "invalid_answer_input"
  | "already_submitted"
  | "history_not_visible"
  | "persistence_conflict";

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
  authorizationPublicId?: string;
};

export type OrganizationTrainingEmployeeContext = {
  employeePublicId: string;
  currentOrganizationPublicId: string;
  visibleOrganizationPublicIds: readonly string[];
  authorizationContext: EffectiveAuthorizationContextDto;
  authorizationContexts?: readonly EffectiveAuthorizationContextDto[];
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
  integrityStatus?: OrganizationTrainingVersionListIntegrityStatus;
  warningCode?: OrganizationTrainingVersionListWarningCode | null;
};

export type OrganizationTrainingAdminLifecyclePageReadModelInput = {
  adminContext: OrganizationTrainingAdminContext;
  pageResult: OrganizationTrainingAdminLifecyclePageResult;
  query: OrganizationTrainingAdminLifecycleQuery;
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
  pageSize: 20 | 50 | 100;
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
  draftStatus: "draft";
  revision: 1;
  questions: OrganizationTrainingPublishQuestionInput[];
};

export type OrganizationTrainingDraftSaveWrite = {
  draftPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  expectedRevision: number;
  operationId: string;
  payloadDigest: string;
  title: string;
  description: string | null;
  questionCount: number;
  totalScore: number;
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary;
  questions: OrganizationTrainingPublishQuestionInput[];
  evidenceStatus: "sufficient" | "weak" | "none";
  validationStatus: "needs_review";
  savedAt: string;
};

export type OrganizationTrainingDraftStore = {
  createManualDraft(
    draftWrite: OrganizationTrainingManualDraftWrite,
  ): Promise<OrganizationTrainingDraftDto>;
  saveDraft(
    draftWrite: OrganizationTrainingDraftSaveWrite,
  ): Promise<OrganizationTrainingDraftDto>;
};

export type OrganizationTrainingPublishedVersionWrite = Omit<
  OrganizationTrainingPublishedVersionDto,
  "publicId" | "versionNumber" | "answerDeadlineAt"
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
  answerDeadlineAt: string | null;
  expectedDraftRevision: number;
  publishOperationId: string;
  publishPayloadDigest: string;
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
  expectedRevision: number;
  operationId: string;
  payloadDigest: string;
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
  expectedRevision: number;
  operationId: string;
  payloadDigest: string;
  answerStatus: "scoring" | "submitted";
  answeredQuestionCount: number;
  answerItems: EmployeeOrganizationTrainingAnswerItemDto[];
  questionResults: EmployeeOrganizationTrainingQuestionResultDto[];
  scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto | null;
  totalScore: number;
  scoringTask: OrganizationTrainingScoringTaskWrite | null;
  submittedAt: string;
  formalWritePolicy: OrganizationTrainingFormalWritePolicy;
};

export type OrganizationTrainingScoringTaskWrite = {
  publicIdSeed: string;
  idempotencyKeyHash: string;
  maxAttemptCount: 3;
  timeoutSecond: 60;
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  inputSnapshot: Record<string, unknown>;
  authorizationSnapshot: Record<string, unknown>;
  ragSnapshot: Record<string, unknown> | null;
  scheduledAt: string;
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
  draft: OrganizationTrainingDraftDto;
  adminContext: OrganizationTrainingAdminContext;
  authorizationContext: EffectiveAuthorizationContextDto;
  persistenceLineage: OrganizationTrainingPersistenceLineage;
};

export type OrganizationTrainingSaveDraftCommand = {
  adminContext: OrganizationTrainingAdminContext;
  authorizationContext: EffectiveAuthorizationContextDto;
  draft: OrganizationTrainingDraftDto;
  draftInput: OrganizationTrainingDraftSaveInput;
  trustedDraftQuestions?: readonly OrganizationTrainingPublishQuestionInput[];
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
  expectedRevision: number;
  operationId: string;
  answerItems?: EmployeeOrganizationTrainingAnswerItemDto[];
};

export type OrganizationTrainingEmployeeAnswerSubmitInput =
  OrganizationTrainingEmployeeAnswerDraftInput;

export type OrganizationTrainingSaveEmployeeAnswerDraftCommand = {
  employeeContext: OrganizationTrainingEmployeeContext;
  version: OrganizationTrainingPublishedVersionDto;
  answerInput: OrganizationTrainingEmployeeAnswerDraftInput;
  existingAnswer: EmployeeOrganizationTrainingAnswerDto | null;
  canonicalQuestions: readonly OrganizationTrainingPublishQuestionInput[];
};

export type OrganizationTrainingSubmitEmployeeAnswerCommand = {
  employeeContext: OrganizationTrainingEmployeeContext;
  version: OrganizationTrainingPublishedVersionDto;
  answerInput: OrganizationTrainingEmployeeAnswerSubmitInput;
  existingAnswer: EmployeeOrganizationTrainingAnswerDto | null;
  canonicalQuestions: readonly OrganizationTrainingPublishQuestionInput[];
  scoringProvenance: OrganizationTrainingScoringProvenance | null;
};

export type OrganizationTrainingScoringProvenance = {
  modelConfigSnapshot: Record<string, unknown>;
  promptTemplateKey: string;
  promptTemplateVersion: number;
  promptTemplateHash: string;
  ragSnapshot: Record<string, unknown> | null;
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

export type OrganizationTrainingSaveDraftResult =
  | {
      success: true;
      draft: OrganizationTrainingDraftDto;
    }
  | {
      success: false;
      reason: OrganizationTrainingDraftSaveBlockedReason;
      message: typeof organizationTrainingDraftSaveBlockedMessage;
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
  saveDraft(
    command: OrganizationTrainingSaveDraftCommand,
  ): Promise<OrganizationTrainingSaveDraftResult>;
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

function createDraftSaveBlockedResult(
  reason: OrganizationTrainingDraftSaveBlockedReason,
): OrganizationTrainingSaveDraftResult {
  return {
    success: false,
    reason,
    message: organizationTrainingDraftSaveBlockedMessage,
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
    pageSize:
      query?.pageSize === 50 || query?.pageSize === 100 ? query.pageSize : 20,
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
    revision: draft.revision,
    questionCount: draft.questionCount,
    totalScore: draft.totalScore,
    questionTypeSummary: copyQuestionTypeSummary(draft.questionTypeSummary),
    activityAt: draft.createdAt,
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
    activityAt: version.publishedAt,
    status: version.status,
    sourceKind: kind.sourceKind,
    contentKind: kind.contentKind,
    availableActions: [...availableActions],
  };
}

function compareAdminLifecycleItems(
  leftItem: OrganizationTrainingAdminLifecycleItemDto,
  rightItem: OrganizationTrainingAdminLifecycleItemDto,
): number {
  const activityOrder = rightItem.activityAt.localeCompare(leftItem.activityAt);

  if (activityOrder !== 0) {
    return activityOrder;
  }

  const resourceTypeOrder = leftItem.resourceType.localeCompare(
    rightItem.resourceType,
  );

  return resourceTypeOrder !== 0
    ? resourceTypeOrder
    : leftItem.publicId.localeCompare(rightItem.publicId);
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
    .filter(
      (draft) =>
        draft.draftStatus === undefined || draft.draftStatus === "draft",
    )
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
  const filteredItems = [...draftItems, ...versionItems]
    .filter((item) => matchesAdminLifecycleQuery(item, query))
    .sort(compareAdminLifecycleItems);
  const startIndex = (query.page - 1) * query.pageSize;

  return createPaginatedResponse(
    {
      items: filteredItems.slice(startIndex, startIndex + query.pageSize),
      redactionStatus: "metadata_only",
      integrityStatus: input.integrityStatus ?? "complete",
      warningCode: input.warningCode ?? null,
    },
    {
      page: query.page,
      pageSize: query.pageSize,
      total: filteredItems.length,
      sortBy: "activityAt",
      sortOrder: "desc",
    },
  );
}

export function buildOrganizationTrainingAdminLifecyclePageReadModel(
  input: OrganizationTrainingAdminLifecyclePageReadModelInput,
): ApiResponse<OrganizationTrainingAdminLifecycleFlowDto> {
  const query = normalizeAdminLifecycleQuery(input.query);
  const visibleItems = input.pageResult.items.filter((item) =>
    isOrganizationVisibleToAdmin(item.organizationPublicId, input.adminContext),
  );

  return createPaginatedResponse(
    {
      items: visibleItems,
      redactionStatus: "metadata_only",
      integrityStatus: input.pageResult.integrityStatus,
      warningCode: input.pageResult.warningCode,
    },
    {
      page: query.page,
      pageSize: query.pageSize,
      total: input.pageResult.total,
      sortBy: "activityAt",
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
        revision: input.draft.revision,
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
      revision: input.draft.revision,
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

export function createCanonicalOrganizationTrainingDraftQuestions(
  questions: readonly OrganizationTrainingDraftQuestionInput[],
  trustedQuestions: readonly OrganizationTrainingPublishQuestionInput[] = [],
): OrganizationTrainingPublishQuestionInput[] {
  const trustedQuestionsByPublicId = new Map(
    trustedQuestions.map((question) => [question.publicId, question]),
  );

  return questions.map((question) => {
    const trustedQuestion = trustedQuestionsByPublicId.get(question.publicId);
    const hasUnchangedTrustedContent =
      trustedQuestion !== undefined &&
      createPayloadDigest(createDraftQuestionIntegrityPayload(question)) ===
        createPayloadDigest(
          createDraftQuestionIntegrityPayload(trustedQuestion),
        );

    return {
      ...question,
      ...(question.paperSectionKey !== undefined &&
      question.paperSectionTitle !== undefined &&
      question.paperSectionSortOrder !== undefined &&
      question.questionSortOrder !== undefined
        ? {
            paperSectionKey: question.paperSectionKey,
            paperSectionTitle: question.paperSectionTitle,
            paperSectionSortOrder: question.paperSectionSortOrder,
            questionSortOrder: question.questionSortOrder,
          }
        : {}),
      options: question.options.map((option) => ({ ...option })),
      evidenceStatus: hasUnchangedTrustedContent
        ? trustedQuestion.evidenceStatus
        : "weak",
      citationCount: hasUnchangedTrustedContent
        ? trustedQuestion.citationCount
        : 0,
    };
  });
}

function createDraftQuestionIntegrityPayload(
  question:
    | OrganizationTrainingDraftQuestionInput
    | OrganizationTrainingPublishQuestionInput,
) {
  return {
    publicId: question.publicId,
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    paperSectionKey: question.paperSectionKey ?? null,
    paperSectionTitle: question.paperSectionTitle ?? null,
    paperSectionSortOrder: question.paperSectionSortOrder ?? null,
    questionSortOrder: question.questionSortOrder ?? null,
    materialTitle: question.materialTitle,
    materialContent: question.materialContent,
    stem: question.stem,
    options: question.options.map((option) => ({
      publicId: option.publicId,
      label: option.label,
      content: option.content,
    })),
    score: question.score,
    standardAnswer: question.standardAnswer,
    analysisSummary: question.analysisSummary,
  };
}

function resolveDraftEvidenceStatus(
  questions: readonly OrganizationTrainingPublishQuestionInput[],
): "sufficient" | "weak" | "none" {
  if (
    questions.length === 0 ||
    questions.some((question) => question.evidenceStatus === "none")
  ) {
    return "none";
  }

  return questions.some((question) => question.evidenceStatus === "weak")
    ? "weak"
    : "sufficient";
}

export type OrganizationTrainingAnswerEvaluation = {
  answeredQuestionCount: number;
  answerStatus: "in_progress" | "scoring" | "submitted";
  answerItems: EmployeeOrganizationTrainingAnswerItemDto[];
  questionResults: EmployeeOrganizationTrainingQuestionResultDto[];
  scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto | null;
  objectiveScore: number;
  totalScore: number;
  requiresAiScoring: boolean;
};

function normalizeStandardAnswerTokens(
  question: OrganizationTrainingPublishQuestionInput,
): string[] | null {
  const rawValue = normalizeRequiredText(question.standardAnswer);

  if (rawValue === null) {
    return null;
  }

  let tokens: string[];

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    tokens = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [rawValue];
  } catch {
    tokens = rawValue.split(/[,，;；|]/u);
  }

  const normalizedTokens = tokens
    .map((token) => token.trim().toLocaleLowerCase())
    .filter((token) => token.length > 0);
  const optionByReference = new Map<string, string>();

  for (const option of question.options) {
    optionByReference.set(option.publicId.toLocaleLowerCase(), option.publicId);
    optionByReference.set(
      option.label.trim().toLocaleLowerCase(),
      option.publicId,
    );
  }

  if (
    normalizedTokens.length === 1 &&
    question.questionType === "multi_choice" &&
    normalizedTokens[0]!.length > 1
  ) {
    const splitLabels = [...normalizedTokens[0]!];

    if (splitLabels.every((label) => optionByReference.has(label))) {
      normalizedTokens.splice(0, 1, ...splitLabels);
    }
  }

  const optionPublicIds = normalizedTokens.map((token) =>
    optionByReference.get(token),
  );

  return optionPublicIds.some((publicId) => publicId === undefined)
    ? null
    : [...new Set(optionPublicIds as string[])].sort();
}

function areStringSetsEqual(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    [...left].sort().every((value, index) => value === [...right].sort()[index])
  );
}

export function evaluateOrganizationTrainingAnswer(input: {
  questions: readonly OrganizationTrainingPublishQuestionInput[];
  answerItems: readonly EmployeeOrganizationTrainingAnswerItemDto[];
  requireComplete: boolean;
}): OrganizationTrainingAnswerEvaluation | null {
  const questionByPublicId = new Map<
    string,
    OrganizationTrainingPublishQuestionInput
  >(input.questions.map((question) => [question.publicId, question]));
  const answerItemByQuestionPublicId = new Map<
    string,
    EmployeeOrganizationTrainingAnswerItemDto
  >();

  for (const answerItem of input.answerItems) {
    const question = questionByPublicId.get(answerItem.questionPublicId);

    if (
      question === undefined ||
      answerItemByQuestionPublicId.has(answerItem.questionPublicId)
    ) {
      return null;
    }

    const selectedOptionPublicIds: string[] = [
      ...new Set(answerItem.selectedOptionPublicIds),
    ];
    const allowedOptionPublicIds = new Set(
      question.options.map((option) => option.publicId),
    );
    const textAnswer = normalizeOptionalText(answerItem.textAnswer);
    const isChoiceQuestion = question.questionType !== "short_answer";

    if (
      selectedOptionPublicIds.some(
        (optionPublicId) => !allowedOptionPublicIds.has(optionPublicId),
      ) ||
      (isChoiceQuestion && textAnswer !== null) ||
      (!isChoiceQuestion && selectedOptionPublicIds.length > 0) ||
      ((question.questionType === "single_choice" ||
        question.questionType === "true_false") &&
        selectedOptionPublicIds.length > 1)
    ) {
      return null;
    }

    answerItemByQuestionPublicId.set(answerItem.questionPublicId, {
      questionPublicId: answerItem.questionPublicId,
      selectedOptionPublicIds,
      textAnswer,
    });
  }

  const answeredQuestionCount = [
    ...answerItemByQuestionPublicId.entries(),
  ].filter(([questionPublicId, answerItem]) => {
    const question = questionByPublicId.get(questionPublicId)!;

    return question.questionType === "short_answer"
      ? answerItem.textAnswer !== null
      : answerItem.selectedOptionPublicIds.length > 0;
  }).length;

  if (
    input.requireComplete &&
    (input.questions.length === 0 ||
      answeredQuestionCount !== input.questions.length ||
      answerItemByQuestionPublicId.size !== input.questions.length)
  ) {
    return null;
  }

  let objectiveScore = 0;
  const questionResults: EmployeeOrganizationTrainingQuestionResultDto[] = [];

  for (const question of input.questions) {
    const answerItem = answerItemByQuestionPublicId.get(question.publicId);

    if (answerItem === undefined) {
      continue;
    }

    let score = 0;

    if (question.questionType !== "short_answer") {
      const standardAnswerOptionPublicIds =
        normalizeStandardAnswerTokens(question);

      if (standardAnswerOptionPublicIds === null) {
        return null;
      }

      score = areStringSetsEqual(
        answerItem.selectedOptionPublicIds,
        standardAnswerOptionPublicIds,
      )
        ? question.score
        : 0;
      objectiveScore += score;
    }

    questionResults.push({
      questionPublicId: question.publicId,
      score,
      maxScore: question.score,
      standardAnswer: input.requireComplete ? question.standardAnswer : null,
      analysis: input.requireComplete ? question.analysisSummary : null,
      scoringPointResults: [],
    });
  }

  const totalScore = input.questions.reduce(
    (scoreTotal, question) => scoreTotal + question.score,
    0,
  );
  const requiresAiScoring =
    input.requireComplete &&
    input.questions.some(
      (question) => question.questionType === "short_answer",
    );

  return {
    answeredQuestionCount,
    answerStatus: input.requireComplete
      ? requiresAiScoring
        ? "scoring"
        : "submitted"
      : "in_progress",
    answerItems: [...answerItemByQuestionPublicId.values()],
    questionResults,
    scoreSummary:
      input.requireComplete && !requiresAiScoring
        ? { score: objectiveScore, totalScore }
        : null,
    objectiveScore,
    totalScore,
    requiresAiScoring,
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
  authorizationContext: EffectiveAuthorizationContextDto,
):
  | "advanced_edition_required"
  | "org_auth_required"
  | "organization_training_capability_required"
  | null {
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
  authorizationContexts: EffectiveAuthorizationContextDto[];
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
    authorizationContexts:
      employeeContext.authorizationContexts === undefined ||
      employeeContext.authorizationContexts.length === 0
        ? [employeeContext.authorizationContext]
        : [...employeeContext.authorizationContexts],
  };
}

function isVersionVisibleToEmployee(
  version: OrganizationTrainingPublishedVersionDto,
  employeeContext: NormalizedEmployeeContext,
): boolean {
  const publishScopeOrganizationPublicIds = normalizePublicIdList(
    version.publishScopeSnapshot.organizationPublicIds,
  );

  const isOrganizationVisible =
    employeeContext.visibleOrganizationPublicIds.some(
      (visibleOrganizationPublicId) =>
        publishScopeOrganizationPublicIds.includes(visibleOrganizationPublicId),
    );
  const authorizationPublicId =
    typeof version.authorizationPublicId === "string"
      ? normalizeRequiredText(version.authorizationPublicId)
      : null;

  if (!isOrganizationVisible || authorizationPublicId === null) {
    return false;
  }

  const selectedAuthorizationContexts =
    employeeContext.authorizationContexts.filter(
      (authorizationContext) =>
        authorizationContext.authorizationPublicId === authorizationPublicId,
    );

  if (selectedAuthorizationContexts.length !== 1) {
    return false;
  }

  const [selectedAuthorizationContext] = selectedAuthorizationContexts;
  const authorizationOrganizationPublicId =
    selectedAuthorizationContext?.organizationPublicId ?? null;

  if (
    selectedAuthorizationContext === undefined ||
    authorizationOrganizationPublicId === null ||
    !employeeContext.visibleOrganizationPublicIds.includes(
      authorizationOrganizationPublicId,
    )
  ) {
    return false;
  }

  return (
    selectAuthorizationObjectScope([selectedAuthorizationContext], {
      authorizationPublicId,
      authorizationSource: "org_auth",
      ownerType: "organization",
      ownerPublicId: authorizationOrganizationPublicId,
      organizationPublicId: authorizationOrganizationPublicId,
      profession: version.profession,
      level: version.level,
      requiredCapability: "canAnswerOrganizationTraining",
      allowedBlockedReasons: ["production_enablement_blocked"],
    }) !== null
  );
}

function isAnswerDeadlineExpired(
  version: OrganizationTrainingPublishedVersionDto,
  now: Date,
): boolean {
  if (version.answerDeadlineAt == null) {
    return false;
  }

  const answerDeadlineTime = new Date(version.answerDeadlineAt).getTime();

  return (
    Number.isNaN(answerDeadlineTime) || answerDeadlineTime <= now.getTime()
  );
}

function getVersionNotAnswerableReason(
  version: OrganizationTrainingPublishedVersionDto,
  now: Date,
): OrganizationTrainingEmployeeAnswerBlockedReason | null {
  if (version.status !== "published") {
    return "version_not_answerable";
  }

  if (isAnswerDeadlineExpired(version, now)) {
    return "answer_deadline_expired";
  }

  return null;
}

function isVersionAnswerable(
  version: OrganizationTrainingPublishedVersionDto,
  now: Date,
) {
  return getVersionNotAnswerableReason(version, now) === null;
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
    (answer.answerStatus === "scoring" ||
      answer.answerStatus === "submitted" ||
      answer.answerStatus === "scoring_failed" ||
      answer.answerStatus === "read_only")
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
    if (!isVersionAnswerable(version, new Date())) {
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
    if (!isVersionAnswerable(version, new Date())) {
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

  if (
    answer.answerStatus === "submitted" &&
    isVersionAnswerable(version, new Date())
  ) {
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

function areCanonicalDraftQuestionsValid(
  questions: readonly OrganizationTrainingPublishQuestionInput[],
): boolean {
  if (
    !Array.isArray(questions) ||
    questions.length === 0 ||
    new Set(questions.map((question) => question.publicId)).size !==
      questions.length
  ) {
    return false;
  }

  return questions.every(
    (question, index) =>
      normalizeRequiredText(question.publicId) !== null &&
      question.sequenceNumber === index + 1 &&
      isOrganizationTrainingQuestionType(question.questionType) &&
      normalizeRequiredText(question.stem) !== null &&
      question.options.every(
        (option: OrganizationTrainingPublishQuestionInput["options"][number]) =>
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
  questions: readonly OrganizationTrainingPublishQuestionInput[],
): boolean {
  return questions.some((question) => question.evidenceStatus === "none");
}

function hasUnconfirmedWeakEvidenceQuestion(
  publishInput: OrganizationTrainingPublishInput,
  questions: readonly OrganizationTrainingPublishQuestionInput[],
): boolean {
  return (
    publishInput.weakEvidenceConfirmed !== true &&
    questions.some((question) => question.evidenceStatus === "weak")
  );
}

function copyPublishQuestionSnapshot(
  question: OrganizationTrainingPublishQuestionInput,
): OrganizationTrainingPublishQuestionInput {
  return {
    publicId: question.publicId,
    sequenceNumber: question.sequenceNumber,
    questionType: question.questionType,
    ...(question.paperSectionKey !== undefined &&
    question.paperSectionTitle !== undefined &&
    question.paperSectionSortOrder !== undefined &&
    question.questionSortOrder !== undefined
      ? {
          paperSectionKey: question.paperSectionKey,
          paperSectionTitle: question.paperSectionTitle,
          paperSectionSortOrder: question.paperSectionSortOrder,
          questionSortOrder: question.questionSortOrder,
        }
      : {}),
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

function buildQuestionTypeSummary(
  questions: readonly OrganizationTrainingPublishQuestionInput[],
): OrganizationTrainingQuestionTypeSummary {
  return questions.reduce((summary, question) => {
    if (question.questionType === "single_choice") {
      summary.singleChoice += 1;
    } else if (question.questionType === "multi_choice") {
      summary.multiChoice += 1;
    } else if (question.questionType === "true_false") {
      summary.trueFalse += 1;
    } else {
      summary.shortAnswer += 1;
    }

    return summary;
  }, createEmptyQuestionTypeSummary());
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
  answerDeadlineAt: string | null;
  publishScopeOrganizationPublicIds: string[];
};

function normalizeOptionalIsoTimestamp(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmedValue = normalizeRequiredText(value);

  if (trimmedValue === null) {
    return null;
  }

  const timestampValue = new Date(trimmedValue);

  return Number.isNaN(timestampValue.getTime())
    ? null
    : timestampValue.toISOString();
}

function normalizePublishMetadata(
  publishInput: OrganizationTrainingPublishInput,
  draft: OrganizationTrainingDraftDto,
): NormalizedPublishMetadata | null {
  const draftPublicId = normalizeRequiredText(publishInput.draftPublicId);
  const organizationPublicId = normalizeRequiredText(
    draft.organizationPublicId,
  );
  const authorizationPublicId = normalizeRequiredText(
    draft.authorizationPublicId,
  );
  const title = normalizeRequiredText(draft.title);
  const publishScopeOrganizationPublicIds = normalizePublicIdList(
    publishInput.publishScopeOrganizationPublicIds,
  );
  const questions = draft.questions ?? [];

  if (
    draftPublicId === null ||
    draftPublicId !== draft.publicId ||
    organizationPublicId === null ||
    authorizationPublicId === null ||
    title === null ||
    !isValidLevel(draft.level) ||
    !isSubject(draft.subject) ||
    publishScopeOrganizationPublicIds.length === 0 ||
    !areCanonicalDraftQuestionsValid(questions)
  ) {
    return null;
  }

  return {
    draftPublicId,
    organizationPublicId,
    authorizationPublicId,
    profession: draft.profession,
    level: draft.level,
    subject: draft.subject,
    title,
    description: normalizeOptionalText(draft.description),
    answerDeadlineAt: normalizeOptionalIsoTimestamp(
      publishInput.answerDeadlineAt,
    ),
    publishScopeOrganizationPublicIds,
  };
}

function createPayloadDigest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function copyPublishedVersion(
  sourceVersion: OrganizationTrainingPublishedVersionDto,
): OrganizationTrainingPublishedVersionDto {
  const publicVersion = { ...sourceVersion };
  delete publicVersion.authorizationPublicId;

  return {
    ...publicVersion,
    answerDeadlineAt: sourceVersion.answerDeadlineAt ?? null,
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
        draftStatus: "draft",
        revision: 1,
        questions: [],
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

    async saveDraft(command) {
      const draftPublicId = normalizeRequiredText(
        command.draftInput.draftPublicId,
      );
      const operationId = normalizeRequiredText(command.draftInput.operationId);
      const title = normalizeRequiredText(command.draftInput.title);

      if (
        draftPublicId === null ||
        operationId === null ||
        title === null ||
        draftPublicId !== command.draft.publicId ||
        !isPositiveInteger(command.draftInput.expectedRevision)
      ) {
        return createDraftSaveBlockedResult("invalid_draft_input");
      }

      const capabilityBlockedReason = getPublishCapabilityBlockedReason(
        command.authorizationContext,
      );

      if (capabilityBlockedReason !== null) {
        return createDraftSaveBlockedResult(capabilityBlockedReason);
      }

      if (
        !isOrganizationVisibleToAdmin(
          command.draft.organizationPublicId,
          command.adminContext,
        ) ||
        !isOrganizationOwnedByAuthorization(
          command.draft.organizationPublicId,
          command.authorizationContext,
        )
      ) {
        return createDraftSaveBlockedResult("organization_scope_denied");
      }

      if (
        command.authorizationContext.authorizationPublicId !==
          command.draft.authorizationPublicId ||
        command.authorizationContext.profession !== command.draft.profession ||
        command.authorizationContext.level !== command.draft.level
      ) {
        return createDraftSaveBlockedResult("authorization_scope_mismatch");
      }

      if (command.draft.draftStatus !== "draft") {
        return createDraftSaveBlockedResult("draft_not_editable");
      }

      const questions = createCanonicalOrganizationTrainingDraftQuestions(
        command.draftInput.questions,
        command.trustedDraftQuestions,
      );
      const questionTypeSummary = buildQuestionTypeSummary(questions);
      const totalScore = questions.reduce(
        (scoreTotal, question) => scoreTotal + question.score,
        0,
      );
      const savedAt = clock.now().toISOString();

      try {
        const draft = await trainingStore.saveDraft({
          draftPublicId,
          organizationPublicId: command.draft.organizationPublicId,
          authorizationPublicId: command.draft.authorizationPublicId,
          expectedRevision: command.draftInput.expectedRevision,
          operationId,
          payloadDigest: createPayloadDigest({
            draftPublicId,
            expectedRevision: command.draftInput.expectedRevision,
            title,
            description: command.draftInput.description,
            questions,
          }),
          title,
          description: normalizeOptionalText(command.draftInput.description),
          questionCount: questions.length,
          totalScore,
          questionTypeSummary,
          questions,
          evidenceStatus: resolveDraftEvidenceStatus(questions),
          validationStatus: "needs_review",
          savedAt,
        });

        return { success: true, draft };
      } catch (error) {
        if (isOrganizationTrainingPersistenceConflictError(error)) {
          return createDraftSaveBlockedResult("persistence_conflict");
        }

        throw error;
      }
    },

    async publishVersion(command) {
      const publishInput = command.publishInput;
      const normalizedMetadata = normalizePublishMetadata(
        publishInput,
        command.draft,
      );
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
        command.authorizationContext,
      );

      if (capabilityBlockedReason !== null) {
        return createPublishBlockedResult(capabilityBlockedReason);
      }

      if (
        !isOrganizationVisibleToAdmin(
          normalizedMetadata.organizationPublicId,
          command.adminContext,
        ) ||
        !isOrganizationOwnedByAuthorization(
          normalizedMetadata.organizationPublicId,
          command.authorizationContext,
        ) ||
        command.authorizationContext.authorizationPublicId !==
          normalizedMetadata.authorizationPublicId ||
        !normalizedMetadata.publishScopeOrganizationPublicIds.includes(
          normalizedMetadata.organizationPublicId,
        )
      ) {
        return createPublishBlockedResult("organization_scope_denied");
      }

      const questions = command.draft.questions ?? [];

      if (hasNoEvidenceQuestion(questions)) {
        return createPublishBlockedResult("insufficient_evidence");
      }

      if (hasUnconfirmedWeakEvidenceQuestion(publishInput, questions)) {
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
          answerDeadlineAt: normalizedMetadata.answerDeadlineAt,
          questionCount: questions.length,
          totalScore: command.draft.totalScore,
          questionTypeSummary: buildQuestionTypeSummary(questions),
          status: "published",
          publishedAt,
          takenDownAt: null,
          takedownReason: null,
          questionSnapshot: questions.map(copyPublishQuestionSnapshot),
          expectedDraftRevision: publishInput.expectedRevision,
          publishOperationId: publishInput.operationId,
          publishPayloadDigest: createPayloadDigest({
            draftPublicId: publishInput.draftPublicId,
            expectedRevision: publishInput.expectedRevision,
            answerDeadlineAt: normalizedMetadata.answerDeadlineAt,
            publishScopeOrganizationPublicIds:
              normalizedMetadata.publishScopeOrganizationPublicIds,
            weakEvidenceConfirmed: publishInput.weakEvidenceConfirmed,
          }),
          organizationId: normalizedPersistenceLineage.organizationId,
          orgAuthId: normalizedPersistenceLineage.orgAuthId,
        };

      try {
        return {
          success: true,
          version: await trainingStore.publishVersion(versionWrite),
        };
      } catch (error) {
        if (isOrganizationTrainingPersistenceConflictError(error)) {
          return createPublishBlockedResult("persistence_conflict");
        }

        throw error;
      }
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
              isVersionAnswerable(version, clock.now()) &&
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

      const notAnswerableReason = getVersionNotAnswerableReason(
        command.version,
        clock.now(),
      );
      if (notAnswerableReason !== null) {
        return createEmployeeAnswerBlockedResult(notAnswerableReason);
      }

      if (
        command.existingAnswer !== null &&
        command.existingAnswer.answerStatus !== "in_progress"
      ) {
        return createEmployeeAnswerBlockedResult("already_submitted");
      }

      const trainingVersionPublicId = normalizeAnswerTrainingVersionPublicId(
        command.answerInput.trainingVersionPublicId,
        command.version,
      );
      const answerItems = normalizeAnswerItemList(
        command.answerInput.answerItems,
        command.version,
      );
      const operationId = normalizeRequiredText(
        command.answerInput.operationId,
      );
      const evaluation =
        answerItems === null
          ? null
          : evaluateOrganizationTrainingAnswer({
              questions: command.canonicalQuestions,
              answerItems,
              requireComplete: false,
            });

      if (
        trainingVersionPublicId === null ||
        operationId === null ||
        !isNonNegativeInteger(command.answerInput.expectedRevision) ||
        evaluation === null ||
        command.canonicalQuestions.length !== command.version.questionCount
      ) {
        return createEmployeeAnswerBlockedResult("invalid_answer_input");
      }

      const savedAt = clock.now().toISOString();

      try {
        const answer = await trainingStore.saveEmployeeAnswerDraft({
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
          expectedRevision: command.answerInput.expectedRevision,
          operationId,
          payloadDigest: createPayloadDigest({
            trainingVersionPublicId,
            expectedRevision: command.answerInput.expectedRevision,
            answerItems: evaluation.answerItems,
          }),
          answeredQuestionCount: evaluation.answeredQuestionCount,
          answerItems: evaluation.answerItems,
          scoreSummary: null,
          savedAt,
          submittedAt: null,
          formalWritePolicy: createFormalWritePolicy(),
        });

        return { success: true, answer };
      } catch (error) {
        if (isOrganizationTrainingPersistenceConflictError(error)) {
          return createEmployeeAnswerBlockedResult("persistence_conflict");
        }

        throw error;
      }
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

      const notAnswerableReason = getVersionNotAnswerableReason(
        command.version,
        clock.now(),
      );
      const isTerminalAnswerReplayCandidate =
        command.existingAnswer !== null &&
        command.existingAnswer.answerStatus !== "in_progress";

      if (notAnswerableReason !== null && !isTerminalAnswerReplayCandidate) {
        return createEmployeeAnswerBlockedResult(notAnswerableReason);
      }

      const trainingVersionPublicId = normalizeAnswerTrainingVersionPublicId(
        command.answerInput.trainingVersionPublicId,
        command.version,
      );
      const answerItems = normalizeAnswerItemList(
        command.answerInput.answerItems,
        command.version,
      );
      const operationId = normalizeRequiredText(
        command.answerInput.operationId,
      );
      const evaluation =
        answerItems === null
          ? null
          : evaluateOrganizationTrainingAnswer({
              questions: command.canonicalQuestions,
              answerItems,
              requireComplete: true,
            });

      if (
        trainingVersionPublicId === null ||
        operationId === null ||
        !isNonNegativeInteger(command.answerInput.expectedRevision) ||
        evaluation === null ||
        evaluation.totalScore !== command.version.totalScore ||
        (evaluation.requiresAiScoring &&
          command.scoringProvenance === null &&
          !isTerminalAnswerReplayCandidate)
      ) {
        return createEmployeeAnswerBlockedResult("invalid_answer_input");
      }

      const submittedAt = clock.now().toISOString();
      const payloadDigest = createPayloadDigest({
        trainingVersionPublicId,
        expectedRevision: command.answerInput.expectedRevision,
        answerItems: evaluation.answerItems,
      });
      const scoringTask =
        evaluation.requiresAiScoring && command.scoringProvenance !== null
          ? {
              publicIdSeed: `${trainingVersionPublicId}:${normalizedEmployeeContext.employeePublicId}`,
              idempotencyKeyHash: createPayloadDigest({
                trainingVersionPublicId,
                employeePublicId: normalizedEmployeeContext.employeePublicId,
                operationId,
              }),
              maxAttemptCount: 3 as const,
              timeoutSecond: 60 as const,
              modelConfigSnapshot: {
                ...command.scoringProvenance.modelConfigSnapshot,
              },
              promptTemplateKey: command.scoringProvenance.promptTemplateKey,
              promptTemplateVersion:
                command.scoringProvenance.promptTemplateVersion,
              promptTemplateHash: command.scoringProvenance.promptTemplateHash,
              inputSnapshot: {
                trainingVersionPublicId,
                employeePublicId: normalizedEmployeeContext.employeePublicId,
                objectiveScore: evaluation.objectiveScore,
                totalScore: evaluation.totalScore,
                questionResults: evaluation.questionResults.map((result) => ({
                  ...result,
                  scoringPointResults: result.scoringPointResults.map(
                    (scoringPointResult) => ({ ...scoringPointResult }),
                  ),
                })),
                shortAnswerQuestionPublicIds: command.canonicalQuestions
                  .filter(
                    (question) => question.questionType === "short_answer",
                  )
                  .map((question) => question.publicId),
                shortAnswerItems: evaluation.answerItems.filter((answerItem) =>
                  command.canonicalQuestions.some(
                    (question) =>
                      question.publicId === answerItem.questionPublicId &&
                      question.questionType === "short_answer",
                  ),
                ),
              },
              authorizationSnapshot: {
                authorizationSource:
                  normalizedEmployeeContext.authorizationContext
                    .authorizationSource,
                authorizationPublicId:
                  normalizedEmployeeContext.authorizationContext
                    .authorizationPublicId,
                organizationPublicId:
                  normalizedEmployeeContext.currentOrganizationPublicId,
                profession: command.version.profession,
                level: command.version.level,
              },
              ragSnapshot: command.scoringProvenance.ragSnapshot,
              scheduledAt: submittedAt,
            }
          : null;

      try {
        const answer = await trainingStore.submitEmployeeAnswer({
          contentType: "organization_training_answer_record",
          trainingVersionPublicId,
          employeePublicId: normalizedEmployeeContext.employeePublicId,
          organizationPublicId:
            normalizedEmployeeContext.currentOrganizationPublicId,
          answerOrganizationSnapshot: createAnswerOrganizationSnapshot(
            normalizedEmployeeContext,
            submittedAt,
          ),
          expectedRevision: command.answerInput.expectedRevision,
          operationId,
          payloadDigest,
          answerStatus: evaluation.requiresAiScoring ? "scoring" : "submitted",
          answeredQuestionCount: evaluation.answeredQuestionCount,
          answerItems: evaluation.answerItems,
          questionResults: evaluation.questionResults,
          scoreSummary: evaluation.scoreSummary,
          totalScore: evaluation.totalScore,
          scoringTask,
          submittedAt,
          formalWritePolicy: createFormalWritePolicy(),
        });

        return { success: true, answer };
      } catch (error) {
        if (isOrganizationTrainingPersistenceConflictError(error)) {
          return createEmployeeAnswerBlockedResult("persistence_conflict");
        }

        throw error;
      }
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
