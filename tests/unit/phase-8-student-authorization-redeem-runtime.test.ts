import { describe, expect, it } from "vitest";

import { createStudentAuthorizationRedeemRuntimeRouteHandlers } from "@/server/services/student-authorization-redeem-runtime";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "@/server/repositories/effective-authorization-repository";
import type {
  ConfirmRedeemCodeForUserInput,
  PersonalAuthAccessRow,
  RedeemCodeAuthorizationRow,
} from "@/server/repositories/redeem-code-authorization-repository";

const now = new Date("2026-05-22T04:00:00.000Z");
const startsAt = new Date("2026-05-01T04:00:00.000Z");
const expiresAt = new Date("2027-05-01T04:00:00.000Z");
const bearerScheme = "Bearer";
const sessionCredential = "student-session-token";

function createStudentSession(
  userPublicId = "user_public_student_123",
): ApiResponse<AuthContextDto> {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: userPublicId,
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
        expiresAt: "2026-05-23T04:00:00.000Z",
      },
    } satisfies AuthContextDto,
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
        expiresAt: "2026-05-23T04:00:00.000Z",
      },
    } satisfies AuthContextDto,
  };
}

function createPersonalAuth(
  overrides: Partial<EffectivePersonalAuthRow & PersonalAuthAccessRow> = {},
) {
  return {
    id: 101,
    public_id: "personal_auth_public_123",
    redeem_code_public_id: "redeem_code_public_123",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: expiresAt,
    status: "active",
    ...overrides,
  } satisfies EffectivePersonalAuthRow & PersonalAuthAccessRow;
}

function createOrgAuth(
  overrides: Partial<EffectiveOrgAuthRow> = {},
): EffectiveOrgAuthRow {
  return {
    id: 201,
    public_id: "org_auth_public_123",
    organization_public_id: "org_public_123",
    organization_name: "本地企业",
    organization_status: "active",
    profession: "monopoly",
    level: 3,
    starts_at: startsAt,
    expires_at: new Date("2027-06-01T04:00:00.000Z"),
    status: "active",
    ...overrides,
  };
}

function createRedeemCode(
  overrides: Partial<RedeemCodeAuthorizationRow> = {},
): RedeemCodeAuthorizationRow {
  return {
    id: 301,
    public_id: "redeem_code_public_123",
    profession: "monopoly",
    level: 3,
    redeem_code_type: "personal_standard_activation",
    duration_day: 365,
    redeem_deadline_at: new Date("2026-06-01T04:00:00.000Z"),
    status: "unused",
    used_by_user_id: null,
    used_at: null,
    updated_at: new Date("2026-05-22T03:00:00.000Z"),
    ...overrides,
  };
}

function createHandlers(
  sessionResponse = createStudentSession(),
  options: {
    redeemCode?: RedeemCodeAuthorizationRow;
    personalAuth?: PersonalAuthAccessRow;
    onConfirmRedeemCode?: (input: ConfirmRedeemCodeForUserInput) => void;
  } = {},
) {
  return createStudentAuthorizationRedeemRuntimeRouteHandlers({
    now: () => now,
    sessionService: {
      async getCurrentSession(input) {
        return input.authorization === `${bearerScheme} ${sessionCredential}`
          ? sessionResponse
          : {
              code: 401001,
              message: "User session is required.",
              data: null,
            };
      },
    },
    effectiveAuthorizationRepository: {
      async listPersonalAuthsByUserPublicId(userPublicId) {
        expect(userPublicId).toBe("user_public_student_123");

        return [createPersonalAuth()];
      },
      async listOrgAuthsByUserPublicId(userPublicId) {
        expect(userPublicId).toBe("user_public_student_123");

        return [createOrgAuth()];
      },
    },
    redeemCodeAuthorizationRepository: {
      async previewRedeemCodeForUser(input) {
        expect(input).toMatchObject({
          code: "ABCDEFG2",
          userPublicId: "user_public_student_123",
          previewedAt: now,
        });

        return {
          redeemCode: options.redeemCode ?? createRedeemCode(),
          activePersonalAuths: [],
          activeUpgradedPersonalAuthPublicIds: [],
        };
      },
      async confirmRedeemCodeForUser(input) {
        expect(input).toMatchObject({
          code: "ABCDEFG2",
          userPublicId: "user_public_student_123",
          confirmedAt: now,
        });
        options.onConfirmRedeemCode?.(input);

        return {
          status: "redeemed" as const,
          personalAuth: options.personalAuth ?? createPersonalAuth(),
        };
      },
      async listPersonalAuthsByUserPublicId(userPublicId) {
        expect(userPublicId).toBe("user_public_student_123");

        return [createPersonalAuth()];
      },
    },
  });
}

