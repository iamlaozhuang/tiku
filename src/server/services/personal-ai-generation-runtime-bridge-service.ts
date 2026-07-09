import type {
  PersonalAiGenerationRuntimeBridgeDto,
  PersonalAiGenerationRuntimeBridgePaperAssemblyDto,
} from "../contracts/personal-ai-generation-runtime-bridge-contract";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";
import type { AiPaperAssemblyRole } from "../contracts/ai-paper-plan-and-select-contract";
import { createAiCallLogRedactedSnapshots } from "../models/ai-rag";
import {
  createDefaultBlockedRouteIntegratedProviderExecutionOutcome,
  executePersonalAiGenerationRouteIntegratedProvider,
  qwenRouteIntegratedProviderMetadata,
  type PersonalAiGenerationRouteIntegratedProviderExecutionControl,
  type PersonalAiGenerationRouteIntegratedProviderExecutionOutcome,
} from "./personal-ai-generation-route-integrated-provider-execution-service";
import {
  createDefaultBlockedRouteIntegratedResultMaterializationSummary,
  materializeRouteIntegratedRedactedResult,
  type PersonalAiGenerationRouteIntegratedResultMaterializationControl,
} from "./personal-ai-generation-route-integrated-result-materialization-service";
import type { AiPaperRoutePlanSelectWiringResult } from "./ai-paper-route-plan-select-wiring-service";

type PersonalAiGenerationPaperAssemblyRole = Extract<
  AiPaperAssemblyRole,
  "personal_advanced_student" | "org_advanced_employee"
>;

export type PersonalAiGenerationPaperAssemblyResolverInput = {
  requestFlow: PersonalAiGenerationRequestFlowDto;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters;
  visibleGeneratedContent: PersonalAiGenerationRouteIntegratedProviderExecutionOutcome["visibleGeneratedContent"];
};

export type PersonalAiGenerationPaperAssemblyResolver = (
  input: PersonalAiGenerationPaperAssemblyResolverInput,
) =>
  | AiPaperRoutePlanSelectWiringResult
  | Promise<AiPaperRoutePlanSelectWiringResult>;

type PersonalAiGenerationPaperAssemblyResolveResult =
  | {
      status: "resolved" | "not_applicable";
      paperAssembly: PersonalAiGenerationRuntimeBridgePaperAssemblyDto;
    }
  | {
      status: "rejected";
      paperAssembly: null;
    };

export type PersonalAiGenerationRuntimeBridgeControl = {
  bridgeMode: "controlled_runner";
  explicitLocalSwitchPresent: true;
  providerExecution?: PersonalAiGenerationRouteIntegratedProviderExecutionControl;
  resultMaterialization?: PersonalAiGenerationRouteIntegratedResultMaterializationControl;
  createResultMaterialization?: (input: {
    executionOutcome: PersonalAiGenerationRouteIntegratedProviderExecutionOutcome;
    paperAssembly: PersonalAiGenerationRuntimeBridgePaperAssemblyDto;
    requestFlow: PersonalAiGenerationRequestFlowDto;
  }) =>
    | PersonalAiGenerationRouteIntegratedResultMaterializationControl
    | null
    | Promise<PersonalAiGenerationRouteIntegratedResultMaterializationControl | null>;
  paperAssemblyResolver?: PersonalAiGenerationPaperAssemblyResolver;
};

export type PersonalAiGenerationRuntimeBridgeOptions = {
  runtimeBridgeControl?: PersonalAiGenerationRuntimeBridgeControl;
};

function createRuntimeBridgeRedactionProbe(
  requestFlow: PersonalAiGenerationRequestFlowDto,
): PersonalAiGenerationRuntimeBridgeDto["redactionProbe"] {
  const redactedSnapshots = createAiCallLogRedactedSnapshots({
    prompt: {
      aiFuncType: requestFlow.request.aiFuncType,
      questionPublicId: requestFlow.request.generationContext.questionPublicId,
      taskPublicId: requestFlow.resultReference.taskPublicId,
    },
    userAnswer: {
      answerRecordPublicId:
        requestFlow.request.generationContext.answerRecordPublicId,
      selectedContext: requestFlow.contextSelection.selectedContext.contextType,
    },
    modelOutput: null,
    citations: [],
    providerRequestPayload: null,
    providerResponsePayload: null,
    providerErrorPayload: null,
  });

  return {
    requestContext: redactedSnapshots.userAnswer,
    modelOutput: redactedSnapshots.modelOutput,
    providerRequestPayload: null,
    providerResponsePayload: null,
    providerErrorPayload: null,
  };
}

