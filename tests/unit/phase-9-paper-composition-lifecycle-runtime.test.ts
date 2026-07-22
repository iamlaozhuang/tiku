import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  createPaperCompositionLifecycleRuntimeRouteHandlers,
  type PaperCompositionLifecycleRuntimeRepositories,
} from "@/server/services/paper-composition-lifecycle-runtime";
import type { SessionService } from "@/server/services/session-service";
import type {
  PaperDraftAccessRow,
  PaperDraftRepository,
  PaperQuestionAccessRow,
} from "@/server/repositories/paper-draft-repository";
import type {
  PaperAssetAccessRow,
  PaperAssetRepository,
} from "@/server/repositories/paper-asset-repository";

const createdAt = new Date("2026-05-23T02:00:00.000Z");

function createSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: {
            expiresAt: "2026-05-23T10:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Content Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: [role],
          },
        },
      };
    },
  };
}

function createPaperQuestion(
  overrides: Partial<PaperQuestionAccessRow> = {},
): PaperQuestionAccessRow {
  return {
    id: 301,
    public_id: "paper-question-public-001",
    source_question_public_id: "question-public-001",
    paper_section_id: 201,
    paper_section_sort_order: 1,
    question_group_id: null,
    question_group_sort_order: null,
    question_group_public_id: null,
    question_snapshot: {
      questionPublicId: "question-public-001",
      questionStatus: "available",
      questionType: "single_choice",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      stemRichText: "<p>许可证办理首要步骤是什么？</p>",
      questionOptions: [
        {
          label: "A",
          contentRichText: "<p>核验材料</p>",
          isCorrect: true,
          sortOrder: 1,
        },
      ],
      standardAnswerRichText: "<p>A</p>",
      analysisRichText: "<p>老师解析</p>",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "auto_match",
    },
    material_snapshot: null,
    score: "5.0",
    sort_order: 1,
    scoring_points: [],
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createPaper(
  overrides: Partial<PaperDraftAccessRow> = {},
): PaperDraftAccessRow {
  return {
    id: 101,
    public_id: "paper-public-001",
    name: "专卖理论模拟卷",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    paper_status: "draft",
    paper_type: "mock_paper",
    year: 2026,
    month: null,
    source: null,
    source_region: null,
    source_organization: null,
    question_basis: null,
    generation_method: "manual",
    duration_minute: 90,
    total_score: "5.0",
    published_at: null,
    archived_at: null,
    paper_sections: [
      {
        id: 201,
        public_id: "paper_section_public_201",
        title: "单选题",
        description: null,
        sort_order: 1,
        total_score: "5.0",
        paper_questions: [createPaperQuestion()],
      },
    ],
    question_groups: [],
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
    revision: overrides.revision ?? 1,
  };
}

function createPaperAsset(
  overrides: Partial<PaperAssetAccessRow> = {},
): PaperAssetAccessRow {
  return {
    id: 401,
    public_id: "paper-asset-public-001",
    paper_public_id: "paper-public-001",
    profession: "monopoly",
    paper_attachment_usage: "paper_source",
    file_name: "monopoly-theory.pdf",
    object_key:
      "dev/paper-asset/monopoly/202605/abc123def4567890abc123def4567890.pdf",
    content_type: "application/pdf",
    file_size_byte: 2048,
    file_hash: "abc123def4567890abc123def4567890",
    created_at: createdAt,
    ...overrides,
  };
}

function createPaperRepository(
  mutationContexts: unknown[] = [],
): PaperDraftRepository {
  let currentPaperStatus: PaperDraftAccessRow["paper_status"] = "draft";

  return {
    async listPapers(query) {
      return {
        rows: [
          createPaper({
            profession: query.profession ?? "monopoly",
            level: query.level ?? 3,
          }),
        ],
        total: 1,
      };
    },
    async createPaper(input, context) {
      mutationContexts.push({ operation: "paper.create", context });
      return createPaper({
        name: input.name,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        paper_type: input.paperType,
        year: input.year,
        month: input.month,
        source: input.sourceDescription,
        source_region: input.sourceRegion,
        source_organization: input.sourceOrganization,
        question_basis: input.questionBasis,
        generation_method: input.generationMethod,
        duration_minute: input.durationMinute,
        total_score: input.totalScore,
        paper_sections: [],
      });
    },
    async findPaperByPublicId(publicId) {
      return createPaper({
        public_id: publicId,
        paper_status: currentPaperStatus,
      });
    },
    async updatePaper(input, context) {
      mutationContexts.push({ operation: "paper.update", context });
      return createPaper({ public_id: input.publicId, name: input.name });
    },
    async addQuestionToDraftPaper(input, context) {
      mutationContexts.push({ operation: "paper_question.add", context });
      return createPaperQuestion({
        source_question_public_id: input.questionPublicId,
        score: input.score,
        sort_order: input.sortOrder,
      });
    },
    async updatePaperQuestion(input, context) {
      mutationContexts.push({ operation: "paper_question.update", context });
      return createPaperQuestion({
        public_id: input.paperQuestionPublicId,
        score: input.score,
        sort_order: input.sortOrder,
      });
    },
    async removePaperQuestion(_input, context) {
      mutationContexts.push({ operation: "paper_question.remove", context });
      return createPaper({ paper_sections: [] });
    },
    async mutatePaperSections(_input, context) {
      mutationContexts.push({ operation: "paper_section.mutate", context });
      return createPaper({ revision: 2 });
    },
    async mutateQuestionGroups(_input, context) {
      mutationContexts.push({ operation: "question_group.mutate", context });
      return createPaper({ revision: 2 });
    },
    async publishPaper(input, context) {
      mutationContexts.push({ operation: "paper.publish", context });
      currentPaperStatus = "published";

      return createPaper({
        public_id: input.paperPublicId,
        paper_status: "published",
        published_at: createdAt,
      });
    },
    async archivePaper(input, context) {
      mutationContexts.push({ operation: "paper.archive", context });
      currentPaperStatus = "archived";

      return createPaper({
        public_id: input.paperPublicId,
        paper_status: "archived",
        published_at: createdAt,
        archived_at: createdAt,
      });
    },
    async deletePaper(_input, context) {
      mutationContexts.push({ operation: "paper.delete", context });
      return true;
    },
    async copyPaper(_input, context) {
      mutationContexts.push({ operation: "paper.copy", context });
      return createPaper({
        public_id: "paper-copy-public-001",
        name: "专卖理论模拟卷（副本）",
        paper_status: "draft",
      });
    },
  };
}

function createPaperAssetRepository(
  deleteMutationContexts: unknown[] = [],
  createMutationContexts: unknown[] = [],
): PaperAssetRepository {
  let preparedInput:
    | Parameters<
        NonNullable<PaperAssetRepository["preparePaperAssetUpload"]>
      >[0]
    | undefined;

  return {
    async preparePaperAssetUpload(input) {
      preparedInput = input;

      return {
        status: "prepared",
        operation: {
          publicId: "paper-asset-upload-operation-phase-9",
          paperAssetPublicId: "paper-asset-public-001",
          objectKey: input.objectKey,
        },
      };
    },
    async markPaperAssetUploadFileStored() {
      return true;
    },
    async completePaperAssetUpload(input) {
      if (preparedInput === undefined) {
        throw new Error("Paper asset upload was not prepared.");
      }

      createMutationContexts.push(input.mutationContext);
      return {
        status: "completed",
        replayed: false,
        paperAsset: createPaperAsset({
          paper_public_id: preparedInput.paperPublicId,
          paper_attachment_usage: preparedInput.paperAttachmentUsage,
          file_name: preparedInput.fileName,
          object_key: preparedInput.objectKey,
          content_type: preparedInput.contentType,
          file_size_byte: preparedInput.fileSizeByte,
          file_hash: preparedInput.fileHash,
        }),
      };
    },
    async recordPaperAssetUploadFailure() {},
    async listPaperAssets(query) {
      return {
        rows: [
          createPaperAsset({
            paper_public_id: query.paperPublicId ?? "paper-public-001",
          }),
        ],
        total: 1,
      };
    },
    async findPaperAssetByPublicId(publicId) {
      return createPaperAsset({ public_id: publicId });
    },
    async deletePaperAsset(_publicId, context) {
      deleteMutationContexts.push(context);
      return true;
    },
  };
}

function createRepositories(
  auditLogEntries: unknown[] = [],
  mutationContexts: unknown[] = [],
  paperAssetDeleteMutationContexts: unknown[] = [],
  paperAssetCreateMutationContexts: unknown[] = [],
): PaperCompositionLifecycleRuntimeRepositories {
  return {
    paperRepository: createPaperRepository(mutationContexts),
    paperAssetRepository: createPaperAssetRepository(
      paperAssetDeleteMutationContexts,
      paperAssetCreateMutationContexts,
    ),
    auditLogRepository: {
      async appendAuditLog(input) {
        auditLogEntries.push(input);
      },
    },
  };
}

const paperInput = {
  name: "专卖理论模拟卷",
  profession: "monopoly",
  level: 3,
  subject: "theory",
  paperType: "mock_paper",
  year: 2026,
  month: null,
  sourceDescription: null,
  sourceRegion: null,
  sourceOrganization: null,
  questionBasis: null,
  generationMethod: "manual",
  durationMinute: 90,
  totalScore: "5.0",
};

const paperAssetInput = {
  commandPublicId: "paper-asset-command-phase-9-001",
  paperPublicId: "paper-public-001",
  paperAttachmentUsage: "paper_source",
  profession: "monopoly",
  fileName: "monopoly-theory.pdf",
  contentType: "application/pdf",
  fileContent: "controlled phase 9 paper asset",
};

describe("phase 9 paper composition lifecycle runtime", () => {
  it("requires an authenticated content admin session before returning paper data", async () => {
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("content_admin"),
    });

    const response = await handlers.papers.detail.GET(
      new Request("http://localhost/api/v1/papers/paper-public-001"),
      { params: Promise.resolve({ publicId: "paper-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
  });

  it("rejects non-content admin paper mutations and records a redacted audit failure", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries),
      sessionService: createSessionService("ops_admin"),
    });

    const response = await handlers.papers.collection.POST(
      new Request("http://localhost/api/v1/papers", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          ...paperInput,
          commandPublicId: "paper-command-create-001",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403621,
      message: "Admin permission denied.",
      data: null,
    });
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "paper.create",
        targetResourceType: "paper",
        targetPublicId: null,
        resultStatus: "failed",
      }),
    ]);
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
  });

  it("applies the existing content-admin boundary to paper structure commands", async () => {
    const mutationContexts: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: createRepositories([], mutationContexts),
      sessionService: createSessionService("content_admin"),
    });
    const response = await handlers.papers.paperSections.POST(
      new Request(
        "http://localhost/api/v1/papers/paper-public-001/paper-sections",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
          body: JSON.stringify({
            action: "create",
            expectedRevision: 1,
            title: "案例分析",
            description: null,
            sortOrder: 1,
          }),
        },
      ),
      { params: Promise.resolve({ publicId: "paper-public-001" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { paper: { revision: 2 } },
    });
    expect(mutationContexts).toEqual([
      {
        operation: "paper_section.mutate",
        context: expect.objectContaining({
          actorPublicId: "admin-public-001",
          auditLog: expect.objectContaining({
            actionType: "paper_section.mutate",
            targetResourceType: "paper",
          }),
        }),
      },
    ]);

    const wrongMethodResponse = await handlers.papers.paperSections.POST(
      new Request(
        "http://localhost/api/v1/papers/paper-public-001/paper-sections",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
          body: JSON.stringify({
            action: "delete",
            expectedRevision: 1,
            paperSectionPublicId: "paper_section_public_201",
          }),
        },
      ),
      { params: Promise.resolve({ publicId: "paper-public-001" }) },
    );
    await expect(wrongMethodResponse.json()).resolves.toMatchObject({
      code: 422203,
      data: null,
    });
    expect(mutationContexts).toHaveLength(1);
  });

  it("composes, publishes, archives, and copies paper runtime with public identifiers only", async () => {
    const auditLogEntries: unknown[] = [];
    const mutationContexts: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries, mutationContexts),
      sessionService: createSessionService("content_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };
    const paperContext = {
      params: Promise.resolve({ publicId: "paper-public-001" }),
    };

    const createPaperResponse = await handlers.papers.collection.POST(
      new Request("http://localhost/api/v1/papers", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...paperInput,
          commandPublicId: "paper-command-create-002",
        }),
      }),
    );
    const updatePaperResponse = await handlers.papers.detail.PATCH(
      new Request("http://localhost/api/v1/papers/paper-public-001", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          ...paperInput,
          expectedRevision: 1,
        }),
      }),
      paperContext,
    );
    const addQuestionResponse = await handlers.papers.questions.POST(
      new Request("http://localhost/api/v1/papers/paper-public-001/questions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          commandPublicId: "paper-command-add-001",
          expectedRevision: 1,
          questionPublicId: "question-public-001",
          score: "5.0",
          sortOrder: 1,
          paperSection: {
            title: "单选题",
            description: null,
            sortOrder: 1,
          },
          questionGroup: null,
        }),
      }),
      paperContext,
    );
    const publishResponse = await handlers.papers.publish.POST(
      new Request("http://localhost/api/v1/papers/paper-public-001/publish", {
        method: "POST",
        headers,
        body: JSON.stringify({
          commandPublicId: "paper-command-publish-001",
          expectedRevision: 1,
        }),
      }),
      paperContext,
    );
    const archiveResponse = await handlers.papers.archive.POST(
      new Request("http://localhost/api/v1/papers/paper-public-001/archive", {
        method: "POST",
        headers,
        body: JSON.stringify({ expectedRevision: 1 }),
      }),
      paperContext,
    );
    const copyResponse = await handlers.papers.copy.POST(
      new Request("http://localhost/api/v1/papers/paper-public-001/copy", {
        method: "POST",
        headers,
        body: JSON.stringify({
          commandPublicId: "paper-command-copy-001",
          expectedRevision: 1,
        }),
      }),
      paperContext,
    );

    const payload = {
      createPaper: await createPaperResponse.json(),
      updatePaper: await updatePaperResponse.json(),
      addQuestion: await addQuestionResponse.json(),
      publish: await publishResponse.json(),
      archive: await archiveResponse.json(),
      copy: await copyResponse.json(),
    };

    expect(payload.createPaper).toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper-public-001",
          paperStatus: "draft",
        },
      },
    });
    expect(payload.updatePaper).toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper-public-001",
          paperStatus: "draft",
        },
      },
    });
    expect(payload.addQuestion).toMatchObject({
      code: 0,
      data: {
        paperQuestion: {
          publicId: "paper-question-public-001",
          sourceQuestionPublicId: "question-public-001",
        },
      },
    });
    expect(payload.publish).toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper-public-001",
          paperStatus: "published",
        },
        lockedQuestionPublicIds: ["question-public-001"],
      },
    });
    expect(payload.archive).toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper-public-001",
          paperStatus: "archived",
        },
      },
    });
    expect(payload.copy).toMatchObject({
      code: 0,
      data: {
        copiedFromPaperPublicId: "paper-public-001",
        paper: {
          publicId: "paper-copy-public-001",
          paperStatus: "draft",
        },
      },
    });

    const serializedPayload = JSON.stringify(payload);
    expect(serializedPayload).not.toContain('"id"');
    expect(serializedPayload).not.toContain("paper_id");
    expect(serializedPayload).not.toContain("admin-session-token");
    expect(auditLogEntries).toEqual([]);
    expect(mutationContexts).toEqual([
      {
        operation: "paper.create",
        context: {
          actorPublicId: "admin-public-001",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper.create",
            targetResourceType: "paper",
            metadataSummary: "redacted paper mutation metadata",
            requestIp: null,
          },
        },
      },
      {
        operation: "paper.update",
        context: {
          actorPublicId: "admin-public-001",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper.update",
            targetResourceType: "paper",
            metadataSummary: "redacted paper mutation metadata",
            requestIp: null,
          },
        },
      },
      {
        operation: "paper_question.add",
        context: {
          actorPublicId: "admin-public-001",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper_question.add",
            targetResourceType: "paper_question",
            metadataSummary: "redacted paper_question mutation metadata",
            requestIp: null,
          },
        },
      },
      {
        operation: "paper.publish",
        context: {
          actorPublicId: "admin-public-001",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper.publish",
            targetResourceType: "paper",
            metadataSummary: "redacted paper mutation metadata",
            requestIp: null,
          },
        },
      },
      {
        operation: "paper.archive",
        context: {
          actorPublicId: "admin-public-001",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper.archive",
            targetResourceType: "paper",
            metadataSummary: "redacted paper mutation metadata",
            requestIp: null,
          },
        },
      },
      {
        operation: "paper.copy",
        context: {
          actorPublicId: "admin-public-001",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper.copy",
            targetResourceType: "paper",
            metadataSummary: "redacted paper mutation metadata",
            requestIp: null,
          },
        },
      },
    ]);
  });

  it("records failed database commands outside the transaction without duplicating success audits", async () => {
    const auditLogEntries: unknown[] = [];
    const mutationContexts: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries, mutationContexts),
      sessionService: createSessionService("content_admin"),
    });

    const response = await handlers.papers.collection.POST(
      new Request("http://localhost/api/v1/papers", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({}),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 422203,
      data: null,
    });
    expect(mutationContexts).toEqual([]);
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "paper.create",
        targetResourceType: "paper",
        targetPublicId: null,
        resultStatus: "failed",
        metadataSummary: "redacted paper mutation metadata",
      }),
    ]);
  });

  it("manages paper_asset metadata without exposing object keys or secrets", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-phase-9-paper-asset-"),
    );
    const auditLogEntries: unknown[] = [];
    const paperAssetDeleteMutationContexts: unknown[] = [];
    const paperAssetCreateMutationContexts: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      localPaperAssetStorageRoot: storageRoot,
      repositories: createRepositories(
        auditLogEntries,
        [],
        paperAssetDeleteMutationContexts,
        paperAssetCreateMutationContexts,
      ),
      sessionService: createSessionService("content_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };
    const paperAssetContext = {
      params: Promise.resolve({ publicId: "paper-asset-public-001" }),
    };
    const formData = new FormData();

    formData.set("commandPublicId", paperAssetInput.commandPublicId);
    formData.set("paperPublicId", paperAssetInput.paperPublicId);
    formData.set("paperAttachmentUsage", paperAssetInput.paperAttachmentUsage);
    formData.set("profession", paperAssetInput.profession);
    formData.set("fileName", paperAssetInput.fileName);
    formData.set(
      "file",
      new File([paperAssetInput.fileContent], paperAssetInput.fileName, {
        type: paperAssetInput.contentType,
      }),
    );

    const createAssetResponse = await handlers.paperAssets.collection.POST(
      new Request("http://localhost/api/v1/paper-assets", {
        method: "POST",
        headers,
        body: formData,
      }),
    );
    const listAssetResponse = await handlers.paperAssets.collection.GET(
      new Request(
        "http://localhost/api/v1/paper-assets?paperPublicId=paper-public-001",
        { headers },
      ),
    );
    const deleteAssetResponse = await handlers.paperAssets.detail.DELETE(
      new Request(
        "http://localhost/api/v1/paper-assets/paper-asset-public-001",
        {
          method: "DELETE",
          headers,
        },
      ),
      paperAssetContext,
    );

    const payload = {
      createAsset: await createAssetResponse.json(),
      listAsset: await listAssetResponse.json(),
      deleteAsset: await deleteAssetResponse.json(),
    };

    expect(payload.createAsset).toMatchObject({
      code: 0,
      data: {
        paperAsset: {
          publicId: "paper-asset-public-001",
          paperPublicId: "paper-public-001",
          paperAttachmentUsage: "paper_source",
        },
      },
    });
    expect(payload.listAsset).toMatchObject({
      code: 0,
      data: [
        {
          publicId: "paper-asset-public-001",
          fileHash: "abc123def4567890abc123def4567890",
        },
      ],
    });
    expect(payload.deleteAsset).toEqual({
      code: 0,
      message: "ok",
      data: {
        deletedPaperAssetPublicId: "paper-asset-public-001",
      },
    });

    const serializedPayload = JSON.stringify(payload);
    const serializedAuditLogEntries = JSON.stringify(auditLogEntries);

    expect(serializedPayload).not.toContain("objectKey");
    expect(serializedPayload).not.toContain("dev/paper-asset");
    expect(serializedPayload).not.toContain('"id"');
    expect(serializedAuditLogEntries).not.toContain("admin-session-token");
    expect(serializedAuditLogEntries).not.toContain("dev/paper-asset");
    expect(serializedAuditLogEntries).not.toContain("secret");
    expect(auditLogEntries).toEqual([]);
    expect(paperAssetCreateMutationContexts).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        auditLog: expect.objectContaining({
          actorRole: "content_admin",
          actionType: "paper_asset.create",
          metadataSummary: "redacted paper_asset mutation metadata",
          requestIp: null,
        }),
      }),
    ]);
    expect(paperAssetDeleteMutationContexts).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        auditLog: expect.objectContaining({
          actorRole: "content_admin",
          actionType: "paper_asset.delete",
          metadataSummary: "redacted paper_asset mutation metadata",
          requestIp: null,
        }),
      }),
    ]);
  });

  it.each(["super_admin", "content_admin"] as const)(
    "downloads private paper_asset bytes for the existing %s boundary",
    async (role) => {
      const bytes = Buffer.from("private paper bytes");
      const repositories = createRepositories();
      repositories.paperAssetRepository.findPaperAssetByPublicId = vi.fn(
        async () =>
          createPaperAsset({
            file_hash: "a".repeat(64),
            file_name: '../危险"\r\nname.pdf',
            file_size_byte: bytes.byteLength,
            object_key: `dev/paper-asset/monopoly/202605/${"a".repeat(64)}.pdf`,
          }),
      );
      const readPaperAssetFile = vi.fn(async () => bytes);
      const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
        readPaperAssetFile,
        repositories,
        sessionService: createSessionService(role),
      });

      const response = await handlers.paperAssets.download.GET(
        new Request(
          "http://localhost/api/v1/paper-assets/paper-asset-public-001/download",
          { headers: { authorization: "Bearer admin-session-token" } },
        ),
        { params: Promise.resolve({ publicId: "paper-asset-public-001" }) },
      );

      expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("content-type")).toBe("application/pdf");
      expect(response.headers.get("content-length")).toBe(String(bytes.length));
      expect(response.headers.get("content-disposition")).toMatch(
        /^attachment; filename="[^"\r\n\\/]+"; filename\*=UTF-8''/u,
      );
      expect(response.headers.get("content-disposition")).not.toContain("危险");
      expect(readPaperAssetFile).toHaveBeenCalledWith(
        expect.objectContaining({
          fileHash: "a".repeat(64),
          objectKey: `dev/paper-asset/monopoly/202605/${"a".repeat(64)}.pdf`,
          profession: "monopoly",
        }),
      );
    },
  );

  it.each([
    ["anonymous", createSessionService("content_admin"), {}],
    [
      "ops_admin-only",
      createSessionService("ops_admin"),
      { authorization: "Bearer admin-session-token" },
    ],
    [
      "student",
      {
        async getCurrentSession() {
          return {
            code: 0,
            message: "ok",
            data: {
              session: { expiresAt: "2026-05-23T10:00:00.000Z" },
              user: {
                publicId: "student-public-001",
                phone: "13800000001",
                name: "Student",
                userType: null,
                status: "active" as const,
                lockedUntilAt: null,
                employeePublicId: null,
                organizationPublicId: null,
                adminPublicId: null,
                adminRoles: [],
              },
            },
          };
        },
      },
      { authorization: "Bearer admin-session-token" },
    ],
  ] as const)(
    "rejects %s before paper_asset metadata or storage access",
    async (_label, sessionService, headers) => {
      const repositories = createRepositories();
      const findPaperAsset = vi.fn(async () => createPaperAsset());
      const readPaperAssetFile = vi.fn(async () => Buffer.from("secret"));
      repositories.paperAssetRepository.findPaperAssetByPublicId =
        findPaperAsset;
      const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
        readPaperAssetFile,
        repositories,
        sessionService,
      });

      const response = await handlers.paperAssets.download.GET(
        new Request(
          "http://localhost/api/v1/paper-assets/paper-asset-public-001/download",
          { headers },
        ),
        { params: Promise.resolve({ publicId: "paper-asset-public-001" }) },
      );

      expect([401, 403]).toContain(((await response.json()).code / 1000) | 0);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(findPaperAsset).not.toHaveBeenCalled();
      expect(readPaperAssetFile).not.toHaveBeenCalled();
    },
  );

  it("fails closed for malformed IDs, missing metadata, and unavailable bytes", async () => {
    const repositories = createRepositories();
    const findPaperAsset = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createPaperAsset())
      .mockRejectedValueOnce(new Error("database connection details"));
    const readPaperAssetFile = vi.fn(async () => {
      throw new Error("C:\\private\\absolute\\path");
    });
    repositories.paperAssetRepository.findPaperAssetByPublicId = findPaperAsset;
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      readPaperAssetFile,
      repositories,
      sessionService: createSessionService("content_admin"),
    });
    const request = () =>
      new Request("http://localhost/api/v1/paper-assets/x/download", {
        headers: { authorization: "Bearer admin-session-token" },
      });

    const malformed = await handlers.paperAssets.download.GET(request(), {
      params: Promise.resolve({ publicId: "../escape" }),
    });
    const missing = await handlers.paperAssets.download.GET(request(), {
      params: Promise.resolve({ publicId: "paper-asset-missing" }),
    });
    const unavailable = await handlers.paperAssets.download.GET(request(), {
      params: Promise.resolve({ publicId: "paper-asset-corrupt" }),
    });
    const metadataUnavailable = await handlers.paperAssets.download.GET(
      request(),
      { params: Promise.resolve({ publicId: "paper-asset-db-error" }) },
    );

    expect(await malformed.json()).toMatchObject({ code: 404204, data: null });
    expect(await missing.json()).toMatchObject({ code: 404204, data: null });
    const unavailablePayload = await unavailable.json();
    expect(unavailablePayload).toMatchObject({ code: 503204, data: null });
    expect(await metadataUnavailable.json()).toMatchObject({
      code: 503204,
      data: null,
    });
    expect(
      [malformed, missing, unavailable, metadataUnavailable].every(
        (response) => response.headers.get("cache-control") === "no-store",
      ),
    ).toBe(true);
    expect(JSON.stringify(unavailablePayload)).not.toContain("private");
    expect(findPaperAsset).toHaveBeenCalledTimes(3);
  });
});
