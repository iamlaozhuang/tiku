import { describe, expect, it } from "vitest";

import {
  normalizePracticeAnswerInput,
  normalizeStartPracticeInput,
} from "./practice";

describe("practice validators", () => {
  it("normalizes valid start practice input", () => {
    expect(
      normalizeStartPracticeInput({
        paperPublicId: " paper_public_123 ",
      }),
    ).toEqual({
      paperPublicId: "paper_public_123",
    });
  });

  it("rejects invalid start practice input", () => {
    expect(normalizeStartPracticeInput({ paperPublicId: "" })).toBeNull();
    expect(normalizeStartPracticeInput(null)).toBeNull();
  });

  it("normalizes valid answer input", () => {
    expect(
      normalizePracticeAnswerInput({
        paperQuestionPublicId: " paper_question_public_123 ",
        selectedLabels: [" A ", "B"],
        textAnswer: "",
        savedFromClientAt: "2026-05-19T08:05:00.000Z",
      }),
    ).toEqual({
      paperQuestionPublicId: "paper_question_public_123",
      selectedLabels: ["A", "B"],
      textAnswer: null,
      aiExplanationTrigger: null,
      savedFromClientAt: "2026-05-19T08:05:00.000Z",
    });
  });

  it("normalizes manual ai_explanation trigger for answered practice", () => {
    expect(
      normalizePracticeAnswerInput({
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["A"],
        aiExplanationTrigger: "manual_request",
      }),
    ).toEqual({
      paperQuestionPublicId: "paper_question_public_123",
      selectedLabels: ["A"],
      textAnswer: null,
      aiExplanationTrigger: "manual_request",
      savedFromClientAt: null,
    });
  });

  it("rejects invalid answer input", () => {
    expect(
      normalizePracticeAnswerInput({
        paperQuestionPublicId: "",
        selectedLabels: [],
        textAnswer: null,
      }),
    ).toBeNull();
    expect(normalizePracticeAnswerInput({})).toBeNull();
  });
});
