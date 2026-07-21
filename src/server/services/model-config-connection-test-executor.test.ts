import { describe, expect, it, vi } from "vitest";

import type { ModelConfigSummaryDto } from "../contracts/admin-ai-audit-log-ops-contract";
import {
  runModelConfigConnectionTest,
  type ModelConfigConnectionTestExecutor,
} from "./model-config-connection-test-executor";

const modelConfig: ModelConfigSummaryDto = {
  publicId: "model-config-public-001",
  providerPublicId: "model-provider-public-001",
  providerDisplayName: "Governed Provider",
  providerKey: "qwen",
  modelName: "qwen-plus",
  modelAlias: "qwen-plus",
  displayName: "Governed scoring",
  aiFuncType: "ai_scoring",
  apiKeyDisplay: "****3456",
  secretStatus: "configured",
  maskedSecret: "****3456",
  fallbackModelConfigPublicId: null,
  isEnabled: true,
  status: "enabled",
  fallbackPriority: 0,
  snapshotPolicy: "redacted_metadata",
  configVersion: 3,
  pricingVersion: null,
  inputTokenPriceCnyPerMillion: null,
  outputTokenPriceCnyPerMillion: null,
  timeoutSecond: 60,
  maxRetryCount: 3,
  updatedAt: "2026-07-15T12:00:00.000Z",
};

describe("model_config synthetic connection test executor", () => {
  it("calls only an injected adapter with an opaque secret reference", async () => {
    const execute = vi
      .fn<ModelConfigConnectionTestExecutor["execute"]>()
      .mockResolvedValue({
        status: "succeeded",
        durationMs: 18,
      });

    const result = await runModelConfigConnectionTest({
      actorPublicId: "admin-public-001",
      modelConfig,
      apiKeySecretRef: "secret-ref/model-provider/qwen/current",
      executor: { execute },
      now: new Date("2026-07-15T12:00:00.000Z"),
    });

    expect(execute).toHaveBeenCalledWith({
      apiKeySecretRef: "secret-ref/model-provider/qwen/current",
      modelConfig: {
        publicId: "model-config-public-001",
        providerKey: "qwen",
        modelName: "qwen-plus",
        timeoutSecond: 60,
      },
      syntheticPayload: {
        kind: "model_config_health_check",
        containsUserData: false,
        containsRawPrompt: false,
      },
    });
    expect(result).toMatchObject({
      status: "succeeded",
      durationMs: 18,
      failureCategory: "none",
    });
  });

  it("fails honestly without a secret or adapter", async () => {
    await expect(
      runModelConfigConnectionTest({
        actorPublicId: "admin-public-001",
        modelConfig,
        apiKeySecretRef: null,
        executor: null,
        now: new Date("2026-07-15T12:00:00.000Z"),
      }),
    ).resolves.toMatchObject({
      status: "missing_secret",
      failureCategory: "missing_secret",
      durationMs: 0,
    });

    await expect(
      runModelConfigConnectionTest({
        actorPublicId: "admin-public-001",
        modelConfig,
        apiKeySecretRef: "secret-ref/model-provider/qwen/current",
        executor: null,
        now: new Date("2026-07-15T12:00:00.000Z"),
      }),
    ).resolves.toMatchObject({
      status: "failed",
      failureCategory: "provider_adapter_unavailable",
      durationMs: 0,
    });
  });

  it("redacts adapter failure details and never disables the config", async () => {
    const result = await runModelConfigConnectionTest({
      actorPublicId: "admin-public-001",
      modelConfig,
      apiKeySecretRef: "secret-ref/model-provider/qwen/current",
      executor: {
        async execute() {
          throw new Error("provider response with private details");
        },
      },
      now: new Date("2026-07-15T12:00:00.000Z"),
    });

    expect(result).toMatchObject({
      status: "failed",
      failureCategory: "synthetic_health_check_failed",
      modelDisabledByTest: false,
      responseBodyStored: false,
      providerPayloadStored: false,
    });
    expect(JSON.stringify(result)).not.toContain("private details");
  });
});
