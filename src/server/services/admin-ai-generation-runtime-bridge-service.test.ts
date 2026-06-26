import { describe, expect, it } from "vitest";

import {
  buildAdminAiGenerationRuntimeBridgeReadModel,
  createAdminAiGenerationRouteIntegratedProviderRequestContext,
} from "./admin-ai-generation-runtime-bridge-service";

describe("admin AI generation runtime bridge service", () => {
  it("defaults content admin workflow to a provider-disabled redacted bridge", () => {
    const bridge = buildAdminAiGenerationRuntimeBridgeReadModel({
      actorPublicId: "admin_public_runtime_bridge_101",
      workspace: "content",
      generationKind: "question",
      requestPublicId: "admin_ai_generation_request_runtime_bridge_101",
      taskPublicId: "admin_ai_generation_task_runtime_bridge_101",
      resultPublicId: "admin_ai_generation_result_runtime_bridge_101",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
    });
    const serializedBridge = JSON.stringify(bridge);

    expect(bridge).toMatchObject({
      bridgeStatus: "provider_call_blocked",
      bridgeMode: "default_blocked",
      runnerMode: "provider_call_blocked_runner",
      workspace: "content",
      generationKind: "question",
      taskPublicId: "admin_ai_generation_task_runtime_bridge_101",
      resultPublicId: "admin_ai_generation_result_runtime_bridge_101",
      ownerType: "platform",
      ownerPublicId: "platform_content_review_pool",
      organizationPublicId: null,
      realProviderExecutionApproved: false,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      providerRetryAttempted: false,
      providerStreamingEnabled: false,
      costCalibrationExecuted: false,
      redactionStatus: "redacted",
      providerMetadata: {
        modelProvider: "openai_compatible",
        providerName: "alibaba-qwen",
        modelName: "qwen3.7-max",
        baseUrlHost: "dashscope.aliyuncs.com",
        envKeyAlias: "ALIBABA_API_KEY",
      },
      providerExecutionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "provider_call_blocked",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      blockedReasons: [
        "provider_call_blocked",
        "env_secret_access_blocked",
        "provider_configuration_read_blocked",
        "cost_calibration_gate_blocked",
        "real_provider_execution_requires_follow_up_task",
      ],
    });
    expect(serializedBridge).not.toContain("rawPrompt");
    expect(serializedBridge).not.toContain("providerPayload");
    expect(serializedBridge).not.toContain("Authorization");
  });

  it("maps organization admin workflow into an admin-specific Provider request context", () => {
    expect(
      createAdminAiGenerationRouteIntegratedProviderRequestContext({
        actorPublicId: "org_admin_public_runtime_bridge_101",
        workspace: "organization",
        generationKind: "paper",
        requestPublicId: "admin_ai_generation_request_org_bridge_101",
        taskPublicId: "admin_ai_generation_task_org_bridge_101",
        resultPublicId: "admin_ai_generation_result_org_bridge_101",
        ownerType: "organization",
        ownerPublicId: "organization_public_runtime_bridge_101",
        organizationPublicId: "organization_public_runtime_bridge_101",
      }),
    ).toEqual({
      taskPublicId: "admin_ai_generation_task_org_bridge_101",
      resultPublicId: "admin_ai_generation_result_org_bridge_101",
      requestPublicId: "admin_ai_generation_request_org_bridge_101",
      routeWorkflow: "organization_ai_paper_generation",
      workspace: "organization",
      generationKind: "paper",
      ownerType: "organization",
      ownerPublicId: "organization_public_runtime_bridge_101",
      organizationPublicId: "organization_public_runtime_bridge_101",
    });
  });
});
