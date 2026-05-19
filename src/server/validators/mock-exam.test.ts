import { describe, expect, it } from "vitest";

import {
  normalizeMockExamAnswerInput,
  normalizeStartMockExamInput,
  normalizeSubmitMockExamInput,
} from "./mock-exam";

describe("mock exam validators", () => {
  it("normalizes valid start mock exam input", () => {
    expect(
      normalizeStartMockExamInput({
        paperPublicId: " paper_public_123 ",
      }),
    ).toEqual({
      paperPublicId: "paper_public_123",
    });
  });

  it("rejects invalid start mock exam input", () => {
    expect(normalizeStartMockExamInput({ paperPublicId: "" })).toBeNull();
    expect(normalizeStartMockExamInput(null)).toBeNull();
  });

  it("normalizes valid answer input", () => {
    expect(
      normalizeMockExamAnswerInput({
        paperQuestionPublicId: " paper_question_public_123 ",
        selectedLabels: [" A ", "B"],
        textAnswer: "",
        savedFromClientAt: "2026-05-19T08:05:00.000Z",
      }),
    ).toEqual({
      paperQuestionPublicId: "paper_question_public_123",
      selectedLabels: ["A", "B"],
      textAnswer: null,
      savedFromClientAt: "2026-05-19T08:05:00.000Z",
    });
  });

  it("rejects invalid answer input", () => {
    expect(
      normalizeMockExamAnswerInput({
        paperQuestionPublicId: "",
        selectedLabels: [],
        textAnswer: null,
      }),
    ).toBeNull();
    expect(normalizeMockExamAnswerInput({})).toBeNull();
  });

  it("normalizes optional submit input", () => {
    expect(
      normalizeSubmitMockExamInput({
        submittedFromClientAt: " 2026-05-19T09:00:00.000Z ",
      }),
    ).toEqual({
      submittedFromClientAt: "2026-05-19T09:00:00.000Z",
    });
    expect(normalizeSubmitMockExamInput({})).toEqual({
      submittedFromClientAt: null,
    });
  });
});
