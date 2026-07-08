import { describe, expect, it } from "vitest";

import type {
  AdminAiGenerationResultPersistenceRepository,
  AdminAiGenerationResultPersistenceResult,
  CreateAdminAiGenerationResultInput,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import type {
  AdminAiGenerationTaskHistoryQuery,
  AdminAiGenerationTaskPersistenceGateway,
  AdminAiGenerationTaskPersistenceRepository,
  AdminAiGenerationTaskPersistenceResult,
  AdminAiGenerationTaskPersistenceRow,
  CreateAdminAiGenerationTaskPersistenceInput,
  CreateOrReuseAdminAiGenerationTaskInput,
} from "../contracts/admin-ai-generation-task-persistence-contract";
import type {
  AdminAiGenerationLocalContractBaseDto,
  AdminAiGenerationLocalContractDto,
} from "../contracts/admin-ai-generation-local-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import type {
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingContext,
} from "../contracts/route-integrated-provider-execution-contract";
import type { AdminRole } from "../models/auth";
import {
  ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
  createAdminAiGenerationTaskPersistenceRepository,
} from "./admin-ai-generation-task-persistence-repository";
import {
  createAdminAiGenerationLocalContractRouteHandlers,
  type AdminAiGenerationRuntimeBridgeControl,
  type AdminAiGenerationWorkspace,
} from "../services/admin-ai-generation-local-contract-route";
import type { SessionService } from "../services/session-service";

