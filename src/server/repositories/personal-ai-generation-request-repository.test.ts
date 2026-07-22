import { describe, expect, it } from "vitest";

import type {
  PersonalAiGenerationRequestPersistenceRow,
  PersonalAiGenerationRequestTaskGateway,
} from "./personal-ai-generation-request-repository";
import {
  PERSONAL_AI_GENERATION_TASK_TYPES,
  PersonalAiGenerationSnapshotConflictError,
  createPersonalAiGenerationSnapshotEnvelope,
  createPersonalAiGenerationRequestHistoryCondition,
  createPersonalAiGenerationRequestIdempotencyCondition,
  createPersonalAiGenerationRequestRepository,
} from "./personal-ai-generation-request-repository";

type RequestHistoryPersistenceRow =
  PersonalAiGenerationRequestPersistenceRow & {
    authorization_public_id: string;
  };

function containsText(value: unknown, text: string, seen = new Set()): boolean {
  if (typeof value === "string") {
    return value.includes(text);
  }

  if (typeof value !== "object" || value === null || seen.has(value)) {
    return false;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => containsText(item, text, seen));
  }

  return Object.values(value).some((item) => containsText(item, text, seen));
}

function createPersistenceRow(
  overrides: Partial<RequestHistoryPersistenceRow> = {},
): RequestHistoryPersistenceRow {
  return {
    public_id: "ai_generation_task_public_301",
    request_public_id: "personal_ai_request_public_301",
    task_type: "ai_question_generation",
    task_status: "pending",
    requested_at: new Date("2026-06-12T10:00:00.000Z"),
    result_public_id: null,
    evidence_status: "none",
    citation_count: 0,
    ai_call_log_public_id: null,
    generation_snapshot_version: null,
    generation_input_snapshot: null,
    generation_constraint_snapshot: null,
    generation_snapshot_digest: null,
    owner_public_id: "student_public_301",
    actor_public_id: "student_public_301",
    authorization_public_id: "personal_auth_public_301",
    ...overrides,
  };
}

function createGenerationParameters(questionCount = 3) {
  return {
    profession: "marketing" as const,
    level: 3 as const,
    subject: "theory" as const,
    knowledgeNode: null,
    knowledgeNodeMode: "balanced" as const,
    knowledgeNodePublicIds: [],
    includeDescendants: false,
    knowledgeNodeSupplement: null,
    sourcePreference: null,
    questionType: "single_choice",
    questionCount,
    difficulty: "medium",
    learningObjective: null,
  };
}

function createGateway(
  rows: RequestHistoryPersistenceRow[],
): PersonalAiGenerationRequestTaskGateway & {
  listQueries: Array<{
    authorizationPublicId: string;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: string;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  }>;
  countQueries: Array<{
    authorizationPublicId: string;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: string;
  }>;
  idempotencyQueries: Array<{
    ownerPublicId: string;
    actorPublicId?: string;
    idempotencyKeyHash: string;
  }>;
  insertInputs: unknown[];
} {
  const listQueries: Array<{
    authorizationPublicId: string;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: string;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  }> = [];
  const countQueries: Array<{
    authorizationPublicId: string;
    ownerPublicId: string;
    actorPublicId?: string;
    taskType?: string;
  }> = [];
  const idempotencyQueries: Array<{
    ownerPublicId: string;
    actorPublicId?: string;
    idempotencyKeyHash: string;
  }> = [];
  const insertInputs: unknown[] = [];

  return {
    listQueries,
    countQueries,
    idempotencyQueries,
    insertInputs,
    async listRequestRows(query) {
      listQueries.push(query);

      return rows
        .filter(
          (row) =>
            row.authorization_public_id === query.authorizationPublicId &&
            row.owner_public_id === query.ownerPublicId &&
            (query.actorPublicId === undefined ||
              row.actor_public_id === query.actorPublicId) &&
            (query.taskType === undefined || row.task_type === query.taskType),
        )
        .sort(
          (leftRow, rightRow) =>
            rightRow.requested_at.getTime() - leftRow.requested_at.getTime() ||
            leftRow.request_public_id.localeCompare(rightRow.request_public_id),
        )
        .slice(query.offset, query.offset + query.limit);
    },
    async countRequestRows(query) {
      countQueries.push(query);

      return rows.filter(
        (row) =>
          row.authorization_public_id === query.authorizationPublicId &&
          row.owner_public_id === query.ownerPublicId &&
          (query.actorPublicId === undefined ||
            row.actor_public_id === query.actorPublicId) &&
          (query.taskType === undefined || row.task_type === query.taskType),
      ).length;
    },
    async findRequestByIdempotencyKey(query) {
      idempotencyQueries.push(query);

      return (
        rows.find(
          (row) =>
            row.owner_public_id === query.ownerPublicId &&
            (query.actorPublicId === undefined ||
              row.actor_public_id === query.actorPublicId) &&
            row.idempotency_key_hash === query.idempotencyKeyHash,
        ) ?? null
      );
    },
    async insertPendingRequest(input) {
      insertInputs.push(input);
      const snapshotEnvelope =
        createPersonalAiGenerationSnapshotEnvelope(input);

      return createPersistenceRow({
        public_id: input.taskPublicId,
        request_public_id: input.requestPublicId,
        task_type: input.taskType,
        task_status: "pending",
        requested_at: input.requestedAt,
        idempotency_key_hash: input.idempotencyKeyHash,
        owner_public_id: input.ownerPublicId,
        actor_public_id: input.actorPublicId,
        generation_snapshot_version: snapshotEnvelope.generationSnapshotVersion,
        generation_input_snapshot: snapshotEnvelope.generationInputSnapshot,
        generation_constraint_snapshot:
          snapshotEnvelope.generationConstraintSnapshot,
        generation_snapshot_digest: snapshotEnvelope.generationSnapshotDigest,
      });
    },
  };
}

