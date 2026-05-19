import { describe, expect, it } from "vitest";

import {
  mapMockExamAnswerRecordToApi,
  mapMockExamToApi,
} from "./mock-exam-mapper";
import type {
  MockExamAnswerRecordRow,
  MockExamRow,
} from "../repositories/mock-exam-repository";

const startedAt = new Date("2026-05-19T08:00:00.000Z");
const submittedAt = new Date("2026-05-19T09:00:00.000Z");
const serverDeadlineAt = new Date("2026-05-19T10:00:00.000Z");
const serverNow = new Date("2026-05-19T08:30:00.000Z");

function createMockExamRow(overrides: Partial<MockExamRow> = {}): MockExamRow {
  const mockExamRow: MockExamRow = {
    id: 2001,
    public_id: "mock_exam_public_123",
    paper_public_id: "paper_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    exam_status: "in_progress",
    started_at: startedAt,
    submitted_at: null,
    server_deadline_at: serverDeadlineAt,
    duration_minute: 120,
    terminated_at: null,
    termination_reason: null,
    objective_score: null,
    subjective_score: null,
    total_score: null,
    paper_snapshot: {
      paperPublicId: "paper_public_123",
      name: "2024年专卖三级理论真题",
      paperSections: [
        {
          paperQuestions: [
            {
              paperQuestionPublicId: "paper_question_public_123",
            },
            {
              paperQuestionPublicId: "paper_question_public_456",
            },
          ],
        },
      ],
    },
    answered_count: 1,
  };

  return {
    ...mockExamRow,
    ...overrides,
  } as MockExamRow;
}

function createAnswerRecordRow(
  overrides: Partial<MockExamAnswerRecordRow> = {},
): MockExamAnswerRecordRow {
  return {
    public_id: "answer_record_public_123",
    exam_mode: "mock_exam",
    paper_question_public_id: "paper_question_public_123",
    question_public_id: "question_public_123",
    answer_snapshot: {
      selectedLabels: ["A"],
      textAnswer: null,
      savedFromClientAt: "2026-05-19T08:20:00.000Z",
    },
    answer_record_status: "saved",
    is_correct: null,
    score: null,
    max_score: "1.0",
    answered_at: serverNow,
    submitted_at: null,
    ...overrides,
  };
}

describe("mock exam mapper", () => {
  it("maps mock exam row to API dto with server time and no internal id", () => {
    expect(mapMockExamToApi(createMockExamRow(), serverNow)).toEqual({
      publicId: "mock_exam_public_123",
      paperPublicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      examStatus: "in_progress",
      startedAt: "2026-05-19T08:00:00.000Z",
      submittedAt: null,
      serverNow: "2026-05-19T08:30:00.000Z",
      serverDeadlineAt: "2026-05-19T10:00:00.000Z",
      durationMinute: 120,
      questionCount: 2,
      answeredCount: 1,
      paperSnapshot: {
        paperPublicId: "paper_public_123",
        name: "2024年专卖三级理论真题",
        paperSections: [
          {
            paperQuestions: [
              {
                paperQuestionPublicId: "paper_question_public_123",
              },
              {
                paperQuestionPublicId: "paper_question_public_456",
              },
            ],
          },
        ],
      },
    });
  });

  it("maps mock exam answer record without correctness or analysis feedback", () => {
    expect(mapMockExamAnswerRecordToApi(createAnswerRecordRow())).toEqual({
      publicId: "answer_record_public_123",
      examMode: "mock_exam",
      paperQuestionPublicId: "paper_question_public_123",
      questionPublicId: "question_public_123",
      answerSnapshot: {
        selectedLabels: ["A"],
        textAnswer: null,
        savedFromClientAt: "2026-05-19T08:20:00.000Z",
      },
      answerRecordStatus: "saved",
      isCorrect: null,
      score: null,
      maxScore: "1.0",
      answeredAt: "2026-05-19T08:30:00.000Z",
      submittedAt: null,
    });
  });

  it("maps submitted mock exam nullable deadline and scores", () => {
    expect(
      mapMockExamToApi(
        createMockExamRow({
          exam_status: "completed",
          submitted_at: submittedAt,
          server_deadline_at: null,
          duration_minute: null,
          objective_score: "1.0",
          subjective_score: null,
          total_score: "1.0",
        }),
        submittedAt,
      ),
    ).toMatchObject({
      examStatus: "completed",
      submittedAt: "2026-05-19T09:00:00.000Z",
      serverDeadlineAt: null,
      durationMinute: null,
    });
  });
});
