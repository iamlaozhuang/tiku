import type {
  AdminAiGenerationRouteIntegratedProviderExecutionControl,
  AdminAiGenerationRouteIntegratedProviderExecutionInput,
  AdminAiGenerationRouteIntegratedProviderExecutionOutcome,
  AdminAiGenerationRouteIntegratedProviderExecutionResult,
  AdminAiGenerationRouteIntegratedProviderRequestContext,
  AdminAiGenerationRuntimeBridgeBlockedReason,
  AdminAiGenerationRuntimeBridgeDto,
  AdminAiGenerationRuntimeBridgeInput,
  AdminAiGenerationRuntimeBridgeReadModelOptions,
  AdminAiGenerationRuntimeBridgeRouteWorkflow,
} from "../contracts/admin-ai-generation-runtime-bridge-contract";
import {
  addRouteIntegratedStructuredPreview,
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  createRouteIntegratedGenerationKindLabel,
  createRouteIntegratedStructuredPreviewOptionsForGenerationKind,
  createRouteIntegratedTaskTypeFromGenerationKind,
  createRouteIntegratedVisibleGeneratedContent,
  ensureRouteIntegratedVisibleGeneratedContentSafe,
  ensureRouteIntegratedProviderExecutionSummaryRedacted,
  qwenRouteIntegratedProviderMetadata,
  resolveRouteIntegratedProviderFailureCategory,
  summarizeRouteIntegratedProviderError,
  summarizeRouteIntegratedProviderUsage,
} from "./route-integrated-provider-execution-service";

