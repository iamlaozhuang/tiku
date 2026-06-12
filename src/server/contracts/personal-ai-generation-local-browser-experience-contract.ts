import type { AiGenerationTaskFailureCategory } from "../models/ai-generation-task";
import type { EvidenceStatus } from "../models/ai-rag";
import type {
  PersonalAiGenerationLocalBrowserActionType,
  PersonalAiGenerationLocalBrowserExperienceRuntimeStatus,
  PersonalAiGenerationLocalBrowserExperienceSurface,
  PersonalAiGenerationLocalBrowserRequestStateStatus,
  PersonalAiGenerationLocalBrowserResultStateStatus,
  PersonalAiGenerationLocalBrowserStateSupport,
} from "../models/personal-ai-generation-local-browser-experience";
import type { PersonalAiGenerationRequestContextSelection } from "../models/personal-ai-generation-request";
import type { PersonalAiGenerationRequestFlowStatus } from "../models/personal-ai-generation-request-flow";
import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultReferenceRedactionStatus,
} from "../models/personal-ai-generation-result-reference";
import type { PersonalAiGenerationRequestFlowDto } from "./personal-ai-generation-request-flow-contract";

export type PersonalAiGenerationLocalBrowserExperienceDto = {
  runtimeStatus: PersonalAiGenerationLocalBrowserExperienceRuntimeStatus;
  experienceSurface: PersonalAiGenerationLocalBrowserExperienceSurface;
  flowStatus: PersonalAiGenerationRequestFlowStatus;
  redactionStatus: "redacted";
  requestState: {
    status: PersonalAiGenerationLocalBrowserRequestStateStatus;
    selectedContext: PersonalAiGenerationRequestContextSelection;
    action: {
      actionType: PersonalAiGenerationLocalBrowserActionType;
      isEnabled: boolean;
      disabledReason: AiGenerationTaskFailureCategory | null;
    };
  };
  resultState: {
    status: PersonalAiGenerationLocalBrowserResultStateStatus;
    taskPublicId: string;
    resultPublicId: string | null;
    contentVisibility: PersonalAiGenerationResultContentVisibility;
    evidenceStatus: EvidenceStatus;
    citationCount: number;
    redactionStatus: PersonalAiGenerationResultReferenceRedactionStatus;
  };
  stateCoverage: {
    loadingState: PersonalAiGenerationLocalBrowserStateSupport;
    emptyState: PersonalAiGenerationLocalBrowserStateSupport;
    errorState: PersonalAiGenerationLocalBrowserStateSupport;
    permissionBlockedState: PersonalAiGenerationLocalBrowserStateSupport;
  };
  requestFlow: PersonalAiGenerationRequestFlowDto;
};
