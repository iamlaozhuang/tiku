import type { EvidenceStatus } from "../models/ai-rag";
import type { Profession } from "../models/auth";
import type {
  OrganizationTrainingAnswerStatus,
  OrganizationTrainingAuditLogTargetResourceType,
  OrganizationTrainingQuestionTypeSummary,
  OrganizationTrainingRetentionStatus,
  OrganizationTrainingSourceContextType,
  OrganizationTrainingValidationStatus,
  OrganizationTrainingVersionStatus,
} from "../models/organization-training";
import type { Subject } from "../models/paper";

export type OrganizationTrainingDraftDto = {
  publicId: string;
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

export type OrganizationTrainingPublishedVersionDto = {
  publicId: string;
  draftPublicId: string;
  versionNumber: number;
  organizationPublicId: string;
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
  takenDownAt: string | null;
  takedownReason: string | null;
};

export type EmployeeOrganizationTrainingScoreSummaryDto = {
  score: number;
  totalScore: number;
};

export type EmployeeOrganizationTrainingAnswerDto = {
  publicId: string;
  trainingVersionPublicId: string;
  employeePublicId: string;
  organizationPublicId: string;
  answerOrganizationSnapshot: OrganizationTrainingScopeSnapshotDto;
  answerStatus: OrganizationTrainingAnswerStatus;
  scoreSummary: EmployeeOrganizationTrainingScoreSummaryDto | null;
  submittedAt: string | null;
  resultSummaryVisible: boolean;
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

export type OrganizationTrainingSourceContextAttachmentDto = {
  draftPublicId: string;
  organizationPublicId: string;
  sourceContexts: OrganizationTrainingSourceContextDto[];
  redactionStatus: "metadata_only";
};
