import { describe, expect, it } from "vitest";

import type {
  AiGenerationRouteIntegratedStructuredPreview,
  AiGenerationRouteIntegratedVisibleGeneratedContent,
} from "../contracts/route-integrated-provider-execution-contract";
import type {
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionRepository,
} from "../contracts/personal-ai-generation-learning-session-contract";
import { createPersonalAiGenerationLearningSessionService } from "./personal-ai-generation-learning-session-service";

function createInMemoryRepository(): PersonalAiGenerationLearningSessionRepository {
  const sessions = new Map<string, PersonalAiGenerationLearningSessionDto>();
  const answerFeedbacks = new Map<
    string,
    PersonalAiGenerationLearningSessionAnswerFeedbackDto
  >();

  const repository: PersonalAiGenerationLearningSessionRepository = {
    async saveSession(session) {
      sessions.set(session.sessionPublicId, session);
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

describe("personal AI generation learning session service", () => {
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
