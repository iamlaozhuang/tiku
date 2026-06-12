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
import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";

function mapPersonalAiGenerationRequestFlowToLocalBrowserExperience(
  requestFlow: PersonalAiGenerationRequestFlowDto,
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
    requestFlow,
  };
}

export function buildPersonalAiGenerationLocalBrowserExperienceReadModel(
  input: unknown,
): ApiResponse<PersonalAiGenerationLocalBrowserExperienceDto | null> {
  const requestFlow = buildPersonalAiGenerationRequestFlowReadModel(input);

  if (requestFlow.code !== 0 || requestFlow.data === null) {
    return createErrorResponse(requestFlow.code, requestFlow.message);
  }

  return createSuccessResponse(
    mapPersonalAiGenerationRequestFlowToLocalBrowserExperience(
      requestFlow.data,
    ),
  );
}
