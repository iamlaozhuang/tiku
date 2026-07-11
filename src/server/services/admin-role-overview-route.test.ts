import { describe, expect, it, vi } from "vitest";

import {
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthContextDto } from "../contracts/auth-contract";
import type { AdminRole } from "../models/auth";
import { createPostgresAdminRoleOverviewRepository } from "../repositories/admin-role-overview-repository";
import type { SessionService } from "./session-service";
import {
  createAdminRoleOverviewRuntimeRouteHandlers,
  type AdminRoleOverviewRepository,
} from "./admin-role-overview-route";

const operationsSummary = {
  userTotal: 17,
  disabledUserTotal: 2,
  organizationTotal: 8,
  authorizationAttentionTotal: 3,
  unusedRedeemCodeTotal: 5,
  failedAiCallTotal: 1,
};

const contentSummary = {
  availableQuestionTotal: 120,
  disabledQuestionTotal: 4,
  draftPaperTotal: 6,
  publishedPaperTotal: 10,
  archivedPaperTotal: 2,
  aiDraftReviewTotal: 3,
};

function createSessionService(
  adminRoles: AdminRole[],
): Pick<SessionService, "getCurrentSession"> {
  const payload: ApiResponse<AuthContextDto> = createSuccessResponse({
    user: {
      publicId: "overview_user_redacted",
      phone: "redacted",
      name: "Overview Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "overview_admin_redacted",
      adminRoles,
    },
    session: {
      expiresAt: "2026-07-12T00:00:00.000Z",
    },
  });

  return {
    async getCurrentSession() {
      return payload;
    },
  };
}

function createRepository(): AdminRoleOverviewRepository & {
  readOperationsSummary: ReturnType<typeof vi.fn>;
  readContentSummary: ReturnType<typeof vi.fn>;
} {
  return {
    readOperationsSummary: vi.fn(async () => operationsSummary),
    readContentSummary: vi.fn(async () => contentSummary),
  };
}

function createRequest(scope: string): Request {
  return new Request(
    `http://localhost/api/v1/admin-overviews?scope=${encodeURIComponent(scope)}`,
  );
}

