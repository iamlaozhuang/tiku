import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";
import {
  buildPersonalAiGenerationRuntimeBridgeReadModel,
  buildPersonalAiGenerationRuntimeBridgeReadModelForRoute,
  type PersonalAiGenerationRuntimeBridgeControl,
} from "./personal-ai-generation-runtime-bridge-service";
import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";

const sufficientGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    generationParameters: {
      profession: "monopoly",
      level: 3,
      subject: "theory",
      knowledgeNode: "synthetic knowledge node",
      knowledgeNodeMode: "balanced",
      knowledgeNodePublicIds: [],
      includeDescendants: false,
      knowledgeNodeSupplement: "synthetic knowledge node",
      sourcePreference: null,
      questionType: "single_choice",
      questionCount: 10,
      difficulty: "medium",
      learningObjective: "synthetic learning goal",
    },
    evidenceStatus: "sufficient",
    citationCount: 1,
    citations: [
      {
        resourceTitle: "synthetic resource title",
        headingPath: ["synthetic heading"],
        chunkIndex: 0,
        chunkText: "synthetic bounded grounding evidence",
        score: 0.91,
      },
    ],
  };

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

  it("materializes a redacted route-integrated result only through server-side controlled runner dependencies", async () => {
    const persistedInputs: unknown[] = [];
    const runtimeBridgeControl: PersonalAiGenerationRuntimeBridgeControl = {
      bridgeMode: "controlled_runner",
      explicitLocalSwitchPresent: true,
      resultMaterialization: {
        materializationMode: "fake_sanitized_in_memory_output",
        resultPublicId: "ai_generation_result_public_bridge_121",
        contentDigest: "sha256:bridge_materialized_digest_121",
        contentPreviewMasked: "masked local result preview",
        evidenceStatus: "none",
        citationCount: 0,
        persistDraftResult: async (input: unknown) => {
          persistedInputs.push(input);

          return {
            code: 0,
            message: "ok",
            data: {
              persistenceStatus: "created",
              result: {
                resultPublicId: "ai_generation_result_public_bridge_121",
                taskPublicId: "ai_generation_task_public_bridge_121",
                requestPublicId: "personal_ai_request_public_bridge_121",
                taskType: "ai_question_generation",
                status: "draft",
                persistedAt: "2026-06-19T00:00:00.000Z",
                contentReference: {
                  contentDigest: "sha256:bridge_materialized_digest_121",
                  contentPreviewMasked: "masked local result preview",
                  contentVisibility: "redacted_snapshot",
                  redactionStatus: "redacted",
                },
                evidenceReference: {
                  evidenceStatus: "none",
                  citationCount: 0,
                  aiCallLogPublicId: null,
                  redactionStatus: "redacted",
                },
                formalAdoption: {
                  isBlocked: true,
                  status: "blocked",
                },
                paperAssembly: null,
              },
            },
          };
        },
      },
    };

    const bridge =
      await buildPersonalAiGenerationRuntimeBridgeReadModelForRoute(
        createRequestFlow(),
        {
          runtimeBridgeControl,
        },
      );
    const serializedBridge = JSON.stringify(bridge);

    expect(bridge).toMatchObject({
      bridgeStatus: "controlled_runner_ready",
      bridgeMode: "controlled_runner",
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      resultMaterializationSummary: {
        materializationStatus: "created",
        resultPublicId: "ai_generation_result_public_bridge_121",
        contentDigest: "sha256:bridge_materialized_digest_121",
        contentPreviewMasked: "masked local result preview",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        evidenceStatus: "none",
        citationCount: 0,
        formalAdoptionStatus: "blocked",
      },
      visibleGeneratedContent: null,
    });
    expect(persistedInputs).toEqual([
      expect.objectContaining({
        resultPublicId: "ai_generation_result_public_bridge_121",
        taskPublicId: "ai_generation_task_public_bridge_121",
        ownerPublicId: "student_public_bridge_121",
        actorPublicId: "student_public_bridge_121",
        taskType: "ai_question_generation",
        contentDigest: "sha256:bridge_materialized_digest_121",
        contentPreviewMasked: "masked local result preview",
        evidenceStatus: "none",
        citationCount: 0,
        aiCallLogPublicId: null,
        contentRedactedSnapshot: expect.objectContaining({
          redactionStatus: "redacted",
          contentVisibility: "redacted_snapshot",
        }),
      }),
    ]);
    expect(serializedBridge).not.toContain("provider payload");
    expect(serializedBridge).not.toContain("raw prompt");
    expect(serializedBridge).not.toContain("raw response");
  });

  it("carries transient visible provider content through the route bridge only", async () => {
    const bridge =
      await buildPersonalAiGenerationRuntimeBridgeReadModelForRoute(
        createRequestFlow(),
        {
          runtimeBridgeControl: {
            bridgeMode: "controlled_runner",
            explicitLocalSwitchPresent: true,
            providerExecution: {
              executionMode: "route_integrated_provider",
              realProviderExecutionApproved: true,
              maxRequests: 1,
              maxRetries: 0,
              maxOutputTokens: 220,
              timeoutMs: 30000,
              resolveGroundingContext: () => sufficientGroundingContext,
              readProviderCredential: () => "synthetic-bridge-credential",
              executeProviderRequest: async () => ({
                requestCount: 1,
                resultStatus: "pass",
                failureCategory: null,
                durationMs: 44,
                usageSummary: {
                  inputTokens: 16,
                  outputTokens: 22,
                  totalTokens: 38,
                },
                providerErrorSummary: null,
                visibleGeneratedContent: {
                  content: "学生端本次 AI 生成预览",
                  contentVisibility: "transient_response_only",
                  persistenceStatus: "not_persisted",
                  safetyStatus: "checked",
                },
              }),
            },
          },
        },
      );
    const serializedSummary = JSON.stringify(bridge.providerExecutionSummary);

    expect(bridge).toMatchObject({
      bridgeStatus: "provider_call_succeeded",
      providerCallExecuted: true,
      visibleGeneratedContent: {
        content: "学生端本次 AI 生成预览",
        contentVisibility: "transient_response_only",
        persistenceStatus: "not_persisted",
        safetyStatus: "checked",
      },
    });
    expect(serializedSummary).not.toContain("学生端本次 AI 生成预览");
    expect(JSON.stringify(bridge)).not.toContain("synthetic-bridge-credential");
    expect(JSON.stringify(bridge)).not.toContain("provider payload");
  });

  it("materializes a redacted result when route Provider execution succeeds", async () => {
    const persistedInputs: unknown[] = [];
    const bridge =
      await buildPersonalAiGenerationRuntimeBridgeReadModelForRoute(
        createRequestFlow(),
        {
          runtimeBridgeControl: {
            bridgeMode: "controlled_runner",
            explicitLocalSwitchPresent: true,
            providerExecution: {
              executionMode: "route_integrated_provider",
              realProviderExecutionApproved: true,
              maxRequests: 1,
              maxRetries: 0,
              maxOutputTokens: 220,
              timeoutMs: 30000,
              resolveGroundingContext: () => sufficientGroundingContext,
              readProviderCredential: () => "synthetic-bridge-credential",
              executeProviderRequest: async () => ({
                requestCount: 1,
                resultStatus: "pass",
                failureCategory: null,
                durationMs: 44,
                usageSummary: {
                  inputTokens: 16,
                  outputTokens: 22,
                  totalTokens: 38,
                },
                providerErrorSummary: null,
                visibleGeneratedContent: {
                  content: "学生端本次 AI 生成预览",
                  contentVisibility: "transient_response_only",
                  persistenceStatus: "not_persisted",
                  safetyStatus: "checked",
                },
              }),
            },
            resultMaterialization: {
              materializationMode: "fake_sanitized_in_memory_output",
              resultPublicId: "ai_generation_result_public_bridge_122",
              contentDigest: "sha256:bridge_materialized_digest_122",
              contentPreviewMasked: "masked local result preview",
              evidenceStatus: "none",
              citationCount: 0,
              persistDraftResult: async (input: unknown) => {
                persistedInputs.push(input);

                return {
                  code: 0,
                  message: "ok",
                  data: {
                    persistenceStatus: "created",
                    result: {
                      resultPublicId: "ai_generation_result_public_bridge_122",
                      taskPublicId: "ai_generation_task_public_bridge_121",
                      requestPublicId: "personal_ai_request_public_bridge_121",
                      taskType: "ai_question_generation",
                      status: "draft",
                      persistedAt: "2026-06-19T00:00:00.000Z",
                      contentReference: {
                        contentDigest: "sha256:bridge_materialized_digest_122",
                        contentPreviewMasked: "masked local result preview",
                        contentVisibility: "redacted_snapshot",
                        redactionStatus: "redacted",
                      },
                      evidenceReference: {
                        evidenceStatus: "none",
                        citationCount: 0,
                        aiCallLogPublicId: null,
                        redactionStatus: "redacted",
                      },
                      formalAdoption: {
                        isBlocked: true,
                        status: "blocked",
                      },
                      paperAssembly: null,
                    },
                  },
                };
              },
            },
          },
        },
      );
    const serializedBridge = JSON.stringify(bridge);

    expect(bridge).toMatchObject({
      bridgeStatus: "provider_call_succeeded",
      providerCallExecuted: true,
      resultMaterializationSummary: {
        materializationStatus: "created",
        resultPublicId: "ai_generation_result_public_bridge_122",
        contentDigest: "sha256:bridge_materialized_digest_122",
        contentPreviewMasked: "masked local result preview",
        contentVisibility: "redacted_snapshot",
        redactionStatus: "redacted",
        evidenceStatus: "none",
        citationCount: 0,
        formalAdoptionStatus: "blocked",
      },
      visibleGeneratedContent: {
        content: "学生端本次 AI 生成预览",
        contentVisibility: "transient_response_only",
        persistenceStatus: "not_persisted",
        safetyStatus: "checked",
      },
    });
    expect(persistedInputs).toEqual([
      expect.objectContaining({
        resultPublicId: "ai_generation_result_public_bridge_122",
        taskPublicId: "ai_generation_task_public_bridge_121",
        ownerPublicId: "student_public_bridge_121",
        actorPublicId: "student_public_bridge_121",
        ownerType: "personal",
        taskType: "ai_question_generation",
        contentDigest: "sha256:bridge_materialized_digest_122",
        contentPreviewMasked: "masked local result preview",
      }),
    ]);
    expect(serializedBridge).not.toContain("synthetic-bridge-credential");
    expect(serializedBridge).not.toContain("provider payload");
    expect(serializedBridge).not.toContain("raw prompt");
    expect(serializedBridge).not.toContain("raw response");
  });
});
