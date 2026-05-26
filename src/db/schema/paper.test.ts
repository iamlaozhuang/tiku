import { describe, expect, it } from "vitest";

import { questionTypeValues } from "./paper";

describe("paper schema question_type enum", () => {
  it("registers all MVP question types", () => {
    expect(questionTypeValues).toEqual([
      "single_choice",
      "multi_choice",
      "true_false",
      "fill_blank",
      "short_answer",
      "case_analysis",
      "calculation",
    ]);
  });
});
