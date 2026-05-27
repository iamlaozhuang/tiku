export type NormalizedStartPracticeInput = {
  paperPublicId: string;
};

export type NormalizedPracticeAnswerInput = {
  paperQuestionPublicId: string;
  selectedLabels: string[];
  textAnswer: string | null;
  aiExplanationTrigger: "manual_request" | null;
  aiScoringTrigger: "manual_request" | null;
  savedFromClientAt: string | null;
};

export type NormalizedPracticeQuestionFavoriteInput =
  NormalizedPracticeAnswerInput;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normalizeSelectedLabels(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((label): label is string => typeof label === "string")
    .map((label) => label.trim())
    .filter((label) => label.length > 0);
}

export function normalizeStartPracticeInput(
  input: unknown,
): NormalizedStartPracticeInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const paperPublicId = normalizeRequiredString(input.paperPublicId);

  if (paperPublicId === null) {
    return null;
  }

  return {
    paperPublicId,
  };
}

export function normalizePracticeAnswerInput(
  input: unknown,
): NormalizedPracticeAnswerInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const paperQuestionPublicId = normalizeRequiredString(
    input.paperQuestionPublicId,
  );
  const selectedLabels = normalizeSelectedLabels(input.selectedLabels);
  const textAnswer = normalizeOptionalString(input.textAnswer);
  const aiExplanationTrigger =
    input.aiExplanationTrigger === "manual_request" ? "manual_request" : null;
  const aiScoringTrigger =
    input.aiScoringTrigger === "manual_request" ? "manual_request" : null;
  const savedFromClientAt = normalizeOptionalString(input.savedFromClientAt);

  if (
    paperQuestionPublicId === null ||
    (selectedLabels.length === 0 && textAnswer === null)
  ) {
    return null;
  }

  return {
    paperQuestionPublicId,
    selectedLabels,
    textAnswer,
    aiExplanationTrigger,
    aiScoringTrigger,
    savedFromClientAt,
  };
}

export function normalizePracticeQuestionFavoriteInput(
  input: unknown,
): NormalizedPracticeQuestionFavoriteInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const paperQuestionPublicId = normalizeRequiredString(
    input.paperQuestionPublicId,
  );

  if (paperQuestionPublicId === null) {
    return null;
  }

  return {
    paperQuestionPublicId,
    selectedLabels: normalizeSelectedLabels(input.selectedLabels),
    textAnswer: normalizeOptionalString(input.textAnswer),
    aiExplanationTrigger: null,
    aiScoringTrigger: null,
    savedFromClientAt: normalizeOptionalString(input.savedFromClientAt),
  };
}
