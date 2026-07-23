import type { EvidenceStatus } from "../models/ai-rag";
import type { Profession } from "../models/auth";
import type {
  OrganizationTrainingAnswerStatus,
  OrganizationTrainingAuditLogTargetResourceType,
  OrganizationTrainingDraftStatus,
  OrganizationTrainingPublishQuestionInput,
  OrganizationTrainingQuestionType,
  OrganizationTrainingQuestionTypeSummary,
  OrganizationTrainingRetentionStatus,
  OrganizationTrainingSourceContextType,
  OrganizationTrainingValidationStatus,
  OrganizationTrainingVersionStatus,
} from "../models/organization-training";
import type { QuestionDifficulty, Subject } from "../models/paper";

export type OrganizationTrainingDraftDto = {
  publicId: string;
  draftStatus?: OrganizationTrainingDraftStatus;
  revision?: number;
  sourceTaskPublicId: string | null;
  organizationPublicId: string;
  authorizationSource: "org_auth";
  authorizationPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
  questionCount: number;
  totalScore: number;
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary;
  questions?: OrganizationTrainingPublishQuestionInput[];
  evidenceStatus: EvidenceStatus;
  validationStatus: OrganizationTrainingValidationStatus;
  retentionStatus: OrganizationTrainingRetentionStatus;
  createdAt: string;
  expiresAt: string | null;
};

export type OrganizationTrainingScopeSnapshotDto = {
  organizationPublicIds: string[];
  capturedAt: string;
};

export type OrganizationTrainingQuestionOptionSnapshotDto = {
  publicId: string;
  label: string;
  content: string;
};

export type OrganizationTrainingQuestionSnapshotDto = {
  publicId: string;
  sequenceNumber: number;
  questionType: OrganizationTrainingQuestionType;
  difficulty?: QuestionDifficulty | null;
  knowledgeNodePublicIds?: string[];
  parentKnowledgeNodePublicIds?: string[];
  ancestorKnowledgeNodePublicIds?: string[];
  questionGroupPublicId?: string;
  questionGroupTitle?: string;
  questionGroupQuestionSortOrder?: number;
  questionGroupQuestionCount?: number;
  materialTitle: string | null;
  materialContent: string | null;
  stem: string;
  options: OrganizationTrainingQuestionOptionSnapshotDto[];
  score: number;
};

export type EmployeeOrganizationTrainingAnswerItemDto = {
  questionPublicId: string;
  selectedOptionPublicIds: string[];
  textAnswer: string | null;
};

export type EmployeeOrganizationTrainingScoringPointResultDto = {
  label: string;
  score: number;
  maxScore: number;
  reason: string;
};

export type EmployeeOrganizationTrainingQuestionResultDto = {
  questionPublicId: string;
  score: number;
  maxScore: number;
  standardAnswer: string | null;
  analysis: string | null;
  scoringPointResults: EmployeeOrganizationTrainingScoringPointResultDto[];
};

export type OrganizationTrainingPublishedVersionDto = {
  publicId: string;
  draftPublicId: string;
  versionNumber: number;
  organizationPublicId: string;
  authorizationPublicId?: string;
  organizationName?: string | null;
  publishScopeSnapshot: OrganizationTrainingScopeSnapshotDto;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
  questionCount: number;
  totalScore: number;
  status: OrganizationTrainingVersionStatus;
  publishedAt: string;
  answerDeadlineAt?: string | null;
  employeeAnswerStatus?: "not_started" | OrganizationTrainingAnswerStatus;
  submittedScoreSummary?: EmployeeOrganizationTrainingScoreSummaryDto | null;
  takenDownAt: string | null;
  takedownReason: string | null;
  questions?: OrganizationTrainingQuestionSnapshotDto[];
};

export type OrganizationTrainingVersionListIntegrityStatus =
  | "complete"
  | "partial";

export type OrganizationTrainingVersionListWarningCode =
  "historical_version_unavailable";

export type OrganizationTrainingVersionListReadResult = {
  versions: OrganizationTrainingPublishedVersionDto[];
  integrityStatus: OrganizationTrainingVersionListIntegrityStatus;
  warningCode: OrganizationTrainingVersionListWarningCode | null;
};

export type EmployeeOrganizationTrainingScoreSummaryDto = {
  score: number;
  totalScore: number;
};

export type EmployeeOrganizationTrainingAnswerDto = {
  publicId: string;
  revision?: number;
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: OrganizationTrainingAnswerStatus;
  scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto | null;
  submittedAt: string | null;
  resultSummaryVisible: boolean;
  answerItems?: EmployeeOrganizationTrainingAnswerItemDto[];
  questionResults?: EmployeeOrganizationTrainingQuestionResultDto[];
};

