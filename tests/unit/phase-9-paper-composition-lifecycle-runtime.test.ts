import { describe, expect, it } from "vitest";

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
    source: null,
    duration_minute: 90,
    total_score: "5.0",
    published_at: null,
    archived_at: null,
    paper_sections: [
      {
        id: 201,
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

function createPaperRepository(): PaperDraftRepository {
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
    async createPaper(input) {
      return createPaper({
        name: input.name,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        paper_type: input.paperType,
        year: input.year,
        source: input.source,
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
    async updatePaper(input) {
      return createPaper({ public_id: input.publicId, name: input.name });
    },
    async addQuestionToDraftPaper(input) {
      return createPaperQuestion({
        source_question_public_id: input.questionPublicId,
        score: input.score,
        sort_order: input.sortOrder,
      });
    },
    async updatePaperQuestion(input) {
      return createPaperQuestion({
        public_id: input.paperQuestionPublicId,
        score: input.score,
        sort_order: input.sortOrder,
      });
    },
    async removePaperQuestion() {
      return createPaper({ paper_sections: [] });
    },
    async publishPaper(input) {
      currentPaperStatus = "published";

      return createPaper({
        public_id: input.paperPublicId,
        paper_status: "published",
        published_at: createdAt,
      });
    },
    async archivePaper(input) {
      currentPaperStatus = "archived";

      return createPaper({
        public_id: input.paperPublicId,
        paper_status: "archived",
        published_at: createdAt,
        archived_at: createdAt,
      });
    },
    async deletePaper() {
      return true;
    },
    async copyPaper() {
      return createPaper({
        public_id: "paper-copy-public-001",
        name: "专卖理论模拟卷（副本）",
        paper_status: "draft",
      });
    },
  };
}

function createPaperAssetRepository(): PaperAssetRepository {
  return {
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
    async createPaperAsset(input) {
      return createPaperAsset({
        paper_public_id: input.paperPublicId,
        paper_attachment_usage: input.paperAttachmentUsage,
        file_name: input.fileName,
        object_key: input.objectKey,
        content_type: input.contentType,
        file_size_byte: input.fileSizeByte,
        file_hash: input.fileHash,
      });
    },
    async findPaperAssetByPublicId(publicId) {
      return createPaperAsset({ public_id: publicId });
    },
    async deletePaperAsset() {
      return true;
    },
  };
}

function createRepositories(
  auditLogEntries: unknown[] = [],
): PaperCompositionLifecycleRuntimeRepositories {
  return {
    paperRepository: createPaperRepository(),
    paperAssetRepository: createPaperAssetRepository(),
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
  source: null,
  durationMinute: 90,
  totalScore: "5.0",
};

const paperAssetInput = {
  paperPublicId: "paper-public-001",
  paperAttachmentUsage: "paper_source",
  fileName: "monopoly-theory.pdf",
  objectKey:
    "dev/paper-asset/monopoly/202605/abc123def4567890abc123def4567890.pdf",
  contentType: "application/pdf",
  fileSizeByte: 2048,
  fileHash: "abc123def4567890abc123def4567890",
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

  it("composes, publishes, archives, and copies paper runtime with public identifiers only", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries),
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
    expect(auditLogEntries).toEqual([
      expect.objectContaining({ actionType: "paper.create" }),
      expect.objectContaining({ actionType: "paper_question.add" }),
      expect.objectContaining({ actionType: "paper.publish" }),
      expect.objectContaining({ actionType: "paper.archive" }),
      expect.objectContaining({ actionType: "paper.copy" }),
    ]);
  });

  it("manages paper_asset metadata without exposing object keys or secrets", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createPaperCompositionLifecycleRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries),
      sessionService: createSessionService("content_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };
    const paperAssetContext = {
      params: Promise.resolve({ publicId: "paper-asset-public-001" }),
    };

    const createAssetResponse = await handlers.paperAssets.collection.POST(
      new Request("http://localhost/api/v1/paper-assets", {
        method: "POST",
        headers,
        body: JSON.stringify(paperAssetInput),
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
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "paper_asset.create",
        targetResourceType: "paper_asset",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actionType: "paper_asset.delete",
        targetResourceType: "paper_asset",
        targetPublicId: "paper-asset-public-001",
        resultStatus: "success",
      }),
    ]);
  });
});
