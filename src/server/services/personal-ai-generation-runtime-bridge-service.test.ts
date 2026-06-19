import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";
import { buildPersonalAiGenerationRuntimeBridgeReadModel } from "./personal-ai-generation-runtime-bridge-service";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";

function createBaseInput() {
  return {
    userPublicId: "student_public_bridge_121",
    authorizationPublicId: "personal_auth_public_bridge_121",
    aiFuncType: "explanation",
    questionPublicId: "question_public_bridge_121",
    answerRecordPublicId: "answer_record_public_bridge_121",
    paperPublicId: "paper_public_bridge_121",
    mockExamPublicId: null,
    redeemCodePublicId: null,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
    taskPublicId: "ai_generation_task_public_bridge_121",
    taskType: "ai_question_generation",
    actorPublicId: "student_public_bridge_121",
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: "student_public_bridge_121",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student_public_bridge_121",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:personal_generation_bridge_121",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
  };
}

function createRequestFlow(): PersonalAiGenerationRequestFlowDto {
  const requestFlowResponse =
    buildPersonalAiGenerationRequestFlowReadModel(createBaseInput());

  expect(requestFlowResponse.code).toBe(0);
  expect(requestFlowResponse.data).not.toBeNull();

  return requestFlowResponse.data as PersonalAiGenerationRequestFlowDto;
}

describe("personal AI generation runtime bridge service", () => {
  it("defaults to provider-call blocked without env secret access", () => {
    const bridge =
      buildPersonalAiGenerationRuntimeBridgeReadModel(createRequestFlow());

    expect(bridge).toMatchObject({
      bridgeStatus: "provider_call_blocked",
      bridgeMode: "default_blocked",
      runnerMode: "provider_call_blocked_runner",
      localSwitchRequired: true,
      explicitLocalSwitchPresent: false,
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
      blockedReasons: [
        "explicit_local_switch_required",
        "provider_call_blocked",
        "env_secret_access_blocked",
        "real_provider_execution_requires_fresh_approval",
      ],
    });
    expect(bridge.redactionProbe.requestContext).toMatchObject({
      redactionStatus: "redacted",
      reason: "user_answer",
    });
    expect(bridge.redactionProbe.modelOutput).toMatchObject({
      redactionStatus: "redacted",
      reason: "model_output",
    });
    expect(bridge.redactionProbe.providerRequestPayload).toBeNull();
    expect(bridge.redactionProbe.providerResponsePayload).toBeNull();
    expect(bridge.redactionProbe.providerErrorPayload).toBeNull();
  });

  it("supports a controlled runner switch while preserving provider and env blocks", () => {
    const bridge = buildPersonalAiGenerationRuntimeBridgeReadModel(
      createRequestFlow(),
      {
        runtimeBridgeControl: {
          bridgeMode: "controlled_runner",
          explicitLocalSwitchPresent: true,
        },
      },
    );

    expect(bridge).toMatchObject({
      bridgeStatus: "controlled_runner_ready",
      bridgeMode: "controlled_runner",
      runnerMode: "deterministic_fake_runner",
      explicitLocalSwitchPresent: true,
      realProviderExecutionApproved: false,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      providerRetryAttempted: false,
      providerStreamingEnabled: false,
      costCalibrationExecuted: false,
      blockedReasons: ["real_provider_execution_requires_fresh_approval"],
    });
  });
});
