import { describe, expect, it, vi } from "vitest";

import type { AiPaperPlanAndSelectContainerDto } from "../contracts/ai-paper-plan-and-select-contract";
import type {
  PersonalAiGenerationLearningPaperSourceQuestionDto,
  PersonalAiGenerationLearningSessionAnswerFeedbackDto,
  PersonalAiGenerationLearningSessionDto,
  PersonalAiGenerationLearningSessionRepository,
} from "../contracts/personal-ai-generation-learning-session-contract";
import type { AiGenerationRouteIntegratedVisibleGeneratedContent } from "../contracts/route-integrated-provider-execution-contract";
import type { PersonalAiGenerationResultDto } from "../contracts/personal-ai-generation-result-persistence-contract";
import type { EffectiveAuthorizationContextDto } from "../contracts/effective-authorization-contract";
import type {
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "../repositories/effective-authorization-repository";
import { createPersonalAiGenerationLearningSessionRouteHandlers as createBasePersonalAiGenerationLearningSessionRouteHandlers } from "./personal-ai-generation-learning-session-route";
import type { PersonalAiGenerationLearningSessionRouteDependencies } from "./personal-ai-generation-learning-session-route";
import {
  createPersonalAiGenerationPrivatePaperQuestionSnapshot,
  createPersonalAiGenerationPrivateQuestionDraftSnapshot,
} from "../validators/personal-ai-generation-result-persistence";

const personalUserContext = {
  userPublicId: "learner_route_student_public_001",
  userType: "personal",
  employeePublicId: null,
  organizationPublicId: null,
} as const;

const employeeUserContext = {
  userPublicId: "learner_route_employee_public_001",
  userType: "employee",
  employeePublicId: "learner_route_employee_record_public_001",
  organizationPublicId: "learner_route_organization_public_001",
} as const;

const personalAuthorizationPublicId = "personal_auth_learning_active_001";
const organizationAuthorizationPublicId = "org_auth_learning_active_001";

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
          draftPublicId: "ai_question_draft_route_1",
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
            },
            {
              optionLabel: "B",
              optionText: "synthetic wrong option",
            },
          ],
          standardAnswer: "A",
          analysis: "synthetic learning route analysis",
          scoringPoints: [],
          fillBlankAnswers: [],
          reviewStatus: "draft_review_required",
        },
      ],
    },
  };
}

function createPaperAssemblyContainer(): AiPaperPlanAndSelectContainerDto {
  const questionGroupBase = {
    publicId: "question_group_route_public_001",
    title: "synthetic route material group",
    materialSnapshot: {
      materialPublicId: "material_route_public_001",
      title: "synthetic route material",
      contentRichText: "server-owned frozen material content",
    },
    memberQuestionPublicIds: [
      "platform_formal_question_route_public_001",
      "enterprise_training_snapshot_route_public_001",
    ],
  };

  return {
    title: "synthetic assembled paper",
    profession: "marketing",
    level: 3,
    subject: "theory",
    requestedQuestionCount: 2,
    selectedQuestionCount: 2,
    sourceComposition: {
      platformFormalQuestionCount: 2,
      enterpriseTrainingSnapshotCount: 0,
    },
    matchQuality: "fully_matched",
    constraintLineage: {
      request: { difficulty: "medium", knowledgeNodePublicIds: [] },
      plan: {
        difficulty: "medium",
        knowledgeNodePublicIds: [],
        parentKnowledgeNodePublicIds: [],
      },
    },
    sections: [
      {
        sectionKey: "single-choice",
        title: "single choice section",
        questionType: "single_choice",
        targetQuestionCount: 2,
        selectedQuestionCount: 2,
        selectedQuestions: [
          {
            questionPublicId: "platform_formal_question_route_public_001",
            sourceKind: "platform_formal_question",
            matchTier: "exact",
            score: 2,
            constraintMatchBasis: {
              difficulty: "medium",
              knowledgeNodePublicIds: [],
              parentKnowledgeNodePublicIds: [],
              ancestorKnowledgeNodePublicIds: [],
              matchTier: "exact",
            },
            questionGroup: { ...questionGroupBase, questionSortOrder: 1 },
          },
          {
            questionPublicId: "enterprise_training_snapshot_route_public_001",
            sourceKind: "platform_formal_question",
            matchTier: "exact",
            score: 2,
            constraintMatchBasis: {
              difficulty: "medium",
              knowledgeNodePublicIds: [],
              parentKnowledgeNodePublicIds: [],
              ancestorKnowledgeNodePublicIds: [],
              matchTier: "exact",
            },
            questionGroup: { ...questionGroupBase, questionSortOrder: 2 },
          },
        ],
        degradationSummary: {
          exactCount: 2,
          nearbyKnowledgeCount: 0,
          sameScopeCount: 0,
        },
      },
    ],
  };
}

