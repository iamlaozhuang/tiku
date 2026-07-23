import type { Profession, Subject } from "../models/paper";
import type { ExamStatus } from "../models/student-experience";

export type ExamReportSnapshotDto = Record<string, unknown>;

export type LearningSuggestionSnapshotDto = Record<string, unknown> | null;

export type LearningSuggestionLifecycleStatus =
  | "unavailable"
  | "pending"
  | "running"
  | "succeeded"
  | "failed";

export type LearningSuggestionFailureCategory =
  | "configuration_unavailable"
  | "input_unavailable"
  | "provider_failed"
  | "timeout";

export type LearningSuggestionLifecycleDto = {
  status: LearningSuggestionLifecycleStatus;
  failureCategory: LearningSuggestionFailureCategory | null;
  canRetry: boolean;
};

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
  learningSuggestionLifecycle: LearningSuggestionLifecycleDto;
};

export type ExamReportListResultDto = {
  examReports: ExamReportSummaryDto[];
};

export type ExamReportResultDto = {
  examReport: ExamReportDetailDto;
};
