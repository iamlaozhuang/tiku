import { describe, expect, it } from "vitest";

import type {
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
} from "../contracts/personal-ai-generation-learning-session-contract";
import {
  createPersonalAiGenerationLearningSessionRepository,
  type PersonalAiGenerationLearningSessionGateway,
  type PersonalAiGenerationLearningSessionRow,
  type PersonalAiLearningAnswerFeedbackRow,
} from "./personal-ai-generation-learning-session-repository";

function createSession(
  overrides: Partial<PersonalAiGenerationLearningSessionDto> = {},
): PersonalAiGenerationLearningSessionDto {
  return {
    sessionPublicId: "ai_learning_session_public_repo_001",
    contentDomain: "personal_ai_learning",
    sourceResultPublicId: "personal_ai_result_public_repo_001",
    sourceTaskPublicId: "ai_generation_task_public_repo_001",
    ownerType: "personal",
    ownerPublicId: "student_public_repo_001",
    actorPublicId: "student_public_repo_001",
    evidenceStatus: "sufficient",
    citationCount: 2,
    questionCount: 1,
    questions: [
      {
        sessionQuestionPublicId: "ai_learning_session_public_repo_001_q_1",
        sourceDraftNumber: 1,
        questionType: "single_choice",
        difficulty: "medium",
        knowledgeNodeLabels: ["knowledge_node_redacted"],
        questionStem: "redacted stem",
        questionOptions: [
          {
            optionLabel: "A",
            optionText: "redacted option",
            isCorrect: true,
          },
        ],
        standardAnswerLabels: ["A"],
        standardAnswerText: null,
        analysis: "redacted analysis",
        maxScore: "1.0",
        reviewStatus: "draft_review_required",
      },
    ],
    formalWriteBoundary: {
      questionWriteStatus: "blocked",
      paperWriteStatus: "blocked",
      practiceWriteStatus: "blocked",
      answerRecordWriteStatus: "blocked",
      examReportWriteStatus: "blocked",
      mistakeBookWriteStatus: "blocked",
    },
    createdAt: "2026-07-06T03:25:00.000Z",
    ...overrides,
  };
}

function createFeedback(
  overrides: Partial<PersonalAiGenerationLearningSessionAnswerFeedbackDto> = {},
): PersonalAiGenerationLearningSessionAnswerFeedbackDto {
  return {
    status: "scored",
    blockReason: null,
    sessionPublicId: "ai_learning_session_public_repo_001",
    sessionQuestionPublicId: "ai_learning_session_public_repo_001_q_1",
    actorPublicId: "student_public_repo_001",
    selectedOptionLabels: ["A"],
    textAnswer: null,
    isCorrect: true,
    score: "1.0",
    maxScore: "1.0",
    standardAnswerLabels: ["A"],
    standardAnswerText: null,
    analysis: "redacted analysis",
    aiScoringStatus: "blocked",
    formalWriteBoundary: {
      questionWriteStatus: "blocked",
      paperWriteStatus: "blocked",
      practiceWriteStatus: "blocked",
      answerRecordWriteStatus: "blocked",
      examReportWriteStatus: "blocked",
      mistakeBookWriteStatus: "blocked",
    },
    mistakeBookPublicId: null,
    submittedAt: "2026-07-06T03:26:00.000Z",
    ...overrides,
  };
}

function createSessionRow(
  session: PersonalAiGenerationLearningSessionDto,
): PersonalAiGenerationLearningSessionRow {
  return {
    id: 31,
    public_id: session.sessionPublicId,
    personal_ai_generation_result_id: 17,
    source_result_public_id: session.sourceResultPublicId ?? "",
    source_task_public_id: session.sourceTaskPublicId,
    content_domain: session.contentDomain,
    owner_type: session.ownerType,
    owner_public_id: session.ownerPublicId,
    actor_public_id: session.actorPublicId,
    evidence_status: session.evidenceStatus,
    citation_count: session.citationCount,
    question_count: session.questionCount,
    question_snapshot: session.questions,
    formal_write_boundary: session.formalWriteBoundary,
    created_at: new Date(session.createdAt),
    updated_at: new Date(session.createdAt),
  };
}

function createFeedbackRow(
  feedback: PersonalAiGenerationLearningSessionAnswerFeedbackDto,
): PersonalAiLearningAnswerFeedbackRow {
  return {
    id: 41,
    public_id: `${feedback.sessionPublicId}_${feedback.sessionQuestionPublicId}`,
    personal_ai_learning_session_id: 31,
    learning_session_public_id: feedback.sessionPublicId,
    session_question_public_id: feedback.sessionQuestionPublicId,
    actor_public_id: feedback.actorPublicId,
    feedback_status: feedback.status,
    selected_option_labels: feedback.selectedOptionLabels,
    text_answer: feedback.textAnswer,
    is_correct: feedback.isCorrect,
    score: feedback.score,
    max_score: feedback.maxScore,
    answer_feedback_snapshot: feedback,
    formal_write_boundary: feedback.formalWriteBoundary,
    submitted_at: new Date(feedback.submittedAt),
    created_at: new Date(feedback.submittedAt),
    updated_at: new Date(feedback.submittedAt),
  };
}

