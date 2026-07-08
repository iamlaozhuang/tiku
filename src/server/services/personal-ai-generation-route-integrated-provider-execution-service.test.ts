import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";
import {
  executePersonalAiGenerationRouteIntegratedProvider,
  type PersonalAiGenerationRouteIntegratedProviderExecutionInput,
} from "./personal-ai-generation-route-integrated-provider-execution-service";
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
    citationCount: 2,
    citations: [
      {
        resourceTitle: "synthetic resource title",
        headingPath: ["synthetic heading"],
        chunkIndex: 0,
        chunkText: "synthetic bounded grounding evidence",
        score: 0.91,
      },
      {
        resourceTitle: "synthetic resource title",
        headingPath: ["synthetic heading"],
        chunkIndex: 1,
        chunkText: "synthetic bounded grounding support",
        score: 0.88,
      },
    ],
  };

const insufficientGroundingContext: AiGenerationRouteIntegratedGroundingContext =
  {
    ...sufficientGroundingContext,
    evidenceStatus: "none",
    citationCount: 0,
    citations: [],
  };

function createRequestFlow(
  taskType:
    | "ai_question_generation"
    | "ai_paper_generation" = "ai_question_generation",
): PersonalAiGenerationRequestFlowDto {
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
    taskType,
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
      visibleGeneratedContent?: {
        content: string;
        contentVisibility: "transient_response_only";
        persistenceStatus: "not_persisted";
        safetyStatus: "checked";
      } | null;
    }>;
    resolveGroundingContext?: () =>
      | Promise<AiGenerationRouteIntegratedGroundingContext>
      | AiGenerationRouteIntegratedGroundingContext;
    omitGroundingResolver?: boolean;
  } = {},
) {
  const control = {
    executionMode: "route_integrated_provider" as const,
    realProviderExecutionApproved: true as const,
    maxRequests: 1 as const,
    maxRetries: 0 as const,
    maxOutputTokens: 220 as const,
    timeoutMs: 30000 as const,
    readProviderCredential:
      overrides.readProviderCredential ??
      (async () => "synthetic-provider-credential"),
    executeProviderRequest: overrides.executeProviderRequest,
  };

  return overrides.omitGroundingResolver === true
    ? control
    : {
        ...control,
        resolveGroundingContext:
          overrides.resolveGroundingContext ??
          (() => sufficientGroundingContext),
      };
}

