import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";
import {
  executePersonalAiGenerationRouteIntegratedProvider,
  type PersonalAiGenerationRouteIntegratedProviderExecutionInput,
} from "./personal-ai-generation-route-integrated-provider-execution-service";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";

function createRequestFlow(): PersonalAiGenerationRequestFlowDto {
  const requestFlowResponse = buildPersonalAiGenerationRequestFlowReadModel({
    userPublicId: "student_public_route_provider_121",
    authorizationPublicId: "personal_auth_public_route_provider_121",
    aiFuncType: "explanation",
    questionPublicId: "question_public_route_provider_121",
    answerRecordPublicId: "answer_record_public_route_provider_121",
    paperPublicId: "paper_public_route_provider_121",
    mockExamPublicId: null,
    redeemCodePublicId: null,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
    taskPublicId: "ai_generation_task_public_route_provider_121",
    taskType: "ai_question_generation",
    actorPublicId: "student_public_route_provider_121",
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: "student_public_route_provider_121",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student_public_route_provider_121",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:route_provider_121",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
  });

  expect(requestFlowResponse.code).toBe(0);
  expect(requestFlowResponse.data).not.toBeNull();

  return requestFlowResponse.data as PersonalAiGenerationRequestFlowDto;
}

function createExecutionControl(
  overrides: {
    readProviderCredential?: () => Promise<string | null> | string | null;
    executeProviderRequest?: (
      input: PersonalAiGenerationRouteIntegratedProviderExecutionInput,
    ) => Promise<{
      requestCount: 0 | 1;
      resultStatus: "pass" | "fail" | "blocked";
      failureCategory:
        | "provider_call_blocked"
        | "missing_provider_credential"
        | "provider_error"
        | "timeout"
        | "redaction_violation"
        | null;
      durationMs: number;
      usageSummary: Record<string, number> | null;
      providerErrorSummary: {
        httpStatus: number | null;
        providerErrorCode: string | null;
      } | null;
    }>;
  } = {},
) {
  return {
    executionMode: "route_integrated_provider" as const,
    realProviderExecutionApproved: true as const,
    maxRequests: 1 as const,
    maxRetries: 0 as const,
    maxOutputTokens: 8 as const,
    timeoutMs: 30000 as const,
    readProviderCredential:
      overrides.readProviderCredential ??
      (async () => "synthetic-provider-credential"),
    executeProviderRequest: overrides.executeProviderRequest,
  };
}

describe("personal AI generation route-integrated provider execution service", () => {
  it("blocks execution when the injected credential reader returns no credential", async () => {
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        readProviderCredential: async () => null,
        executeProviderRequest: async () => {
          throw new Error("provider executor should not be called");
        },
      }),
    );

    expect(outcome).toEqual({
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "missing_provider_credential",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
    });
  });

  it("executes one injected provider request and returns only sanitized summary fields", async () => {
    const executorInputs: PersonalAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        executeProviderRequest: async (input) => {
          executorInputs.push(input);

          return {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            durationMs: 25,
            usageSummary: {
              inputTokens: 10,
              outputTokens: 2,
              totalTokens: 12,
            },
            providerErrorSummary: null,
          };
        },
      }),
    );
    const serializedOutcome = JSON.stringify(outcome);

    expect(executorInputs).toHaveLength(1);
    expect(executorInputs[0]).toMatchObject({
      providerMetadata: {
        modelProvider: "openai_compatible",
        providerName: "alibaba-qwen",
        modelName: "qwen3.7-max",
        baseUrlHost: "dashscope.aliyuncs.com",
        envKeyAlias: "ALIBABA_API_KEY",
      },
      limits: {
        maxRequests: 1,
        maxRetries: 0,
        maxOutputTokens: 8,
        timeoutMs: 30000,
      },
      requestContext: {
        taskPublicId: "ai_generation_task_public_route_provider_121",
        aiFuncType: "explanation",
        questionPublicId: "question_public_route_provider_121",
        answerRecordPublicId: "answer_record_public_route_provider_121",
      },
    });
    expect(outcome).toEqual({
      realProviderExecutionApproved: true,
      providerCallExecuted: true,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: {
        requestCount: 1,
        resultStatus: "pass",
        failureCategory: null,
        durationMs: 25,
        usageSummary: {
          inputTokens: 10,
          outputTokens: 2,
          totalTokens: 12,
        },
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
    });
    expect(serializedOutcome).not.toContain("synthetic-provider-credential");
    expect(serializedOutcome).not.toContain("providerPayload");
    expect(serializedOutcome).not.toContain("rawPrompt");
  });

  it("converts secret-like sanitized summaries into a redaction violation", async () => {
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        executeProviderRequest: async () => ({
          requestCount: 1,
          resultStatus: "fail",
          failureCategory: "provider_error",
          durationMs: 25,
          usageSummary: null,
          providerErrorSummary: {
            httpStatus: 403,
            providerErrorCode: "synthetic-provider-credential",
          },
        }),
      }),
    );

    expect(outcome).toEqual({
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "redaction_violation",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
    });
  });
});
