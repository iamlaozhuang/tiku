import { describe, expect, it } from "vitest";

import {
  createAdminAiGenerationLocalContractRouteHandlers,
  type AdminAiGenerationRuntimeBridgeControl,
  type AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract-route";
import type { AdminAiGenerationRuntimeBridgeExecutionSummaryDto } from "../contracts/admin-ai-generation-local-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import type {
  AdminAiGenerationResultDto,
  AdminAiGenerationResultHistoryQuery,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  CreateAdminAiGenerationResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type {
  AdminAiGenerationRouteIntegratedProviderExecutionInput,
  AdminAiGenerationRuntimeBridgeInput,
  AdminAiGenerationRuntimeBridgeRouteWorkflow,
} from "../contracts/admin-ai-generation-runtime-bridge-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingContext,
} from "../contracts/route-integrated-provider-execution-contract";
import type {
  AdminAiGenerationTaskHistoryQuery,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
  AdminAiGenerationTaskPersistenceDto,
  CreateOrReuseAdminAiGenerationTaskInput,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminRole } from "../models/auth";
import type { SessionService } from "./session-service";

const providerDisabledExecutionSummary: AdminAiGenerationRuntimeBridgeExecutionSummaryDto =
  {
    requestCount: 0,
    resultStatus: "blocked",
    failureCategory: "provider_call_blocked",
    durationMs: 0,
    usageSummary: null,
    providerErrorSummary: null,
    redactionStatus: "redacted",
  };
const visibleAdminProviderContent = "后台本次可见 AI 草稿预览";
const defaultAdminGenerationParameters: AiGenerationRouteIntegratedGenerationParameters =
  {
    profession: "marketing",
    level: 3,
    subject: "theory",
    knowledgeNode: "卷烟营销基础",
    questionType: "single_choice",
    questionCount: 10,
    difficulty: "medium",
    learningObjective: "专项练习",
  };
const sufficientAdminGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    evidenceStatus: "sufficient",
    citationCount: 1,
    generationParameters: defaultAdminGenerationParameters,
    citations: [
      {
        resourceTitle: "脱敏营销资料",
        headingPath: ["脱敏章节"],
        chunkIndex: 0,
        chunkText: "脱敏资料片段",
        score: 0.91,
      },
    ],
  };
const insufficientAdminGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    ...sufficientAdminGroundingContext,
    evidenceStatus: "none",
    citationCount: 0,
    citations: [],
  };

function createStructuredAdminProviderContent(
  generationKind: "question" | "paper",
): string {
  if (generationKind === "question") {
    return JSON.stringify({
      questions: Array.from({ length: 10 }, () => ({
        questionType: "single_choice",
        difficulty: "medium",
        knowledgeNodeLabels: ["redacted_knowledge_node"],
      })),
    });
  }

  return JSON.stringify({
    totalQuestionCount: 50,
    paperSections: [
      {
        paperSectionType: "single_choice",
        questionCount: 50,
      },
    ],
    questionTypeDistribution: {
      single_choice: 50,
    },
    knowledgeCoverage: ["redacted_knowledge_node"],
  });
}

function scopedAdminAiGenerationPublicId(prefix: string) {
  return expect.stringMatching(new RegExp(`^${prefix}_[a-f0-9]{16}$`, "u"));
}

function createDefaultAdminWorkspaceCapability(input: {
  adminRoles: AdminRole[];
  organizationPublicId: string | null;
}): AdminWorkspaceCapabilitySummary | undefined {
  const isOrganizationAdvancedRole =
    input.adminRoles.includes("org_advanced_admin") ||
    input.adminRoles.includes("super_admin");
  const isOrganizationStandardRole =
    input.adminRoles.includes("org_standard_admin");

  if (!isOrganizationAdvancedRole && !isOrganizationStandardRole) {
    return undefined;
  }

  return {
    adminRoles: input.adminRoles,
    organizationAuthorizationPublicId:
      isOrganizationAdvancedRole && input.organizationPublicId !== null
        ? "org_auth_public_123"
        : null,
    organizationPublicId: input.organizationPublicId,
    organizationEffectiveEdition: isOrganizationAdvancedRole
      ? "advanced"
      : "standard",
    organizationAuthorizationSource: "org_auth",
    capabilitySource: "service_computed",
    canUseOrganizationAdvancedWorkspace:
      isOrganizationAdvancedRole && input.organizationPublicId !== null,
  };
}

function createAdminSessionService(input: {
  adminPublicId?: string | null;
  adminRoles?: AdminRole[];
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary | null;
  organizationPublicId?: string | null;
}): Pick<SessionService, "getCurrentSession"> {
  const adminRoles = input.adminRoles ?? [];
  const organizationPublicId = input.organizationPublicId ?? null;
  const adminWorkspaceCapability =
    input.adminWorkspaceCapability === null
      ? undefined
      : (input.adminWorkspaceCapability ??
        createDefaultAdminWorkspaceCapability({
          adminRoles,
          organizationPublicId,
        }));

  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          user: {
            publicId: "admin_user_public_123",
            phone: "13800000000",
            name: "local admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId,
            adminPublicId: input.adminPublicId ?? "admin_public_123",
            adminRoles,
            ...(adminWorkspaceCapability === undefined
              ? {}
              : { adminWorkspaceCapability }),
          },
          session: {
            expiresAt: "2026-06-26T20:00:00.000Z",
          },
        },
      };
    },
  };
}

