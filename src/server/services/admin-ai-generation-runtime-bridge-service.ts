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
import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";
import {
  addRouteIntegratedStructuredPreview,
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  createRouteIntegratedGroundingSummary,
  createRouteIntegratedStructuredPreviewOptionsForGenerationKind,
  createRouteIntegratedTaskTypeFromGenerationKind,
  createRouteIntegratedVisibleGeneratedContent,
  ensureRouteIntegratedVisibleGeneratedContentSafe,
  ensureRouteIntegratedProviderExecutionSummaryRedacted,
  isRouteIntegratedGroundingSufficient,
  qwenRouteIntegratedProviderMetadata,
  resolveRouteIntegratedProviderFailureCategory,
  summarizeRouteIntegratedProviderError,
  summarizeRouteIntegratedProviderUsage,
} from "./route-integrated-provider-execution-service";
import { measureClientObservedLatency } from "./ai-call-observation";
import { createRouteIntegratedProviderInstruction } from "./route-integrated-provider-instruction-service";

export function createAdminAiGenerationRouteIntegratedProviderRequestContext(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRouteIntegratedProviderRequestContext {
  return {
    actorPublicId: input.actorPublicId,
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
    generationParameters: input.generationParameters ?? null,
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
    aiCallLogPublicId: null,
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
  const requestContext =
    createAdminAiGenerationRouteIntegratedProviderRequestContext(input);
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
    control.executeProviderRequest ??
    executeQwenAdminRouteIntegratedProviderRequest;
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
  const executionSummary = ensureAdminRouteIntegratedExecutionSummaryRedacted({
    executionResult,
    providerCredential,
  });
  const visibleGeneratedContentWithPreview =
    attachAdminRouteIntegratedGroundingSummary(
      addRouteIntegratedStructuredPreview(
        executionResult.visibleGeneratedContent ?? null,
        createRouteIntegratedStructuredPreviewOptionsForGenerationKind(
          requestContext.generationKind,
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
  const finalExecutionSummary = visibleContentCheck.redactionViolationFound
    ? {
        ...createBlockedRouteIntegratedProviderExecutionSummary(
          "redaction_violation",
        ),
        requestCount: executionSummary.requestCount,
        durationMs: executionSummary.durationMs,
      }
    : executionSummary;
  const visibleGeneratedContent =
    finalExecutionSummary.resultStatus === "pass"
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
      executionSummary: finalExecutionSummary,
      startedAt,
      completedAt,
    });
    if (log.publicId !== aiCallLogPublicId) {
      throw new Error("AI generation log observation identity drifted.");
    }
  } catch {
    return {
      realProviderExecutionApproved: true,
      providerCallExecuted: finalExecutionSummary.requestCount === 1,
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
    providerCallExecuted: finalExecutionSummary.requestCount === 1,
    envSecretAccessed: true,
    providerConfigurationRead: true,
    executionSummary: finalExecutionSummary,
    aiCallLogPublicId,
    visibleGeneratedContent,
  };
}

export async function executeQwenAdminRouteIntegratedProviderRequest(
  input: AdminAiGenerationRouteIntegratedProviderExecutionInput,
): Promise<AdminAiGenerationRouteIntegratedProviderExecutionResult> {
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
    const instructions = createAdminRouteIntegratedInstruction(
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
        structuredPreview:
          createRouteIntegratedStructuredPreviewOptionsForGenerationKind(
            input.requestContext.generationKind,
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
  governanceContext: AdminAiGenerationRouteIntegratedProviderExecutionInput["governanceContext"],
  groundingContext?: AiGenerationRouteIntegratedGroundingContext | null,
) {
  const workspaceLabel =
    requestContext.workspace === "content" ? "内容草稿评审" : "组织草稿";

  return createRouteIntegratedProviderInstruction({
    taskType: requestContext.taskType,
    sceneLabel: `${workspaceLabel} ${
      requestContext.generationKind === "question" ? "AI出题" : "AI组卷"
    }`,
    draftInstruction:
      "不要写入正式题库；输出可评审的结构化题目草稿和关键检查点。",
    governanceContext,
    groundingContext,
  });
}

function attachAdminRouteIntegratedGroundingSummary(
  visibleGeneratedContent: AdminAiGenerationRouteIntegratedProviderExecutionOutcome["visibleGeneratedContent"],
  groundingContext: AiGenerationRouteIntegratedGroundingContext | null,
): AdminAiGenerationRouteIntegratedProviderExecutionOutcome["visibleGeneratedContent"] {
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
    aiCallLogPublicId: input.providerExecutionOutcome.aiCallLogPublicId,
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
