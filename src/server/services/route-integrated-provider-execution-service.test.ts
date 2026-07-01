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
      maxOutputTokens: 220,
      timeoutMs: 30000,
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