function createPostRequest(
  workspace: AdminAiGenerationWorkspace,
  body: Record<string, unknown>,
): Request {
  const requestBody =
    (body.generationKind === "question" || body.generationKind === "paper") &&
    body.generationParameters === undefined
      ? {
          ...body,
          generationParameters: {
            ...defaultAdminGenerationParameters,
            questionCount: body.generationKind === "question" ? 10 : 50,
          },
        }
      : body;

  return new Request(
    `http://localhost/api/v1/${workspace}-ai-generation-requests`,
    {
      body: JSON.stringify(requestBody),
      headers: {
        authorization: "Bearer synthetic-admin-session",
        "content-type": "application/json",
      },
      method: "POST",
    },
  );
}

function createGetRequest(
  workspace: AdminAiGenerationWorkspace,
  searchParams = "",
): Request {
  return new Request(
    `http://localhost/api/v1/${workspace}-ai-generation-requests${searchParams}`,
    {
      headers: {
        authorization: "Bearer synthetic-admin-session",
      },
      method: "GET",
    },
  );
}

async function postLocalContractRequest(input: {
  workspace: AdminAiGenerationWorkspace;
  adminRoles: AdminRole[];
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary | null;
  organizationPublicId?: string | null;
  body: Record<string, unknown>;
  requestPublicId?: string;
  requestedAt?: Date;
  runtimeBridgeControl?: AdminAiGenerationRuntimeBridgeControl;
  resultPersistenceRepository?: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
}) {
  const taskPersistence =
    input.taskPersistenceRepository ??
    createTaskPersistenceRecorder().repository;
  const resultPersistence =
    input.resultPersistenceRepository ??
    createGeneratedResultPersistenceRecorder().repository;
  const routeOptions = {
    sessionService: createAdminSessionService({
      adminRoles: input.adminRoles,
      adminWorkspaceCapability: input.adminWorkspaceCapability,
      organizationPublicId: input.organizationPublicId,
    }),
    taskPersistenceRepository: taskPersistence,
    resultPersistenceRepository: resultPersistence,
    createRequestPublicId: () =>
      input.requestPublicId ?? "admin_ai_generation_request_public_route_test",
    requestClock: () =>
      input.requestedAt ?? new Date("2026-06-26T20:00:00.000Z"),
    ...(input.runtimeBridgeControl
      ? { runtimeBridgeControl: input.runtimeBridgeControl }
      : {}),
  } as unknown as Parameters<
    typeof createAdminAiGenerationLocalContractRouteHandlers
  >[1];
  const { collection } = createAdminAiGenerationLocalContractRouteHandlers(
    input.workspace,
    routeOptions,
  );

  return collection.POST(createPostRequest(input.workspace, input.body));
}

function createFakeProviderRuntimeBridgeControl(
  providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[],
  input: {
    content?: string;
    groundingContext?: AiGenerationRouteIntegratedGroundingContext;
  } = {},
): AdminAiGenerationRuntimeBridgeControl {
  return {
    bridgeMode: "controlled_runner",
    explicitLocalSwitchPresent: true,
    providerExecution: {
      executionMode: "route_integrated_provider",
      realProviderExecutionApproved: true,
      maxRequests: 1,
      maxRetries: 0,
      maxOutputTokens: 220,
      timeoutMs: 30000,
      readProviderCredential: () => "synthetic-admin-provider-credential",
      resolveGroundingContext: () =>
        input.groundingContext ?? sufficientAdminGroundingContext,
      executeProviderRequest: async (providerInput) => {
        providerInputs.push(providerInput);

        return {
          requestCount: 1,
          resultStatus: "pass",
          failureCategory: null,
          durationMs: 21,
          usageSummary: {
            promptTokens: 5,
            completionTokens: 2,
            totalTokens: 7,
          },
          providerErrorSummary: null,
          visibleGeneratedContent: {
            content:
              input.content ??
              createStructuredAdminProviderContent(
                providerInput.requestContext.generationKind,
              ),
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
          },
        };
      },
    },
  };
}

async function getLocalContractHistory(input: {
  workspace: AdminAiGenerationWorkspace;
  adminRoles: AdminRole[];
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary | null;
  organizationPublicId?: string | null;
  searchParams?: string;
  resultPersistenceRepository?: AdminAiGenerationResultPersistenceRepository;
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
}) {
  const taskPersistence =
    input.taskPersistenceRepository ??
    createTaskPersistenceRecorder().repository;
  const resultPersistence =
    input.resultPersistenceRepository ??
    createGeneratedResultPersistenceRecorder().repository;
  const { collection } = createAdminAiGenerationLocalContractRouteHandlers(
    input.workspace,
    {
      sessionService: createAdminSessionService({
        adminRoles: input.adminRoles,
        adminWorkspaceCapability: input.adminWorkspaceCapability,
        organizationPublicId: input.organizationPublicId,
      }),
      resultPersistenceRepository: resultPersistence,
      taskPersistenceRepository: taskPersistence,
    },
  );

  const getHandler = (
    collection as {
      GET: (request: Request) => Promise<Response>;
    }
  ).GET;

  return getHandler(createGetRequest(input.workspace, input.searchParams));
}

