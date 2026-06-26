import { describe, expect, it } from "vitest";

import {
  buildAdminAiGenerationRuntimeBridgeReadModelForRoute,
  buildAdminAiGenerationRuntimeBridgeReadModel,
  createAdminAiGenerationRouteIntegratedProviderRequestContext,
} from "./admin-ai-generation-runtime-bridge-service";
import type { AdminAiGenerationRouteIntegratedProviderExecutionInput } from "../contracts/admin-ai-generation-runtime-bridge-contract";

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

  it("executes an explicit controlled runner fake Provider request with redacted admin context", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const bridge = await buildAdminAiGenerationRuntimeBridgeReadModelForRoute(
      {
        actorPublicId: "admin_public_runtime_bridge_102",
        workspace: "content",
        generationKind: "paper",
        requestPublicId: "admin_ai_generation_request_runtime_bridge_102",
        taskPublicId: "admin_ai_generation_task_runtime_bridge_102",
        resultPublicId: "admin_ai_generation_result_runtime_bridge_102",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
      },
      {
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 8,
            timeoutMs: 30000,
            readProviderCredential: () => "synthetic-admin-provider-credential",
            executeProviderRequest: async (providerInput) => {
              providerInputs.push(providerInput);

              return {
                requestCount: 1,
                resultStatus: "pass",
                failureCategory: null,
                durationMs: 13,
                usageSummary: {
                  promptTokens: 3,
                  completionTokens: 1,
                  totalTokens: 4,
                },
                providerErrorSummary: null,
              };
            },
          },
        },
      },
    );
    const serializedBridge = JSON.stringify(bridge);

    expect(providerInputs).toHaveLength(1);
    expect(providerInputs[0]).toMatchObject({
      providerMetadata: {
        providerName: "alibaba-qwen",
        modelName: "qwen3.7-max",
      },
      limits: {
        maxRequests: 1,
        maxRetries: 0,
        maxOutputTokens: 8,
        timeoutMs: 30000,
      },
      requestContext: {
        routeWorkflow: "content_ai_paper_generation",
        workspace: "content",
        generationKind: "paper",
        ownerType: "platform",
        ownerPublicId: "platform_content_review_pool",
        organizationPublicId: null,
      },
    });
    expect(bridge).toMatchObject({
      bridgeStatus: "provider_call_succeeded",
      bridgeMode: "controlled_runner",
      runnerMode: "route_integrated_provider_runner",
      realProviderExecutionApproved: true,
      providerCallExecuted: true,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      providerRetryAttempted: false,
      providerStreamingEnabled: false,
      costCalibrationExecuted: false,
      redactionStatus: "redacted",
      providerExecutionSummary: {
        requestCount: 1,
        resultStatus: "pass",
        failureCategory: null,
        durationMs: 13,
        usageSummary: {
          promptTokens: 3,
          completionTokens: 1,
          totalTokens: 4,
        },
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      blockedReasons: [],
    });
    expect(serializedBridge).not.toContain(
      "synthetic-admin-provider-credential",
    );
    expect(serializedBridge).not.toContain("rawPrompt");
    expect(serializedBridge).not.toContain("rawOutput");
    expect(serializedBridge).not.toContain("providerPayload");
    expect(serializedBridge).not.toContain("Authorization");
  });

  it("blocks an explicit controlled runner when the local Provider credential is unavailable", async () => {
    const providerInputs: AdminAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const bridge = await buildAdminAiGenerationRuntimeBridgeReadModelForRoute(
      {
        actorPublicId: "org_admin_public_runtime_bridge_103",
        workspace: "organization",
        generationKind: "question",
        requestPublicId: "admin_ai_generation_request_runtime_bridge_103",
        taskPublicId: "admin_ai_generation_task_runtime_bridge_103",
        resultPublicId: "admin_ai_generation_result_runtime_bridge_103",
        ownerType: "organization",
        ownerPublicId: "organization_public_runtime_bridge_103",
        organizationPublicId: "organization_public_runtime_bridge_103",
      },
      {
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
          providerExecution: {
            executionMode: "route_integrated_provider",
            realProviderExecutionApproved: true,
            maxRequests: 1,
            maxRetries: 0,
            maxOutputTokens: 8,
            timeoutMs: 30000,
            readProviderCredential: () => null,
            executeProviderRequest: async (providerInput) => {
              providerInputs.push(providerInput);
              throw new Error("unexpected provider execution");
            },
          },
        },
      },
    );

    expect(providerInputs).toEqual([]);
    expect(bridge).toMatchObject({
      bridgeStatus: "provider_call_blocked",
      bridgeMode: "controlled_runner",
      runnerMode: "route_integrated_provider_runner",
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      costCalibrationExecuted: false,
      providerExecutionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "missing_provider_credential",
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
    });
  });
});
