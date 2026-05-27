import type {
  ExamReportDetailDto,
  ExamReportSummaryDto,
} from "../contracts/exam-report-contract";
import type { ExamReportRow } from "../repositories/exam-report-repository";

export function mapExamReportSummaryToApi(
  examReport: ExamReportRow,
): ExamReportSummaryDto {
  return {
    publicId: examReport.public_id,
    examReportPublicId: examReport.exam_report_public_id,
    mockExamPublicId: examReport.mock_exam_public_id,
    paperPublicId: examReport.paper_public_id,
    paperName: examReport.paper_name,
    profession: examReport.profession,
    level: examReport.level,
    subject: examReport.subject,
    examStatus: examReport.exam_status,
    objectiveScore: examReport.objective_score,
    subjectiveScore: examReport.subjective_score,
    totalScore: examReport.total_score,
    durationSecond: examReport.duration_second,
    startedAt: examReport.started_at.toISOString(),
    generatedAt: examReport.generated_at.toISOString(),
  };
}

export function mapExamReportDetailToApi(
  examReport: ExamReportRow,
): ExamReportDetailDto {
  return {
    ...mapExamReportSummaryToApi(examReport),
    reportSnapshot: examReport.report_snapshot,
    learningSuggestionSnapshot: examReport.learning_suggestion_snapshot,
  };
}
