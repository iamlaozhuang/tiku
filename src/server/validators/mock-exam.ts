import {
  normalizeStudentAnswerItemList,
  normalizeStudentAnswerSelections,
  normalizeStudentAnswerText,
} from "./student-answer";

export type NormalizedStartMockExamInput = {
  paperPublicId: string;
  authorizationSource: "personal_auth" | "org_auth" | null;
  authorizationPublicId: string | null;
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
  const authorizationSource =
    input.authorizationSource === "personal_auth" ||
    input.authorizationSource === "org_auth"
      ? input.authorizationSource
      : input.authorizationSource === undefined ||
          input.authorizationSource === null
        ? null
        : undefined;
  const authorizationPublicId =
    input.authorizationPublicId === undefined ||
    input.authorizationPublicId === null
      ? null
      : normalizeRequiredString(input.authorizationPublicId);

  if (
    paperPublicId === null ||
    authorizationSource === undefined ||
    (authorizationSource === null) !== (authorizationPublicId === null)
  ) {
    return null;
  }

  return {
    paperPublicId,
    authorizationSource,
    authorizationPublicId,
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
  const selectedLabelsResult = normalizeStudentAnswerSelections(
    input.selectedLabels,
  );
  const textAnswerResult = normalizeStudentAnswerText(input.textAnswer);
  const operationId = normalizeRequiredString(input.operationId);
  const expectedRevision = normalizeNonnegativeInteger(input.expectedRevision);
  const savedFromClientAt = normalizeOptionalTimestamp(input.savedFromClientAt);

  if (
    paperQuestionPublicId === null ||
    operationId === null ||
    expectedRevision === null ||
    savedFromClientAt === undefined ||
    !selectedLabelsResult.success ||
    !textAnswerResult.success ||
    (selectedLabelsResult.value.length === 0 && textAnswerResult.value === null)
  ) {
    return null;
  }

  return {
    paperQuestionPublicId,
    selectedLabels: selectedLabelsResult.value,
    textAnswer: textAnswerResult.value,
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
  if (!isRecord(input)) {
    return null;
  }

  const answerItems = normalizeStudentAnswerItemList(input.answers);
  if (answerItems === null || answerItems.length === 0) {
    return null;
  }

  const answers = answerItems.map(normalizeMockExamAnswerInput);

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
