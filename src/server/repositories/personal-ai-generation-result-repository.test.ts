import { describe, expect, it, vi } from "vitest";

import type {
  PersonalAiGenerationResultPersistenceRow,
  PersonalAiGenerationResultTaskGateway,
} from "./personal-ai-generation-result-repository";
import {
  createPersonalAiGenerationResultByTaskCondition,
  createPersonalAiGenerationResultHistoryCondition,
  createPersonalAiGenerationResultRepository,
  persistPersonalAiGenerationDraftResultAndCompleteTask,
} from "./personal-ai-generation-result-repository";
import type { RuntimeDatabase } from "./runtime-database";

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
  overrides: Partial<PersonalAiGenerationResultPersistenceRow> = {},
): PersonalAiGenerationResultPersistenceRow {
  return {
    id: 901,
    public_id: "personal_ai_result_public_170",
    ai_generation_task_id: 701,
    task_public_id: "ai_generation_task_public_170",
    request_public_id: "personal_ai_request_public_170",
    owner_public_id: "student_public_170",
    actor_public_id: "student_public_170",
    task_type: "ai_question_generation",
    result_status: "draft",
    content_redacted_snapshot: {
      redactionStatus: "redacted",
      contentHash: "sha256:content_170",
    },
    content_digest: "sha256:content_170",
    content_preview_masked: "masked preview 170",
    citation_redacted_snapshot: null,
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    is_formal_adoption_blocked: true,
    created_at: new Date("2026-06-13T12:00:00.000Z"),
    updated_at: new Date("2026-06-13T12:00:00.000Z"),
    ...overrides,
  };
}

function createAtomicPersistenceInput(
  row: PersonalAiGenerationResultPersistenceRow,
) {
  return {
    result: {
      resultPublicId: row.public_id,
      taskPublicId: row.task_public_id,
      ownerType: "personal" as const,
      ownerPublicId: row.owner_public_id,
      actorPublicId: row.actor_public_id ?? row.owner_public_id,
      taskType: row.task_type,
      aiGenerationTaskId: row.ai_generation_task_id,
      requestPublicId: row.request_public_id,
      resultStatus: "draft" as const,
      contentRedactedSnapshot: row.content_redacted_snapshot,
      contentDigest: row.content_digest,
      contentPreviewMasked: row.content_preview_masked,
      citationRedactedSnapshot: row.citation_redacted_snapshot,
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
      isFormalAdoptionBlocked: true as const,
      createdAt: row.created_at,
    },
    task: {
      ownerType: "personal" as const,
      ownerPublicId: row.owner_public_id,
      actorPublicId: row.actor_public_id ?? row.owner_public_id,
      taskPublicId: row.task_public_id,
      resultPublicId: row.public_id,
      taskStatus: "succeeded" as const,
      evidenceStatus: row.evidence_status,
      citationCount: row.citation_count,
      aiCallLogPublicId: row.ai_call_log_public_id,
    },
  };
}

function createGateway(
  options: {
    rows?: PersonalAiGenerationResultPersistenceRow[];
    existingRow?: PersonalAiGenerationResultPersistenceRow | null;
    insertedRow?: PersonalAiGenerationResultPersistenceRow | null;
    taskRow?: {
      id: number;
      public_id: string;
      request_public_id: string;
      owner_public_id: string;
    } | null;
  } = {},
) {
  const listResultRows = vi.fn(async (query) =>
    (options.rows ?? [])
      .filter(
        (row) =>
          row.owner_public_id === query.ownerPublicId &&
          (query.actorPublicId === undefined ||
            row.actor_public_id === query.actorPublicId) &&
          row.result_status === "draft" &&
          (query.taskType === undefined || row.task_type === query.taskType),
      )
      .sort(
        (leftRow, rightRow) =>
          rightRow.created_at.getTime() - leftRow.created_at.getTime() ||
          leftRow.public_id.localeCompare(rightRow.public_id),
      )
      .slice(query.offset, query.offset + query.limit),
  );
  const findResultByTaskPublicId = vi.fn(
    async () => options.existingRow ?? null,
  );
  const findTaskByPublicId = vi.fn(async () => options.taskRow ?? null);
  const insertDraftResultAndCompleteTask = vi.fn(
    async () => options.insertedRow ?? createPersistenceRow(),
  );

  const gateway: PersonalAiGenerationResultTaskGateway = {
    listResultRows,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResultAndCompleteTask,
  };

  return {
    gateway,
    listResultRows,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResultAndCompleteTask,
  };
}

