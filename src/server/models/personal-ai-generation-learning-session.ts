export const personalAiGenerationLearningSessionOwnerTypeValues = [
  "personal",
  "organization",
] as const;

export type PersonalAiGenerationLearningSessionOwnerType =
  (typeof personalAiGenerationLearningSessionOwnerTypeValues)[number];

export const personalAiGenerationLearningSessionAuthorizationSourceValues = [
  "personal_auth",
  "org_auth",
] as const;

export type PersonalAiGenerationLearningSessionAuthorizationSource =
  (typeof personalAiGenerationLearningSessionAuthorizationSourceValues)[number];

export const personalAiGenerationLearningSessionStatusValues = [
  "in_progress",
  "completed",
] as const;

export type PersonalAiGenerationLearningSessionStatus =
  (typeof personalAiGenerationLearningSessionStatusValues)[number];

export type PersonalAiGenerationLearningSessionLifecycleAvailability =
  | "current"
  | "legacy_unavailable";

export const personalAiGenerationLearningSessionQuestionTypeValues = [
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
] as const;

export type PersonalAiGenerationLearningSessionQuestionType =
  (typeof personalAiGenerationLearningSessionQuestionTypeValues)[number];

export const PERSONAL_AI_GENERATION_LEARNING_TEXT_ANSWER_MAX_LENGTH = 4_000;

export type PersonalAiGenerationLearningContentDomain = "personal_ai_learning";

export type PersonalAiGenerationLearningFormalWriteStatus = "blocked";

export type PersonalAiGenerationLearningPersistenceStatus =
  "repository_persisted";

export type PersonalAiGenerationLearningResumeStatus = "resumable";

export type PersonalAiGenerationLearningAnswerFeedbackStatus =
  | "scored"
  | "submitted_review_required"
  | "blocked";

export type PersonalAiGenerationLearningSessionCreationStatus =
  | "created"
  | "blocked";

export type PersonalAiGenerationLearningSessionCreationBlockReason =
  | "insufficient_grounding_evidence"
  | "source_result_required"
  | "source_result_not_found"
  | "structured_preview_unavailable"
  | "structured_preview_not_parsed"
  | "no_usable_generated_questions"
  | "no_usable_selected_questions"
  | "selected_question_source_missing"
  | "session_context_mismatch";

export type PersonalAiGenerationLearningAnswerBlockReason =
  | "session_not_found"
  | "actor_not_allowed"
  | "question_not_found"
  | "answer_required"
  | "answer_too_long"
  | "answer_shape_invalid"
  | "answer_revision_conflict"
  | "answer_history_unavailable";

export type PersonalAiGenerationLearningSessionProgressStatus =
  | "ready"
  | "blocked";

export type PersonalAiGenerationLearningSessionCompleteBlockReason =
  | "session_not_found"
  | "actor_not_allowed"
  | "session_revision_conflict"
  | "session_lifecycle_unavailable"
  | "session_answer_set_incomplete"
  | "session_integrity_unavailable";
