import { describe, expect, it } from "vitest";

import { createStudentMistakeBookRuntimeRouteHandlers } from "@/server/services/student-mistake-book-runtime";
import { createLocalModelConfigRuntimeCatalog } from "@/server/services/model-config-runtime";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  MistakeBookRepository,
  MistakeBookRow,
  UpdateMistakeBookStateInput,
} from "@/server/repositories/mistake-book-repository";

const now = new Date("2026-05-22T05:00:00.000Z");
const latestWrongAt = new Date("2026-05-21T05:00:00.000Z");
const scopeExpiresAt = new Date("2027-05-21T05:00:00.000Z");

function createStudentSession(): ApiResponse<AuthContextDto> {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user_public_student_123",
        phone: "13800000000",
        name: "本地学员",
        userType: "personal",
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: null,
        adminRoles: [],
      },
      session: {
        expiresAt: "2026-05-23T05:00:00.000Z",
      },
    },
  };
}

function createAdminSession(): ApiResponse<AuthContextDto> {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "admin_user_public_123",
        phone: "13900000000",
        name: "本地管理员",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: "admin_public_123",
        adminRoles: ["super_admin"],
      },
      session: {
        expiresAt: "2026-05-23T05:00:00.000Z",
      },
    },
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
    async listEffectiveAuthorizationScopes(query) {
      expect(query.userPublicId).toBe("user_public_student_123");

      return [
        {
          profession: "monopoly",
          level: 3,
          authorization_types: ["personal_auth"],
          expires_at: scopeExpiresAt,
        },
      ];
    },
    async listMistakeBooks(query) {
      expect(query.userPublicId).toBe("user_public_student_123");

      return {
        rows: [createMistakeBookRow()],
        total: 1,
      };
    },
    async findMistakeBookByPublicId(query) {
      expect(query.userPublicId).toBe("user_public_student_123");

      return query.publicId === "mistake_book_public_123"
        ? createMistakeBookRow()
        : null;
    },
    async updateMistakeBookState(input) {
      expect(input.userPublicId).toBe("user_public_student_123");

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

function createHandlers(
  options: {
    repository?: MistakeBookRepository;
    sessionResponse?: ApiResponse<AuthContextDto>;
  } = {},
) {
  return createStudentMistakeBookRuntimeRouteHandlers({
    mistakeBookRepository: options.repository ?? createRepository(),
    now: () => now,
    sessionService: {
      async getCurrentSession(input) {
        return input.authorization === "Bearer student-session-token"
          ? (options.sessionResponse ?? createStudentSession())
          : {
              code: 401001,
              message: "User session is required.",
              data: null,
            };
      },
    },
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<unknown>;
}

describe("phase 8 student mistake_book runtime", () => {
  it("lists only the authenticated student's mistake_book records without numeric ids", async () => {
    const handlers = createHandlers();
    const response = await handlers.collection.GET(
      new Request("http://localhost/api/v1/mistake-books?page=1&pageSize=20", {
        headers: {
          authorization: "Bearer student-session-token",
        },
      }),
    );
    const body = await readJson(response);

    expect(body).toMatchObject({
      code: 0,
      data: {
        mistakeBooks: [
          {
            publicId: "mistake_book_public_123",
            questionPublicId: "question_public_123",
            mistakeBookStatus: "unmastered",
            wrongCount: 2,
            masteredAt: null,
          },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 1,
      },
    });
    expect(
      (body as { data: { mistakeBooks: Array<Record<string, unknown>> } }).data
        .mistakeBooks[0],
    ).not.toHaveProperty("id");
  });

  it("rejects missing session and admin session with the contract-safe auth error", async () => {
    const missingSessionResponse = await createHandlers().collection.GET(
      new Request("http://localhost/api/v1/mistake-books"),
    );
    const adminSessionResponse = await createHandlers({
      sessionResponse: createAdminSession(),
    }).collection.GET(
      new Request("http://localhost/api/v1/mistake-books", {
        headers: {
          authorization: "Bearer student-session-token",
        },
      }),
    );

    await expect(readJson(missingSessionResponse)).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
    await expect(readJson(adminSessionResponse)).resolves.toEqual({
      code: 401001,
      message: "User session is required.",
      data: null,
    });
  });

  it("returns not found for another student's publicId without leaking ownership state", async () => {
    const handlers = createHandlers();
    const response = await handlers.detail.GET(
      new Request(
        "http://localhost/api/v1/mistake-books/mistake_book_public_other",
        {
          headers: {
            authorization: "Bearer student-session-token",
          },
        },
      ),
      {
        params: Promise.resolve({
          publicId: "mistake_book_public_other",
        }),
      },
    );

    await expect(readJson(response)).resolves.toEqual({
      code: 404331,
      message: "Mistake book item does not exist.",
      data: null,
    });
  });

  it("keeps state actions scoped to the authenticated student", async () => {
    const updates: UpdateMistakeBookStateInput[] = [];
    const handlers = createHandlers({
      repository: createRepository({
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
    });
    const context = {
      params: Promise.resolve({
        publicId: "mistake_book_public_123",
      }),
    };

    await handlers.favorite.POST(
      new Request(
        "http://localhost/api/v1/mistake-books/mistake_book_public_123/favorite",
        {
          method: "POST",
          headers: {
            authorization: "Bearer student-session-token",
          },
        },
      ),
      context,
    );
    await handlers.markMastered.POST(
      new Request(
        "http://localhost/api/v1/mistake-books/mistake_book_public_123/mark-mastered",
        {
          method: "POST",
          headers: {
            authorization: "Bearer student-session-token",
          },
        },
      ),
      context,
    );

    expect(updates).toEqual([
      expect.objectContaining({
        userPublicId: "user_public_student_123",
        publicId: "mistake_book_public_123",
        isFavorite: true,
      }),
      expect.objectContaining({
        userPublicId: "user_public_student_123",
        publicId: "mistake_book_public_123",
        mistakeBookStatus: "mastered",
        masteredAt: now,
      }),
    ]);
  });

  it("returns local deterministic ai_explanation without calling a real provider", async () => {
    const handlers = createHandlers();
    const response = await handlers.aiExplanation.POST(
      new Request(
        "http://localhost/api/v1/mistake-books/mistake_book_public_123/ai-explanation",
        {
          method: "POST",
          headers: {
            authorization: "Bearer student-session-token",
          },
          body: JSON.stringify({
            requestedFromClientAt: "2026-05-22T05:05:00.000Z",
          }),
        },
      ),
      {
        params: Promise.resolve({
          publicId: "mistake_book_public_123",
        }),
      },
    );

    await expect(readJson(response)).resolves.toMatchObject({
      code: 0,
      data: {
        aiExplanation: {
          explanationStatus: "explained",
          promptTemplateKey: "dev_ai_explanation_v1",
          promptTemplateVersion: 1,
          citations: [],
        },
      },
    });
  });

  it("uses the configured ai_explanation fallback model_config in the student runtime", async () => {
    const aiCallLogEntries: unknown[] = [];
    const handlers = createStudentMistakeBookRuntimeRouteHandlers({
      mistakeBookRepository: createRepository(),
      now: () => now,
      modelConfigRuntimeCatalog: createLocalModelConfigRuntimeCatalog({
        overrides: {
          "model-config-dev-ai-explanation": { isEnabled: false },
          "model-config-dev-ai-explanation-fallback": { isEnabled: true },
        },
      }),
      aiCallLogRepository: {
        async appendAiCallLog(input) {
          aiCallLogEntries.push(input);

          return {
            publicId: "ai-call-log-public-fallback",
            userPublicId: input.userPublicId,
            organizationPublicId: null,
            profession: null,
            level: null,
            aiFuncType: input.aiFuncType,
            callStatus: input.callStatus,
            providerDisplayName: input.modelConfigSnapshot.providerDisplayName,
            modelAlias: input.modelConfigSnapshot.modelName,
            promptSummary: "redacted prompt snapshot",
            outputSummary: "redacted model output snapshot",
            promptTokenCount: input.promptTokenCount,
            completionTokenCount: input.completionTokenCount,
            totalTokenCount: input.totalTokenCount,
            estimatedCostCny: "0.00",
            latencyMs: input.latencyMs,
            startedAt: input.startedAt.toISOString(),
            completedAt: input.completedAt?.toISOString() ?? null,
          };
        },
      },
      sessionService: {
        async getCurrentSession(input) {
          return input.authorization === "Bearer student-session-token"
            ? createStudentSession()
            : {
                code: 401001,
                message: "User session is required.",
                data: null,
              };
        },
      },
    });

    const response = await handlers.aiExplanation.POST(
      new Request(
        "http://localhost/api/v1/mistake-books/mistake_book_public_123/ai-explanation",
        {
          method: "POST",
          headers: {
            authorization: "Bearer student-session-token",
          },
          body: JSON.stringify({
            requestedFromClientAt: "2026-05-22T05:05:00.000Z",
          }),
        },
      ),
      {
        params: Promise.resolve({
          publicId: "mistake_book_public_123",
        }),
      },
    );

    await expect(readJson(response)).resolves.toMatchObject({
      code: 0,
      data: {
        aiExplanation: {
          explanationStatus: "explained",
          promptTemplateKey: "dev_ai_explanation_v1",
          promptTemplateVersion: 1,
        },
      },
    });
    expect(aiCallLogEntries).toEqual([
      expect.objectContaining({
        aiFuncType: "ai_explanation",
        modelConfigSnapshot: expect.objectContaining({
          modelConfigPublicId: "model-config-dev-ai-explanation-fallback",
          aiFuncType: "explanation",
          promptTemplateKey: "dev_ai_explanation_v1",
          promptTemplateVersion: 1,
        }),
      }),
    ]);
    expect(JSON.stringify(aiCallLogEntries)).not.toContain(
      "student-session-token",
    );
  });
});
