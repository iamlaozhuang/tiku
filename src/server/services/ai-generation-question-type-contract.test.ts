import { describe, expect, it } from "vitest";

import {
  aiGenerationQuestionTypeValues,
  isAiGenerationReviewRequiredQuestionType,
  parseCurrentAiGenerationQuestionType,
  parseCurrentAiGenerationQuestionTypeList,
  parseLegacyAiGenerationQuestionType,
} from "./ai-generation-question-type-contract";

const canonicalQuestionTypes = [
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
] as const;

describe("AI generation question type contract", () => {
  it("uses the formal question SSOT order for all seven canonical values", () => {
    expect(aiGenerationQuestionTypeValues).toEqual(canonicalQuestionTypes);
    for (const questionType of canonicalQuestionTypes) {
      expect(parseCurrentAiGenerationQuestionType(questionType)).toBe(
        questionType,
      );
    }
  });

  it.each([
    "multiple_choice",
    "subjective",
    "judge",
    "判断题",
    "SINGLE_CHOICE",
    " single_choice",
    "single_choice ",
    "unknown",
    "",
    null,
    undefined,
    1,
  ])("rejects non-canonical current value %j", (value) => {
    expect(parseCurrentAiGenerationQuestionType(value)).toBeNull();
  });

  it("accepts only the two approved aliases at an explicit legacy edge", () => {
    expect(parseLegacyAiGenerationQuestionType("multiple_choice")).toBe(
      "multi_choice",
    );
    expect(parseLegacyAiGenerationQuestionType("subjective")).toBe(
      "short_answer",
    );
    expect(parseLegacyAiGenerationQuestionType("judge")).toBeNull();
    expect(parseLegacyAiGenerationQuestionType(" multiple_choice ")).toBeNull();
    expect(parseLegacyAiGenerationQuestionType("MULTIPLE_CHOICE")).toBeNull();
  });

  it("validates dense, unique, canonical lists without filtering or reordering", () => {
    expect(
      parseCurrentAiGenerationQuestionTypeList(canonicalQuestionTypes),
    ).toEqual(canonicalQuestionTypes);
    expect(
      parseCurrentAiGenerationQuestionTypeList([
        "single_choice",
        "single_choice",
      ]),
    ).toBeNull();
    expect(
      parseCurrentAiGenerationQuestionTypeList([
        "single_choice",
        "multiple_choice",
      ]),
    ).toBeNull();

    const sparse = new Array(2);
    sparse[1] = "single_choice";
    expect(parseCurrentAiGenerationQuestionTypeList(sparse)).toBeNull();
  });

  it("keeps fill blank and subjective families on review-required scoring", () => {
    expect(isAiGenerationReviewRequiredQuestionType("single_choice")).toBe(
      false,
    );
    expect(isAiGenerationReviewRequiredQuestionType("multi_choice")).toBe(
      false,
    );
    expect(isAiGenerationReviewRequiredQuestionType("true_false")).toBe(false);
    expect(isAiGenerationReviewRequiredQuestionType("fill_blank")).toBe(true);
    expect(isAiGenerationReviewRequiredQuestionType("short_answer")).toBe(true);
    expect(isAiGenerationReviewRequiredQuestionType("case_analysis")).toBe(
      true,
    );
    expect(isAiGenerationReviewRequiredQuestionType("calculation")).toBe(true);
  });
});
