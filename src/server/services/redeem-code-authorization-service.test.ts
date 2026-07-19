import { describe, expect, it } from "vitest";

import type {
  PersonalAuthAccessRow,
  PersonalAuthPreviewRow,
  RedeemCodeAuthorizationRepository,
  RedeemCodeAuthorizationRow,
  RedeemCodePreviewFacts,
} from "../repositories/redeem-code-authorization-repository";
import {
  createRedeemCodeAuthorizationService,
  type RedeemCodeAuthorizationClock,
} from "./redeem-code-authorization-service";

const now = new Date("2026-05-18T04:00:00.000Z");
const activeDeadline = new Date("2026-05-19T03:59:59.000Z");
const previewVersion = `sha256:${"1".repeat(64)}`;

const clock: RedeemCodeAuthorizationClock = {
  now() {
    return now;
  },
};

function createRedeemCode(
  overrides: Partial<RedeemCodeAuthorizationRow> = {},
): RedeemCodeAuthorizationRow {
  return {
    id: 7,
    public_id: "redeem_code_public_123",
    profession: "monopoly",
    level: 3,
    redeem_code_type: "personal_standard_activation",
    duration_day: 365,
    redeem_deadline_at: activeDeadline,
    status: "unused",
    used_by_user_id: null,
    used_at: null,
    updated_at: new Date("2026-05-18T03:00:00.000Z"),
    ...overrides,
  };
}

function createPersonalAuth(
  overrides: Partial<PersonalAuthAccessRow> = {},
): PersonalAuthAccessRow {
  return {
    id: 11,
    public_id: "personal_auth_public_123",
    redeem_code_public_id: "redeem_code_public_123",
    profession: "monopoly",
    level: 3,
    starts_at: now,
    expires_at: new Date("2027-05-18T04:00:00.000Z"),
    status: "active",
    ...overrides,
  };
}

function createPreviewPersonalAuth(
  overrides: Partial<PersonalAuthPreviewRow> = {},
): PersonalAuthPreviewRow {
  return {
    ...createPersonalAuth(),
    edition: "standard",
    updated_at: new Date("2026-05-18T03:30:00.000Z"),
    ...overrides,
  };
}