describe("personal AI generation result repository", () => {
  it("persists the draft result and succeeded task state in one database transaction", async () => {
    const insertedRow = createPersistenceRow();
    const updateReturning = vi.fn(async () => [
      { public_id: insertedRow.task_public_id },
    ]);
    const updateWhere = vi.fn(() => ({ returning: updateReturning }));
    const updateSet = vi.fn(() => ({ where: updateWhere }));
    const insertReturning = vi.fn(async () => [insertedRow]);
    const insertOnConflict = vi.fn(() => ({ returning: insertReturning }));
    const insertValues = vi.fn(() => ({
      onConflictDoNothing: insertOnConflict,
    }));
    const transactionDatabase = {
      insert: vi.fn(() => ({ values: insertValues })),
      update: vi.fn(() => ({ set: updateSet })),
    };
    const transaction = vi.fn(async (callback) =>
      callback(transactionDatabase),
    );

    const result = await persistPersonalAiGenerationDraftResultAndCompleteTask(
      { transaction } as unknown as RuntimeDatabase,
      createAtomicPersistenceInput(insertedRow),
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        task_status: "succeeded",
        result_public_id: insertedRow.public_id,
      }),
    );
    expect(updateWhere).toHaveBeenCalledTimes(1);
    expect(updateReturning).toHaveBeenCalledTimes(1);
    expect(result).toEqual(insertedRow);
  });

  it("rolls back when the owner-scoped task cannot be completed", async () => {
    const insertedRow = createPersistenceRow();
    const transactionDatabase = {
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoNothing: vi.fn(() => ({
            returning: vi.fn(async () => [insertedRow]),
          })),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({ returning: vi.fn(async () => []) })),
        })),
      })),
    };
    const transaction = vi.fn(async (callback) =>
      callback(transactionDatabase),
    );

    await expect(
      persistPersonalAiGenerationDraftResultAndCompleteTask(
        { transaction } as unknown as RuntimeDatabase,
        createAtomicPersistenceInput(insertedRow),
      ),
    ).rejects.toThrow(
      "personal AI generation task completion persistence failed.",
    );
  });

  it("builds owner-scoped result history conditions", () => {
    const condition = createPersonalAiGenerationResultHistoryCondition({
      ownerPublicId: "student_public_170",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "student_public_170")).toBe(true);
    expect(containsText(condition, "draft")).toBe(true);
  });

  it("builds actor-scoped organization result history conditions", () => {
    const condition = createPersonalAiGenerationResultHistoryCondition({
      ownerPublicId: "organization_public_170",
      actorPublicId: "employee_user_public_170",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_170")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
    expect(containsText(condition, "employee_user_public_170")).toBe(true);
  });

  it("builds owner-scoped result lookup by task public id", () => {
    const condition = createPersonalAiGenerationResultByTaskCondition({
      ownerPublicId: "student_public_171",
      taskPublicId: "ai_generation_task_public_171",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "student_public_171")).toBe(true);
    expect(containsText(condition, "task_public_id")).toBe(true);
    expect(containsText(condition, "ai_generation_task_public_171")).toBe(true);
  });

  it("builds actor-scoped result lookup by task public id", () => {
    const condition = createPersonalAiGenerationResultByTaskCondition({
      ownerPublicId: "organization_public_171",
      actorPublicId: "employee_user_public_171",
      taskPublicId: "ai_generation_task_public_171",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_171")).toBe(true);
    expect(containsText(condition, "actor_public_id")).toBe(true);
    expect(containsText(condition, "employee_user_public_171")).toBe(true);
  });

  it("lists owner draft results newest first without exposing internal ids or snapshots", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_public_b",
          created_at: new Date("2026-06-13T12:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_public_c",
          created_at: new Date("2026-06-13T13:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_public_a",
          created_at: new Date("2026-06-13T12:00:00.000Z"),
        }),
      ],
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const draftResults = await repository.listDraftResults({
      ownerPublicId: "student_public_172",
      page: 1,
      pageSize: 3,
      limit: 3,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      ownerPublicId: "student_public_172",
      page: 1,
      pageSize: 3,
      limit: 3,
      offset: 0,
    });
    expect(draftResults.map((row) => row.resultPublicId)).toEqual([
      "personal_ai_result_public_c",
      "personal_ai_result_public_a",
      "personal_ai_result_public_b",
    ]);
    expect(JSON.stringify(draftResults)).not.toMatch(/"id":/);
    expect(JSON.stringify(draftResults)).not.toContain(
      "content_redacted_snapshot",
    );
  });

  it("filters same-organization draft results by actor public id", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createPersistenceRow({
          public_id: "personal_ai_result_employee_a",
          owner_public_id: "organization_public_172",
          actor_public_id: "employee_user_public_a",
        }),
        createPersistenceRow({
          public_id: "personal_ai_result_employee_b",
          owner_public_id: "organization_public_172",
          actor_public_id: "employee_user_public_b",
        }),
      ],
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const draftResults = await repository.listDraftResults({
      ownerType: "organization",
      ownerPublicId: "organization_public_172",
      actorPublicId: "employee_user_public_a",
      page: 1,
      pageSize: 20,
      limit: 20,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      ownerType: "organization",
      ownerPublicId: "organization_public_172",
      actorPublicId: "employee_user_public_a",
      page: 1,
      pageSize: 20,
      limit: 20,
      offset: 0,
    });
    expect(draftResults.map((row) => row.resultPublicId)).toEqual([
      "personal_ai_result_employee_a",
    ]);
  });

  it("filters owner draft results by task type before pagination", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_question_newer",
          task_type: "ai_question_generation",
          created_at: new Date("2026-06-13T14:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_paper_newer",
          task_type: "ai_paper_generation",
          created_at: new Date("2026-06-13T13:00:00.000Z"),
        }),
        createPersistenceRow({
          owner_public_id: "student_public_172",
          public_id: "personal_ai_result_paper_older",
          task_type: "ai_paper_generation",
          created_at: new Date("2026-06-13T12:00:00.000Z"),
        }),
      ],
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const draftResults = await repository.listDraftResults({
      ownerPublicId: "student_public_172",
      taskType: "ai_paper_generation",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      ownerPublicId: "student_public_172",
      taskType: "ai_paper_generation",
      page: 1,
      pageSize: 1,
      limit: 1,
      offset: 0,
    });
    expect(draftResults.map((row) => row.resultPublicId)).toEqual([
      "personal_ai_result_paper_newer",
    ]);
  });

  it("reuses an existing draft result for the owner and task", async () => {
    const existingRow = createPersistenceRow({
      public_id: "personal_ai_result_public_existing",
      task_public_id: "ai_generation_task_public_existing",
      owner_public_id: "student_public_173",
    });
    const { gateway, insertDraftResultAndCompleteTask } = createGateway({
      existingRow,
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "personal_ai_result_public_new",
      taskPublicId: "ai_generation_task_public_existing",
      ownerType: "personal",
      ownerPublicId: "student_public_173",
      actorPublicId: "student_public_173",
      taskType: "ai_question_generation",
      contentRedactedSnapshot: { redactionStatus: "redacted" },
      contentDigest: "sha256:new",
      contentPreviewMasked: "masked preview new",
      citationRedactedSnapshot: null,
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: null,
      createdAt: new Date("2026-06-13T13:30:00.000Z"),
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.result.resultPublicId).toBe(
      "personal_ai_result_public_existing",
    );
    expect(insertDraftResultAndCompleteTask).not.toHaveBeenCalled();
  });

  it("creates a draft result with server-owned no-adoption metadata", async () => {
    const insertedRow = createPersistenceRow({
      public_id: "personal_ai_result_public_created",
      task_public_id: "ai_generation_task_public_created",
      request_public_id: "personal_ai_request_public_created",
      owner_public_id: "student_public_174",
      content_digest: "sha256:created",
      content_preview_masked: "masked preview created",
      evidence_status: "sufficient",
      citation_count: 2,
    });
    const { gateway, findTaskByPublicId, insertDraftResultAndCompleteTask } =
      createGateway({
        insertedRow,
        taskRow: {
          id: 704,
          public_id: "ai_generation_task_public_created",
          request_public_id: "personal_ai_request_public_created",
          owner_public_id: "student_public_174",
        },
      });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "personal_ai_result_public_created",
      taskPublicId: "ai_generation_task_public_created",
      ownerType: "personal",
      ownerPublicId: "student_public_174",
      actorPublicId: "student_public_174",
      taskType: "ai_question_generation",
      contentRedactedSnapshot: {
        redactionStatus: "redacted",
        contentHash: "sha256:created",
      },
      contentDigest: "sha256:created",
      contentPreviewMasked: "masked preview created",
      citationRedactedSnapshot: null,
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: null,
      createdAt: new Date("2026-06-13T14:00:00.000Z"),
    });

    expect(findTaskByPublicId).toHaveBeenCalledWith({
      ownerType: "personal",
      ownerPublicId: "student_public_174",
      actorPublicId: "student_public_174",
      taskPublicId: "ai_generation_task_public_created",
    });
    expect(insertDraftResultAndCompleteTask).toHaveBeenCalledWith(
      expect.objectContaining({
        result: expect.objectContaining({
          aiGenerationTaskId: 704,
          requestPublicId: "personal_ai_request_public_created",
          resultStatus: "draft",
          isFormalAdoptionBlocked: true,
        }),
        task: {
          ownerType: "personal",
          ownerPublicId: "student_public_174",
          actorPublicId: "student_public_174",
          taskPublicId: "ai_generation_task_public_created",
          resultPublicId: "personal_ai_result_public_created",
          taskStatus: "succeeded",
          evidenceStatus: "sufficient",
          citationCount: 2,
          aiCallLogPublicId: null,
        },
      }),
    );
    expect(result).toMatchObject({
      persistenceStatus: "created",
      result: {
        resultPublicId: "personal_ai_result_public_created",
        requestPublicId: "personal_ai_request_public_created",
        status: "draft",
        formalAdoption: {
          isBlocked: true,
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/);
  });
});