function createRequestAuthHeaders() {
  return {
    authorization: `${bearerScheme} ${sessionCredential}`,
  };
}

function createSessionCookieHeaders() {
  return {
    cookie: `theme=light; tiku_session=${encodeURIComponent(
      sessionCredential,
    )}`,
  };
}

async function readJson(response: Response) {
  return response.json() as Promise<unknown>;
}

describe("phase 8 student authorization redeem runtime", () => {
  it("lists effective authorizations for the authenticated student without numeric ids", async () => {
    const handlers = createHandlers();
    const response = await handlers.authorizations.GET(
      new Request("http://localhost/api/v1/authorizations", {
        headers: createRequestAuthHeaders(),
      }),
    );

    const responsePayload = await readJson(response);

    expect(responsePayload).toEqual({
      code: 0,
      message: "ok",
      data: {
        authorizations: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-01T04:00:00.000Z",
            expiresAt: "2027-05-01T04:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            organizationName: null,
          },
          {
            publicId: "org_auth_public_123",
            authorizationType: "org_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-01T04:00:00.000Z",
            expiresAt: "2027-06-01T04:00:00.000Z",
            status: "active",
            organizationPublicId: "org_public_123",
            organizationName: "本地企业",
          },
        ],
        effectiveAuthorizations: [
          {
            profession: "monopoly",
            level: 3,
            authorizationTypes: ["personal_auth", "org_auth"],
            expiresAt: "2027-06-01T04:00:00.000Z",
            status: "active",
          },
        ],
        authorizationContexts: [
          {
            authorizationPublicId: "personal_auth_public_123",
            authorizationSource: "personal_auth",
            blockedReason: null,
            capabilities: {
              canAnswerOrganizationTraining: false,
              canCreateOrganizationTraining: false,
              canGenerateAiPaper: false,
              canGenerateAiQuestion: false,
              canManageAuthorizationQuota: false,
              canViewOrganizationTrainingSummary: false,
            },
            contextDisplayStatus: "display_only",
            displayStatus: "active",
            edition: "standard",
            effectiveEdition: "standard",
            expiresAt: "2027-05-01T04:00:00.000Z",
            level: 3,
            organizationPublicId: null,
            ownerPublicId: "user_public_student_123",
            ownerType: "personal",
            profession: "monopoly",
            quotaOwnerPublicId: "user_public_student_123",
            quotaOwnerType: "personal",
            upgradeStatus: "none",
          },
          {
            authorizationPublicId: "org_auth_public_123",
            authorizationSource: "org_auth",
            blockedReason: null,
            capabilities: {
              canAnswerOrganizationTraining: false,
              canCreateOrganizationTraining: false,
              canGenerateAiPaper: false,
              canGenerateAiQuestion: false,
              canManageAuthorizationQuota: false,
              canViewOrganizationTrainingSummary: false,
            },
            contextDisplayStatus: "display_only",
            displayStatus: "active",
            edition: "standard",
            effectiveEdition: "standard",
            expiresAt: "2027-06-01T04:00:00.000Z",
            level: 3,
            organizationPublicId: "org_public_123",
            ownerPublicId: "org_public_123",
            ownerType: "organization",
            profession: "monopoly",
            quotaOwnerPublicId: "org_public_123",
            quotaOwnerType: "organization",
            upgradeStatus: "none",
          },
        ],
      },
    });
    expect(JSON.stringify(responsePayload)).not.toContain('"id":');
  });

  it("derives advanced effective edition from active authorization upgrades", async () => {
    const upgradedEffectiveAuthorizationRepository = {
      async listPersonalAuthsByUserPublicId(userPublicId: string) {
        expect(userPublicId).toBe("user_public_student_123");

        return [createPersonalAuth()];
      },
      async listOrgAuthsByUserPublicId(userPublicId: string) {
        expect(userPublicId).toBe("user_public_student_123");

        return [];
      },
      async listAuthUpgradesByAuthorizationPublicIds(publicIds: string[]) {
        expect(publicIds).toEqual(["personal_auth_public_123"]);

        return [
          {
            personal_auth_public_id: "personal_auth_public_123",
            org_auth_public_id: null,
            target_edition: "advanced" as const,
            starts_at: startsAt,
            expires_at: expiresAt,
            revoked_at: null,
            status: "active" as const,
          },
        ];
      },
    };
    const handlers = createStudentAuthorizationRedeemRuntimeRouteHandlers({
      now: () => now,
      sessionService: {
        async getCurrentSession(input) {
          return input.authorization === `${bearerScheme} ${sessionCredential}`
            ? createStudentSession()
            : {
                code: 401001,
                message: "User session is required.",
                data: null,
              };
        },
      },
      effectiveAuthorizationRepository:
        upgradedEffectiveAuthorizationRepository,
      redeemCodeAuthorizationRepository: {
        async previewRedeemCodeForUser() {
          throw new Error("redeem should not be called by authorization list");
        },
        async confirmRedeemCodeForUser() {
          throw new Error("redeem should not be called by authorization list");
        },
        async listPersonalAuthsByUserPublicId() {
          throw new Error("personal auth list should not be called here");
        },
      },
    });

    const response = await handlers.authorizations.GET(
      new Request("http://localhost/api/v1/authorizations", {
        headers: createRequestAuthHeaders(),
      }),
    );

    await expect(readJson(response)).resolves.toMatchObject({
      code: 0,
      data: {
        authorizationContexts: [
          {
            authorizationPublicId: "personal_auth_public_123",
            authorizationSource: "personal_auth",
            edition: "standard",
            effectiveEdition: "advanced",
            upgradeStatus: "active",
            blockedReason: "production_enablement_blocked",
          },
        ],
      },
    });
  });

  it("uses the session cookie for authorization routes without a request auth value", async () => {
    const handlers = createHandlers();
    const authorizationResponse = await handlers.authorizations.GET(
      new Request("http://localhost/api/v1/authorizations", {
        headers: createSessionCookieHeaders(),
      }),
    );
    const personalAuthResponse = await handlers.personalAuths.GET(
      new Request("http://localhost/api/v1/personal-auths", {
        headers: createSessionCookieHeaders(),
      }),
    );

    await expect(readJson(authorizationResponse)).resolves.toMatchObject({
      code: 0,
      data: {
        effectiveAuthorizations: [
          {
            profession: "monopoly",
            level: 3,
            authorizationTypes: ["personal_auth", "org_auth"],
          },
        ],
      },
    });
    await expect(readJson(personalAuthResponse)).resolves.toMatchObject({
      code: 0,
      data: {
        personalAuths: [
          {
            publicId: "personal_auth_public_123",
            status: "active",
          },
        ],
      },
    });
  });

  it("lists personal authorizations for the authenticated student", async () => {
    const handlers = createHandlers();
    const response = await handlers.personalAuths.GET(
      new Request("http://localhost/api/v1/personal-auths", {
        headers: createRequestAuthHeaders(),
      }),
    );

    await expect(readJson(response)).resolves.toMatchObject({
      code: 0,
      data: {
        personalAuths: [
          {
            publicId: "personal_auth_public_123",
            redeemCodePublicId: "redeem_code_public_123",
            profession: "monopoly",
            level: 3,
            status: "active",
          },
        ],
      },
    });
  });

  it("previews and confirms an unused code without returning its plaintext", async () => {
    const handlers = createHandlers();
    const previewResponse = await handlers.redeemCodes.preview.POST(
      new Request("http://localhost/api/v1/redeem-codes/preview", {
        method: "POST",
        headers: createRequestAuthHeaders(),
        body: JSON.stringify({ code: "abcdefg2" }),
      }),
    );
    const previewPayload = (await readJson(previewResponse)) as {
      data: { previewVersion: string };
    };

    expect(previewPayload).toMatchObject({
      code: 0,
      data: {
        redeemCodeType: "personal_standard_activation",
        profession: "monopoly",
        level: 3,
        resultEdition: "standard",
        durationDay: 365,
        upgradeTargets: [],
      },
    });

    const response = await handlers.redeemCodes.redeem.POST(
      new Request("http://localhost/api/v1/redeem-codes/redeem", {
        method: "POST",
        headers: createRequestAuthHeaders(),
        body: JSON.stringify({
          code: "abcdefg2",
          previewVersion: previewPayload.data.previewVersion,
          targetPersonalAuthPublicId: null,
        }),
      }),
    );

    await expect(readJson(response)).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        personalAuth: {
          publicId: "personal_auth_public_123",
          redeemCodePublicId: "redeem_code_public_123",
          profession: "monopoly",
          level: 3,
          startsAt: "2026-05-01T04:00:00.000Z",
          expiresAt: "2027-05-01T04:00:00.000Z",
          status: "active",
        },
      },
    });
    expect(JSON.stringify(previewPayload)).not.toContain("ABCDEFG2");
  });

  it("derives advanced activation facts on the server preview", async () => {
    const handlers = createHandlers(createStudentSession(), {
      redeemCode: createRedeemCode({
        redeem_code_type: "personal_advanced_activation",
      }),
    });

    const response = await handlers.redeemCodes.preview.POST(
      new Request("http://localhost/api/v1/redeem-codes/preview", {
        method: "POST",
        headers: createRequestAuthHeaders(),
        body: JSON.stringify({ code: "abcdefg2" }),
      }),
    );

    await expect(readJson(response)).resolves.toMatchObject({
      code: 0,
      data: {
        redeemCodeType: "personal_advanced_activation",
        resultEdition: "advanced",
        profession: "monopoly",
        level: 3,
      },
    });
  });

  it("passes only the preview binding and explicit personal target to confirmation", async () => {
    let observedInput: ConfirmRedeemCodeForUserInput | null = null;
    const previewVersion = `sha256:${"1".repeat(64)}`;
    const handlers = createHandlers(createStudentSession(), {
      personalAuth: createPersonalAuth({
        public_id: "personal_auth_public_existing",
        redeem_code_public_id: "redeem_code_public_standard",
      }),
      onConfirmRedeemCode(input) {
        observedInput = input;
      },
    });

    const response = await handlers.redeemCodes.redeem.POST(
      new Request("http://localhost/api/v1/redeem-codes/redeem", {
        method: "POST",
        headers: createRequestAuthHeaders(),
        body: JSON.stringify({
          code: "abcdefg2",
          previewVersion,
          targetPersonalAuthPublicId: "personal_auth_public_existing",
        }),
      }),
    );

    await expect(readJson(response)).resolves.toMatchObject({
      code: 0,
      data: {
        personalAuth: {
          publicId: "personal_auth_public_existing",
          redeemCodePublicId: "redeem_code_public_standard",
          profession: "monopoly",
          level: 3,
          status: "active",
        },
      },
    });
    expect(observedInput).toMatchObject({
      previewVersion,
      targetPersonalAuthPublicId: "personal_auth_public_existing",
    });
  });

  it("rejects missing student session and admin session", async () => {
    const handlers = createHandlers();
    const missingSessionResponse = await handlers.authorizations.GET(
      new Request("http://localhost/api/v1/authorizations"),
    );
    const adminHandlers = createHandlers(createAdminSession());
    const adminSessionResponse = await adminHandlers.authorizations.GET(
      new Request("http://localhost/api/v1/authorizations", {
        headers: createRequestAuthHeaders(),
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
});