function createPreviewFacts(
  overrides: Partial<RedeemCodePreviewFacts> = {},
): RedeemCodePreviewFacts {
  return {
    redeemCode: createRedeemCode(),
    activePersonalAuths: [],
    activeUpgradedPersonalAuthPublicIds: [],
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<RedeemCodeAuthorizationRepository> = {},
): RedeemCodeAuthorizationRepository {
  return {
    async previewRedeemCodeForUser() {
      return createPreviewFacts();
    },
    async confirmRedeemCodeForUser() {
      return { status: "redeemed", personalAuth: createPersonalAuth() };
    },
    async listPersonalAuthsByUserPublicId() {
      return [createPersonalAuth()];
    },
    ...overrides,
  };
}

describe("redeem code authorization service", () => {
  it("returns a server-derived preview without plaintext code or internal ids", async () => {
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async previewRedeemCodeForUser() {
          return createPreviewFacts({
            redeemCode: createRedeemCode({
              redeem_code_type: "personal_advanced_activation",
            }),
          });
        },
      }),
      clock,
    );

    const response = await authorizationService.previewRedeemCode(
      { code: " abcd2345 " },
      { userPublicId: "user_public_123" },
    );

    expect(response).toMatchObject({
      code: 0,
      data: {
        redeemCodeType: "personal_advanced_activation",
        profession: "monopoly",
        level: 3,
        resultEdition: "advanced",
        durationDay: 365,
        redeemDeadlineAt: activeDeadline.toISOString(),
        previewVersion: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
        upgradeTargets: [],
      },
    });
    expect(JSON.stringify(response)).not.toContain("ABCD2345");
    expect(JSON.stringify(response)).not.toContain('"id"');
    expect(JSON.stringify(response)).not.toContain("code_hash");
  });

  it("previews a long-term redeem code with an explicit null deadline", async () => {
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async previewRedeemCodeForUser() {
          return createPreviewFacts({
            redeemCode: createRedeemCode({ redeem_deadline_at: null }),
          });
        },
      }),
      clock,
      { consume: () => ({ allowed: true }) },
    );

    await expect(
      authorizationService.previewRedeemCode(
        { code: "ABCD2345" },
        { userPublicId: "user_public_123" },
      ),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        redeemDeadlineAt: null,
        previewVersion: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
      },
    });
  });

  it("binds preview version to null versus finite deadline", async () => {
    let redeemDeadlineAt: Date | null = null;
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async previewRedeemCodeForUser() {
          return createPreviewFacts({
            redeemCode: createRedeemCode({
              redeem_deadline_at: redeemDeadlineAt,
            }),
          });
        },
      }),
      clock,
      { consume: () => ({ allowed: true }) },
    );
    const readVersion = async () =>
      (
        await authorizationService.previewRedeemCode(
          { code: "ABCD2345" },
          { userPublicId: "user_public_123" },
        )
      ).data?.previewVersion;

    const longTermVersion = await readVersion();
    redeemDeadlineAt = activeDeadline;

    expect(await readVersion()).not.toBe(longTermVersion);
  });

  it("returns every eligible standard target in stable order", async () => {
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async previewRedeemCodeForUser() {
          return createPreviewFacts({
            redeemCode: createRedeemCode({
              redeem_code_type: "edition_upgrade",
            }),
            activePersonalAuths: [
              createPreviewPersonalAuth({
                id: 12,
                public_id: "personal_auth_public_456",
              }),
              createPreviewPersonalAuth({
                public_id: "personal_auth_public_123",
              }),
            ],
          });
        },
      }),
      clock,
    );

    await expect(
      authorizationService.previewRedeemCode(
        { code: "ABCD2345" },
        { userPublicId: "user_public_123" },
      ),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        redeemCodeType: "edition_upgrade",
        resultEdition: "advanced",
        upgradeTargets: [
          { personalAuthPublicId: "personal_auth_public_123" },
          { personalAuthPublicId: "personal_auth_public_456" },
        ],
      },
    });
  });

  it("binds preview versions to user and complete sorted candidate facts", async () => {
    const firstTarget = createPreviewPersonalAuth({
      public_id: "personal_auth_public_123",
    });
    const secondTarget = createPreviewPersonalAuth({
      id: 12,
      public_id: "personal_auth_public_456",
    });
    let activePersonalAuths = [firstTarget, secondTarget];
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async previewRedeemCodeForUser() {
          return createPreviewFacts({
            redeemCode: createRedeemCode({
              redeem_code_type: "edition_upgrade",
            }),
            activePersonalAuths,
          });
        },
      }),
      clock,
      { consume: () => ({ allowed: true }) },
    );
    const readVersion = async (userPublicId: string) => {
      const response = await authorizationService.previewRedeemCode(
        { code: "ABCD2345" },
        { userPublicId },
      );

      expect(response.code).toBe(0);
      return response.data?.previewVersion;
    };

    const firstVersion = await readVersion("user_public_123");
    activePersonalAuths = [secondTarget, firstTarget];
    expect(await readVersion("user_public_123")).toBe(firstVersion);
    expect(await readVersion("user_public_456")).not.toBe(firstVersion);

    activePersonalAuths = [
      firstTarget,
      {
        ...secondTarget,
        updated_at: new Date("2026-05-18T03:31:00.000Z"),
      },
    ];
    expect(await readVersion("user_public_123")).not.toBe(firstVersion);
  });

  it("returns one indistinguishable preview failure for missing and ineligible codes", async () => {
    const previewResults: Array<RedeemCodePreviewFacts | null> = [
      null,
      createPreviewFacts({
        redeemCode: createRedeemCode({
          status: "used",
          used_by_user_id: 9,
          used_at: now,
        }),
      }),
      createPreviewFacts({
        redeemCode: createRedeemCode({
          redeem_deadline_at: new Date("2026-05-18T03:59:59.000Z"),
        }),
      }),
      createPreviewFacts({
        redeemCode: createRedeemCode({ redeem_code_type: "edition_upgrade" }),
      }),
      createPreviewFacts({
        redeemCode: createRedeemCode({ redeem_code_type: "edition_upgrade" }),
        activePersonalAuths: [
          createPreviewPersonalAuth({ edition: "advanced" }),
        ],
      }),
      createPreviewFacts({
        redeemCode: createRedeemCode({ redeem_code_type: "edition_upgrade" }),
        activePersonalAuths: [createPreviewPersonalAuth()],
        activeUpgradedPersonalAuthPublicIds: ["personal_auth_public_123"],
      }),
    ];

    for (const previewResult of previewResults) {
      const authorizationService = createRedeemCodeAuthorizationService(
        createRepository({
          async previewRedeemCodeForUser() {
            return previewResult;
          },
        }),
        clock,
      );

      await expect(
        authorizationService.previewRedeemCode(
          { code: "ABCD2345" },
          { userPublicId: "user_public_123" },
        ),
      ).resolves.toEqual({
        code: 409007,
        message: "Redeem code preview is unavailable.",
        data: null,
      });
    }
  });

  it("rate limits preview by user before querying code facts", async () => {
    let queryCount = 0;
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async previewRedeemCodeForUser() {
          queryCount += 1;
          return createPreviewFacts();
        },
      }),
      clock,
      {
        consume() {
          return { allowed: false, retryAfterSecond: 30 };
        },
      },
    );

    await expect(
      authorizationService.previewRedeemCode(
        { code: "ABCD2345" },
        { userPublicId: "user_public_123" },
      ),
    ).resolves.toEqual({
      code: 429001,
      message: "Redeem code preview rate limit exceeded.",
      data: null,
    });
    expect(queryCount).toBe(0);
  });

  it("confirms only with a normalized preview-bound input and returns no code display", async () => {
    const confirmedInputs: unknown[] = [];
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async confirmRedeemCodeForUser(input) {
          confirmedInputs.push(input);
          return { status: "redeemed", personalAuth: createPersonalAuth() };
        },
      }),
      clock,
    );

    const response = await authorizationService.redeemCode(
      {
        code: " abcd2345 ",
        previewVersion,
        targetPersonalAuthPublicId: null,
      },
      { userPublicId: "user_public_123" },
    );

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        personalAuth: {
          publicId: "personal_auth_public_123",
          redeemCodePublicId: "redeem_code_public_123",
          profession: "monopoly",
          level: 3,
          startsAt: "2026-05-18T04:00:00.000Z",
          expiresAt: "2027-05-18T04:00:00.000Z",
          status: "active",
        },
      },
    });
    expect(JSON.stringify(response)).not.toContain("codeDisplay");
    expect(confirmedInputs).toEqual([
      {
        code: "ABCD2345",
        userPublicId: "user_public_123",
        confirmedAt: now,
        previewVersion,
        targetPersonalAuthPublicId: null,
      },
    ]);
  });

  it("rejects confirmation without a valid preview binding", async () => {
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository(),
      clock,
    );

    await expect(
      authorizationService.redeemCode(
        { code: "ABCD2345" },
        { userPublicId: "user_public_123" },
      ),
    ).resolves.toEqual({
      code: 400003,
      message: "Invalid redeem code input.",
      data: null,
    });
  });

  it("maps transaction-authoritative stale, target, expired, and used results", async () => {
    const cases = [
      ["stale", 409005],
      ["invalid_target", 409006],
      ["expired", 410001],
      ["used", 409002],
    ] as const;

    for (const [status, expectedCode] of cases) {
      const authorizationService = createRedeemCodeAuthorizationService(
        createRepository({
          async confirmRedeemCodeForUser() {
            return { status };
          },
        }),
        clock,
      );

      await expect(
        authorizationService.redeemCode(
          {
            code: "ABCD2345",
            previewVersion,
            targetPersonalAuthPublicId: null,
          },
          { userPublicId: "user_public_123" },
        ),
      ).resolves.toMatchObject({ code: expectedCode, data: null });
    }
  });

  it("lists personal authorizations for the current user", async () => {
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository(),
      clock,
    );

    await expect(
      authorizationService.listPersonalAuths({
        userPublicId: "user_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        personalAuths: [{ publicId: "personal_auth_public_123" }],
      },
    });
  });
});
