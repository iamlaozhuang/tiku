import { describe, expect, it } from "vitest";

import type {
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
} from "../contracts/personal-ai-generation-learning-session-contract";
import {
  createLearningAnswerFeedbackInsertValue,
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
    answerRevision: 1,
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
  const insertValue = createLearningAnswerFeedbackInsertValue({
    sessionId: 31,
    answerFeedback: feedback,
  });

  return {
    id: 41,
    public_id: `${feedback.sessionPublicId}_${feedback.sessionQuestionPublicId}`,
    personal_ai_learning_session_id: 31,
    learning_session_public_id: feedback.sessionPublicId,
    session_question_public_id: feedback.sessionQuestionPublicId,
    actor_public_id: feedback.actorPublicId,
    answer_revision: insertValue.answer_revision ?? null,
    answer_command_digest: insertValue.answer_command_digest ?? null,
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
    async trySaveAnswerFeedbackRows(input) {
      upsertedFeedbacks.push(input.answerFeedback);
      return [createFeedbackRow(input.answerFeedback)];
    },
    async findAnswerFeedbackRowsBySessionQuestion() {
      return [createFeedbackRow(createFeedback())];
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

    await repository.saveAnswerFeedback({
      expectedAnswerRevision: 0,
      answerFeedback: feedback,
    });

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

  it("materializes a current answer revision and deterministic command digest on first insert", () => {
    const insertValue = createLearningAnswerFeedbackInsertValue({
      sessionId: 31,
      answerFeedback: createFeedback(),
    });
    const retriedValue = createLearningAnswerFeedbackInsertValue({
      sessionId: 31,
      answerFeedback: createFeedback({
        submittedAt: "2026-07-24T08:00:00.000Z",
      }),
    });
    const differentAnswerValue = createLearningAnswerFeedbackInsertValue({
      sessionId: 31,
      answerFeedback: createFeedback({
        selectedOptionLabels: ["B"],
        isCorrect: false,
        score: "0.0",
      }),
    });

    expect(insertValue).toMatchObject({
      answer_revision: 1,
      answer_command_digest: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(retriedValue.answer_command_digest).toBe(
      insertValue.answer_command_digest,
    );
    expect(differentAnswerValue.answer_command_digest).not.toBe(
      insertValue.answer_command_digest,
    );
  });

  it("returns the one authoritative persisted row for an accepted answer command", async () => {
    const gateway = createGateway();
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);
    const answerFeedback = createFeedback();

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback,
      }),
    ).resolves.toEqual({
      status: "saved",
      blockReason: null,
      answerFeedback,
    });
    expect(gateway.upsertedFeedbacks).toEqual([answerFeedback]);
  });

  it("advances revision one to two only through the current digest-bound CAS", async () => {
    const gateway = createGateway();
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);
    const revisedFeedback = createFeedback({
      answerRevision: 2,
      selectedOptionLabels: ["B"],
      isCorrect: false,
      score: "0.0",
      submittedAt: "2026-07-24T07:30:00.000Z",
    });

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 1,
        answerFeedback: revisedFeedback,
      }),
    ).resolves.toEqual({
      status: "saved",
      blockReason: null,
      answerFeedback: revisedFeedback,
    });
    expect(gateway.upsertedFeedbacks).toEqual([revisedFeedback]);
  });

  it("keeps the persisted feedback snapshot timestamp monotonic during clock rollback", async () => {
    const gateway = createGateway();
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);
    const rollbackFeedback = createFeedback({
      answerRevision: 2,
      selectedOptionLabels: ["B"],
      isCorrect: false,
      score: "0.0",
      submittedAt: "2026-07-06T03:25:00.000Z",
    });

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 1,
        answerFeedback: rollbackFeedback,
      }),
    ).resolves.toEqual({
      status: "saved",
      blockReason: null,
      answerFeedback: expect.objectContaining({
        answerRevision: 2,
        submittedAt: "2026-07-06T03:26:00.000Z",
      }),
    });
    expect(gateway.upsertedFeedbacks).toEqual([
      expect.objectContaining({
        submittedAt: "2026-07-06T03:26:00.000Z",
      }),
    ]);
    expect(rollbackFeedback.submittedAt).toBe("2026-07-06T03:25:00.000Z");
  });

  it("fails closed when an accepted mutation returns more than one row", async () => {
    const feedback = createFeedback();
    const row = createFeedbackRow(feedback);
    const gateway = createGateway({
      async trySaveAnswerFeedbackRows() {
        return [row, { ...row, id: row.id + 1 }];
      },
    });
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback: feedback,
      }),
    ).resolves.toEqual({
      status: "blocked",
      blockReason: "answer_history_unavailable",
      answerFeedback: null,
    });
  });

  it("classifies an exact CAS loser as a read-only replay and preserves the first timestamp", async () => {
    const gateway = createGateway();
    const persistedAnswerFeedback = createFeedback({
      submittedAt: "2026-07-24T07:00:00.000Z",
    });
    const jsonbOrderedFormalWriteBoundary = {
      answerRecordWriteStatus: "blocked" as const,
      examReportWriteStatus: "blocked" as const,
      mistakeBookWriteStatus: "blocked" as const,
      paperWriteStatus: "blocked" as const,
      practiceWriteStatus: "blocked" as const,
      questionWriteStatus: "blocked" as const,
    };
    const persistedRow = createFeedbackRow(persistedAnswerFeedback);
    persistedRow.formal_write_boundary = jsonbOrderedFormalWriteBoundary;
    persistedRow.answer_feedback_snapshot = {
      ...persistedAnswerFeedback,
      formalWriteBoundary: jsonbOrderedFormalWriteBoundary,
    };
    const replayedCommand = createFeedback({
      submittedAt: "2026-07-24T07:30:00.000Z",
    });
    Reflect.set(gateway, "trySaveAnswerFeedbackRows", async () => []);
    Reflect.set(
      gateway,
      "findAnswerFeedbackRowsBySessionQuestion",
      async () => [persistedRow],
    );
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback: replayedCommand,
      }),
    ).resolves.toEqual({
      status: "replayed",
      blockReason: null,
      answerFeedback: persistedAnswerFeedback,
    });
    expect(gateway.upsertedFeedbacks).toEqual([]);
  });

  it("rejects a digest-only replay when the complete persisted facts differ", async () => {
    const requestedCommand = createFeedback();
    const persistedWinner = createFeedback({
      selectedOptionLabels: ["B"],
      isCorrect: false,
      score: "0.0",
    });
    const requestedDigest = createLearningAnswerFeedbackInsertValue({
      sessionId: 31,
      answerFeedback: requestedCommand,
    }).answer_command_digest;
    const corruptedWinnerRow = {
      ...createFeedbackRow(persistedWinner),
      answer_command_digest: requestedDigest ?? null,
    };
    const gateway = createGateway({
      async trySaveAnswerFeedbackRows() {
        return [];
      },
      async findAnswerFeedbackRowsBySessionQuestion() {
        return [corruptedWinnerRow];
      },
    });
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback: requestedCommand,
      }),
    ).resolves.toEqual({
      status: "blocked",
      blockReason: "answer_history_unavailable",
      answerFeedback: null,
    });
    expect(gateway.upsertedFeedbacks).toEqual([]);
  });

  it("fails closed when a persisted formal-write boundary value drifts", async () => {
    const requestedCommand = createFeedback();
    const corruptedWinnerRow = createFeedbackRow(requestedCommand);
    const corruptedBoundary = structuredClone(
      requestedCommand.formalWriteBoundary,
    );
    Reflect.set(corruptedBoundary, "questionWriteStatus", "allowed");
    corruptedWinnerRow.formal_write_boundary = corruptedBoundary;
    const gateway = createGateway({
      async trySaveAnswerFeedbackRows() {
        return [];
      },
      async findAnswerFeedbackRowsBySessionQuestion() {
        return [corruptedWinnerRow];
      },
    });
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback: requestedCommand,
      }),
    ).resolves.toEqual({
      status: "blocked",
      blockReason: "answer_history_unavailable",
      answerFeedback: null,
    });
    expect(gateway.upsertedFeedbacks).toEqual([]);
  });

  it("returns a stable conflict when the same expected revision loses to different facts", async () => {
    const gateway = createGateway();
    const persistedWinner = createFeedback({
      selectedOptionLabels: ["B"],
      isCorrect: false,
      score: "0.0",
    });
    Reflect.set(gateway, "trySaveAnswerFeedbackRows", async () => []);
    Reflect.set(
      gateway,
      "findAnswerFeedbackRowsBySessionQuestion",
      async () => [createFeedbackRow(persistedWinner)],
    );
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback: createFeedback(),
      }),
    ).resolves.toEqual({
      status: "blocked",
      blockReason: "answer_revision_conflict",
      answerFeedback: null,
    });
    expect(gateway.upsertedFeedbacks).toEqual([]);
  });

  it("lets only one of two concurrent commands with the same expected revision mutate", async () => {
    let persistedRow: PersonalAiLearningAnswerFeedbackRow | null = null;
    let mutationCount = 0;
    const gateway = createGateway({
      async trySaveAnswerFeedbackRows(input) {
        await Promise.resolve();

        if (persistedRow !== null) {
          return [];
        }

        persistedRow = createFeedbackRow(input.answerFeedback);
        mutationCount += 1;
        return [persistedRow];
      },
      async findAnswerFeedbackRowsBySessionQuestion() {
        return persistedRow === null ? [] : [persistedRow];
      },
    });
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);
    const firstCommand = createFeedback();
    const secondCommand = createFeedback({
      selectedOptionLabels: ["B"],
      isCorrect: false,
      score: "0.0",
    });

    const results = await Promise.all([
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback: firstCommand,
      }),
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 0,
        answerFeedback: secondCommand,
      }),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([
      "blocked",
      "saved",
    ]);
    expect(results).toContainEqual({
      status: "blocked",
      blockReason: "answer_revision_conflict",
      answerFeedback: null,
    });
    expect(mutationCount).toBe(1);
  });

  it("does not upgrade a corrupt current answer before the revision CAS", async () => {
    const gateway = createGateway({
      async findAnswerFeedbackRowsBySessionQuestion() {
        return [
          {
            ...createFeedbackRow(createFeedback()),
            answer_command_digest: "a".repeat(64),
          },
        ];
      },
    });
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 1,
        answerFeedback: createFeedback({
          answerRevision: 2,
          selectedOptionLabels: ["B"],
          isCorrect: false,
          score: "0.0",
        }),
      }),
    ).resolves.toEqual({
      status: "blocked",
      blockReason: "answer_history_unavailable",
      answerFeedback: null,
    });
    expect(gateway.upsertedFeedbacks).toEqual([]);
  });

  it.each([
    {
      label: "legacy all-null",
      createRows: () => [
        {
          ...createFeedbackRow(createFeedback()),
          answer_revision: null,
          answer_command_digest: null,
        },
      ],
    },
    {
      label: "partial marker",
      createRows: () => [
        {
          ...createFeedbackRow(createFeedback()),
          answer_command_digest: null,
        },
      ],
    },
    {
      label: "duplicate rows",
      createRows: () => {
        const row = createFeedbackRow(createFeedback());
        return [row, { ...row, id: row.id + 1 }];
      },
    },
  ])("does not upgrade $label answer history", async ({ createRows }) => {
    const gateway = createGateway({
      async findAnswerFeedbackRowsBySessionQuestion() {
        return createRows();
      },
    });
    const repository =
      createPersonalAiGenerationLearningSessionRepository(gateway);

    await expect(
      repository.saveAnswerFeedback({
        expectedAnswerRevision: 1,
        answerFeedback: createFeedback({ answerRevision: 2 }),
      }),
    ).resolves.toEqual({
      status: "blocked",
      blockReason: "answer_history_unavailable",
      answerFeedback: null,
    });
    expect(gateway.upsertedFeedbacks).toEqual([]);
  });
});
