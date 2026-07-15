import { describe, expect, it, vi } from "vitest";

import {
  ModelProviderSecretStoreUnavailableError,
  prepareModelProviderSecretWrite,
} from "./model-provider-secret-store";

describe("model_provider write-only secret boundary", () => {
  it("returns only an opaque reference and redacted metadata", async () => {
    const write = vi.fn().mockResolvedValue({
      apiKeySecretRef: "secret-ref/model-provider/qwen/current",
    });

    const prepared = await prepareModelProviderSecretWrite({
      providerKey: "qwen",
      secretValue: "sk-test-123456",
      secretStore: { write },
      now: new Date("2026-07-15T12:00:00.000Z"),
    });

    expect(write).toHaveBeenCalledWith({
      providerKey: "qwen",
      secretValue: "sk-test-123456",
    });
    expect(prepared).toEqual({
      apiKeySecretRef: "secret-ref/model-provider/qwen/current",
      apiKeyLastFour: "3456",
      secretStatus: "configured",
      lastRotatedAt: new Date("2026-07-15T12:00:00.000Z"),
    });
    expect(JSON.stringify(prepared)).not.toContain("sk-test-123456");
  });

  it("fails honestly when no protected writer is configured", async () => {
    await expect(
      prepareModelProviderSecretWrite({
        providerKey: "qwen",
        secretValue: "sk-test-123456",
        secretStore: null,
        now: new Date("2026-07-15T12:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(ModelProviderSecretStoreUnavailableError);
  });

  it("rejects a writer result that is empty or contains the raw secret", async () => {
    await expect(
      prepareModelProviderSecretWrite({
        providerKey: "qwen",
        secretValue: "sk-test-123456",
        secretStore: {
          async write() {
            return { apiKeySecretRef: "sk-test-123456" };
          },
        },
        now: new Date("2026-07-15T12:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(ModelProviderSecretStoreUnavailableError);
  });
});
