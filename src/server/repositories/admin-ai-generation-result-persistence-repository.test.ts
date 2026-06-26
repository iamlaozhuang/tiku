import { describe, expect, it, vi } from "vitest";

import type {
  AdminAiGenerationResultPersistenceGateway,
  AdminAiGenerationResultPersistenceRow,
} from "../contracts/admin-ai-generation-result-persistence-contract";
import {
  createAdminAiGenerationResultByTaskCondition,
  createAdminAiGenerationResultHistoryCondition,
  createAdminAiGenerationResultPersistenceRepository,
} from "./admin-ai-generation-result-persistence-repository";

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

function createResultRow(
  overrides: Partial<AdminAiGenerationResultPersistenceRow> = {},
): AdminAiGenerationResultPersistenceRow {
  return {
    id: 901,
    public_id: "admin_ai_generation_result_public_901",
    ai_generation_task_id: 701,
    task_public_id: "admin_ai_generation_task_public_901",
    request_public_id: "admin_ai_generation_request_public_901",
    workspace: "organization",
    generation_kind: "paper",
    owner_type: "organization",
    owner_public_id: "organization_public_901",
    organization_public_id: "organization_public_901",
    task_type: "ai_paper_generation",
    result_status: "draft",
    content_redacted_snapshot: {
      redactionStatus: "redacted",
      contentDigest: "sha256:admin_result_901",
    },
    content_digest: "sha256:admin_result_901",
    content_preview_masked: "masked admin generated result preview",
    citation_redacted_snapshot: null,
    evidence_status: "weak",
    citation_count: 1,
    ai_call_log_public_id: null,
    source_question_public_id: null,
    source_paper_public_id: null,
    is_formal_adoption_blocked: true,
    created_at: new Date("2026-06-26T20:00:00.000Z"),
    updated_at: new Date("2026-06-26T20:00:00.000Z"),
    ...overrides,
  };
}

