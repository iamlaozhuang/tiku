import { describe, expect, it, vi } from "vitest";

import type {
  PersonalAiGenerationResultPersistenceRow,
  PersonalAiGenerationResultTaskGateway,
} from "./personal-ai-generation-result-repository";
import {
  createPersonalAiGenerationResultByTaskCondition,
  createPersonalAiGenerationResultHistoryCondition,
  createPersonalAiGenerationResultRepository,
} from "./personal-ai-generation-result-repository";

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
  const insertDraftResult = vi.fn(
    async () => options.insertedRow ?? createPersistenceRow(),
  );
  const attachResultToTask = vi.fn(async () => undefined);

  const gateway: PersonalAiGenerationResultTaskGateway = {
    listResultRows,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResult,
    attachResultToTask,
  };

  return {
    gateway,
    listResultRows,
    findResultByTaskPublicId,
    findTaskByPublicId,
    insertDraftResult,
    attachResultToTask,
  };
}

describe("personal AI generation result repository", () => {
  it("builds owner-scoped result history conditions", () => {
    const condition = createPersonalAiGenerationResultHistoryCondition({
      ownerPublicId: "student_public_170",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "student_public_170")).toBe(true);
    expect(containsText(condition, "draft")).toBe(true);
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
    const { gateway, insertDraftResult } = createGateway({
      existingRow,
    });
    const repository = createPersonalAiGenerationResultRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "personal_ai_result_public_new",
      taskPublicId: "ai_generation_task_public_existing",
      ownerPublicId: "student_public_173",
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
    expect(insertDraftResult).not.toHaveBeenCalled();
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
    const {
      gateway,
      findTaskByPublicId,
      insertDraftResult,
      attachResultToTask,
    } = createGateway({
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
      ownerPublicId: "student_public_174",
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
      ownerPublicId: "student_public_174",
      taskPublicId: "ai_generation_task_public_created",
    });
    expect(insertDraftResult).toHaveBeenCalledWith(
      expect.objectContaining({
        aiGenerationTaskId: 704,
        requestPublicId: "personal_ai_request_public_created",
        resultStatus: "draft",
        isFormalAdoptionBlocked: true,
      }),
    );
    expect(attachResultToTask).toHaveBeenCalledWith({
      ownerPublicId: "student_public_174",
      taskPublicId: "ai_generation_task_public_created",
      resultPublicId: "personal_ai_result_public_created",
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: null,
    });
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
