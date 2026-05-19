import { describe, expect, it } from "vitest";

import { createExamReportRouteHandlers } from "./exam-report-route";
import type { ExamReportService } from "./exam-report-service";

const userContext = {
  userPublicId: "user_public_123",
};

function createExamReportDto(publicId: string) {
  return {
    publicId,
    mockExamPublicId: "mock_exam_public_123",
    paperPublicId: "paper_public_123",
    paperName: "2024年专卖三级理论真题",
    profession: "monopoly" as const,
    level: 3,
    subject: "theory" as const,
    examStatus: "completed" as const,
    objectiveScore: "1.0",
    subjectiveScore: null,
    totalScore: "1.0",
    durationSecond: 2700,
    generatedAt: "2026-05-19T09:00:00.000Z",
    reportSnapshot: {
      paperName: "2024年专卖三级理论真题",
      questionDetails: [],
    },
    learningSuggestionSnapshot: null,
  };
}

function createService(): ExamReportService {
  return {
    async listExamReports(receivedUserContext, query) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${String(
          query && typeof query === "object" && "search" in query
            ? query.search
            : null,
        )}`,
        data: {
          examReports: [createExamReportDto("exam_report_public_123")],
        },
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "generatedAt",
          sortOrder: "desc",
        },
      };
    },
    async getExamReport(receivedUserContext, publicId) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${publicId}`,
        data: {
          examReport: createExamReportDto(publicId),
        },
      };
    },
    async generateExamReport(receivedUserContext, input) {
      return {
        code: 0,
        message: `${receivedUserContext.userPublicId}:${String(
          input && typeof input === "object" && "mockExamPublicId" in input
            ? input.mockExamPublicId
            : null,
        )}`,
        data: {
          examReport: createExamReportDto("exam_report_public_123"),
        },
      };
    },
    async retryLearningSuggestion(receivedUserContext, publicId) {
      return {
        code: 422321,
        message: `${receivedUserContext.userPublicId}:${publicId}:not-available`,
        data: null,
      };
    },
  };
}

describe("exam report route handlers", () => {
  it("passes list query and user context to service", async () => {
    const { collection } = createExamReportRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await collection.GET(
      new Request("http://localhost/api/v1/exam-reports?search=专卖"),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:专卖",
    });
  });

  it("passes publicId to detail and retry-learning-suggestion handlers", async () => {
    const { detail, retryLearningSuggestion } = createExamReportRouteHandlers(
      createService(),
      async () => userContext,
    );
    const context = {
      params: Promise.resolve({
        publicId: "exam_report_public_123",
      }),
    };

    await expect(
      (
        await detail.GET(
          new Request(
            "http://localhost/api/v1/exam-reports/exam_report_public_123",
          ),
          context,
        )
      ).json(),
    ).resolves.toMatchObject({
      message: "user_public_123:exam_report_public_123",
    });
    await expect(
      (
        await retryLearningSuggestion.POST(
          new Request(
            "http://localhost/api/v1/exam-reports/exam_report_public_123/retry-learning-suggestion",
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
      code: 422321,
      message: "user_public_123:exam_report_public_123:not-available",
      data: null,
    });
  });

  it("parses generation JSON for internal service callers", async () => {
    const { generation } = createExamReportRouteHandlers(
      createService(),
      async () => userContext,
    );

    const response = await generation.POST(
      new Request("http://localhost/api/v1/exam-reports", {
        method: "POST",
        body: JSON.stringify({
          mockExamPublicId: "mock_exam_public_123",
        }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      message: "user_public_123:mock_exam_public_123",
    });
  });

  it("returns standard unauthorized response when user context is missing", async () => {
    const { collection } = createExamReportRouteHandlers(
      createService(),
      async () => null,
    );

    const response = await collection.GET(
      new Request("http://localhost/api/v1/exam-reports"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });
});