const defaultAdminGenerationParameters: AiGenerationRouteIntegratedGenerationParameters =
  {
    profession: "marketing",
    level: 3,
    subject: "theory",
    knowledgeNode: "卷烟营销基础",
    knowledgeNodeMode: "balanced",
    knowledgeNodePublicIds: [],
    includeDescendants: false,
    knowledgeNodeSupplement: "卷烟营销基础",
    sourcePreference: null,
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

function createRepositoryTestProviderRuntimeBridgeControl(): AdminAiGenerationRuntimeBridgeControl {
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
      resolveGroundingContext: () => sufficientAdminGroundingContext,
      executeProviderRequest: async (providerInput) => ({
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
          content: createStructuredAdminProviderContent(
            providerInput.requestContext.generationKind,
          ),
          contentVisibility: "transient_response_only",
          persistenceStatus: "not_persisted",
          safetyStatus: "checked",
        },
      }),
    },
  };
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
        ? "org_auth_public_901"
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
  adminRoles: AdminRole[];
  organizationPublicId?: string | null;
}): Pick<SessionService, "getCurrentSession"> {
  const organizationPublicId = input.organizationPublicId ?? null;
  const adminWorkspaceCapability = createDefaultAdminWorkspaceCapability({
    adminRoles: input.adminRoles,
    organizationPublicId,
  });

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
            organizationPublicId,
            adminPublicId: "admin_public_901",
            adminRoles: input.adminRoles,
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
}): Promise<AdminAiGenerationLocalContractBaseDto> {
  const taskPersistenceRecorder =
    createLocalContractRouteTaskPersistenceRecorder();
  const { collection } = createAdminAiGenerationLocalContractRouteHandlers(
    input.workspace,
    {
      sessionService: createAdminSessionService({
        adminRoles: input.adminRoles,
        organizationPublicId: input.organizationPublicId,
      }),
      runtimeBridgeControl: createRepositoryTestProviderRuntimeBridgeControl(),
      taskPersistenceRepository: taskPersistenceRecorder.repository,
      resultPersistenceRepository:
        createLocalContractRouteResultPersistenceRepository(),
    },
  );

  const response = await collection.POST(
    createPostRequest(input.workspace, {
      generationKind: input.generationKind,
      generationParameters: {
        ...defaultAdminGenerationParameters,
        questionCount: input.generationKind === "question" ? 10 : 50,
      },
      requestedRuntimeMode: "route_integrated_provider",
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
  expect(taskPersistenceRecorder.calls).toHaveLength(1);

  return taskPersistenceRecorder.calls[0].localContract;
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
      runtimeBridgeStatus: "provider_call_succeeded",
      providerCallExecuted: true,
      envSecretAccessed: true,
      providerConfigurationRead: true,
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

function createLocalContractRouteResultPersistenceResult(
  input: CreateAdminAiGenerationResultInput,
): AdminAiGenerationResultPersistenceResult {
  return {
    persistenceStatus: "created",
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
        reviewedDraft: null,
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

function createLocalContractRouteResultPersistenceRepository(): AdminAiGenerationResultPersistenceRepository {
  return {
    async createOrReuseDraftResult(input) {
      return createLocalContractRouteResultPersistenceResult(input);
    },
    async listDraftResults() {
      return [];
    },
  };
}

function createLocalContractRouteTaskPersistenceRecorder(): {
  calls: CreateOrReuseAdminAiGenerationTaskInput[];
  repository: AdminAiGenerationTaskPersistenceRepository;
} {
  const calls: CreateOrReuseAdminAiGenerationTaskInput[] = [];

  return {
    calls,
    repository: {
      async createOrReuseTask(input) {
        calls.push(input);

        return createLocalContractRouteTaskPersistenceResult(input);
      },
      async listTaskHistory() {
        return [];
      },
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
  historyQueries: AdminAiGenerationTaskHistoryQuery[];
} {
  const idempotencyQueries: Array<{
    ownerType: string;
    ownerPublicId: string;
    idempotencyKeyHash: string;
    taskTypes: readonly string[];
  }> = [];
  const insertInputs: CreateAdminAiGenerationTaskPersistenceInput[] = [];
  const historyQueries: AdminAiGenerationTaskHistoryQuery[] = [];

  return {
    idempotencyQueries,
    insertInputs,
    historyQueries,
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
    async listTaskHistory(query) {
      historyQueries.push(query);

      return rows
        .filter(
          (row) =>
            row.workspace === query.workspace &&
            row.owner_type === query.ownerType &&
            row.owner_public_id === query.ownerPublicId &&
            row.generation_kind === query.generationKind &&
            ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES.includes(row.task_type),
        )
        .sort(
          (leftRow, rightRow) =>
            rightRow.requested_at.getTime() - leftRow.requested_at.getTime(),
        )
        .slice(query.offset, query.offset + query.limit);
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
        idempotencyKeyHash: localContract.taskRequest.idempotency.keyHash,
        taskTypes: ADMIN_AI_GENERATION_PERSISTENCE_TASK_TYPES,
      },
    ]);
    expect(gateway.insertInputs).toHaveLength(1);
    expect(gateway.insertInputs[0]).toMatchObject({
      requestPublicId: "admin_ai_generation_request_public_content_901",
      taskPublicId: localContract.taskRequest.taskPublicId,
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
      runtimeBridgeStatus: "provider_call_succeeded",
      providerCallExecuted: true,
      envSecretAccessed: true,
      providerConfigurationRead: true,
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
        taskPublicId: localContract.taskRequest.taskPublicId,
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
      taskPublicId: localContract.taskRequest.taskPublicId,
      taskType: "ai_paper_generation",
      workspace: "organization",
      generationKind: "paper",
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_public_901",
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

  it("persists only safe Provider status metadata for provider-enabled local contracts", async () => {
    const visibleProviderContent = "后台草稿正文只允许留在响应中";
    const localContract = await createAcceptedLocalContract({
      workspace: "content",
      adminRoles: ["content_admin"],
      generationKind: "paper",
    });
    const providerEnabledLocalContract = {
      ...localContract,
      runtimeBridge: {
        ...localContract.runtimeBridge,
        bridgeStatus: "provider_call_succeeded",
        providerCallExecuted: true,
        envSecretAccessed: true,
        providerConfigurationRead: true,
        executionSummary: {
          requestCount: 1,
          resultStatus: "pass",
          failureCategory: null,
          durationMs: 42,
          usageSummary: {
            promptTokens: 9,
            completionTokens: 14,
            totalTokens: 23,
          },
          providerErrorSummary: null,
          redactionStatus: "redacted",
        },
        visibleGeneratedContent: {
          content: visibleProviderContent,
          contentVisibility: "transient_response_only",
          persistenceStatus: "not_persisted",
          safetyStatus: "checked",
        },
      },
    } satisfies AdminAiGenerationLocalContractBaseDto;
    const gateway = createGateway();
    const repository =
      createAdminAiGenerationTaskPersistenceRepository(gateway);

    const result = await repository.createOrReuseTask({
      localContract: providerEnabledLocalContract,
      requestPublicId: "admin_ai_generation_request_public_provider_901",
      requestedAt: new Date("2026-06-26T19:07:00.000Z"),
    });

    expect(gateway.insertInputs[0]).toMatchObject({
      runtimeBridgeStatus: "provider_call_succeeded",
      providerCallExecuted: true,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      costCalibrationExecuted: false,
    });
    expect(result.task).toMatchObject({
      runtimeBridgeStatus: "provider_call_succeeded",
      providerCallExecuted: true,
      envSecretAccessed: true,
      providerConfigurationRead: true,
    });
    expect(JSON.stringify(gateway.insertInputs[0])).not.toContain(
      visibleProviderContent,
    );
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
        idempotency_key_hash: localContract.taskRequest.idempotency.keyHash,
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
        providerCallExecuted: false,
      },
    } as unknown as AdminAiGenerationLocalContractDto;
    const unsafeFormalWriteContract = {
      ...localContract,
      formalContentBoundary: {
        ...localContract.formalContentBoundary,
        questionWriteStatus: "created",
      },
    } as unknown as AdminAiGenerationLocalContractDto;
    const unsafeOrganizationOwnedBoundaryContract = {
      ...localContract,
      organizationOwnedDraftBoundary: {
        ...localContract.organizationOwnedDraftBoundary,
        generatedResultScope: "organization_private",
        organizationDraftAdoptionStatus:
          "allowed_as_organization_private_draft",
        organizationTrainingSourceStatus:
          "allowed_as_organization_private_training_source",
        ownerType: "organization",
        organizationPublicId: "organization_public_unsafe",
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
    await expect(
      repository.createOrReuseTask({
        localContract: unsafeOrganizationOwnedBoundaryContract,
        requestPublicId:
          "admin_ai_generation_request_unsafe_organization_boundary_901",
        requestedAt: new Date("2026-06-26T19:17:00.000Z"),
      }),
    ).rejects.toThrow("unsafe admin AI generation task persistence boundary");
    expect(gateway.insertInputs).toEqual([]);
  });

  it("lists metadata-only admin AI generation task history by workspace and owner", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "admin_ai_generation_task_old_content_901",
        request_public_id: "admin_ai_generation_request_old_content_901",
        generation_kind: "paper",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-26T19:00:00.000Z"),
      }),
      createPersistenceRow({
        public_id: "admin_ai_generation_task_new_content_901",
        request_public_id: "admin_ai_generation_request_new_content_901",
        generation_kind: "paper",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-26T19:30:00.000Z"),
      }),
      createPersistenceRow({
        public_id: "admin_ai_generation_task_other_org_901",
        request_public_id: "admin_ai_generation_request_other_org_901",
        workspace: "organization",
        owner_type: "organization",
        owner_public_id: "organization_public_901",
        organization_public_id: "organization_public_901",
        quota_owner_type: "organization",
        quota_owner_public_id: "organization_public_901",
        requested_at: new Date("2026-06-26T19:45:00.000Z"),
      }),
    ]);
    const repository =
      createAdminAiGenerationTaskPersistenceRepository(gateway);
    const listTaskHistory = (
      repository as AdminAiGenerationTaskPersistenceRepository & {
        listTaskHistory: (
          query: AdminAiGenerationTaskHistoryQuery,
        ) => Promise<AdminAiGenerationTaskPersistenceResult["task"][]>;
      }
    ).listTaskHistory;

    const result = await listTaskHistory({
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      generationKind: "paper",
      page: 1,
      pageSize: 2,
      limit: 2,
      offset: 0,
    });

    expect(gateway.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "paper",
        page: 1,
        pageSize: 2,
        limit: 2,
        offset: 0,
      },
    ]);
    expect(result).toMatchObject([
      {
        taskPublicId: "admin_ai_generation_task_new_content_901",
        requestPublicId: "admin_ai_generation_request_new_content_901",
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
      {
        taskPublicId: "admin_ai_generation_task_old_content_901",
      },
    ]);
    expect(JSON.stringify(result)).not.toMatch(/"id":/);
  });

  it("filters task history by generation kind before applying descending pagination", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "admin_ai_generation_task_question_newer",
        request_public_id: "admin_ai_generation_request_question_newer",
        generation_kind: "question",
        task_type: "ai_question_generation",
        requested_at: new Date("2026-06-26T22:00:00.000Z"),
      }),
      createPersistenceRow({
        public_id: "admin_ai_generation_task_paper_newer",
        request_public_id: "admin_ai_generation_request_paper_newer",
        generation_kind: "paper",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-26T21:00:00.000Z"),
      }),
      createPersistenceRow({
        public_id: "admin_ai_generation_task_paper_older",
        request_public_id: "admin_ai_generation_request_paper_older",
        generation_kind: "paper",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-26T20:00:00.000Z"),
      }),
    ]);
    const repository =
      createAdminAiGenerationTaskPersistenceRepository(gateway);

    const history = await repository.listTaskHistory({
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      generationKind: "paper",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });

    expect(gateway.historyQueries).toEqual([
      {
        workspace: "content",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        generationKind: "paper",
        page: 1,
        pageSize: 1,
        limit: 1,
        offset: 0,
      },
    ]);
    expect(history.map((row) => row.taskPublicId)).toEqual([
      "admin_ai_generation_task_paper_newer",
    ]);
  });
});
