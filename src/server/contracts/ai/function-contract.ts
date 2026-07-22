export const aiFunctionContractValues = [
  "ai_scoring",
  "ai_explanation",
  "ai_hint",
  "kn_recommendation",
  "learning_suggestion",
  "ai_question_generation",
  "ai_paper_generation",
] as const;

export type AiFunctionContractValue = (typeof aiFunctionContractValues)[number];

const legacyAiFunctionAliases: Record<string, AiFunctionContractValue> = {
  explanation: "ai_explanation",
  hint: "ai_hint",
  scoring: "ai_scoring",
};

export function normalizeAiFunctionContractValue(
  candidateFuncType: string,
): AiFunctionContractValue {
  if (isAiFunctionContractValue(candidateFuncType)) {
    return candidateFuncType;
  }

  const mappedFuncType = legacyAiFunctionAliases[candidateFuncType];

  if (mappedFuncType !== undefined) {
    return mappedFuncType;
  }

  throw new Error(`Unsupported AI function type: ${candidateFuncType}`);
}

export function isAiFunctionContractValue(
  candidateFuncType: string,
): candidateFuncType is AiFunctionContractValue {
  return aiFunctionContractValues.includes(
    candidateFuncType as AiFunctionContractValue,
  );
}
