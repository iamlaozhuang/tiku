import type { AiFuncType } from "./ai-rag";
import type {
  AiGenerationTaskRequestAuthorizationSource,
  AiGenerationTaskRequestOwnerType,
} from "./ai-generation-task-request";
import type { AiGenerationRouteIntegratedGenerationParameters } from "../contracts/route-integrated-provider-execution-contract";

export type PersonalAiGenerationFuncType = Exclude<AiFuncType, "scoring">;

export type PersonalAiGenerationRuntimeStatus = "local_contract_only";

export type PersonalAiGenerationRequestContextType =
  | "none"
  | "paper"
  | "mock_exam";

export type PersonalAiGenerationRequestContextSelection = {
  contextType: PersonalAiGenerationRequestContextType;
  contextPublicId: string | null;
};

export type PersonalAiGenerationRequestInput = {
  userPublicId: string;
  authorizationSource: AiGenerationTaskRequestAuthorizationSource;
  authorizationPublicId: string;
  ownerType: AiGenerationTaskRequestOwnerType;
  ownerPublicId: string;
  organizationPublicId: string | null;
  quotaOwnerType: AiGenerationTaskRequestOwnerType;
  quotaOwnerPublicId: string;
  aiFuncType: PersonalAiGenerationFuncType | null;
  questionPublicId: string | null;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  generationParameters: AiGenerationRouteIntegratedGenerationParameters | null;
};

export function resolvePersonalAiGenerationRequestContextSelection(
  input: Pick<
    PersonalAiGenerationRequestInput,
    "paperPublicId" | "mockExamPublicId"
  >,
): PersonalAiGenerationRequestContextSelection {
  if (input.paperPublicId !== null) {
    return {
      contextType: "paper",
      contextPublicId: input.paperPublicId,
    };
  }

  if (input.mockExamPublicId !== null) {
    return {
      contextType: "mock_exam",
      contextPublicId: input.mockExamPublicId,
    };
  }

  return {
    contextType: "none",
    contextPublicId: null,
  };
}
