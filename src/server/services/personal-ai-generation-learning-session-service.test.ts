import { describe, expect, it } from "vitest";

import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type { AiGenerationRouteIntegratedStructuredPreview } from "../contracts/route-integrated-provider-execution-contract";
import type {
  PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
  PersonalAiGenerationLearningPaperSourceQuestionDto,
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionRepository,
  PersonalAiGenerationLearningSessionService,
} from "../contracts/personal-ai-generation-learning-session-contract";
import { createPersonalAiGenerationLearningSessionService } from "./personal-ai-generation-learning-session-service";
import { personalAiGenerationLearningSessionQuestionTypeValues } from "../models/personal-ai-generation-learning-session";
import { createPersonalAiGenerationPrivateQuestionDraftSnapshot } from "../validators/personal-ai-generation-result-persistence";

type PaperAssemblyLearningSessionService =
  PersonalAiGenerationLearningSessionService & {
    createLearningSessionFromPaperAssembly(
      input: PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
    ): ReturnType<
      PersonalAiGenerationLearningSessionService["createLearningSession"]
    >;
  };

it("preserves all seven glossary question types in the learning model", () => {
  expect(personalAiGenerationLearningSessionQuestionTypeValues).toEqual([
    "single_choice",
    "multi_choice",
    "true_false",
    "fill_blank",
    "short_answer",
    "case_analysis",
    "calculation",
  ]);
});

function createInMemoryRepository(): PersonalAiGenerationLearningSessionRepository {
  const sessions = new Map<string, PersonalAiGenerationLearningSessionDto>();
  const answerFeedbacks = new Map<
    string,
    PersonalAiGenerationLearningSessionAnswerFeedbackDto
  >();

  const repository: PersonalAiGenerationLearningSessionRepository = {
    async saveSession(session) {
      sessions.set(session.sessionPublicId, session);
      return {
        status: "saved",
        blockReason: null,
      };
    },
    async findSessionByPublicId(sessionPublicId) {
      return sessions.get(sessionPublicId) ?? null;
    },
    async saveAnswerFeedback(answerFeedback) {
      answerFeedbacks.set(
        `${answerFeedback.sessionPublicId}:${answerFeedback.sessionQuestionPublicId}`,
        answerFeedback,
      );
    },
    async listAnswerFeedbackBySessionPublicId(sessionPublicId) {
      return Array.from(answerFeedbacks.values()).filter(
        (answerFeedback) => answerFeedback.sessionPublicId === sessionPublicId,
      );
    },
  };

  return repository;
}

function createQuestionSetPreview(): AiGenerationRouteIntegratedStructuredPreview {
  return {
    kind: "question_set",
    parseStatus: "parsed",
    requestedQuestionCount: 2,
    actualQuestionCount: 2,
    draftCount: 2,
    draftSummaries: [
      {
        draftPublicId: "ai_question_draft_test_1",
        draftNumber: 1,
        questionType: "single_choice",
        difficulty: "medium",
        knowledgeNodeCount: 1,
        knowledgeNodeLabels: ["knowledge_node_a"],
        questionStem: "synthetic stem one",
        questionOptions: [
          {
            optionLabel: "A",
            optionText: "synthetic option a",
          },
          {
            optionLabel: "B",
            optionText: "synthetic option b",
          },
        ],
        standardAnswer: "A",
        analysis: "synthetic analysis one",
        scoringPoints: [],
        fillBlankAnswers: [],
        reviewStatus: "draft_review_required",
      },
      {
        draftPublicId: "ai_question_draft_test_2",
        draftNumber: 2,
        questionType: "true_false",
        difficulty: "easy",
        knowledgeNodeCount: 1,
        knowledgeNodeLabels: ["knowledge_node_b"],
        questionStem: "synthetic stem two",
        questionOptions: [],
        standardAnswer: "false",
        analysis: "synthetic analysis two",
        scoringPoints: [],
        fillBlankAnswers: [],
        reviewStatus: "draft_review_required",
      },
    ],
  };
}

function createQuestionSnapshot(
  structuredPreview: AiGenerationRouteIntegratedStructuredPreview,
  taskPublicId: string,
  ownerPublicId: string,
) {
  if (
    structuredPreview.kind !== "question_set" ||
    structuredPreview.parseStatus !== "parsed"
  ) {
    throw new Error("test question preview must be parsed");
  }

  const snapshot = createPersonalAiGenerationPrivateQuestionDraftSnapshot({
    taskPublicId,
    ownerPublicId,
    requestedQuestionCount: structuredPreview.requestedQuestionCount,
    questions: structuredPreview.draftSummaries,
  });

  if (snapshot === null) {
    throw new Error("test question snapshot must be valid");
  }

  return snapshot;
}

