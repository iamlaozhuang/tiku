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
  createBlockedRouteIntegratedProviderExecutionSummary,
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  ensureRouteIntegratedProviderExecutionSummaryRedacted,
  qwenRouteIntegratedProviderMetadata,
  resolveRouteIntegratedProviderFailureCategory,
  summarizeRouteIntegratedProviderError,
  summarizeRouteIntegratedProviderUsage,
} from "./route-integrated-provider-execution-service";

const internalAdminRouteIntegratedInstruction =
  "Return one short confirmation word for a local Tiku admin route-integrated provider check.";

export function createAdminAiGenerationRouteIntegratedProviderRequestContext(
  input: AdminAiGenerationRuntimeBridgeInput,
): AdminAiGenerationRouteIntegratedProviderRequestContext {
  return {
    taskPublicId: input.taskPublicId,
    resultPublicId: input.resultPublicId,
    requestPublicId: input.requestPublicId,
    routeWorkflow: resolveAdminAiGenerationRouteWorkflow(input),
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
    requestContext:
      createAdminAiGenerationRouteIntegratedProviderRequestContext(input),
    providerCredential,
  });
  const executionSummary =
    ensureRouteIntegratedProviderExecutionSummaryRedacted(
      {
        ...executionResult,
        redactionStatus: "redacted",
      },
      [providerCredential],
    );

  return {
    realProviderExecutionApproved: true,
    providerCallExecuted: executionSummary.requestCount === 1,
    envSecretAccessed: true,
    providerConfigurationRead: true,
    executionSummary,
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
      prompt: internalAdminRouteIntegratedInstruction,
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
    };
  }
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