function createPaperSourceQuestions(): PersonalAiGenerationLearningPaperSourceQuestionDto[] {
  return [
    {
      questionPublicId: "platform_formal_question_route_public_001",
      sourceKind: "platform_formal_question",
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["knowledge_node_route_a"],
      questionStem: "synthetic route platform source stem",
      questionOptions: [
        {
          optionLabel: "A",
          optionText: "synthetic route platform option a",
          isCorrect: true,
        },
        {
          optionLabel: "B",
          optionText: "synthetic route platform option b",
          isCorrect: false,
        },
      ],
      standardAnswerLabels: ["A"],
      standardAnswerText: "A",
      analysis: "synthetic route platform analysis",
      questionGroup: {
        publicId: "question_group_route_public_001",
        title: "synthetic route material group",
        materialSnapshot: {
          materialPublicId: "material_route_public_001",
          title: "synthetic route material",
          contentRichText: "server-owned frozen material content",
        },
        memberQuestionPublicIds: [
          "platform_formal_question_route_public_001",
          "enterprise_training_snapshot_route_public_001",
        ],
        questionSortOrder: 1,
      },
    },
    {
      questionPublicId: "enterprise_training_snapshot_route_public_001",
      sourceKind: "platform_formal_question",
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["knowledge_node_route_b"],
      questionStem: "synthetic route enterprise source stem",
      questionOptions: [
        {
          optionLabel: "A",
          optionText: "synthetic route enterprise option a",
          isCorrect: false,
        },
        {
          optionLabel: "B",
          optionText: "synthetic route enterprise option b",
          isCorrect: true,
        },
      ],
      standardAnswerLabels: ["B"],
      standardAnswerText: "B",
      analysis: "synthetic route enterprise analysis",
      questionGroup: {
        publicId: "question_group_route_public_001",
        title: "synthetic route material group",
        materialSnapshot: {
          materialPublicId: "material_route_public_001",
          title: "synthetic route material",
          contentRichText: "server-owned frozen material content",
        },
        memberQuestionPublicIds: [
          "platform_formal_question_route_public_001",
          "enterprise_training_snapshot_route_public_001",
        ],
        questionSortOrder: 2,
      },
    },
  ];
}

function createPersistedPaperResult(
  resultPublicId: string,
): PersonalAiGenerationResultDto {
  return {
    resultPublicId,
    taskPublicId: `task_${resultPublicId}`,
    requestPublicId: `request_${resultPublicId}`,
    taskType: "ai_paper_generation",
    status: "draft",
    persistedAt: "2026-07-12T10:00:00.000Z",
    contentReference: {
      contentDigest: "sha256:persisted-paper-result",
      contentPreviewMasked: "persisted paper preview",
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: null,
      redactionStatus: "redacted",
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
    },
    paperAssembly: {
      status: "assembled",
      sourceDiagnostics: {
        role: "personal_advanced_student",
        platformQuestionCount: 1,
        enterpriseQuestionCount: 1,
        enterpriseSourceStatus: "resolved",
      },
      container: createPaperAssemblyContainer(),
      insufficiency: null,
      redactionStatus: "redacted",
    },
  };
}

function createPostRequest(body: Record<string, unknown>): Request {
  const authorizationPublicId =
    typeof body.authorizationPublicId === "string"
      ? body.authorizationPublicId
      : personalAuthorizationPublicId;

  return new Request(
    "http://localhost/api/v1/personal-ai-generation-learning-sessions",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        authorizationPublicId,
        sourceResultPublicId: body.sourceResultPublicId,
      }),
    },
  );
}

function createAnswerPostRequest(
  sessionPublicId: string,
  body: Record<string, unknown>,
): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/answers?authorizationPublicId=${personalAuthorizationPublicId}`,
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
    `http://localhost/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/progress?authorizationPublicId=${personalAuthorizationPublicId}`,
    {
      method: "GET",
    },
  );
}

function createHistoryGetRequest(
  authorizationPublicId = personalAuthorizationPublicId,
): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-learning-sessions?authorizationPublicId=${authorizationPublicId}&page=1&pageSize=10`,
    { method: "GET" },
  );
}

function createStatisticsGetRequest(
  authorizationPublicId = personalAuthorizationPublicId,
): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-learning-sessions/statistics?authorizationPublicId=${authorizationPublicId}`,
    { method: "GET" },
  );
}

