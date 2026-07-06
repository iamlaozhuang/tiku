import { describe, expect, it } from "vitest";

import type {
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionRepository,
} from "../contracts/personal-ai-generation-learning-session-contract";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "../contracts/route-integrated-provider-execution-contract";
import { createPersonalAiGenerationLearningSessionRouteHandlers } from "./personal-ai-generation-learning-session-route";

const personalUserContext = {
  userPublicId: "learner_route_student_public_001",
  userType: "personal",
  organizationPublicId: null,
} as const;

const employeeUserContext = {
  userPublicId: "learner_route_employee_public_001",
  userType: "employee",
  organizationPublicId: "learner_route_organization_public_001",
} as const;

function createVisibleGeneratedContent(): AiGenerationRouteIntegratedVisibleGeneratedContent {
  return {
    content: "synthetic redacted learning content",
    contentVisibility: "transient_response_only",
    persistenceStatus: "not_persisted",
    safetyStatus: "checked",
    groundingSummary: {
      evidenceStatus: "sufficient",
      citationCount: 2,
    },
    structuredPreview: {
      kind: "question_set",
      parseStatus: "parsed",
      requestedQuestionCount: 1,
      actualQuestionCount: 1,
      draftCount: 1,
      draftSummaries: [
        {
          draftNumber: 1,
          questionType: "single_choice",
          difficulty: "medium",
          knowledgeNodeCount: 1,
          knowledgeNodeLabels: ["synthetic node"],
          questionStem: "synthetic learning route stem",
          questionOptions: [
            {
              optionLabel: "A",
              optionText: "synthetic correct option",
              isCorrect: true,
            },
            {
              optionLabel: "B",
              optionText: "synthetic wrong option",
              isCorrect: false,
            },
          ],
          standardAnswer: "A",
          analysis: "synthetic learning route analysis",
          reviewStatus: "draft_review_required",
        },
      ],
    },
  };
}

function createPostRequest(body: Record<string, unknown>): Request {
  return new Request(
    "http://localhost/api/v1/personal-ai-generation-learning-sessions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

function createAnswerPostRequest(
  sessionPublicId: string,
  body: Record<string, unknown>,
): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/answers`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

function createProgressGetRequest(sessionPublicId: string): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress`,
    {
      method: "GET",
    },
  );
}

function createLearningSessionRepository(): PersonalAiGenerationLearningSessionRepository & {
  savedSessions: PersonalAiGenerationLearningSessionDto[];
  savedAnswerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[];
} {
  const savedSessions: PersonalAiGenerationLearningSessionDto[] = [];
  const savedAnswerFeedbacks: PersonalAiGenerationLearningSessionAnswerFeedbackDto[] =
    [];

  return {
    savedSessions,
    savedAnswerFeedbacks,
    async saveSession(session) {
      savedSessions.push(session);

      return {
        status: "saved",
        blockReason: null,
      };
    },
    async findSessionByPublicId(sessionPublicId) {
      return (
        savedSessions.find(
          (session) => session.sessionPublicId === sessionPublicId,
        ) ?? null
      );
    },
    async saveAnswerFeedback(answerFeedback) {
      savedAnswerFeedbacks.push(answerFeedback);
    },
    async listAnswerFeedbackBySessionPublicId(sessionPublicId) {
      return savedAnswerFeedbacks.filter(
        (answerFeedback) => answerFeedback.sessionPublicId === sessionPublicId,
      );
    },
  };
}

function getLearningSessionCollectionPostHandler(collection: unknown) {
  const postHandler = (
    collection as {
      POST?: (request: Request) => Promise<Response>;
    }
  ).POST;

  expect(postHandler).toEqual(expect.any(Function));

  return postHandler as (request: Request) => Promise<Response>;
}

function getLearningSessionProgressGetHandler(progress: unknown) {
  const getHandler = (
    progress as {
      GET?: (
        request: Request,
        context: { params: Promise<{ publicId: string }> },
      ) => Promise<Response>;
    }
  ).GET;

  expect(getHandler).toEqual(expect.any(Function));

  return getHandler as (
    request: Request,
    context: { params: Promise<{ publicId: string }> },
  ) => Promise<Response>;
}

function getLearningSessionAnswerPostHandler(answers: unknown) {
  const postHandler = (
    answers as {
      POST?: (
        request: Request,
        context: { params: Promise<{ publicId: string }> },
      ) => Promise<Response>;
    }
  ).POST;

  expect(postHandler).toEqual(expect.any(Function));

  return postHandler as (
    request: Request,
    context: { params: Promise<{ publicId: string }> },
  ) => Promise<Response>;
}