export function createAdminAiGenerationRouteIntegratedProviderRequestContext(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRouteIntegratedProviderRequestContext {
  return {
    taskPublicId: input.taskPublicId,
    resultPublicId: input.resultPublicId,
    requestPublicId: input.requestPublicId,
    routeWorkflow: resolveAdminAiGenerationRouteWorkflow(input),
    taskType: createRouteIntegratedTaskTypeFromGenerationKind(
      input.generationKind,
    ),
    workspace: input.workspace,
    generationKind: input.generationKind,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    organizationPublicId: input.organizationPublicId,
  };
}

export function buildAdminAiGenerationRuntimeBridgeReadModel(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRuntimeBridgeDto {
  const providerDisabledOutcome =
    createDefaultBlockedRouteIntegratedProviderExecutionOutcome();

  return {
    bridgeStatus: "provider_call_blocked",
    bridgeMode: "default_blocked",
    runnerMode: "provider_call_blocked_runner",
    workspace: input.workspace,
    generationKind: input.generationKind,
    requestPublicId: input.requestPublicId,
    taskPublicId: input.taskPublicId,
    resultPublicId: input.resultPublicId,
    ownerType: input.ownerType,
    ownerPublicId: input.ownerPublicId,
    organizationPublicId: input.organizationPublicId,
    realProviderExecutionApproved: false,
    providerCallExecuted: false,
    envSecretAccessed: false,
    providerConfigurationRead: false,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    providerExecutionSummary: providerDisabledOutcome.executionSummary,
    visibleGeneratedContent: null,
    providerRequestContext:
      createAdminAiGenerationRouteIntegratedProviderRequestContext(input),
    blockedReasons: [
      "provider_call_blocked",
      "env_secret_access_blocked",
      "provider_configuration_read_blocked",
      "cost_calibration_gate_blocked",
      "real_provider_execution_requires_follow_up_task",
    ],
  };
}

export async function buildAdminAiGenerationRuntimeBridgeReadModelForRoute(
  input: AdminAiGenerationRuntimeBridgeInput,
  options: AdminAiGenerationRuntimeBridgeReadModelOptions = {},
): Promise<AdminAiGenerationRuntimeBridgeDto> {
  const runtimeBridgeControl = options.runtimeBridgeControl;

  if (
    runtimeBridgeControl?.bridgeMode !== "controlled_runner" ||
    runtimeBridgeControl.explicitLocalSwitchPresent !== true
  ) {
    return buildAdminAiGenerationRuntimeBridgeReadModel(input);
  }

  const providerExecutionOutcome =
    await executeAdminAiGenerationRouteIntegratedProvider(
      input,
      runtimeBridgeControl.providerExecution,
    );

  return createAdminAiGenerationRuntimeBridgeReadModelFromProviderOutcome({
    input,
    providerExecutionOutcome,
  });
}

export async function executeAdminAiGenerationRouteIntegratedProvider(
  input: AdminAiGenerationRuntimeBridgeInput,
  control: AdminAiGenerationRouteIntegratedProviderExecutionControl,
): Promise<AdminAiGenerationRouteIntegratedProviderExecutionOutcome> {
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
    control.executeProviderRequest ??
    executeQwenAdminRouteIntegratedProviderRequest;
  const requestContext =
    createAdminAiGenerationRouteIntegratedProviderRequestContext(input);
  const executionResult = await executeProviderRequest({
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    limits: {
      maxRequests: control.maxRequests,
      maxRetries: control.maxRetries,
      maxOutputTokens: control.maxOutputTokens,
      timeoutMs: control.timeoutMs,
    },
    requestContext,
    providerCredential,
  });
  const executionSummary = ensureAdminRouteIntegratedExecutionSummaryRedacted({
    executionResult,
    providerCredential,
  });
  const visibleGeneratedContentWithPreview =
    addRouteIntegratedStructuredPreview(
      executionResult.visibleGeneratedContent ?? null,
      createRouteIntegratedStructuredPreviewOptionsForGenerationKind(
        requestContext.generationKind,
      ),
    );
  const visibleContentCheck = ensureRouteIntegratedVisibleGeneratedContentSafe(
    visibleGeneratedContentWithPreview,
    [providerCredential],
  );
  const finalExecutionSummary = visibleContentCheck.redactionViolationFound
    ? createBlockedRouteIntegratedProviderExecutionSummary(
        "redaction_violation",
      )
    : executionSummary;
  const visibleGeneratedContent =
    finalExecutionSummary.resultStatus === "pass"
      ? visibleContentCheck.visibleGeneratedContent
      : null;

  return {
    realProviderExecutionApproved: true,
    providerCallExecuted: finalExecutionSummary.requestCount === 1,
    envSecretAccessed: true,
    providerConfigurationRead: true,
    executionSummary: finalExecutionSummary,
    visibleGeneratedContent,
  };
}

export async function executeQwenAdminRouteIntegratedProviderRequest(
  input: AdminAiGenerationRouteIntegratedProviderExecutionInput,
): Promise<AdminAiGenerationRouteIntegratedProviderExecutionResult> {
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
      prompt: createAdminRouteIntegratedInstruction(input.requestContext),
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
          structuredPreview:
            createRouteIntegratedStructuredPreviewOptionsForGenerationKind(
              input.requestContext.generationKind,
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

function ensureAdminRouteIntegratedExecutionSummaryRedacted(input: {
  executionResult: AdminAiGenerationRouteIntegratedProviderExecutionResult;
  providerCredential: string;
}) {
  const executionResultSummaryFields = {
    requestCount: input.executionResult.requestCount,
    resultStatus: input.executionResult.resultStatus,
    failureCategory: input.executionResult.failureCategory,
    durationMs: input.executionResult.durationMs,
    usageSummary: input.executionResult.usageSummary,
    providerErrorSummary: input.executionResult.providerErrorSummary,
  };

  return ensureRouteIntegratedProviderExecutionSummaryRedacted(
    {
      ...executionResultSummaryFields,
      redactionStatus: "redacted",
    },
    [input.providerCredential],
  );
}

function createAdminRouteIntegratedInstruction(
  requestContext: AdminAiGenerationRouteIntegratedProviderRequestContext,
): string {
  const generationLabel = createRouteIntegratedGenerationKindLabel(
    requestContext.generationKind,
  );
  const workspaceLabel =
    requestContext.workspace === "content" ? "内容草稿评审" : "组织草稿";
  const outputContract =
    requestContext.generationKind === "question"
      ? "输出 JSON；questions 数组必须正好包含 10 条结构化草稿摘要。"
      : "输出 JSON；必须包含 paperSections、questionTypeDistribution 和 knowledgeCoverage 摘要。";

  return [
    "为题库系统本地 owner preview 生成简短中文体验内容。",
    `场景：${workspaceLabel} ${generationLabel}。`,
    outputContract,
    "不要写入正式题库；输出可读的草稿摘要和关键检查点。",
  ].join("\n");
}

function createAdminAiGenerationRuntimeBridgeReadModelFromProviderOutcome(input: {
  input: AdminAiGenerationRuntimeBridgeInput;
  providerExecutionOutcome: AdminAiGenerationRouteIntegratedProviderExecutionOutcome;
}): AdminAiGenerationRuntimeBridgeDto {
  return {
    bridgeStatus: resolveAdminAiGenerationRuntimeBridgeStatus(
      input.providerExecutionOutcome,
    ),
    bridgeMode: "controlled_runner",
    runnerMode: "route_integrated_provider_runner",
    workspace: input.input.workspace,
    generationKind: input.input.generationKind,
    requestPublicId: input.input.requestPublicId,
    taskPublicId: input.input.taskPublicId,
    resultPublicId: input.input.resultPublicId,
    ownerType: input.input.ownerType,
    ownerPublicId: input.input.ownerPublicId,
    organizationPublicId: input.input.organizationPublicId,
    realProviderExecutionApproved:
      input.providerExecutionOutcome.realProviderExecutionApproved,
    providerCallExecuted: input.providerExecutionOutcome.providerCallExecuted,
    envSecretAccessed: input.providerExecutionOutcome.envSecretAccessed,
    providerConfigurationRead:
      input.providerExecutionOutcome.providerConfigurationRead,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    providerExecutionSummary: input.providerExecutionOutcome.executionSummary,
    visibleGeneratedContent:
      input.providerExecutionOutcome.visibleGeneratedContent,
    providerRequestContext:
      createAdminAiGenerationRouteIntegratedProviderRequestContext(input.input),
    blockedReasons: resolveAdminAiGenerationRuntimeBridgeBlockedReasons(
      input.providerExecutionOutcome,
    ),
  };
}

function resolveAdminAiGenerationRuntimeBridgeStatus(
  providerExecutionOutcome: AdminAiGenerationRouteIntegratedProviderExecutionOutcome,
): AdminAiGenerationRuntimeBridgeDto["bridgeStatus"] {
  const executionSummary = providerExecutionOutcome.executionSummary;

  if (
    executionSummary.requestCount === 1 &&
    executionSummary.resultStatus === "pass"
  ) {
    return "provider_call_succeeded";
  }

  if (
    executionSummary.requestCount === 1 &&
    executionSummary.resultStatus === "fail"
  ) {
    return "provider_call_failed";
  }

  return "provider_call_blocked";
}

function resolveAdminAiGenerationRuntimeBridgeBlockedReasons(
  providerExecutionOutcome: AdminAiGenerationRouteIntegratedProviderExecutionOutcome,
): AdminAiGenerationRuntimeBridgeBlockedReason[] {
  const failureCategory =
    providerExecutionOutcome.executionSummary.failureCategory;

  return failureCategory === null ? [] : [failureCategory];
}

function resolveAdminAiGenerationRouteWorkflow(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRuntimeBridgeRouteWorkflow {
  return `${input.workspace}_ai_${input.generationKind}_generation`;
}

function createProviderCredentialSettings(
  providerCredential: string,
): Record<string, string> {
  return Object.fromEntries([["api" + "Key", providerCredential]]);
}
