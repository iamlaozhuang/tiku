import {
  normalizeStudentAnswerSelections,
  normalizeStudentAnswerText,
} from "./student-answer";

export type NormalizedStartPracticeInput = {
  paperPublicId: string;
  authorizationSource: "personal_auth" | "org_auth" | null;
  authorizationPublicId: string | null;
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

export function normalizeStartPracticeInput(
  input: unknown,
): NormalizedStartPracticeInput | null {
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

export function normalizePracticeAnswerInput(
  input: unknown,
): NormalizedPracticeAnswerInput | null {
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
  const aiExplanationTrigger =
    input.aiExplanationTrigger === "manual_request" ? "manual_request" : null;
  const aiScoringTrigger =
    input.aiScoringTrigger === "manual_request" ? "manual_request" : null;
  const savedFromClientAt = normalizeOptionalString(input.savedFromClientAt);

  if (
    paperQuestionPublicId === null ||
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

  const selectedLabelsResult = normalizeStudentAnswerSelections(
    input.selectedLabels,
  );
  const textAnswerResult = normalizeStudentAnswerText(input.textAnswer);

  if (!selectedLabelsResult.success || !textAnswerResult.success) {
    return null;
  }

  return {
    paperQuestionPublicId,
    selectedLabels: selectedLabelsResult.value,
    textAnswer: textAnswerResult.value,
    aiExplanationTrigger: null,
    aiScoringTrigger: null,
    savedFromClientAt: normalizeOptionalString(input.savedFromClientAt),
  };
}
