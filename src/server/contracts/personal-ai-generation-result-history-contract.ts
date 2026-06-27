import type { PersonalAiGenerationResultDto } from "./personal-ai-generation-result-persistence-contract";
import type { PersonalAiGenerationPrivateUseBoundaryDto } from "./personal-ai-generation-result-reference-contract";
import type {
  PersonalAiGenerationResultHistoryContentVisibility,
  PersonalAiGenerationResultHistoryFormalAdoptionWriteStatus,
  PersonalAiGenerationResultHistoryRedactionStatus,
  PersonalAiGenerationResultHistoryRuntimeStatus,
} from "../models/personal-ai-generation-result-history";

export type PersonalAiGenerationResultHistoryDto = {
  runtimeStatus: PersonalAiGenerationResultHistoryRuntimeStatus;
  contentVisibility: PersonalAiGenerationResultHistoryContentVisibility;
  redactionStatus: PersonalAiGenerationResultHistoryRedactionStatus;
  formalAdoptionWriteStatus: PersonalAiGenerationResultHistoryFormalAdoptionWriteStatus;
  privateUseBoundary: PersonalAiGenerationPrivateUseBoundaryDto;
  results: PersonalAiGenerationResultDto[];
};

export type PersonalAiGenerationResultDetailDto = {
  runtimeStatus: PersonalAiGenerationResultHistoryRuntimeStatus;
  contentVisibility: PersonalAiGenerationResultHistoryContentVisibility;
  redactionStatus: PersonalAiGenerationResultHistoryRedactionStatus;
  formalAdoptionWriteStatus: PersonalAiGenerationResultHistoryFormalAdoptionWriteStatus;
  privateUseBoundary: PersonalAiGenerationPrivateUseBoundaryDto;
  result: PersonalAiGenerationResultDto;
};
