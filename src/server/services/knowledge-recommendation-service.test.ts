import { describe, expect, it, vi } from "vitest";

import {
  createKnowledgeNodeSnapshot,
  createModelConfigSnapshot,
  type KnowledgeNodeSnapshot,
} from "../models/ai-rag";
import {
  createKnowledgeRecommendationService,
  type KnowledgeRecommendationContext,
  type KnowledgeRecommendationRunner,
} from "./knowledge-recommendation-service";

const modelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model_provider_public_123",
  providerKey: "baseline_provider",
  providerDisplayName: "Baseline Provider",
  modelConfigPublicId: "model_config_public_kn",
  aiFuncType: "kn_recommendation",
  modelName: "baseline-kn-model",
  displayName: "Baseline knowledge recommendation model",
  configVersion: 5,
  timeoutSecond: 60,
  maxRetryCount: 1,
  fallbackModelConfigPublicId: "model_config_public_kn_fallback",
  promptTemplateKey: "kn_recommendation_v1",
  promptTemplateVersion: 1,
});

function createKnowledgeNode(
  overrides: Partial<KnowledgeNodeSnapshot>,
): KnowledgeNodeSnapshot {
  return createKnowledgeNodeSnapshot({
    public_id: overrides.publicId ?? "knowledge_node_public_default",
    parent_knowledge_node_public_id:
      overrides.parentKnowledgeNodePublicId ?? null,
    profession: overrides.profession ?? "marketing",
    level_list: overrides.levelList ?? [3],
    name: overrides.name ?? "Customer research",
    path_name: overrides.pathName ?? "Marketing / Customer research",
    depth: overrides.depth ?? 2,
    sort_order: overrides.sortOrder ?? 10,
    kn_status: overrides.knStatus ?? "active",
    is_recommendable: overrides.isRecommendable ?? true,
  });
}

const activeKnowledgeNode = createKnowledgeNode({
  publicId: "knowledge_node_public_customer_research",
  name: "Customer research",
  pathName: "Marketing / Customer research",
  sortOrder: 10,
});

const secondActiveKnowledgeNode = createKnowledgeNode({
  publicId: "knowledge_node_public_demand_forecast",
  name: "Demand forecast",
  pathName: "Marketing / Demand forecast",
  sortOrder: 20,
});

const disabledKnowledgeNode = createKnowledgeNode({
  publicId: "knowledge_node_public_disabled",
  name: "Disabled node",
  pathName: "Marketing / Disabled node",
  knStatus: "disabled",
  sortOrder: 30,
});

const notRecommendableKnowledgeNode = createKnowledgeNode({
  publicId: "knowledge_node_public_not_recommendable",
  name: "Historical node",
  pathName: "Marketing / Historical node",
  isRecommendable: false,
  sortOrder: 40,
});

const levelMismatchKnowledgeNode = createKnowledgeNode({
  publicId: "knowledge_node_public_level_mismatch",
  name: "Level mismatch",
  pathName: "Marketing / Level mismatch",
  levelList: [4],
  sortOrder: 50,
});

const context: KnowledgeRecommendationContext = {
  userPublicId: "user_public_content_teacher",
  questionPublicId: "question_public_123",
  questionRevisionPublicId: "question_revision_public_123",
  questionText: "卷烟零售客户需求预测通常需要分析哪些因素？",
  analysis: "本题考查客户需求预测的基础分析要素。",
  standardAnswer: "应分析历史销量、客户经营状态、商圈变化和季节因素。",
  profession: "marketing",
  level: 3,
  knowledgeNodeSnapshots: [
    activeKnowledgeNode,
    secondActiveKnowledgeNode,
    disabledKnowledgeNode,
    notRecommendableKnowledgeNode,
    levelMismatchKnowledgeNode,
  ],
  modelConfigSnapshot,
  promptTemplate: {
    promptTemplateKey: "kn_recommendation_v1",
    version: 1,
    templateHash: "kn_recommendation_v1_baseline",
  },
};

function createRunner(
  result: Awaited<ReturnType<KnowledgeRecommendationRunner>>,
): KnowledgeRecommendationRunner {
  return vi.fn(async () => result);
}

function expectNoSensitiveMarkerLeaks(
  serializedValue: string,
  markers: string[],
): void {
  expect(markers.map((marker) => serializedValue.includes(marker))).toEqual(
    markers.map(() => false),
  );
}