export type OrganizationTrainingAdminEmployeeSummaryDto = {
  employeePublicId: string;
  organizationPublicId: string;
  answerStatus: OrganizationTrainingAnswerStatus;
  scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto | null;
  submittedAt: string | null;
};

export type OrganizationTrainingAdminSummaryDto = {
  trainingVersionPublicId: string;
  organizationPublicId: string;
  completionCount: number;
  submittedCount: number;
  averageScore: number | null;
  employeeSummaries: OrganizationTrainingAdminEmployeeSummaryDto[];
  redactionStatus: "redacted";
};

export type OrganizationTrainingSourceContextDto = {
  sourceType: OrganizationTrainingSourceContextType;
  sourcePublicId: string;
  title: string;
  profession: Profession;
  level: number;
  subject: Subject;
  questionCount: number;
  totalScore: number;
  sourceStatus: string;
  redactionStatus: "metadata_only";
};

export type OrganizationTrainingAdminLifecycleAction =
  | "publish"
  | "take_down"
  | "copy_to_new_draft";

export type OrganizationTrainingAdminLifecycleSourceKind =
  | "ai_question"
  | "ai_paper"
  | "platform_paper"
  | "manual_group"
  | "unknown";

export type OrganizationTrainingAdminLifecycleContentKind =
  | "question_training"
  | "paper_training"
  | "unknown";

export type OrganizationTrainingAdminLifecycleSourceMetadataDto = {
  draftPublicId: string;
  sourceTaskPublicId: string | null;
  sourceVersionPublicId: string | null;
  sourceType: OrganizationTrainingSourceContextType | null;
  generationKind: "question" | "paper" | null;
  redactionStatus: "metadata_only";
};

export type OrganizationTrainingAdminLifecycleItemDto = {
  publicId: string;
  resourceType: "organization_training_draft" | "organization_training_version";
  organizationPublicId: string;
  authorizationPublicId?: string;
  profession?: Profession;
  level?: number;
  subject?: Subject;
  title: string;
  description?: string | null;
  revision?: number;
  questionCount?: number;
  totalScore?: number;
  questionTypeSummary?: OrganizationTrainingQuestionTypeSummary;
  activityAt: string;
  status: "draft" | OrganizationTrainingVersionStatus;
  sourceKind: OrganizationTrainingAdminLifecycleSourceKind;
  contentKind: OrganizationTrainingAdminLifecycleContentKind;
  availableActions: OrganizationTrainingAdminLifecycleAction[];
};

export type OrganizationTrainingAdminLifecycleFlowDto = {
  items: OrganizationTrainingAdminLifecycleItemDto[];
  redactionStatus: "metadata_only";
  integrityStatus: OrganizationTrainingVersionListIntegrityStatus;
  warningCode: OrganizationTrainingVersionListWarningCode | null;
};

export type OrganizationTrainingAdminLifecyclePageResult = {
  items: OrganizationTrainingAdminLifecycleItemDto[];
  total: number;
  integrityStatus: OrganizationTrainingVersionListIntegrityStatus;
  warningCode: OrganizationTrainingVersionListWarningCode | null;
};

export type OrganizationTrainingAdminQuestionDetailDto = {
  publicId: string;
  sequenceNumber: number;
  questionType: OrganizationTrainingQuestionType;
  questionGroupPublicId?: string;
  questionGroupTitle?: string;
  questionGroupQuestionSortOrder?: number;
  questionGroupQuestionCount?: number;
  materialTitle: string | null;
  materialContent: string | null;
  stem: string;
  options: OrganizationTrainingQuestionOptionSnapshotDto[];
  score: number;
  evidenceSummary: {
    evidenceStatus: EvidenceStatus;
    citationCount: number;
  };
  answerAndAnalysis: {
    visibility: "collapsed_by_default";
    standardAnswer: string | null;
    analysis: string | null;
  };
};

export type OrganizationTrainingAdminPaperSectionDetailDto = {
  sectionKey: string;
  title: string;
  questionType: OrganizationTrainingQuestionType;
  targetQuestionCount: number;
  selectedQuestionCount: number;
  totalScore: number;
  questions: OrganizationTrainingAdminQuestionDetailDto[];
};

export type OrganizationTrainingAdminPublishedVersionDetailDto = Omit<
  OrganizationTrainingPublishedVersionDto,
  "questions"
> & {
  questions: OrganizationTrainingAdminQuestionDetailDto[];
  paperSections?: OrganizationTrainingAdminPaperSectionDetailDto[];
};

export type OrganizationTrainingAdminDetailStructureDto = {
  questionCount: number;
  totalScore: number;
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary;
};

