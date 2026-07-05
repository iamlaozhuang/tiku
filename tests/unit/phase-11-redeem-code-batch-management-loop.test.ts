import { describe, expect, it } from "vitest";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "@/server/repositories/effective-authorization-repository";
import type {
  PersonalAuthAccessRow,
  RedeemCodeAuthorizationRow,
} from "@/server/repositories/redeem-code-authorization-repository";
import {
  createAdminRedeemCodeRuntimeRouteHandlers,
  type AdminRedeemCodeRuntimeRepositories,
} from "@/server/services/admin-redeem-code-runtime";
import { createStudentAuthorizationRedeemRuntimeRouteHandlers } from "@/server/services/student-authorization-redeem-runtime";

const now = new Date("2026-05-24T07:00:00.000Z");
const generatedCodePlaceholder = "ABCDEFG2";

function createAdminSession(): ApiResponse<AuthContextDto> {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "admin-user-public-001",
        phone: "13900000001",
        name: "System Ops",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: "admin-public-001",
        adminRoles: ["ops_admin"],
      },
      session: {
        expiresAt: "2026-05-25T07:00:00.000Z",
      },
    },
  };
}

function createStudentSession(): ApiResponse<AuthContextDto> {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "student-user-public-001",
        phone: "13800000001",
        name: "Student User",
        userType: "personal",
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: null,
        adminRoles: [],
      },
      session: {
        expiresAt: "2026-05-25T07:00:00.000Z",
      },
    },
  };
}