describe("personal AI generation request repository", () => {
  it("canonicalizes equivalent generation input and binds task and authorization constraints into the digest", () => {
    const createEnvelope = (overrides: Record<string, unknown> = {}) =>
      createPersonalAiGenerationSnapshotEnvelope({
        taskType: "ai_question_generation",
        generationParameters: {
          profession: "marketing",
          level: 3,
          subject: "theory",
          knowledgeNode: null,
          knowledgeNodeMode: "selected",
          knowledgeNodePublicIds: [
            "knowledge_node_public_b",
            "knowledge_node_public_a",
          ],
          includeDescendants: true,
          knowledgeNodeSupplement: null,
          sourcePreference: "prefer_platform",
          questionType: "single_choice",
          questionCount: 3,
          difficulty: "medium",
          learningObjective: "practice",
        },
        authorizationSource: "personal_auth",
        authorizationPublicId: "personal_auth_public_160",
        ownerType: "personal",
        ownerPublicId: "student_public_160",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "student_public_160",
        effectiveEdition: "advanced",
        ...overrides,
      });

    const first = createEnvelope();
    const equivalent = createEnvelope({
      generationParameters: {
        ...first.generationInputSnapshot.generationParameters,
        knowledgeNodePublicIds: [
          "knowledge_node_public_a",
          "knowledge_node_public_b",
        ],
      },
    });

    expect(equivalent).toEqual(first);
    expect(first.generationSnapshotVersion).toBe(1);
    expect(first.generationSnapshotDigest).toMatch(/^sha256:[0-9a-f]{64}$/u);
    expect(
      createEnvelope({ taskType: "ai_paper_generation" })
        .generationSnapshotDigest,
    ).not.toBe(first.generationSnapshotDigest);
    expect(
      createEnvelope({ authorizationPublicId: "personal_auth_public_changed" })
        .generationSnapshotDigest,
    ).not.toBe(first.generationSnapshotDigest);
  });

  it("builds owner-scoped personal request history conditions", () => {
    const condition = createPersonalAiGenerationRequestHistoryCondition({
      authorizationPublicId: "personal_auth_public_301",
      ownerPublicId: "student_public_301",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "authorization_public_id")).toBe(true);
    expect(containsText(condition, "personal_auth_public_301")).toBe(true);
    expect(containsText(condition, "student_public_301")).toBe(true);
    expect(containsText(condition, "ai_question_generation")).toBe(true);
    expect(containsText(condition, "ai_paper_generation")).toBe(true);
    expect(PERSONAL_AI_GENERATION_TASK_TYPES).not.toContain(
      "organization_training_generation",
    );
  });

  it("builds actor-scoped organization request history conditions", () => {
    const condition = createPersonalAiGenerationRequestHistoryCondition({
      authorizationPublicId: "org_auth_public_301",
      ownerType: "organization",
      ownerPublicId: "organization_public_301",
      actorPublicId: "employee_user_public_301",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "authorization_public_id")).toBe(true);
    expect(containsText(condition, "org_auth_public_301")).toBe(true);
    expect(containsText(condition, "organization_public_301")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
    expect(containsText(condition, "employee_user_public_301")).toBe(true);
  });

  it("builds owner-scoped idempotency conditions", () => {
    const condition = createPersonalAiGenerationRequestIdempotencyCondition({
      ownerPublicId: "student_public_302",
      idempotencyKeyHash: "sha256:personal_ai_generation_302",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "student_public_302")).toBe(true);
    expect(containsText(condition, "idempotency_key_hash")).toBe(true);
    expect(containsText(condition, "sha256:personal_ai_generation_302")).toBe(
      true,
    );
  });

  it("builds actor-scoped organization idempotency conditions", () => {
    const condition = createPersonalAiGenerationRequestIdempotencyCondition({
      ownerType: "organization",
      ownerPublicId: "organization_public_302",
      actorPublicId: "employee_user_public_302",
      idempotencyKeyHash: "sha256:personal_ai_generation_302",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_302")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
    expect(containsText(condition, "employee_user_public_302")).toBe(true);
  });

  it("lists session-owned history newest first without exposing internal ids", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "ai_generation_task_public_b",
        request_public_id: "personal_ai_request_public_b",
        requested_at: new Date("2026-06-12T10:00:00.000Z"),
        owner_public_id: "student_public_303",
        authorization_public_id: "personal_auth_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_public_c",
        request_public_id: "personal_ai_request_public_c",
        requested_at: new Date("2026-06-12T11:00:00.000Z"),
        owner_public_id: "student_public_303",
        authorization_public_id: "personal_auth_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_public_a",
        request_public_id: "personal_ai_request_public_a",
        requested_at: new Date("2026-06-12T10:00:00.000Z"),
        owner_public_id: "student_public_303",
        authorization_public_id: "personal_auth_public_303",
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const history = await repository.listRequestHistory({
      authorizationPublicId: "personal_auth_public_303",
      ownerPublicId: "student_public_303",
      limit: 3,
    });

    expect(gateway.listQueries).toEqual([
      {
        authorizationPublicId: "personal_auth_public_303",
        ownerPublicId: "student_public_303",
        page: 1,
        pageSize: 3,
        limit: 3,
        offset: 0,
      },
    ]);
    expect(history.map((row) => row.requestPublicId)).toEqual([
      "personal_ai_request_public_c",
      "personal_ai_request_public_a",
      "personal_ai_request_public_b",
    ]);
    expect(JSON.stringify(history)).not.toMatch(/"id":/);
    expect(JSON.stringify(history)).not.toContain("owner_public_id");
  });

  it("filters same-organization request history by actor public id", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "ai_generation_task_employee_a",
        request_public_id: "personal_ai_request_employee_a",
        owner_public_id: "organization_public_303",
        actor_public_id: "employee_user_public_a",
        authorization_public_id: "org_auth_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_employee_b",
        request_public_id: "personal_ai_request_employee_b",
        owner_public_id: "organization_public_303",
        actor_public_id: "employee_user_public_b",
        authorization_public_id: "org_auth_public_303",
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const history = await repository.listRequestHistory({
      authorizationPublicId: "org_auth_public_303",
      ownerType: "organization",
      ownerPublicId: "organization_public_303",
      actorPublicId: "employee_user_public_a",
      limit: 20,
    });

    expect(gateway.listQueries).toEqual([
      {
        authorizationPublicId: "org_auth_public_303",
        ownerType: "organization",
        ownerPublicId: "organization_public_303",
        actorPublicId: "employee_user_public_a",
        page: 1,
        pageSize: 20,
        limit: 20,
        offset: 0,
      },
    ]);
    expect(history.map((row) => row.requestPublicId)).toEqual([
      "personal_ai_request_employee_a",
    ]);
  });

  it("filters request history by task type before applying descending pagination", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "ai_generation_task_question_newer",
        request_public_id: "personal_ai_request_question_newer",
        task_type: "ai_question_generation",
        requested_at: new Date("2026-06-12T13:00:00.000Z"),
        owner_public_id: "student_public_303",
        authorization_public_id: "personal_auth_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_paper_newer",
        request_public_id: "personal_ai_request_paper_newer",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-12T12:00:00.000Z"),
        owner_public_id: "student_public_303",
        authorization_public_id: "personal_auth_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_paper_older",
        request_public_id: "personal_ai_request_paper_older",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-12T11:00:00.000Z"),
        owner_public_id: "student_public_303",
        authorization_public_id: "personal_auth_public_303",
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const history = await repository.listRequestHistory({
      authorizationPublicId: "personal_auth_public_303",
      ownerPublicId: "student_public_303",
      taskType: "ai_paper_generation",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });

    expect(gateway.listQueries).toEqual([
      {
        authorizationPublicId: "personal_auth_public_303",
        ownerPublicId: "student_public_303",
        taskType: "ai_paper_generation",
        page: 1,
        pageSize: 1,
        limit: 1,
        offset: 0,
      },
    ]);
    expect(history).toMatchObject([
      {
        requestPublicId: "personal_ai_request_paper_newer",
        taskType: "ai_paper_generation",
      },
    ]);
  });

  it("isolates list and count history by the exact selected authorization", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        request_public_id: "personal_ai_request_selected",
        owner_public_id: "student_public_306",
        actor_public_id: "student_public_306",
        authorization_public_id: "personal_auth_selected_public_306",
      }),
      createPersistenceRow({
        request_public_id: "personal_ai_request_other",
        owner_public_id: "student_public_306",
        actor_public_id: "student_public_306",
        authorization_public_id: "personal_auth_other_public_306",
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);
    const query = {
      authorizationPublicId: "personal_auth_selected_public_306",
      ownerType: "personal" as const,
      ownerPublicId: "student_public_306",
      actorPublicId: "student_public_306",
    };

    const history = await repository.listRequestHistory(query);
    const total = await repository.countRequestHistory?.(query);

    expect(history.map((row) => row.requestPublicId)).toEqual([
      "personal_ai_request_selected",
    ]);
    expect(total).toBe(1);
    expect(gateway.listQueries[0]).toMatchObject(query);
    expect(gateway.countQueries).toEqual([query]);
  });

  it("reuses an existing request by owner idempotency key", async () => {
    const envelope = createPersonalAiGenerationSnapshotEnvelope({
      taskType: "ai_question_generation",
      generationParameters: createGenerationParameters(),
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal_auth_public_304",
      ownerType: "personal",
      ownerPublicId: "student_public_304",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_304",
      effectiveEdition: "advanced",
    });
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "ai_generation_task_public_existing",
        request_public_id: "personal_ai_request_public_existing",
        task_status: "running",
        idempotency_key_hash: "sha256:personal_ai_generation_existing",
        owner_public_id: "student_public_304",
        actor_public_id: "student_public_304",
        generation_snapshot_version: envelope.generationSnapshotVersion,
        generation_input_snapshot: envelope.generationInputSnapshot,
        generation_constraint_snapshot: envelope.generationConstraintSnapshot,
        generation_snapshot_digest: envelope.generationSnapshotDigest,
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const result = await repository.createOrReuseRequest({
      requestPublicId: "personal_ai_request_public_new",
      taskPublicId: "ai_generation_task_public_new",
      taskType: "ai_question_generation",
      aiFuncType: null,
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal_auth_public_304",
      actorPublicId: "student_public_304",
      ownerType: "personal",
      ownerPublicId: "student_public_304",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_304",
      effectiveEdition: "advanced",
      questionPublicId: null,
      answerRecordPublicId: null,
      paperPublicId: null,
      mockExamPublicId: null,
      idempotencyKeyHash: "sha256:personal_ai_generation_existing",
      requestedAt: new Date("2026-06-12T12:00:00.000Z"),
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
      generationParameters: createGenerationParameters(),
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.historyItem.taskPublicId).toBe(
      "ai_generation_task_public_existing",
    );
    expect(gateway.insertInputs).toEqual([]);
  });

  it("fails closed when an idempotency key is replayed with a different snapshot", async () => {
    const envelope = createPersonalAiGenerationSnapshotEnvelope({
      taskType: "ai_question_generation",
      generationParameters: {
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNode: null,
        knowledgeNodeMode: "balanced",
        knowledgeNodePublicIds: [],
        includeDescendants: false,
        knowledgeNodeSupplement: null,
        sourcePreference: null,
        questionType: "single_choice",
        questionCount: 3,
        difficulty: "medium",
        learningObjective: null,
      },
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal_auth_public_160",
      ownerType: "personal",
      ownerPublicId: "student_public_160",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_160",
      effectiveEdition: "advanced",
    });
    const gateway = createGateway([
      createPersistenceRow({
        idempotency_key_hash: "sha256:replay_160",
        owner_public_id: "student_public_160",
        actor_public_id: "student_public_160",
        generation_snapshot_version: 1,
        generation_input_snapshot: envelope.generationInputSnapshot,
        generation_constraint_snapshot: envelope.generationConstraintSnapshot,
        generation_snapshot_digest: envelope.generationSnapshotDigest,
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    await expect(
      repository.createOrReuseRequest({
        requestPublicId: "request_new_160",
        taskPublicId: "task_new_160",
        taskType: "ai_question_generation",
        aiFuncType: null,
        authorizationSource: "personal_auth",
        authorizationPublicId: "personal_auth_public_160",
        actorPublicId: "student_public_160",
        ownerType: "personal",
        ownerPublicId: "student_public_160",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "student_public_160",
        effectiveEdition: "advanced",
        questionPublicId: null,
        answerRecordPublicId: null,
        paperPublicId: null,
        mockExamPublicId: null,
        idempotencyKeyHash: "sha256:replay_160",
        requestedAt: new Date("2026-07-21T12:00:00.000Z"),
        isAuthorizationActive: true,
        isScopeAllowed: true,
        isQuotaAvailable: true,
        isRuntimeConfigReady: true,
        generationParameters: {
          ...envelope.generationInputSnapshot.generationParameters,
          questionCount: 4,
        },
      }),
    ).rejects.toBeInstanceOf(PersonalAiGenerationSnapshotConflictError);
    expect(gateway.insertInputs).toEqual([]);
  });

  it("creates a pending redacted request when no idempotent row exists", async () => {
    const gateway = createGateway([]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const result = await repository.createOrReuseRequest({
      requestPublicId: "personal_ai_request_public_created",
      taskPublicId: "ai_generation_task_public_created",
      taskType: "ai_question_generation",
      aiFuncType: null,
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal_auth_public_305",
      actorPublicId: "student_public_305",
      ownerType: "personal",
      ownerPublicId: "student_public_305",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_305",
      effectiveEdition: "advanced",
      questionPublicId: null,
      answerRecordPublicId: null,
      paperPublicId: null,
      mockExamPublicId: null,
      idempotencyKeyHash: "sha256:personal_ai_generation_created",
      requestedAt: new Date("2026-06-12T12:00:00.000Z"),
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
      generationParameters: createGenerationParameters(),
    });

    expect(result).toMatchObject({
      persistenceStatus: "created",
      historyItem: {
        requestPublicId: "personal_ai_request_public_created",
        taskPublicId: "ai_generation_task_public_created",
        status: "pending",
        redactionStatus: "redacted",
      },
    });
    expect(gateway.insertInputs).toHaveLength(1);
    expect(JSON.stringify(result)).not.toMatch(/"id":/);
  });

  it("creates new pending requests with server-owned result metadata", async () => {
    const gateway = createGateway([]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    await repository.createOrReuseRequest({
      requestPublicId: "personal_ai_request_public_server_owned",
      taskPublicId: "ai_generation_task_public_server_owned",
      taskType: "ai_question_generation",
      aiFuncType: null,
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal_auth_public_server_owned",
      actorPublicId: "student_public_server_owned",
      ownerType: "personal",
      ownerPublicId: "student_public_server_owned",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_server_owned",
      effectiveEdition: "advanced",
      questionPublicId: null,
      answerRecordPublicId: null,
      paperPublicId: null,
      mockExamPublicId: null,
      idempotencyKeyHash: "sha256:personal_ai_generation_server_owned",
      requestedAt: new Date("2026-06-12T12:30:00.000Z"),
      resultPublicId: "client_result_public_stale_repository",
      evidenceStatus: "sufficient",
      citationCount: 9,
      aiCallLogPublicId: "client_ai_call_log_public_stale_repository",
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
      generationParameters: createGenerationParameters(),
    });

    expect(gateway.insertInputs).toHaveLength(1);
    expect(gateway.insertInputs[0]).toMatchObject({
      resultPublicId: null,
      evidenceStatus: "none",
      citationCount: 0,
      aiCallLogPublicId: null,
    });
  });
});
