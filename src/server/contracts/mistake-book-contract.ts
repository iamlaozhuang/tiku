import type { Profession, Subject } from "../models/paper";
import type {
  MistakeBookSource,
  MistakeBookStatus,
} from "../models/student-experience";

export type MistakeBookAnswerSnapshotDto = {
  selectedLabels: string[];
  textAnswer: string | null;
  savedFromClientAt: string | null;
};

export type MistakeBookItemDto = {
  publicId: string;
  questionPublicId: string;
  paperQuestionPublicId: string;
  profession: Profession;
  level: number;
  subject: Subject;
  questionSnapshot: Record<string, unknown>;
  latestAnswerSnapshot: MistakeBookAnswerSnapshotDto;
  mistakeBookSource: MistakeBookSource;
  mistakeBookStatus: MistakeBookStatus;
  wrongCount: number;
  isFavorite: boolean;
  isRemoved: boolean;
  masteredAt: string | null;
  latestWrongAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MistakeBookListResultDto = {
  mistakeBooks: MistakeBookItemDto[];
};

export type MistakeBookResultDto = {
  mistakeBook: MistakeBookItemDto;
};