function createAdminRepositories(auditInputs: unknown[] = []) {
  const createInputs: unknown[] = [];
  const listQueries: unknown[] = [];

  const repositories: AdminRedeemCodeRuntimeRepositories = {
    async createRedeemCodeBatch(input) {
      createInputs.push(input);

      return {
        generation: {
          generationGroupId: "redeem-code-batch-public-001",
          count: input.count,
          redeemCodeType: input.redeemCodeType,
          profession: input.profession,
          level: input.level,
          durationDay: input.durationDay,
          redeemDeadlineAt: input.redeemDeadlineAt.toISOString(),
        },
        redeemCodes: Array.from({ length: input.count }, (_, index) => ({
          publicId: `redeem-code-public-${index + 1}`,
          codePlainText: generatedCodePlaceholder,
          codeDisplay: generatedCodePlaceholder,
          redeemCodeType: input.redeemCodeType,
          profession: input.profession,
          level: input.level,
          status: "unused" as const,
          redeemDeadlineAt: input.redeemDeadlineAt.toISOString(),
          createdAt: now.toISOString(),
        })),
      };
    },
    async listRedeemCodes(query) {
      listQueries.push(query);

      return {
        redeemCodes: [
          {
            publicId: "redeem-code-public-expired",
            codeDisplay: "ABCD****",
            codePlainText: null,
            redeemCodeType: "personal_standard_activation",
            canViewPlainText: false,
            profession: "monopoly",
            level: 3,
            status: "expired",
            redeemedUserPublicId: null,
            redeemDeadlineAt: "2026-05-23T15:59:59.999Z",
            createdAt: "2026-05-22T07:00:00.000Z",
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
    auditLogRepository: {
      async appendAuditLog(input) {
        auditInputs.push(input);
      },
    },
  };

  return { createInputs, listQueries, repositories };
}

function createAdminHandlers(repositories: AdminRedeemCodeRuntimeRepositories) {
  return createAdminRedeemCodeRuntimeRouteHandlers({
    repositories,
    now: () => now,
    sessionService: {
      async getCurrentSession(input) {
        return input.authorization === "Bearer admin-session-token"
          ? createAdminSession()
          : {
              code: 401001,
              message: "Admin session is required.",
              data: null,
            };
      },
    },
  });
}

function createRedeemCodeRow(
  overrides: Partial<RedeemCodeAuthorizationRow> = {},
): RedeemCodeAuthorizationRow {
  return {
    id: 301,
    public_id: "redeem-code-public-1",
    code_display: generatedCodePlaceholder,
    profession: "monopoly",
    level: 3,
    redeem_code_type: "personal_standard_activation",
    duration_day: 365,
    redeem_deadline_at: new Date("2026-06-24T15:59:59.999Z"),
    status: "unused",
    used_by_user_id: null,
    used_at: null,
    ...overrides,
  };
}

function createPersonalAuthRow(): EffectivePersonalAuthRow &
  PersonalAuthAccessRow {
  return {
    id: 401,
    public_id: "personal-auth-public-001",
    redeem_code_public_id: "redeem-code-public-1",
    profession: "monopoly",
    level: 3,
    starts_at: now,
    expires_at: new Date("2027-05-24T07:00:00.000Z"),
    status: "active",
  };
}

function createStudentHandlers() {
  return createStudentAuthorizationRedeemRuntimeRouteHandlers({
    now: () => now,
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
    effectiveAuthorizationRepository: {
      async listPersonalAuthsByUserPublicId(): Promise<
        EffectivePersonalAuthRow[]
      > {
        return [createPersonalAuthRow()];
      },
      async listOrgAuthsByUserPublicId(): Promise<EffectiveOrgAuthRow[]> {
        return [];
      },
    },
    redeemCodeAuthorizationRepository: {
      async findRedeemCodeByCode(code) {
        expect(code).toBe(generatedCodePlaceholder);

        return createRedeemCodeRow();
      },
      async redeemCodeForUser(input) {
        expect(input).toMatchObject({
          code: generatedCodePlaceholder,
          redeemCodeId: 301,
          userPublicId: "student-user-public-001",
          redeemedAt: now,
          durationDay: 365,
        });

        return createPersonalAuthRow();
      },
      async listPersonalAuthsByUserPublicId(): Promise<
        PersonalAuthAccessRow[]
      > {
        return [createPersonalAuthRow()];
      },
    },
  });
}

async function readJson(response: Response): Promise<unknown> {
  return response.json();
}

describe("phase 11 redeem_code batch management loop", () => {
  it("creates a bounded batch, normalizes UTC+8 deadline, and writes redacted audit metadata", async () => {
    const auditInputs: unknown[] = [];
    const { createInputs, repositories } = createAdminRepositories(auditInputs);
    const handlers = createAdminHandlers(repositories);

    const response = await handlers.redeemCodes.POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
        },
        body: JSON.stringify({
          count: 3,
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineDate: "2026-06-24",
        }),
      }),
    );
    const payload = await readJson(response);

    expect(createInputs).toEqual([
      {
        count: 3,
        redeemCodeType: "personal_standard_activation",
        profession: "monopoly",
        level: 3,
        durationDay: 365,
        redeemDeadlineAt: new Date("2026-06-24T15:59:59.999Z"),
        actorPublicId: "admin-public-001",
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        generation: {
          generationGroupId: "redeem-code-batch-public-001",
          count: 3,
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineAt: "2026-06-24T15:59:59.999Z",
        },
      },
    });
    expect(
      (payload as { data: { redeemCodes: unknown[] } }).data.redeemCodes,
    ).toHaveLength(3);
    expect(
      (payload as { data: { redeemCodes: unknown[] } }).data.redeemCodes[0],
    ).toMatchObject({
      publicId: "redeem-code-public-1",
      codeDisplay: generatedCodePlaceholder,
      codePlainText: generatedCodePlaceholder,
      redeemCodeType: "personal_standard_activation",
      status: "unused",
    });
    expect(auditInputs).toEqual([
      {
        actorPublicId: "admin-public-001",
        actorRole: "ops_admin",
        actionType: "redeem_code.batch_create",
        targetResourceType: "redeem_code",
        targetPublicId: "redeem-code-batch-public-001",
        resultStatus: "success",
        metadataSummary:
          "redacted redeem_code batch metadata; count=3 type=personal_standard_activation profession=monopoly level=3 deadline=2026-06-24T15:59:59.999Z",
        requestIp: null,
      },
    ]);
    expect(JSON.stringify(auditInputs)).not.toContain(generatedCodePlaceholder);
  });

  it("rejects batch sizes above 100 before repository mutation", async () => {
    const { createInputs, repositories } = createAdminRepositories();
    const handlers = createAdminHandlers(repositories);

    const response = await handlers.redeemCodes.POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
        },
        body: JSON.stringify({
          count: 101,
          redeemDeadlineDate: "2026-06-24",
        }),
      }),
    );

    await expect(readJson(response)).resolves.toEqual({
      code: 422601,
      message: "Redeem code batch count must be between 1 and 100.",
      data: null,
    });
    expect(createInputs).toEqual([]);
  });

  it("rejects redeem_code generation without explicit type, profession and level before repository mutation", async () => {
    const auditInputs: unknown[] = [];
    const { createInputs, repositories } = createAdminRepositories(auditInputs);
    const handlers = createAdminHandlers(repositories);

    const response = await handlers.redeemCodes.POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
        },
        body: JSON.stringify({
          count: 1,
          durationDay: 365,
          redeemDeadlineDate: "2026-06-24",
        }),
      }),
    );

    await expect(readJson(response)).resolves.toEqual({
      code: 422601,
      message:
        "Redeem code generation requires explicit type, profession and level.",
      data: null,
    });
    expect(createInputs).toEqual([]);
    expect(auditInputs).toEqual([]);
  });

  it("passes search, status, pagination, and expiry sorting filters into the list runtime", async () => {
    const { listQueries, repositories } = createAdminRepositories();
    const handlers = createAdminHandlers(repositories);

    const response = await handlers.redeemCodes.GET(
      new Request(
        "http://localhost/api/v1/redeem-codes?page=2&pageSize=50&keyword=batch-001&status=expired&sortBy=expiresAt&sortOrder=asc",
        {
          headers: {
            authorization: "Bearer admin-session-token",
          },
        },
      ),
    );
    const payload = await readJson(response);

    expect(listQueries).toEqual([
      {
        page: 2,
        pageSize: 50,
        keyword: "batch-001",
        status: "expired",
        sortBy: "expiresAt",
        sortOrder: "asc",
        userType: "all",
        userCategory: "all",
        authFilter: "all",
      },
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        redeemCodes: [
          {
            publicId: "redeem-code-public-expired",
            status: "expired",
            redeemDeadlineAt: "2026-05-23T15:59:59.999Z",
          },
        ],
      },
      pagination: {
        page: 2,
        pageSize: 50,
        sortBy: "expiresAt",
        sortOrder: "asc",
      },
    });
  });

  it("redeems a generated uppercase code into personal_auth for the student runtime", async () => {
    const handlers = createStudentHandlers();

    const response = await handlers.redeemCodes.redeem.POST(
      new Request("http://localhost/api/v1/redeem-codes/redeem", {
        method: "POST",
        headers: {
          authorization: "Bearer student-session-token",
        },
        body: JSON.stringify({
          code: generatedCodePlaceholder.toLowerCase(),
        }),
      }),
    );

    await expect(readJson(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        redeemCode: {
          publicId: "redeem-code-public-1",
          codeDisplay: generatedCodePlaceholder,
          profession: "monopoly",
          level: 3,
          status: "used",
        },
        personalAuth: {
          publicId: "personal-auth-public-001",
          redeemCodePublicId: "redeem-code-public-1",
          profession: "monopoly",
          level: 3,
          startsAt: "2026-05-24T07:00:00.000Z",
          expiresAt: "2027-05-24T07:00:00.000Z",
          status: "active",
        },
      },
    });
  });
});
