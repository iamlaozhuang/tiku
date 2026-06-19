import { describe, expect, it, vi } from "vitest";

import {
  buildCliConfig,
  createProviderModel,
  forbiddenEvidenceKeys,
  runProviderSmokeSandbox,
} from "../../scripts/ai/run-personal-ai-provider-smoke.mjs";

const baseArgv = [
  "--provider",
  "alibaba",
  "--model",
  "qwen-plus",
  "--env-key",
  "ALIBABA_API_KEY",
  "--max-requests",
  "1",
  "--timeout-ms",
  "30000",
];

describe("run-personal-ai-provider-smoke", () => {
  it("builds a dry-run config without requiring provider execution approval", () => {
    const config = buildCliConfig([...baseArgv, "--dry-run"]);

    expect(config).toMatchObject({
      provider: "alibaba",
      model: "qwen-plus",
      envKey: "ALIBABA_API_KEY",
      maxRequests: 1,
      maxOutputTokens: 8,
      mode: "dry_run",
      timeoutMs: 30000,
    });
  });

  it("accepts an explicit Alibaba base URL for dry-run config", () => {
    const config = buildCliConfig([
      ...baseArgv,
      "--base-url",
      "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "--dry-run",
    ]);

    expect(config).toMatchObject({
      provider: "alibaba",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      mode: "dry_run",
    });
  });

  it("requires an explicit base URL for openai compatible smoke runs", () => {
    expect(() =>
      buildCliConfig([
        "--provider",
        "openai_compatible",
        "--model",
        "compatible-model",
        "--env-key",
        "OPENAI_COMPATIBLE_API_KEY",
        "--max-requests",
        "1",
        "--timeout-ms",
        "30000",
        "--dry-run",
      ]),
    ).toThrow("--base-url is required");
  });

  it("rejects real execution unless the explicit approval flag is present", async () => {
    const config = buildCliConfig([...baseArgv, "--execute"]);
    const readSecret = vi.fn();
    const callProvider = vi.fn();

    const envelope = await runProviderSmokeSandbox(config, {
      env: {},
      readSecret,
      callProvider,
      now: () => 100,
    });

    expect(envelope.code).toBe(403);
    expect(envelope.data).toMatchObject({
      providerCallExecuted: false,
      resultStatus: "blocked",
      failureCategory: "missing_execution_approval",
    });
    expect(readSecret).not.toHaveBeenCalled();
    expect(callProvider).not.toHaveBeenCalled();
  });

  it("returns redacted dry-run evidence without reading secrets or calling a provider", async () => {
    const config = buildCliConfig([...baseArgv, "--dry-run"]);
    const readSecret = vi.fn();
    const callProvider = vi.fn();

    const envelope = await runProviderSmokeSandbox(config, {
      env: {},
      readSecret,
      callProvider,
      now: () => 100,
    });

    expect(envelope).toMatchObject({
      code: 0,
      message: "provider smoke dry run completed",
      data: {
        provider: "alibaba",
        model: "qwen-plus",
        requestCount: 0,
        maxRequests: 1,
        providerCallExecuted: false,
        resultStatus: "dry_run",
        redactionStatus: "passed",
      },
    });
    expect(readSecret).not.toHaveBeenCalled();
    expect(callProvider).not.toHaveBeenCalled();
    expect(JSON.stringify(envelope)).not.toMatch(
      /prompt|payload|response|generated/i,
    );
    expectForbiddenEvidenceKeysAbsent(envelope);
  });

  it("records the Alibaba base URL host in dry-run evidence without reading secrets", async () => {
    const config = buildCliConfig([
      ...baseArgv,
      "--base-url",
      "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "--dry-run",
    ]);
    const readSecret = vi.fn();
    const callProvider = vi.fn();

    const envelope = await runProviderSmokeSandbox(config, {
      env: {},
      readSecret,
      callProvider,
      now: () => 100,
    });

    expect(envelope.data).toMatchObject({
      baseUrlHost: "dashscope.aliyuncs.com",
      providerCallExecuted: false,
      resultStatus: "dry_run",
    });
    expect(readSecret).not.toHaveBeenCalled();
    expect(callProvider).not.toHaveBeenCalled();
    expect(JSON.stringify(envelope)).not.toContain(
      "https://dashscope.aliyuncs.com/compatible-mode/v1",
    );
  });

  it("records sanitized success evidence without raw provider output", async () => {
    const config = buildCliConfig([...baseArgv, "--execute"]);
    const readSecret = vi.fn(() => "fixture-provider-key");
    const callProvider = vi.fn(async () => ({
      text: "raw model output must not be recorded",
      usage: {
        inputTokens: 11,
        outputTokens: 7,
        totalTokens: 18,
      },
    }));

    const envelope = await runProviderSmokeSandbox(config, {
      env: { TIKU_PROVIDER_SMOKE_APPROVED: "1" },
      readSecret,
      callProvider,
      now: vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(123),
    });

    expect(envelope.code).toBe(0);
    expect(envelope.data).toMatchObject({
      providerCallExecuted: true,
      resultStatus: "pass",
      requestCount: 1,
      durationMs: 23,
      usageSummary: {
        inputTokens: 11,
        outputTokens: 7,
        totalTokens: 18,
      },
      redactionStatus: "passed",
    });
    expect(readSecret).toHaveBeenCalledWith("ALIBABA_API_KEY");
    expect(callProvider).toHaveBeenCalledTimes(1);
    expect(callProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        maxOutputTokens: 8,
      }),
    );

    const serialized = JSON.stringify(envelope);
    expect(serialized).not.toContain("fixture-provider-key");
    expect(serialized).not.toContain("raw model output must not be recorded");
    expectForbiddenEvidenceKeysAbsent(envelope);
  });

  it("maps missing provider env to sanitized blocked evidence", async () => {
    const config = buildCliConfig([...baseArgv, "--execute"]);
    const readSecret = vi.fn(() => null);
    const callProvider = vi.fn();

    const envelope = await runProviderSmokeSandbox(config, {
      env: { TIKU_PROVIDER_SMOKE_APPROVED: "1" },
      readSecret,
      callProvider,
      now: () => 100,
    });

    expect(envelope.code).toBe(403);
    expect(envelope.data).toMatchObject({
      providerCallExecuted: false,
      resultStatus: "blocked",
      failureCategory: "missing_env",
      evidenceEnvKey: "ALIBABA_API_KEY",
    });
    expect(callProvider).not.toHaveBeenCalled();
    expectForbiddenEvidenceKeysAbsent(envelope);
  });

  it("records sanitized provider status and error code without raw error text", async () => {
    const config = buildCliConfig([...baseArgv, "--execute"]);
    const readSecret = vi.fn(() => "fixture-provider-key");
    const callProvider = vi.fn(async () => {
      throw {
        statusCode: 403,
        data: {
          code: "Model.AccessDenied",
          message: "raw provider message must not be recorded",
        },
        responseBody: "raw provider body must not be recorded",
      };
    });

    const envelope = await runProviderSmokeSandbox(config, {
      env: { TIKU_PROVIDER_SMOKE_APPROVED: "1" },
      readSecret,
      callProvider,
      now: vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(145),
    });

    expect(envelope.code).toBe(502);
    expect(envelope.data).toMatchObject({
      providerCallExecuted: true,
      resultStatus: "fail",
      requestCount: 1,
      durationMs: 45,
      failureCategory: "provider_error",
      providerErrorSummary: {
        httpStatus: 403,
        providerErrorCode: "Model.AccessDenied",
      },
      redactionStatus: "passed",
    });

    const serialized = JSON.stringify(envelope);
    expect(serialized).not.toContain("fixture-provider-key");
    expect(serialized).not.toContain(
      "raw provider message must not be recorded",
    );
    expect(serialized).not.toContain("raw provider body must not be recorded");
    expectForbiddenEvidenceKeysAbsent(envelope);
  });

  it("passes explicit Alibaba base URL into the provider factory", async () => {
    const languageModel = Symbol("language-model");
    const languageModelFactory = vi.fn(() => languageModel);
    const createAlibaba = vi.fn((settings: Record<string, unknown>) => {
      void settings;
      return {
        languageModel: languageModelFactory,
      };
    });

    const model = await createProviderModel(
      {
        provider: "alibaba",
        model: "qwen-plus",
        providerCredential: "fixture-provider-key",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      },
      { createAlibaba },
    );

    expect(model).toBe(languageModel);
    const providerFactorySettings = createAlibaba.mock.calls[0]?.[0];

    expect(providerFactorySettings).toMatchObject({
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      includeUsage: true,
    });
    expect(providerFactorySettings?.["api" + "Key"]).toBe(
      "fixture-provider-key",
    );
    expect(languageModelFactory).toHaveBeenCalledWith("qwen-plus");
  });
});

function expectForbiddenEvidenceKeysAbsent(value: unknown) {
  const serialized = JSON.stringify(value);

  for (const forbiddenEvidenceKey of forbiddenEvidenceKeys) {
    expect(serialized).not.toContain(forbiddenEvidenceKey);
  }
}
