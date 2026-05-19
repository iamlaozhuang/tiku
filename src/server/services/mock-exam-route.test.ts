import { describe, expect, it } from "vitest";

import { createMockExamRouteHandlers } from "./mock-exam-route";
import type { MockExamService } from "./mock-exam-service";

const userContext = {
  userPublicId: "user_public_123",
};

function createService(): MockExamService {
  return {
    async startMockExam(receivedUserContext, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${String(
          input && typeof input === "object" && "paperPublicId" in input
            ? input.paperPublicId
            : null,
        )}`,
        data: {
          mockExam: createMockExamDto("mock_exam_public_123"),
        },
      };
    },
    async getMockExam(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}`,
        data: {
          mockExam: createMockExamDto(publicId),
        },
      };
    },
    async saveMockExamAnswer(receivedUserContext, publicId, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:${String(
          input && typeof input === "object" && "paperQuestionPublicId" in input
            ? input.paperQuestionPublicId
            : null,
        )}`,
        data: {
          answerRecord: {
            publicId: "answer_record_public_123",
            examMode: "mock_exam",
            paperQuestionPublicId: "paper_question_public_123",
            questionPublicId: "question_public_123",
            answerSnapshot: {
              selectedLabels: ["A"],
              textAnswer: null,
              savedFromClientAt: null,
            },
            answerRecordStatus: "saved",
            isCorrect: null,
            score: null,
            maxScore: "1.0",
            answeredAt: "2026-05-19T08:00:00.000Z",
            submittedAt: null,
          },
        },
      };
    },
    async submitMockExam(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:submit`,
        data: {
          mockExam: createMockExamDto(publicId, "completed"),
          unansweredCount: 0,
        },
      };
    },
    async terminateMockExam(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}:terminate`,
        data: {
          mockExam: createMockExamDto(publicId, "terminated"),
        },
      };
    },
  };
}

function createMockExamDto(
  publicId: string,
  examStatus: "in_progress" | "completed" | "terminated" = "in_progress",
) {
  return {
    publicId,
    paperPublicId: "paper_public_123",
    profession: "monopoly" as const,
    level: 3,
    subject: "theory" as const,
    examStatus,
    startedAt: "2026-05-19T08:00:00.000Z",
    submittedAt: examStatus === "completed" ? "2026-05-19T09:00:00.000Z" : null,
    serverNow: "2026-05-19T08:00:00.000Z",
    serverDeadlineAt: "2026-05-19T10:00:00.000Z",
    durationMinute: 120,
    questionCount: 1,
    answeredCount: 0,
    paperSnapshot: {
      paperPublicId: "paper_public_123",
      paperSections: [],
    },
  };
}

describe("mock exam route handlers", () => {
  it("parses start mock exam JSON and user context", async () => {
    const { collection } = createMockExamRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await collection.POST(
      new Request("http://localhost/api/v1/mock-exams", {
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

  it("passes public id to detail, submit, and terminate handlers", async () => {
    const { detail, submit, terminate } = createMockExamRouteHandlers(
      createService(),
      async () => userContext,
    );
    const context = {
      params: Promise.resolve({
        publicId: "mock_exam_public_123",
      }),
    };

    await expect(
      (
        await detail.GET(
          new Request(
            "http://localhost/api/v1/mock-exams/mock_exam_public_123",
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mock_exam_public_123",
    });
    await expect(
      (
        await submit.POST(
          new Request(
            "http://localhost/api/v1/mock-exams/mock_exam_public_123/submit",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mock_exam_public_123:submit",
    });
    await expect(
      (
        await terminate.POST(
          new Request(
            "http://localhost/api/v1/mock-exams/mock_exam_public_123/terminate",
            { method: "POST" },
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:mock_exam_public_123:terminate",
    });
  });

  it("parses mock exam answer JSON", async () => {
    const { answers } = createMockExamRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await answers.POST(
      new Request(
        "http://localhost/api/v1/mock-exams/mock_exam_public_123/answers",
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
          publicId: "mock_exam_public_123",
        }),
      },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:mock_exam_public_123:paper_question_public_123",
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { collection } = createMockExamRouteHandlers(
      createService(),
      async () => null,
    );

    const response = await collection.POST(
      new Request("http://localhost/api/v1/mock-exams", {
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
