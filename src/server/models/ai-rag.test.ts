import { describe, expect, it } from "vitest";

import {
  aiCallStatusValues,
  aiFuncTypeValues,
  assertKnowledgeNodeDepth,
  aiScoringAttemptStatusValues,
  canTransitionResourceStatus,
  createAiCallLogRedactedSnapshots,
  createAiScoringAttemptSnapshot,
  createFailureMessageDigest,
  createKnowledgeNodeSnapshot,
  createModelConfigSnapshot,
  getResourceLevelRank,
  isResourceLevelEligible,
  isResourceRagEligible,
  knStatusValues,
  resourceStatusValues,
  resourceTypeValues,
  normalizeResourceLevelList,
  type AiScoringAttemptRow,
  type AiCallLogRow,
  type KnowledgeBaseRow,
  type KnowledgeNodeRow,
  type ModelConfigRow,
  type ModelProviderRow,
  type PromptTemplateRow,
  type ResourceRow,
} from "./ai-rag";

const createdAt = new Date("2026-05-20T08:00:00.000Z");
const modelConfigSnapshot = createModelConfigSnapshot({
  providerPublicId: "model_config_provider_public_123",
  providerKey: "baseline_provider",
  providerDisplayName: "Baseline Provider",
  modelConfigPublicId: "model_config_public_123",
  aiFuncType: "scoring",
  modelName: "baseline-scoring-model",
  displayName: "Baseline scoring model",
  configVersion: 3,
  timeoutSecond: 60,
  maxRetryCount: 3,
  fallbackModelConfigPublicId: null,
  promptTemplateKey: "ai_scoring_v1",
  promptTemplateVersion: 1,
});

