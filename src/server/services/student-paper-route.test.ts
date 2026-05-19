import { describe, expect, it } from "vitest";

import { createStudentPaperRouteHandlers } from "./student-paper-route";
import type { StudentPaperService } from "./student-paper-service";

const userContext = {
  userPublicId: "user_public_123",
};

function createService(): StudentPaperService {
  return {
    async listScopes() {
      return {
        code: 0,
        message: "ok",
        data: [
          {
            profession: "monopoly",
            level: 3,
            authorizationTypes: ["personal_auth"],
            expiresAt: "2026-06-19T08:00:00.000Z",
            status: "active",
          },
        ],
      };
    },
    async listStudentPapers(receivedUserContext, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${String(input?.level)}`,
        data: [
          {
            publicId: "paper_public_123",
            name: "2024年专卖三级理论真题",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            paperType: "past_paper",
            durationMinute: 120,
            totalScore: "100.0",
            publishedAt: "2026-05-19T08:00:00.000Z",
            questionCount: 80,
            canPractice: true,
            canMockExam: true,
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "publishedAt",
          sortOrder: "desc",
        },
      };
    },
    async getStudentPaper(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}`,
        data: {
          paper: {
            publicId,
            name: "2024年专卖三级理论真题",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            paperType: "past_paper",
            durationMinute: 120,
            totalScore: "100.0",
            publishedAt: "2026-05-19T08:00:00.000Z",
            questionCount: 80,
            canPractice: true,
            canMockExam: true,
            paperSnapshot: {
              paperPublicId: publicId,
              paperSections: [],
            },
          },
        },
      };
    },
  };
}

describe("student paper route handlers", () => {
  it("returns current student paper scopes", async () => {
    const { scopes } = createStudentPaperRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await scopes.GET(
      new Request("http://localhost/api/v1/student-papers/scopes"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: [
        {
          profession: "monopoly",
          level: 3,
          authorizationTypes: ["personal_auth"],
          expiresAt: "2026-06-19T08:00:00.000Z",
          status: "active",
        },
      ],
    });
  });

  it("passes query string values to the paper list service", async () => {
    const { collection } = createStudentPaperRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await collection.GET(
      new Request(
        "http://localhost/api/v1/student-papers?page=1&pageSize=20&profession=monopoly&level=3&subject=theory",
      ),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:3",
      data: [
        {
          publicId: "paper_public_123",
          canPractice: true,
          canMockExam: true,
        },
      ],
    });
  });

  it("passes public id to the paper detail service", async () => {
    const { detail } = createStudentPaperRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await detail.GET(
      new Request("http://localhost/api/v1/student-papers/paper_public_123"),
      {
        params: Promise.resolve({
          publicId: "paper_public_123",
        }),
      },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:paper_public_123",
      data: {
        paper: {
          publicId: "paper_public_123",
          paperSnapshot: {
            paperPublicId: "paper_public_123",
          },
        },
      },
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { collection } = createStudentPaperRouteHandlers(
      createService(),
      async () => null,
    );

    const response = await collection.GET(
      new Request("http://localhost/api/v1/student-papers"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });
});
