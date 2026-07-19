import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createAdminRedeemCodeRuntimeRouteHandlers,
  type AdminRedeemCodeRuntimeRepositories,
} from "@/server/services/admin-redeem-code-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = new Date("2026-05-22T10:00:00.000Z");
const testAdminSessionCredential = "admin-session-token";
const expectedAdminAuthorization = `Bearer ${testAdminSessionCredential}`;

type RedeemCodeDetailRouteHandlers = {
  GET(
    request: Request,
    context: { params: Promise<{ publicId: string }> },
  ): Promise<Response>;
};

function createSessionService(role: "super_admin" | "content_admin") {
  return {
    async login() {
      throw new Error(
        "login should not be called by admin redeem code runtime",
      );
    },
    async getCurrentSession(input) {
      if (input.authorization !== expectedAdminAuthorization) {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: {
            expiresAt: "2027-05-22T10:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Admin User",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: [role],
          },
        },
      };
    },
  } satisfies SessionService;
}

function createRepositories(): AdminRedeemCodeRuntimeRepositories {
  return {
    async createRedeemCodeBatch(input) {
      const redeemDeadlineAt = input.redeemDeadlineAt?.toISOString() ?? null;

      return {
        generation: {
          generationGroupId: "redeem-code-batch-public-001",
          count: 1,
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineAt,
        },
        redeemCodes: [
          {
            publicId: "redeem-code-public-generated",
            codePlainText: "ABCDEFG2",
            codeDisplay: "ABCDEFG2",
            redeemCodeType: "personal_standard_activation",
            profession: "monopoly",
            level: 3,
            status: "unused",
            redeemDeadlineAt,
            createdAt: now.toISOString(),
          },
        ],
      };
    },
    async listRedeemCodes(query) {
      return {
        redeemCodes: [
          {
            publicId: "redeem-code-public-001",
            codeDisplay: "RC-2026-****",
            codePlainText: "RC-2026-LIST-PLAIN",
            redeemCodeType: "personal_standard_activation",
            canViewPlainText: true,
            profession: "monopoly",
            level: 3,
            status: "unused",
            redeemedUserPublicId: null,
            redeemDeadlineAt: "2027-05-22T10:00:00.000Z",
            createdAt: now.toISOString(),
          },
        ],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 1,
        },
      };
    },
    async findRedeemCodeDetailByPublicId(publicId) {
      if (publicId !== "redeem-code-public-001") {
        return null;
      }

      return {
        publicId: "redeem-code-public-001",
        codeDisplay: "RC-2026-****",
        codePlainText: "RC-2026-DETAIL-PLAIN",
        redeemCodeType: "personal_standard_activation",
        canViewPlainText: true,
        profession: "monopoly",
        level: 3,
        status: "used",
        redeemedUserPublicId: "student-public-001",
        redeemedAt: "2026-05-23T09:00:00.000Z",
        durationDay: 365,
        redeemDeadlineAt: "2027-05-22T10:00:00.000Z",
        generationGroupId: "redeem-code-batch-public-001",
        createdAt: now.toISOString(),
        updatedAt: "2026-05-23T09:00:00.000Z",
        redactionStatus: "redacted",
        redactionReason: "code_hash_hidden_plaintext_role_allowed",
      };
    },
  };
}

function createCookieBackedAdminRequest(url: string) {
  return new Request(url, {
    headers: {
      authorization: "Bearer __cookie_backed_session__",
      cookie: `tiku_session=${encodeURIComponent(testAdminSessionCredential)}`,
    },
  });
}

function getRedeemCodeDetailRouteHandlers(
  handlers: ReturnType<typeof createAdminRedeemCodeRuntimeRouteHandlers>,
): RedeemCodeDetailRouteHandlers {
  return (
    handlers.redeemCodes as unknown as {
      detail: RedeemCodeDetailRouteHandlers;
    }
  ).detail;
}

