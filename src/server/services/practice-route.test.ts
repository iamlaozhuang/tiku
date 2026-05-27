import { describe, expect, it } from "vitest";

import { createPracticeRouteHandlers } from "./practice-route";
import type { PracticeService } from "./practice-service";

const userContext = {
  userPublicId: "user_public_123",
};

function createService(): PracticeService {
  return {
    async startPractice(receivedUserContext, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${String(
          input && typeof input === "object" && "paperPublicId" in input
            ? input.paperPublicId
            : null,
        )}`,
        data: {
          practice: {
            publicId: "practice_public_123",
            paperPublicId: "paper_public_123",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            practiceStatus: "in_progress",
            startedAt: "2026-05-19T08:00:00.000Z",
            lastAnsweredAt: null,
            expiresAt: "2026-06-03T08:00:00.000Z",
            currentQuestionIndex: 0,
            questionCount: 1,
            paperSnapshot: {
              paperPublicId: "paper_public_123",
              paperSections: [],
            },
          },
          answerRecords: [],
        },
      };
    },
    async getPractice(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}`,
        data: {
          practice: {
            publicId,
            paperPublicId: "paper_public_123",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            practiceStatus: "in_progress",
            startedAt: "2026-05-19T08:00:00.000Z",
            lastAnsweredAt: null,
            expiresAt: "2026-06-03T08:00:00.000Z",
            currentQuestionIndex: 0,
            questionCount: 1,
            paperSnapshot: {
              paperPublicId: "paper_public_123",
              paperSections: [],
            },
          },
          answerRecords: [],
        },
      };
    },
    async submitPracticeAnswer(receivedUserContext, publicId, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:${String(
          input && typeof input === "object" && "paperQuestionPublicId" in input
            ? input.paperQuestionPublicId
            : null,
        )}`,
        data: {
          feedback: {
            answerRecordPublicId: "answer_record_public_123",
            isCorrect: true,
            score: "1.0",
            maxScore: "1.0",
            standardAnswerRichText: "<p>A</p>",
            analysisRichText: "<p>解析</p>",
            mistakeBookPublicId: null,
            aiExplanationStatus: null,
            aiExplanationText: null,
            aiExplanationLearningSuggestion: null,
            aiExplanationEvidenceStatus: null,
            aiExplanationCitations: [],
            aiHintStatus: null,
            aiHintText: null,
            aiHintImprovementDirections: [],
            aiHintEvidenceStatus: null,
            aiHintCitations: [],
            retryRemainingCount: 0,
            answeredAt: "2026-05-19T08:00:00.000Z",
          },
        },
      };
    },
    async favoritePracticeQuestion(receivedUserContext, publicId, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:${String(
          input && typeof input === "object" && "paperQuestionPublicId" in input
            ? input.paperQuestionPublicId
            : null,
        )}:favorite`,
        data: {
          mistakeBookPublicId: "mistake_book_public_favorite",
        },
      };
    },
    async restartPractice(receivedUserContext, publicId) {
      return this.getPractice(receivedUserContext, publicId);
    },
    async terminatePractice(receivedUserContext, publicId) {
      return this.getPractice(receivedUserContext, publicId);
    },
  };
}

describe("practice route handlers", () => {
  it("parses start practice JSON and user context", async () => {
    const { collection } = createPracticeRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await collection.POST(
      new Request("http://localhost/api/v1/practices", {
        method: "POST",
        body: JSON.stringify({
          paperPublicId: "paper_public_123",
        }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:paper_public_123",
    });
  });

  it("passes public id to detail, restart, and terminate handlers", async () => {
    const { detail, restart, terminate } = createPracticeRouteHandlers(
      createService(),
      async () => userContext,
    );
    const context = {
      params: Promise.resolve({
        publicId: "practice_public_123",
      }),
    };

    await expect(
      (
        await detail.GET(
          new Request("http://localhost/api/v1/practices/practice_public_123"),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:practice_public_123",
    });
    await expect(
      (
        await restart.POST(
          new Request(
            "http://localhost/api/v1/practices/practice_public_123/restart",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:practice_public_123",
    });
    await expect(
      (
        await terminate.POST(
          new Request(
            "http://localhost/api/v1/practices/practice_public_123/terminate",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:practice_public_123",
    });
  });

  it("parses practice answer JSON", async () => {
    const { answers } = createPracticeRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await answers.POST(
      new Request(
        "http://localhost/api/v1/practices/practice_public_123/answers",
        {
          method: "POST",
          body: JSON.stringify({
            paperQuestionPublicId: "paper_question_public_123",
            selectedLabels: ["A"],
          }),
        },
      ),
      {
        params: Promise.resolve({
          publicId: "practice_public_123",
        }),
      },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:practice_public_123:paper_question_public_123",
    });
  });

  it("parses manual favorite question JSON", async () => {
    const { favoriteQuestion } = createPracticeRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await favoriteQuestion.POST(
      new Request(
        "http://localhost/api/v1/practices/practice_public_123/favorite-question",
        {
          method: "POST",
          body: JSON.stringify({
            paperQuestionPublicId: "paper_question_public_123",
          }),
        },
      ),
      {
        params: Promise.resolve({
          publicId: "practice_public_123",
        }),
      },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message:
        "user_public_123:practice_public_123:paper_question_public_123:favorite",
      data: {
        mistakeBookPublicId: "mistake_book_public_favorite",
      },
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { collection } = createPracticeRouteHandlers(
      createService(),
      async () => null,
    );

    const response = await collection.POST(
      new Request("http://localhost/api/v1/practices", {
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });
});
