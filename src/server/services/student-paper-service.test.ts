import { describe, expect, it } from "vitest";

import { createStudentPaperService } from "./student-paper-service";
import type {
  StudentPaperAuthorizationScopeRow,
  StudentPaperRepository,
  StudentPublishedPaperRow,
} from "../repositories/student-paper-repository";

const expiresAt = new Date("2026-06-19T08:00:00.000Z");
const publishedAt = new Date("2026-05-19T08:00:00.000Z");

const userContext = {
  userPublicId: "user_public_123",
};

function createScope(
  overrides: Partial<StudentPaperAuthorizationScopeRow> = {},
): StudentPaperAuthorizationScopeRow {
  return {
    profession: "monopoly",
    level: 3,
    authorization_types: ["personal_auth"],
    expires_at: expiresAt,
    ...overrides,
  };
}

function createPaper(
  overrides: Partial<StudentPublishedPaperRow> = {},
): StudentPublishedPaperRow {
  return {
    public_id: "paper_public_123",
    name: "2024年专卖三级理论真题",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    paper_type: "past_paper",
    duration_minute: 120,
    total_score: "100.0",
    published_at: publishedAt,
    question_count: 80,
    paper_snapshot: {
      paperPublicId: "paper_public_123",
      name: "2024年专卖三级理论真题",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "past_paper",
      durationMinute: 120,
      totalScore: "100.0",
      publishedAt: "2026-05-19T08:00:00.000Z",
      paperSections: [],
    },
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<StudentPaperRepository> = {},
): StudentPaperRepository {
  return {
    async listEffectiveAuthorizationScopes() {
      return [createScope()];
    },
    async listPublishedPapers() {
      return {
        rows: [createPaper()],
        total: 1,
      };
    },
    async findPublishedPaperByPublicId(query) {
      return createPaper({
        public_id: query.publicId,
      });
    },
    ...overrides,
  };
}

describe("student paper service", () => {
  it("lists effective authorization scopes for the current student", async () => {
    const service = createStudentPaperService(createRepository());

    await expect(service.listScopes(userContext)).resolves.toEqual({
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

  it("lists only published papers matching the selected authorization scope", async () => {
    const receivedQueries: unknown[] = [];
    const service = createStudentPaperService(
      createRepository({
        async listPublishedPapers(query) {
          receivedQueries.push(query);

          return {
            rows: [
              createPaper({
                profession: query.profession,
                level: query.level,
                subject: query.subject ?? "theory",
              }),
            ],
            total: 1,
          };
        },
      }),
    );

    await expect(
      service.listStudentPapers(userContext, {
        page: "2",
        pageSize: "10",
        profession: "monopoly",
        level: "3",
        subject: "theory",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: [
        {
          publicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          canPractice: true,
          canMockExam: true,
        },
      ],
      pagination: {
        page: 2,
        pageSize: 10,
        total: 1,
        sortBy: "publishedAt",
        sortOrder: "desc",
      },
    });
    expect(receivedQueries).toEqual([
      {
        userPublicId: "user_public_123",
        page: 2,
        pageSize: 10,
        sortBy: "publishedAt",
        sortOrder: "desc",
        profession: "monopoly",
        level: 3,
        subject: "theory",
      },
    ]);
  });

  it("infers the single effective scope and returns an empty list when no authorization exists", async () => {
    const singleScopeService = createStudentPaperService(createRepository());

    await expect(
      singleScopeService.listStudentPapers(userContext, {}),
    ).resolves.toMatchObject({
      code: 0,
      data: [
        {
          publicId: "paper_public_123",
        },
      ],
    });

    const noScopeService = createStudentPaperService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [];
        },
      }),
    );

    await expect(
      noScopeService.listStudentPapers(userContext, {}),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        sortBy: "publishedAt",
        sortOrder: "desc",
      },
    });
  });

  it("rejects ambiguous or out-of-scope paper list requests without leaking papers", async () => {
    const service = createStudentPaperService(
      createRepository({
        async listEffectiveAuthorizationScopes() {
          return [
            createScope(),
            createScope({
              profession: "marketing",
              level: 4,
            }),
          ];
        },
      }),
    );

    await expect(service.listStudentPapers(userContext, {})).resolves.toEqual({
      code: 422301,
      message: "Student paper scope selection is required.",
      data: null,
    });

    await expect(
      service.listStudentPapers(userContext, {
        profession: "logistics",
        level: "5",
      }),
    ).resolves.toEqual({
      code: 403301,
      message: "Student authorization is not valid for this paper scope.",
      data: null,
    });
  });

  it("returns detail only for published papers in the effective authorization scope", async () => {
    const service = createStudentPaperService(createRepository());

    await expect(
      service.getStudentPaper(userContext, "paper_public_123"),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        paper: {
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
          paperSnapshot: {
            paperPublicId: "paper_public_123",
            name: "2024年专卖三级理论真题",
            profession: "monopoly",
            level: 3,
            subject: "theory",
            paperType: "past_paper",
            durationMinute: 120,
            totalScore: "100.0",
            publishedAt: "2026-05-19T08:00:00.000Z",
            paperSections: [],
          },
        },
      },
    });
  });

  it("hides missing and unauthorized detail access behind not found responses", async () => {
    const missingService = createStudentPaperService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return null;
        },
      }),
    );

    await expect(
      missingService.getStudentPaper(userContext, "missing_paper"),
    ).resolves.toEqual({
      code: 404301,
      message: "Student paper does not exist.",
      data: null,
    });

    const unauthorizedService = createStudentPaperService(
      createRepository({
        async findPublishedPaperByPublicId() {
          return createPaper({
            profession: "logistics",
            level: 5,
          });
        },
      }),
    );

    await expect(
      unauthorizedService.getStudentPaper(userContext, "paper_public_123"),
    ).resolves.toEqual({
      code: 404301,
      message: "Student paper does not exist.",
      data: null,
    });
  });
});
