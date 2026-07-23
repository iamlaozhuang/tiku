import { describe, expect, it } from "vitest";

import {
  buildPracticeResumeProjection,
  mapPracticeAnswerFeedbackToApi,
  mapPracticeToApi,
} from "./practice-mapper";
import type {
  PracticeAnswerFeedbackRow,
  PracticeAnswerResumeRow,
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

function createAnswerResumeRow(
  overrides: Partial<PracticeAnswerResumeRow> = {},
): PracticeAnswerResumeRow {
  return {
    public_id: "answer_record_public_123",
    exam_mode: "practice",
    paper_question_public_id: "paper_question_public_123",
    question_public_id: "question_public_123",
    answer_snapshot: {
      selectedLabels: ["A"],
      textAnswer: null,
      savedFromClientAt: "2026-05-19T08:05:00.000Z",
    },
    answer_record_status: "scored",
    is_correct: true,
    score: "1.0",
    max_score: "1.0",
    practice_attempt_number: 1,
    practice_max_attempt_count: 1,
    mistake_book_public_id: null,
    answered_at: answeredAt,
    submitted_at: answeredAt,
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

  it("builds deterministic answer and feedback progress from persisted attempts", () => {
    const projection = buildPracticeResumeProjection(
      createPracticeRow({
        paper_snapshot: {
          paperSections: [
            {
              paperQuestions: [
                {
                  paperQuestionPublicId: "paper_question_public_123",
                  questionPublicId: "question_public_123",
                  questionType: "single_choice",
                  scoringMethod: "auto_match",
                  standardAnswerRichText: "<p>A</p>",
                  analysisRichText: "<p>解析</p>",
                  score: "1.0",
                },
                {
                  paperQuestionPublicId: "paper_question_public_456",
                  questionPublicId: "question_public_456",
                  questionType: "single_choice",
                  scoringMethod: "auto_match",
                  standardAnswerRichText: "<p>B</p>",
                  analysisRichText: "<p>第二题解析</p>",
                  score: "2.0",
                },
              ],
            },
          ],
        },
      }).paper_snapshot,
      [createAnswerResumeRow()],
    );

    expect(projection).toEqual({
      currentQuestionIndex: 1,
      questionProgress: [
        {
          paperQuestionPublicId: "paper_question_public_123",
          answerRecord: expect.objectContaining({
            publicId: "answer_record_public_123",
            answerSnapshot: expect.objectContaining({ selectedLabels: ["A"] }),
          }),
          feedback: expect.objectContaining({
            answerRecordPublicId: "answer_record_public_123",
            isCorrect: true,
            standardAnswerRichText: "<p>A</p>",
            analysisRichText: "<p>解析</p>",
            aiExplanationStatus: "unavailable",
            retryRemainingCount: 0,
          }),
          attemptNumber: 1,
          maxAttemptCount: 1,
          stage: "terminal",
          nextAction: "continue",
        },
      ],
    });
  });

  it("fails closed for ambiguous legacy and numbered attempt history", () => {
    const paperSnapshot = createPracticeRow({
      paper_snapshot: {
        paperSections: [
          {
            paperQuestions: [
              {
                paperQuestionPublicId: "paper_question_public_123",
                questionPublicId: "question_public_123",
                questionType: "single_choice",
                scoringMethod: "auto_match",
                standardAnswerRichText: "<p>A</p>",
                analysisRichText: "<p>解析</p>",
              },
            ],
          },
        ],
      },
    }).paper_snapshot;

    expect(
      buildPracticeResumeProjection(paperSnapshot, [
        createAnswerResumeRow({
          practice_attempt_number: null,
          practice_max_attempt_count: null,
        }),
        createAnswerResumeRow({
          public_id: "answer_record_public_456",
          practice_attempt_number: 1,
          practice_max_attempt_count: 1,
        }),
      ]),
    ).toBeNull();
  });

  it("restores the latest subjective fill_blank attempt from its scoring contract", () => {
    const paperSnapshot = createPracticeRow({
      paper_snapshot: {
        paperSections: [
          {
            paperQuestions: [
              {
                paperQuestionPublicId: "paper_question_public_123",
                questionPublicId: "question_public_123",
                questionType: "fill_blank",
                scoringMethod: "ai_scoring",
                standardAnswerRichText: "<p>权威答案</p>",
                analysisRichText: "<p>权威解析</p>",
              },
            ],
          },
        ],
      },
    }).paper_snapshot;
    const firstAttempt = createAnswerResumeRow({
      public_id: "answer_record_public_1",
      answer_snapshot: {
        selectedLabels: [],
        textAnswer: "第一次回答",
        savedFromClientAt: null,
      },
      answer_record_status: "submitted",
      is_correct: null,
      score: null,
      max_score: "2.0",
      practice_attempt_number: 1,
      practice_max_attempt_count: 2,
    });
    const secondAttempt = createAnswerResumeRow({
      public_id: "answer_record_public_2",
      answer_snapshot: {
        selectedLabels: [],
        textAnswer: "第二次回答",
        savedFromClientAt: null,
      },
      answer_record_status: "submitted",
      is_correct: null,
      score: null,
      max_score: "2.0",
      practice_attempt_number: 2,
      practice_max_attempt_count: 2,
    });

    expect(
      buildPracticeResumeProjection(paperSnapshot, [
        firstAttempt,
        secondAttempt,
      ]),
    ).toEqual({
      currentQuestionIndex: 0,
      questionProgress: [
        expect.objectContaining({
          paperQuestionPublicId: "paper_question_public_123",
          answerRecord: expect.objectContaining({
            publicId: "answer_record_public_2",
            answerSnapshot: expect.objectContaining({
              textAnswer: "第二次回答",
            }),
          }),
          feedback: expect.objectContaining({
            aiHintStatus: "unavailable",
            retryRemainingCount: 0,
          }),
          attemptNumber: 2,
          maxAttemptCount: 2,
          nextAction: "complete",
        }),
      ],
    });
  });
});
