import type { QuestionType } from "@/server/models/paper";
import type {
  MistakeBookSource,
  MistakeBookStatus,
  StudentExperiencePagination,
  StudentExperienceSortOrder,
  StudentExperienceUserContext,
} from "@/server/contracts/student-experience/student-experience-contract";

export type MistakeBookRecord = {
  isFavorite: boolean;
  isQuestionDisabled: boolean;
  isRemoved: boolean;
  latestWrongAt: string | null;
  masteredAt: string | null;
  mistakeBookSource: MistakeBookSource;
  mistakeBookStatus: MistakeBookStatus;
  publicId: string;
  questionPublicId: string;
  questionType: QuestionType;
  wrongCount: number;
};

export type ListMistakeBooksQuery = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: StudentExperienceSortOrder;
};

export type ListMistakeBooksResult = {
  mistakeBooks: MistakeBookRecord[];
  pagination: StudentExperiencePagination;
};

export type StudentExperienceRepository = {
  listMistakeBooks?: (
    userContext: StudentExperienceUserContext,
    query: ListMistakeBooksQuery,
  ) => Promise<ListMistakeBooksResult>;
  retryMockExamScoring?: (
    userContext: StudentExperienceUserContext,
    publicId: string,
  ) => Promise<unknown>;
};

export function createUnavailableStudentExperienceRepository(): StudentExperienceRepository {
  return {};
}