describe("phase 8 admin redeem code runtime", () => {
  it("exposes the Next 16 asynchronous detail route context contract", () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    type DetailRouteContext = Parameters<
      typeof handlers.redeemCodes.detail.GET
    >[1];

    expect(handlers.redeemCodes.detail.GET).toBeTypeOf("function");
    expectTypeOf<DetailRouteContext>().toEqualTypeOf<{
      params: Promise<{ publicId: string }>;
    }>();
  });

  it("requires an authenticated admin session before returning redeem_code data", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const response = await handlers.redeemCodes.GET(
      new Request("http://localhost/api/v1/redeem-codes"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
  });

  it("rejects admin roles that cannot read redeem_code operations", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("content_admin"),
    });

    const response = await handlers.redeemCodes.GET(
      new Request("http://localhost/api/v1/redeem-codes", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("returns paginated redeem_code summaries with protected plaintext and public identifiers", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const response = await handlers.redeemCodes.GET(
      new Request(
        "http://localhost/api/v1/redeem-codes?page=2&pageSize=50&status=unused",
        {
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
    );

    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        redeemCodes: [
          {
            publicId: "redeem-code-public-001",
            codeDisplay: "RC-2026-****",
            codePlainText: "RC-2026-LIST-PLAIN",
            redeemCodeType: "personal_standard_activation",
            canViewPlainText: true,
            profession: "monopoly",
            level: 3,
            status: "unused",
            redeemedUserPublicId: null,
            redeemDeadlineAt: "2027-05-22T10:00:00.000Z",
            createdAt: now.toISOString(),
          },
        ],
      },
      pagination: {
        page: 2,
        pageSize: 50,
        sortBy: "updatedAt",
        sortOrder: "desc",
        total: 1,
      },
    });

    const serializedPayload = JSON.stringify(payload);

    expect(serializedPayload).not.toContain('"id"');
    expect(serializedPayload).not.toContain("codeHash");
    expect(serializedPayload).not.toContain("authUserId");
    expect(serializedPayload).not.toContain("password");
    expect(serializedPayload).not.toContain("admin-session-token");
  });

  it("resolves redeem_code summaries from cookie-backed admin sessions", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const response = await handlers.redeemCodes.GET(
      createCookieBackedAdminRequest(
        "http://localhost/api/v1/redeem-codes?page=1&pageSize=20",
      ),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        redeemCodes: [
          expect.objectContaining({
            publicId: "redeem-code-public-001",
          }),
        ],
      },
      message: "ok",
    });
  });

  it("returns a protected redeem_code detail by publicId without hashes or internal ids", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const response = await getRedeemCodeDetailRouteHandlers(handlers).GET(
      new Request(
        "http://localhost/api/v1/redeem-codes/redeem-code-public-001",
        {
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      {
        params: Promise.resolve({ publicId: "redeem-code-public-001" }),
      },
    );

    const payload = await response.json();

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        redeemCode: {
          publicId: "redeem-code-public-001",
          codeDisplay: "RC-2026-****",
          codePlainText: "RC-2026-DETAIL-PLAIN",
          redeemCodeType: "personal_standard_activation",
          canViewPlainText: true,
          profession: "monopoly",
          level: 3,
          status: "used",
          redeemedUserPublicId: "student-public-001",
          redeemedAt: "2026-05-23T09:00:00.000Z",
          durationDay: 365,
          redeemDeadlineAt: "2027-05-22T10:00:00.000Z",
          generationGroupId: "redeem-code-batch-public-001",
          createdAt: now.toISOString(),
          updatedAt: "2026-05-23T09:00:00.000Z",
          redactionStatus: "redacted",
          redactionReason: "code_hash_hidden_plaintext_role_allowed",
        },
      },
    });

    const serializedPayload = JSON.stringify(payload);

    expect(serializedPayload).not.toContain('"id"');
    expect(serializedPayload).not.toContain("codeHash");
    expect(serializedPayload).not.toContain("authUserId");
    expect(serializedPayload).not.toContain("password");
    expect(serializedPayload).not.toContain("admin-session-token");
  });

  it("rejects detail access for admin roles that cannot read redeem_code operations", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("content_admin"),
    });

    const response = await getRedeemCodeDetailRouteHandlers(handlers).GET(
      new Request(
        "http://localhost/api/v1/redeem-codes/redeem-code-public-001",
        {
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      {
        params: Promise.resolve({ publicId: "redeem-code-public-001" }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
  });

  it("returns not found for missing redeem_code detail publicId", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const response = await getRedeemCodeDetailRouteHandlers(handlers).GET(
      new Request(
        "http://localhost/api/v1/redeem-codes/redeem-code-public-missing",
        {
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      {
        params: Promise.resolve({ publicId: "redeem-code-public-missing" }),
      },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      code: 404601,
      message: "Admin resource not found.",
      data: null,
    });
  });

  it.each([
    ["omitted", {}],
    ["explicit null", { redeemDeadlineDate: null }],
  ])(
    "generates a long-term redeem_code when the deadline is %s",
    async (_label, deadlineInput) => {
      const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
        repositories: createRepositories(),
        sessionService: createSessionService("super_admin"),
        now: () => now,
      });

      const response = await handlers.redeemCodes.POST(
        new Request("http://localhost/api/v1/redeem-codes", {
          body: JSON.stringify({
            redeemCodeType: "personal_standard_activation",
            profession: "monopoly",
            level: 3,
            durationDay: 365,
            ...deadlineInput,
          }),
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        }),
      );

      await expect(response.json()).resolves.toMatchObject({
        code: 0,
        data: {
          generation: { redeemDeadlineAt: null },
          redeemCodes: [{ redeemDeadlineAt: null }],
        },
      });
    },
  );

  it.each([
    ["empty", ""],
    ["invalid", "2026-02-30"],
    ["non-future", "2026-05-21"],
  ])("rejects a %s finite deadline", async (_label, redeemDeadlineDate) => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
      now: () => now,
    });

    const response = await handlers.redeemCodes.POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        body: JSON.stringify({
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineDate,
        }),
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 422601,
      data: null,
    });
  });

  it("keeps a future finite deadline at the UTC+8 end of day", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
      now: () => now,
    });

    const response = await (
      handlers.redeemCodes as unknown as {
        POST: (request: Request) => Promise<Response>;
      }
    ).POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        body: JSON.stringify({
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineDate: "2026-05-23",
        }),
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );

    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        generation: {
          generationGroupId: "redeem-code-batch-public-001",
          count: 1,
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineAt: "2026-05-23T15:59:59.999Z",
        },
        redeemCodes: [
          {
            publicId: "redeem-code-public-generated",
            codePlainText: "ABCDEFG2",
            codeDisplay: "ABCDEFG2",
            redeemCodeType: "personal_standard_activation",
            profession: "monopoly",
            level: 3,
            status: "unused",
            redeemDeadlineAt: "2026-05-23T15:59:59.999Z",
            createdAt: now.toISOString(),
          },
        ],
      },
    });
  });
});
