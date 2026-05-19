import { describe, expect, it } from "vitest";

import { createPaperDraftRouteHandlers } from "./paper-draft-route";
import type { PaperDraftService } from "./paper-draft-service";
import type {
  MaterialSnapshotDto,
  PaperDraftDto,
  PaperQuestionDto,
} from "../contracts/paper-draft-contract";

const materialSnapshotDto: MaterialSnapshotDto = {
  materialPublicId: "material_public_123",
  title: "入库案例材料",
  contentRichText: "<p>某仓库入库案例</p>",
  profession: "logistics",
  level: 4,
  subject: "skill",
};

const paperQuestionDto: PaperQuestionDto = {
  publicId: "paper_question_public_123",
  sourceQuestionPublicId: "question_public_123",
  paperSectionSortOrder: 1,
  questionGroupSortOrder: 1,
  score: "5.0",
  sortOrder: 1,
  questionSnapshot: {
    questionPublicId: "question_public_123",
    questionType: "short_answer",
    profession: "logistics",
    level: 4,
    subject: "skill",
    stemRichText: "<p>说明入库验收步骤</p>",
    questionOptions: [],
    standardAnswerRichText: "<p>核对单据并验收货物</p>",
    analysisRichText: "<p>按流程验收</p>",
    multiChoiceRule: "all_correct_only",
    scoringMethod: "ai_scoring",
  },
  materialSnapshot: materialSnapshotDto,
  scoringPoints: [
    {
      description: "说明单据核对",
      score: "2.5",
      sortOrder: 1,
    },
  ],
  createdAt: "2026-05-19T06:00:00.000Z",
  updatedAt: "2026-05-19T07:00:00.000Z",
};

const paperDto: PaperDraftDto = {
  publicId: "paper_public_123",
  name: "物流技能草稿卷",
  profession: "logistics",
  level: 4,
  subject: "skill",
  paperStatus: "draft",
  paperType: "mock_paper",
  year: 2026,
  source: "phase-3 baseline",
  durationMinute: 90,
  totalScore: "5.0",
  publishedAt: null,
  archivedAt: null,
  questionCount: 1,
  paperSections: [
    {
      title: "案例分析",
      description: "技能题",
      sortOrder: 1,
      totalScore: "5.0",
      paperQuestions: [paperQuestionDto],
    },
  ],
  questionGroups: [
    {
      title: "入库案例题组",
      materialPublicId: "material_public_123",
      materialSnapshot: materialSnapshotDto,
      sortOrder: 1,
    },
  ],
  createdAt: "2026-05-19T06:00:00.000Z",
  updatedAt: "2026-05-19T07:00:00.000Z",
};

function createService(): PaperDraftService {
  return {
    async listPapers() {
      return {
        code: 0,
        message: "ok",
        data: [paperDto],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      };
    },
    async createPaper() {
      return {
        code: 0,
        message: "ok",
        data: {
          paper: paperDto,
        },
      };
    },
    async getPaper(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          paper: {
            ...paperDto,
            publicId,
          },
        },
      };
    },
    async updatePaper(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          paper: {
            ...paperDto,
            publicId,
          },
        },
      };
    },
    async addQuestionToDraftPaper() {
      return {
        code: 0,
        message: "ok",
        data: {
          paperQuestion: paperQuestionDto,
        },
      };
    },
    async updatePaperQuestion(_paperPublicId, paperQuestionPublicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          paperQuestion: {
            ...paperQuestionDto,
            publicId: paperQuestionPublicId,
          },
        },
      };
    },
    async removePaperQuestion() {
      return {
        code: 0,
        message: "ok",
        data: {
          paper: {
            ...paperDto,
            questionCount: 0,
            paperSections: [],
          },
        },
      };
    },
    async publishPaper(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          paper: {
            ...paperDto,
            publicId,
            paperStatus: "published",
            publishedAt: "2026-05-19T08:00:00.000Z",
          },
          lockedQuestionPublicIds: ["question_public_123"],
          lockedMaterialPublicIds: ["material_public_123"],
        },
      };
    },
    async archivePaper(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          paper: {
            ...paperDto,
            publicId,
            paperStatus: "archived",
            archivedAt: "2026-05-19T09:00:00.000Z",
          },
        },
      };
    },
    async deletePaper(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          deletedPaperPublicId: publicId,
        },
      };
    },
    async copyPaper(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          copiedFromPaperPublicId: publicId,
          paper: {
            ...paperDto,
            publicId: "paper_public_copy_123",
            name: "物流技能草稿卷（副本）",
          },
        },
      };
    },
  };
}

