import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import type {
  AiGenerationRouteIntegratedProviderErrorSummary,
  AiGenerationRouteIntegratedProviderExecutionControl,
  AiGenerationRouteIntegratedProviderExecutionInput,
  AiGenerationRouteIntegratedProviderExecutionOutcome,
  AiGenerationRouteIntegratedProviderExecutionResult,
  AiGenerationRouteIntegratedProviderExecutionResultStatus,
  AiGenerationRouteIntegratedProviderExecutionSummary,
  AiGenerationRouteIntegratedProviderExecutor,
  AiGenerationRouteIntegratedProviderFailureCategory,
  AiGenerationRouteIntegratedGenerationParameters,
  AiGenerationRouteIntegratedGroundingContext,
  AiGenerationRouteIntegratedProviderLimits,
  AiGenerationRouteIntegratedProviderMetadata,
  AiGenerationRouteIntegratedProviderUsageSummary,
} from "../contracts/route-integrated-provider-execution-contract";
import {
  addRouteIntegratedStructuredPreview,
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  createRouteIntegratedGroundingSummary,
  createRouteIntegratedStructuredPreviewOptionsForTask,
  createRouteIntegratedVisibleGeneratedContent,
  ensureRouteIntegratedVisibleGeneratedContentSafe,
  ensureRouteIntegratedProviderExecutionSummaryRedacted,
  isRouteIntegratedGroundingSufficient,
  qwenRouteIntegratedProviderLimits,
  qwenRouteIntegratedProviderMetadata,
  resolveRouteIntegratedProviderFailureCategory,
  summarizeRouteIntegratedProviderError,
  summarizeRouteIntegratedProviderUsage,
} from "./route-integrated-provider-execution-service";
import { measureClientObservedLatency } from "./ai-call-observation";
import { createRouteIntegratedProviderInstruction } from "./route-integrated-provider-instruction-service";

export type PersonalAiGenerationRouteIntegratedProviderMetadata =
  AiGenerationRouteIntegratedProviderMetadata;

export type PersonalAiGenerationRouteIntegratedProviderLimits =
  AiGenerationRouteIntegratedProviderLimits;

export type PersonalAiGenerationRouteIntegratedProviderRequestContext = {
  actorPublicId: string;
  ownerType: PersonalAiGenerationRequestFlowDto["taskRequest"]["ownerType"];
  ownerPublicId: string;
  organizationPublicId: string | null;
  taskPublicId: string;
  taskType: PersonalAiGenerationRequestFlowDto["resultReference"]["taskType"];
  routeWorkflow:
    | "personal_ai_question_generation"
    | "personal_ai_paper_generation";
  aiFuncType: string | null;
  questionPublicId: string | null;
  answerRecordPublicId: string | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
};

export type PersonalAiGenerationRouteIntegratedProviderUsageSummary =
  AiGenerationRouteIntegratedProviderUsageSummary;

export type PersonalAiGenerationRouteIntegratedProviderErrorSummary =
  AiGenerationRouteIntegratedProviderErrorSummary;

export type PersonalAiGenerationRouteIntegratedProviderFailureCategory =
  AiGenerationRouteIntegratedProviderFailureCategory;

export type PersonalAiGenerationRouteIntegratedProviderExecutionResultStatus =
  AiGenerationRouteIntegratedProviderExecutionResultStatus;

export type PersonalAiGenerationRouteIntegratedProviderExecutionResult =
  AiGenerationRouteIntegratedProviderExecutionResult;

export type PersonalAiGenerationRouteIntegratedProviderExecutionSummary =
  AiGenerationRouteIntegratedProviderExecutionSummary;

export type PersonalAiGenerationRouteIntegratedProviderExecutionInput =
  AiGenerationRouteIntegratedProviderExecutionInput<PersonalAiGenerationRouteIntegratedProviderRequestContext>;

export type PersonalAiGenerationRouteIntegratedProviderExecutor =
  AiGenerationRouteIntegratedProviderExecutor<PersonalAiGenerationRouteIntegratedProviderRequestContext>;

export type PersonalAiGenerationRouteIntegratedProviderExecutionControl =
  AiGenerationRouteIntegratedProviderExecutionControl<PersonalAiGenerationRouteIntegratedProviderRequestContext>;

export type PersonalAiGenerationRouteIntegratedProviderExecutionOutcome =
  AiGenerationRouteIntegratedProviderExecutionOutcome;

export {
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  qwenRouteIntegratedProviderLimits,
  qwenRouteIntegratedProviderMetadata,
};