export type OrganizationTrainingAdminAvailableDetailDto = {
  publicId: string;
  resourceType: "organization_training_draft" | "organization_training_version";
  detailAvailability: "available";
  organizationPublicId: string;
  title: string;
  description: string | null;
  revision?: number;
  profession: Profession;
  level: number;
  subject: Subject;
  status: "draft" | OrganizationTrainingVersionStatus;
  sourceKind: OrganizationTrainingAdminLifecycleSourceKind;
  contentKind: OrganizationTrainingAdminLifecycleContentKind;
  structure: OrganizationTrainingAdminDetailStructureDto;
  questions: OrganizationTrainingAdminQuestionDetailDto[];
  paperSections?: OrganizationTrainingAdminPaperSectionDetailDto[];
  redactionStatus: "admin_safe_detail";
};

export type OrganizationTrainingAdminUnavailableDetailDto = {
  publicId: string;
  resourceType: "organization_training_draft";
  detailAvailability: "unavailable";
  unavailableReason: "draft_snapshot_unavailable";
  organizationPublicId: string;
  title: string;
  description: string | null;
  revision?: number;
  profession: Profession;
  level: number;
  subject: Subject;
  status: "draft";
  sourceKind: OrganizationTrainingAdminLifecycleSourceKind;
  contentKind: OrganizationTrainingAdminLifecycleContentKind;
  recommendedAction: "continue_configuration";
  redactionStatus: "metadata_only";
};

export type OrganizationTrainingAdminDetailDto =
  | OrganizationTrainingAdminAvailableDetailDto
  | OrganizationTrainingAdminUnavailableDetailDto;

export type OrganizationTrainingEmployeeAnswerLifecycleAction =
  | "start_answer"
  | "continue_answer"
  | "submit_answer"
  | "view_result";

export type OrganizationTrainingEmployeeAnswerLifecycleStatus =
  | "not_started"
  | OrganizationTrainingAnswerStatus;

export type OrganizationTrainingEmployeeAnswerLifecycleItemDto = {
  trainingVersionPublicId: string;
  organizationPublicId: string;
  title: string;
  versionStatus: OrganizationTrainingVersionStatus;
  answerStatus: OrganizationTrainingEmployeeAnswerLifecycleStatus;
  availableActions: OrganizationTrainingEmployeeAnswerLifecycleAction[];
  resultSummaryVisible: boolean;
};

export type OrganizationTrainingEmployeeAnswerLifecycleFlowDto = {
  items: OrganizationTrainingEmployeeAnswerLifecycleItemDto[];
  redactionStatus: "metadata_only";
};

export type OrganizationTrainingAuditLogReferenceDto = {
  auditLogReference: {
    publicId: string;
    redactionStatus: "redacted";
  };
  targetReference: {
    targetResourceType: OrganizationTrainingAuditLogTargetResourceType;
    trainingDraftPublicId: string | null;
    trainingVersionPublicId: string | null;
    employeeAnswerPublicId: string | null;
    organizationPublicId: string;
  };
  actorReference: {
    actorPublicId: string | null;
    redactionStatus: "redacted";
  };
  actionType: string;
  referenceStatus: "redacted_reference";
};

export type OrganizationTrainingAuditLogRedactedReferencePolicyDto = {
  targetResourceTypes: OrganizationTrainingAuditLogTargetResourceType[];
  referenceStatus: "redacted_reference";
  redactionStatus: "redacted";
  exposeRawPayload: false;
  exposeRawPrompt: false;
  exposeRawAnswer: false;
  exposeProviderPayload: false;
  exposeRowData: false;
  exposePrivateData: false;
};

export type OrganizationTrainingSourceContextAttachmentDto = {
  draftPublicId: string;
  organizationPublicId: string;
  sourceContexts: OrganizationTrainingSourceContextDto[];
  redactionStatus: "metadata_only";
};

export type OrganizationTrainingAiResultCopyDto = {
  persistenceStatus: "created" | "reused";
  draft: OrganizationTrainingDraftDto;
  context: OrganizationTrainingSourceContextAttachmentDto;
};

export type OrganizationTrainingSourceContextUsagePolicyDto = {
  createFormalPaper: false;
  createMockExam: false;
  exposeQuestionBody: false;
  exposeStandardAnswer: false;
  exposeAnalysis: false;
  exposeProviderPayload: false;
};

export type OrganizationTrainingSourceContextUsageDto = {
  draftPublicId: string;
  organizationPublicId: string;
  sourceContexts: OrganizationTrainingSourceContextDto[];
  formalUsagePolicy: OrganizationTrainingSourceContextUsagePolicyDto;
  redactionStatus: "metadata_only";
};
