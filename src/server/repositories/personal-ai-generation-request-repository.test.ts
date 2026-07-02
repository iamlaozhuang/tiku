import { describe, expect, it } from "vitest";

import type {
  PersonalAiGenerationRequestPersistenceRow,
  PersonalAiGenerationRequestTaskGateway,
} from "./personal-ai-generation-request-repository";
import {
  PERSONAL_AI_GENERATION_TASK_TYPES,
  createPersonalAiGenerationRequestHistoryCondition,
  createPersonalAiGenerationRequestIdempotencyCondition,
  createPersonalAiGenerationRequestRepository,
} from "./personal-ai-generation-request-repository";

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
  overrides: Partial<PersonalAiGenerationRequestPersistenceRow> = {},
): PersonalAiGenerationRequestPersistenceRow {
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
    ...overrides,
  };
}

function createGateway(
  rows: PersonalAiGenerationRequestPersistenceRow[],
): PersonalAiGenerationRequestTaskGateway & {
  listQueries: Array<{
    ownerPublicId: string;
    taskType?: string;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  }>;
  idempotencyQueries: Array<{
    ownerPublicId: string;
    idempotencyKeyHash: string;
  }>;
  insertInputs: unknown[];
} {
  const listQueries: Array<{
    ownerPublicId: string;
    taskType?: string;
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
  }> = [];
  const idempotencyQueries: Array<{
    ownerPublicId: string;
    idempotencyKeyHash: string;
  }> = [];
  const insertInputs: unknown[] = [];

  return {
    listQueries,
    idempotencyQueries,
    insertInputs,
    async listRequestRows(query) {
      listQueries.push(query);

      return rows
        .filter(
          (row) =>
            row.owner_public_id === query.ownerPublicId &&
            (query.taskType === undefined || row.task_type === query.taskType),
        )
        .sort(
          (leftRow, rightRow) =>
            rightRow.requested_at.getTime() - leftRow.requested_at.getTime() ||
            leftRow.request_public_id.localeCompare(rightRow.request_public_id),
        )
        .slice(query.offset, query.offset + query.limit);
    },
    async findRequestByIdempotencyKey(query) {
      idempotencyQueries.push(query);

      return (
        rows.find(
          (row) =>
            row.owner_public_id === query.ownerPublicId &&
            row.idempotency_key_hash === query.idempotencyKeyHash,
        ) ?? null
      );
    },
    async insertPendingRequest(input) {
      insertInputs.push(input);

      return createPersistenceRow({
        public_id: input.taskPublicId,
        request_public_id: input.requestPublicId,
        task_type: input.taskType,
        task_status: "pending",
        requested_at: input.requestedAt,
        idempotency_key_hash: input.idempotencyKeyHash,
        owner_public_id: input.ownerPublicId,
      });
    },
  };
}

