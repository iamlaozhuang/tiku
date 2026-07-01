import { describe, expect, it } from "vitest";

import {
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  createRouteIntegratedVisibleGeneratedContent,
  ensureRouteIntegratedProviderExecutionSummaryRedacted,
  qwenRouteIntegratedProviderLimits,
  qwenRouteIntegratedProviderMetadata,
} from "./route-integrated-provider-execution-service";

describe("shared route-integrated Provider execution primitives", () => {
  it("creates a provider-disabled outcome without Provider, env, or configuration access", () => {
    expect(
      createDefaultBlockedRouteIntegratedProviderExecutionOutcome(),
    ).toEqual({
      realProviderExecutionApproved: false,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      executionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "provider_call_blocked",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      visibleGeneratedContent: null,
    });
  });

  it("shares the existing Qwen metadata and local call limits without reading credentials", () => {
    expect(qwenRouteIntegratedProviderMetadata).toEqual({
      modelProvider: "openai_compatible",
      providerName: "alibaba-qwen",
      modelName: "qwen3.7-max",
      baseUrlHost: "dashscope.aliyuncs.com",
      envKeyAlias: "ALIBABA_API_KEY",
    });
    expect(qwenRouteIntegratedProviderLimits).toEqual({
      maxRequests: 1,
      maxRetries: 0,
      maxOutputTokens: 1800,
      timeoutMs: 60000,
    });
  });

  it("normalizes transient visible generated content outside execution evidence", () => {
    expect(
      createRouteIntegratedVisibleGeneratedContent("  可见预览内容  "),
    ).toEqual({
      content: "可见预览内容",
      contentVisibility: "transient_response_only",
      persistenceStatus: "not_persisted",
      safetyStatus: "checked",
    });
    expect(createRouteIntegratedVisibleGeneratedContent("   ")).toBeNull();
    expect(createRouteIntegratedVisibleGeneratedContent(null)).toBeNull();
  });

  it("builds a parsed question-set structured preview only from safe counts", () => {
    const content = JSON.stringify({
      questions: Array.from({ length: 10 }, (_, index) => ({
        questionType: index % 2 === 0 ? "single_choice" : "judge",
        difficulty: "medium",
        knowledgeNodeLabels: ["redacted_knowledge_node"],
      })),
    });

    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      });

    expect(visibleGeneratedContent).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "parsed",
        requestedQuestionCount: 10,
        actualQuestionCount: 10,
        draftCount: 10,
      },
    });
    expect(
      visibleGeneratedContent?.structuredPreview?.kind === "question_set" &&
        visibleGeneratedContent.structuredPreview.parseStatus === "parsed"
        ? visibleGeneratedContent.structuredPreview.draftSummaries[0]
        : null,
    ).toMatchObject({
      draftNumber: 1,
      questionType: "single_choice",
      difficulty: "medium",
      knowledgeNodeCount: 1,
      reviewStatus: "draft_review_required",
    });
  });

  it("parses structured preview from the full provider text before truncating visible content", () => {
    const content = JSON.stringify({
      questions: Array.from({ length: 10 }, (_, index) => ({
        questionType: index % 2 === 0 ? "single_choice" : "judge",
        difficulty: "medium",
        knowledgeNodeLabels: ["redacted_knowledge_node"],
        redactedDraftSummary: "redacted draft summary ".repeat(30),
      })),
    });

    expect(content.length).toBeGreaterThan(2000);

    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      });

    expect(visibleGeneratedContent?.content.length).toBeLessThanOrEqual(2000);
    expect(visibleGeneratedContent?.structuredPreview).toMatchObject({
      kind: "question_set",
      parseStatus: "parsed",
      requestedQuestionCount: 10,
      actualQuestionCount: 10,
      draftCount: 10,
    });
  });

  it("reports a structured parse failure when question count mismatches the requested quantity", () => {
    const content = JSON.stringify({
      questions: Array.from({ length: 2 }, () => ({
        questionType: "single_choice",
      })),
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "question_set",
          requestedQuestionCount: 10,
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        requestedQuestionCount: 10,
        actualQuestionCount: 2,
        failureCategory: "question_count_mismatch",
        draftCount: 0,
        draftSummaries: [],
      },
    });
  });

  it("builds a parsed paper structured preview from section and coverage counts", () => {
    const content = JSON.stringify({
      paperSections: [
        { paperSectionType: "single_choice", questionCount: 20 },
        { paperSectionType: "judge", questionCount: 30 },
      ],
      questionTypeDistribution: {
        single_choice: 20,
        judge: 30,
      },
      knowledgeCoverage: [
        "redacted_knowledge_node_a",
        "redacted_knowledge_node_b",
      ],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "parsed",
        paperSectionCount: 2,
        questionCount: 50,
        questionTypeDistributionCount: 2,
        knowledgeCoverageCount: 2,
        reviewStatus: "draft_review_required",
      },
    });
  });

  it("derives paper question counts from nested section question arrays", () => {
    const content = JSON.stringify({
      paperSections: [
        {
          paperSectionType: "single_choice",
          questions: [
            { redactedDraftSummary: "synthetic question summary a" },
            { redactedDraftSummary: "synthetic question summary b" },
          ],
        },
        {
          paperSectionType: "judge",
          questionDrafts: [
            { redactedDraftSummary: "synthetic question summary c" },
          ],
        },
      ],
      questionTypeDistribution: {
        single_choice: 2,
        judge: 1,
      },
      knowledgeCoverage: ["redacted_knowledge_node_a"],
    });

    expect(
      createRouteIntegratedVisibleGeneratedContent(content, {
        structuredPreview: {
          kind: "paper_draft",
        },
      }),
    ).toMatchObject({
      structuredPreview: {
        kind: "paper_draft",
        parseStatus: "parsed",
        paperSectionCount: 2,
        questionCount: 3,
        questionTypeDistributionCount: 2,
        knowledgeCoverageCount: 1,
      },
    });
  });

  it("converts forbidden evidence values into a redaction violation summary", () => {
    const summary = ensureRouteIntegratedProviderExecutionSummaryRedacted(
      {
        requestCount: 1,
        resultStatus: "fail",
        failureCategory: "provider_error",
        durationMs: 15,
        usageSummary: null,
        providerErrorSummary: {
          httpStatus: 403,
          providerErrorCode: "synthetic-secret-value",
        },
        redactionStatus: "redacted",
      },
      ["synthetic-secret-value"],
    );

    expect(summary).toEqual(
      createBlockedRouteIntegratedProviderExecutionSummary(
        "redaction_violation",
      ),
    );
  });
});