function createSevenTypeQuestionSnapshot() {
  const questionTypes = [
    "single_choice",
    "multi_choice",
    "true_false",
    "fill_blank",
    "short_answer",
    "case_analysis",
    "calculation",
  ] as const;
  const snapshot = createPersonalAiGenerationPrivateQuestionDraftSnapshot({
    taskPublicId: "ai_generation_task_public_seven_types",
    ownerPublicId: "student_public_seven_types",
    requestedQuestionCount: questionTypes.length,
    questions: questionTypes.map((questionType, index) => ({
      draftPublicId: `ai_question_draft_seven_${index + 1}`,
      draftNumber: index + 1,
      questionType,
      difficulty: "medium",
      knowledgeNodeCount: 1,
      knowledgeNodeLabels: ["knowledge_node_seven"],
      questionStem: `synthetic ${questionType} stem`,
      questionOptions:
        questionType === "single_choice" || questionType === "multi_choice"
          ? [
              { optionLabel: "A", optionText: "option a" },
              { optionLabel: "B", optionText: "option b" },
            ]
          : [],
      standardAnswer:
        questionType === "multi_choice"
          ? "A B"
          : questionType === "true_false"
            ? "true"
            : questionType === "single_choice"
              ? "A"
              : "synthetic answer",
      analysis: `synthetic ${questionType} analysis`,
      scoringPoints:
        questionType === "short_answer" ||
        questionType === "case_analysis" ||
        questionType === "calculation"
          ? [{ description: "scoring point", score: "1", sortOrder: 1 }]
          : [],
      fillBlankAnswers:
        questionType === "fill_blank"
          ? [
              {
                blankKey: "blank_1",
                standardAnswers: ["synthetic answer"],
                score: "1",
                sortOrder: 1,
              },
            ]
          : [],
      reviewStatus: "draft_review_required" as const,
    })),
  });

  if (snapshot === null) {
    throw new Error("seven-type test snapshot must be valid");
  }

  return snapshot;
}

