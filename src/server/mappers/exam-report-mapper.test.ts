import { describe, expect, it } from "vitest";

import {
  mapExamReportDetailToApi,
  mapExamReportSummaryToApi,
} from "./exam-report-mapper";
import type { ExamReportRow } from "../repositories/exam-report-repository";

const generatedAt = new Date("2026-05-19T09:00:00.000Z");
const startedAt = new Date("2026-05-19T08:00:00.000Z");
const createdAt = new Date("2026-05-19T09:00:01.000Z");
const updatedAt = new Date("2026-05-19T09:00:02.000Z");

function createExamReportRow(
  overrides: Partial<ExamReportRow> = {},
): ExamReportRow {
  return {
    id: 3001,
    public_id: "exam_report_public_123",
    exam_report_public_id: "exam_report_public_123",
    mock_exam_public_id: "mock_exam_public_123",
    paper_public_id: "paper_public_123",
    paper_name: "2024年专卖三级理论真题",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "completed",
    objective_score: "12.0",
    subjective_score: null,
    total_score: "12.0",
    duration_second: 3600,
    report_snapshot: {
      paperName: "2024年专卖三级理论真题",
      scoreSummary: {
        objectiveScore: "12.0",
        subjectiveScore: null,
        totalScore: "12.0",
      },
      questionDetails: [],
    },
    learning_suggestion_snapshot: null,
    learning_suggestion_status: null,
    learning_suggestion_attempt_count: null,
    learning_suggestion_input_digest: null,
    learning_suggestion_claimed_at: null,
    learning_suggestion_completed_at: null,
    learning_suggestion_failure_category: null,
    generated_at: generatedAt,
    started_at: startedAt,
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
    report_revision:
      overrides.report_revision === undefined ? 1 : overrides.report_revision,
  };
}

describe("exam report mapper", () => {
  it("maps exam_report row to summary dto with public identifiers only", () => {
    const summary = mapExamReportSummaryToApi(createExamReportRow());

    expect(summary).toEqual({
      publicId: "exam_report_public_123",
      examReportPublicId: "exam_report_public_123",
      mockExamPublicId: "mock_exam_public_123",
      paperPublicId: "paper_public_123",
      paperName: "2024年专卖三级理论真题",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      examStatus: "completed",
      objectiveScore: "12.0",
      subjectiveScore: null,
      totalScore: "12.0",
      durationSecond: 3600,
      startedAt: "2026-05-19T08:00:00.000Z",
      generatedAt: "2026-05-19T09:00:00.000Z",
    });
    expect(JSON.stringify(summary)).not.toContain("3001");
  });

  it("maps exam_report row to detail dto with immutable report snapshot", () => {
    expect(mapExamReportDetailToApi(createExamReportRow())).toEqual({
      publicId: "exam_report_public_123",
      examReportPublicId: "exam_report_public_123",
      mockExamPublicId: "mock_exam_public_123",
      paperPublicId: "paper_public_123",
      paperName: "2024年专卖三级理论真题",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      examStatus: "completed",
      objectiveScore: "12.0",
      subjectiveScore: null,
      totalScore: "12.0",
      durationSecond: 3600,
      startedAt: "2026-05-19T08:00:00.000Z",
      generatedAt: "2026-05-19T09:00:00.000Z",
      reportSnapshot: {
        paperName: "2024年专卖三级理论真题",
        scoreSummary: {
          objectiveScore: "12.0",
          subjectiveScore: null,
          totalScore: "12.0",
        },
        questionDetails: [],
      },
      learningSuggestionSnapshot: null,
      learningSuggestionLifecycle: {
        status: "unavailable",
        failureCategory: null,
        canRetry: false,
      },
    });
  });
});
