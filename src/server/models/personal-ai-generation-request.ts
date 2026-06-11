import type { AiFuncType } from "./ai-rag";

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
  authorizationPublicId: string;
  aiFuncType: PersonalAiGenerationFuncType;
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
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
