import { describe, expect, it } from "vitest";

import {
  mapPracticeAnswerFeedbackToApi,
  mapPracticeToApi,
} from "./practice-mapper";
import type {
  PracticeAnswerFeedbackRow,
  PracticeRow,
} from "../repositories/practice-repository";

const startedAt = new Date("2026-05-19T08:00:00.000Z");
const expiresAt = new Date("2026-06-03T08:00:00.000Z");
const answeredAt = new Date("2026-05-19T08:05:00.000Z");

function createPracticeRow(overrides: Partial<PracticeRow> = {}): PracticeRow {
  return {
    id: 1001,
    public_id: "practice_public_123",
    paper_public_id: "paper_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    practice_status: "in_progress",
    started_at: startedAt,
    last_answered_at: null,
    expires_at: expiresAt,
    paper_snapshot: {
      paperPublicId: "paper_public_123",
      name: "2024年专卖三级理论真题",
      paperSections: [
        {
          paperQuestions: [
            {
              paperQuestionPublicId: "paper_question_public_123",
              standardAnswerLabels: ["A"],
              scoringPoints: [{ description: "评分点" }],
            },
          ],
        },
      ],
    },
    authorization_source: null,
    authorization_public_id: null,
    authorization_organization_public_id: null,
    quota_owner_type: null,
    quota_owner_public_id: null,
    ...overrides,
  };
}

function createFeedbackRow(
  overrides: Partial<PracticeAnswerFeedbackRow> = {},
): PracticeAnswerFeedbackRow {
  return {
    answer_record_public_id: "answer_record_public_123",
    is_correct: false,
    score: "0.0",
    max_score: "1.0",
    standard_answer_rich_text: "<p>A</p>",
    analysis_rich_text: "<p>解析</p>",
    mistake_book_public_id: "mistake_book_public_123",
    ai_explanation_status: null,
    ai_explanation_text: null,
    ai_explanation_learning_suggestion: null,
    ai_explanation_evidence_status: null,
    ai_explanation_citations: [],
    ai_hint_status: null,
    ai_hint_text: null,
    ai_hint_improvement_directions: [],
    ai_hint_evidence_status: null,
    ai_hint_citations: [],
    retry_remaining_count: 0,
    answered_at: answeredAt,
    ...overrides,
  };
}

describe("practice mapper", () => {
  it("maps practice row to student API dto without internal numeric id", () => {
    expect(mapPracticeToApi(createPracticeRow())).toEqual({
      publicId: "practice_public_123",
      paperPublicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      practiceStatus: "in_progress",
      startedAt: "2026-05-19T08:00:00.000Z",
      lastAnsweredAt: null,
      expiresAt: "2026-06-03T08:00:00.000Z",
      currentQuestionIndex: 0,
      questionCount: 1,
      paperSnapshot: {
        paperPublicId: "paper_public_123",
        name: "2024年专卖三级理论真题",
        paperSections: [
          {
            paperQuestions: [
              {
                paperQuestionPublicId: "paper_question_public_123",
              },
            ],
          },
        ],
      },
    });
  });

  it("counts nested question_group children and preserves their learner-safe hierarchy", () => {
    const mapped = mapPracticeToApi(
      createPracticeRow({
        paper_snapshot: {
          snapshotVersion: 2,
          paperSections: [
            {
              publicId: "paper_section_public_1",
              title: "技能模块",
              sortOrder: 1,
              paperQuestions: [],
              questionGroups: [
                {
                  publicId: "qgroup_public_1",
                  title: "材料题组",
                  sortOrder: 1,
                  totalScore: "2.0",
                  materialSnapshot: { title: "共享材料" },
                  paperQuestions: [
                    {
                      paperQuestionPublicId: "paper_question_public_1",
                      questionPublicId: "question_public_1",
                      score: "1.0",
                      standardAnswerRichText: "teacher-only",
                    },
                    {
                      paperQuestionPublicId: "paper_question_public_2",
                      questionPublicId: "question_public_2",
                      score: "1.0",
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
    );

    expect(mapped.questionCount).toBe(2);
    expect(mapped.paperSnapshot).toMatchObject({
      snapshotVersion: 2,
      paperSections: [
        {
          questionGroups: [
            {
              publicId: "qgroup_public_1",
              materialSnapshot: { title: "共享材料" },
              paperQuestions: [
                { paperQuestionPublicId: "paper_question_public_1" },
                { paperQuestionPublicId: "paper_question_public_2" },
              ],
            },
          ],
        },
      ],
    });
    expect(JSON.stringify(mapped.paperSnapshot)).not.toContain(
      "standardAnswerRichText",
    );
  });

  it("maps answer feedback row to API dto with immediate objective feedback", () => {
    expect(mapPracticeAnswerFeedbackToApi(createFeedbackRow())).toEqual({
      answerRecordPublicId: "answer_record_public_123",
      isCorrect: false,
      score: "0.0",
      maxScore: "1.0",
      standardAnswerRichText: "<p>A</p>",
      analysisRichText: "<p>解析</p>",
      mistakeBookPublicId: "mistake_book_public_123",
      aiExplanationStatus: null,
      aiExplanationText: null,
      aiExplanationLearningSuggestion: null,
      aiExplanationEvidenceStatus: null,
      aiExplanationCitations: [],
      aiHintStatus: null,
      aiHintText: null,
      aiHintImprovementDirections: [],
      aiHintEvidenceStatus: null,
      aiHintCitations: [],
      retryRemainingCount: 0,
      answeredAt: "2026-05-19T08:05:00.000Z",
    });
  });
});
