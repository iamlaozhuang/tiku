import { describe, expect, it } from "vitest";

import {
  createMistakeBookService,
  type MistakeBookClock,
} from "./mistake-book-service";
import type {
  MistakeBookAuthorizationScopeRow,
  MistakeBookRepository,
  MistakeBookRow,
  UpdateMistakeBookStateInput,
} from "../repositories/mistake-book-repository";

const now = new Date("2026-05-19T09:00:00.000Z");
const latestWrongAt = new Date("2026-05-19T08:00:00.000Z");
const scopeExpiresAt = new Date("2026-06-19T08:00:00.000Z");

const userContext = {
  userPublicId: "user_public_123",
};

const clock: MistakeBookClock = {
  now() {
    return now;
  },
};

function createScope(
  overrides: Partial<MistakeBookAuthorizationScopeRow> = {},
): MistakeBookAuthorizationScopeRow {
  return {
    profession: "monopoly",
    level: 3,
    authorization_types: ["personal_auth"],
    expires_at: scopeExpiresAt,
    ...overrides,
  };
}

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
    },
    latest_answer_snapshot: {
      selectedLabels: ["B"],
      textAnswer: null,
      savedFromClientAt: null,
    },
    mistake_book_source: "wrong_answer",
    mistake_book_status: "unmastered",
    wrong_count: 2,
    is_favorite: false,
    is_removed: false,
    mastered_at: null,
    latest_wrong_at: latestWrongAt,
    created_at: latestWrongAt,
    updated_at: latestWrongAt,
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<MistakeBookRepository> = {},
): MistakeBookRepository {
  return {
    async listEffectiveAuthorizationScopes() {
      return [createScope()];
    },
    async listMistakeBooks() {
      return {
        rows: [createMistakeBookRow()],
        total: 1,
      };
    },
    async findMistakeBookByPublicId() {
      return createMistakeBookRow();
    },
    async updateMistakeBookState(input) {
      return createMistakeBookRow({
        public_id: input.publicId,
        mistake_book_status: input.mistakeBookStatus,
        is_favorite: input.isFavorite,
        is_removed: input.isRemoved,
        mastered_at: input.masteredAt,
        updated_at: input.updatedAt,
      });
    },
    ...overrides,
  };
}

