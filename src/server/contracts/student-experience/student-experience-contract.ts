import type { QuestionType } from "@/server/models/paper";

export type StudentExperienceSortOrder = "asc" | "desc";

export type StudentExperiencePagination = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: StudentExperienceSortOrder;
  total: number;
};

export type StudentExperienceApiEnvelope<TData> = {
  code: number;
  data: TData;
  message: string;
  pagination?: StudentExperiencePagination;
};

export type StudentExperienceUserContext = {
  userPublicId: string;
};

export type ObjectiveMistakeBookQuestionType = Extract<
  QuestionType,
  "single_choice" | "multi_choice" | "true_false" | "fill_blank"
>;

export type MistakeBookScope = "objective_question";

export type MistakeBookSource = "wrong_answer" | "favorite";

export type MistakeBookStatus = "unmastered" | "mastered" | "removed";

export type MistakeBookTransport = {
  isFavorite: boolean;
  isQuestionDisabled: boolean;
  isRemoved: boolean;
  latestWrongAt: string | null;
  masteredAt: string | null;
  mistakeBookScope: MistakeBookScope;
  mistakeBookSource: MistakeBookSource;
  mistakeBookStatus: MistakeBookStatus;
  publicId: string;
  questionPublicId: string;
  questionType: ObjectiveMistakeBookQuestionType;
  wrongCount: number;
};

export type MistakeBookListData = {
  mistakeBooks: MistakeBookTransport[];
};

export type ProviderBlockedOperation =
  | "exam_report.generation"
  | "exam_report.retry_learning_suggestion"
  | "mistake_book.ai_explanation"
  | "mock_exam.retry_scoring";

export type ProviderBlockedData = {
  blockedGate: "provider_model_request_quota";
  operation: ProviderBlockedOperation;
  status: "blocked";
};