function createTaskPersistenceResult(
  input: CreateOrReuseAdminAiGenerationTaskInput,
  persistenceStatus: AdminAiGenerationTaskPersistenceResult["persistenceStatus"],
): AdminAiGenerationTaskPersistenceResult {
  const taskRequest = input.localContract.taskRequest;

  return {
    persistenceStatus,
    task: {
      requestPublicId: input.requestPublicId,
      taskPublicId: taskRequest.taskPublicId,
      taskType:
        taskRequest.taskType === "ai_paper_generation"
          ? "ai_paper_generation"
          : "ai_question_generation",
      workspace: input.localContract.workspace,
      generationKind: input.localContract.generationKind,
      status: "pending",
      requestedAt: input.requestedAt.toISOString(),
      authorizationSource: taskRequest.authorizationSource,
      authorizationPublicId: taskRequest.authorizationPublicId,
      actorPublicId: taskRequest.actorPublicId,
      ownerType: taskRequest.ownerType,
      ownerPublicId: taskRequest.ownerPublicId,
      organizationPublicId: taskRequest.organizationPublicId,
      quotaOwnerType: taskRequest.quotaOwnerType,
      quotaOwnerPublicId: taskRequest.quotaOwnerPublicId,
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      runtimeStatus: "local_contract_only",
      runtimeBridgeStatus: "provider_call_blocked",
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      costCalibrationExecuted: false,
      formalContentBoundary: {
        questionWriteStatus: "blocked_without_follow_up_task",
        paperWriteStatus: "blocked_without_follow_up_task",
      },
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
      contentVisibility: "summary_only",
      redactionStatus: "redacted",
    },
  };
}

function createTaskHistoryItem(input: {
  generationKind: "question" | "paper";
  requestedAt: string;
  resultPublicId?: string | null;
  status?: AdminAiGenerationTaskPersistenceDto["status"];
  taskPublicId: string;
  workspace: AdminAiGenerationWorkspace;
}): AdminAiGenerationTaskPersistenceDto {
  const isContent = input.workspace === "content";
  const ownerPublicId = isContent
    ? "platform_content_review_pool"
    : "organization_public_123";

  return {
    requestPublicId: `${input.taskPublicId}_request`,
    taskPublicId: input.taskPublicId,
    taskType:
      input.generationKind === "question"
        ? "ai_question_generation"
        : "ai_paper_generation",
    workspace: input.workspace,
    generationKind: input.generationKind,
    status: input.status ?? "pending",
    requestedAt: input.requestedAt,
    authorizationSource: isContent ? "admin_role" : "org_auth",
    authorizationPublicId: isContent
      ? "admin_role_content_ai_generation"
      : "org_auth_public_123",
    actorPublicId: "admin_public_123",
    ownerType: isContent ? "platform" : "organization",
    ownerPublicId,
    organizationPublicId: isContent ? null : "organization_public_123",
    quotaOwnerType: isContent ? "platform" : "organization",
    quotaOwnerPublicId: ownerPublicId,
    resultPublicId: input.resultPublicId ?? null,
    evidenceStatus: "none",
    citationCount: 0,
    aiCallLogPublicId: null,
    runtimeStatus: "local_contract_only",
    runtimeBridgeStatus: "provider_call_blocked",
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    costCalibrationExecuted: false,
    formalContentBoundary: {
      questionWriteStatus: "blocked_without_follow_up_task",
      paperWriteStatus: "blocked_without_follow_up_task",
    },
    sourceQuestionPublicId: null,
    sourcePaperPublicId: null,
    contentVisibility: "summary_only",
    redactionStatus: "redacted",
  };
}

function createGeneratedResultHistoryItem(input: {
  generationKind: "question" | "paper";
  persistedAt: string;
  resultPublicId: string;
  taskPublicId: string;
  workspace: AdminAiGenerationWorkspace;
  reviewedDraft?: AdminAiGenerationResultDto["contentReference"]["reviewedDraft"];
}): AdminAiGenerationResultDto {
  const isContent = input.workspace === "content";
  const ownerPublicId = isContent
    ? "platform_content_review_pool"
    : "organization_public_123";

  return {
    resultPublicId: input.resultPublicId,
    taskPublicId: input.taskPublicId,
    requestPublicId: `${input.taskPublicId}_request`,
    workspace: input.workspace,
    generationKind: input.generationKind,
    ownerType: isContent ? "platform" : "organization",
    ownerPublicId,
    organizationPublicId: isContent ? null : "organization_public_123",
    taskType:
      input.generationKind === "question"
        ? "ai_question_generation"
        : "ai_paper_generation",
    status: "draft",
    persistedAt: input.persistedAt,
    contentReference: {
      contentDigest: "sha256:omitted-from-history-response",
      contentPreviewMasked: `redacted generated result summary for ${input.workspace} ${input.generationKind}`,
      contentVisibility: "redacted_snapshot",
      reviewedDraft: input.reviewedDraft ?? null,
      redactionStatus: "redacted",
    },
    evidenceReference: {
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: "ai_call_log_public_omitted_from_history_response",
      redactionStatus: "redacted",
    },
    sourceReference: {
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
    },
    formalAdoption: {
      isBlocked: true,
      status: "blocked",
    },
  };
}

function createTaskPersistenceRecorder(
  input: {
    persistenceStatus?: AdminAiGenerationTaskPersistenceResult["persistenceStatus"];
    taskHistoryItems?: AdminAiGenerationTaskPersistenceDto[];
  } = {},
): {
  calls: CreateOrReuseAdminAiGenerationTaskInput[];
  historyQueries: AdminAiGenerationTaskHistoryQuery[];
  repository: AdminAiGenerationTaskPersistenceRepository;
} {
  const calls: CreateOrReuseAdminAiGenerationTaskInput[] = [];
  const historyQueries: AdminAiGenerationTaskHistoryQuery[] = [];

  return {
    calls,
    historyQueries,
    repository: {
      async createOrReuseTask(createInput) {
        calls.push(createInput);

        return createTaskPersistenceResult(
          createInput,
          input.persistenceStatus ?? "created",
        );
      },
      async listTaskHistory(query) {
        historyQueries.push(query);

        return input.taskHistoryItems ?? [];
      },
    },
  };
}

