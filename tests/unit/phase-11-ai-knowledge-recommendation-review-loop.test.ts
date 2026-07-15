import { describe, expect, it } from "vitest";

import {
  createContentQuestionMaterialRuntimeRouteHandlers,
  type ContentQuestionMaterialRuntimeRepositories,
} from "@/server/services/content-question-material-runtime";
import type { SessionService } from "@/server/services/session-service";
import type { QuestionAccessRow } from "@/server/repositories/question-repository";

const createdAt = new Date("2026-05-24T08:00:00.000Z");

function createSessionService(): Pick<SessionService, "getCurrentSession"> {
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
            expiresAt: "2026-05-24T12:00:00.000Z",
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
            adminRoles: ["content_admin"],
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
    stem_rich_text: "<p>authorization application bounded fixture</p>",
    analysis_rich_text: "<p>redacted analysis fixture</p>",
    standard_answer_rich_text: "<p>redacted answer fixture</p>",
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

function createRepositories(input: {
  auditLogEntries: unknown[];
  aiCallLogEntries: unknown[];
  reviewInputs: unknown[];
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
              name: "authorization",
              pathName: "monopoly / authorization",
              sortOrder: 10,
              knStatus: "active",
              questionCount: 0,
              isRecommendable: true,
              updatedAt: createdAt.toISOString(),
            },
            {
              publicId: "knowledge-node-public-inactive",
              parentKnowledgeNodePublicId: null,
              profession: "monopoly",
              levelList: [3],
              name: "inactive",
              pathName: "monopoly / inactive",
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
        return null;
      },
    },
    knowledgeRecommendationRepository: {
      async requestKnowledgeRecommendation() {
        return {
          taskPublicId: "kn-recommendation-task-public-001",
          questionPublicId: "question-public-001",
          questionUpdatedAt: createdAt.toISOString(),
          currentQuestionUpdatedAt: createdAt.toISOString(),
          taskStatus: "succeeded",
          evidenceStatus: "sufficient",
          modelConfigPublicId: "model-config-public-kn-001",
          promptTemplatePublicId: "prompt-template-public-kn-001",
          failureCode: null,
          candidates: [
            {
              candidatePublicId: "kn-recommendation-candidate-public-001",
              knowledgeNodePublicId: "knowledge-node-public-authorization",
              name: "authorization",
              pathName: "monopoly / authorization",
              rank: 1,
              confidenceBasisPoint: 9_000,
              reasonSummary: "citation-backed recommendation",
              citationCount: 2,
              reviewStatus: "pending",
            },
          ],
        };
      },
      async completeKnowledgeRecommendationTask() {
        throw new Error("not used");
      },
      async reviewKnowledgeRecommendationTask(reviewInput) {
        input.reviewInputs.push(reviewInput);
        return {
          taskPublicId: "kn-recommendation-task-public-001",
          questionPublicId: "question-public-001",
          questionUpdatedAt: createdAt.toISOString(),
          currentQuestionUpdatedAt: new Date(
            createdAt.getTime() + 1,
          ).toISOString(),
          taskStatus: "succeeded",
          evidenceStatus: "sufficient",
          modelConfigPublicId: "model-config-public-kn-001",
          promptTemplatePublicId: "prompt-template-public-kn-001",
          failureCode: null,
          candidates: [
            {
              candidatePublicId: "kn-recommendation-candidate-public-001",
              knowledgeNodePublicId: "knowledge-node-public-authorization",
              name: "authorization",
              pathName: "monopoly / authorization",
              rank: 1,
              confidenceBasisPoint: 9_000,
              reasonSummary: "citation-backed recommendation",
              citationCount: 2,
              reviewStatus: "confirmed",
            },
          ],
        };
      },
    },
  };
}

describe("phase 11 AI knowledge recommendation review loop", () => {
  it("returns durable review metadata and persists confirm without fabricated call logs", async () => {
    const auditLogEntries: unknown[] = [];
    const aiCallLogEntries: unknown[] = [];
    const reviewInputs: unknown[] = [];
    const handlers = createContentQuestionMaterialRuntimeRouteHandlers({
      repositories: createRepositories({
        auditLogEntries,
        aiCallLogEntries,
        reviewInputs,
      }),
      sessionService: createSessionService(),
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
          recommendationStatus: "recommended",
          reviewState: {
            questionUpdatedAt: "2026-05-24T08:00:00.000Z",
            taskPublicId: "kn-recommendation-task-public-001",
            taskStatus: "succeeded",
            staleCheck: "question_updated_at_mismatch",
            bindingMode: "durable_question_binding",
          },
          recommendations: [
            {
              candidatePublicId: "kn-recommendation-candidate-public-001",
              knowledgeNodePublicId: "knowledge-node-public-authorization",
              confidence: "high",
              source: "ai_recommended",
              confirmationStatus: "pending_confirmation",
            },
          ],
        },
      },
    });
    const reviewResponse =
      await handlers.questions.recommendKnowledgeNodes.POST(
        new Request(
          "http://localhost/api/v1/questions/question-public-001/recommend-knowledge-nodes",
          {
            method: "POST",
            headers: {
              authorization: "Bearer admin-session-token",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              action: "confirm",
              taskPublicId: "kn-recommendation-task-public-001",
              expectedQuestionUpdatedAt: createdAt.toISOString(),
              candidatePublicIds: ["kn-recommendation-candidate-public-001"],
            }),
          },
        ),
        { params: Promise.resolve({ publicId: "question-public-001" }) },
      );
    const reviewPayload = await reviewResponse.json();

    expect(reviewPayload).toMatchObject({
      code: 0,
      data: {
        recommendation: {
          reviewState: {
            taskPublicId: "kn-recommendation-task-public-001",
          },
          recommendations: [
            {
              candidatePublicId: "kn-recommendation-candidate-public-001",
              confirmationStatus: "confirmed",
              citationCount: 2,
            },
          ],
        },
      },
    });
    expect(reviewInputs).toEqual([
      expect.objectContaining({
        taskPublicId: "kn-recommendation-task-public-001",
        questionPublicId: "question-public-001",
        action: "confirm",
      }),
    ]);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("providerRequestPayload");
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "question.recommend_knowledge_nodes",
        targetResourceType: "question",
        targetPublicId: "question-public-001",
        resultStatus: "success",
        metadataSummary: "redacted knowledge recommendation operation metadata",
      }),
      expect.objectContaining({
        actionType: "question.recommend_knowledge_nodes",
        targetResourceType: "question",
        targetPublicId: "question-public-001",
        resultStatus: "success",
      }),
    ]);
    expect(aiCallLogEntries).toHaveLength(0);
    expect(JSON.stringify(aiCallLogEntries)).not.toContain(
      "authorization application bounded fixture",
    );
    expect(JSON.stringify(aiCallLogEntries)).not.toContain(
      "redacted answer fixture",
    );
  });
});
