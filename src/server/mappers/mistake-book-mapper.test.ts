import { describe, expect, it } from "vitest";

import { mapMistakeBookItemToApi } from "./mistake-book-mapper";
import type { MistakeBookRow } from "../repositories/mistake-book-repository";

const masteredAt = new Date("2026-05-19T09:00:00.000Z");
const latestWrongAt = new Date("2026-05-19T08:00:00.000Z");
const createdAt = new Date("2026-05-18T08:00:00.000Z");
const updatedAt = new Date("2026-05-19T09:10:00.000Z");

function createMistakeBookRow(
  overrides: Partial<MistakeBookRow> = {},
): MistakeBookRow {
  return {
    id: 4001,
    public_id: "mistake_book_public_123",
    question_public_id: "question_public_123",
    paper_question_public_id: "paper_question_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    question_snapshot: {
      questionType: "single_choice",
      stemRichText: "<p>题干</p>",
      isSourceDisabled: false,
    },
    latest_answer_snapshot: {
      selectedLabels: ["B"],
      textAnswer: null,
      savedFromClientAt: "2026-05-19T08:00:00.000Z",
    },
    mistake_book_source: "wrong_answer",
    mistake_book_status: "mastered",
    wrong_count: 2,
    is_favorite: true,
    is_removed: false,
    mastered_at: masteredAt,
    latest_wrong_at: latestWrongAt,
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

describe("mistake book mapper", () => {
  it("maps mistake_book row to API dto with public identifiers only", () => {
    const item = mapMistakeBookItemToApi(createMistakeBookRow());

    expect(item).toEqual({
      publicId: "mistake_book_public_123",
      questionPublicId: "question_public_123",
      paperQuestionPublicId: "paper_question_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      questionSnapshot: {
        questionType: "single_choice",
        stemRichText: "<p>题干</p>",
        isSourceDisabled: false,
      },
      latestAnswerSnapshot: {
        selectedLabels: ["B"],
        textAnswer: null,
        savedFromClientAt: "2026-05-19T08:00:00.000Z",
      },
      mistakeBookSource: "wrong_answer",
      mistakeBookStatus: "mastered",
      wrongCount: 2,
      isFavorite: true,
      isRemoved: false,
      masteredAt: "2026-05-19T09:00:00.000Z",
      latestWrongAt: "2026-05-19T08:00:00.000Z",
      createdAt: "2026-05-18T08:00:00.000Z",
      updatedAt: "2026-05-19T09:10:00.000Z",
    });
    expect(JSON.stringify(item)).not.toContain("4001");
  });

  it("maps nullable timestamps as null", () => {
    expect(
      mapMistakeBookItemToApi(
        createMistakeBookRow({
          mistake_book_status: "unmastered",
          mastered_at: null,
          latest_wrong_at: null,
        }),
      ),
    ).toMatchObject({
      mistakeBookStatus: "unmastered",
      masteredAt: null,
      latestWrongAt: null,
    });
  });
});
