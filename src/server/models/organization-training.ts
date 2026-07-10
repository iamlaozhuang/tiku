import type { Profession } from "./auth";
import type { EvidenceStatus } from "./ai-rag";
import type { Subject } from "./paper";

export const organizationTrainingQuestionTypeValues = [
  "single_choice",
  "multi_choice",
  "true_false",
  "short_answer",
] as const;

export const organizationTrainingDeferredQuestionTypeValues = [
  "fill_blank",
  "case_analysis",
  "calculation",
] as const;

export const organizationTrainingValidationStatusValues = [
  "valid",
  "invalid",
  "needs_review",
] as const;

export const organizationTrainingRetentionStatusValues = [
  "active",
  "expired_hidden",
] as const;

export const organizationTrainingVersionStatusValues = [
  "published",
  "taken_down",
] as const;

export const organizationTrainingAnswerStatusValues = [
  "in_progress",
  "submitted",
  "read_only",
] as const;

export const organizationTrainingSourceContextTypeValues = [
  "paper",
  "mock_exam",
  "organization_ai_result",
] as const;

export const organizationTrainingSensitiveAdminSummaryFieldValues = [
  "questionAnswerBody",
  "itemCorrectness",
  "subjectiveOriginalAnswer",
  "fullQuestionBody",
  "standardAnswer",
  "analysis",
  "prompt",
  "providerPayload",
  "singleAiTaskDetail",
] as const;

export const organizationTrainingAuditLogTargetResourceTypeValues = [
  "organization_training_draft",
  "organization_training_version",
  "organization_training_answer",
  "organization_training_source_context",
  "organization_training_summary",
] as const;

export type OrganizationTrainingQuestionType =
  (typeof organizationTrainingQuestionTypeValues)[number];

export type OrganizationTrainingDeferredQuestionType =
  (typeof organizationTrainingDeferredQuestionTypeValues)[number];

export type OrganizationTrainingValidationStatus =
  (typeof organizationTrainingValidationStatusValues)[number];

export type OrganizationTrainingRetentionStatus =
  (typeof organizationTrainingRetentionStatusValues)[number];

export type OrganizationTrainingVersionStatus =
  (typeof organizationTrainingVersionStatusValues)[number];

export type OrganizationTrainingAnswerStatus =
  (typeof organizationTrainingAnswerStatusValues)[number];

export type OrganizationTrainingSourceContextType =
  (typeof organizationTrainingSourceContextTypeValues)[number];

export type OrganizationTrainingSensitiveAdminSummaryField =
  (typeof organizationTrainingSensitiveAdminSummaryFieldValues)[number];

export type OrganizationTrainingAuditLogTargetResourceType =
  (typeof organizationTrainingAuditLogTargetResourceTypeValues)[number];

export type OrganizationTrainingAuditLogReferenceInput = {
  auditLogPublicId: string;
  actionType: string;
  targetResourceType: OrganizationTrainingAuditLogTargetResourceType;
  trainingDraftPublicId: string | null;
  trainingVersionPublicId: string | null;
  employeeAnswerPublicId: string | null;
  organizationPublicId: string;
  actorPublicId: string | null;
};

export type OrganizationTrainingQuestionTypeSummary = {
  singleChoice: number;
  multiChoice: number;
  trueFalse: number;
  shortAnswer: number;
};

export type OrganizationTrainingCapabilityContext = {
  effectiveEdition: "advanced";
  authorizationSource: "org_auth";
  canCreateOrganizationTraining: true;
};

export type OrganizationTrainingPublishQuestionOptionInput = {
  publicId: string;
  label: string;
  content: string;
};

export type OrganizationTrainingPublishQuestionInput = {
  publicId: string;
  sequenceNumber: number;
  questionType: OrganizationTrainingQuestionType;
  materialTitle: string | null;
  materialContent: string | null;
  stem: string;
  options: OrganizationTrainingPublishQuestionOptionInput[];
  score: number;
  standardAnswer: string;
  analysisSummary: string;
  evidenceStatus: EvidenceStatus;
  citationCount: number;
};

export type OrganizationTrainingPublishInput = {
  draftPublicId: string;
  organizationPublicId: string;
  authorizationPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  title: string;
  description: string | null;
  answerDeadlineAt: string | null;
  questions: OrganizationTrainingPublishQuestionInput[];
  publishScopeOrganizationPublicIds: string[];
  capabilityContext: OrganizationTrainingCapabilityContext;
  questionCount: number;
  totalScore: number;
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary;
  weakEvidenceConfirmed: boolean;
};

export type OrganizationTrainingTakedownInput = {
  versionPublicId: string;
  takedownReason: string;
};

export type OrganizationTrainingCopyToNewDraftInput = {
  sourceVersionPublicId: string;
  newDraftTitle: string;
};
