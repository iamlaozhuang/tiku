import { describe, expect, it } from "vitest";

import {
  createAdminAiGenerationLocalContractRouteHandlers,
  type AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract-route";
import type { AdminAiGenerationRuntimeBridgeExecutionSummaryDto } from "../contracts/admin-ai-generation-local-contract";
import type {
  AdminAiGenerationResultDto,
  AdminAiGenerationResultHistoryQuery,
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  CreateAdminAiGenerationResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
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

function createAdminSessionService(input: {
  adminPublicId?: string | null;
  adminRoles?: AdminRole[];
  organizationPublicId?: string | null;
}): Pick<SessionService, "getCurrentSession"> {
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
            organizationPublicId: input.organizationPublicId ?? null,
            adminPublicId: input.adminPublicId ?? "admin_public_123",
            adminRoles: input.adminRoles ?? [],
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
  return new Request(
    `http://localhost/api/v1/${workspace}-ai-generation-requests`,
    {
      body: JSON.stringify(body),
      headers: {
        authorization: "Bearer synthetic-admin-session",
        "content-type": "application/json",
      },
      method: "POST",
    },
  );
}

function createGetRequest(workspace: AdminAiGenerationWorkspace): Request {
  return new Request(
    `http://localhost/api/v1/${workspace}-ai-generation-requests`,
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
  organizationPublicId?: string | null;
  body: Record<string, unknown>;
  requestPublicId?: string;
  requestedAt?: Date;
  runtimeBridgeControl?: {
    createProviderDisabledOutcome: () => {
      blockedReasons: string[];
      executionSummary: typeof providerDisabledExecutionSummary;
    };
  };
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

async function getLocalContractHistory(input: {
  workspace: AdminAiGenerationWorkspace;
  adminRoles: AdminRole[];
  organizationPublicId?: string | null;
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

  return getHandler(createGetRequest(input.workspace));
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
      : "org_auth_local_contract_organization_public_123",
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
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
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
            resultPublicId:
              "admin_ai_generation_result_content_question_admin_public_123",
            contentVisibility: "summary_only",
            redactionStatus: "redacted",
            evidenceStatus: "none",
            citationCount: 0,
          },
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_blocked",
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          costCalibrationExecuted: false,
          executionSummary: providerDisabledExecutionSummary,
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
        taskPersistence: {
          persistenceStatus: "created",
          requestPublicId: "admin_ai_generation_request_public_route_test",
          taskPublicId:
            "admin_ai_generation_task_content_question_admin_public_123",
          status: "succeeded",
          resultPublicId:
            "admin_ai_generation_result_content_question_admin_public_123",
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          redactionStatus: "redacted",
        },
        generatedResult: {
          persistenceStatus: "created",
          resultPublicId:
            "admin_ai_generation_result_content_question_admin_public_123",
          contentVisibility: "redacted_snapshot",
          evidenceStatus: "none",
          citationCount: 0,
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
  });

  it("persists content admin local contracts through the injected task persistence repository", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder();
    const response = await postLocalContractRequest({
      workspace: "content",
      adminRoles: ["content_admin"],
      requestPublicId: "admin_ai_generation_request_public_content_route_123",
      requestedAt: new Date("2026-06-26T20:10:00.000Z"),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
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
          bridgeStatus: "provider_call_blocked",
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
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
          taskPublicId:
            "admin_ai_generation_task_content_question_admin_public_123",
          status: "succeeded",
          resultPublicId:
            "admin_ai_generation_result_content_question_admin_public_123",
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_F");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("persists content admin provider-disabled generated result summaries after task persistence", async () => {
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

    expect(taskPersistenceRecorder.calls).toHaveLength(1);
    expect(generatedResultPersistenceRecorder.calls).toHaveLength(1);
    expect(generatedResultPersistenceRecorder.calls[0]).toMatchObject({
      resultPublicId:
        "admin_ai_generation_result_content_question_admin_public_123",
      taskPublicId:
        "admin_ai_generation_task_content_question_admin_public_123",
      workspace: "content",
      generationKind: "question",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
      taskType: "ai_question_generation",
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
    });
    expect(generatedResultPersistenceRecorder.calls[0].contentDigest).toMatch(
      /^sha256:/u,
    );
    expect(
      generatedResultPersistenceRecorder.calls[0].contentPreviewMasked,
    ).toBe("redacted admin AI generation local contract summary");
    expect(
      JSON.stringify(
        generatedResultPersistenceRecorder.calls[0].contentRedactedSnapshot,
      ),
    ).not.toContain("OMITTED_FIXTURE_I");
    expect(payload).toMatchObject({
      code: 0,
      data: {
        resultState: {
          status: "succeeded",
          resultPublicId:
            "admin_ai_generation_result_content_question_admin_public_123",
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
          redactionStatus: "redacted",
        },
        taskPersistence: {
          status: "succeeded",
          resultPublicId:
            "admin_ai_generation_result_content_question_admin_public_123",
          evidenceStatus: "none",
          citationCount: 0,
          redactionStatus: "redacted",
        },
        generatedResult: {
          persistenceStatus: "created",
          resultPublicId:
            "admin_ai_generation_result_content_question_admin_public_123",
          contentVisibility: "redacted_snapshot",
          evidenceStatus: "none",
          citationCount: 0,
          formalAdoptionStatus: "blocked",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_I");
    expect(serializedPayload).not.toContain("rawPrompt");
    expect(serializedPayload).not.toContain("rawOutput");
    expect(serializedPayload).not.toContain("providerPayload");
    expect(serializedPayload).not.toMatch(/"id":/);
  });

  it("returns reused persistence summaries for organization advanced admin requests", async () => {
    const taskPersistenceRecorder = createTaskPersistenceRecorder({
      persistenceStatus: "reused",
    });
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
      requestPublicId: "admin_ai_generation_request_public_org_route_123",
      taskPersistenceRepository: taskPersistenceRecorder.repository,
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
          taskPublicId:
            "admin_ai_generation_task_organization_paper_admin_public_123",
          status: "succeeded",
          resultPublicId:
            "admin_ai_generation_result_organization_paper_admin_public_123",
          redactionStatus: "redacted",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("OMITTED_FIXTURE_G");
  });

  it("persists organization advanced admin provider-disabled generated result summaries", async () => {
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
      body: {
        generationKind: "paper",
        clientOnlyFixtureJ: "OMITTED_FIXTURE_J",
      },
    });
    const payload = await response.json();

    expect(generatedResultPersistenceRecorder.calls).toHaveLength(1);
    expect(generatedResultPersistenceRecorder.calls[0]).toMatchObject({
      resultPublicId:
        "admin_ai_generation_result_organization_paper_admin_public_123",
      taskPublicId:
        "admin_ai_generation_task_organization_paper_admin_public_123",
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
          resultPublicId:
            "admin_ai_generation_result_organization_paper_admin_public_123",
        },
        generatedResult: {
          persistenceStatus: "reused",
          resultPublicId:
            "admin_ai_generation_result_organization_paper_admin_public_123",
          formalAdoptionStatus: "blocked",
        },
        runtimeBridge: {
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          costCalibrationExecuted: false,
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("OMITTED_FIXTURE_J");
  });

  it("accepts organization advanced admin AI paper requests as organization-owned local contracts", async () => {
    const response = await postLocalContractRequest({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_123",
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
            resultPublicId:
              "admin_ai_generation_result_organization_paper_admin_public_123",
            contentVisibility: "summary_only",
          },
        },
        resultState: {
          status: "succeeded",
          resultPublicId:
            "admin_ai_generation_result_organization_paper_admin_public_123",
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
        },
        runtimeBridge: {
          bridgeStatus: "provider_call_blocked",
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          costCalibrationExecuted: false,
          executionSummary: providerDisabledExecutionSummary,
        },
      },
    });
    expect(serializedPayload).not.toContain("OMITTED_FIXTURE_D");
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
      code: 0,
      data: {
        runtimeBridge: {
          providerCallExecuted: false,
          envSecretAccessed: false,
          providerConfigurationRead: false,
          costCalibrationExecuted: false,
          blockedReasons: [
            "provider_call_blocked",
            "admin_runtime_bridge_control_injected",
          ],
          executionSummary: {
            ...providerDisabledExecutionSummary,
            durationMs: 12,
          },
        },
        formalContentBoundary: {
          questionWriteStatus: "blocked_without_follow_up_task",
          paperWriteStatus: "blocked_without_follow_up_task",
        },
      },
    });
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
      taskPersistenceRepository: taskPersistenceRecorder.repository,
    });
    const payload = await response.json();
    const serializedPayload = JSON.stringify(payload);

    expect(taskPersistenceRecorder.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        limit: 10,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
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
        limit: 10,
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
        limit: 10,
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        workspace: "organization",
        latestTask: {
          taskPublicId,
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