function createGateway(options: {
  rows?: AdminAiGenerationResultPersistenceRow[];
  existingRow?: AdminAiGenerationResultPersistenceRow | null;
  insertedRow?: AdminAiGenerationResultPersistenceRow | null;
  taskRow?: {
    id: number;
    public_id: string;
    request_public_id: string;
    workspace: "content" | "organization";
    owner_type: "platform" | "organization";
    owner_public_id: string;
    organization_public_id: string | null;
    task_type: "ai_question_generation" | "ai_paper_generation";
  } | null;
}) {
  const listResultRows = vi.fn(async () => options.rows ?? []);
  const findResultByTaskPublicId = vi.fn(
    async () => options.existingRow ?? null,
  );
  const findTaskByPublicId = vi.fn(async () => options.taskRow ?? null);
  const insertDraftResult = vi.fn(
    async () => options.insertedRow ?? createResultRow(),
  );
  const attachResultToTask = vi.fn(async () => undefined);

  const gateway: AdminAiGenerationResultPersistenceGateway = {
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

describe("admin AI generation result persistence repository", () => {
  it("builds workspace and owner scoped result history conditions", () => {
    const condition = createAdminAiGenerationResultHistoryCondition({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "workspace")).toBe(true);
    expect(containsText(condition, "organization")).toBe(true);
    expect(containsText(condition, "owner_public_id")).toBe(true);
    expect(containsText(condition, "organization_public_901")).toBe(true);
    expect(containsText(condition, "draft")).toBe(true);
  });

  it("builds workspace and owner scoped result lookup by task public id", () => {
    const condition = createAdminAiGenerationResultByTaskCondition({
      workspace: "content",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      taskPublicId: "admin_ai_generation_task_public_content_901",
    });

    expect(condition).not.toBeNull();
    expect(containsText(condition, "workspace")).toBe(true);
    expect(containsText(condition, "content")).toBe(true);
    expect(containsText(condition, "owner_type")).toBe(true);
    expect(containsText(condition, "platform")).toBe(true);
    expect(containsText(condition, "task_public_id")).toBe(true);
  });

  it("lists redacted draft results newest first without internal ids or raw snapshots", async () => {
    const { gateway, listResultRows } = createGateway({
      rows: [
        createResultRow({
          public_id: "admin_ai_generation_result_public_b",
          created_at: new Date("2026-06-26T20:00:00.000Z"),
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_public_c",
          created_at: new Date("2026-06-26T21:00:00.000Z"),
        }),
        createResultRow({
          public_id: "admin_ai_generation_result_public_a",
          created_at: new Date("2026-06-26T20:00:00.000Z"),
        }),
      ],
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const draftResults = await repository.listDraftResults({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      limit: 3,
    });

    expect(listResultRows).toHaveBeenCalledWith({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      limit: 3,
    });
    expect(draftResults.map((result) => result.resultPublicId)).toEqual([
      "admin_ai_generation_result_public_c",
      "admin_ai_generation_result_public_a",
      "admin_ai_generation_result_public_b",
    ]);
    expect(JSON.stringify(draftResults)).not.toMatch(/"id":/u);
    expect(JSON.stringify(draftResults)).not.toContain(
      "content_redacted_snapshot",
    );
  });

  it("creates a backend admin draft result and attaches only result summary fields to the task", async () => {
    const insertedRow = createResultRow({
      public_id: "admin_ai_generation_result_public_created",
      task_public_id: "admin_ai_generation_task_public_created",
      request_public_id: "admin_ai_generation_request_public_created",
      evidence_status: "sufficient",
      citation_count: 2,
      content_digest: "sha256:admin_result_created",
      content_preview_masked: "masked admin generated result created",
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
        public_id: "admin_ai_generation_task_public_created",
        request_public_id: "admin_ai_generation_request_public_created",
        workspace: "organization",
        owner_type: "organization",
        owner_public_id: "organization_public_901",
        organization_public_id: "organization_public_901",
        task_type: "ai_paper_generation",
      },
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "admin_ai_generation_result_public_created",
      taskPublicId: "admin_ai_generation_task_public_created",
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      organizationPublicId: "organization_public_901",
      taskType: "ai_paper_generation",
      contentRedactedSnapshot: {
        redactionStatus: "redacted",
        contentDigest: "sha256:admin_result_created",
      },
      contentDigest: "sha256:admin_result_created",
      contentPreviewMasked: "masked admin generated result created",
      citationRedactedSnapshot: null,
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: null,
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
      createdAt: new Date("2026-06-26T21:30:00.000Z"),
    });

    expect(findTaskByPublicId).toHaveBeenCalledWith({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      taskPublicId: "admin_ai_generation_task_public_created",
    });
    expect(insertDraftResult).toHaveBeenCalledWith(
      expect.objectContaining({
        aiGenerationTaskId: 704,
        requestPublicId: "admin_ai_generation_request_public_created",
        resultStatus: "draft",
        isFormalAdoptionBlocked: true,
      }),
    );
    expect(attachResultToTask).toHaveBeenCalledWith({
      workspace: "organization",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      taskPublicId: "admin_ai_generation_task_public_created",
      resultPublicId: "admin_ai_generation_result_public_created",
      evidenceStatus: "sufficient",
      citationCount: 2,
      aiCallLogPublicId: null,
    });
    expect(result).toMatchObject({
      persistenceStatus: "created",
      result: {
        resultPublicId: "admin_ai_generation_result_public_created",
        requestPublicId: "admin_ai_generation_request_public_created",
        workspace: "organization",
        generationKind: "paper",
        status: "draft",
        contentReference: {
          contentDigest: "sha256:admin_result_created",
          contentPreviewMasked: "masked admin generated result created",
        },
        formalAdoption: {
          isBlocked: true,
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/"id":/u);
  });

  it("reuses an existing backend admin draft result for the same workspace owner and task", async () => {
    const existingRow = createResultRow({
      public_id: "admin_ai_generation_result_public_existing",
      task_public_id: "admin_ai_generation_task_public_existing",
    });
    const { gateway, insertDraftResult, attachResultToTask } = createGateway({
      existingRow,
    });
    const repository =
      createAdminAiGenerationResultPersistenceRepository(gateway);

    const result = await repository.createOrReuseDraftResult({
      resultPublicId: "admin_ai_generation_result_public_new",
      taskPublicId: "admin_ai_generation_task_public_existing",
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_901",
      organizationPublicId: "organization_public_901",
      taskType: "ai_paper_generation",
      contentRedactedSnapshot: { redactionStatus: "redacted" },
      contentDigest: "sha256:new",
      contentPreviewMasked: "masked preview new",
      citationRedactedSnapshot: null,
      evidenceStatus: "weak",
      citationCount: 1,
      aiCallLogPublicId: null,
      sourceQuestionPublicId: null,
      sourcePaperPublicId: null,
      createdAt: new Date("2026-06-26T22:00:00.000Z"),
    });

    expect(result.persistenceStatus).toBe("reused");
    expect(result.result.resultPublicId).toBe(
      "admin_ai_generation_result_public_existing",
    );
    expect(insertDraftResult).not.toHaveBeenCalled();
    expect(attachResultToTask).not.toHaveBeenCalled();
  });
});
