import { describe, expect, it } from "vitest";

import {
  normalizeMockExamAnswerInput,
  normalizeSupplementMockExamAnswersInput,
  normalizeStartMockExamInput,
  normalizeSubmitMockExamInput,
} from "./mock-exam";
import {
  STUDENT_ANSWER_ITEM_MAX_COUNT,
  STUDENT_ANSWER_SELECTION_MAX_COUNT,
  STUDENT_ANSWER_TEXT_MAX_LENGTH,
} from "./student-answer";

describe("mock exam validators", () => {
  it("normalizes valid start mock exam input", () => {
    expect(
      normalizeStartMockExamInput({
        paperPublicId: " paper_public_123 ",
        authorizationSource: "org_auth",
        authorizationPublicId: " org_auth_public_123 ",
      }),
    ).toEqual({
      paperPublicId: "paper_public_123",
      authorizationSource: "org_auth",
      authorizationPublicId: "org_auth_public_123",
    });
  });

  it("allows omitted authorization selection but rejects partial or unknown selectors", () => {
    expect(
      normalizeStartMockExamInput({ paperPublicId: "paper_public_123" }),
    ).toEqual({
      paperPublicId: "paper_public_123",
      authorizationSource: null,
      authorizationPublicId: null,
    });
    expect(
      normalizeStartMockExamInput({
        paperPublicId: "paper_public_123",
        authorizationPublicId: "org_auth_public_123",
      }),
    ).toBeNull();
    expect(
      normalizeStartMockExamInput({
        paperPublicId: "paper_public_123",
        authorizationSource: "other_auth",
        authorizationPublicId: "auth_public_123",
      }),
    ).toBeNull();
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

  it("rejects over-limit or partially malformed answer values", () => {
    const baseInput = {
      paperQuestionPublicId: "paper_question_public_123",
      operationId: "answer_operation_public_1",
      expectedRevision: 0,
      savedFromClientAt: null,
    };

    expect(
      normalizeMockExamAnswerInput({
        ...baseInput,
        textAnswer: "x".repeat(STUDENT_ANSWER_TEXT_MAX_LENGTH + 1),
      }),
    ).toBeNull();
    expect(
      normalizeMockExamAnswerInput({
        ...baseInput,
        selectedLabels: Array.from(
          { length: STUDENT_ANSWER_SELECTION_MAX_COUNT + 1 },
          (_unused, index) => `${index}`,
        ),
      }),
    ).toBeNull();
    expect(
      normalizeMockExamAnswerInput({
        ...baseInput,
        selectedLabels: ["A", false],
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

    it("rejects oversized and sparse terminal supplement batches", () => {
      const oversizedAnswers = Array.from(
        { length: STUDENT_ANSWER_ITEM_MAX_COUNT + 1 },
        (_unused, index) => ({
          ...answer,
          paperQuestionPublicId: `paper_question_public_${index}`,
          operationId: `answer_operation_public_${index}`,
        }),
      );
      const sparseAnswers = new Array(2);
      sparseAnswers[0] = answer;

      expect(
        normalizeSupplementMockExamAnswersInput({
          answers: oversizedAnswers,
        }),
      ).toBeNull();
      expect(
        normalizeSupplementMockExamAnswersInput({ answers: sparseAnswers }),
      ).toBeNull();
    });
  });
});
