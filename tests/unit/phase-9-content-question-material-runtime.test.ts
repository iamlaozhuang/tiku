import { describe, expect, it } from "vitest";

import {
  createContentQuestionMaterialRuntimeRouteHandlers,
  type ContentQuestionMaterialRuntimeRepositories,
} from "@/server/services/content-question-material-runtime";
import type { SessionService } from "@/server/services/session-service";
import type {
  MaterialAccessRow,
  MaterialRepository,
} from "@/server/repositories/material-repository";
import type {
  QuestionAccessRow,
  QuestionRepository,
} from "@/server/repositories/question-repository";

const createdAt = new Date("2026-05-23T01:00:00.000Z");

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
            expiresAt: "2026-05-23T09:00:00.000Z",
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

function createMaterialRow(
  overrides: Partial<MaterialAccessRow> = {},
): MaterialAccessRow {
  return {
    id: 101,
    public_id: "material-public-001",
    title: "证件管理案例",
    content_rich_text: "<p>案例材料正文</p>",
    profession: "monopoly",
    level: 3,
    subject: "skill",
    status: "available",
    is_locked: false,
    locked_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createQuestionRow(
  overrides: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 201,
    public_id: "question-public-001",
    question_type: "single_choice",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    stem_rich_text: "<p>许可证办理首要步骤是什么？</p>",
    analysis_rich_text: "<p>老师解析</p>",
    standard_answer_rich_text: "<p>A</p>",
    status: "available",
    is_locked: false,
    locked_at: null,
    multi_choice_rule: "all_correct_only",
    scoring_method: "auto_match",
    material_id: 101,
    material_public_id: "material-public-001",
    question_options: [
      {
        id: 301,
        question_id: 201,
        label: "A",
        content_rich_text: "<p>核验材料</p>",
        is_correct: true,
        sort_order: 1,
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    scoring_points: [],
    knowledge_node_public_ids: [],
    tag_public_ids: [],
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createQuestionRepository(): QuestionRepository {
  return {
    async listQuestions(query) {
      return {
        rows: [
          createQuestionRow({
            profession: query.profession ?? "monopoly",
            level: query.level ?? 3,
            material_public_id: query.materialPublicId ?? "material-public-001",
            knowledge_node_public_ids:
              query.knowledgeNodePublicId === null
                ? []
                : [query.knowledgeNodePublicId],
            tag_public_ids:
              query.tagPublicId === null ? [] : [query.tagPublicId],
          }),
        ],
        total: 1,
      };
    },
    async createQuestion(input) {
      return createQuestionRow({
        question_type: input.questionType,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        stem_rich_text: input.stemRichText,
        material_public_id: input.materialPublicId,
      });
    },
    async findQuestionByPublicId(publicId) {
      return createQuestionRow({ public_id: publicId });
    },
    async updateQuestion(input) {
      return createQuestionRow({
        public_id: input.publicId,
        stem_rich_text: input.stemRichText,
        status: input.status,
      });
    },
    async disableQuestion(publicId) {
      return createQuestionRow({ public_id: publicId, status: "disabled" });
    },
    async copyQuestion(publicId) {
      return createQuestionRow({
        public_id: `${publicId}-copy`,
        is_locked: false,
        locked_at: null,
      });
    },
  };
}

function createMaterialRepository(): MaterialRepository {
  return {
    async listMaterials(query) {
      return {
        rows: [
          createMaterialRow({
            profession: query.profession ?? "monopoly",
            level: query.level ?? 3,
          }),
        ],
        total: 1,
      };
    },
    async createMaterial(input) {
      return createMaterialRow({
        title: input.title,
        content_rich_text: input.contentRichText,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
      });
    },
    async findMaterialByPublicId(publicId) {
      return createMaterialRow({ public_id: publicId });
    },
    async updateMaterial(input) {
      return createMaterialRow({
        public_id: input.publicId,
        title: input.title,
        status: input.status,
      });
    },
    async disableMaterial(publicId) {
      return createMaterialRow({ public_id: publicId, status: "disabled" });
    },
    async copyMaterial(publicId) {
      return createMaterialRow({
        public_id: `${publicId}-copy`,
        is_locked: false,
        locked_at: null,
      });
    },
  };
}

function createRepositories(
  auditLogEntries: unknown[] = [],
): ContentQuestionMaterialRuntimeRepositories {
  return {
    questionRepository: createQuestionRepository(),
    materialRepository: createMaterialRepository(),
    knowledgeNodeRepository: {
      async listKnowledgeNodes(query) {
        return {
          knowledgeNodes: [
            {
              publicId: "knowledge-node-public-001",
              parentKnowledgeNodePublicId: null,
              profession:
                query.profession === "all" ? "monopoly" : query.profession,
              levelList: [3],
              name: "许可证办理",
              pathName: "专卖/证件管理/许可证办理",
              sortOrder: 10,
              knStatus: "active",
              questionCount: 1,
              isRecommendable: true,
              updatedAt: createdAt.toISOString(),
            },
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 1,
          },
        };
      },
    },
    tagRepository: {
      async listTags() {
        return {
          tags: [
            {
              publicId: "tag-public-001",
              name: "证件办理",
            },
          ],
        };
      },
    },
    auditLogRepository: {
      async appendAuditLog(input) {
        auditLogEntries.push(input);
      },
    },
  };
}

const questionInput = {
  questionType: "single_choice",
  profession: "monopoly",
  level: 3,
  subject: "theory",
  stemRichText: "<p>许可证办理首要步骤是什么？</p>",
  analysisRichText: "<p>老师解析</p>",
  standardAnswerRichText: "<p>A</p>",
  multiChoiceRule: "all_correct_only",
  scoringMethod: "auto_match",
  materialPublicId: "material-public-001",
  questionOptions: [
    {
      label: "A",
      contentRichText: "<p>核验材料</p>",
      isCorrect: true,
      sortOrder: 1,
    },
    {
      label: "B",
      contentRichText: "<p>直接办理</p>",
      isCorrect: false,
      sortOrder: 2,
    },
  ],
  scoringPoints: [],
};

describe("phase 9 content question material runtime", () => {
  it("forwards material keyword and pagination filters to the repository", async () => {
    const repositories = createRepositories();
    let capturedQuery:
      | Parameters<typeof repositories.materialRepository.listMaterials>[0]
      | null = null;
    const originalListMaterials = repositories.materialRepository.listMaterials;

    repositories.materialRepository.listMaterials = async (query) => {
      capturedQuery = query;
      return originalListMaterials(query);
    };

    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories,
      sessionService: createSessionService("content_admin"),
    });
    const response = await handlers.materials.collection.GET(
      new Request(
        "http://localhost/api/v1/materials?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc&keyword=case&profession=marketing&level=3&subject=theory&status=available",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );

    expect(response.status).toBe(200);
    expect(capturedQuery).toEqual(
      expect.objectContaining({
        page: 2,
        pageSize: 50,
        sortBy: "updatedAt",
        sortOrder: "asc",
        keyword: "case",
        profession: "marketing",
        level: 3,
        subject: "theory",
        status: "available",
      }),
    );
  });

  it("requires an authenticated admin session before returning content data", async () => {
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("content_admin"),
    });

    const response = await handlers.questions.collection.GET(
      new Request("http://localhost/api/v1/questions"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
  });

  it("returns readable tag options only to authenticated content administrators", async () => {
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("content_admin"),
    });

    const unauthorizedResponse = await handlers.tags.collection.GET(
      new Request("http://localhost/api/v1/tags"),
    );
    await expect(unauthorizedResponse.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });

    const response = await handlers.tags.collection.GET(
      new Request("http://localhost/api/v1/tags", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        tags: [
          {
            publicId: "tag-public-001",
            name: "证件办理",
          },
        ],
      },
    });
    expect(JSON.stringify(payload)).not.toContain('"id"');
  });

  it("rejects non-content admin mutations and records a redacted audit failure", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries),
      sessionService: createSessionService("ops_admin"),
    });

    const response = await handlers.questions.collection.POST(
      new Request("http://localhost/api/v1/questions", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify(questionInput),
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
        actionType: "question.create",
        targetResourceType: "question",
        targetPublicId: null,
        resultStatus: "failed",
      }),
    ]);
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
  });

  it("rejects semantic-empty question and material payloads through the API envelope", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries),
      sessionService: createSessionService("content_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const questionResponse = await handlers.questions.collection.POST(
      new Request("http://localhost/api/v1/questions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...questionInput,
          stemRichText: "<p><br></p>",
        }),
      }),
    );
    const materialResponse = await handlers.materials.collection.POST(
      new Request("http://localhost/api/v1/materials", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: "Semantic empty material",
          contentRichText:
            "<table><tr><th></th></tr><tr><td></td></tr></table>",
          profession: "monopoly",
          level: 3,
          subject: "skill",
        }),
      }),
    );

    await expect(questionResponse.json()).resolves.toEqual({
      code: 422202,
      message: "Invalid question input.",
      data: null,
    });
    await expect(materialResponse.json()).resolves.toEqual({
      code: 422201,
      message: "Invalid material input.",
      data: null,
    });
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "question.create",
        resultStatus: "failed",
        targetPublicId: null,
      }),
      expect.objectContaining({
        actionType: "material.create",
        resultStatus: "failed",
        targetPublicId: null,
      }),
    ]);
    expect(JSON.stringify(auditLogEntries)).not.toContain("<table>");
    expect(JSON.stringify(auditLogEntries)).not.toContain("<p><br></p>");
  });

  it("returns question, material, and knowledge-node data with public identifiers only", async () => {
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("content_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const questionsResponse = await handlers.questions.collection.GET(
      new Request(
        "http://localhost/api/v1/questions?page=2&pageSize=50&knowledgeNodePublicId=knowledge-node-public-001&tagPublicId=tag-public-001&materialPublicId=material-public-filtered",
        {
          headers,
        },
      ),
    );
    const materialsResponse = await handlers.materials.collection.GET(
      new Request("http://localhost/api/v1/materials?page=1&pageSize=20", {
        headers,
      }),
    );
    const knowledgeNodesResponse = await handlers.knowledgeNodes.GET(
      new Request(
        "http://localhost/api/v1/knowledge-nodes?page=1&pageSize=20",
        { headers },
      ),
    );

    const payload = {
      questions: await questionsResponse.json(),
      materials: await materialsResponse.json(),
      knowledgeNodes: await knowledgeNodesResponse.json(),
    };

    expect(payload.questions).toMatchObject({
      code: 0,
      data: [
        {
          publicId: "question-public-001",
          materialPublicId: "material-public-filtered",
          knowledgeNodePublicIds: ["knowledge-node-public-001"],
          tagPublicIds: ["tag-public-001"],
        },
      ],
      pagination: {
        page: 2,
        pageSize: 50,
        total: 1,
      },
    });
    expect(payload.materials).toMatchObject({
      code: 0,
      data: [
        {
          publicId: "material-public-001",
          title: "证件管理案例",
        },
      ],
    });
    expect(payload.knowledgeNodes).toMatchObject({
      code: 0,
      data: {
        knowledgeNodes: [
          {
            publicId: "knowledge-node-public-001",
            parentKnowledgeNodePublicId: null,
            questionCount: 1,
          },
        ],
      },
    });

    const serializedPayload = JSON.stringify(payload);
    expect(serializedPayload).not.toContain('"id"');
    expect(serializedPayload).not.toContain("material_id");
    expect(serializedPayload).not.toContain("question_id");
    expect(serializedPayload).not.toContain("admin-session-token");
  });

  it("audits successful question and material mutations without exposing secrets", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createRepositories(auditLogEntries),
      sessionService: createSessionService("content_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    await handlers.questions.collection.POST(
      new Request("http://localhost/api/v1/questions", {
        method: "POST",
        headers,
        body: JSON.stringify(questionInput),
      }),
    );
    await handlers.questions.detail.PATCH(
      new Request("http://localhost/api/v1/questions/question-public-001", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ ...questionInput, status: "available" }),
      }),
      { params: Promise.resolve({ publicId: "question-public-001" }) },
    );
    await handlers.questions.disable.POST(
      new Request(
        "http://localhost/api/v1/questions/question-public-001/disable",
        { method: "POST", headers },
      ),
      { params: Promise.resolve({ publicId: "question-public-001" }) },
    );
    await handlers.questions.copy.POST(
      new Request(
        "http://localhost/api/v1/questions/question-public-001/copy",
        {
          method: "POST",
          headers,
        },
      ),
      { params: Promise.resolve({ publicId: "question-public-001" }) },
    );
    await handlers.materials.collection.POST(
      new Request("http://localhost/api/v1/materials", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: "证件管理案例",
          contentRichText: "<p>案例材料正文</p>",
          profession: "monopoly",
          level: 3,
          subject: "skill",
        }),
      }),
    );

    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "question.create",
        targetResourceType: "question",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actionType: "question.update",
        targetResourceType: "question",
        targetPublicId: "question-public-001",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actionType: "question.disable",
        targetResourceType: "question",
        targetPublicId: "question-public-001",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actionType: "question.copy",
        targetResourceType: "question",
        targetPublicId: "question-public-001",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actionType: "material.create",
        targetResourceType: "material",
        resultStatus: "success",
      }),
    ]);

    const serializedAuditLogEntries = JSON.stringify(auditLogEntries);
    expect(serializedAuditLogEntries).not.toContain("admin-session-token");
    expect(serializedAuditLogEntries).not.toContain("password");
    expect(serializedAuditLogEntries).not.toContain("secret");
  });
});