describe("personal AI generation request repository", () => {
  it("builds owner-scoped personal request history conditions", () => {
    const condition = createPersonalAiGenerationRequestHistoryCondition({
      ownerPublicId: "student_public_301",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "student_public_301")).toBe(true);
    expect(containsText(condition, "ai_question_generation")).toBe(true);
    expect(containsText(condition, "ai_paper_generation")).toBe(true);
    expect(PERSONAL_AI_GENERATION_TASK_TYPES).not.toContain(
      "organization_training_generation",
    );
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

  it("lists session-owned history newest first without exposing internal ids", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "ai_generation_task_public_b",
        request_public_id: "personal_ai_request_public_b",
        requested_at: new Date("2026-06-12T10:00:00.000Z"),
        owner_public_id: "student_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_public_c",
        request_public_id: "personal_ai_request_public_c",
        requested_at: new Date("2026-06-12T11:00:00.000Z"),
        owner_public_id: "student_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_public_a",
        request_public_id: "personal_ai_request_public_a",
        requested_at: new Date("2026-06-12T10:00:00.000Z"),
        owner_public_id: "student_public_303",
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const history = await repository.listRequestHistory({
      ownerPublicId: "student_public_303",
      limit: 3,
    });

    expect(gateway.listQueries).toEqual([
      {
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

  it("filters request history by task type before applying descending pagination", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "ai_generation_task_question_newer",
        request_public_id: "personal_ai_request_question_newer",
        task_type: "ai_question_generation",
        requested_at: new Date("2026-06-12T13:00:00.000Z"),
        owner_public_id: "student_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_paper_newer",
        request_public_id: "personal_ai_request_paper_newer",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-12T12:00:00.000Z"),
        owner_public_id: "student_public_303",
      }),
      createPersistenceRow({
        public_id: "ai_generation_task_paper_older",
        request_public_id: "personal_ai_request_paper_older",
        task_type: "ai_paper_generation",
        requested_at: new Date("2026-06-12T11:00:00.000Z"),
        owner_public_id: "student_public_303",
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const history = await repository.listRequestHistory({
      ownerPublicId: "student_public_303",
      taskType: "ai_paper_generation",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });

    expect(gateway.listQueries).toEqual([
      {
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

  it("reuses an existing request by owner idempotency key", async () => {
    const gateway = createGateway([
      createPersistenceRow({
        public_id: "ai_generation_task_public_existing",
        request_public_id: "personal_ai_request_public_existing",
        task_status: "running",
        idempotency_key_hash: "sha256:personal_ai_generation_existing",
        owner_public_id: "student_public_304",
      }),
    ]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const result = await repository.createOrReuseRequest({
      requestPublicId: "personal_ai_request_public_new",
      taskPublicId: "ai_generation_task_public_new",
      taskType: "ai_question_generation",
      aiFuncType: "explanation",
      authorizationPublicId: "personal_auth_public_304",
      actorPublicId: "student_public_304",
      ownerType: "personal",
      ownerPublicId: "student_public_304",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_304",
      effectiveEdition: "advanced",
      questionPublicId: "question_public_304",
      answerRecordPublicId: null,
      paperPublicId: null,
      mockExamPublicId: null,
      idempotencyKeyHash: "sha256:personal_ai_generation_existing",
      requestedAt: new Date("2026-06-12T12:00:00.000Z"),
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.historyItem.taskPublicId).toBe(
      "ai_generation_task_public_existing",
    );
    expect(gateway.insertInputs).toEqual([]);
  });

  it("creates a pending redacted request when no idempotent row exists", async () => {
    const gateway = createGateway([]);
    const repository = createPersonalAiGenerationRequestRepository(gateway);

    const result = await repository.createOrReuseRequest({
      requestPublicId: "personal_ai_request_public_created",
      taskPublicId: "ai_generation_task_public_created",
      taskType: "ai_question_generation",
      aiFuncType: "explanation",
      authorizationPublicId: "personal_auth_public_305",
      actorPublicId: "student_public_305",
      ownerType: "personal",
      ownerPublicId: "student_public_305",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_305",
      effectiveEdition: "advanced",
      questionPublicId: "question_public_305",
      answerRecordPublicId: "answer_record_public_305",
      paperPublicId: "paper_public_305",
      mockExamPublicId: null,
      idempotencyKeyHash: "sha256:personal_ai_generation_created",
      requestedAt: new Date("2026-06-12T12:00:00.000Z"),
      isAuthorizationActive: true,
      isScopeAllowed: true,
      isQuotaAvailable: true,
      isRuntimeConfigReady: true,
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
      aiFuncType: "explanation",
      authorizationPublicId: "personal_auth_public_server_owned",
      actorPublicId: "student_public_server_owned",
      ownerType: "personal",
      ownerPublicId: "student_public_server_owned",
      organizationPublicId: null,
      quotaOwnerType: "personal",
      quotaOwnerPublicId: "student_public_server_owned",
      effectiveEdition: "advanced",
      questionPublicId: "question_public_server_owned",
      answerRecordPublicId: "answer_record_public_server_owned",
      paperPublicId: "paper_public_server_owned",
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
