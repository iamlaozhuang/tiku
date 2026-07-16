import { describe, expect, it } from "vitest";

import {
  normalizeMockExamAnswerInput,
  normalizeSupplementMockExamAnswersInput,
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
        operationId: " answer_operation_public_1 ",
        expectedRevision: 2,
        savedFromClientAt: "2026-05-19T08:05:00.000Z",
      }),
    ).toEqual({
      paperQuestionPublicId: "paper_question_public_123",
      selectedLabels: ["A", "B"],
      textAnswer: null,
      operationId: "answer_operation_public_1",
      expectedRevision: 2,
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
    expect(
      normalizeMockExamAnswerInput({
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["A"],
        operationId: "answer_operation_public_1",
        expectedRevision: 0,
        savedFromClientAt: "not-a-timestamp",
      }),
    ).toBeNull();
    expect(normalizeMockExamAnswerInput({})).toBeNull();
    expect(
      normalizeMockExamAnswerInput({
        paperQuestionPublicId: "paper_question_public_123",
        selectedLabels: ["A"],
        operationId: "answer_operation_public_1",
        expectedRevision: -1,
      }),
    ).toBeNull();
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

  describe("terminal supplement", () => {
    const answer = {
      paperQuestionPublicId: "paper_question_public_123",
      selectedLabels: ["A"],
      textAnswer: null,
      operationId: "answer_operation_public_123",
      expectedRevision: 0,
      savedFromClientAt: "2026-05-19T07:59:00.000Z",
    };

    it("accepts a bounded batch of revision-zero offline answers", () => {
      expect(
        normalizeSupplementMockExamAnswersInput({ answers: [answer] }),
      ).toEqual({ answers: [answer] });
    });

    it.each([
      { answers: [] },
      { answers: [{ ...answer, expectedRevision: 1 }] },
      { answers: [{ ...answer, savedFromClientAt: null }] },
      { answers: [answer, answer] },
      {
        answers: [
          answer,
          {
            ...answer,
            paperQuestionPublicId: "paper_question_public_456",
          },
        ],
      },
    ])("rejects an unsafe payload %#", (input) => {
      expect(normalizeSupplementMockExamAnswersInput(input)).toBeNull();
    });
  });
});
