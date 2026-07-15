import { describe, expect, it } from "vitest";

import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import { createContentQuestionMaterialRuntimeRouteHandlers } from "@/server/services/content-question-material-runtime";
import type { SessionService } from "@/server/services/session-service";
import type { ContentQuestionMaterialRuntimeRepositories } from "@/server/services/content-question-material-runtime";
import type { QuestionAccessRow } from "@/server/repositories/question-repository";

const createdAt = new Date("2026-05-23T02:00:00.000Z");

function createAdminSessionService(
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
            name: "AI Admin",
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

function createQuestionRow(
  overrides: Partial<QuestionAccessRow> = {},
): QuestionAccessRow {
  return {
    id: 201,
    public_id: "question-public-001",
    question_type: "short_answer",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    stem_rich_text: "<p>许可证办理需要核验哪些材料？</p>",
    analysis_rich_text: "<p>老师解析：核验申请主体和材料完整性。</p>",
    standard_answer_rich_text: "<p>核验申请材料、身份信息和经营场所。</p>",
    status: "available",
    is_locked: false,
    locked_at: null,
    multi_choice_rule: "all_correct_only",
    scoring_method: "ai_scoring",
    material_id: null,
    material_public_id: null,
    question_options: [],
    scoring_points: [],
    knowledge_node_public_ids: [],
    tag_public_ids: [],
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createQuestionRecommendationRepositories(input: {
  auditLogEntries: unknown[];
  aiCallLogEntries: unknown[];
}): ContentQuestionMaterialRuntimeRepositories {
  return {
    questionRepository: {
      async listQuestions() {
        return { rows: [createQuestionRow()], total: 1 };
      },
      async createQuestion() {
        return createQuestionRow();
      },
      async findQuestionByPublicId(publicId) {
        return createQuestionRow({ public_id: publicId });
      },
      async updateQuestion(updateInput) {
        return createQuestionRow({ public_id: updateInput.publicId });
      },
      async disableQuestion(publicId) {
        return createQuestionRow({ public_id: publicId, status: "disabled" });
      },
      async copyQuestion(publicId) {
        return createQuestionRow({ public_id: `${publicId}-copy` });
      },
    },
    materialRepository: {
      async listMaterials() {
        return { rows: [], total: 0 };
      },
      async createMaterial() {
        throw new Error("not used");
      },
      async findMaterialByPublicId() {
        return null;
      },
      async updateMaterial() {
        throw new Error("not used");
      },
      async disableMaterial() {
        return null;
      },
      async copyMaterial() {
        return null;
      },
    },
    knowledgeNodeRepository: {
      async listKnowledgeNodes(query) {
        return {
          knowledgeNodes: [
            {
              publicId: "knowledge-node-public-authorization",
              parentKnowledgeNodePublicId: null,
              profession:
                query.profession === "all" ? "monopoly" : query.profession,
              levelList: [3],
              name: "许可证办理",
              pathName: "专卖/证件管理/许可证办理",
              sortOrder: 10,
              knStatus: "active",
              questionCount: 0,
              isRecommendable: true,
              updatedAt: createdAt.toISOString(),
            },
            {
              publicId: "knowledge-node-public-disabled",
              parentKnowledgeNodePublicId: null,
              profession: "monopoly",
              levelList: [3],
              name: "停用知识点",
              pathName: "专卖/停用知识点",
              sortOrder: 20,
              knStatus: "disabled",
              questionCount: 0,
              isRecommendable: true,
              updatedAt: createdAt.toISOString(),
            },
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 2,
          },
        };
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditLogEntries.push(auditLogInput);
      },
    },
    aiCallLogRepository: {
      async appendAiCallLog(aiCallLogInput) {
        input.aiCallLogEntries.push(aiCallLogInput);

        return {
          publicId: "ai-call-log-public-kn",
          userPublicId: aiCallLogInput.userPublicId,
          organizationPublicId: null,
          profession: null,
          level: null,
          aiFuncType: aiCallLogInput.aiFuncType,
          callStatus: aiCallLogInput.callStatus,
          providerDisplayName:
            aiCallLogInput.modelConfigSnapshot.providerDisplayName,
          modelAlias: aiCallLogInput.modelConfigSnapshot.modelName,
          promptSummary: "redacted prompt and question snapshot",
          outputSummary: "redacted knowledge recommendation snapshot",
          promptTokenCount: aiCallLogInput.promptTokenCount,
          completionTokenCount: aiCallLogInput.completionTokenCount,
          totalTokenCount: aiCallLogInput.totalTokenCount,
          estimatedCostCny: "0.00",
          latencyMs: aiCallLogInput.latencyMs,
          startedAt: aiCallLogInput.startedAt.toISOString(),
          completedAt: aiCallLogInput.completedAt?.toISOString() ?? null,
        };
      },
    },
    knowledgeRecommendationRepository: {
      async requestKnowledgeRecommendation() {
        return {
          taskPublicId: "kn-recommendation-task-public-001",
          questionPublicId: "question-public-001",
          questionUpdatedAt: createdAt.toISOString(),
          currentQuestionUpdatedAt: createdAt.toISOString(),
          taskStatus: "pending",
          evidenceStatus: null,
          modelConfigPublicId: null,
          promptTemplatePublicId: null,
          failureCode: null,
          candidates: [],
        };
      },
      async completeKnowledgeRecommendationTask() {
        throw new Error("not used");
      },
      async reviewKnowledgeRecommendationTask() {
        throw new Error("not used");
      },
    },
  } as ContentQuestionMaterialRuntimeRepositories;
}

describe("phase 9 AI knowledge and model config runtime", () => {
  it("creates a durable pending recommendation task without fabricated model output", async () => {
    const auditLogEntries: unknown[] = [];
    const aiCallLogEntries: unknown[] = [];
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createQuestionRecommendationRepositories({
        auditLogEntries,
        aiCallLogEntries,
      }),
      sessionService: createAdminSessionService("content_admin"),
    });

    const response = await handlers.questions.recommendKnowledgeNodes.POST(
      new Request(
        "http://localhost/api/v1/questions/question-public-001/recommend-knowledge-nodes",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      { params: Promise.resolve({ publicId: "question-public-001" }) },
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        recommendation: {
          questionPublicId: "question-public-001",
          recommendationStatus: "pending",
          reviewState: {
            taskPublicId: "kn-recommendation-task-public-001",
            taskStatus: "pending",
          },
          modelConfig: null,
          recommendations: [],
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("apiKey");
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "question.recommend_knowledge_nodes",
        targetResourceType: "question",
        targetPublicId: "question-public-001",
        resultStatus: "success",
      }),
    ]);
    expect(aiCallLogEntries).toEqual([]);
    expect(JSON.stringify(aiCallLogEntries)).not.toContain("许可证办理需要");
    expect(JSON.stringify(aiCallLogEntries)).not.toContain("核验申请材料");
  });

  it("enables and disables model configs for super admins and audits by public id only", async () => {
    const mutationCalls: unknown[] = [];
    const auditLogEntries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        async listModelConfigs() {
          return {
            modelConfigs: [],
            pagination: {
              page: 1,
              pageSize: 20,
              sortBy: "updatedAt",
              sortOrder: "desc",
              total: 0,
            },
          };
        },
        async listAiCallLogs() {
          return {
            aiCallLogs: [],
            pagination: {
              page: 1,
              pageSize: 20,
              sortBy: "updatedAt",
              sortOrder: "desc",
              total: 0,
            },
          };
        },
        async summarizeAiCallLogs() {
          return {
            dailySummaries: [],
            pagination: {
              page: 1,
              pageSize: 20,
              sortBy: "updatedAt",
              sortOrder: "desc",
              total: 0,
            },
          };
        },
        async appendAiCallLog() {
          throw new Error("not used");
        },
        async enableModelConfig(publicId) {
          mutationCalls.push({ action: "enable", publicId });
          return true;
        },
        async disableModelConfig(publicId) {
          mutationCalls.push({ action: "disable", publicId });
          return true;
        },
        async appendAuditLog(auditLogInput) {
          auditLogEntries.push(auditLogInput);
        },
      },
      sessionService: createAdminSessionService("super_admin"),
    });
    const headers = { authorization: "Bearer admin-session-token" };

    const enableResponse = await handlers.modelConfigs.enable.POST(
      new Request(
        "http://localhost/api/v1/model-configs/model-config-public-001/enable",
        { method: "POST", headers },
      ),
      { params: Promise.resolve({ publicId: "model-config-public-001" }) },
    );
    const disableResponse = await handlers.modelConfigs.disable.POST(
      new Request(
        "http://localhost/api/v1/model-configs/model-config-public-001/disable",
        { method: "POST", headers },
      ),
      { params: Promise.resolve({ publicId: "model-config-public-001" }) },
    );

    await expect(enableResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    await expect(disableResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
    expect(mutationCalls).toEqual([
      { action: "enable", publicId: "model-config-public-001" },
      { action: "disable", publicId: "model-config-public-001" },
    ]);
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "model_config.enable",
        targetResourceType: "model_config",
        targetPublicId: "model-config-public-001",
        resultStatus: "success",
      }),
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "model_config.disable",
        targetResourceType: "model_config",
        targetPublicId: "model-config-public-001",
        resultStatus: "success",
      }),
    ]);
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
    expect(JSON.stringify(auditLogEntries)).not.toContain("secret");
  });

  it("denies model config mutation for non-super admins and records a redacted audit failure", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: {
        async listModelConfigs() {
          throw new Error("not used");
        },
        async listAiCallLogs() {
          throw new Error("not used");
        },
        async summarizeAiCallLogs() {
          throw new Error("not used");
        },
        async appendAiCallLog() {
          throw new Error("not used");
        },
        async enableModelConfig() {
          throw new Error("non-super admin must not mutate model_config");
        },
        async disableModelConfig() {
          throw new Error("non-super admin must not mutate model_config");
        },
        async appendAuditLog(auditLogInput) {
          auditLogEntries.push(auditLogInput);
        },
      },
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.modelConfigs.enable.POST(
      new Request(
        "http://localhost/api/v1/model-configs/model-config-public-001/enable",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      { params: Promise.resolve({ publicId: "model-config-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403641,
      message: "Admin permission denied.",
      data: null,
    });
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        actionType: "model_config.enable",
        targetResourceType: "model_config",
        targetPublicId: "model-config-public-001",
        resultStatus: "failed",
      }),
    ]);
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
  });
});
