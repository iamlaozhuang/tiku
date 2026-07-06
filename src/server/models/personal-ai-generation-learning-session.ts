export const personalAiGenerationLearningSessionOwnerTypeValues = [
  "personal",
  "organization",
] as const;

export type PersonalAiGenerationLearningSessionOwnerType =
  (typeof personalAiGenerationLearningSessionOwnerTypeValues)[number];

export const personalAiGenerationLearningSessionQuestionTypeValues = [
  "single_choice",
  "multi_choice",
  "true_false",
  "short_answer",
] as const;

export type PersonalAiGenerationLearningSessionQuestionType =
  (typeof personalAiGenerationLearningSessionQuestionTypeValues)[number];

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
  | "selected_question_source_missing";

export type PersonalAiGenerationLearningAnswerBlockReason =
  | "session_not_found"
  | "actor_not_allowed"
  | "question_not_found";

export type PersonalAiGenerationLearningSessionProgressStatus =
  | "ready"
  | "blocked";