function createGeneratedResultPersistenceResult(
  input: CreateAdminAiGenerationResultInput,
  persistenceStatus: AdminAiGenerationResultPersistenceResult["persistenceStatus"],
): AdminAiGenerationResultPersistenceResult {
  return {
    persistenceStatus,
    result: {
      resultPublicId: input.resultPublicId,
      taskPublicId: input.taskPublicId,
      requestPublicId: `${input.taskPublicId}_request`,
      workspace: input.workspace,
      generationKind: input.generationKind,
      ownerType: input.ownerType,
      ownerPublicId: input.ownerPublicId,
      organizationPublicId: input.organizationPublicId,
      taskType: input.taskType,
      status: "draft",
      persistedAt: input.createdAt.toISOString(),
      contentReference: {
        contentDigest: input.contentDigest,
        contentPreviewMasked: input.contentPreviewMasked,
        contentVisibility: "redacted_snapshot",
        reviewedDraft: (input.contentRedactedSnapshot.formalReviewedDraft ??
          null) as AdminAiGenerationResultDto["contentReference"]["reviewedDraft"],
        redactionStatus: "redacted",
      },
      evidenceReference: {
        evidenceStatus: input.evidenceStatus,
        citationCount: input.citationCount,
        aiCallLogPublicId: input.aiCallLogPublicId,
        redactionStatus: "redacted",
      },
      sourceReference: {
        sourceQuestionPublicId: input.sourceQuestionPublicId,
        sourcePaperPublicId: input.sourcePaperPublicId,
      },
      formalAdoption: {
        isBlocked: true,
        status: "blocked",
      },
    },
  };
}

function createGeneratedResultPersistenceRecorder(
  input: {
    draftResults?: AdminAiGenerationResultDto[];
    persistenceStatus?: AdminAiGenerationResultPersistenceResult["persistenceStatus"];
  } = {},
): {
  calls: CreateAdminAiGenerationResultInput[];
  historyQueries: AdminAiGenerationResultHistoryQuery[];
  repository: AdminAiGenerationResultPersistenceRepository;
} {
  const calls: CreateAdminAiGenerationResultInput[] = [];
  const historyQueries: AdminAiGenerationResultHistoryQuery[] = [];

  return {
    calls,
    historyQueries,
    repository: {
      async listDraftResults(query) {
        historyQueries.push(query);

        return input.draftResults ?? [];
      },
      async createOrReuseDraftResult(createInput) {
        calls.push(createInput);

        return createGeneratedResultPersistenceResult(
          createInput,
          input.persistenceStatus ?? "created",
        );
      },
    },
  };
}

