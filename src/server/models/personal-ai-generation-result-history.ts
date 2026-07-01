import type {
  PersonalAiGenerationResultContentVisibility,
  PersonalAiGenerationResultRedactionStatus,
  PersonalAiGenerationResultTaskType,
} from "./personal-ai-generation-result";

export type PersonalAiGenerationResultHistoryRuntimeStatus =
  "local_contract_only";

export type PersonalAiGenerationResultHistoryFormalAdoptionWriteStatus =
  "blocked_without_follow_up_task";

export type PersonalAiGenerationResultHistoryQuery = {
  ownerPublicId: string;
  taskType?: PersonalAiGenerationResultTaskType;
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
};

export type PersonalAiGenerationResultDetailQuery = {
  ownerPublicId: string;
  resultPublicId: string;
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
