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
  "not_started",
  "in_progress",
  "submitted",
  "read_only",
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

export type OrganizationTrainingSensitiveAdminSummaryField =
  (typeof organizationTrainingSensitiveAdminSummaryFieldValues)[number];

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

export type OrganizationTrainingPublishQuestionInput = {
  publicId: string;
  questionType: OrganizationTrainingQuestionType;
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
  questions: OrganizationTrainingPublishQuestionInput[];
  publishScopeOrganizationPublicIds: string[];
  capabilityContext: OrganizationTrainingCapabilityContext;
  questionCount: number;
  totalScore: number;
  questionTypeSummary: OrganizationTrainingQuestionTypeSummary;
};

export type OrganizationTrainingTakedownInput = {
  versionPublicId: string;
  takedownReason: string;
};

export type OrganizationTrainingCopyToNewDraftInput = {
  sourceVersionPublicId: string;
  newDraftTitle: string;
};