function mapRuntimeBridgeOutcomeToStatus(
  executionOutcome: PersonalAiGenerationRouteIntegratedProviderExecutionOutcome,
): PersonalAiGenerationRuntimeBridgeDto["bridgeStatus"] {
  if (!executionOutcome.providerCallExecuted) {
    return "controlled_runner_ready";
  }

  return executionOutcome.executionSummary.resultStatus === "pass"
    ? "provider_call_succeeded"
    : "provider_call_failed";
}

function buildPersonalAiGenerationRuntimeBridgeDto(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): PersonalAiGenerationRuntimeBridgeDto {
  const isControlledRunnerEnabled =
    options.runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    options.runtimeBridgeControl.explicitLocalSwitchPresent;
  const executionOutcome =
    createDefaultBlockedRouteIntegratedProviderExecutionOutcome();

  return {
    bridgeStatus: isControlledRunnerEnabled
      ? "controlled_runner_ready"
      : "provider_call_blocked",
    bridgeMode: isControlledRunnerEnabled
      ? "controlled_runner"
      : "default_blocked",
    runnerMode: isControlledRunnerEnabled
      ? "deterministic_fake_runner"
      : "provider_call_blocked_runner",
    localSwitchRequired: true,
    explicitLocalSwitchPresent: isControlledRunnerEnabled,
    realProviderExecutionApproved:
      executionOutcome.realProviderExecutionApproved,
    providerCallExecuted: executionOutcome.providerCallExecuted,
    envSecretAccessed: executionOutcome.envSecretAccessed,
    providerConfigurationRead: executionOutcome.providerConfigurationRead,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    redactionProbe: createRuntimeBridgeRedactionProbe(requestFlow),
    providerExecutionSummary: executionOutcome.executionSummary,
    resultMaterializationSummary:
      createDefaultBlockedRouteIntegratedResultMaterializationSummary(),
    visibleGeneratedContent: null,
    paperAssembly: null,
    blockedReasons: isControlledRunnerEnabled
      ? ["real_provider_execution_requires_fresh_approval"]
      : [
          "explicit_local_switch_required",
          "provider_call_blocked",
          "env_secret_access_blocked",
          "real_provider_execution_requires_fresh_approval",
        ],
  };
}

export function buildPersonalAiGenerationRuntimeBridgeReadModel(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): PersonalAiGenerationRuntimeBridgeDto {
  return buildPersonalAiGenerationRuntimeBridgeDto(requestFlow, options);
}