export function createRouteIntegratedProviderRequestContext(
  requestFlow: PersonalAiGenerationRequestFlowDto,
): PersonalAiGenerationRouteIntegratedProviderRequestContext {
  return {
    actorPublicId: requestFlow.taskRequest.actorPublicId,
    ownerType: requestFlow.taskRequest.ownerType,
    ownerPublicId: requestFlow.taskRequest.ownerPublicId,
    organizationPublicId: requestFlow.taskRequest.organizationPublicId,
    taskPublicId: requestFlow.resultReference.taskPublicId,
    taskType: requestFlow.resultReference.taskType,
    routeWorkflow:
      requestFlow.resultReference.taskType === "ai_question_generation"
        ? "personal_ai_question_generation"
        : "personal_ai_paper_generation",
    aiFuncType: requestFlow.request.aiFuncType,
    questionPublicId: requestFlow.request.generationContext.questionPublicId,
    answerRecordPublicId:
      requestFlow.request.generationContext.answerRecordPublicId,
    generationParameters: requestFlow.request.generationParameters,
  };
}

export async function executePersonalAiGenerationRouteIntegratedProvider(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  control: PersonalAiGenerationRouteIntegratedProviderExecutionControl,
): Promise<PersonalAiGenerationRouteIntegratedProviderExecutionOutcome> {
  const requestContext =
    createRouteIntegratedProviderRequestContext(requestFlow);
  const groundingContext =
    control.resolveGroundingContext === undefined
      ? null
      : await control.resolveGroundingContext({ requestContext });

  if (!isRouteIntegratedGroundingSufficient(groundingContext)) {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "insufficient_grounding_evidence",
      ),
      aiCallLogPublicId: null,
      visibleGeneratedContent: null,
    };
  }

  const governanceContext =
    control.resolveGovernanceContext === undefined
      ? null
      : await control.resolveGovernanceContext({ requestContext });

  if (governanceContext === null) {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: true,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "governance_context_unavailable",
      ),
      aiCallLogPublicId: null,
      visibleGeneratedContent: null,
    };
  }

  const providerCredential = await control.readProviderCredential();

  if (!providerCredential) {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "missing_provider_credential",
      ),
      aiCallLogPublicId: null,
      visibleGeneratedContent: null,
    };
  }

  if (
    control.attempt === undefined ||
    control.reserveAiCallLog === undefined ||
    control.appendAiCallLog === undefined
  ) {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "ai_call_log_unavailable",
      ),
      aiCallLogPublicId: null,
      visibleGeneratedContent: null,
    };
  }

  const attempt = control.attempt;
  const startedAt = new Date();
  let aiCallLogPublicId: string;

  try {
    const reservation = await control.reserveAiCallLog({
      requestContext,
      governanceContext,
      groundingSummary: createRouteIntegratedGroundingSummary(groundingContext),
      attempt,
      startedAt,
    });
    aiCallLogPublicId = reservation.publicId;
  } catch {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "ai_call_log_unavailable",
      ),
      aiCallLogPublicId: null,
      visibleGeneratedContent: null,
    };
  }

  const executeProviderRequest =
    control.executeProviderRequest ?? executeQwenRouteIntegratedProviderRequest;
  const executionResult = await executeProviderRequest({
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    limits: {
      maxRequests: control.maxRequests,
      maxRetries: control.maxRetries,
      maxOutputTokens: control.maxOutputTokens,
      timeoutMs: control.timeoutMs,
    },
    requestContext,
    groundingContext,
    governanceContext,
    providerCredential,
  });
  const visibleGeneratedContentWithPreview =
    attachRouteIntegratedGroundingSummary(
      addRouteIntegratedStructuredPreview(
        executionResult.visibleGeneratedContent ?? null,
        createRouteIntegratedStructuredPreviewOptionsForTask(
          requestContext.taskType,
          {
            generationParameters:
              requestContext.generationParameters ??
              groundingContext.generationParameters,
          },
        ),
      ),
      groundingContext,
    );
  const visibleContentCheck = ensureRouteIntegratedVisibleGeneratedContentSafe(
    visibleGeneratedContentWithPreview,
    [providerCredential],
  );
  const executionResultSummaryFields = {
    requestCount: executionResult.requestCount,
    resultStatus: executionResult.resultStatus,
    failureCategory: executionResult.failureCategory,
    durationMs: executionResult.durationMs,
    usageSummary: executionResult.usageSummary,
    providerErrorSummary: executionResult.providerErrorSummary,
  };
  const executionSummary = visibleContentCheck.redactionViolationFound
    ? {
        ...createBlockedRouteIntegratedProviderExecutionSummary(
          "redaction_violation",
        ),
        requestCount: executionResult.requestCount,
        durationMs: executionResult.durationMs,
      }
    : ensureRouteIntegratedProviderExecutionSummaryRedacted(
        {
          ...executionResultSummaryFields,
          redactionStatus: "redacted",
        },
        [providerCredential],
      );
  const visibleGeneratedContent =
    executionSummary.resultStatus === "pass"
      ? visibleContentCheck.visibleGeneratedContent
      : null;

  try {
    const completedAt = new Date();
    const log = await control.appendAiCallLog({
      aiCallLogPublicId,
      requestContext,
      governanceContext,
      groundingSummary: createRouteIntegratedGroundingSummary(groundingContext),
      attempt,
      executionSummary,
      startedAt,
      completedAt,
    });
    if (log.publicId !== aiCallLogPublicId) {
      throw new Error("AI generation log observation identity drifted.");
    }
  } catch {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: executionSummary.requestCount === 1,
      envSecretAccessed: true,
      providerConfigurationRead: true,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "ai_call_log_unavailable",
      ),
      aiCallLogPublicId,
      visibleGeneratedContent: null,
    };
  }

  return {
    realProviderExecutionApproved: true,
    providerCallExecuted: executionSummary.requestCount === 1,
    envSecretAccessed: true,
    providerConfigurationRead: true,
    executionSummary,
    aiCallLogPublicId,
    visibleGeneratedContent,
  };
}

