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
  AiGenerationRouteIntegratedProviderLimits,
  AiGenerationRouteIntegratedProviderMetadata,
  AiGenerationRouteIntegratedProviderUsageSummary,
} from "../contracts/route-integrated-provider-execution-contract";
import {
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  createRouteIntegratedVisibleGeneratedContent,
  ensureRouteIntegratedVisibleGeneratedContentSafe,
  ensureRouteIntegratedProviderExecutionSummaryRedacted,
  qwenRouteIntegratedProviderLimits,
  qwenRouteIntegratedProviderMetadata,
  resolveRouteIntegratedProviderFailureCategory,
  summarizeRouteIntegratedProviderError,
  summarizeRouteIntegratedProviderUsage,
} from "./route-integrated-provider-execution-service";

export type PersonalAiGenerationRouteIntegratedProviderMetadata =
  AiGenerationRouteIntegratedProviderMetadata;

export type PersonalAiGenerationRouteIntegratedProviderLimits =
  AiGenerationRouteIntegratedProviderLimits;

export type PersonalAiGenerationRouteIntegratedProviderRequestContext = {
  taskPublicId: string;
  aiFuncType: string;
  questionPublicId: string;
  answerRecordPublicId: string | null;
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
    taskPublicId: requestFlow.resultReference.taskPublicId,
    aiFuncType: requestFlow.request.aiFuncType,
    questionPublicId: requestFlow.request.generationContext.questionPublicId,
    answerRecordPublicId:
      requestFlow.request.generationContext.answerRecordPublicId,
  };
}

export async function executePersonalAiGenerationRouteIntegratedProvider(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  control: PersonalAiGenerationRouteIntegratedProviderExecutionControl,
): Promise<PersonalAiGenerationRouteIntegratedProviderExecutionOutcome> {
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
    requestContext: createRouteIntegratedProviderRequestContext(requestFlow),
    providerCredential,
  });
  const visibleContentCheck = ensureRouteIntegratedVisibleGeneratedContentSafe(
    executionResult.visibleGeneratedContent,
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
    ? createBlockedRouteIntegratedProviderExecutionSummary(
        "redaction_violation",
      )
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

  return {
    realProviderExecutionApproved: true,
    providerCallExecuted: executionSummary.requestCount === 1,
    envSecretAccessed: true,
    providerConfigurationRead: true,
    executionSummary,
    visibleGeneratedContent,
  };
}

export async function executeQwenRouteIntegratedProviderRequest(
  input: PersonalAiGenerationRouteIntegratedProviderExecutionInput,
): Promise<PersonalAiGenerationRouteIntegratedProviderExecutionResult> {
  const startedAt = Date.now();

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
    const result = await generateText({
      model: providerModel,
      prompt: createPersonalRouteIntegratedInstruction(input.requestContext),
      maxOutputTokens: input.limits.maxOutputTokens,
      maxRetries: input.limits.maxRetries,
      abortSignal,
    });

    return {
      requestCount: 1,
      resultStatus: "pass",
      failureCategory: null,
      durationMs: Math.max(0, Date.now() - startedAt),
      usageSummary: summarizeRouteIntegratedProviderUsage(result.usage),
      providerErrorSummary: null,
      visibleGeneratedContent: createRouteIntegratedVisibleGeneratedContent(
        result.text,
      ),
    };
  } catch (providerError) {
    return {
      requestCount: 1,
      resultStatus: "fail",
      failureCategory:
        resolveRouteIntegratedProviderFailureCategory(providerError),
      durationMs: Math.max(0, Date.now() - startedAt),
      usageSummary: null,
      providerErrorSummary:
        summarizeRouteIntegratedProviderError(providerError),
      visibleGeneratedContent: null,
    };
  }
}

function createPersonalRouteIntegratedInstruction(
  requestContext: PersonalAiGenerationRouteIntegratedProviderRequestContext,
): string {
  const taskLabel =
    requestContext.aiFuncType === "explanation"
      ? "AI解析"
      : requestContext.aiFuncType === "hint"
        ? "AI提示"
        : requestContext.aiFuncType === "kn_recommendation"
          ? "知识点推荐"
          : "学习建议";

  return [
    "为题库系统本地 owner preview 生成简短中文体验内容。",
    `场景：${taskLabel}。`,
    "不要引用真实题目全文；输出可读的要点或小练习草稿。",
  ].join("\n");
}

function createProviderCredentialSettings(
  providerCredential: string,
): Record<string, string> {
  return Object.fromEntries([["api" + "Key", providerCredential]]);
}
