import { describe, expect, it } from "vitest";

import {
  getDefaultScoringConfiguration,
  getQuestionScoringContractIssues,
  isQuestionScoringContractValid,
  isObjectiveAutoScoredQuestion,
  type QuestionScoringContractInput,
} from "./question-scoring-contract";

describe("question scoring contract", () => {
  it.each([
    ["single_choice", "auto_match"],
    ["multi_choice", "auto_match"],
    ["true_false", "auto_match"],
    ["fill_blank", "auto_match"],
    ["fill_blank", "ai_scoring"],
    ["short_answer", "ai_scoring"],
    ["case_analysis", "ai_scoring"],
    ["calculation", "ai_scoring"],
  ] as const)("accepts %s with %s", (questionType, scoringMethod) => {
    expect(
      getQuestionScoringContractIssues({
        questionType,
        scoringMethod,
        multiChoiceRule:
          questionType === "multi_choice"
            ? "partial_credit"
            : "all_correct_only",
      }),
    ).toEqual([]);
  });

  it.each([
    ["single_choice", "ai_scoring"],
    ["multi_choice", "ai_scoring"],
    ["true_false", "ai_scoring"],
    ["short_answer", "auto_match"],
    ["case_analysis", "auto_match"],
    ["calculation", "auto_match"],
  ] as const)("rejects %s with %s", (questionType, scoringMethod) => {
    expect(
      getQuestionScoringContractIssues({
        questionType,
        scoringMethod,
        multiChoiceRule: "all_correct_only",
      }),
    ).toContain("scoring_method_mismatch");
  });

  it("allows partial credit only for multi_choice", () => {
    expect(
      getQuestionScoringContractIssues({
        questionType: "single_choice",
        scoringMethod: "auto_match",
        multiChoiceRule: "partial_credit",
      }),
    ).toContain("multi_choice_rule_mismatch");
  });

  it("provides safe defaults and a single objective classifier", () => {
    expect(getDefaultScoringConfiguration("short_answer")).toEqual({
      scoringMethod: "ai_scoring",
      multiChoiceRule: "all_correct_only",
    });
    expect(getDefaultScoringConfiguration("multi_choice")).toEqual({
      scoringMethod: "auto_match",
      multiChoiceRule: "all_correct_only",
    });
    expect(
      isObjectiveAutoScoredQuestion({
        questionType: "fill_blank",
        scoringMethod: "auto_match",
      }),
    ).toBe(true);
    expect(
      isObjectiveAutoScoredQuestion({
        questionType: "fill_blank",
        scoringMethod: "ai_scoring",
      }),
    ).toBe(false);
  });

  it("fails closed for missing or unknown snapshot enum values", () => {
    expect(
      isQuestionScoringContractValid({
        questionType: "single_choice",
        scoringMethod: "auto_match",
        multiChoiceRule: "all_correct_only",
      }),
    ).toBe(true);
    expect(
      isQuestionScoringContractValid({
        questionType: "single_choice",
        scoringMethod: "auto_match",
        multiChoiceRule: null,
      }),
    ).toBe(false);
    expect(
      isQuestionScoringContractValid({
        questionType: "unknown",
        scoringMethod: "auto_match",
        multiChoiceRule: "all_correct_only",
      }),
    ).toBe(false);
    expect(
      getQuestionScoringContractIssues({
        questionType: "fill_blank",
        scoringMethod:
          "unknown_scoring_method" as QuestionScoringContractInput["scoringMethod"],
        multiChoiceRule: "all_correct_only",
      }),
    ).toContain("scoring_method_mismatch");
  });
});
