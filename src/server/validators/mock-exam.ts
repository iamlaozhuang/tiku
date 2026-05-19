export type NormalizedStartMockExamInput = {
  paperPublicId: string;
};

export type NormalizedMockExamAnswerInput = {
  paperQuestionPublicId: string;
  selectedLabels: string[];
  textAnswer: string | null;
  savedFromClientAt: string | null;
};

export type NormalizedSubmitMockExamInput = {
  submittedFromClientAt: string | null;
};

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

export function normalizeStartMockExamInput(
  input: unknown,
): NormalizedStartMockExamInput | null {
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

export function normalizeMockExamAnswerInput(
  input: unknown,
): NormalizedMockExamAnswerInput | null {
  if (!isRecord(input)) {
    return null;
  }

  const paperQuestionPublicId = normalizeRequiredString(
    input.paperQuestionPublicId,
  );
  const selectedLabels = normalizeSelectedLabels(input.selectedLabels);
  const textAnswer = normalizeOptionalString(input.textAnswer);
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
    savedFromClientAt,
  };
}

export function normalizeSubmitMockExamInput(
  input: unknown,
): NormalizedSubmitMockExamInput | null {
  if (!isRecord(input)) {
    return null;
  }

  return {
    submittedFromClientAt: normalizeOptionalString(input.submittedFromClientAt),
  };
}
