import { describe, expect, it } from "vitest";

import {
  normalizeAiExplanationInput,
  normalizeMistakeBookListQuery,
} from "./mistake-book";

describe("mistake book validators", () => {
  it("normalizes list filters and pagination", () => {
    expect(
      normalizeMistakeBookListQuery({
        page: "2",
        pageSize: "50",
        questionType: " single_choice ",
        source: "wrong_answer",
        status: "mastered",
        isFavorite: "true",
      }),
    ).toEqual({
      page: 2,
      pageSize: 50,
      questionType: "single_choice",
      source: "wrong_answer",
      status: "mastered",
      isFavorite: true,
      sortBy: "latestWrongAt",
      sortOrder: "desc",
    });
  });

  it("uses safe defaults for invalid filters", () => {
    expect(
      normalizeMistakeBookListQuery({
        page: "0",
        pageSize: "999",
        questionType: "short_answer",
        source: "unknown",
        status: "unknown",
        isFavorite: "maybe",
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
      questionType: null,
      source: null,
      status: null,
      isFavorite: null,
      sortBy: "latestWrongAt",
      sortOrder: "desc",
    });
  });

  it("normalizes Phase 5 ai explanation input", () => {
    expect(
      normalizeAiExplanationInput({
        requestedFromClientAt: " 2026-05-19T09:05:00.000Z ",
      }),
    ).toEqual({
      requestedFromClientAt: "2026-05-19T09:05:00.000Z",
    });
    expect(normalizeAiExplanationInput({})).toEqual({
      requestedFromClientAt: null,
    });
  });
});
