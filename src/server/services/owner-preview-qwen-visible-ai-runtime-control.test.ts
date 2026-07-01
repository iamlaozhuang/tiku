import { describe, expect, it } from "vitest";

import {
  createOwnerPreviewQwenAdminRuntimeBridgeControl,
  createOwnerPreviewQwenPersonalRuntimeBridgeControl,
} from "./owner-preview-qwen-visible-ai-runtime-control";

describe("owner preview Qwen visible AI runtime control", () => {
  it("does not enable route-integrated provider execution in production", () => {
    expect(
      createOwnerPreviewQwenPersonalRuntimeBridgeControl({
        ALIBABA_API_KEY: "synthetic-runtime-key",
        NODE_ENV: "production",
      }),
    ).toBeUndefined();
    expect(
      createOwnerPreviewQwenAdminRuntimeBridgeControl({
        ALIBABA_API_KEY: "synthetic-runtime-key",
        NODE_ENV: "production",
      }),
    ).toBeUndefined();
  });

  it("reads only the runtime Alibaba key through the injected credential reader", async () => {
    const control = createOwnerPreviewQwenAdminRuntimeBridgeControl({
      ALIBABA_API_KEY: " synthetic-runtime-key ",
      NODE_ENV: "development",
    });

    expect(control).toMatchObject({
      bridgeMode: "controlled_runner",
      explicitLocalSwitchPresent: true,
      providerExecution: {
        executionMode: "route_integrated_provider",
        realProviderExecutionApproved: true,
        maxRequests: 1,
        maxRetries: 0,
        maxOutputTokens: 1800,
        timeoutMs: 60000,
      },
    });
    await expect(
      Promise.resolve(control?.providerExecution?.readProviderCredential()),
    ).resolves.toBe("synthetic-runtime-key");
    expect(JSON.stringify(control)).not.toContain("synthetic-runtime-key");
  });

  it("returns null credentials when the runtime key is absent", async () => {
    const control = createOwnerPreviewQwenPersonalRuntimeBridgeControl({
      NODE_ENV: "development",
    });

    expect(control).not.toBeUndefined();
    await expect(
      Promise.resolve(control?.providerExecution?.readProviderCredential()),
    ).resolves.toBeNull();
  });
});
