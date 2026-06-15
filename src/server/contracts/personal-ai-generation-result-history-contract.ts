import type { PersonalAiGenerationResultDto } from "./personal-ai-generation-result-persistence-contract";
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
  results: PersonalAiGenerationResultDto[];
};

export type PersonalAiGenerationResultDetailDto = {
  runtimeStatus: PersonalAiGenerationResultHistoryRuntimeStatus;
  contentVisibility: PersonalAiGenerationResultHistoryContentVisibility;
  redactionStatus: PersonalAiGenerationResultHistoryRedactionStatus;
  formalAdoptionWriteStatus: PersonalAiGenerationResultHistoryFormalAdoptionWriteStatus;
  result: PersonalAiGenerationResultDto;
};
