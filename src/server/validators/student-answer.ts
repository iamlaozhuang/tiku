export const STUDENT_ANSWER_TEXT_MAX_LENGTH = 4_000;
export const STUDENT_ANSWER_SELECTION_MAX_COUNT = 20;
export const STUDENT_ANSWER_SELECTION_MAX_LENGTH = 200;
export const STUDENT_ANSWER_ITEM_MAX_COUNT = 200;

type NormalizationResult<T> = { success: true; value: T } | { success: false };

function isDenseArray(value: unknown[]): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) {
      return false;
    }
  }

  return true;
}

export function normalizeStudentAnswerText(
  value: unknown,
): NormalizationResult<string | null> {
  if (value === null || value === undefined) {
    return { success: true, value: null };
  }

  if (
    typeof value !== "string" ||
    value.length > STUDENT_ANSWER_TEXT_MAX_LENGTH
  ) {
    return { success: false };
  }

  const normalizedValue = value.trim();

  return {
    success: true,
    value: normalizedValue.length > 0 ? normalizedValue : null,
  };
}

export function normalizeStudentAnswerSelections(
  value: unknown,
): NormalizationResult<string[]> {
  if (value === null || value === undefined) {
    return { success: true, value: [] };
  }

  if (
    !Array.isArray(value) ||
    value.length > STUDENT_ANSWER_SELECTION_MAX_COUNT ||
    !isDenseArray(value)
  ) {
    return { success: false };
  }

  const normalizedValues: string[] = [];
  const seenValues = new Set<string>();

  for (const item of value) {
    if (
      typeof item !== "string" ||
      item.length > STUDENT_ANSWER_SELECTION_MAX_LENGTH
    ) {
      return { success: false };
    }

    const normalizedValue = item.trim();
    if (normalizedValue.length === 0 || seenValues.has(normalizedValue)) {
      return { success: false };
    }

    seenValues.add(normalizedValue);
    normalizedValues.push(normalizedValue);
  }

  return { success: true, value: normalizedValues };
}

export function normalizeStudentAnswerItemList(
  value: unknown,
): unknown[] | null {
  if (
    !Array.isArray(value) ||
    value.length > STUDENT_ANSWER_ITEM_MAX_COUNT ||
    !isDenseArray(value)
  ) {
    return null;
  }

  return Array.from(value);
}
