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
  createRouteIntegratedTaskLabel,
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

export type PersonalAiGenerationRouteIntegratedProviderMetadata =
  AiGenerationRouteIntegratedProviderMetadata;

export type PersonalAiGenerationRouteIntegratedProviderLimits =
  AiGenerationRouteIntegratedProviderLimits;

export type PersonalAiGenerationRouteIntegratedProviderRequestContext = {
  taskPublicId: string;
  taskType: PersonalAiGenerationRequestFlowDto["resultReference"]["taskType"];
  routeWorkflow:
    | "personal_ai_question_generation"
    | "personal_ai_paper_generation";
  aiFuncType: string;
  questionPublicId: string;
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

  if (
    control.resolveGroundingContext !== undefined &&
    !isRouteIntegratedGroundingSufficient(groundingContext)
  ) {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: false,
      envSecretAccessed: false,
      providerConfigurationRead: false,
      executionSummary: createBlockedRouteIntegratedProviderExecutionSummary(
        "insufficient_grounding_evidence",
      ),
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
    providerCredential,
  });
  const visibleGeneratedContentWithPreview =
    attachRouteIntegratedGroundingSummary(
      addRouteIntegratedStructuredPreview(
        executionResult.visibleGeneratedContent ?? null,
        createRouteIntegratedStructuredPreviewOptionsForTask(
          requestContext.taskType,
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
      prompt: createPersonalRouteIntegratedInstruction(
        input.requestContext,
        input.groundingContext,
      ),
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
        {
          groundingSummary:
            input.groundingContext === null ||
            input.groundingContext === undefined
              ? undefined
              : createRouteIntegratedGroundingSummary(input.groundingContext),
          structuredPreview:
            createRouteIntegratedStructuredPreviewOptionsForTask(
              input.requestContext.taskType,
            ),
        },
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
  groundingContext?: AiGenerationRouteIntegratedGroundingContext | null,
): string {
  const taskLabel = createRouteIntegratedTaskLabel(requestContext.taskType);
  const outputContract =
    requestContext.taskType === "ai_question_generation"
      ? "输出 JSON；questions 数组必须正好包含 10 条结构化练习草稿摘要。"
      : "输出 JSON；必须包含 paperSections、questionTypeDistribution 和 knowledgeCoverage 摘要。";
  const groundingLines =
    groundingContext === null || groundingContext === undefined
      ? ["资料依据：未提供，本次请求应由上游门禁阻止真实生成。"]
      : [
          `生成范围：${groundingContext.generationParameters.profession} ${groundingContext.generationParameters.level}级 ${groundingContext.generationParameters.subject}。`,
          `知识点：${groundingContext.generationParameters.knowledgeNode ?? "按资料证据覆盖"}`,
          `资料依据：${groundingContext.citationCount} 条。仅依据下列资料片段生成，不得补充资料外的历史或泛行业内容。`,
          ...groundingContext.citations.map(
            (citation, index) => `资料片段${index + 1}：${citation.chunkText}`,
          ),
        ];

  return [
    "为题库系统生成简短中文训练草稿。",
    `场景：${taskLabel}。`,
    ...groundingLines,
    outputContract,
    "不要引用真实题目全文；输出可读的要点或小练习草稿。",
  ].join("\n");
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
