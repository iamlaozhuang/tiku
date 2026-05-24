import { describe, expect, it } from "vitest";

import {
  createAdminRedeemCodeRuntimeRouteHandlers,
  type AdminRedeemCodeRuntimeRepositories,
} from "@/server/services/admin-redeem-code-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = new Date("2026-05-22T10:00:00.000Z");

function createSessionService(role: "super_admin" | "content_admin") {
  return {
    async login() {
      throw new Error(
        "login should not be called by admin redeem code runtime",
      );
    },
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
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
    async createRedeemCode() {
      return {
        publicId: "redeem-code-public-generated",
        codePlainText: "ABCDEFG2",
        codeDisplay: "ABCDEFG2",
        profession: "monopoly",
        level: 3,
        status: "unused",
        redeemDeadlineAt: "2027-05-22T10:00:00.000Z",
        createdAt: now.toISOString(),
      };
    },
    async listRedeemCodes(query) {
      return {
        redeemCodes: [
          {
            publicId: "redeem-code-public-001",
            codeDisplay: "RC-2026-****",
            canViewPlainText: false,
            profession: "monopoly",
            level: 3,
            status: "unused",
            redeemedUserPublicId: null,
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
  };
}

describe("phase 8 admin redeem code runtime", () => {
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

  it("returns paginated redeem_code summaries with public identifiers and masked code display", async () => {
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
            canViewPlainText: false,
            profession: "monopoly",
            level: 3,
            status: "unused",
            redeemedUserPublicId: null,
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

  it("generates one local redeem_code with plaintext only in the creation response", async () => {
    const handlers = createAdminRedeemCodeRuntimeRouteHandlers({
      repositories: createRepositories(),
      sessionService: createSessionService("super_admin"),
    });

    const response = await (
      handlers.redeemCodes as unknown as {
        POST: (request: Request) => Promise<Response>;
      }
    ).POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );

    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        redeemCode: {
          publicId: "redeem-code-public-generated",
          codePlainText: "ABCDEFG2",
          codeDisplay: "ABCDEFG2",
          profession: "monopoly",
          level: 3,
          status: "unused",
          redeemDeadlineAt: "2027-05-22T10:00:00.000Z",
          createdAt: now.toISOString(),
        },
      },
    });
  });
});