describe("admin role overview route", () => {
  it("returns a redacted cross-workspace platform summary only for super admins", async () => {
    const repository = createRepository();
    const { overview } = createAdminRoleOverviewRuntimeRouteHandlers({
      now: () => new Date("2026-07-11T08:00:00.000Z"),
      repository,
      sessionService: createSessionService(["super_admin"]),
    });

    const response = await overview.GET(createRequest("platform"));
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        scope: "platform",
        roleLabel: "超级管理员",
        operations: operationsSummary,
        content: contentSummary,
        boundary: {
          dataMode: "aggregate_only",
          highRiskMutationAllowed: false,
          sensitiveDetailIncluded: false,
        },
        updatedAt: "2026-07-11T08:00:00.000Z",
      },
    });
    expect(repository.readOperationsSummary).toHaveBeenCalledTimes(1);
    expect(repository.readContentSummary).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(payload.data)).not.toMatch(
      /publicId|token|prompt|payload|plainText|questionContent/iu,
    );
  });

  it("isolates operations and content repository reads by authorized scope", async () => {
    const operationsRepository = createRepository();
    const operationsHandlers = createAdminRoleOverviewRuntimeRouteHandlers({
      repository: operationsRepository,
      sessionService: createSessionService(["ops_admin"]),
    });
    const operationsPayload = await (
      await operationsHandlers.overview.GET(createRequest("operations"))
    ).json();

    expect(operationsPayload.data).toMatchObject({
      scope: "operations",
      roleLabel: "运营管理员",
      summary: operationsSummary,
    });
    expect(operationsRepository.readOperationsSummary).toHaveBeenCalledTimes(1);
    expect(operationsRepository.readContentSummary).not.toHaveBeenCalled();

    const contentRepository = createRepository();
    const contentHandlers = createAdminRoleOverviewRuntimeRouteHandlers({
      repository: contentRepository,
      sessionService: createSessionService(["content_admin"]),
    });
    const contentPayload = await (
      await contentHandlers.overview.GET(createRequest("content"))
    ).json();

    expect(contentPayload.data).toMatchObject({
      scope: "content",
      roleLabel: "内容管理员",
      summary: contentSummary,
    });
    expect(contentRepository.readContentSummary).toHaveBeenCalledTimes(1);
    expect(contentRepository.readOperationsSummary).not.toHaveBeenCalled();
  });

  it("denies invalid and cross-role scopes before aggregate repositories run", async () => {
    const repository = createRepository();
    const { overview } = createAdminRoleOverviewRuntimeRouteHandlers({
      repository,
      sessionService: createSessionService(["ops_admin"]),
    });

    const platformPayload = await (
      await overview.GET(createRequest("platform"))
    ).json();
    const contentPayload = await (
      await overview.GET(createRequest("content"))
    ).json();
    const invalidPayload = await (
      await overview.GET(createRequest("everything"))
    ).json();

    expect(platformPayload).toMatchObject({ code: 403190, data: null });
    expect(contentPayload).toMatchObject({ code: 403190, data: null });
    expect(invalidPayload).toMatchObject({ code: 400190, data: null });
    expect(repository.readOperationsSummary).not.toHaveBeenCalled();
    expect(repository.readContentSummary).not.toHaveBeenCalled();
  });

  it("denies requests without an active admin session before aggregate repositories run", async () => {
    const repository = createRepository();
    const { overview } = createAdminRoleOverviewRuntimeRouteHandlers({
      repository,
      sessionService: {
        async getCurrentSession() {
          return {
            code: 401001,
            message: "Unauthorized.",
            data: null,
          };
        },
      },
    });

    const payload = await (
      await overview.GET(createRequest("operations"))
    ).json();

    expect(payload).toMatchObject({ code: 401190, data: null });
    expect(repository.readOperationsSummary).not.toHaveBeenCalled();
    expect(repository.readContentSummary).not.toHaveBeenCalled();
  });

  it.each(["org_standard_admin", "org_advanced_admin"] as const)(
    "keeps %s outside every cross-workspace overview scope",
    async (adminRole) => {
      const repository = createRepository();
      const { overview } = createAdminRoleOverviewRuntimeRouteHandlers({
        repository,
        sessionService: createSessionService([adminRole]),
      });

      for (const scope of ["platform", "operations", "content"] as const) {
        const payload = await (await overview.GET(createRequest(scope))).json();
        expect(payload).toMatchObject({ code: 403190, data: null });
      }

      expect(repository.readOperationsSummary).not.toHaveBeenCalled();
      expect(repository.readContentSummary).not.toHaveBeenCalled();
    },
  );

  it("maps aggregate database rows without exposing source records", async () => {
    const rows = [
      {
        user_total: 17,
        disabled_user_total: 2,
      },
      { organization_total: 8 },
      { authorization_attention_total: 3 },
      { unused_redeem_code_total: 5 },
      { failed_ai_call_total: 1 },
      {
        available_question_total: 120,
        disabled_question_total: 4,
      },
      {
        draft_paper_total: 6,
        published_paper_total: 10,
        archived_paper_total: 2,
      },
      { ai_draft_review_total: 3 },
    ];
    const fakeDatabase = {
      select: vi.fn(() => {
        const row = rows.shift() ?? {};
        const query = {
          from: vi.fn(() => query),
          where: vi.fn(() => query),
          then<TResult1 = unknown[], TResult2 = never>(
            onfulfilled?:
              | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
              | null,
            onrejected?:
              | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
              | null,
          ) {
            return Promise.resolve([row]).then(onfulfilled, onrejected);
          },
        };

        return query;
      }),
    };
    const repository = createPostgresAdminRoleOverviewRepository({
      createDatabase: () => fakeDatabase as never,
    });

    await expect(
      repository.readOperationsSummary(new Date("2026-07-11T08:00:00.000Z")),
    ).resolves.toEqual(operationsSummary);
    await expect(repository.readContentSummary()).resolves.toEqual(
      contentSummary,
    );
    expect(rows).toHaveLength(0);
  });
});