describe("personal AI generation route-integrated provider execution service", () => {
  it("blocks before credential access when grounding evidence is insufficient", async () => {
    let credentialRead = false;
    let providerExecuted = false;
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        readProviderCredential: () => {
          credentialRead = true;
          return "synthetic-provider-credential";
        },
        resolveGroundingContext: () => insufficientGroundingContext,
        executeProviderRequest: async () => {
          providerExecuted = true;
          throw new Error("provider executor should not be called");
        },
      }),
    );

    expect(credentialRead).toBe(false);
    expect(providerExecuted).toBe(false);
    expect(outcome).toEqual({
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      executionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "insufficient_grounding_evidence",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      visibleGeneratedContent: null,
    });
  });

  it("blocks before credential access when grounding resolver is missing", async () => {
    let credentialRead = false;
    let providerExecuted = false;
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        omitGroundingResolver: true,
        readProviderCredential: () => {
          credentialRead = true;
          return "synthetic-provider-credential";
        },
        executeProviderRequest: async () => {
          providerExecuted = true;
          throw new Error("provider executor should not be called");
        },
      }),
    );

    expect(credentialRead).toBe(false);
    expect(providerExecuted).toBe(false);
    expect(outcome).toEqual({
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      executionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "insufficient_grounding_evidence",
        durationMs: 0,
        usageSummary: null,
        providerErrorSummary: null,
        redactionStatus: "redacted",
      },
      visibleGeneratedContent: null,
    });
  });

  it("passes sufficient grounding context into the injected provider executor", async () => {
    const executorInputs: PersonalAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];

    await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        resolveGroundingContext: () => sufficientGroundingContext,
        executeProviderRequest: async (input) => {
          executorInputs.push(input);

          return {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            durationMs: 12,
            usageSummary: null,
            providerErrorSummary: null,
          };
        },
      }),
    );

    expect(executorInputs).toHaveLength(1);
    expect(executorInputs[0].groundingContext).toMatchObject({
      evidenceStatus: "sufficient",
      citationCount: 2,
      generationParameters: {
        profession: "monopoly",
        level: 3,
        subject: "theory",
        questionCount: 10,
      },
    });
  });

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
      visibleGeneratedContent: null,
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
        maxOutputTokens: 220,
        timeoutMs: 30000,
      },
      requestContext: {
        taskPublicId: "ai_generation_task_public_route_provider_121",
        taskType: "ai_question_generation",
        routeWorkflow: "personal_ai_question_generation",
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
      visibleGeneratedContent: null,
    });
    expect(serializedOutcome).not.toContain("synthetic-provider-credential");
    expect(serializedOutcome).not.toContain("providerPayload");
    expect(serializedOutcome).not.toContain("rawPrompt");
  });

  it("maps personal paper generation into a distinct Provider request context", async () => {
    const executorInputs: PersonalAiGenerationRouteIntegratedProviderExecutionInput[] =
      [];

    await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow("ai_paper_generation"),
      createExecutionControl({
        executeProviderRequest: async (input) => {
          executorInputs.push(input);

          return {
            requestCount: 1,
            resultStatus: "pass",
            failureCategory: null,
            durationMs: 16,
            usageSummary: null,
            providerErrorSummary: null,
          };
        },
      }),
    );

    expect(executorInputs).toHaveLength(1);
    expect(executorInputs[0].requestContext).toMatchObject({
      taskType: "ai_paper_generation",
      routeWorkflow: "personal_ai_paper_generation",
      aiFuncType: "explanation",
    });
  });

  it("adds a structured question preview to fake Provider visible content", async () => {
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow("ai_question_generation"),
      createExecutionControl({
        executeProviderRequest: async () => ({
          requestCount: 1,
          resultStatus: "pass",
          failureCategory: null,
          durationMs: 31,
          usageSummary: null,
          providerErrorSummary: null,
          visibleGeneratedContent: {
            content: JSON.stringify({
              questions: Array.from({ length: 10 }, () => ({
                questionType: "single_choice",
                difficulty: "medium",
                knowledgeNodeLabels: ["redacted_knowledge_node"],
              })),
            }),
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
          },
        }),
      }),
    );

    expect(outcome.visibleGeneratedContent?.structuredPreview).toMatchObject({
      kind: "question_set",
      parseStatus: "parsed",
      requestedQuestionCount: 10,
      actualQuestionCount: 10,
      draftCount: 10,
    });
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
      visibleGeneratedContent: null,
    });
  });

  it("returns transient visible generated content without adding it to the redacted summary", async () => {
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        executeProviderRequest: async () => ({
          requestCount: 1,
          resultStatus: "pass",
          failureCategory: null,
          durationMs: 31,
          usageSummary: {
            inputTokens: 12,
            outputTokens: 18,
            totalTokens: 30,
          },
          providerErrorSummary: null,
          visibleGeneratedContent: {
            content: "个人 AI 解析预览：先定位薄弱知识点，再练习同类题。",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
          },
        }),
      }),
    );
    const serializedSummary = JSON.stringify(outcome.executionSummary);

    expect(outcome.visibleGeneratedContent).toMatchObject({
      content: "个人 AI 解析预览：先定位薄弱知识点，再练习同类题。",
      contentVisibility: "transient_response_only",
      persistenceStatus: "not_persisted",
      safetyStatus: "checked",
      structuredPreview: {
        kind: "question_set",
        parseStatus: "failed",
        failureCategory: "invalid_json",
        requestedQuestionCount: 10,
      },
    });
    expect(serializedSummary).not.toContain("个人 AI 解析预览");
    expect(JSON.stringify(outcome)).not.toContain(
      "synthetic-provider-credential",
    );
  });

  it("blocks visible generated content that contains protected Provider material", async () => {
    const outcome = await executePersonalAiGenerationRouteIntegratedProvider(
      createRequestFlow(),
      createExecutionControl({
        executeProviderRequest: async () => ({
          requestCount: 1,
          resultStatus: "pass",
          failureCategory: null,
          durationMs: 31,
          usageSummary: null,
          providerErrorSummary: null,
          visibleGeneratedContent: {
            content: "synthetic-provider-credential",
            contentVisibility: "transient_response_only",
            persistenceStatus: "not_persisted",
            safetyStatus: "checked",
          },
        }),
      }),
    );

    expect(outcome).toMatchObject({
      providerCallExecuted: false,
      executionSummary: {
        requestCount: 0,
        resultStatus: "blocked",
        failureCategory: "redaction_violation",
      },
      visibleGeneratedContent: null,
    });
  });
});
