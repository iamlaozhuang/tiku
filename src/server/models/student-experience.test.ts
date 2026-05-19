import { describe, expect, it } from "vitest";

import {
  answerRecordStatusValues,
  examModeValues,
  examStatusValues,
  mistakeBookSourceValues,
  mistakeBookStatusValues,
  practiceStatusValues,
  type AnswerRecordRow,
  type ExamReportRow,
  type MistakeBookRow,
  type MockExamRow,
  type PracticeRow,
} from "./student-experience";

const createdAt = new Date("2026-05-19T12:00:00.000Z");

describe("student experience domain models", () => {
  it("exports Phase 4 enum values from the schema boundary", () => {
    expect(examModeValues).toEqual(["practice", "mock_exam"]);
    expect(examStatusValues).toEqual([
      "in_progress",
      "scoring",
      "scoring_partial_failed",
      "completed",
      "terminated",
    ]);
    expect(practiceStatusValues).toEqual([
      "in_progress",
      "completed",
      "expired",
      "terminated",
    ]);
    expect(answerRecordStatusValues).toEqual([
      "draft",
      "saved",
      "submitted",
      "scored",
      "scoring_failed",
    ]);
    expect(mistakeBookSourceValues).toEqual(["wrong_answer", "favorite"]);
    expect(mistakeBookStatusValues).toEqual([
      "unmastered",
      "mastered",
      "removed",
    ]);
  });

  it("keeps practice and mock exam rows in snake_case storage shape", () => {
    const practiceRow = {
      id: 1,
      public_id: "practice_public_id",
      user_id: 10,
      paper_id: 20,
      paper_public_id: "paper_public_id",
      paper_snapshot: { paperPublicId: "paper_public_id" },
      profession: "monopoly",
      level: 3,
      subject: "theory",
      practice_status: "in_progress",
      started_at: createdAt,
      last_answered_at: null,
      expires_at: new Date("2026-06-03T12:00:00.000Z"),
      terminated_at: null,
      termination_reason: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies PracticeRow;

    const mockExamRow = {
      id: 2,
      public_id: "mock_exam_public_id",
      user_id: 10,
      paper_id: 20,
      paper_public_id: "paper_public_id",
      paper_snapshot: { paperPublicId: "paper_public_id" },
      profession: "monopoly",
      level: 3,
      subject: "theory",
      exam_status: "in_progress",
      started_at: createdAt,
      submitted_at: null,
      server_deadline_at: null,
      duration_minute: 120,
      terminated_at: null,
      termination_reason: null,
      objective_score: null,
      subjective_score: null,
      total_score: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies MockExamRow;

    expect(practiceRow).not.toHaveProperty("publicId");
    expect(mockExamRow).not.toHaveProperty("examStatus");
  });

  it("keeps answer, report, and mistake rows separate from API DTOs", () => {
    const answerRecordRow = {
      id: 3,
      public_id: "answer_record_public_id",
      user_id: 10,
      exam_mode: "practice",
      practice_id: 1,
      mock_exam_id: null,
      paper_id: 20,
      paper_question_id: 30,
      paper_question_public_id: "paper_question_public_id",
      question_public_id: "question_public_id",
      question_snapshot: { questionPublicId: "question_public_id" },
      answer_snapshot: { selectedLabels: ["A"], textAnswer: null },
      answer_record_status: "saved",
      is_correct: true,
      score: "1.0",
      max_score: "1.0",
      answered_at: createdAt,
      submitted_at: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies AnswerRecordRow;

    const examReportRow = {
      id: 4,
      public_id: "exam_report_public_id",
      user_id: 10,
      mock_exam_id: 2,
      paper_id: 20,
      paper_public_id: "paper_public_id",
      report_snapshot: { publicId: "exam_report_public_id" },
      exam_status: "completed",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      objective_score: "80.0",
      subjective_score: null,
      total_score: "80.0",
      duration_second: 3600,
      learning_suggestion_snapshot: null,
      generated_at: createdAt,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies ExamReportRow;

    const mistakeBookRow = {
      id: 5,
      public_id: "mistake_book_public_id",
      user_id: 10,
      question_public_id: "question_public_id",
      paper_question_public_id: "paper_question_public_id",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      question_snapshot: { questionPublicId: "question_public_id" },
      latest_answer_snapshot: { selectedLabels: ["B"] },
      mistake_book_source: "wrong_answer",
      mistake_book_status: "unmastered",
      wrong_count: 1,
      is_favorite: false,
      is_removed: false,
      mastered_at: null,
      latest_wrong_at: createdAt,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies MistakeBookRow;

    expect(answerRecordRow).not.toHaveProperty("answerRecordStatus");
    expect(examReportRow).not.toHaveProperty("learningSuggestionSnapshot");
    expect(mistakeBookRow).not.toHaveProperty("mistakeBookStatus");
  });
});
