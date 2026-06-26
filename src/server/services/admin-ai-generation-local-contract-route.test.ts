import { describe, expect, it } from "vitest";

import {
  createAdminAiGenerationLocalContractRouteHandlers,
  type AdminAiGenerationWorkspace,
} from "./admin-ai-generation-local-contract-route";
import type { AdminAiGenerationRuntimeBridgeExecutionSummaryDto } from "../contracts/admin-ai-generation-local-contract";
import type {
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
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
  taskPersistenceRepository?: AdminAiGenerationTaskPersistenceRepository;
}) {
  const taskPersistence =
    input.taskPersistenceRepository ??
    createTaskPersistenceRecorder().repository;
  const routeOptions = {
    sessionService: createAdminSessionService({
      adminRoles: input.adminRoles,
      organizationPublicId: input.organizationPublicId,
    }),
    taskPersistenceRepository: taskPersistence,
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

function createTaskPersistenceRecorder(
  input: {
    persistenceStatus?: AdminAiGenerationTaskPersistenceResult["persistenceStatus"];
  } = {},
): {
  calls: CreateOrReuseAdminAiGenerationTaskInput[];
  repository: AdminAiGenerationTaskPersistenceRepository;
} {
  const calls: CreateOrReuseAdminAiGenerationTaskInput[] = [];

  return {
    calls,
    repository: {
      async createOrReuseTask(createInput) {
        calls.push(createInput);

        return createTaskPersistenceResult(
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
            resultPublicId: null,
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
          status: "pending",
          resultPublicId: null,
          contentVisibility: "summary_only",
          evidenceStatus: "none",
          citationCount: 0,
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
          status: "pending",
          resultPublicId: null,
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
          status: "pending",
          redactionStatus: "redacted",
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain("OMITTED_FIXTURE_G");
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
            contentVisibility: "summary_only",
          },
        },
        resultState: {
          status: "pending",
          resultPublicId: null,
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
});
