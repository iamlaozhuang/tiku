import { describe, expect, it } from "vitest";

import type {
  AdminAiGenerationTaskPersistenceGateway,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
  AdminAiGenerationTaskPersistenceRow,
  CreateAdminAiGenerationTaskPersistenceInput,
  CreateOrReuseAdminAiGenerationTaskInput,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type { AdminAiGenerationLocalContractDto } from "../contracts/admin-ai-generation-local-contract";
import type { AdminRole } from "../models/auth";
import {
  ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
  createAdminAiGenerationTaskPersistenceRepository,
} from "./admin-ai-generation-task-persistence-repository";
import {
  createAdminAiGenerationLocalContractRouteHandlers,
  type AdminAiGenerationWorkspace,
} from "../services/admin-ai-generation-local-contract-route";
import type { SessionService } from "../services/session-service";

function createAdminSessionService(input: {
  adminRoles: AdminRole[];
  organizationPublicId?: string | null;
}): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          user: {
            publicId: "admin_user_public_901",
            phone: "13800000000",
            name: "local admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: input.organizationPublicId ?? null,
            adminPublicId: "admin_public_901",
            adminRoles: input.adminRoles,
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

async function createAcceptedLocalContract(input: {
  workspace: AdminAiGenerationWorkspace;
  adminRoles: AdminRole[];
  organizationPublicId?: string | null;
  generationKind: "question" | "paper";
}): Promise<AdminAiGenerationLocalContractDto> {
  const { collection } = createAdminAiGenerationLocalContractRouteHandlers(
    input.workspace,
    {
      sessionService: createAdminSessionService({
        adminRoles: input.adminRoles,
        organizationPublicId: input.organizationPublicId,
      }),
      taskPersistenceRepository:
        createLocalContractRouteTaskPersistenceRepository(),
    },
  );

  const response = await collection.POST(
    createPostRequest(input.workspace, {
      generationKind: input.generationKind,
      clientOnlyFixtureA: "OMITTED_CLIENT_FIXTURE_A",
      clientOnlyFixtureB: "OMITTED_CLIENT_FIXTURE_B",
      clientOnlyFixtureC: "OMITTED_CLIENT_FIXTURE_C",
    }),
  );
  const payload = (await response.json()) as {
    code: number;
    data: AdminAiGenerationLocalContractDto | null;
  };

  expect(payload.code).toBe(0);
  expect(payload.data).not.toBeNull();

  return payload.data as AdminAiGenerationLocalContractDto;
}

function createLocalContractRouteTaskPersistenceResult(
  input: CreateOrReuseAdminAiGenerationTaskInput,
): AdminAiGenerationTaskPersistenceResult {
  const taskRequest = input.localContract.taskRequest;

  return {
    persistenceStatus: "created",
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

function createLocalContractRouteTaskPersistenceRepository(): AdminAiGenerationTaskPersistenceRepository {
  return {
    async createOrReuseTask(input) {
      return createLocalContractRouteTaskPersistenceResult(input);
    },
  };
}

function createPersistenceRow(
  overrides: Partial<AdminAiGenerationTaskPersistenceRow> = {},
): AdminAiGenerationTaskPersistenceRow {
  return {
    public_id: "admin_ai_generation_task_content_question_admin_public_901",
    request_public_id: "admin_ai_generation_request_public_901",
    task_type: "ai_question_generation",
    workspace: "content",
    generation_kind: "question",
    task_status: "pending",
    requested_at: new Date("2026-06-26T19:00:00.000Z"),
    authorization_source: "admin_role",
    authorization_public_id: "admin_role_content_ai_generation",
    actor_public_id: "admin_public_901",
    owner_type: "platform",
    owner_public_id: "platform_content_review_pool",
    organization_public_id: null,
    quota_owner_type: "platform",
    quota_owner_public_id: "platform_content_review_pool",
    idempotency_key_hash: "sha256:content_question_admin_public_901",
    result_public_id: null,
    content_visibility: "summary_only",
    evidence_status: "none",
    citation_count: 0,
    ai_call_log_public_id: null,
    runtime_status: "local_contract_only",
    runtime_bridge_status: "provider_call_blocked",
    provider_call_executed: false,
    env_secret_accessed: false,
    provider_configuration_read: false,
    cost_calibration_executed: false,
    question_write_status: "blocked_without_follow_up_task",
    paper_write_status: "blocked_without_follow_up_task",
    source_question_public_id: null,
    source_paper_public_id: null,
    redaction_status: "redacted",
    ...overrides,
  };
}

function createGateway(
  rows: AdminAiGenerationTaskPersistenceRow[] = [],
): AdminAiGenerationTaskPersistenceGateway & {
  idempotencyQueries: Array<{
    ownerType: string;
    ownerPublicId: string;
    idempotencyKeyHash: string;
    taskTypes: readonly string[];
  }>;
  insertInputs: CreateAdminAiGenerationTaskPersistenceInput[];
} {
  const idempotencyQueries: Array<{
    ownerType: string;
    ownerPublicId: string;
    idempotencyKeyHash: string;
    taskTypes: readonly string[];
  }> = [];
  const insertInputs: CreateAdminAiGenerationTaskPersistenceInput[] = [];

  return {
    idempotencyQueries,
    insertInputs,
    async findTaskByIdempotencyKey(query) {
      idempotencyQueries.push(query);

      return (
        rows.find(
          (row) =>
            row.owner_type === query.ownerType &&
            row.owner_public_id === query.ownerPublicId &&
            row.idempotency_key_hash === query.idempotencyKeyHash &&
            query.taskTypes.includes(row.task_type),
        ) ?? null
      );
    },
    async insertPendingTask(input) {
      insertInputs.push(input);

      const row = createPersistenceRow({
        public_id: input.taskPublicId,
        request_public_id: input.requestPublicId,
        task_type: input.taskType,
        workspace: input.workspace,
        generation_kind: input.generationKind,
        task_status: input.taskStatus,
        requested_at: input.requestedAt,
        authorization_source: input.authorizationSource,
        authorization_public_id: input.authorizationPublicId,
        actor_public_id: input.actorPublicId,
        owner_type: input.ownerType,
        owner_public_id: input.ownerPublicId,
        organization_public_id: input.organizationPublicId,
        quota_owner_type: input.quotaOwnerType,
        quota_owner_public_id: input.quotaOwnerPublicId,
        idempotency_key_hash: input.idempotencyKeyHash,
        result_public_id: input.resultPublicId,
        content_visibility: input.contentVisibility,
        evidence_status: input.evidenceStatus,
        citation_count: input.citationCount,
        ai_call_log_public_id: input.aiCallLogPublicId,
        runtime_status: input.runtimeStatus,
        runtime_bridge_status: input.runtimeBridgeStatus,
        provider_call_executed: input.providerCallExecuted,
        env_secret_accessed: input.envSecretAccessed,
        provider_configuration_read: input.providerConfigurationRead,
        cost_calibration_executed: input.costCalibrationExecuted,
        question_write_status: input.questionWriteStatus,
        paper_write_status: input.paperWriteStatus,
        source_question_public_id: input.sourceQuestionPublicId,
        source_paper_public_id: input.sourcePaperPublicId,
      });

      rows.push(row);

      return row;
    },
  };
}

describe("admin AI generation task persistence repository", () => {
  it("creates a platform-owned pending task input for content admin AI question local contracts", async () => {
    const localContract = await createAcceptedLocalContract({
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "question",
    });
    const gateway = createGateway();
    const repository =
      createAdminAiGenerationTaskPersistenceRepository(gateway);

    const result = await repository.createOrReuseTask({
      localContract,
      requestPublicId: "admin_ai_generation_request_public_content_901",
      requestedAt: new Date("2026-06-26T19:00:00.000Z"),
    });

    expect(gateway.idempotencyQueries).toEqual([
      {
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        idempotencyKeyHash: "sha256:content_question_admin_public_901",
        taskTypes: ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
      },
    ]);
    expect(gateway.insertInputs).toHaveLength(1);
    expect(gateway.insertInputs[0]).toMatchObject({
      requestPublicId: "admin_ai_generation_request_public_content_901",
      taskPublicId:
        "admin_ai_generation_task_content_question_admin_public_901",
      taskType: "ai_question_generation",
      workspace: "content",
      generationKind: "question",
      taskStatus: "pending",
      authorizationSource: "admin_role",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
      quotaOwnerType: "platform",
      quotaOwnerPublicId: "platform_content_review_pool",
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
      questionWriteStatus: "blocked_without_follow_up_task",
      paperWriteStatus: "blocked_without_follow_up_task",
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
      redactionStatus: "redacted",
    });
    expect(result).toMatchObject({
      persistenceStatus: "created",
      task: {
        requestPublicId: "admin_ai_generation_request_public_content_901",
        taskPublicId:
          "admin_ai_generation_task_content_question_admin_public_901",
        status: "pending",
        workspace: "content",
        generationKind: "question",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        resultPublicId: null,
        evidenceStatus: "none",
        citationCount: 0,
        redactionStatus: "redacted",
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/);
    expect(JSON.stringify(gateway.insertInputs[0])).not.toContain(
      "OMITTED_CLIENT_FIXTURE_A",
    );
    expect(JSON.stringify(gateway.insertInputs[0])).not.toContain(
      "OMITTED_CLIENT_FIXTURE_B",
    );
    expect(JSON.stringify(gateway.insertInputs[0])).not.toContain(
      "OMITTED_CLIENT_FIXTURE_C",
    );
  });

  it("creates an organization-owned pending task input for advanced organization admin AI paper local contracts", async () => {
    const localContract = await createAcceptedLocalContract({
      workspace: "organization",
      adminRoles: ["org_advanced_admin"],
      organizationPublicId: "organization_public_901",
      generationKind: "paper",
    });
    const gateway = createGateway();
    const repository =
      createAdminAiGenerationTaskPersistenceRepository(gateway);

    const result = await repository.createOrReuseTask({
      localContract,
      requestPublicId: "admin_ai_generation_request_public_org_901",
      requestedAt: new Date("2026-06-26T19:05:00.000Z"),
    });

    expect(gateway.insertInputs[0]).toMatchObject({
      taskPublicId:
        "admin_ai_generation_task_organization_paper_admin_public_901",
      taskType: "ai_paper_generation",
      workspace: "organization",
      generationKind: "paper",
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_local_contract_organization_public_901",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      organizationPublicId: "organization_public_901",
      quotaOwnerType: "organization",
      quotaOwnerPublicId: "organization_public_901",
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
    });
    expect(result.task).toMatchObject({
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      organizationPublicId: "organization_public_901",
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/);
  });

  it("reuses an existing admin generation task by owner and idempotency key", async () => {
    const localContract = await createAcceptedLocalContract({
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "question",
    });
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "admin_ai_generation_task_existing_901",
        request_public_id: "admin_ai_generation_request_existing_901",
        idempotency_key_hash: "sha256:content_question_admin_public_901",
      }),
    ]);
    const repository =
      createAdminAiGenerationTaskPersistenceRepository(gateway);

    const result = await repository.createOrReuseTask({
      localContract,
      requestPublicId: "admin_ai_generation_request_new_901",
      requestedAt: new Date("2026-06-26T19:10:00.000Z"),
    });

    expect(result).toMatchObject({
      persistenceStatus: "reused",
      task: {
        requestPublicId: "admin_ai_generation_request_existing_901",
        taskPublicId: "admin_ai_generation_task_existing_901",
        status: "pending",
      },
    });
    expect(gateway.insertInputs).toEqual([]);
  });

  it("rejects unsafe local contracts before gateway insertion", async () => {
    const localContract = await createAcceptedLocalContract({
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "paper",
    });
    const gateway = createGateway();
    const repository =
      createAdminAiGenerationTaskPersistenceRepository(gateway);
    const unsafeProviderContract = {
      ...localContract,
      runtimeBridge: {
        ...localContract.runtimeBridge,
        providerCallExecuted: true,
      },
    } as unknown as AdminAiGenerationLocalContractDto;
    const unsafeFormalWriteContract = {
      ...localContract,
      formalContentBoundary: {
        ...localContract.formalContentBoundary,
        questionWriteStatus: "created",
      },
    } as unknown as AdminAiGenerationLocalContractDto;

    await expect(
      repository.createOrReuseTask({
        localContract: unsafeProviderContract,
        requestPublicId: "admin_ai_generation_request_unsafe_provider_901",
        requestedAt: new Date("2026-06-26T19:15:00.000Z"),
      }),
    ).rejects.toThrow("unsafe admin AI generation task persistence boundary");
    await expect(
      repository.createOrReuseTask({
        localContract: unsafeFormalWriteContract,
        requestPublicId: "admin_ai_generation_request_unsafe_formal_901",
        requestedAt: new Date("2026-06-26T19:16:00.000Z"),
      }),
    ).rejects.toThrow("unsafe admin AI generation task persistence boundary");
    expect(gateway.insertInputs).toEqual([]);
  });
});
