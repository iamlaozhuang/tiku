import { describe, expect, it } from "vitest";

import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type {
  AiGenerationRouteIntegratedStructuredPreview,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "../contracts/route-integrated-provider-execution-contract";
import type {
  PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
  PersonalAiGenerationLearningPaperSourceQuestionDto,
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionRepository,
  PersonalAiGenerationLearningSessionService,
} from "../contracts/personal-ai-generation-learning-session-contract";
import { createPersonalAiGenerationLearningSessionService } from "./personal-ai-generation-learning-session-service";

type PaperAssemblyLearningSessionService =
  PersonalAiGenerationLearningSessionService & {
    createLearningSessionFromPaperAssembly(
      input: PersonalAiGenerationLearningPaperAssemblySessionCreationInputDto,
    ): ReturnType<
      PersonalAiGenerationLearningSessionService["createLearningSession"]
    >;
  };

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
            isCorrect: true,
          },
          {
            optionLabel: "B",
            optionText: "synthetic option b",
            isCorrect: false,
          },
        ],
        standardAnswer: "A",
        analysis: "synthetic analysis one",
        reviewStatus: "draft_review_required",
      },
      {
        draftNumber: 2,
        questionType: "judge",
        difficulty: "easy",
        knowledgeNodeCount: 1,
        knowledgeNodeLabels: ["knowledge_node_b"],
        questionStem: "synthetic stem two",
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
        standardAnswer: "B",
        analysis: "synthetic analysis two",
        reviewStatus: "draft_review_required",
      },
    ],
  };
}

function createVisibleGeneratedContent(
  structuredPreview: AiGenerationRouteIntegratedStructuredPreview,
): AiGenerationRouteIntegratedVisibleGeneratedContent {
  return {
    content: "synthetic redacted test content",
    contentVisibility: "transient_response_only",
    persistenceStatus: "not_persisted",
    safetyStatus: "checked",
    groundingSummary: {
      evidenceStatus: "sufficient",
      citationCount: 2,
    },
    structuredPreview,
  };
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
        standardAnswerLabels: ["A"],
        maxScore: "2.0",
      }),
      expect.objectContaining({
        sessionQuestionPublicId: "ai_paper_learning_session_public_001_q_2",
        sourceDraftNumber: 2,
        questionType: "single_choice",
        questionStem: "synthetic enterprise source stem one",
        standardAnswerLabels: ["B"],
        maxScore: "2.0",
      }),
      expect.objectContaining({
        sessionQuestionPublicId: "ai_paper_learning_session_public_001_q_3",
        sourceDraftNumber: 3,
        questionType: "true_false",
        questionStem: "synthetic platform source stem two",
        standardAnswerLabels: ["B"],
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
      visibleGeneratedContent: createVisibleGeneratedContent(
        createQuestionSetPreview(),
      ),
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
        standardAnswerLabels: ["A"],
        maxScore: "1.0",
      }),
      expect.objectContaining({
        sessionQuestionPublicId: "ai_learning_session_public_001_q_2",
        sourceDraftNumber: 2,
        questionType: "true_false",
        standardAnswerLabels: ["B"],
        maxScore: "1.0",
      }),
    ]);
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
      visibleGeneratedContent: createVisibleGeneratedContent(
        createQuestionSetPreview(),
      ),
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
      visibleGeneratedContent: createVisibleGeneratedContent(
        createQuestionSetPreview(),
      ),
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
      selectedOptionLabels: ["B"],
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
      selectedOptionLabels: ["B"],
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
      visibleGeneratedContent: createVisibleGeneratedContent(
        createQuestionSetPreview(),
      ),
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
    const visibleGeneratedContent = createVisibleGeneratedContent(
      createQuestionSetPreview(),
    );

    const result = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_003",
      sourceResultPublicId: "ai_generation_result_public_003",
      sourceTaskPublicId: "ai_generation_task_public_003",
      ownerType: "personal",
      ownerPublicId: "student_public_003",
      actorPublicId: "student_public_003",
      visibleGeneratedContent: {
        ...visibleGeneratedContent,
        groundingSummary: {
          evidenceStatus: "weak",
          citationCount: 1,
        },
      },
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
      visibleGeneratedContent: createVisibleGeneratedContent(
        createQuestionSetPreview(),
      ),
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "source_result_required",
      session: null,
    });
  });

  it("rejects paper draft summaries that do not contain usable generated questions", async () => {
    const service = createPersonalAiGenerationLearningSessionService({
      repository: createInMemoryRepository(),
    });

    const result = await service.createLearningSession({
      sessionPublicId: "ai_learning_session_public_004",
      sourceResultPublicId: "ai_generation_result_public_004",
      sourceTaskPublicId: "ai_generation_task_public_004",
      ownerType: "personal",
      ownerPublicId: "student_public_004",
      actorPublicId: "student_public_004",
      visibleGeneratedContent: createVisibleGeneratedContent({
        kind: "paper_draft",
        parseStatus: "parsed",
        paperSectionCount: 1,
        questionCount: 20,
        questionTypeDistributionCount: 1,
        knowledgeCoverageCount: 1,
        reviewStatus: "draft_review_required",
        paperSectionSummaries: [
          {
            sectionNumber: 1,
            paperSectionType: "single_choice",
            title: "synthetic paper section",
            questionCount: 20,
            questionDrafts: [],
          },
        ],
      }),
      createdAt: new Date("2026-07-05T12:00:00.000Z"),
    });

    expect(result).toEqual({
      status: "blocked",
      blockReason: "no_usable_generated_questions",
      session: null,
    });
  });
});