function createGateway(
  overrides: Partial<PersonalAiGenerationLearningSessionGateway> = {},
): PersonalAiGenerationLearningSessionGateway & {
  insertedSessions: PersonalAiGenerationLearningSessionDto[];
  upsertedFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
  sourceResultQueries: Array<{
    sourceResultPublicId: string;
    ownerPublicId: string;
    actorPublicId: string;
  }>;
} {
  const insertedSessions: PersonalAiGenerationLearningSessionDto[] = [];
  const upsertedFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[] =
    [];
  const sourceResultQueries: Array<{
    sourceResultPublicId: string;
    ownerPublicId: string;
    actorPublicId: string;
  }> = [];

  return {
    insertedSessions,
    upsertedFeedbacks,
    sourceResultQueries,
    async findSourceResultRowByPublicId(query) {
      sourceResultQueries.push(query);

      return {
        id: 17,
        public_id: "personal_ai_result_public_repo_001",
        owner_public_id: "student_public_repo_001",
        actor_public_id: "student_public_repo_001",
      };
    },
    async insertOrReuseSessionRow(input) {
      insertedSessions.push(input.session);
      return createSessionRow(input.session);
    },
    async findSessionRowByPublicId() {
      return createSessionRow(createSession());
    },
    async upsertAnswerFeedbackRow(input) {
      upsertedFeedbacks.push(input.answerFeedback);
      return createFeedbackRow(input.answerFeedback);
    },
    async listAnswerFeedbackRowsBySessionPublicId() {
      return [createFeedbackRow(createFeedback())];
    },
    ...overrides,
  };
}

describe("personal AI generation learning session repository", () => {
  it("saves a learning session against an existing persisted generation result", async () => {
    const gateway = createGateway();
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);
    const session = createSession();

    await expect(repository.saveSession(session)).resolves.toEqual({
      status: "saved",
      blockReason: null,
    });

    expect(gateway.insertedSessions).toHaveLength(1);
    expect(gateway.insertedSessions[0]).toMatchObject({
      sessionPublicId: "ai_learning_session_public_repo_001",
      sourceResultPublicId: "personal_ai_result_public_repo_001",
      formalWriteBoundary: {
        practiceWriteStatus: "blocked",
        answerRecordWriteStatus: "blocked",
        examReportWriteStatus: "blocked",
        mistakeBookWriteStatus: "blocked",
      },
    });
    expect(gateway.sourceResultQueries).toEqual([
      {
        sourceResultPublicId: "personal_ai_result_public_repo_001",
        ownerPublicId: "student_public_repo_001",
        actorPublicId: "student_public_repo_001",
      },
    ]);
  });

  it("fails closed when the source generation result is missing or actor-mismatched", async () => {
    const repository = createPersonalAiGenerationLearningSessionRepository(
      createGateway({
        async findSourceResultRowByPublicId() {
          return null;
        },
      }),
    );

    await expect(repository.saveSession(createSession())).resolves.toEqual({
      status: "blocked",
      blockReason: "source_result_not_found",
    });
  });

  it("fails closed when an organization-owned source result belongs to another employee actor", async () => {
    const gateway = createGateway({
      async findSourceResultRowByPublicId(query) {
        gateway.sourceResultQueries.push(query);

        return query.actorPublicId === "employee_user_public_owner"
          ? {
              id: 17,
              public_id: query.sourceResultPublicId,
              owner_public_id: query.ownerPublicId,
              actor_public_id: query.actorPublicId,
            }
          : null;
      },
    });
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveSession(
        createSession({
          ownerType: "organization",
          ownerPublicId: "organization_public_repo_001",
          actorPublicId: "employee_user_public_other",
        }),
      ),
    ).resolves.toEqual({
      status: "blocked",
      blockReason: "source_result_not_found",
    });
    expect(gateway.insertedSessions).toEqual([]);
    expect(gateway.sourceResultQueries).toEqual([
      {
        sourceResultPublicId: "personal_ai_result_public_repo_001",
        ownerPublicId: "organization_public_repo_001",
        actorPublicId: "employee_user_public_other",
      },
    ]);
  });

  it("returns persisted session and latest answer feedback snapshots", async () => {
    const gateway = createGateway();
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);
    const feedback = createFeedback({
      selectedOptionLabels: ["B"],
      isCorrect: false,
      score: "0.0",
    });

    await repository.saveAnswerFeedback(feedback);

    await expect(
      repository.findSessionByPublicId("ai_learning_session_public_repo_001"),
    ).resolves.toMatchObject({
      sessionPublicId: "ai_learning_session_public_repo_001",
      questionCount: 1,
      questions: [
        expect.objectContaining({
          sessionQuestionPublicId: "ai_learning_session_public_repo_001_q_1",
        }),
      ],
    });
    await expect(
      repository.listAnswerFeedbackBySessionPublicId(
        "ai_learning_session_public_repo_001",
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        sessionPublicId: "ai_learning_session_public_repo_001",
        sessionQuestionPublicId: "ai_learning_session_public_repo_001_q_1",
        status: "scored",
      }),
    ]);
    expect(gateway.upsertedFeedbacks).toEqual([feedback]);
  });
});