describe("personal AI generation learning session route handlers", () => {
  it("creates a persisted learner AI session under the personal owner scope", async () => {
    const repository = createLearningSessionRepository();
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        {
          repository,
          now: () => new Date("2026-07-06T03:50:00.000Z"),
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_learning_session_route_001",
        sourceResultPublicId: "ai_generation_result_route_001",
        sourceTaskPublicId: "ai_generation_task_route_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        status: "created",
        blockReason: null,
        session: {
          sessionPublicId: "ai_learning_session_route_001",
          ownerType: "personal",
          ownerPublicId: personalUserContext.userPublicId,
          actorPublicId: personalUserContext.userPublicId,
          sourceResultPublicId: "ai_generation_result_route_001",
          questionCount: 1,
          formalWriteBoundary: {
            questionWriteStatus: "blocked",
            paperWriteStatus: "blocked",
            practiceWriteStatus: "blocked",
            answerRecordWriteStatus: "blocked",
            examReportWriteStatus: "blocked",
            mistakeBookWriteStatus: "blocked",
          },
        },
      },
    });
    expect(repository.savedSessions).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain("raw prompt");
    expect(JSON.stringify(payload)).not.toContain("provider payload");
  });

  it("creates employee learner AI sessions under organization owner scope while keeping the actor isolated", async () => {
    const repository = createLearningSessionRepository();
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => employeeUserContext,
        {
          repository,
          now: () => new Date("2026-07-06T03:51:00.000Z"),
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_learning_session_route_employee_001",
        sourceResultPublicId: "ai_generation_result_route_employee_001",
        sourceTaskPublicId: "ai_generation_task_route_employee_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        status: "created",
        session: {
          ownerType: "organization",
          ownerPublicId: employeeUserContext.organizationPublicId,
          actorPublicId: employeeUserContext.userPublicId,
        },
      },
    });
    expect(repository.savedSessions[0]).toMatchObject({
      ownerType: "organization",
      ownerPublicId: employeeUserContext.organizationPublicId,
      actorPublicId: employeeUserContext.userPublicId,
    });
  });

  it("creates employee learner AI sessions under explicit personal owner scope", async () => {
    const repository = createLearningSessionRepository();
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => employeeUserContext,
        {
          repository,
          now: () => new Date("2026-07-06T03:51:30.000Z"),
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_learning_session_route_employee_personal_001",
        sourceResultPublicId:
          "ai_generation_result_route_employee_personal_001",
        sourceTaskPublicId: "ai_generation_task_route_employee_personal_001",
        ownerType: "personal",
        ownerPublicId: employeeUserContext.userPublicId,
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        status: "created",
        session: {
          ownerType: "personal",
          ownerPublicId: employeeUserContext.userPublicId,
          actorPublicId: employeeUserContext.userPublicId,
        },
      },
    });
    expect(repository.savedSessions[0]).toMatchObject({
      ownerType: "personal",
      ownerPublicId: employeeUserContext.userPublicId,
      actorPublicId: employeeUserContext.userPublicId,
    });
  });

  it("rejects learner AI session creation when requested owner is outside the user scope", async () => {
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => employeeUserContext,
        {
          repository: createLearningSessionRepository(),
          now: () => new Date("2026-07-06T03:51:45.000Z"),
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_learning_session_route_employee_invalid_001",
        sourceResultPublicId: "ai_generation_result_route_employee_invalid_001",
        sourceTaskPublicId: "ai_generation_task_route_employee_invalid_001",
        ownerType: "personal",
        ownerPublicId: "other_user_public_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 400056,
      message: "Invalid personal AI learning session input.",
      data: null,
    });
  });

  it("submits persisted learner answers and returns resumable progress statistics", async () => {
    const repository = createLearningSessionRepository();
    const { collection, progress, answers } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        {
          repository,
          now: () => new Date("2026-07-06T03:52:00.000Z"),
        },
      );

    await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_learning_session_route_progress_001",
        sourceResultPublicId: "ai_generation_result_route_progress_001",
        sourceTaskPublicId: "ai_generation_task_route_progress_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );

    const answerResponse = await getLearningSessionAnswerPostHandler(answers)(
      createAnswerPostRequest("ai_learning_session_route_progress_001", {
        sessionQuestionPublicId: "ai_learning_session_route_progress_001_q_1",
        selectedOptionLabels: ["A"],
        textAnswer: null,
      }),
      {
        params: Promise.resolve({
          publicId: "ai_learning_session_route_progress_001",
        }),
      },
    );
    const progressResponse = await getLearningSessionProgressGetHandler(
      progress,
    )(createProgressGetRequest("ai_learning_session_route_progress_001"), {
      params: Promise.resolve({
        publicId: "ai_learning_session_route_progress_001",
      }),
    });

    await expect(answerResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        status: "scored",
        isCorrect: true,
        score: "1.0",
        mistakeBookPublicId: null,
        formalWriteBoundary: {
          answerRecordWriteStatus: "blocked",
          mistakeBookWriteStatus: "blocked",
        },
      },
    });
    await expect(progressResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        status: "ready",
        progress: {
          persistenceStatus: "repository_persisted",
          resumeStatus: "resumable",
          statistics: {
            questionCount: 1,
            submittedCount: 1,
            correctCount: 1,
            score: "1.0",
            maxScore: "1.0",
          },
        },
      },
    });
  });

  it("returns the standard unauthorized response when user context is missing", async () => {
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(async () => null);

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_learning_session_route_unauthorized_001",
        sourceResultPublicId: "ai_generation_result_route_unauthorized_001",
        sourceTaskPublicId: "ai_generation_task_route_unauthorized_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });
});