export async function buildPersonalAiGenerationRuntimeBridgeReadModelForRoute(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): Promise<PersonalAiGenerationRuntimeBridgeDto> {
  const isControlledRunnerEnabled =
    options.runtimeBridgeControl?.bridgeMode === "controlled_runner" &&
    options.runtimeBridgeControl.explicitLocalSwitchPresent;
  const providerExecutionControl =
    options.runtimeBridgeControl?.providerExecution;
  const staticResultMaterializationControl =
    options.runtimeBridgeControl?.resultMaterialization;
  const createResultMaterializationControl =
    options.runtimeBridgeControl?.createResultMaterialization;

  if (
    !isControlledRunnerEnabled ||
    (providerExecutionControl === undefined &&
      staticResultMaterializationControl === undefined &&
      createResultMaterializationControl === undefined)
  ) {
    return buildPersonalAiGenerationRuntimeBridgeReadModel(
      requestFlow,
      options,
    );
  }

  if (
    providerExecutionControl === undefined &&
    staticResultMaterializationControl !== undefined
  ) {
    const bridge = buildPersonalAiGenerationRuntimeBridgeReadModel(
      requestFlow,
      options,
    );

    return {
      ...bridge,
      resultMaterializationSummary:
        await materializeRouteIntegratedRedactedResult(
          requestFlow,
          staticResultMaterializationControl,
        ),
    };
  }

  if (providerExecutionControl === undefined) {
    return buildPersonalAiGenerationRuntimeBridgeReadModel(
      requestFlow,
      options,
    );
  }

  const executionOutcome =
    await executePersonalAiGenerationRouteIntegratedProvider(
      requestFlow,
      providerExecutionControl,
    );
  const paperAssemblyResult = await resolvePersonalAiGenerationPaperAssembly({
    executionOutcome,
    paperAssemblyResolver: options.runtimeBridgeControl?.paperAssemblyResolver,
    requestFlow,
  });
  const resultMaterializationControl =
    paperAssemblyResult.status === "rejected"
      ? null
      : (staticResultMaterializationControl ??
        (createResultMaterializationControl === undefined
          ? null
          : await createResultMaterializationControl({
              executionOutcome,
              paperAssembly: paperAssemblyResult.paperAssembly,
              requestFlow,
            })));
  const resultMaterializationSummary =
    resultMaterializationControl !== null &&
    executionOutcome.providerCallExecuted &&
    executionOutcome.executionSummary.resultStatus === "pass"
      ? await materializeRouteIntegratedRedactedResult(
          requestFlow,
          resultMaterializationControl,
        )
      : createDefaultBlockedRouteIntegratedResultMaterializationSummary();

  return {
    bridgeStatus: mapRuntimeBridgeOutcomeToStatus(executionOutcome),
    bridgeMode: "controlled_runner",
    runnerMode: "route_integrated_provider_runner",
    localSwitchRequired: true,
    explicitLocalSwitchPresent: true,
    realProviderExecutionApproved:
      executionOutcome.realProviderExecutionApproved,
    providerCallExecuted: executionOutcome.providerCallExecuted,
    envSecretAccessed: executionOutcome.envSecretAccessed,
    providerConfigurationRead: executionOutcome.providerConfigurationRead,
    providerRetryAttempted: false,
    providerStreamingEnabled: false,
    costCalibrationExecuted: false,
    redactionStatus: "redacted",
    providerMetadata: qwenRouteIntegratedProviderMetadata,
    redactionProbe: createRuntimeBridgeRedactionProbe(requestFlow),
    providerExecutionSummary: executionOutcome.executionSummary,
    resultMaterializationSummary,
    visibleGeneratedContent: executionOutcome.visibleGeneratedContent,
    paperAssembly: paperAssemblyResult.paperAssembly,
    blockedReasons: executionOutcome.providerCallExecuted
      ? []
      : executionOutcome.executionSummary.failureCategory === null
        ? ["real_provider_execution_requires_fresh_approval"]
        : [executionOutcome.executionSummary.failureCategory],
  };
}

async function resolvePersonalAiGenerationPaperAssembly(input: {
  executionOutcome: PersonalAiGenerationRouteIntegratedProviderExecutionOutcome;
  paperAssemblyResolver: PersonalAiGenerationPaperAssemblyResolver | undefined;
  requestFlow: PersonalAiGenerationRequestFlowDto;
}): Promise<PersonalAiGenerationPaperAssemblyResolveResult> {
  const generationParameters = input.requestFlow.request.generationParameters;

  if (
    input.requestFlow.resultReference.taskType !== "ai_paper_generation" ||
    generationParameters === null ||
    input.paperAssemblyResolver === undefined ||
    !input.executionOutcome.providerCallExecuted ||
    input.executionOutcome.executionSummary.resultStatus !== "pass"
  ) {
    return {
      status: "not_applicable",
      paperAssembly: null,
    };
  }

  const result = await input.paperAssemblyResolver({
    requestFlow: input.requestFlow,
    generationParameters,
    visibleGeneratedContent: input.executionOutcome.visibleGeneratedContent,
  });

  if (
    result.status === "rejected" ||
    !isPersonalAiGenerationPaperAssemblyRole(result.sourceDiagnostics.role)
  ) {
    return {
      status: "rejected",
      paperAssembly: null,
    };
  }

  return {
    status: "resolved",
    paperAssembly: {
      status: result.status,
      sourceDiagnostics: {
        role: result.sourceDiagnostics.role,
        platformQuestionCount: result.sourceDiagnostics.platformQuestionCount,
        enterpriseQuestionCount:
          result.sourceDiagnostics.enterpriseQuestionCount,
        enterpriseSourceStatus: result.sourceDiagnostics.enterpriseSourceStatus,
      },
      container: result.assembly.container,
      insufficiency: result.assembly.insufficiency,
      redactionStatus: "redacted",
    },
  };
}

function isPersonalAiGenerationPaperAssemblyRole(
  role: AiPaperAssemblyRole,
): role is PersonalAiGenerationPaperAssemblyRole {
  return (
    role === "personal_advanced_student" || role === "org_advanced_employee"
  );
}