describe("admin AI generation local contract route handlers", () => {
  it("accepts content admin AI question requests as platform-owned local contracts", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
        requestedRuntimeMode: "route_integrated_provider",
        clientOnlyFixtureA: "OMITTED_FIXTURE_A",
        clientOnlyFixtureB: "OMITTED_FIXTURE_B",
        clientOnlyFixtureC: "OMITTED_FIXTURE_C",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        workspace: "content",
        generationKind: "question",
        flowStatus: "accepted",
        redactionStatus: "redacted",
        taskRequest: {
          decision: "create_pending_task",
          taskType: "ai_question_generation",
          authorizationSource: "admin_role",
          ownerType: "platform",
          ownerPublicId: "platform_content_review_pool",
          quotaOwnerType: "platform",
          quotaOwnerPublicId: "platform_content_review_pool",
          resultReference: {
            resultKind: "ai_generated_question_set",
            resultPublicId: scopedAdminAiGenerationPublicId(
              "admin_ai_generation_result_content_question_admin_public_123",
            ),
            contentVisibility: "summary_only",
            redactionStatus: "redacted",
            evidenceStatus: "sufficient",
            citationCount: 1,
          },
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
          executionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            redactionStatus: "redacted",
          },
          blockedReasons: [],
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
        taskPersistence: {
          persistenceStatus: "created",
          requestPublicId: "admin_ai_generation_request_public_route_test",
          taskPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_task_content_question_admin_public_123",
          ),
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_content_question_admin_public_123",
          ),
          contentVisibility: "summary_only",
          evidenceStatus: "sufficient",
          citationCount: 1,
          redactionStatus: "redacted",
        },
        generatedResult: {
          persistenceStatus: "created",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_content_question_admin_public_123",
          ),
          contentVisibility: "redacted_snapshot",
          evidenceStatus: "sufficient",
          citationCount: 1,
          formalAdoptionStatus: "blocked",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedPayload).not.toContain("route_integrated_provider");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_A");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_B");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_C");
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(providerInputs).toHaveLength(1);
  });

  it("scopes admin generation task identity to each request so stale actor-level results are not reused", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const resultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();

    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_first_attempt",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
      },
    });
    await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_second_attempt",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
      },
    });

    expect(taskPersistenceRecorder.calls).toHaveLength(2);
    expect(resultPersistenceRecorder.calls).toHaveLength(2);
    expect(providerInputs).toHaveLength(2);

    const [firstTaskCall, secondTaskCall] = taskPersistenceRecorder.calls;
    const [firstResultCall, secondResultCall] = resultPersistenceRecorder.calls;

    expect(firstTaskCall.localContract.taskRequest.taskPublicId).not.toBe(
      secondTaskCall.localContract.taskRequest.taskPublicId,
    );
    expect(
      firstTaskCall.localContract.taskRequest.idempotency.keyHash,
    ).not.toBe(secondTaskCall.localContract.taskRequest.idempotency.keyHash);
    expect(firstResultCall.resultPublicId).not.toBe(
      secondResultCall.resultPublicId,
    );
  });

  it("persists content admin local contracts through the injected task persistence repository", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_content_route_123",
      requestedAt: new Date("2026-06-26T20:10:00.000Z"),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "question",
        clientOnlyFixtureF: "OMITTED_FIXTURE_F",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(taskPersistenceRecorder.calls[0]).toMatchObject({
      requestPublicId: "admin_ai_generation_request_public_content_route_123",
      requestedAt: new Date("2026-06-26T20:10:00.000Z"),
      localContract: {
        runtimeStatus: "local_contract_only",
        workspace: "content",
        generationKind: "question",
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
      },
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        taskPersistence: {
          persistenceStatus: "created",
          requestPublicId:
            "admin_ai_generation_request_public_content_route_123",
          taskPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_task_content_question_admin_public_123",
          ),
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_content_question_admin_public_123",
          ),
          contentVisibility: "summary_only",
          evidenceStatus: "sufficient",
          citationCount: 1,
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_F");
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(providerInputs).toHaveLength(1);
  });

  it("blocks content admin provider-disabled requests before task or result persistence", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_content_route_123",
      requestedAt: new Date("2026-06-26T20:10:00.000Z"),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        clientOnlyFixtureI: "OMITTED_FIXTURE_I",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 409015,
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toHaveLength(0);
    expect(generatedResultPersistenceRecorder.calls).toHaveLength(0);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_I");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("returns reused persistence summaries for organization advanced admin requests", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      persistenceStatus: "reused",
    });
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      requestPublicId: "admin_ai_generation_request_public_org_route_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        clientOnlyFixtureG: "OMITTED_FIXTURE_G",
      },
    });
    const payload = await response.json();

    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(taskPersistenceRecorder.calls[0]).toMatchObject({
      localContract: {
        workspace: "organization",
        generationKind: "paper",
        taskRequest: {
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          quotaOwnerType: "organization",
          quotaOwnerPublicId: "organization_public_123",
        },
      },
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        taskPersistence: {
          persistenceStatus: "reused",
          requestPublicId: "admin_ai_generation_request_public_org_route_123",
          taskPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_task_organization_paper_admin_public_123",
          ),
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_organization_paper_admin_public_123",
          ),
          redactionStatus: "redacted",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("OMITTED_FIXTURE_G");
    expect(providerInputs).toHaveLength(1);
  });

  it("persists organization advanced admin grounded generated result summaries", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        persistenceStatus: "reused",
      });
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      requestPublicId: "admin_ai_generation_request_public_org_route_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        clientOnlyFixtureJ: "OMITTED_FIXTURE_J",
      },
    });
    const payload = await response.json();

    expect(generatedResultPersistenceRecorder.calls).toHaveLength(1);
    expect(generatedResultPersistenceRecorder.calls[0]).toMatchObject({
      resultPublicId: scopedAdminAiGenerationPublicId(
        "admin_ai_generation_result_organization_paper_admin_public_123",
      ),
      taskPublicId: scopedAdminAiGenerationPublicId(
        "admin_ai_generation_task_organization_paper_admin_public_123",
      ),
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_123",
      organizationPublicId: "organization_public_123",
      taskType: "ai_paper_generation",
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        resultState: {
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_organization_paper_admin_public_123",
          ),
        },
        generatedResult: {
          persistenceStatus: "reused",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_organization_paper_admin_public_123",
          ),
          formalAdoptionStatus: "blocked",
        },
        runtimeBridge: {
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("OMITTED_FIXTURE_J");
    expect(providerInputs).toHaveLength(1);
  });

  it("exposes organization-owned draft and training source boundaries without platform publish access", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        organizationOwnedDraftBoundary: {
          generatedResultScope: "organization_private",
          organizationDraftAdoptionStatus:
            "allowed_as_organization_private_draft",
          organizationTrainingSourceStatus:
            "allowed_as_organization_private_training_source",
          platformFormalDraftStatus: "blocked_requires_content_admin_review",
          publishStatus: "blocked_requires_fresh_publish_task",
          studentVisibleStatus: "blocked",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          redactionStatus: "redacted",
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
        runtimeBridge: {
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
        },
      },
    });
    expect(providerInputs).toHaveLength(1);
  });

  it("accepts organization advanced admin AI paper requests as organization-owned local contracts", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      body: {
        generationKind: "paper",
        clientOnlyFixtureD: "OMITTED_FIXTURE_D",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        runtimeStatus: "local_contract_only",
        workspace: "organization",
        generationKind: "paper",
        flowStatus: "accepted",
        taskRequest: {
          taskType: "ai_paper_generation",
          authorizationSource: "org_auth",
          ownerType: "organization",
          ownerPublicId: "organization_public_123",
          organizationPublicId: "organization_public_123",
          quotaOwnerType: "organization",
          quotaOwnerPublicId: "organization_public_123",
          resultReference: {
            resultKind: "ai_generated_paper_draft",
            resultPublicId: scopedAdminAiGenerationPublicId(
              "admin_ai_generation_result_organization_paper_admin_public_123",
            ),
            contentVisibility: "summary_only",
          },
        },
        resultState: {
          status: "succeeded",
          resultPublicId: scopedAdminAiGenerationPublicId(
            "admin_ai_generation_result_organization_paper_admin_public_123",
          ),
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_succeeded",
          providerCallExecuted: true,
          envSecretAccessed: true,
          providerConfigurationRead: true,
          costCalibrationExecuted: false,
          executionSummary: {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            redactionStatus: "redacted",
          },
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_D");
    expect(providerInputs).toHaveLength(1);
  });

  it("passes admin runtime bridge context into provider-disabled diagnostics", async () => {
    const runtimeBridgeInputs: AdminAiGenerationRuntimeBridgeInput[] = [];
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      body: {
        generationKind: "paper",
      },
      runtimeBridgeControl: {
        createProviderDisabledOutcome: (input) => {
          runtimeBridgeInputs.push(input);

          return {
            blockedReasons: [
              "provider_call_blocked",
              "real_provider_execution_requires_follow_up_task",
            ],
            executionSummary: providerDisabledExecutionSummary,
          };
        },
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 409015,
      data: null,
    });
    expect(runtimeBridgeInputs).toEqual([
      {
        actorPublicId: "admin_public_123",
        workspace: "organization",
        generationKind: "paper",
        generationParameters: {
          ...defaultAdminGenerationParameters,
          questionCount: 50,
        },
        requestPublicId: "admin_ai_generation_request_public_route_test",
        taskPublicId: scopedAdminAiGenerationPublicId(
          "admin_ai_generation_task_organization_paper_admin_public_123",
        ),
        resultPublicId: scopedAdminAiGenerationPublicId(
          "admin_ai_generation_result_organization_paper_admin_public_123",
        ),
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        organizationPublicId: "organization_public_123",
      },
    ]);
  });

  it("allows injected provider-disabled diagnostics without enabling provider execution", async () => {
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "paper",
      },
      runtimeBridgeControl: {
        createProviderDisabledOutcome: () => ({
          blockedReasons: [
            "provider_call_blocked",
            "admin_runtime_bridge_control_injected",
          ],
          executionSummary: {
            ...providerDisabledExecutionSummary,
            durationMs: 12,
          },
        }),
      },
    });
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 409015,
      data: null,
    });
  });

  it.each<{
    adminRoles: AdminRole[];
    generationKind: "question" | "paper";
    organizationPublicId?: string | null;
    routeWorkflow: AdminAiGenerationRuntimeBridgeRouteWorkflow;
    workspace: AdminAiGenerationWorkspace;
  }>([
    {
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "question",
      organizationPublicId: null,
      routeWorkflow: "content_ai_question_generation",
    },
    {
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "paper",
      organizationPublicId: null,
      routeWorkflow: "content_ai_paper_generation",
    },
    {
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      generationKind: "question",
      organizationPublicId: "organization_public_123",
      routeWorkflow: "organization_ai_question_generation",
    },
    {
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      generationKind: "paper",
      organizationPublicId: "organization_public_123",
      routeWorkflow: "organization_ai_paper_generation",
    },
  ])(
    "runs provider-enabled fake Provider route workflow $routeWorkflow",
    async (routeCase) => {
      const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
        [];
      const resultPersistenceRecorder =
        createGeneratedResultPersistenceRecorder();
      const response = await postLocalContractRequest({
        workspace: routeCase.workspace,
        adminRoles: routeCase.adminRoles,
        organizationPublicId: routeCase.organizationPublicId,
        body: {
          generationKind: routeCase.generationKind,
          clientOnlyFixtureK: "OMITTED_FIXTURE_K",
        },
        runtimeBridgeControl:
          createFakeProviderRuntimeBridgeControl(providerInputs),
        resultPersistenceRepository: resultPersistenceRecorder.repository,
      });
      const payload = await response.json();
      const serializedPayload = JSON.stringify(payload);

      expect(providerInputs).toHaveLength(1);
      expect(providerInputs[0]).toMatchObject({
        providerMetadata: {
          providerName: "alibaba-qwen",
          modelName: "qwen3.7-max",
        },
        limits: {
          maxRequests: 1,
          maxRetries: 0,
          maxOutputTokens: 220,
          timeoutMs: 30000,
        },
        requestContext: {
          routeWorkflow: routeCase.routeWorkflow,
          workspace: routeCase.workspace,
          generationKind: routeCase.generationKind,
          ownerType:
            routeCase.workspace === "content" ? "platform" : "organization",
          ownerPublicId:
            routeCase.workspace === "content"
              ? "platform_content_review_pool"
              : "organization_public_123",
          organizationPublicId:
            routeCase.workspace === "content"
              ? null
              : "organization_public_123",
        },
      });
      expect(payload).toMatchObject({
        code: 0,
        data: {
          runtimeStatus: "local_contract_only",
          workspace: routeCase.workspace,
          generationKind: routeCase.generationKind,
          runtimeBridge: {
            bridgeStatus: "provider_call_succeeded",
            providerCallExecuted: true,
            envSecretAccessed: true,
            providerConfigurationRead: true,
            costCalibrationExecuted: false,
            executionSummary: {
              requestCount: 1,
              resultStatus: "pass",
              failureCategory: null,
              durationMs: 21,
              usageSummary: {
                promptTokens: 5,
                completionTokens: 2,
                totalTokens: 7,
              },
              providerErrorSummary: null,
              redactionStatus: "redacted",
            },
            visibleGeneratedContent: {
              content: expect.any(String),
              contentVisibility: "transient_response_only",
              persistenceStatus: "not_persisted",
              safetyStatus: "checked",
              groundingSummary: {
                evidenceStatus: "sufficient",
                citationCount: 1,
              },
              structuredPreview: expect.objectContaining({
                kind:
                  routeCase.generationKind === "question"
                    ? "question_set"
                    : "paper_draft",
                parseStatus: "parsed",
              }),
            },
            blockedReasons: [],
          },
          formalContentBoundary: {
            questionWriteStatus: "blocked_without_follow_up_task",
            paperWriteStatus: "blocked_without_follow_up_task",
          },
        },
      });
      expect(serializedPayload).not.toContain(
        "synthetic-admin-provider-credential",
      );
      expect(serializedPayload).not.toContain("OMITTED_FIXTURE_K");
      expect(serializedPayload).not.toContain("rawPrompt");
      expect(serializedPayload).not.toContain("rawOutput");
      expect(serializedPayload).not.toContain("providerPayload");
      expect(serializedPayload).not.toContain("Authorization");
      expect(serializedPayload).not.toMatch(/"id":/);
      expect(
        JSON.stringify(
          (payload.data as { runtimeBridge: { executionSummary: unknown } })
            .runtimeBridge.executionSummary,
        ),
      ).not.toContain(visibleAdminProviderContent);
      expect(JSON.stringify(resultPersistenceRecorder.calls)).not.toContain(
        visibleAdminProviderContent,
      );
    },
  );

  it("blocks admin result persistence when Provider grounding evidence is insufficient", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const resultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "question",
        clientOnlyFixtureM: "OMITTED_FIXTURE_M",
      },
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl(
        providerInputs,
        {
          groundingContext: insufficientAdminGroundingContext,
        },
      ),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 409015,
      data: null,
    });
    expect(providerInputs).toHaveLength(0);
    expect(taskPersistenceRecorder.calls).toHaveLength(0);
    expect(resultPersistenceRecorder.calls).toHaveLength(0);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_M");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it("blocks admin result persistence when Provider output cannot be parsed into the requested draft kind", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const resultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      body: {
        generationKind: "question",
        clientOnlyFixtureN: "OMITTED_FIXTURE_N",
      },
      runtimeBridgeControl: createFakeProviderRuntimeBridgeControl(
        providerInputs,
        {
          content: JSON.stringify({
            questions: [{ questionType: "single_choice" }],
          }),
        },
      ),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository: resultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 409015,
      data: null,
    });
    expect(providerInputs).toHaveLength(1);
    expect(taskPersistenceRecorder.calls).toHaveLength(0);
    expect(resultPersistenceRecorder.calls).toHaveLength(0);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_N");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it("uses service-computed org_auth public id for organization AI task persistence", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_advanced_admin"],
        organizationAuthorizationPublicId: "org_auth_route_public_123",
        organizationPublicId: "organization_public_123",
        organizationEffectiveEdition: "advanced",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: true,
      },
      organizationPublicId: "organization_public_123",
      runtimeBridgeControl:
        createFakeProviderRuntimeBridgeControl(providerInputs),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        requestedRuntimeMode: "route_integrated_provider",
        clientOnlyFixtureO: "OMITTED_FIXTURE_O",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toMatchObject({
      code: 0,
      data: {
        taskRequest: {
          authorizationSource: "org_auth",
          authorizationPublicId: "org_auth_route_public_123",
          organizationPublicId: "organization_public_123",
        },
      },
    });
    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(
      taskPersistenceRecorder.calls[0]?.localContract.taskRequest
        .authorizationPublicId,
    ).toBe("org_auth_route_public_123");
    expect(serializedPayload).not.toContain("org_auth_local_contract");
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_O");
  });

  it("denies organization advanced admin direct POST when service-computed capability is absent", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: null,
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        clientOnlyFixtureL: "OMITTED_FIXTURE_L",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_L");
  });

  it("denies organization advanced admin direct GET when service-computed capability is false", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await getLocalContractHistory({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_advanced_admin"],
        organizationPublicId: "organization_public_123",
        organizationEffectiveEdition: "advanced",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: false,
      },
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
    });
    const payload = await response.json();

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.historyQueries).toEqual([]);
  });

  it("denies organization standard admin direct POST without creating a task contract", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_standard_admin"],
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "question",
        clientOnlyFixtureE: "OMITTED_FIXTURE_E",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_E");
  });

  it("does not persist invalid admin AI generation requests", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      body: {
        generationKind: "unsupported",
        clientOnlyFixtureH: "OMITTED_FIXTURE_H",
      },
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(payload).toEqual({
      code: 400013,
      message: "Invalid admin AI generation request input.",
      data: null,
    });
    expect(taskPersistenceRecorder.calls).toEqual([]);
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_H");
  });

  it("returns content admin metadata-only task history scoped to the content review workspace", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "content",
          generationKind: "paper",
          taskPublicId: "admin_ai_generation_task_content_paper_history_123",
          requestedAt: "2026-06-26T20:30:00.000Z",
        }),
      ],
    });
    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=paper&page=1&pageSize=10",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(taskPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "paper",
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 1,
        pageSize: 10,
        total: 1,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
      data: {
        workspace: "content",
        latestTask: {
          taskPublicId: "admin_ai_generation_task_content_paper_history_123",
          generationKind: "paper",
          status: "pending",
          resultPublicId: null,
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          runtimeStatus: "local_contract_only",
          runtimeBridgeStatus: "provider_call_blocked",
          providerCallExecuted: false,
          costCalibrationExecuted: false,
          redactionStatus: "redacted",
          formalContentBoundary: {
            questionWriteStatus: "blocked_without_follow_up_task",
            paperWriteStatus: "blocked_without_follow_up_task",
          },
        },
        items: [
          {
            taskPublicId: "admin_ai_generation_task_content_paper_history_123",
            runtimeBridgeStatus: "provider_call_blocked",
          },
        ],
        redactionStatus: "redacted",
      },
    });
    expect(serializedPayload).not.toMatch(/"id":/);
    expect(serializedPayload).not.toContain("prompt");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toContain("Authorization");
  });

  it("passes generation kind and pagination query into admin AI history repositories", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder();

    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=paper&page=2&pageSize=5",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });
    const payload = await response.json();

    expect(taskPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "paper",
        page: 2,
        pageSize: 5,
        limit: 5,
        offset: 5,
      },
    ]);
    expect(generatedResultPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "paper",
        page: 2,
        pageSize: 5,
        limit: 5,
        offset: 5,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 5,
        total: 0,
        sortBy: "requestedAt",
        sortOrder: "desc",
      },
    });
  });

  it("returns content admin generated result history summaries without raw result payloads", async () => {
    const taskPublicId =
      "admin_ai_generation_task_content_question_history_456";
    const resultPublicId =
      "admin_ai_generation_result_content_question_history_456";
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "content",
          generationKind: "question",
          taskPublicId,
          resultPublicId,
          status: "succeeded",
          requestedAt: "2026-06-26T20:40:00.000Z",
        }),
      ],
    });
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        draftResults: [
          createGeneratedResultHistoryItem({
            workspace: "content",
            generationKind: "question",
            taskPublicId,
            resultPublicId,
            persistedAt: "2026-06-26T20:41:00.000Z",
          }),
        ],
      });
    const response = await getLocalContractHistory({
      workspace: "content",
      adminRoles: ["content_admin"],
      searchParams: "?generationKind=question&page=1&pageSize=10",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(generatedResultPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "question",
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        latestTask: {
          taskPublicId,
          resultPublicId,
          generatedResult: {
            resultPublicId,
            persistedAt: "2026-06-26T20:41:00.000Z",
            status: "draft",
            contentPreviewMasked:
              "redacted generated result summary for content question",
            contentVisibility: "redacted_snapshot",
            evidenceStatus: "none",
            citationCount: 0,
            formalAdoptionStatus: "blocked",
            redactionStatus: "redacted",
          },
        },
        items: [
          {
            taskPublicId,
            generatedResult: {
              resultPublicId,
              contentPreviewMasked:
                "redacted generated result summary for content question",
              formalAdoptionStatus: "blocked",
            },
          },
        ],
      },
    });
    expect(serializedPayload).not.toContain("contentDigest");
    expect(serializedPayload).not.toContain("contentRedactedSnapshot");
    expect(serializedPayload).not.toContain("aiCallLogPublicId");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("returns organization advanced admin generated result history scoped to the current organization", async () => {
    const taskPublicId =
      "admin_ai_generation_task_organization_paper_history_789";
    const resultPublicId =
      "admin_ai_generation_result_organization_paper_history_789";
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      taskHistoryItems: [
        createTaskHistoryItem({
          workspace: "organization",
          generationKind: "paper",
          taskPublicId,
          resultPublicId,
          status: "succeeded",
          requestedAt: "2026-06-26T20:50:00.000Z",
        }),
      ],
    });
    const generatedResultPersistenceRecorder =
      createGeneratedResultPersistenceRecorder({
        draftResults: [
          createGeneratedResultHistoryItem({
            workspace: "organization",
            generationKind: "paper",
            taskPublicId,
            resultPublicId,
            persistedAt: "2026-06-26T20:51:00.000Z",
          }),
        ],
      });
    const response = await getLocalContractHistory({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      searchParams: "?generationKind=paper&page=1&pageSize=10",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        generatedResultPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(generatedResultPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "organization",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        generationKind: "paper",
        page: 1,
        pageSize: 10,
        limit: 10,
        offset: 0,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        workspace: "organization",
        latestTask: {
          taskPublicId,
          organizationOwnedDraftBoundary: {
            generatedResultScope: "organization_private",
            organizationDraftAdoptionStatus:
              "allowed_as_organization_private_draft",
            organizationTrainingSourceStatus:
              "allowed_as_organization_private_training_source",
            platformFormalDraftStatus: "blocked_requires_content_admin_review",
            publishStatus: "blocked_requires_fresh_publish_task",
            studentVisibleStatus: "blocked",
            ownerType: "organization",
            ownerPublicId: "organization_public_123",
            organizationPublicId: "organization_public_123",
            redactionStatus: "redacted",
          },
          generatedResult: {
            resultPublicId,
            contentPreviewMasked:
              "redacted generated result summary for organization paper",
            contentVisibility: "redacted_snapshot",
            formalAdoptionStatus: "blocked",
            redactionStatus: "redacted",
          },
        },
      },
    });
    expect(serializedPayload).not.toContain("contentDigest");
    expect(serializedPayload).not.toContain("ai_call_log_public_omitted");
    expect(serializedPayload).not.toContain("providerPayload");
  });

  it("denies organization standard admin direct GET without listing task history", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await getLocalContractHistory({
      workspace: "organization",
      adminRoles: ["org_standard_admin"],
      organizationPublicId: "organization_public_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
    });
    const payload = await response.json();

    expect(payload).toEqual({
      code: 403011,
      message: "Admin AI generation is not available for this role.",
      data: null,
    });
    expect(taskPersistenceRecorder.historyQueries).toEqual([]);
  });
});
