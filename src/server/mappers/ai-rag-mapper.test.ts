import { describe, expect, it } from "vitest";

import {
  createModelConfigSnapshot,
  type AiCallLogRow,
  type KnowledgeBaseRow,
  type KnowledgeNodeRow,
  type ResourceRow,
} from "../models/ai-rag";
import {
  mapAiCallLogToApi,
  mapKnowledgeBaseToApi,
  mapKnowledgeNodeToApi,
  mapResourceToApi,
} from "./ai-rag-mapper";

const startedAt = new Date("2026-05-20T08:00:00.000Z");
const completedAt = new Date("2026-05-20T08:00:01.000Z");

describe("AI/RAG API mappers", () => {
  it("maps AI call log rows to camelCase DTOs without numeric ids", () => {
    const aiCallLog = {
      id: 100,
      public_id: "ai_call_log_public_id",
      user_public_id: "user_public_id",
      answer_record_public_id: "answer_record_public_id",
      mock_exam_public_id: "mock_exam_public_id",
      question_public_id: "question_public_id",
      ai_func_type: "scoring",
      call_status: "failed",
      model_config_id: 2,
      prompt_template_id: 3,
      model_config_snapshot: createModelConfigSnapshot({
        providerPublicId: "model_provider_public_id",
        providerKey: "qwen",
        providerDisplayName: "Qwen",
        modelConfigPublicId: "model_config_public_id",
        aiFuncType: "scoring",
        modelName: "qwen-max",
        displayName: "Qwen Max Scoring",
        configVersion: 3,
        timeoutSecond: 60,
        maxRetryCount: 0,
        fallbackModelConfigPublicId: null,
        promptTemplateKey: "ai_scoring_v1",
        promptTemplateVersion: 1,
      }),
      prompt_template_key: "ai_scoring_v1",
      prompt_template_version: 1,
      request_redacted_snapshot: { prompt: { redactionStatus: "redacted" } },
      response_redacted_snapshot: null,
      error_redacted_snapshot: { message: { redactionStatus: "redacted" } },
      citation_redacted_snapshot: { citations: [] },
      prompt_token_count: 100,
      completion_token_count: null,
      total_token_count: null,
      latency_ms: 1000,
      started_at: startedAt,
      completed_at: completedAt,
      created_at: startedAt,
    } satisfies AiCallLogRow;

    const dto = mapAiCallLogToApi(aiCallLog);

    expect(dto).toEqual({
      publicId: "ai_call_log_public_id",
      userPublicId: "user_public_id",
      answerRecordPublicId: "answer_record_public_id",
      mockExamPublicId: "mock_exam_public_id",
      questionPublicId: "question_public_id",
      aiFuncType: "scoring",
      callStatus: "failed",
      modelConfigSnapshot: aiCallLog.model_config_snapshot,
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
      requestRedactedSnapshot: aiCallLog.request_redacted_snapshot,
      responseRedactedSnapshot: null,
      errorRedactedSnapshot: aiCallLog.error_redacted_snapshot,
      citationRedactedSnapshot: aiCallLog.citation_redacted_snapshot,
      promptTokenCount: 100,
      completionTokenCount: null,
      totalTokenCount: null,
      latencyMs: 1000,
      startedAt: "2026-05-20T08:00:00.000Z",
      completedAt: "2026-05-20T08:00:01.000Z",
      createdAt: "2026-05-20T08:00:00.000Z",
    });
    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("modelConfigId");
    expect(dto).not.toHaveProperty("promptTemplateId");
  });

  it("maps RAG resource and knowledge rows to camelCase DTOs without numeric ids", () => {
    const knowledgeBase = {
      id: 20,
      public_id: "knowledge_base_public_id",
      profession: "marketing",
      display_name: "Marketing Knowledge Base",
      description: null,
      is_enabled: true,
      created_at: startedAt,
      updated_at: completedAt,
    } satisfies KnowledgeBaseRow;

    const resource = {
      id: 21,
      public_id: "resource_public_id",
      knowledge_base_id: 20,
      resource_type: "textbook",
      resource_status: "published",
      title: "Marketing Basics",
      original_file_name: "marketing-basics.docx",
      object_storage_path: "dev/resource/marketing/202605/file-hash.docx",
      content_hash: "content_hash",
      file_size_byte: 1024,
      profession: "marketing",
      level: 3,
      markdown_content: "# Marketing Basics",
      markdown_content_hash: "markdown_hash",
      conversion_error_message: null,
      indexing_error_message: null,
      is_vector_stale: false,
      published_at: completedAt,
      disabled_at: null,
      created_at: startedAt,
      updated_at: completedAt,
    } satisfies ResourceRow;

    const knowledgeNode = {
      id: 22,
      public_id: "knowledge_node_public_id",
      knowledge_base_id: 20,
      parent_knowledge_node_id: null,
      profession: "marketing",
      level_list: [3, 4],
      name: "Market research",
      path_name: "Marketing / Market research",
      depth: 2,
      sort_order: 10,
      kn_status: "active",
      is_recommendable: true,
      created_at: startedAt,
      updated_at: completedAt,
      disabled_at: null,
    } satisfies KnowledgeNodeRow;

    expect(mapKnowledgeBaseToApi(knowledgeBase)).toEqual({
      publicId: "knowledge_base_public_id",
      profession: "marketing",
      displayName: "Marketing Knowledge Base",
      description: null,
      isEnabled: true,
      createdAt: "2026-05-20T08:00:00.000Z",
      updatedAt: "2026-05-20T08:00:01.000Z",
    });

    const resourceDto = mapResourceToApi(resource, {
      knowledgeBasePublicId: "knowledge_base_public_id",
    });
    expect(resourceDto).toEqual({
      publicId: "resource_public_id",
      knowledgeBasePublicId: "knowledge_base_public_id",
      resourceType: "textbook",
      resourceStatus: "published",
      title: "Marketing Basics",
      originalFileName: "marketing-basics.docx",
      objectStoragePath: "dev/resource/marketing/202605/file-hash.docx",
      contentHash: "content_hash",
      fileSizeByte: 1024,
      profession: "marketing",
      level: 3,
      markdownContentHash: "markdown_hash",
      conversionErrorMessage: null,
      indexingErrorMessage: null,
      isVectorStale: false,
      publishedAt: "2026-05-20T08:00:01.000Z",
      disabledAt: null,
      createdAt: "2026-05-20T08:00:00.000Z",
      updatedAt: "2026-05-20T08:00:01.000Z",
    });
    expect(resourceDto).not.toHaveProperty("id");
    expect(resourceDto).not.toHaveProperty("knowledgeBaseId");
    expect(resourceDto).not.toHaveProperty("markdownContent");

    const knowledgeNodeDto = mapKnowledgeNodeToApi(knowledgeNode, {
      knowledgeBasePublicId: "knowledge_base_public_id",
      parentKnowledgeNodePublicId: null,
    });
    expect(knowledgeNodeDto).toEqual({
      publicId: "knowledge_node_public_id",
      knowledgeBasePublicId: "knowledge_base_public_id",
      parentKnowledgeNodePublicId: null,
      profession: "marketing",
      levelList: [3, 4],
      name: "Market research",
      pathName: "Marketing / Market research",
      depth: 2,
      sortOrder: 10,
      knStatus: "active",
      isRecommendable: true,
      createdAt: "2026-05-20T08:00:00.000Z",
      updatedAt: "2026-05-20T08:00:01.000Z",
      disabledAt: null,
    });
    expect(knowledgeNodeDto).not.toHaveProperty("id");
    expect(knowledgeNodeDto).not.toHaveProperty("knowledgeBaseId");
    expect(knowledgeNodeDto).not.toHaveProperty("parentKnowledgeNodeId");
  });
});