describe("paper draft route handlers", () => {
  it("returns standard paper list, create, detail, and update responses", async () => {
    const handlers = createPaperDraftRouteHandlers(createService());
    const context = {
      params: Promise.resolve({
        publicId: "paper_public_123",
      }),
    };

    await expect(
      handlers.collection
        .GET(
          new Request(
            "http://localhost/api/v1/papers?page=1&pageSize=20&paperStatus=draft",
          ),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: [
        {
          publicId: "paper_public_123",
          paperSections: [
            {
              sortOrder: 1,
            },
          ],
        },
      ],
    });

    await expect(
      handlers.collection
        .POST(
          new Request("http://localhost/api/v1/papers", {
            method: "POST",
            body: JSON.stringify({
              name: "物流技能草稿卷",
              profession: "logistics",
              level: 4,
              subject: "skill",
              paperType: "mock_paper",
            }),
          }),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
        },
      },
    });

    await expect(
      handlers.detail
        .GET(
          new Request("http://localhost/api/v1/papers/paper_public_123"),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
        },
      },
    });

    await expect(
      handlers.detail
        .PATCH(
          new Request("http://localhost/api/v1/papers/paper_public_123", {
            method: "PATCH",
            body: JSON.stringify({
              name: "更新后的草稿卷",
              profession: "logistics",
              level: 4,
              subject: "skill",
              paperType: "mock_paper",
            }),
          }),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
        },
      },
    });
  });

  it("uses public identifiers for paper question composition routes", async () => {
    const handlers = createPaperDraftRouteHandlers(createService());
    const paperContext = {
      params: Promise.resolve({
        publicId: "paper_public_123",
      }),
    };
    const paperQuestionContext = {
      params: Promise.resolve({
        publicId: "paper_public_123",
        paperQuestionPublicId: "paper_question_public_123",
      }),
    };

    await expect(
      handlers.questions
        .POST(
          new Request(
            "http://localhost/api/v1/papers/paper_public_123/questions",
            {
              method: "POST",
              body: JSON.stringify({
                questionPublicId: "question_public_123",
                score: "5.0",
                sortOrder: 1,
                paperSection: {
                  title: "案例分析",
                  description: "技能题",
                  sortOrder: 1,
                },
                questionGroup: {
                  title: "入库案例题组",
                  materialPublicId: "material_public_123",
                  sortOrder: 1,
                },
              }),
            },
          ),
          paperContext,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paperQuestion: {
          publicId: "paper_question_public_123",
          sourceQuestionPublicId: "question_public_123",
        },
      },
    });

    await expect(
      handlers.questions
        .PATCH(
          new Request(
            "http://localhost/api/v1/papers/paper_public_123/questions/paper_question_public_123",
            {
              method: "PATCH",
              body: JSON.stringify({
                score: "6.0",
                sortOrder: 2,
                scoringPoints: [],
              }),
            },
          ),
          paperQuestionContext,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paperQuestion: {
          publicId: "paper_question_public_123",
        },
      },
    });

    await expect(
      handlers.questions
        .DELETE(
          new Request(
            "http://localhost/api/v1/papers/paper_public_123/questions/paper_question_public_123",
            {
              method: "DELETE",
            },
          ),
          paperQuestionContext,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        paper: {
          publicId: "paper_public_123",
          questionCount: 0,
        },
      },
    });
  });

  it("uses public identifiers for the paper publish action route", async () => {
    const handlers = createPaperDraftRouteHandlers(createService());
    const context = {
      params: Promise.resolve({
        publicId: "paper_public_123",
      }),
    };

    await expect(
      handlers.publish
        .POST(
          new Request(
            "http://localhost/api/v1/papers/paper_public_123/publish",
            {
              method: "POST",
            },
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paper: {
          ...paperDto,
          paperStatus: "published",
          publishedAt: "2026-05-19T08:00:00.000Z",
        },
        lockedQuestionPublicIds: ["question_public_123"],
        lockedMaterialPublicIds: ["material_public_123"],
      },
    });
  });

  it("uses public identifiers for paper archive, delete, and copy action routes", async () => {
    const handlers = createPaperDraftRouteHandlers(createService());
    const context = {
      params: Promise.resolve({
        publicId: "paper_public_123",
      }),
    };

    await expect(
      handlers.archive
        .POST(
          new Request(
            "http://localhost/api/v1/papers/paper_public_123/archive",
            {
              method: "POST",
            },
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        paper: {
          publicId: "paper_public_123",
          paperStatus: "archived",
        },
      },
    });

    await expect(
      handlers.detail
        .DELETE(
          new Request("http://localhost/api/v1/papers/paper_public_123", {
            method: "DELETE",
          }),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        deletedPaperPublicId: "paper_public_123",
      },
    });

    await expect(
      handlers.copy
        .POST(
          new Request("http://localhost/api/v1/papers/paper_public_123/copy", {
            method: "POST",
          }),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: {
        copiedFromPaperPublicId: "paper_public_123",
        paper: {
          publicId: "paper_public_copy_123",
        },
      },
    });
  });
});
