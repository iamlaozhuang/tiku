import type { AuthorizationType } from "../contracts/effective-authorization-contract";
import type { SortOrder } from "../contracts/api-response";
import type { MistakeBookAnswerSnapshotDto } from "../contracts/mistake-book-contract";
import type { Profession, QuestionType, Subject } from "../models/paper";
import type {
  MistakeBookSource,
  MistakeBookStatus,
} from "../models/student-experience";

export type MistakeBookAuthorizationScopeRow = {
  profession: Profession;
  level: number;
  authorization_types: AuthorizationType[];
  expires_at: Date;
};

export type MistakeBookRow = {
  id: number;
  public_id: string;
  question_public_id: string;
  paper_question_public_id: string;
  profession: Profession;
  level: number;
  subject: Subject;
  question_snapshot: Record<string, unknown>;
  latest_answer_snapshot: MistakeBookAnswerSnapshotDto;
  mistake_book_source: MistakeBookSource;
  mistake_book_status: MistakeBookStatus;
  wrong_count: number;
  is_favorite: boolean;
  is_removed: boolean;
  mastered_at: Date | null;
  latest_wrong_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type MistakeBookListQuery = {
  userPublicId: string;
  page: number;
  pageSize: number;
  questionType: QuestionType | null;
  source: MistakeBookSource | null;
  status: MistakeBookStatus | null;
  isFavorite: boolean | null;
  sortBy: "latestWrongAt";
  sortOrder: SortOrder;
};

export type UpdateMistakeBookStateInput = {
  userPublicId: string;
  publicId: string;
  mistakeBookStatus: MistakeBookStatus;
  isFavorite: boolean;
  isRemoved: boolean;
  masteredAt: Date | null;
  updatedAt: Date;
};

export type MistakeBookRepository = {
  listEffectiveAuthorizationScopes(query: {
    userPublicId: string;
  }): Promise<MistakeBookAuthorizationScopeRow[]>;
  listMistakeBooks(query: MistakeBookListQuery): Promise<{
    rows: MistakeBookRow[];
    total: number;
  }>;
  findMistakeBookByPublicId(query: {
    userPublicId: string;
    publicId: string;
  }): Promise<MistakeBookRow | null>;
  updateMistakeBookState(
    input: UpdateMistakeBookStateInput,
  ): Promise<MistakeBookRow | null>;
};
