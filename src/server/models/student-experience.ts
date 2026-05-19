import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  answerRecord,
  answerRecordStatusValues,
  examModeValues,
  examReport,
  examStatusValues,
  mistakeBook,
  mistakeBookSourceValues,
  mistakeBookStatusValues,
  mockExam,
  practice,
  practiceStatusValues,
} from "@/db/schema/student-experience";

export {
  answerRecordStatusValues,
  examModeValues,
  examStatusValues,
  mistakeBookSourceValues,
  mistakeBookStatusValues,
  practiceStatusValues,
};

export type ExamMode = (typeof examModeValues)[number];
export type ExamStatus = (typeof examStatusValues)[number];
export type PracticeStatus = (typeof practiceStatusValues)[number];
export type AnswerRecordStatus = (typeof answerRecordStatusValues)[number];
export type MistakeBookSource = (typeof mistakeBookSourceValues)[number];
export type MistakeBookStatus = (typeof mistakeBookStatusValues)[number];

export type PracticeRow = InferSelectModel<typeof practice>;
export type NewPracticeRow = InferInsertModel<typeof practice>;

export type MockExamRow = InferSelectModel<typeof mockExam>;
export type NewMockExamRow = InferInsertModel<typeof mockExam>;

export type AnswerRecordRow = InferSelectModel<typeof answerRecord>;
export type NewAnswerRecordRow = InferInsertModel<typeof answerRecord>;

export type ExamReportRow = InferSelectModel<typeof examReport>;
export type NewExamReportRow = InferInsertModel<typeof examReport>;

export type MistakeBookRow = InferSelectModel<typeof mistakeBook>;
export type NewMistakeBookRow = InferInsertModel<typeof mistakeBook>;
