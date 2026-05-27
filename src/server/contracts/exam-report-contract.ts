import type { Profession, Subject } from "../models/paper";
import type { ExamStatus } from "../models/student-experience";

export type ExamReportSnapshotDto = Record<string, unknown>;

export type LearningSuggestionSnapshotDto = Record<string, unknown> | null;

export type ExamReportSummaryDto = {
  publicId: string;
  examReportPublicId: string | null;
  mockExamPublicId: string;
  paperPublicId: string;
  paperName: string;
  profession: Profession;
  level: number;
  subject: Subject;
  examStatus: ExamStatus;
  objectiveScore: string | null;
  subjectiveScore: string | null;
  totalScore: string | null;
  durationSecond: number;
  startedAt: string;
  generatedAt: string;
};

export type ExamReportDetailDto = ExamReportSummaryDto & {
  reportSnapshot: ExamReportSnapshotDto;
  learningSuggestionSnapshot: LearningSuggestionSnapshotDto;
};

export type ExamReportListResultDto = {
  examReports: ExamReportSummaryDto[];
};

export type ExamReportResultDto = {
  examReport: ExamReportDetailDto;
};
