export type NormalizedStartMockExamInput = {
  paperPublicId: string;
};

export type NormalizedMockExamAnswerInput = {
  paperQuestionPublicId: string;
  selectedLabels: string[];
  textAnswer: string | null;
  operationId: string;
  expectedRevision: number;
  savedFromClientAt: string | null;
};

export type NormalizedSubmitMockExamInput = {
  submittedFromClientAt: string | null;
};

export type NormalizedSupplementMockExamAnswersInput = {
  answers: NormalizedMockExamAnswerInput[];
};

const MAX_TERMINAL_SUPPLEMENT_ANSWER_COUNT = 200;

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

function normalizeOptionalTimestamp(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsedTimestamp = Date.parse(value.trim());

  return Number.isFinite(parsedTimestamp)
    ? new Date(parsedTimestamp).toISOString()
    : undefined;
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

function normalizeNonnegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
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
  const operationId = normalizeRequiredString(input.operationId);
  const expectedRevision = normalizeNonnegativeInteger(input.expectedRevision);
  const savedFromClientAt = normalizeOptionalTimestamp(input.savedFromClientAt);

  if (
    paperQuestionPublicId === null ||
    operationId === null ||
    expectedRevision === null ||
    savedFromClientAt === undefined ||
    (selectedLabels.length === 0 && textAnswer === null)
  ) {
    return null;
  }

  return {
    paperQuestionPublicId,
    selectedLabels,
    textAnswer,
    operationId,
    expectedRevision,
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

export function normalizeSupplementMockExamAnswersInput(
  input: unknown,
): NormalizedSupplementMockExamAnswersInput | null {
  if (!isRecord(input) || !Array.isArray(input.answers)) {
    return null;
  }

  if (
    input.answers.length === 0 ||
    input.answers.length > MAX_TERMINAL_SUPPLEMENT_ANSWER_COUNT
  ) {
    return null;
  }

  const answers = input.answers.map(normalizeMockExamAnswerInput);

  if (
    answers.some(
      (answer) =>
        answer === null ||
        answer.expectedRevision !== 0 ||
        answer.savedFromClientAt === null,
    )
  ) {
    return null;
  }

  const normalizedAnswers = answers as NormalizedMockExamAnswerInput[];
  const paperQuestionPublicIds = normalizedAnswers.map(
    (answer) => answer.paperQuestionPublicId,
  );
  const operationIds = normalizedAnswers.map((answer) => answer.operationId);

  if (
    new Set(paperQuestionPublicIds).size !== paperQuestionPublicIds.length ||
    new Set(operationIds).size !== operationIds.length
  ) {
    return null;
  }

  return { answers: normalizedAnswers };
}