describe("knowledge recommendation service", () => {
  it("recommends up to five active recommendable knowledge nodes and locks snapshots", async () => {
    const runner = createRunner({
      recommendations: [
        {
          knowledgeNodePublicId: activeKnowledgeNode.publicId,
          confidence: "high",
          reason: "Question focuses on customer research inputs.",
        },
        {
          knowledgeNodePublicId: secondActiveKnowledgeNode.publicId,
          confidence: "medium",
          reason: "Demand forecast is related to the answer.",
        },
        {
          knowledgeNodePublicId: disabledKnowledgeNode.publicId,
          confidence: "high",
          reason: "Disabled nodes must be ignored.",
        },
        {
          knowledgeNodePublicId: notRecommendableKnowledgeNode.publicId,
          confidence: "high",
          reason: "Non-recommendable nodes must be ignored.",
        },
        {
          knowledgeNodePublicId: levelMismatchKnowledgeNode.publicId,
          confidence: "high",
          reason: "Level mismatch nodes must be ignored.",
        },
      ],
      providerRequestPayload: {
        prompt: "raw prompt must be redacted",
        knowledgeTree: [activeKnowledgeNode.pathName],
      },
      providerResponsePayload: {
        output: "raw recommendation output must be redacted",
      },
    });
    const service = createKnowledgeRecommendationService({ runner });

    const result = await service.recommendKnowledgeNodes(context);

    expect(runner).toHaveBeenCalledWith(
      expect.objectContaining({
        questionText: context.questionText,
        analysis: context.analysis,
        standardAnswer: context.standardAnswer,
        profession: "marketing",
        level: 3,
        knowledgeNodeSnapshots: [
          activeKnowledgeNode,
          secondActiveKnowledgeNode,
        ],
        modelConfigSnapshot,
        promptTemplate: context.promptTemplate,
      }),
    );
    expect(result).toMatchObject({
      recommendationStatus: "recommended",
      modelConfigSnapshot,
      promptTemplateKey: "kn_recommendation_v1",
      promptTemplateVersion: 1,
      aiCallLogDraft: {
        callStatus: "success",
      },
    });
    expect(result.recommendations).toHaveLength(2);
    expect(result.recommendations[0]).toMatchObject({
      knowledgeNodeSnapshot: activeKnowledgeNode,
      confidence: "high",
      confirmationStatus: "pending_confirmation",
      source: "ai_recommended",
    });
    expect(result.recommendations[1]).toMatchObject({
      knowledgeNodeSnapshot: secondActiveKnowledgeNode,
      confidence: "medium",
    });
    expect(JSON.stringify(result.recommendations)).not.toContain(
      disabledKnowledgeNode.publicId,
    );
    expect(JSON.stringify(result.recommendations)).not.toContain(
      notRecommendableKnowledgeNode.publicId,
    );
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      context.questionText,
    );
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      activeKnowledgeNode.pathName,
    );
    expect(JSON.stringify(result.aiCallLogDraft)).not.toContain(
      "raw recommendation output must be redacted",
    );
  });

  it("returns an empty non-blocking result when the current knowledge tree is empty", async () => {
    const runner = createRunner({
      recommendations: [
        {
          knowledgeNodePublicId: activeKnowledgeNode.publicId,
          confidence: "high",
          reason: "should not be called",
        },
      ],
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createKnowledgeRecommendationService({ runner });

    const result = await service.recommendKnowledgeNodes({
      ...context,
      knowledgeNodeSnapshots: [],
    });

    expect(runner).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      recommendationStatus: "recommended",
      recommendations: [],
      aiCallLogDraft: null,
    });
  });

  it("caps runner output to five recommendations and normalizes invalid confidence", async () => {
    const eligibleKnowledgeNodes = Array.from({ length: 6 }, (_, index) =>
      createKnowledgeNode({
        publicId: `knowledge_node_public_${index}`,
        name: `Node ${index}`,
        pathName: `Marketing / Node ${index}`,
        sortOrder: index,
      }),
    );
    const runner = createRunner({
      recommendations: eligibleKnowledgeNodes.map((knowledgeNode, index) => ({
        knowledgeNodePublicId: knowledgeNode.publicId,
        confidence: index === 0 ? "unexpected" : "high",
        reason: `Reason ${index}`,
      })),
      providerRequestPayload: null,
      providerResponsePayload: null,
    });
    const service = createKnowledgeRecommendationService({ runner });

    const result = await service.recommendKnowledgeNodes({
      ...context,
      knowledgeNodeSnapshots: eligibleKnowledgeNodes,
    });

    expect(result.recommendations).toHaveLength(5);
    expect(result.recommendations[0]?.confidence).toBe("low");
    expect(result.recommendations[4]?.knowledgeNodeSnapshot.publicId).toBe(
      "knowledge_node_public_4",
    );
  });

  it("returns a non-blocking failed result and redacted error when the runner fails", async () => {
    const sensitiveContext = {
      ...context,
      questionText: "kn sensitive question marker 3fb7",
      analysis: "kn sensitive analysis marker 67de",
      standardAnswer: "kn sensitive standard answer marker e2a9",
    };
    const providerErrorMarker = "provider recommendation error marker b4d1";
    const runner: KnowledgeRecommendationRunner = vi.fn(async () => {
      throw new Error(providerErrorMarker);
    });
    const service = createKnowledgeRecommendationService({ runner });

    const result = await service.recommendKnowledgeNodes(sensitiveContext);
    const serializedCallLogDraft = JSON.stringify(result.aiCallLogDraft);

    expect(result).toMatchObject({
      recommendationStatus: "recommendation_failed",
      recommendations: [],
      failureReason: "recommendation_runner_failed",
      aiCallLogDraft: {
        callStatus: "failed",
      },
    });
    expect(result.aiCallLogDraft?.requestRedactedSnapshot).toMatchObject({
      prompt: {
        redactionStatus: "redacted",
        reason: "prompt",
      },
      question: {
        redactionStatus: "redacted",
        reason: "user_answer",
      },
      providerRequestPayload: {
        redactionStatus: "redacted",
        reason: "provider_payload",
      },
    });
    expect(result.aiCallLogDraft?.responseRedactedSnapshot).toBeNull();
    expect(result.aiCallLogDraft?.errorRedactedSnapshot).toMatchObject({
      providerErrorPayload: {
        redactionStatus: "redacted",
        reason: "provider_payload",
      },
    });
    expectNoSensitiveMarkerLeaks(serializedCallLogDraft, [
      sensitiveContext.questionText,
      sensitiveContext.analysis,
      sensitiveContext.standardAnswer,
      activeKnowledgeNode.pathName,
      providerErrorMarker,
    ]);
  });
});
