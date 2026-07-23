import { describe, expect, it } from "vitest";

import {
  normalizePracticeAnswerInput,
  normalizePracticeQuestionFavoriteInput,
  normalizeStartPracticeInput,
} from "./practice";
import {
  STUDENT_ANSWER_SELECTION_MAX_COUNT,
  STUDENT_ANSWER_SELECTION_MAX_LENGTH,
  STUDENT_ANSWER_TEXT_MAX_LENGTH,
} from "./student-answer";

describe("practice validators", () => {
  it("normalizes valid start practice input", () => {
    expect(
      normalizeStartPracticeInput({
        paperPublicId: " paper_public_123 ",
        authorizationSource: "personal_auth",
        authorizationPublicId: " personal_auth_public_123 ",
      }),
    ).toEqual({
      paperPublicId: "paper_public_123",
      authorizationSource: "personal_auth",
      authorizationPublicId: "personal_auth_public_123",
    });
  });

  it("allows omitted authorization selection but rejects partial or unknown selectors", () => {
    expect(
      normalizeStartPracticeInput({ paperPublicId: "paper_public_123" }),
    ).toEqual({
      paperPublicId: "paper_public_123",
      authorizationSource: null,
      authorizationPublicId: null,
    });
    expect(
      normalizeStartPracticeInput({
        paperPublicId: "paper_public_123",
        authorizationSource: "org_auth",
      }),
    ).toBeNull();
    expect(
      normalizeStartPracticeInput({
        paperPublicId: "paper_public_123",
        authorizationSource: "forged_auth",
        authorizationPublicId: "auth_public_123",
      }),
    ).toBeNull();
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
      aiScoringTrigger: null,
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
      aiScoringTrigger: null,
      savedFromClientAt: null,
    });
  });

  it("normalizes manual ai_scoring trigger for subjective practice", () => {
    expect(
      normalizePracticeAnswerInput({
        paperQuestionPublicId: "paper_question_subjective_123",
        textAnswer: "second answer",
        aiScoringTrigger: "manual_request",
      }),
    ).toEqual({
      paperQuestionPublicId: "paper_question_subjective_123",
      selectedLabels: [],
      textAnswer: "second answer",
      aiExplanationTrigger: null,
      aiScoringTrigger: "manual_request",
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

  it("rejects over-limit or partially malformed answer values", () => {
    const baseInput = {
      paperQuestionPublicId: "paper_question_public_123",
    };

    expect(
      normalizePracticeAnswerInput({
        ...baseInput,
        textAnswer: "x".repeat(STUDENT_ANSWER_TEXT_MAX_LENGTH + 1),
      }),
    ).toBeNull();
    expect(
      normalizePracticeAnswerInput({
        ...baseInput,
        selectedLabels: Array.from(
          { length: STUDENT_ANSWER_SELECTION_MAX_COUNT + 1 },
          (_unused, index) => `${index}`,
        ),
      }),
    ).toBeNull();
    expect(
      normalizePracticeAnswerInput({
        ...baseInput,
        selectedLabels: [
          "A",
          "x".repeat(STUDENT_ANSWER_SELECTION_MAX_LENGTH + 1),
        ],
      }),
    ).toBeNull();
    expect(
      normalizePracticeAnswerInput({
        ...baseInput,
        selectedLabels: ["A", 2],
      }),
    ).toBeNull();
    expect(
      normalizePracticeQuestionFavoriteInput({
        ...baseInput,
        textAnswer: "x".repeat(STUDENT_ANSWER_TEXT_MAX_LENGTH + 1),
      }),
    ).toBeNull();
  });
});