describe("AI/RAG domain models", () => {
  it("normalizes resource level coverage and fails closed for unknown coverage", () => {
    expect(normalizeResourceLevelList([5, 3, 3, 4])).toEqual([3, 4, 5]);
    expect(normalizeResourceLevelList([])).toEqual([]);
    expect(normalizeResourceLevelList(null)).toBeNull();
    expect(() => normalizeResourceLevelList([0, 3])).toThrow(
      "resource level_list must contain levels between 1 and 5",
    );
    expect(isResourceLevelEligible(null, 3)).toBe(false);
    expect(isResourceLevelEligible([], 3)).toBe(true);
    expect(isResourceLevelEligible([3, 4], 3)).toBe(true);
    expect(isResourceLevelEligible([4, 5], 3)).toBe(false);
    expect(isResourceLevelEligible([3, 3], 3)).toBe(false);
    expect(isResourceLevelEligible([4, 3], 3)).toBe(false);
    expect(isResourceLevelEligible([3, 6], 3)).toBe(false);
    expect(getResourceLevelRank([3], 3)).toBe(0);
    expect(getResourceLevelRank([3, 4], 3)).toBe(1);
    expect(getResourceLevelRank([], 3)).toBe(2);
  });

  it("exports AI function types from the schema boundary", () => {
    expect(aiFuncTypeValues).toEqual([
      "scoring",
      "explanation",
      "hint",
      "kn_recommendation",
      "learning_suggestion",
    ]);
  });

  it("exports AI call statuses from the schema boundary", () => {
    expect(aiCallStatusValues).toEqual(["success", "failed"]);
  });

  it("exports AI scoring attempt statuses from the schema boundary", () => {
    expect(aiScoringAttemptStatusValues).toEqual([
      "pending",
      "running",
      "succeeded",
      "failed",
      "timeout",
      "cancelled",
    ]);
  });

  it("exports RAG resource and knowledge enums from the schema boundary", () => {
    expect(resourceTypeValues).toEqual([
      "textbook",
      "courseware",
      "knowledge_doc",
      "lecture_note",
      "other",
    ]);
    expect(resourceStatusValues).toEqual([
      "uploaded",
      "converting",
      "conversion_failed",
      "draft",
      "published",
      "indexing",
      "index_failed",
      "rag_ready",
      "disabled",
    ]);
    expect(knStatusValues).toEqual(["active", "disabled"]);
  });

  it("keeps provider, config, and template rows in snake_case storage shape", () => {
    const providerRow = {
      id: 1,
      public_id: "model_provider_public_id",
      provider_key: "qwen",
      display_name: "Qwen",
      api_key_secret_ref: "secret://model-provider/qwen",
      api_key_last_four: "1234",
      base_url: null,
      secret_status: "configured",
      last_rotated_at: null,
      provider_metadata: null,
      is_enabled: true,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies ModelProviderRow;

    const configRow = {
      id: 2,
      public_id: "model_config_public_id",
      model_provider_id: 1,
      ai_func_type: "scoring",
      model_name: "qwen-max",
      display_name: "Qwen Max Scoring",
      model_alias: "qwen-max",
      config_version: 3,
      status: "enabled",
      is_enabled: true,
      timeout_second: 60,
      max_retry_count: 0,
      fallback_priority: 0,
      snapshot_policy: "redacted_metadata",
      fallback_model_config_id: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies ModelConfigRow;

    const templateRow = {
      id: 3,
      public_id: "prompt_template_public_id",
      prompt_template_key: "ai_scoring_v1",
      ai_func_type: "scoring",
      version: 1,
      status: "enabled",
      title: "AI scoring v1",
      description: null,
      template_content: "Score the answer with rubric.",
      template_hash: "hash",
      body_digest: "hash",
      body_preview_masked: null,
      is_active: true,
      created_at: createdAt,
      updated_at: createdAt,
      archived_at: null,
      disabled_at: null,
    } satisfies PromptTemplateRow;

    expect(providerRow).not.toHaveProperty("publicId");
    expect(configRow).not.toHaveProperty("modelProviderId");
    expect(templateRow).not.toHaveProperty("promptTemplateKey");
  });

  it("creates redaction-safe model config snapshots without provider secrets", () => {
    const snapshot = createModelConfigSnapshot({
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
    });

    expect(snapshot).toEqual({
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
    });
    expect(snapshot).not.toHaveProperty("apiKeySecretRef");
    expect(snapshot).not.toHaveProperty("apiKeyLastFour");
  });

  it("keeps AI call log rows in snake_case storage shape", () => {
    const callLogRow = {
      id: 10,
      public_id: "ai_call_log_public_id",
      user_public_id: "user_public_id",
      answer_record_public_id: "answer_record_public_id",
      mock_exam_public_id: "mock_exam_public_id",
      question_public_id: "question_public_id",
      ai_func_type: "scoring",
      call_status: "success",
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
      response_redacted_snapshot: {
        modelOutput: { redactionStatus: "redacted" },
      },
      error_redacted_snapshot: null,
      citation_redacted_snapshot: { citations: [] },
      prompt_token_count: 100,
      completion_token_count: 20,
      total_token_count: 120,
      latency_ms: 800,
      started_at: createdAt,
      completed_at: createdAt,
      created_at: createdAt,
    } satisfies AiCallLogRow;

    expect(callLogRow).not.toHaveProperty("publicId");
    expect(callLogRow).not.toHaveProperty("callStatus");
    expect(callLogRow).not.toHaveProperty("modelConfigSnapshot");
  });

  it("keeps AI scoring attempt rows in snake_case storage shape", () => {
    const attemptRow = {
      id: 11,
      answer_record_id: 10,
      attempt_number: 2,
      ai_call_log_id: 20,
      status: "failed",
      failure_code: "scoring_runner_failed",
      failure_message_digest: createFailureMessageDigest(
        "provider timeout with raw detail",
      ),
      scheduled_at: createdAt,
      started_at: createdAt,
      finished_at: createdAt,
      retry_after_at: null,
      attempt_snapshot: createAiScoringAttemptSnapshot({
        answerRecordPublicId: "answer_record_public_id",
        mockExamPublicId: "mock_exam_public_id",
        questionPublicId: "question_public_id",
        modelConfigSnapshot: createModelConfigSnapshot({
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
        promptTemplateKey: "ai_scoring_v1",
        promptTemplateVersion: 1,
        evidenceStatus: "none",
        citationCount: 0,
        scoringStatus: "scoring_failed",
      }),
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies AiScoringAttemptRow;

    expect(attemptRow).not.toHaveProperty("answerRecordId");
    expect(attemptRow).not.toHaveProperty("attemptNumber");
    expect(attemptRow).not.toHaveProperty("aiCallLogId");
  });

  it("creates redaction-safe AI scoring attempt snapshots", () => {
    const snapshot = createAiScoringAttemptSnapshot({
      answerRecordPublicId: "answer_record_public_id",
      mockExamPublicId: "mock_exam_public_id",
      questionPublicId: "question_public_id",
      modelConfigSnapshot,
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
      evidenceStatus: "weak",
      citationCount: 2,
      scoringStatus: "scoring_failed",
    });
    const serializedSnapshot = JSON.stringify(snapshot);

    expect(snapshot).toMatchObject({
      answerRecordPublicId: "answer_record_public_id",
      mockExamPublicId: "mock_exam_public_id",
      questionPublicId: "question_public_id",
      modelConfigPublicId: "model_config_public_123",
      promptTemplateKey: "ai_scoring_v1",
      promptTemplateVersion: 1,
      evidenceStatus: "weak",
      citationCount: 2,
      scoringStatus: "scoring_failed",
    });
    expect(serializedSnapshot).not.toContain("prompt raw text");
    expect(serializedSnapshot).not.toContain("student answer raw text");
    expect(serializedSnapshot).not.toContain("provider-token");
    expect(serializedSnapshot).not.toContain("DATABASE_URL");
  });

  it("keeps RAG resource and knowledge rows in snake_case storage shape", () => {
    const knowledgeBaseRow = {
      id: 20,
      public_id: "knowledge_base_public_id",
      profession: "marketing",
      display_name: "Marketing Knowledge Base",
      description: null,
      is_enabled: true,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies KnowledgeBaseRow;

    const resourceRow = {
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
      level_list: [3, 4],
      markdown_content: "# Marketing Basics",
      markdown_content_hash: "markdown_hash",
      conversion_error_message: null,
      indexing_error_message: null,
      is_vector_stale: false,
      published_at: createdAt,
      disabled_at: null,
      created_at: createdAt,
      updated_at: createdAt,
    } satisfies ResourceRow;

    const knowledgeNodeRow = {
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
      created_at: createdAt,
      updated_at: createdAt,
      disabled_at: null,
    } satisfies KnowledgeNodeRow;

    expect(knowledgeBaseRow).not.toHaveProperty("publicId");
    expect(resourceRow).not.toHaveProperty("resourceStatus");
    expect(knowledgeNodeRow).not.toHaveProperty("parentKnowledgeNodeId");
  });

  it("guards the complete resource status transition matrix and RAG eligibility", () => {
    const allowedTransitions = {
      uploaded: ["converting", "disabled"],
      converting: ["draft", "conversion_failed", "disabled"],
      conversion_failed: ["converting", "disabled"],
      draft: ["published", "disabled"],
      published: ["indexing", "disabled"],
      indexing: ["rag_ready", "index_failed", "disabled"],
      index_failed: ["indexing", "disabled"],
      rag_ready: ["published", "indexing", "disabled"],
      disabled: ["published", "rag_ready"],
    } satisfies Record<(typeof resourceStatusValues)[number], string[]>;

    for (const currentStatus of resourceStatusValues) {
      for (const nextStatus of resourceStatusValues) {
        expect(
          canTransitionResourceStatus(currentStatus, nextStatus),
          `${currentStatus} -> ${nextStatus}`,
        ).toBe(allowedTransitions[currentStatus].includes(nextStatus));
      }
    }

    expect(isResourceRagEligible("rag_ready")).toBe(true);
    expect(isResourceRagEligible("published")).toBe(false);
    expect(isResourceRagEligible("conversion_failed")).toBe(false);
    expect(isResourceRagEligible("disabled")).toBe(false);
  });

  it("creates public knowledge node snapshots and enforces max depth five", () => {
    assertKnowledgeNodeDepth(5);
    expect(() => assertKnowledgeNodeDepth(6)).toThrow(
      "knowledge_node depth must be between 1 and 5",
    );

    const snapshot = createKnowledgeNodeSnapshot({
      public_id: "knowledge_node_public_id",
      parent_knowledge_node_public_id: "parent_public_id",
      profession: "marketing",
      level_list: [3, 4],
      name: "Market research",
      path_name: "Marketing / Market research",
      depth: 2,
      sort_order: 10,
      kn_status: "active",
      is_recommendable: true,
    });

    expect(snapshot).toEqual({
      publicId: "knowledge_node_public_id",
      parentKnowledgeNodePublicId: "parent_public_id",
      profession: "marketing",
      levelList: [3, 4],
      name: "Market research",
      pathName: "Marketing / Market research",
      depth: 2,
      sortOrder: 10,
      knStatus: "active",
      isRecommendable: true,
    });
    expect(snapshot).not.toHaveProperty("id");
    expect(snapshot).not.toHaveProperty("knowledgeBaseId");
  });

  it("redacts prompts, answers, model outputs, citations, and provider payload secrets", () => {
    const snapshots = createAiCallLogRedactedSnapshots({
      prompt: "prompt raw text 6e416b9a",
      userAnswer: "student answer raw text 31d38488",
      modelOutput: "model output raw text f831e674",
      citations: [
        {
          resourceTitle: "internal training handbook",
          chunkText: "citation raw text 2a2dc9a1",
        },
      ],
      providerRequestPayload: {
        headers: {
          authorization: "Bearer provider-token-4f36183b",
          "x-request-id": "request-safe-id",
        },
        body: {
          model: "qwen-max",
          messages: [{ content: "prompt raw text 6e416b9a" }],
        },
      },
      providerResponsePayload: {
        id: "provider-response-id",
        output: "model output raw text f831e674",
      },
      providerErrorPayload: {
        message: "provider failed after student answer raw text 31d38488",
        apiKey: "sk-provider-secret-9f2c210d",
      },
    });

    const serializedSnapshots = JSON.stringify(snapshots);

    expect(serializedSnapshots).not.toContain("prompt raw text 6e416b9a");
    expect(serializedSnapshots).not.toContain(
      "student answer raw text 31d38488",
    );
    expect(serializedSnapshots).not.toContain("model output raw text f831e674");
    expect(serializedSnapshots).not.toContain("citation raw text 2a2dc9a1");
    expect(serializedSnapshots).not.toContain("provider-token-4f36183b");
    expect(serializedSnapshots).not.toContain("sk-provider-secret-9f2c210d");
    expect(serializedSnapshots).toContain("request-safe-id");
    expect(snapshots.prompt.redactionStatus).toBe("redacted");
    expect(snapshots.userAnswer.redactionStatus).toBe("redacted");
    expect(snapshots.modelOutput.redactionStatus).toBe("redacted");
    expect(snapshots.providerErrorPayload).toMatchObject({
      message: { redactionStatus: "redacted" },
      apiKey: { redactionStatus: "redacted" },
    });
  });
});
