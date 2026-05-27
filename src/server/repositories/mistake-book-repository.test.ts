import { describe, expect, it } from "vitest";

import { createMistakeBookQuestionTypeCondition } from "./mistake-book-repository";

function containsText(value: unknown, text: string, seen = new Set()): boolean {
  if (typeof value === "string") {
    return value.includes(text);
  }

  if (typeof value !== "object" || value === null || seen.has(value)) {
    return false;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => containsText(item, text, seen));
  }

  return Object.values(value).some((item) => containsText(item, text, seen));
}

describe("mistake book repository filters", () => {
  it("builds a database-level questionType condition for exact pagination", () => {
    const condition = createMistakeBookQuestionTypeCondition("multi_choice");

    expect(condition).not.toBeNull();
    expect(containsText(condition, "question_snapshot")).toBe(true);
    expect(containsText(condition, "questionType")).toBe(true);
    expect(containsText(condition, "multi_choice")).toBe(true);
  });

  it("omits questionType condition when no filter is requested", () => {
    expect(createMistakeBookQuestionTypeCondition(null)).toBeNull();
  });
});