describe("mistake book service", () => {
  it("lists authorization-filtered mistake_book records with pagination", async () => {
    const service = createMistakeBookService(createRepository(), clock);

    await expect(
      service.listMistakeBooks(userContext, {
        page: "1",
        pageSize: "20",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mistakeBooks: [
          {
            publicId: "mistake_book_public_123",
            mistakeBookStatus: "unmastered",
            wrongCount: 2,
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
      },
    });
  });

  it("passes normalized filter query to the repository and excludes removed records from student lists", async () => {
    const receivedQueries: unknown[] = [];
    const service = createMistakeBookService(
      createRepository({
        async listMistakeBooks(query) {
          receivedQueries.push(query);

          return {
            rows: [
              createMistakeBookRow({
                question_snapshot: {
                  questionType: "multi_choice",
                },
                mistake_book_source: "favorite",
                mistake_book_status: "mastered",
                is_favorite: true,
                mastered_at: now,
              }),
              createMistakeBookRow({
                public_id: "removed_mistake_book_public_123",
                is_removed: true,
                mistake_book_status: "removed",
              }),
            ],
            total: 2,
          };
        },
      }),
      clock,
    );

    await expect(
      service.listMistakeBooks(userContext, {
        page: "2",
        pageSize: "50",
        questionType: "multi_choice",
        source: "favorite",
        status: "mastered",
        isFavorite: "true",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mistakeBooks: [
          {
            publicId: "mistake_book_public_123",
            mistakeBookSource: "favorite",
            mistakeBookStatus: "mastered",
            isFavorite: true,
          },
        ],
      },
      pagination: {
        page: 2,
        pageSize: 50,
        total: 1,
      },
    });
    expect(receivedQueries).toEqual([
      expect.objectContaining({
        userPublicId: "user_public_123",
        page: 2,
        pageSize: 50,
        questionType: "multi_choice",
        source: "favorite",
        status: "mastered",
        isFavorite: true,
        sortBy: "latestWrongAt",
        sortOrder: "desc",
      }),
    ]);
  });

  it("hides detail when current authorization no longer covers its scope", async () => {
    const service = createMistakeBookService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [createScope({ level: 4 })];
        },
      }),
      clock,
    );

    await expect(
      service.getMistakeBook(userContext, "mistake_book_public_123"),
    ).resolves.toEqual({
      code: 404331,
      message: "Mistake book item does not exist.",
      data: null,
    });
  });

  it("favorites and unfavorites an authorized mistake_book item", async () => {
    const updates: UpdateMistakeBookStateInput[] = [];
    const service = createMistakeBookService(
      createRepository({
        async updateMistakeBookState(input) {
          updates.push(input);

          return createMistakeBookRow({
            public_id: input.publicId,
            mistake_book_status: input.mistakeBookStatus,
            is_favorite: input.isFavorite,
            is_removed: input.isRemoved,
            mastered_at: input.masteredAt,
            updated_at: input.updatedAt,
          });
        },
      }),
      clock,
    );

    await expect(
      service.favoriteMistakeBook(userContext, "mistake_book_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mistakeBook: {
          publicId: "mistake_book_public_123",
          isFavorite: true,
        },
      },
    });
    await expect(
      service.unfavoriteMistakeBook(userContext, "mistake_book_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mistakeBook: {
          isFavorite: false,
        },
      },
    });
    expect(updates).toEqual([
      expect.objectContaining({
        publicId: "mistake_book_public_123",
        isFavorite: true,
        mistakeBookStatus: "unmastered",
      }),
      expect.objectContaining({
        publicId: "mistake_book_public_123",
        isFavorite: false,
        mistakeBookStatus: "unmastered",
      }),
    ]);
  });

  it("marks an authorized mistake_book item as mastered", async () => {
    const updates: UpdateMistakeBookStateInput[] = [];
    const service = createMistakeBookService(
      createRepository({
        async updateMistakeBookState(input) {
          updates.push(input);

          return createMistakeBookRow({
            public_id: input.publicId,
            mistake_book_status: input.mistakeBookStatus,
            mastered_at: input.masteredAt,
            updated_at: input.updatedAt,
          });
        },
      }),
      clock,
    );

    await expect(
      service.markMistakeBookMastered(userContext, "mistake_book_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mistakeBook: {
          mistakeBookStatus: "mastered",
          masteredAt: "2026-05-19T09:00:00.000Z",
        },
      },
    });
    expect(updates).toEqual([
      expect.objectContaining({
        mistakeBookStatus: "mastered",
        masteredAt: now,
      }),
    ]);
  });

  it("removes an authorized mistake_book item without deleting it", async () => {
    const service = createMistakeBookService(createRepository(), clock);

    await expect(
      service.removeMistakeBook(userContext, "mistake_book_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        mistakeBook: {
          mistakeBookStatus: "removed",
          isRemoved: true,
        },
      },
    });
  });

  it("returns documented not-available response when ai_explanation runtime is absent", async () => {
    const service = createMistakeBookService(createRepository(), clock);

    await expect(
      service.requestAiExplanation(userContext, "mistake_book_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).resolves.toEqual({
      code: 422331,
      message: "AI explanation is not available for mistake book in Phase 4.",
      data: null,
    });
  });

  it("returns deterministic AI explanation for an authorized mistake_book item", async () => {
    const explanationContexts: unknown[] = [];
    const service = createMistakeBookService(createRepository(), clock, {
      aiExplanationRuntime: {
        async generateObjectiveExplanation(context) {
          explanationContexts.push(context);

          return {
            explanationStatus: "explained",
            explanationText: "本地 AI 讲解：本题应先识别监管职责。",
            keyPoints: ["识别职责", "排除干扰项"],
            learningSuggestion: "复习行政监管基础知识。",
            insufficientEvidenceMessage: null,
            evidenceStatus: "sufficient",
            citations: [
              {
                chunkPublicId: "chunk_public_123",
                resourcePublicId: "resource_public_123",
                resourceTitle: "专卖管理教材",
                headingPath: ["第一章"],
                chunkIndex: 1,
                chunkText: "法规依据片段",
                textHash: "hash_123",
                score: 0.91,
              },
            ],
            promptTemplateKey: "ai_explanation_v1",
            promptTemplateVersion: 1,
          };
        },
      },
    });

    await expect(
      service.requestAiExplanation(userContext, "mistake_book_public_123", {
        requestedFromClientAt: "2026-05-19T09:05:00.000Z",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        aiExplanation: {
          explanationStatus: "explained",
          explanationText: "本地 AI 讲解：本题应先识别监管职责。",
          keyPoints: ["识别职责", "排除干扰项"],
          learningSuggestion: "复习行政监管基础知识。",
          insufficientEvidenceMessage: null,
          evidenceStatus: "sufficient",
          citations: [
            {
              chunkPublicId: "chunk_public_123",
              resourcePublicId: "resource_public_123",
              resourceTitle: "专卖管理教材",
              headingPath: ["第一章"],
              chunkIndex: 1,
              chunkText: "法规依据片段",
              textHash: "hash_123",
              score: 0.91,
            },
          ],
          promptTemplateKey: "ai_explanation_v1",
          promptTemplateVersion: 1,
        },
      },
    });
    expect(explanationContexts).toEqual([
      expect.objectContaining({
        userPublicId: "user_public_123",
        mistakeBookPublicId: "mistake_book_public_123",
        questionPublicId: "question_public_123",
        learnerAnswer: "B",
        triggerReason: "manual_request",
      }),
    ]);
  });

  it("returns weak-evidence explanation without attached citations", async () => {
    const service = createMistakeBookService(createRepository(), clock, {
      aiExplanationRuntime: {
        async generateObjectiveExplanation() {
          return {
            explanationStatus: "explained",
            explanationText: "本地 AI 讲解：依据不足，仅给出通用复习方向。",
            keyPoints: [],
            learningSuggestion: null,
            insufficientEvidenceMessage:
              "RAG evidence is insufficient; no citation is attached.",
            evidenceStatus: "weak",
            citations: [],
            promptTemplateKey: "ai_explanation_v1",
            promptTemplateVersion: 1,
          };
        },
      },
    });

    await expect(
      service.requestAiExplanation(userContext, "mistake_book_public_123", {}),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        aiExplanation: {
          insufficientEvidenceMessage:
            "RAG evidence is insufficient; no citation is attached.",
          evidenceStatus: "weak",
          citations: [],
        },
      },
    });
  });
});