function createPaperAssemblyContainer(): AiPaperPlanAndSelectContainerDto {
  return {
    title: "synthetic assembled paper",
    profession: "marketing",
    level: 3,
    subject: "theory",
    requestedQuestionCount: 3,
    selectedQuestionCount: 3,
    sourceComposition: {
      platformFormalQuestionCount: 2,
      enterpriseTrainingSnapshotCount: 1,
    },
    matchQuality: "fully_matched",
    sections: [
      {
        sectionKey: "single-choice",
        title: "single choice section",
        questionType: "single_choice",
        targetQuestionCount: 2,
        selectedQuestionCount: 2,
        selectedQuestions: [
          {
            questionPublicId: "platform_formal_question_public_001",
            sourceKind: "platform_formal_question",
            matchTier: "exact",
            score: 2,
          },
          {
            questionPublicId: "enterprise_training_snapshot_public_001",
            sourceKind: "enterprise_training_snapshot",
            matchTier: "exact",
            score: 2,
          },
        ],
        degradationSummary: {
          exactCount: 2,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
      {
        sectionKey: "true-false",
        title: "true false section",
        questionType: "true_false",
        targetQuestionCount: 1,
        selectedQuestionCount: 1,
        selectedQuestions: [
          {
            questionPublicId: "platform_formal_question_public_002",
            sourceKind: "platform_formal_question",
            matchTier: "exact",
            score: 1,
          },
        ],
        degradationSummary: {
          exactCount: 1,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
    ],
  };
}

function createPaperAssemblySourceQuestions(): PersonalAiGenerationLearningPaperSourceQuestionDto[] {
  return [
    {
      questionPublicId: "platform_formal_question_public_001",
      sourceKind: "platform_formal_question",
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["knowledge_node_a"],
      questionStem: "synthetic platform source stem one",
      questionOptions: [
        {
          optionLabel: "A",
          optionText: "synthetic platform source option a",
          isCorrect: true,
        },
        {
          optionLabel: "B",
          optionText: "synthetic platform source option b",
          isCorrect: false,
        },
      ],
      standardAnswerLabels: ["A"],
      standardAnswerText: "A",
      analysis: "synthetic platform source analysis one",
    },
    {
      questionPublicId: "enterprise_training_snapshot_public_001",
      sourceKind: "enterprise_training_snapshot",
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["knowledge_node_b"],
      questionStem: "synthetic enterprise source stem one",
      questionOptions: [
        {
          optionLabel: "A",
          optionText: "synthetic enterprise source option a",
          isCorrect: false,
        },
        {
          optionLabel: "B",
          optionText: "synthetic enterprise source option b",
          isCorrect: true,
        },
      ],
      standardAnswerLabels: ["B"],
      standardAnswerText: "B",
      analysis: "synthetic enterprise source analysis one",
    },
    {
      questionPublicId: "platform_formal_question_public_002",
      sourceKind: "platform_formal_question",
      questionType: "true_false",
      difficulty: "easy",
      knowledgeNodeLabels: ["knowledge_node_c"],
      questionStem: "synthetic platform source stem two",
      questionOptions: [
        {
          optionLabel: "A",
          optionText: "synthetic true option",
          isCorrect: false,
        },
        {
          optionLabel: "B",
          optionText: "synthetic false option",
          isCorrect: true,
        },
      ],
      standardAnswerLabels: ["B"],
      standardAnswerText: "B",
      analysis: "synthetic platform source analysis two",
    },
  ];
}

describe("personal AI generation learning session service", () => {
  it("persists a complete material question_group into the learner session without flattening or content reconstruction", async () => {
    const container = createPaperAssemblyContainer();
    const group = {
      publicId: "qgroup_learning_material_001",
      title: "learning material group",
      materialSnapshot: {
        materialPublicId: "material_learning_public_001",
        title: "learning material title",
        contentRichText: "learning material body",
      },
      memberQuestionPublicIds: [
        "platform_formal_question_public_001",
        "enterprise_training_snapshot_public_001",
      ],
      questionSortOrder: 1,
    };
    container.sections = [
      {
        ...container.sections[0]!,
        selectedQuestions: [
          Object.assign(container.sections[0]!.selectedQuestions[0]!, {
            questionGroup: group,
          }),
          Object.assign(container.sections[0]!.selectedQuestions[1]!, {
            questionGroup: { ...group, questionSortOrder: 2 },
          }),
        ],
      },
    ];
    container.requestedQuestionCount = 2;
    container.selectedQuestionCount = 2;
    const sourceQuestions = createPaperAssemblySourceQuestions().slice(0, 2);
    Object.assign(sourceQuestions[0]!, { questionGroup: group });
    Object.assign(sourceQuestions[1]!, {
      questionGroup: { ...group, questionSortOrder: 2 },
    });
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    }) as PaperAssemblyLearningSessionService;

    const result = await service.createLearningSessionFromPaperAssembly({
      sessionPublicId: "ai_learning_group_session_001",
      sourceResultPublicId: "ai_learning_group_result_001",
      sourceTaskPublicId: "ai_learning_group_task_001",
      ownerType: "organization",
      ownerPublicId: "organization_learning_group_001",
      actorPublicId: "employee_learning_group_001",
      evidenceStatus: "sufficient",
      citationCount: 2,
      paperAssemblyContainer: container,
      sourceQuestions,
      createdAt: new Date("2026-07-22T12:00:00.000Z"),
    });

    expect(result.status).toBe("created");
    expect(
      result.session?.questions.map((question) => question.questionGroup),
    ).toEqual([group, { ...group, questionSortOrder: 2 }]);
  });

  it("fails closed when selected material group membership and resolved source content are incomplete", async () => {
    const container = createPaperAssemblyContainer();
    const group = {
      publicId: "qgroup_learning_incomplete_001",
      title: "incomplete material group",
      materialSnapshot: {
        materialPublicId: "material_learning_incomplete_001",
        title: "incomplete material",
        contentRichText: "incomplete body",
      },
      memberQuestionPublicIds: [
        "platform_formal_question_public_001",
        "enterprise_training_snapshot_public_001",
      ],
      questionSortOrder: 1,
    };
    container.sections = [
      {
        ...container.sections[0]!,
        selectedQuestions: [
          Object.assign(container.sections[0]!.selectedQuestions[0]!, {
            questionGroup: group,
          }),
          Object.assign(container.sections[0]!.selectedQuestions[1]!, {
            questionGroup: { ...group, questionSortOrder: 2 },
          }),
        ],
      },
    ];
    container.requestedQuestionCount = 2;
    container.selectedQuestionCount = 2;
    const sourceQuestions = createPaperAssemblySourceQuestions().slice(0, 1);
    Object.assign(sourceQuestions[0]!, { questionGroup: group });
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    }) as PaperAssemblyLearningSessionService;

    const result = await service.createLearningSessionFromPaperAssembly({
      sessionPublicId: "ai_learning_group_session_incomplete",
      sourceResultPublicId: "ai_learning_group_result_incomplete",
      sourceTaskPublicId: "ai_learning_group_task_incomplete",
      ownerType: "organization",
      ownerPublicId: "organization_learning_group_incomplete",
      actorPublicId: "employee_learning_group_incomplete",
      evidenceStatus: "sufficient",
      citationCount: 2,
      paperAssemblyContainer: container,
      sourceQuestions,
      createdAt: new Date("2026-07-22T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "selected_question_source_missing",
      session: null,
    });
  });

  it("preserves all seven types and keeps fill, case, and calculation under review", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });
    const creation = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_seven_types",
      sourceResultPublicId: "ai_generation_result_public_seven_types",
      sourceTaskPublicId: "ai_generation_task_public_seven_types",
      ownerType: "personal",
      ownerPublicId: "student_public_seven_types",
      actorPublicId: "student_public_seven_types",
      questionDraftSnapshot: createSevenTypeQuestionSnapshot(),
      evidenceStatus: "sufficient",
      citationCount: 1,
      createdAt: new Date("2026-07-22T12:00:00.000Z"),
    });

    expect(
      creation.session?.questions.map((question) => question.questionType),
    ).toEqual(personalAiGenerationLearningSessionQuestionTypeValues);

    for (const questionNumber of [4, 6, 7]) {
      const feedback = await service.submitLearningSessionAnswer({
        sessionPublicId: "ai_learning_session_public_seven_types",
        sessionQuestionPublicId: `ai_learning_session_public_seven_types_q_${questionNumber}`,
        actorPublicId: "student_public_seven_types",
        selectedOptionLabels: [],
        textAnswer: "synthetic learner answer",
        submittedAt: new Date("2026-07-22T12:01:00.000Z"),
      });

      expect(feedback.status).toBe("submitted_review_required");
      expect(feedback.isCorrect).toBeNull();
    }
  });

  it("rejects blank or oversized subjective answers before persistence and restores one bounded answer", async () => {
    const persistedAnswerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[] =
      [];
    const baseRepository = createInMemoryRepository();
    const repository: PersonalAiGenerationLearningSessionRepository = {
      ...baseRepository,
      async saveAnswerFeedback(answerFeedback) {
        persistedAnswerFeedbacks.push(answerFeedback);
        await baseRepository.saveAnswerFeedback(answerFeedback);
      },
    };
    const service = createPersonalAiGenerationLearningSessionService({
      repository,
    });

    await service.createLearningSession({
      sessionPublicId: "ai_learning_session_subjective_boundary",
      sourceResultPublicId: "ai_generation_result_subjective_boundary",
      sourceTaskPublicId: "ai_generation_task_subjective_boundary",
      ownerType: "personal",
      ownerPublicId: "student_subjective_boundary",
      actorPublicId: "student_subjective_boundary",
      questionDraftSnapshot: createSevenTypeQuestionSnapshot(),
      evidenceStatus: "sufficient",
      citationCount: 1,
      createdAt: new Date("2026-07-23T10:00:00.000Z"),
    });

    const blank = await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_subjective_boundary",
      sessionQuestionPublicId: "ai_learning_session_subjective_boundary_q_5",
      actorPublicId: "student_subjective_boundary",
      selectedOptionLabels: [],
      textAnswer: "   \n  ",
      submittedAt: new Date("2026-07-23T10:01:00.000Z"),
    });
    const oversized = await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_subjective_boundary",
      sessionQuestionPublicId: "ai_learning_session_subjective_boundary_q_5",
      actorPublicId: "student_subjective_boundary",
      selectedOptionLabels: [],
      textAnswer: "x".repeat(4_001),
      submittedAt: new Date("2026-07-23T10:02:00.000Z"),
    });
    const emptyProgress = await service.getLearningSessionProgress({
      sessionPublicId: "ai_learning_session_subjective_boundary",
      actorPublicId: "student_subjective_boundary",
      viewedAt: new Date("2026-07-23T10:03:00.000Z"),
    });

    expect(blank).toMatchObject({
      status: "blocked",
      blockReason: "answer_required",
      textAnswer: null,
    });
    expect(oversized).toMatchObject({
      status: "blocked",
      blockReason: "answer_too_long",
    });
    expect(persistedAnswerFeedbacks).toHaveLength(0);
    expect(emptyProgress.progress?.statistics.submittedCount).toBe(0);

    const accepted = await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_subjective_boundary",
      sessionQuestionPublicId: "ai_learning_session_subjective_boundary_q_5",
      actorPublicId: "student_subjective_boundary",
      selectedOptionLabels: [],
      textAnswer: "  synthetic bounded learner answer  ",
      submittedAt: new Date("2026-07-23T10:04:00.000Z"),
    });
    const restoredProgress = await service.getLearningSessionProgress({
      sessionPublicId: "ai_learning_session_subjective_boundary",
      actorPublicId: "student_subjective_boundary",
      viewedAt: new Date("2026-07-23T10:05:00.000Z"),
    });

    expect(accepted).toMatchObject({
      status: "submitted_review_required",
      blockReason: null,
      textAnswer: "synthetic bounded learner answer",
      isCorrect: null,
    });
    expect(persistedAnswerFeedbacks).toHaveLength(1);
    expect(restoredProgress.progress?.statistics).toMatchObject({
      submittedCount: 1,
      reviewRequiredCount: 1,
    });
    expect(restoredProgress.progress?.answerFeedbacks[0]).toMatchObject({
      textAnswer: "synthetic bounded learner answer",
    });
  });
  it("reuses the first persisted paper session snapshot for repeated starts", async () => {
    const repository = createInMemoryRepository();
    const service = createPersonalAiGenerationLearningSessionService({
      repository,
    }) as PaperAssemblyLearningSessionService;
    const firstInput = {
      sessionPublicId: "ai_learning_session_reuse_001",
      sourceResultPublicId: "ai_generation_result_reuse_001",
      sourceTaskPublicId: "ai_generation_task_reuse_001",
      ownerType: "personal" as const,
      ownerPublicId: "student_public_reuse_001",
      actorPublicId: "student_public_reuse_001",
      evidenceStatus: "sufficient" as const,
      citationCount: 2,
      paperAssemblyContainer: createPaperAssemblyContainer(),
      sourceQuestions: createPaperAssemblySourceQuestions(),
      createdAt: new Date("2026-07-12T10:00:00.000Z"),
    };

    const firstResult =
      await service.createLearningSessionFromPaperAssembly(firstInput);
    const repeatedResult = await service.createLearningSessionFromPaperAssembly(
      {
        ...firstInput,
        sourceQuestions: firstInput.sourceQuestions.map((question) => ({
          ...question,
          questionStem: "changed source must not replace persisted snapshot",
        })),
        createdAt: new Date("2026-07-12T11:00:00.000Z"),
      },
    );

    expect(firstResult.status).toBe("created");
    expect(repeatedResult).toEqual(firstResult);
  });

  it("fails closed when a deterministic session id collides with another result context", async () => {
    const repository = createInMemoryRepository();
    const service = createPersonalAiGenerationLearningSessionService({
      repository,
    }) as PaperAssemblyLearningSessionService;
    const input = {
      sessionPublicId: "ai_learning_session_collision_001",
      sourceResultPublicId: "ai_generation_result_collision_001",
      sourceTaskPublicId: "ai_generation_task_collision_001",
      ownerType: "personal" as const,
      ownerPublicId: "student_public_collision_001",
      actorPublicId: "student_public_collision_001",
      evidenceStatus: "sufficient" as const,
      citationCount: 2,
      paperAssemblyContainer: createPaperAssemblyContainer(),
      sourceQuestions: createPaperAssemblySourceQuestions(),
      createdAt: new Date("2026-07-12T10:00:00.000Z"),
    };

    await service.createLearningSessionFromPaperAssembly(input);
    const collision = await service.createLearningSessionFromPaperAssembly({
      ...input,
      sourceResultPublicId: "different_result_public_collision_001",
    });

    expect(collision).toEqual({
      status: "blocked",
      blockReason: "session_context_mismatch",
      session: null,
    });
  });

  it("creates answerable learner sessions from locally selected paper assemblies and formal source question content", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    }) as PaperAssemblyLearningSessionService;

    expect(service.createLearningSessionFromPaperAssembly).toEqual(
      expect.any(Function),
    );

    const result = await service.createLearningSessionFromPaperAssembly({
      sessionPublicId: "ai_paper_learning_session_public_001",
      sourceResultPublicId: "ai_generation_result_public_paper_001",
      sourceTaskPublicId: "ai_generation_task_public_paper_001",
      ownerType: "organization",
      ownerPublicId: "organization_public_paper_001",
      actorPublicId: "employee_public_paper_001",
      evidenceStatus: "sufficient",
      citationCount: 3,
      paperAssemblyContainer: createPaperAssemblyContainer(),
      sourceQuestions: createPaperAssemblySourceQuestions(),
      createdAt: new Date("2026-07-06T12:00:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "created",
      blockReason: null,
      session: {
        sessionPublicId: "ai_paper_learning_session_public_001",
        sourceResultPublicId: "ai_generation_result_public_paper_001",
        sourceTaskPublicId: "ai_generation_task_public_paper_001",
        ownerType: "organization",
        ownerPublicId: "organization_public_paper_001",
        actorPublicId: "employee_public_paper_001",
        evidenceStatus: "sufficient",
        citationCount: 3,
        questionCount: 3,
        formalWriteBoundary: {
          questionWriteStatus: "blocked",
          paperWriteStatus: "blocked",
          practiceWriteStatus: "blocked",
          answerRecordWriteStatus: "blocked",
          examReportWriteStatus: "blocked",
          mistakeBookWriteStatus: "blocked",
        },
      },
    });
    expect(result.session?.questions).toEqual([
      expect.objectContaining({
        sessionQuestionPublicId: "ai_paper_learning_session_public_001_q_1",
        sourceDraftNumber: 1,
        questionType: "single_choice",
        questionStem: "synthetic platform source stem one",
        questionOptions: [
          expect.objectContaining({ isCorrect: null }),
          expect.objectContaining({ isCorrect: null }),
        ],
        standardAnswerLabels: [],
        standardAnswerText: null,
        analysis: null,
        maxScore: "2.0",
      }),
      expect.objectContaining({
        sessionQuestionPublicId: "ai_paper_learning_session_public_001_q_2",
        sourceDraftNumber: 2,
        questionType: "single_choice",
        questionStem: "synthetic enterprise source stem one",
        standardAnswerLabels: [],
        standardAnswerText: null,
        analysis: null,
        maxScore: "2.0",
      }),
      expect.objectContaining({
        sessionQuestionPublicId: "ai_paper_learning_session_public_001_q_3",
        sourceDraftNumber: 3,
        questionType: "true_false",
        questionStem: "synthetic platform source stem two",
        standardAnswerLabels: [],
        standardAnswerText: null,
        analysis: null,
        maxScore: "1.0",
      }),
    ]);

    const answerResult = await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_paper_learning_session_public_001",
      sessionQuestionPublicId: "ai_paper_learning_session_public_001_q_1",
      actorPublicId: "employee_public_paper_001",
      selectedOptionLabels: ["A"],
      textAnswer: null,
      submittedAt: new Date("2026-07-06T12:01:00.000Z"),
    });

    expect(answerResult).toMatchObject({
      status: "scored",
      isCorrect: true,
      score: "2.0",
      mistakeBookPublicId: null,
      formalWriteBoundary: {
        answerRecordWriteStatus: "blocked",
        mistakeBookWriteStatus: "blocked",
      },
    });
  });

  it("blocks paper assembly handoff when selected formal source content is missing", async () => {
    const repository = createInMemoryRepository();
    const service = createPersonalAiGenerationLearningSessionService({
      repository,
    }) as PaperAssemblyLearningSessionService;

    expect(service.createLearningSessionFromPaperAssembly).toEqual(
      expect.any(Function),
    );

    const result = await service.createLearningSessionFromPaperAssembly({
      sessionPublicId: "ai_paper_learning_session_public_missing_source_001",
      sourceResultPublicId:
        "ai_generation_result_public_paper_missing_source_001",
      sourceTaskPublicId: "ai_generation_task_public_paper_missing_source_001",
      ownerType: "personal",
      ownerPublicId: "student_public_paper_missing_source_001",
      actorPublicId: "student_public_paper_missing_source_001",
      evidenceStatus: "sufficient",
      citationCount: 3,
      paperAssemblyContainer: createPaperAssemblyContainer(),
      sourceQuestions: createPaperAssemblySourceQuestions().slice(0, 2),
      createdAt: new Date("2026-07-06T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "selected_question_source_missing",
      session: null,
    });
    await expect(
      repository.findSessionByPublicId(
        "ai_paper_learning_session_public_missing_source_001",
      ),
    ).resolves.toBeNull();
  });

  it("creates an isolated learning session from sufficiently grounded parsed question drafts without formal writes", async () => {
    const repository = createInMemoryRepository();
    const service = createPersonalAiGenerationLearningSessionService({
      repository,
    });

    const result = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_001",
      sourceResultPublicId: "ai_generation_result_public_001",
      sourceTaskPublicId: "ai_generation_task_public_001",
      ownerType: "personal",
      ownerPublicId: "student_public_001",
      actorPublicId: "student_public_001",
      questionDraftSnapshot: createQuestionSnapshot(
        createQuestionSetPreview(),
        "ai_generation_task_public_001",
        "student_public_001",
      ),
      evidenceStatus: "sufficient",
      citationCount: 2,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(result.status).toBe("created");
    expect(result.blockReason).toBeNull();
    expect(result.session).toMatchObject({
      sessionPublicId: "ai_learning_session_public_001",
      contentDomain: "personal_ai_learning",
      ownerType: "personal",
      ownerPublicId: "student_public_001",
      sourceResultPublicId: "ai_generation_result_public_001",
      sourceTaskPublicId: "ai_generation_task_public_001",
      formalWriteBoundary: {
        questionWriteStatus: "blocked",
        paperWriteStatus: "blocked",
        practiceWriteStatus: "blocked",
        answerRecordWriteStatus: "blocked",
        examReportWriteStatus: "blocked",
        mistakeBookWriteStatus: "blocked",
      },
      questionCount: 2,
    });
    expect(result.session?.questions).toEqual([
      expect.objectContaining({
        sessionQuestionPublicId: "ai_learning_session_public_001_q_1",
        sourceDraftNumber: 1,
        questionType: "single_choice",
        standardAnswerLabels: [],
        standardAnswerText: null,
        analysis: null,
        maxScore: "1.0",
      }),
      expect.objectContaining({
        sessionQuestionPublicId: "ai_learning_session_public_001_q_2",
        sourceDraftNumber: 2,
        questionType: "true_false",
        standardAnswerLabels: [],
        standardAnswerText: null,
        analysis: null,
        maxScore: "1.0",
      }),
    ]);
  });

  it("fails closed when a concurrent session winner has different snapshot questions", async () => {
    let saveAttempted = false;
    const repository: PersonalAiGenerationLearningSessionRepository = {
      async saveSession() {
        saveAttempted = true;
        return { status: "saved", blockReason: null };
      },
      async findSessionByPublicId(sessionPublicId) {
        if (!saveAttempted) {
          return null;
        }

        return {
          sessionPublicId,
          contentDomain: "personal_ai_learning",
          sourceResultPublicId: "ai_generation_result_concurrent_001",
          sourceTaskPublicId: "ai_generation_task_concurrent_001",
          ownerType: "personal",
          ownerPublicId: "student_concurrent_001",
          actorPublicId: "student_concurrent_001",
          evidenceStatus: "sufficient",
          citationCount: 2,
          questionCount: 1,
          questions: [
            {
              sessionQuestionPublicId: `${sessionPublicId}_q_1`,
              sourceDraftNumber: 1,
              questionType: "short_answer",
              difficulty: "medium",
              knowledgeNodeLabels: [],
              questionStem: "conflicting concurrent question",
              questionOptions: [],
              standardAnswerLabels: [],
              standardAnswerText: "conflicting answer",
              analysis: "conflicting analysis",
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
          createdAt: "2026-07-05T12:00:00.000Z",
        };
      },
      async saveAnswerFeedback() {},
      async listAnswerFeedbackBySessionPublicId() {
        return [];
      },
    };
    const service = createPersonalAiGenerationLearningSessionService({
      repository,
    });
    const result = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_concurrent_001",
      sourceResultPublicId: "ai_generation_result_concurrent_001",
      sourceTaskPublicId: "ai_generation_task_concurrent_001",
      ownerType: "personal",
      ownerPublicId: "student_concurrent_001",
      actorPublicId: "student_concurrent_001",
      questionDraftSnapshot: createQuestionSnapshot(
        createQuestionSetPreview(),
        "ai_generation_task_concurrent_001",
        "student_concurrent_001",
      ),
      evidenceStatus: "sufficient",
      citationCount: 2,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "session_context_mismatch",
      session: null,
    });
  });

  it("scores objective answers inside the isolated learning session and keeps mistake_book blocked", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });
    const creationResult = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_002",
      sourceResultPublicId: "ai_generation_result_public_002",
      sourceTaskPublicId: "ai_generation_task_public_002",
      ownerType: "organization",
      ownerPublicId: "org_public_001",
      actorPublicId: "employee_public_001",
      questionDraftSnapshot: createQuestionSnapshot(
        createQuestionSetPreview(),
        "ai_generation_task_public_002",
        "org_public_001",
      ),
      evidenceStatus: "sufficient",
      citationCount: 2,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(creationResult.status).toBe("created");

    const correctFeedback = await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_public_002",
      sessionQuestionPublicId: "ai_learning_session_public_002_q_1",
      actorPublicId: "employee_public_001",
      selectedOptionLabels: ["A"],
      textAnswer: null,
      submittedAt: new Date("2026-07-05T12:01:00.000Z"),
    });
    const incorrectFeedback = await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_public_002",
      sessionQuestionPublicId: "ai_learning_session_public_002_q_2",
      actorPublicId: "employee_public_001",
      selectedOptionLabels: ["A"],
      textAnswer: null,
      submittedAt: new Date("2026-07-05T12:02:00.000Z"),
    });

    expect(correctFeedback).toMatchObject({
      status: "scored",
      isCorrect: true,
      score: "1.0",
      maxScore: "1.0",
      formalWriteBoundary: {
        practiceWriteStatus: "blocked",
        answerRecordWriteStatus: "blocked",
        examReportWriteStatus: "blocked",
        mistakeBookWriteStatus: "blocked",
      },
      mistakeBookPublicId: null,
    });
    expect(incorrectFeedback).toMatchObject({
      status: "scored",
      isCorrect: false,
      score: "0.0",
      maxScore: "1.0",
      mistakeBookPublicId: null,
      formalWriteBoundary: {
        mistakeBookWriteStatus: "blocked",
      },
    });
  });

  it("persists answer feedback and returns a resumable personal statistics snapshot using latest feedback", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });
    const creationResult = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_progress_001",
      sourceResultPublicId: "ai_generation_result_public_progress_001",
      sourceTaskPublicId: "ai_generation_task_public_progress_001",
      ownerType: "personal",
      ownerPublicId: "student_public_progress_001",
      actorPublicId: "student_public_progress_001",
      questionDraftSnapshot: createQuestionSnapshot(
        createQuestionSetPreview(),
        "ai_generation_task_public_progress_001",
        "student_public_progress_001",
      ),
      evidenceStatus: "sufficient",
      citationCount: 2,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(creationResult.status).toBe("created");

    await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_public_progress_001",
      sessionQuestionPublicId: "ai_learning_session_public_progress_001_q_1",
      actorPublicId: "student_public_progress_001",
      selectedOptionLabels: ["A"],
      textAnswer: null,
      submittedAt: new Date("2026-07-05T12:01:00.000Z"),
    });
    await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_public_progress_001",
      sessionQuestionPublicId: "ai_learning_session_public_progress_001_q_2",
      actorPublicId: "student_public_progress_001",
      selectedOptionLabels: ["A"],
      textAnswer: null,
      submittedAt: new Date("2026-07-05T12:02:00.000Z"),
    });
    await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_public_progress_001",
      sessionQuestionPublicId: "ai_learning_session_public_progress_001_q_2",
      actorPublicId: "student_public_progress_001",
      selectedOptionLabels: ["FALSE"],
      textAnswer: null,
      submittedAt: new Date("2026-07-05T12:03:00.000Z"),
    });

    const progressResult = await service.getLearningSessionProgress({
      sessionPublicId: "ai_learning_session_public_progress_001",
      actorPublicId: "student_public_progress_001",
      viewedAt: new Date("2026-07-05T12:04:00.000Z"),
    });

    expect(progressResult).toMatchObject({
      status: "ready",
      blockReason: null,
      progress: {
        sessionPublicId: "ai_learning_session_public_progress_001",
        contentDomain: "personal_ai_learning",
        persistenceStatus: "repository_persisted",
        resumeStatus: "resumable",
        ownerType: "personal",
        ownerPublicId: "student_public_progress_001",
        actorPublicId: "student_public_progress_001",
        statistics: {
          questionCount: 2,
          submittedCount: 2,
          correctCount: 2,
          incorrectCount: 0,
          reviewRequiredCount: 0,
          completionRate: 1,
          accuracyRate: 1,
          score: "2.0",
          maxScore: "2.0",
          updatedAt: "2026-07-05T12:04:00.000Z",
        },
        formalWriteBoundary: {
          practiceWriteStatus: "blocked",
          answerRecordWriteStatus: "blocked",
          examReportWriteStatus: "blocked",
          mistakeBookWriteStatus: "blocked",
        },
      },
    });
    expect(progressResult.progress?.answerFeedbacks).toHaveLength(2);
    expect(progressResult.progress?.answerFeedbacks[1]).toMatchObject({
      sessionQuestionPublicId: "ai_learning_session_public_progress_001_q_2",
      selectedOptionLabels: ["FALSE"],
      isCorrect: true,
      submittedAt: "2026-07-05T12:03:00.000Z",
    });
  });

  it("keeps organization employee learning progress actor-isolated while preserving organization ownership context", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });
    const creationResult = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_org_progress_001",
      sourceResultPublicId: "ai_generation_result_public_org_progress_001",
      sourceTaskPublicId: "ai_generation_task_public_org_progress_001",
      ownerType: "organization",
      ownerPublicId: "organization_public_progress_001",
      actorPublicId: "employee_public_progress_001",
      questionDraftSnapshot: createQuestionSnapshot(
        createQuestionSetPreview(),
        "ai_generation_task_public_org_progress_001",
        "organization_public_progress_001",
      ),
      evidenceStatus: "sufficient",
      citationCount: 2,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(creationResult.status).toBe("created");

    await service.submitLearningSessionAnswer({
      sessionPublicId: "ai_learning_session_public_org_progress_001",
      sessionQuestionPublicId:
        "ai_learning_session_public_org_progress_001_q_1",
      actorPublicId: "employee_public_progress_001",
      selectedOptionLabels: ["B"],
      textAnswer: null,
      submittedAt: new Date("2026-07-05T12:01:00.000Z"),
    });

    const progressResult = await service.getLearningSessionProgress({
      sessionPublicId: "ai_learning_session_public_org_progress_001",
      actorPublicId: "employee_public_progress_001",
      viewedAt: new Date("2026-07-05T12:02:00.000Z"),
    });
    const blockedProgressResult = await service.getLearningSessionProgress({
      sessionPublicId: "ai_learning_session_public_org_progress_001",
      actorPublicId: "other_employee_public_progress_001",
      viewedAt: new Date("2026-07-05T12:02:00.000Z"),
    });

    expect(progressResult).toMatchObject({
      status: "ready",
      progress: {
        ownerType: "organization",
        ownerPublicId: "organization_public_progress_001",
        actorPublicId: "employee_public_progress_001",
        statistics: {
          questionCount: 2,
          submittedCount: 1,
          correctCount: 0,
          incorrectCount: 1,
          completionRate: 0.5,
          accuracyRate: 0,
          score: "0.0",
          maxScore: "2.0",
        },
      },
    });
    expect(blockedProgressResult).toEqual({
      status: "blocked",
      blockReason: "actor_not_allowed",
      progress: null,
    });
  });

  it("blocks learning session creation when grounding evidence is weak", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });
    const result = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_003",
      sourceResultPublicId: "ai_generation_result_public_003",
      sourceTaskPublicId: "ai_generation_task_public_003",
      ownerType: "personal",
      ownerPublicId: "student_public_003",
      actorPublicId: "student_public_003",
      questionDraftSnapshot: createQuestionSnapshot(
        createQuestionSetPreview(),
        "ai_generation_task_public_003",
        "student_public_003",
      ),
      evidenceStatus: "weak",
      citationCount: 1,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "insufficient_grounding_evidence",
      session: null,
    });
  });

  it("blocks DB-persisted learning session creation when source result id is missing", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });

    const result = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_missing_source_result_001",
      sourceResultPublicId: null,
      sourceTaskPublicId: "ai_generation_task_public_missing_source_result_001",
      ownerType: "personal",
      ownerPublicId: "student_public_missing_source_result_001",
      actorPublicId: "student_public_missing_source_result_001",
      questionDraftSnapshot: createQuestionSnapshot(
        createQuestionSetPreview(),
        "ai_generation_task_public_missing_source_result_001",
        "student_public_missing_source_result_001",
      ),
      evidenceStatus: "sufficient",
      citationCount: 2,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "source_result_required",
      session: null,
    });
  });

  it("rejects a snapshot whose question array silently shrinks below the requested count", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });
    const validSnapshot = createQuestionSnapshot(
      createQuestionSetPreview(),
      "ai_generation_task_public_004",
      "student_public_004",
    );

    const result = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_004",
      sourceResultPublicId: "ai_generation_result_public_004",
      sourceTaskPublicId: "ai_generation_task_public_004",
      ownerType: "personal",
      ownerPublicId: "student_public_004",
      actorPublicId: "student_public_004",
      questionDraftSnapshot: {
        ...validSnapshot,
        snapshot: {
          ...validSnapshot.snapshot,
          questions: [],
        },
      },
      evidenceStatus: "sufficient",
      citationCount: 2,
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "no_usable_generated_questions",
      session: null,
    });
  });
});
