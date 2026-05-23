import { describe, expect, it } from "vitest";

import { createMistakeBookRouteHandlers } from "./mistake-book-route";
import type { MistakeBookService } from "./mistake-book-service";

const userContext = {
  userPublicId: "user_public_123",
};

function createMistakeBookDto(publicId: string) {
  return {
    publicId,
    questionPublicId: "question_public_123",
    paperQuestionPublicId: "paper_question_public_123",
    profession: "monopoly" as const,
    level: 3,
    subject: "theory" as const,
    questionSnapshot: {
      questionType: "single_choice",
    },
    latestAnswerSnapshot: {
      selectedLabels: ["B"],
      textAnswer: null,
      savedFromClientAt: null,
    },
    mistakeBookSource: "wrong_answer" as const,
    mistakeBookStatus: "unmastered" as const,
    wrongCount: 2,
    isFavorite: false,
    isRemoved: false,
    masteredAt: null,
    latestWrongAt: "2026-05-19T08:00:00.000Z",
    createdAt: "2026-05-19T08:00:00.000Z",
    updatedAt: "2026-05-19T08:00:00.000Z",
  };
}

function createService(): MistakeBookService {
  return {
    async listMistakeBooks(receivedUserContext, query) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${String(
          query && typeof query === "object" && "status" in query
            ? query.status
            : null,
        )}`,
        data: {
          mistakeBooks: [createMistakeBookDto("mistake_book_public_123")],
        },
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "latestWrongAt",
          sortOrder: "desc",
        },
      };
    },
    async getMistakeBook(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}`,
        data: {
          mistakeBook: createMistakeBookDto(publicId),
        },
      };
    },
    async favoriteMistakeBook(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:favorite`,
        data: {
          mistakeBook: createMistakeBookDto(publicId),
        },
      };
    },
    async unfavoriteMistakeBook(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:unfavorite`,
        data: {
          mistakeBook: createMistakeBookDto(publicId),
        },
      };
    },
    async markMistakeBookMastered(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:mastered`,
        data: {
          mistakeBook: createMistakeBookDto(publicId),
        },
      };
    },
    async removeMistakeBook(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:remove`,
        data: {
          mistakeBook: createMistakeBookDto(publicId),
        },
      };
    },
    async requestAiExplanation(receivedUserContext, publicId, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:ai-explanation:${
          input && typeof input === "object" && "requestedFromClientAt" in input
            ? input.requestedFromClientAt
            : null
        }`,
        data: {
          aiExplanation: {
            explanationStatus: "explained",
            explanationText: "本地 AI 讲解",
            keyPoints: [],
            learningSuggestion: null,
            insufficientEvidenceMessage: null,
            evidenceStatus: "none",
            citations: [],
            promptTemplateKey: "dev_ai_explanation_v1",
            promptTemplateVersion: 1,
          },
        },
      };
    },
  };
}

describe("mistake book route handlers", () => {
  it("passes list query and user context to service", async () => {
    const { collection } = createMistakeBookRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await collection.GET(
      new Request("http://localhost/api/v1/mistake-books?status=mastered"),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:mastered",
    });
  });

  it("passes publicId to detail and state action handlers", async () => {
    const {
      detail,
      favorite,
      unfavorite,
      markMastered,
      remove,
      aiExplanation,
    } = createMistakeBookRouteHandlers(
      createService(),
      async () => userContext,
    );
    const context = {
      params: Promise.resolve({
        publicId: "mistake_book_public_123",
      }),
    };

    await expect(
      (
        await detail.GET(
          new Request(
            "http://localhost/api/v1/mistake-books/mistake_book_public_123",
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mistake_book_public_123",
    });
    await expect(
      (
        await favorite.POST(
          new Request(
            "http://localhost/api/v1/mistake-books/mistake_book_public_123/favorite",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mistake_book_public_123:favorite",
    });
    await expect(
      (
        await unfavorite.POST(
          new Request(
            "http://localhost/api/v1/mistake-books/mistake_book_public_123/unfavorite",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mistake_book_public_123:unfavorite",
    });
    await expect(
      (
        await markMastered.POST(
          new Request(
            "http://localhost/api/v1/mistake-books/mistake_book_public_123/mark-mastered",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mistake_book_public_123:mastered",
    });
    await expect(
      (
        await remove.POST(
          new Request(
            "http://localhost/api/v1/mistake-books/mistake_book_public_123/remove",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mistake_book_public_123:remove",
    });
    await expect(
      (
        await aiExplanation.POST(
          new Request(
            "http://localhost/api/v1/mistake-books/mistake_book_public_123/ai-explanation",
            {
              method: "POST",
              body: JSON.stringify({
                requestedFromClientAt: "2026-05-19T09:05:00.000Z",
              }),
            },
          ),
          context,
        )
      ).json(),
    ).resolves.toEqual({
      code: 0,
      message:
        "user_public_123:mistake_book_public_123:ai-explanation:2026-05-19T09:05:00.000Z",
      data: {
        aiExplanation: {
          explanationStatus: "explained",
          explanationText: "本地 AI 讲解",
          keyPoints: [],
          learningSuggestion: null,
          insufficientEvidenceMessage: null,
          evidenceStatus: "none",
          citations: [],
          promptTemplateKey: "dev_ai_explanation_v1",
          promptTemplateVersion: 1,
        },
      },
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { collection } = createMistakeBookRouteHandlers(
      createService(),
      async () => null,
    );

    const response = await collection.GET(
      new Request("http://localhost/api/v1/mistake-books"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });
});
