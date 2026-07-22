import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { PersonalAiGenerationLocalBrowserExperienceDto } from "../contracts/personal-ai-generation-local-browser-experience-contract";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import {
  resolvePersonalAiGenerationLocalBrowserActionEnabled,
  resolvePersonalAiGenerationLocalBrowserRequestStateStatus,
  resolvePersonalAiGenerationLocalBrowserResultStateStatus,
} from "../models/personal-ai-generation-local-browser-experience";
import {
  buildPersonalAiGenerationRuntimeBridgeReadModel,
  buildPersonalAiGenerationRuntimeBridgeReadModelForRoute,
  type PersonalAiGenerationRuntimeBridgeOptions,
} from "./personal-ai-generation-runtime-bridge-service";
import type { PersonalAiGenerationRuntimeBridgeDto } from "../contracts/personal-ai-generation-runtime-bridge-contract";
import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";

function mapPersonalAiGenerationRequestFlowToLocalBrowserExperience(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions,
): PersonalAiGenerationLocalBrowserExperienceDto {
  const resultReference = requestFlow.resultReference.resultReference;

  return {
    runtimeStatus: "local_contract_only",
    experienceSurface: "student_local_browser",
    flowStatus: requestFlow.flowStatus,
    redactionStatus: "redacted",
    requestState: {
      status: resolvePersonalAiGenerationLocalBrowserRequestStateStatus(
        requestFlow.flowStatus,
      ),
      selectedContext: requestFlow.contextSelection.selectedContext,
      contextReferences: requestFlow.contextSelection.contextReferences,
      action: {
        actionType: "submit_personal_ai_generation_request",
        isEnabled: resolvePersonalAiGenerationLocalBrowserActionEnabled(
          requestFlow.flowStatus,
        ),
        disabledReason: requestFlow.taskRequest.blockedFailureCategory,
      },
    },
    resultState: {
      status: resolvePersonalAiGenerationLocalBrowserResultStateStatus(
        requestFlow.flowStatus,
        requestFlow.resultReference.status,
      ),
      taskPublicId: requestFlow.resultReference.taskPublicId,
      resultPublicId: resultReference.resultPublicId,
      contentVisibility: resultReference.contentVisibility,
      isFormalAdoptionBlocked: resultReference.isFormalAdoptionBlocked,
      evidenceStatus: resultReference.evidenceStatus,
      citationCount: resultReference.citationCount,
      redactionStatus: resultReference.redactionStatus,
    },
    stateCoverage: {
      loadingState: "supported",
      emptyState: "supported",
      errorState: "supported",
      permissionBlockedState: "supported",
    },
    runtimeBridge: buildPersonalAiGenerationRuntimeBridgeReadModel(
      requestFlow,
      options,
    ),
    requestFlow,
  };
}

function resolveRouteResultState(
  localBrowserExperience: PersonalAiGenerationLocalBrowserExperienceDto,
  runtimeBridge: PersonalAiGenerationRuntimeBridgeDto,
): PersonalAiGenerationLocalBrowserExperienceDto["resultState"] {
  const materializationSummary = runtimeBridge.resultMaterializationSummary;

  if (
    materializationSummary.materializationStatus === "created" ||
    materializationSummary.materializationStatus === "reused"
  ) {
    return {
      ...localBrowserExperience.resultState,
      status: "succeeded",
      resultPublicId: materializationSummary.resultPublicId,
      evidenceStatus: materializationSummary.evidenceStatus,
      citationCount: materializationSummary.citationCount,
      redactionStatus: materializationSummary.redactionStatus,
    };
  }

  if (runtimeBridge.providerExecutionSummary.resultStatus === "fail") {
    return {
      ...localBrowserExperience.resultState,
      status: "failed",
    };
  }

  if (
    runtimeBridge.providerExecutionSummary.resultStatus === "blocked" &&
    runtimeBridge.providerExecutionSummary.failureCategory !==
      "provider_call_blocked"
  ) {
    return {
      ...localBrowserExperience.resultState,
      status: "failed",
    };
  }

  if (
    runtimeBridge.providerCallExecuted &&
    runtimeBridge.providerExecutionSummary.resultStatus === "pass" &&
    runtimeBridge.visibleGeneratedContent !== null
  ) {
    return {
      ...localBrowserExperience.resultState,
      status: "failed",
      evidenceStatus:
        runtimeBridge.visibleGeneratedContent.groundingSummary
          ?.evidenceStatus ?? localBrowserExperience.resultState.evidenceStatus,
      citationCount:
        runtimeBridge.visibleGeneratedContent.groundingSummary?.citationCount ??
        localBrowserExperience.resultState.citationCount,
    };
  }

  return localBrowserExperience.resultState;
}

async function mapPersonalAiGenerationRequestFlowToRouteLocalBrowserExperience(
  requestFlow: PersonalAiGenerationRequestFlowDto,
  options: PersonalAiGenerationRuntimeBridgeOptions,
): Promise<PersonalAiGenerationLocalBrowserExperienceDto> {
  const localBrowserExperience =
    mapPersonalAiGenerationRequestFlowToLocalBrowserExperience(
      requestFlow,
      options,
    );

  if (requestFlow.flowStatus === "reused") {
    return localBrowserExperience;
  }

  const runtimeBridge =
    await buildPersonalAiGenerationRuntimeBridgeReadModelForRoute(
      requestFlow,
      options,
    );

  return {
    ...localBrowserExperience,
    resultState: resolveRouteResultState(localBrowserExperience, runtimeBridge),
    runtimeBridge,
  };
}

export function buildPersonalAiGenerationLocalBrowserExperienceReadModel(
  input: unknown,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): ApiResponse<PersonalAiGenerationLocalBrowserExperienceDto | null> {
  const requestFlow = buildPersonalAiGenerationRequestFlowReadModel(input);

  if (requestFlow.code !== 0 || requestFlow.data === null) {
    return createErrorResponse(requestFlow.code, requestFlow.message);
  }

  return createSuccessResponse(
    mapPersonalAiGenerationRequestFlowToLocalBrowserExperience(
      requestFlow.data,
      options,
    ),
  );
}

export async function buildPersonalAiGenerationLocalBrowserExperienceReadModelForRoute(
  input: unknown,
  options: PersonalAiGenerationRuntimeBridgeOptions = {},
): Promise<ApiResponse<PersonalAiGenerationLocalBrowserExperienceDto | null>> {
  const requestFlow = buildPersonalAiGenerationRequestFlowReadModel(input);

  if (requestFlow.code !== 0 || requestFlow.data === null) {
    return createErrorResponse(requestFlow.code, requestFlow.message);
  }

  return createSuccessResponse(
    await mapPersonalAiGenerationRequestFlowToRouteLocalBrowserExperience(
      requestFlow.data,
      options,
    ),
  );
}