function createCompletePostRequest(
  sessionPublicId: string,
  expectedSessionRevision: number,
  authorizationPublicId = personalAuthorizationPublicId,
): Request {
  return new Request(
    `http://localhost/api/v1/personal-ai-generation-learning-sessions/${sessionPublicId}/complete?authorizationPublicId=${authorizationPublicId}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedSessionRevision }),
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
    async saveAnswerFeedback({ answerFeedback }) {
      savedAnswerFeedbacks.push(answerFeedback);

      return {
        status: "saved",
        blockReason: null,
        answerFeedback,
      };
    },
    async listAnswerFeedbackBySessionPublicId(sessionPublicId) {
      return savedAnswerFeedbacks.filter(
        (answerFeedback) => answerFeedback.sessionPublicId === sessionPublicId,
      );
    },
    async validateCompletedSessionSummary() {
      return true;
    },
    async completeSession() {
      return {
        status: "blocked",
        blockReason: "session_lifecycle_unavailable",
        sessionRevision: null,
        completedAt: null,
        completionSummary: null,
      };
    },
    async listSessionHistory() {
      return null;
    },
    async getSessionStatistics() {
      return null;
    },
  };
}

function createDefaultLearningResult(
  resultPublicId: string,
): PersonalAiGenerationResultDto {
  return {
    ...createPersistedPaperResult(resultPublicId),
    taskType: "ai_question_generation",
    taskPublicId: resultPublicId.replace(
      "ai_generation_result_",
      "ai_generation_task_",
    ),
    paperAssembly: null,
  };
}

function createDefaultPrivateQuestionSnapshot(
  result: PersonalAiGenerationResultDto,
  ownerPublicId: string,
) {
  const structuredPreview = createVisibleGeneratedContent().structuredPreview;

  if (
    structuredPreview?.kind !== "question_set" ||
    structuredPreview.parseStatus !== "parsed"
  ) {
    throw new Error("test question preview must be parsed");
  }

  const snapshot = createPersonalAiGenerationPrivateQuestionDraftSnapshot({
    taskPublicId: result.taskPublicId,
    ownerPublicId,
    requestedQuestionCount: structuredPreview.requestedQuestionCount,
    questions: structuredPreview.draftSummaries,
  });

  if (snapshot === null) {
    throw new Error("test private question snapshot must be valid");
  }

  return snapshot;
}

function createDefaultPrivatePaperSnapshot(
  result: PersonalAiGenerationResultDto,
  ownerType: "personal" | "organization",
  ownerPublicId: string,
) {
  const paperAssemblyContainer = result.paperAssembly?.container;

  if (paperAssemblyContainer === undefined) {
    throw new Error("test paper assembly must exist");
  }

  const snapshot = createPersonalAiGenerationPrivatePaperQuestionSnapshot({
    resultPublicId: result.resultPublicId,
    taskPublicId: result.taskPublicId,
    ownerType,
    ownerPublicId,
    paperAssemblyContainer,
    sourceQuestions: createPaperSourceQuestions().map((question) => ({
      questionPublicId: question.questionPublicId,
      sourceKind: question.sourceKind,
      sourceVersion: {
        kind: "platform_question_updated_at" as const,
        updatedAt: "2026-07-12T09:00:00.000Z",
      },
      profession: paperAssemblyContainer.profession,
      level: paperAssemblyContainer.level,
      subject: paperAssemblyContainer.subject,
      questionType: question.questionType,
      difficulty: question.difficulty,
      knowledgeNodePublicIds: [],
      parentKnowledgeNodePublicIds: [],
      ancestorKnowledgeNodePublicIds: [],
      questionStem: question.questionStem,
      questionOptions: question.questionOptions.map((questionOption) => ({
        optionLabel: questionOption.optionLabel,
        optionText: questionOption.optionText,
        isCorrect: requireTestBoolean(questionOption.isCorrect),
      })),
      standardAnswerLabels: [...question.standardAnswerLabels],
      standardAnswerText: question.standardAnswerText,
      analysis: question.analysis,
      scoringPoints: [],
      fillBlankAnswers: [],
      questionGroup: question.questionGroup ?? null,
    })),
  });

  if (snapshot === null) {
    throw new Error("test private paper snapshot must be valid");
  }

  return snapshot;
}

function requireTestBoolean(value: boolean | null): boolean {
  if (value === null) {
    throw new Error("test private paper option correctness must be complete");
  }

  return value;
}

function createEffectiveAuthorizationContext(input: {
  authorizationPublicId: string;
  authorizationSource: "personal_auth" | "org_auth";
  ownerPublicId: string;
  ownerType: "personal" | "organization";
  organizationPublicId: string | null;
}): EffectiveAuthorizationContextDto {
  return {
    profession: "marketing",
    level: 3,
    contextDisplayStatus: "display_only",
    effectiveEdition: "advanced",
    authorizationSource: input.authorizationSource,
    authorizationPublicId: input.authorizationPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    organizationPublicId: input.organizationPublicId,
    quotaOwnerType:
      input.ownerType === "organization" ? "organization" : "personal",
    quotaOwnerPublicId: input.ownerPublicId,
    capabilities: {
      canAnswerOrganizationTraining: input.ownerType === "organization",
      canCreateOrganizationTraining: input.ownerType === "organization",
      canGenerateAiPaper: true,
      canGenerateAiQuestion: true,
      canManageAuthorizationQuota: false,
      canViewOrganizationTrainingSummary: input.ownerType === "organization",
    },
    blockedReason: null,
  };
}

function createPersonalAiGenerationLearningSessionRouteHandlers(
  resolveUserContext: Parameters<
    typeof createBasePersonalAiGenerationLearningSessionRouteHandlers
  >[0],
  dependencies: PersonalAiGenerationLearningSessionRouteDependencies = {},
) {
  const personalAuth: EffectivePersonalAuthRow = {
    id: 1,
    public_id: personalAuthorizationPublicId,
    edition: "advanced",
    profession: "marketing",
    level: 3,
    starts_at: new Date("2026-07-01T00:00:00.000Z"),
    expires_at: new Date("2026-08-01T00:00:00.000Z"),
    status: "active",
  };
  const orgAuth: EffectiveOrgAuthRow = {
    id: 2,
    public_id: organizationAuthorizationPublicId,
    organization_public_id: employeeUserContext.organizationPublicId,
    organization_name: "Synthetic organization",
    organization_status: "active",
    edition: "advanced",
    profession: "marketing",
    level: 3,
    starts_at: new Date("2026-07-01T00:00:00.000Z"),
    expires_at: new Date("2026-08-01T00:00:00.000Z"),
    status: "active",
  };
  const defaultResultRepository: NonNullable<
    PersonalAiGenerationLearningSessionRouteDependencies["resultRepository"]
  > = {
    async findDraftResultByPublicId(query) {
      if (
        (query.authorizationPublicId === personalAuthorizationPublicId &&
          query.ownerType !== "personal") ||
        (query.authorizationPublicId === organizationAuthorizationPublicId &&
          query.ownerType !== "organization")
      ) {
        return null;
      }

      return createDefaultLearningResult(query.resultPublicId);
    },
    async findPrivateQuestionDraftSnapshotByPublicId(query) {
      return createDefaultPrivateQuestionSnapshot(
        createDefaultLearningResult(query.resultPublicId),
        query.ownerPublicId,
      );
    },
    async findPrivatePaperQuestionSnapshotByPublicId(query) {
      const result = createPersistedPaperResult(query.resultPublicId);

      return createDefaultPrivatePaperSnapshot(
        result,
        query.ownerType ?? "personal",
        query.ownerPublicId,
      );
    },
  };

  return createBasePersonalAiGenerationLearningSessionRouteHandlers(
    resolveUserContext,
    {
      authorizationRepository: {
        async listPersonalAuthsByUserPublicId() {
          return [personalAuth];
        },
        async listOrgAuthsByUserPublicId() {
          return [orgAuth];
        },
      },
      effectiveAuthorizationService: {
        async listEffectiveAuthorizations(input) {
          return {
            code: 0,
            message: "ok",
            data: {
              authorizations: [],
              effectiveAuthorizations: [],
              authorizationContexts: [
                createEffectiveAuthorizationContext({
                  authorizationPublicId: personalAuthorizationPublicId,
                  authorizationSource: "personal_auth",
                  ownerPublicId: input.userPublicId,
                  ownerType: "personal",
                  organizationPublicId: null,
                }),
                ...(input.userPublicId === employeeUserContext.userPublicId
                  ? [
                      createEffectiveAuthorizationContext({
                        authorizationPublicId:
                          organizationAuthorizationPublicId,
                        authorizationSource: "org_auth",
                        ownerPublicId: employeeUserContext.organizationPublicId,
                        ownerType: "organization",
                        organizationPublicId:
                          employeeUserContext.organizationPublicId,
                      }),
                    ]
                  : []),
              ],
            },
          };
        },
      },
      ...dependencies,
      resultRepository: {
        ...defaultResultRepository,
        ...dependencies.resultRepository,
      },
    },
  );
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

function getLearningSessionCollectionGetHandler(collection: unknown) {
  const getHandler = (
    collection as {
      GET?: (request: Request) => Promise<Response>;
    }
  ).GET;

  expect(getHandler).toEqual(expect.any(Function));

  return getHandler as (request: Request) => Promise<Response>;
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

function getLearningSessionCompletePostHandler(complete: unknown) {
  const postHandler = (
    complete as {
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

function getLearningSessionStatisticsGetHandler(statistics: unknown) {
  const getHandler = (
    statistics as {
      GET?: (request: Request) => Promise<Response>;
    }
  ).GET;

  expect(getHandler).toEqual(expect.any(Function));

  return getHandler as (request: Request) => Promise<Response>;
}

describe("personal AI generation learning session route handlers", () => {
  it("rejects client-supplied question and evidence facts before result lookup", async () => {
    const resultLookup = vi.fn();
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        {
          resultRepository: {
            findDraftResultByPublicId: resultLookup,
            findPrivateQuestionDraftSnapshotByPublicId: resultLookup,
          },
        },
      );
    const response = await getLearningSessionCollectionPostHandler(collection)(
      new Request(
        "http://localhost/api/v1/personal-ai-generation-learning-sessions",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            authorizationPublicId: personalAuthorizationPublicId,
            sourceResultPublicId: "ai_generation_result_client_forgery_001",
            questions: [{ standardAnswer: "forged" }],
            visibleGeneratedContent: createVisibleGeneratedContent(),
            evidenceStatus: "sufficient",
            citationCount: 99,
          }),
        },
      ),
    );

    await expect(response.clone().json()).resolves.toEqual({
      code: 400056,
      message: "Invalid personal AI learning session input.",
      data: null,
    });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(resultLookup).not.toHaveBeenCalled();
  });

  it("rejects an ineffective selected authorization before creating a learning session", async () => {
    const repository = createLearningSessionRepository();
    const privatePaperSnapshotLookup = vi.fn(async () => {
      throw new Error("private snapshot must not be read before authorization");
    });
    const dependencies = {
      repository,
      resultRepository: {
        findPrivatePaperQuestionSnapshotByPublicId: privatePaperSnapshotLookup,
      },
      authorizationRepository: {
        async listPersonalAuthsByUserPublicId() {
          return [
            {
              id: 3,
              public_id: "expired_personal_auth_public_001",
              edition: "advanced" as const,
              profession: "marketing",
              level: 3,
              starts_at: new Date("2026-01-01T00:00:00.000Z"),
              expires_at: new Date("2026-02-01T00:00:00.000Z"),
              status: "expired" as const,
            },
          ];
        },
        async listOrgAuthsByUserPublicId() {
          return [];
        },
      },
      effectiveAuthorizationService: {
        async listEffectiveAuthorizations() {
          return {
            code: 0,
            message: "ok",
            data: {
              authorizations: [],
              effectiveAuthorizations: [],
              authorizationContexts: [],
            },
          };
        },
      },
    } as unknown as PersonalAiGenerationLearningSessionRouteDependencies;
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        dependencies,
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        authorizationPublicId: "expired_personal_auth_public_001",
        sessionPublicId: "ai_learning_session_expired_auth_001",
        sourceResultPublicId: "ai_generation_result_expired_auth_001",
        sourceTaskPublicId: "ai_generation_task_expired_auth_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403057,
      message:
        "Personal AI generation is not available for this authorization.",
      data: null,
    });
    expect(repository.savedSessions).toEqual([]);
    expect(privatePaperSnapshotLookup).not.toHaveBeenCalled();
  });

  it("rejects progress and answer consumption after the selected authorization becomes ineffective", async () => {
    const repository = createLearningSessionRepository();
    const activeHandlers =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        { repository },
      );
    const sourceResultPublicId = "ai_generation_result_expired_resume_001";
    const sessionPublicId = `ai_learning_session_${sourceResultPublicId}`;

    const creationResponse = await getLearningSessionCollectionPostHandler(
      activeHandlers.collection,
    )(
      createPostRequest({
        sourceResultPublicId,
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );

    expect((await creationResponse.json()).code).toBe(0);
    expect(repository.savedSessions).toHaveLength(1);
    const findSessionSpy = vi.spyOn(repository, "findSessionByPublicId");
    const listAnswerFeedbackSpy = vi.spyOn(
      repository,
      "listAnswerFeedbackBySessionPublicId",
    );
    const saveAnswerFeedbackSpy = vi.spyOn(repository, "saveAnswerFeedback");
    const completeSessionSpy = vi.spyOn(repository, "completeSession");
    const listSessionHistorySpy = vi.spyOn(repository, "listSessionHistory");
    const getSessionStatisticsSpy = vi.spyOn(
      repository,
      "getSessionStatistics",
    );

    const ineffectiveHandlers =
      createBasePersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        {
          repository,
          resultRepository: {
            async findDraftResultByPublicId(query) {
              return createDefaultLearningResult(query.resultPublicId);
            },
          },
          authorizationRepository: {
            async listPersonalAuthsByUserPublicId() {
              return [
                {
                  id: 3,
                  public_id: personalAuthorizationPublicId,
                  edition: "advanced",
                  profession: "marketing",
                  level: 3,
                  starts_at: new Date("2026-01-01T00:00:00.000Z"),
                  expires_at: new Date("2026-02-01T00:00:00.000Z"),
                  status: "expired",
                },
              ];
            },
            async listOrgAuthsByUserPublicId() {
              return [];
            },
          },
          effectiveAuthorizationService: {
            async listEffectiveAuthorizations() {
              return {
                code: 0,
                message: "ok",
                data: {
                  authorizations: [],
                  effectiveAuthorizations: [],
                  authorizationContexts: [],
                },
              };
            },
          },
        },
      );
    const answerResponse = await getLearningSessionAnswerPostHandler(
      ineffectiveHandlers.answers,
    )(
      createAnswerPostRequest(sessionPublicId, {
        sessionQuestionPublicId: `${sessionPublicId}_q_1`,
        expectedAnswerRevision: 0,
        selectedOptionLabels: ["A"],
        textAnswer: null,
      }),
      { params: Promise.resolve({ publicId: sessionPublicId }) },
    );
    const progressResponse = await getLearningSessionProgressGetHandler(
      ineffectiveHandlers.progress,
    )(createProgressGetRequest(sessionPublicId), {
      params: Promise.resolve({ publicId: sessionPublicId }),
    });
    const completeResponse = await getLearningSessionCompletePostHandler(
      ineffectiveHandlers.complete,
    )(createCompletePostRequest(sessionPublicId, 1), {
      params: Promise.resolve({ publicId: sessionPublicId }),
    });
    const historyResponse = await getLearningSessionCollectionGetHandler(
      ineffectiveHandlers.collection,
    )(createHistoryGetRequest());
    const statisticsResponse = await getLearningSessionStatisticsGetHandler(
      ineffectiveHandlers.statistics,
    )(createStatisticsGetRequest());

    for (const response of [
      answerResponse,
      progressResponse,
      completeResponse,
      historyResponse,
      statisticsResponse,
    ]) {
      await expect(response.json()).resolves.toEqual({
        code: 403057,
        message:
          "Personal AI generation is not available for this authorization.",
        data: null,
      });
    }
    expect(repository.savedAnswerFeedbacks).toEqual([]);
    expect(findSessionSpy).not.toHaveBeenCalled();
    expect(listAnswerFeedbackSpy).not.toHaveBeenCalled();
    expect(saveAnswerFeedbackSpy).not.toHaveBeenCalled();
    expect(completeSessionSpy).not.toHaveBeenCalled();
    expect(listSessionHistorySpy).not.toHaveBeenCalled();
    expect(getSessionStatisticsSpy).not.toHaveBeenCalled();
  });

  it("returns only allowlisted completion, history and aggregate facts", async () => {
    const repository = createLearningSessionRepository();
    const sourceResultPublicId = "ai_generation_result_lifecycle_public_001";
    const sessionPublicId = `ai_learning_session_${sourceResultPublicId}`;
    const completedAt = "2026-07-24T08:00:00.000Z";
    const completionSummary = {
      schemaVersion: 1 as const,
      questionCount: 1,
      submittedCount: 1,
      correctCount: 1,
      incorrectCount: 0,
      reviewRequiredCount: 0,
      completionRate: 1,
      accuracyRate: 1,
      score: "1.0",
      maxScore: "1.0",
    };
    Reflect.set(
      repository,
      "completeSession",
      vi.fn(async () => ({
        status: "completed" as const,
        blockReason: null,
        sessionRevision: 2,
        completedAt,
        completionSummary,
      })),
    );
    const listSessionHistory = vi.fn(async () => ({
      sessions: [
        {
          sessionPublicId,
          sourceResultPublicId,
          sourceTaskPublicId: `task_${sourceResultPublicId}`,
          lifecycleAvailability: "current" as const,
          sessionStatus: "completed" as const,
          sessionRevision: 2,
          questionCount: 1,
          submittedCount: 1,
          completionRate: 1,
          score: "1.0",
          maxScore: "1.0",
          canResume: false,
          canReview: true,
          canComplete: false,
          createdAt: "2026-07-24T07:00:00.000Z",
          updatedAt: completedAt,
          completedAt,
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }));
    Reflect.set(repository, "listSessionHistory", listSessionHistory);
    const getSessionStatistics = vi.fn(async () => ({
      attemptCount: 1,
      inProgressCount: 0,
      completedCount: 1,
      completedQuestionCount: 1,
      submittedCount: 1,
      correctCount: 1,
      incorrectCount: 0,
      reviewRequiredCount: 0,
      completionRate: 1,
      accuracyRate: 1,
      score: "1.0",
      maxScore: "1.0",
    }));
    Reflect.set(repository, "getSessionStatistics", getSessionStatistics);
    const handlers = createPersonalAiGenerationLearningSessionRouteHandlers(
      async () => personalUserContext,
      { repository },
    );

    await getLearningSessionCollectionPostHandler(handlers.collection)(
      createPostRequest({ sourceResultPublicId }),
    );
    const responses = [
      await getLearningSessionCompletePostHandler(handlers.complete)(
        createCompletePostRequest(sessionPublicId, 1),
        { params: Promise.resolve({ publicId: sessionPublicId }) },
      ),
      await getLearningSessionCollectionGetHandler(handlers.collection)(
        new Request(
          `${createHistoryGetRequest().url}&ownerType=organization&ownerPublicId=client_owner_must_be_ignored`,
          { method: "GET" },
        ),
      ),
      await getLearningSessionStatisticsGetHandler(handlers.statistics)(
        new Request(
          `${createStatisticsGetRequest().url}&ownerType=organization&ownerPublicId=client_owner_must_be_ignored`,
          { method: "GET" },
        ),
      ),
    ];

    for (const response of responses) {
      const serialized = JSON.stringify(await response.json());
      expect(serialized).not.toContain("authorizationPublicId");
      expect(serialized).not.toContain(personalAuthorizationPublicId);
      expect(serialized).not.toContain("answerCommandDigest");
      expect(serialized).not.toContain("standardAnswer");
      expect(serialized).not.toContain("questionSnapshot");
    }
    expect(listSessionHistory).toHaveBeenCalledWith({
      actorPublicId: personalUserContext.userPublicId,
      ownerType: "personal",
      ownerPublicId: personalUserContext.userPublicId,
      authorizationSource: "personal_auth",
      authorizationPublicId: personalAuthorizationPublicId,
      page: 1,
      pageSize: 10,
    });
    expect(getSessionStatistics).toHaveBeenCalledWith({
      actorPublicId: personalUserContext.userPublicId,
      ownerType: "personal",
      ownerPublicId: personalUserContext.userPublicId,
      authorizationSource: "personal_auth",
      authorizationPublicId: personalAuthorizationPublicId,
    });
  });

  it.each([
    {
      label: "personal advanced learner",
      userContext: personalUserContext,
      ownerType: "personal",
      ownerPublicId: personalUserContext.userPublicId,
    },
    {
      label: "organization advanced employee",
      userContext: employeeUserContext,
      ownerType: "organization",
      ownerPublicId: employeeUserContext.organizationPublicId,
    },
  ] as const)(
    "starts or resumes a persisted paper for the $label without trusting browser assembly",
    async ({ userContext, ownerType, ownerPublicId }) => {
      const repository = createLearningSessionRepository();
      const resultPublicId = `persisted_paper_result_${ownerType}_001`;
      const persistedResult = createPersistedPaperResult(resultPublicId);
      const resultLookupQueries: unknown[] = [];
      const { collection } =
        createPersonalAiGenerationLearningSessionRouteHandlers(
          async () => userContext,
          {
            repository,
            resultRepository: {
              async findDraftResultByPublicId(query: {
                ownerType?: string;
                ownerPublicId: string;
              }) {
                resultLookupQueries.push(query);
                return query.ownerType === ownerType &&
                  query.ownerPublicId === ownerPublicId
                  ? persistedResult
                  : null;
              },
            },
            now: () => new Date("2026-07-12T10:30:00.000Z"),
          },
        );

      const response = await getLearningSessionCollectionPostHandler(
        collection,
      )(
        createPostRequest({
          authorizationPublicId:
            ownerType === "organization"
              ? organizationAuthorizationPublicId
              : personalAuthorizationPublicId,
          sourceResultPublicId: resultPublicId,
          sessionPublicId: "browser_supplied_session_must_be_ignored",
          sourceTaskPublicId: "browser_supplied_task_must_be_ignored",
          visibleGeneratedContent: createVisibleGeneratedContent(),
          paperAssemblyContainer: {
            ...createPaperAssemblyContainer(),
            title: "browser supplied assembly must be ignored",
          },
        }),
      );
      const payload = await response.json();

      expect(payload).toMatchObject({
        code: 0,
        data: {
          status: "created",
          session: {
            sessionPublicId: `ai_learning_session_${resultPublicId}`,
            sourceResultPublicId: resultPublicId,
            sourceTaskPublicId: persistedResult.taskPublicId,
            ownerType,
            ownerPublicId,
            actorPublicId: userContext.userPublicId,
          },
        },
      });
      expect(resultLookupQueries).toEqual(
        ownerType === "personal"
          ? [
              {
                authorizationPublicId: personalAuthorizationPublicId,
                ownerType,
                ownerPublicId,
                actorPublicId: userContext.userPublicId,
                resultPublicId,
              },
            ]
          : [
              {
                authorizationPublicId: organizationAuthorizationPublicId,
                ownerType: "personal",
                ownerPublicId: userContext.userPublicId,
                actorPublicId: userContext.userPublicId,
                resultPublicId,
              },
              {
                authorizationPublicId: organizationAuthorizationPublicId,
                ownerType,
                ownerPublicId,
                actorPublicId: userContext.userPublicId,
                resultPublicId,
              },
            ],
      );
    },
  );

  it("creates an employee learning session from a persisted personal result without substituting organization ownership", async () => {
    const repository = createLearningSessionRepository();
    const resultPublicId = "persisted_paper_result_employee_personal_001";
    const persistedResult = createPersistedPaperResult(resultPublicId);
    const resultLookupQueries: unknown[] = [];
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => employeeUserContext,
        {
          repository,
          resultRepository: {
            async findDraftResultByPublicId(query) {
              resultLookupQueries.push(query);

              return query.ownerType === "personal" &&
                query.ownerPublicId === employeeUserContext.userPublicId &&
                query.actorPublicId === employeeUserContext.userPublicId
                ? persistedResult
                : null;
            },
          },
          now: () => new Date("2026-07-12T10:31:00.000Z"),
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sourceResultPublicId: resultPublicId,
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        status: "created",
        session: {
          sessionPublicId: `ai_learning_session_${resultPublicId}`,
          sourceResultPublicId: resultPublicId,
          sourceTaskPublicId: persistedResult.taskPublicId,
          ownerType: "personal",
          ownerPublicId: employeeUserContext.userPublicId,
          actorPublicId: employeeUserContext.userPublicId,
        },
      },
    });
    expect(resultLookupQueries).toEqual([
      {
        authorizationPublicId: personalAuthorizationPublicId,
        ownerType: "personal",
        ownerPublicId: employeeUserContext.userPublicId,
        actorPublicId: employeeUserContext.userPublicId,
        resultPublicId,
      },
    ]);
    expect(repository.savedSessions).toHaveLength(1);
    expect(repository.savedSessions[0]).toMatchObject({
      ownerType: "personal",
      ownerPublicId: employeeUserContext.userPublicId,
      actorPublicId: employeeUserContext.userPublicId,
    });
    expect(repository.savedSessions[0]).not.toMatchObject({
      ownerType: "organization",
      ownerPublicId: employeeUserContext.organizationPublicId,
    });
  });

  it("resumes an existing persisted paper session without re-resolving changed question sources", async () => {
    const repository = createLearningSessionRepository();
    const resultPublicId = "persisted_paper_result_resume_001";
    const persistedResult = createPersistedPaperResult(resultPublicId);
    const privatePaperSnapshotLookup = vi.fn(async () =>
      createDefaultPrivatePaperSnapshot(
        persistedResult,
        "personal",
        personalUserContext.userPublicId,
      ),
    );
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        {
          repository,
          resultRepository: {
            async findDraftResultByPublicId() {
              return persistedResult;
            },
            findPrivatePaperQuestionSnapshotByPublicId:
              privatePaperSnapshotLookup,
          },
          now: () => new Date("2026-07-12T10:30:00.000Z"),
        },
      );
    const postHandler = getLearningSessionCollectionPostHandler(collection);

    const createdResponse = await postHandler(
      createPostRequest({ sourceResultPublicId: resultPublicId }),
    );
    const resumedResponse = await postHandler(
      createPostRequest({ sourceResultPublicId: resultPublicId }),
    );

    await expect(createdResponse.json()).resolves.toMatchObject({
      code: 0,
      data: { status: "created" },
    });
    await expect(resumedResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        status: "created",
        session: {
          sessionPublicId: `ai_learning_session_${resultPublicId}`,
        },
      },
    });
    expect(privatePaperSnapshotLookup).toHaveBeenCalledTimes(1);
  });

  it("creates an AI组卷 learning session from server-resolved formal source questions and ignores client-sent source content", async () => {
    const repository = createLearningSessionRepository();
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => employeeUserContext,
        {
          repository,
          resultRepository: {
            async findDraftResultByPublicId(query) {
              return query.ownerType === "organization"
                ? createPersistedPaperResult(query.resultPublicId)
                : null;
            },
          },
          now: () => new Date("2026-07-06T04:00:00.000Z"),
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        authorizationPublicId: organizationAuthorizationPublicId,
        sessionPublicId: "ai_paper_learning_session_route_001",
        sourceResultPublicId: "ai_generation_result_route_paper_001",
        sourceTaskPublicId: "ai_generation_task_route_paper_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
        paperAssemblyContainer: createPaperAssemblyContainer(),
        sourceQuestions: [
          {
            questionPublicId: "platform_formal_question_route_public_001",
            sourceKind: "platform_formal_question",
            questionStem: "client supplied source content must be ignored",
          },
        ],
      }),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        status: "created",
        blockReason: null,
        session: {
          sessionPublicId:
            "ai_learning_session_ai_generation_result_route_paper_001",
          ownerType: "organization",
          ownerPublicId: employeeUserContext.organizationPublicId,
          actorPublicId: employeeUserContext.userPublicId,
          questionCount: 2,
        },
      },
    });
    expect(repository.savedSessions[0]?.questions).toEqual([
      expect.objectContaining({
        questionStem: "synthetic route platform source stem",
        standardAnswerLabels: ["A"],
        maxScore: "2.0",
      }),
      expect.objectContaining({
        questionStem: "synthetic route enterprise source stem",
        standardAnswerLabels: ["B"],
        maxScore: "2.0",
      }),
    ]);
    expect(payload.data.session.questions).toEqual([
      expect.objectContaining({
        questionGroup: expect.objectContaining({
          publicId: "question_group_route_public_001",
          questionSortOrder: 1,
          materialSnapshot: {
            materialPublicId: "material_route_public_001",
            title: "synthetic route material",
            contentRichText: "server-owned frozen material content",
          },
        }),
      }),
      expect.objectContaining({
        questionGroup: expect.objectContaining({
          publicId: "question_group_route_public_001",
          questionSortOrder: 2,
        }),
      }),
    ]);
    expect(JSON.stringify(payload)).not.toContain("standardAnswer");
    expect(JSON.stringify(payload)).not.toContain("synthetic route analysis");
    expect(JSON.stringify(payload)).not.toContain(
      "client supplied source content must be ignored",
    );
  });

  it("blocks AI组卷 learning session route creation when the server resolver cannot supply every selected source question", async () => {
    const repository = createLearningSessionRepository();
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        {
          repository,
          resultRepository: {
            async findDraftResultByPublicId(query) {
              return query.ownerType === "personal"
                ? createPersistedPaperResult(query.resultPublicId)
                : null;
            },
            async findPrivatePaperQuestionSnapshotByPublicId() {
              return null;
            },
          },
          now: () => new Date("2026-07-06T04:01:00.000Z"),
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_paper_learning_session_route_missing_source_001",
        sourceResultPublicId:
          "ai_generation_result_route_paper_missing_source_001",
        sourceTaskPublicId: "ai_generation_task_route_paper_missing_source_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
        paperAssemblyContainer: createPaperAssemblyContainer(),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 400056,
      message: "Invalid personal AI learning session input.",
      data: null,
    });
    expect(repository.savedSessions).toHaveLength(0);
  });

  it("keeps the AI出题 learning session route independent from paper snapshot lookup", async () => {
    const repository = createLearningSessionRepository();
    const privatePaperSnapshotLookup = vi.fn();
    const { collection } =
      createPersonalAiGenerationLearningSessionRouteHandlers(
        async () => personalUserContext,
        {
          repository,
          now: () => new Date("2026-07-06T04:02:00.000Z"),
          resultRepository: {
            async findDraftResultByPublicId(query) {
              return createDefaultLearningResult(query.resultPublicId);
            },
            findPrivatePaperQuestionSnapshotByPublicId:
              privatePaperSnapshotLookup,
          },
        },
      );

    const response = await getLearningSessionCollectionPostHandler(collection)(
      createPostRequest({
        sessionPublicId: "ai_learning_session_route_question_regression_001",
        sourceResultPublicId:
          "ai_generation_result_route_question_regression_001",
        sourceTaskPublicId: "ai_generation_task_route_question_regression_001",
        visibleGeneratedContent: createVisibleGeneratedContent(),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        status: "created",
        session: {
          questionCount: 1,
        },
      },
    });
    expect(privatePaperSnapshotLookup).not.toHaveBeenCalled();
  });

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
          sessionPublicId: "ai_learning_session_ai_generation_result_route_001",
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
    expect(repository.savedSessions[0]?.questions[0]).toMatchObject({
      standardAnswerLabels: ["A"],
      standardAnswerText: "A",
      analysis: "synthetic learning route analysis",
    });
    expect(payload.data.session.questions[0]).toEqual({
      sessionQuestionPublicId:
        "ai_learning_session_ai_generation_result_route_001_q_1",
      sourceDraftNumber: 1,
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeLabels: ["synthetic node"],
      questionStem: "synthetic learning route stem",
      questionOptions: [
        { optionLabel: "A", optionText: "synthetic correct option" },
        { optionLabel: "B", optionText: "synthetic wrong option" },
      ],
      maxScore: "1.0",
      reviewStatus: "draft_review_required",
    });
    expect(JSON.stringify(payload)).not.toContain(
      "synthetic learning route analysis",
    );
    expect(JSON.stringify(payload)).not.toContain("standardAnswer");
    expect(JSON.stringify(payload)).not.toContain("isCorrect");
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
        authorizationPublicId: organizationAuthorizationPublicId,
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

  it("ignores a client owner claim outside the user scope and derives ownership from the persisted result", async () => {
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

    await expect(response.json()).resolves.toMatchObject({
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

    const sessionPublicId =
      "ai_learning_session_ai_generation_result_route_progress_001";
    const answerResponse = await getLearningSessionAnswerPostHandler(answers)(
      createAnswerPostRequest(sessionPublicId, {
        sessionQuestionPublicId: `${sessionPublicId}_q_1`,
        expectedAnswerRevision: 0,
        selectedOptionLabels: ["A"],
        textAnswer: null,
      }),
      {
        params: Promise.resolve({
          publicId: sessionPublicId,
        }),
      },
    );
    const progressResponse = await getLearningSessionProgressGetHandler(
      progress,
    )(createProgressGetRequest(sessionPublicId), {
      params: Promise.resolve({
        publicId: sessionPublicId,
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

  it.each([
    ["missing", {}],
    ["null", { expectedAnswerRevision: null }],
    ["string", { expectedAnswerRevision: "0" }],
    ["negative", { expectedAnswerRevision: -1 }],
    ["fractional", { expectedAnswerRevision: 0.5 }],
    ["overflow", { expectedAnswerRevision: 2_147_483_648 }],
    ["unknown field", { expectedAnswerRevision: 0, currentRevision: 0 }],
    ["non-string text answer", { expectedAnswerRevision: 0, textAnswer: 42 }],
    [
      "duplicate option label",
      { expectedAnswerRevision: 0, selectedOptionLabels: ["A", "A"] },
    ],
    [
      "non-canonical option label",
      { expectedAnswerRevision: 0, selectedOptionLabels: [" a "] },
    ],
  ])(
    "rejects %s answer command input before feedback persistence",
    async (_label, revisionInput) => {
      const repository = createLearningSessionRepository();
      const { collection, answers } =
        createPersonalAiGenerationLearningSessionRouteHandlers(
          async () => personalUserContext,
          {
            repository,
            now: () => new Date("2026-07-24T07:00:00.000Z"),
          },
        );
      const sourceResultPublicId =
        "ai_generation_result_route_revision_validation_001";
      const sessionPublicId = `ai_learning_session_${sourceResultPublicId}`;

      await getLearningSessionCollectionPostHandler(collection)(
        createPostRequest({ sourceResultPublicId }),
      );

      const response = await getLearningSessionAnswerPostHandler(answers)(
        createAnswerPostRequest(sessionPublicId, {
          sessionQuestionPublicId: `${sessionPublicId}_q_1`,
          selectedOptionLabels: ["A"],
          textAnswer: null,
          ...revisionInput,
        }),
        { params: Promise.resolve({ publicId: sessionPublicId }) },
      );

      await expect(response.json()).resolves.toEqual({
        code: 400057,
        message: "Invalid personal AI learning answer input.",
        data: null,
      });
      expect(repository.savedAnswerFeedbacks).toEqual([]);
    },
  );

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
