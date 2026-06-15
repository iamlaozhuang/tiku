import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultRedactionStatus,
} from "./personal-ai-generation-result";

export type PersonalAiGenerationResultHistoryRuntimeStatus =
  "local_contract_only";

export type PersonalAiGenerationResultHistoryFormalAdoptionWriteStatus =
  "blocked_without_follow_up_task";

export type PersonalAiGenerationResultHistoryQuery = {
  ownerPublicId: string;
  limit?: number;
};

export type PersonalAiGenerationResultHistoryContentVisibility =
  PersonalAiGenerationResultContentVisibility;

export type PersonalAiGenerationResultHistoryRedactionStatus =
  PersonalAiGenerationResultRedactionStatus;

export type PersonalAiGenerationResultHistoryOrderInput = {
  resultPublicId: string;
  persistedAt: string;
};

export function comparePersonalAiGenerationResultHistoryItem(
  leftItem: PersonalAiGenerationResultHistoryOrderInput,
  rightItem: PersonalAiGenerationResultHistoryOrderInput,
): number {
  const persistedAtComparison = rightItem.persistedAt.localeCompare(
    leftItem.persistedAt,
  );

  return persistedAtComparison === 0
    ? leftItem.resultPublicId.localeCompare(rightItem.resultPublicId)
    : persistedAtComparison;
}
