import { describe, expect, it } from "vitest";

import { createQuestionRouteHandlers } from "./question-route";
import type { QuestionService } from "./question-service";
import type { QuestionDto } from "../contracts/question-contract";

const questionDto: QuestionDto = {
  publicId: "question_public_123",
  questionType: "single_choice",
  profession: "logistics",
  level: 4,
  subject: "theory",
  stemRichText: "<p>仓储作业应优先检查哪项？</p>",
  analysisRichText: "<p>老师解析内容</p>",
  standardAnswerRichText: "<p>A</p>",
  status: "available",
  isLocked: false,
  lockedAt: null,
  multiChoiceRule: "all_correct_only",
  scoringMethod: "auto_match",
  materialPublicId: "material_public_123",
  questionOptions: [
    {
      label: "A",
      contentRichText: "<p>核对入库单</p>",
      isCorrect: true,
      sortOrder: 1,
    },
  ],
  scoringPoints: [
    {
      description: "指出核对单据",
      score: "2.5",
      sortOrder: 1,
    },
  ],
  knowledgeNodePublicIds: [],
  tagPublicIds: [],
  createdAt: "2026-05-19T04:00:00.000Z",
  updatedAt: "2026-05-19T04:00:00.000Z",
};

function createService(): QuestionService {
  return {
    async listQuestions() {
      return {
        code: 0,
        message: "ok",
        data: [questionDto],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      };
    },
    async createQuestion() {
      return {
        code: 0,
        message: "ok",
        data: {
          question: questionDto,
        },
      };
    },
    async getQuestion(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          question: {
            ...questionDto,
            publicId,
          },
        },
      };
    },
    async updateQuestion(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          question: {
            ...questionDto,
            publicId,
          },
        },
      };
    },
    async disableQuestion(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          question: {
            ...questionDto,
            publicId,
            status: "disabled",
          },
        },
      };
    },
    async copyQuestion(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          question: {
            ...questionDto,
            publicId: `${publicId}_copy`,
          },
        },
      };
    },
  };
}

describe("question route handlers", () => {
  it("returns standard list and create responses", async () => {
    const handlers = createQuestionRouteHandlers(createService());

    await expect(
      handlers.collection
        .GET(
          new Request(
            "http://localhost/api/v1/questions?page=1&pageSize=20&questionType=single_choice",
          ),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: [
        {
          publicId: "question_public_123",
          materialPublicId: "material_public_123",
          questionOptions: [
            {
              label: "A",
            },
          ],
        },
      ],
    });

    await expect(
      handlers.collection
        .POST(
          new Request("http://localhost/api/v1/questions", {
            method: "POST",
            body: JSON.stringify({
              questionType: "single_choice",
              profession: "logistics",
              level: 4,
              subject: "theory",
              stemRichText: "<p>仓储作业应优先检查哪项？</p>",
              analysisRichText: "<p>老师解析内容</p>",
              standardAnswerRichText: "<p>A</p>",
              multiChoiceRule: "all_correct_only",
              scoringMethod: "auto_match",
              materialPublicId: "material_public_123",
              questionOptions: [],
              scoringPoints: [],
            }),
          }),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
        },
      },
    });
  });

  it("uses publicId route params for detail, update, disable, and copy", async () => {
    const handlers = createQuestionRouteHandlers(createService());
    const context = {
      params: Promise.resolve({
        publicId: "question_public_123",
      }),
    };

    await expect(
      handlers.detail
        .GET(
          new Request("http://localhost/api/v1/questions/question_public_123"),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
        },
      },
    });

    await expect(
      handlers.detail
        .PATCH(
          new Request("http://localhost/api/v1/questions/question_public_123", {
            method: "PATCH",
            body: JSON.stringify({
              questionType: "single_choice",
              profession: "logistics",
              level: 4,
              subject: "theory",
              stemRichText: "<p>更新题干</p>",
              analysisRichText: "<p>更新解析</p>",
              standardAnswerRichText: "<p>A</p>",
              status: "available",
              multiChoiceRule: "all_correct_only",
              scoringMethod: "auto_match",
              materialPublicId: "material_public_123",
              questionOptions: [],
              scoringPoints: [],
            }),
          }),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
        },
      },
    });

    await expect(
      handlers.disable
        .POST(
          new Request(
            "http://localhost/api/v1/questions/question_public_123/disable",
            {
              method: "POST",
            },
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123",
          status: "disabled",
        },
      },
    });

    await expect(
      handlers.copy
        .POST(
          new Request(
            "http://localhost/api/v1/questions/question_public_123/copy",
            {
              method: "POST",
            },
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        question: {
          publicId: "question_public_123_copy",
        },
      },
    });
  });
});