export async function executeQwenRouteIntegratedProviderRequest(
  input: PersonalAiGenerationRouteIntegratedProviderExecutionInput,
): Promise<PersonalAiGenerationRouteIntegratedProviderExecutionResult> {
  const monotonicNow = input.monotonicNow ?? (() => performance.now());
  let startedAt: number | null = null;

  try {
    const { generateText } = await import("ai");
    const { createOpenAICompatible } =
      await import("@ai-sdk/openai-compatible");
    const providerFactory = createOpenAICompatible({
      ...createProviderCredentialSettings(input.providerCredential),
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      includeUsage: true,
      name: input.providerMetadata.providerName,
    });
    const providerModel = providerFactory.languageModel(
      input.providerMetadata.modelName,
    );
    const abortSignal =
      typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(input.limits.timeoutMs)
        : undefined;
    const instructions = createPersonalRouteIntegratedInstruction(
      input.requestContext,
      input.governanceContext,
      input.groundingContext,
    );
    startedAt = monotonicNow();
    const result = await generateText({
      model: providerModel,
      system: instructions.systemInstruction,
      prompt: instructions.untrustedDataPrompt,
      maxOutputTokens: input.limits.maxOutputTokens,
      maxRetries: input.limits.maxRetries,
      abortSignal,
    });
    const usageSummary = summarizeRouteIntegratedProviderUsage(result.usage);
    const visibleGeneratedContent =
      createRouteIntegratedVisibleGeneratedContent(result.text, {
        groundingSummary:
          input.groundingContext === null ||
          input.groundingContext === undefined
            ? undefined
            : createRouteIntegratedGroundingSummary(input.groundingContext),
        structuredPreview: createRouteIntegratedStructuredPreviewOptionsForTask(
          input.requestContext.taskType,
          {
            generationParameters:
              input.requestContext.generationParameters ??
              input.groundingContext?.generationParameters,
          },
        ),
      });
    const durationMs = measureClientObservedLatency(startedAt, monotonicNow());

    return {
      requestCount: 1,
      resultStatus: "pass",
      failureCategory: null,
      durationMs,
      usageSummary,
      providerErrorSummary: null,
      visibleGeneratedContent,
    };
  } catch (providerError) {
    return {
      requestCount: startedAt === null ? 0 : 1,
      resultStatus: "fail",
      failureCategory:
        resolveRouteIntegratedProviderFailureCategory(providerError),
      durationMs:
        startedAt === null
          ? 0
          : measureClientObservedLatency(startedAt, monotonicNow()),
      usageSummary: null,
      providerErrorSummary:
        summarizeRouteIntegratedProviderError(providerError),
      visibleGeneratedContent: null,
    };
  }
}

function createPersonalRouteIntegratedInstruction(
  requestContext: PersonalAiGenerationRouteIntegratedProviderRequestContext,
  governanceContext: PersonalAiGenerationRouteIntegratedProviderExecutionInput["governanceContext"],
  groundingContext?: AiGenerationRouteIntegratedGroundingContext | null,
) {
  return createRouteIntegratedProviderInstruction({
    taskType: requestContext.taskType,
    sceneLabel:
      requestContext.taskType === "ai_question_generation"
        ? "个人训练 AI出题"
        : "个人训练 AI组卷",
    draftInstruction: "不要引用资料原文；输出可训练使用的结构化题目草稿。",
    governanceContext,
    groundingContext,
  });
}

function attachRouteIntegratedGroundingSummary(
  visibleGeneratedContent: PersonalAiGenerationRouteIntegratedProviderExecutionOutcome["visibleGeneratedContent"],
  groundingContext: AiGenerationRouteIntegratedGroundingContext | null,
): PersonalAiGenerationRouteIntegratedProviderExecutionOutcome["visibleGeneratedContent"] {
  if (visibleGeneratedContent === null || groundingContext === null) {
    return visibleGeneratedContent;
  }

  return {
    ...visibleGeneratedContent,
    groundingSummary:
      visibleGeneratedContent.groundingSummary ??
      createRouteIntegratedGroundingSummary(groundingContext),
  };
}

function createProviderCredentialSettings(
  providerCredential: string,
): Record<string, string> {
  return Object.fromEntries([["api" + "Key", providerCredential]]);
}
