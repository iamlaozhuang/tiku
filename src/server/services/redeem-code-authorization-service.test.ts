import { describe, expect, it } from "vitest";

import {
  createRedeemCodeAuthorizationService,
  type RedeemCodeAuthorizationClock,
} from "./redeem-code-authorization-service";
import type {
  PersonalAuthAccessRow,
  RedeemCodeAuthorizationRepository,
  RedeemCodeAuthorizationRow,
} from "../repositories/redeem-code-authorization-repository";

const now = new Date("2026-05-18T04:00:00.000Z");
const activeDeadline = new Date("2026-05-19T03:59:59.000Z");
const expiredDeadline = new Date("2026-05-17T03:59:59.000Z");

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
    code_display: "ABCD2345",
    profession: "monopoly",
    level: 3,
    duration_day: 365,
    redeem_deadline_at: activeDeadline,
    status: "unused",
    used_by_user_id: null,
    used_at: null,
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

function createRepository(
  overrides: Partial<RedeemCodeAuthorizationRepository> = {},
): RedeemCodeAuthorizationRepository {
  return {
    async findRedeemCodeByCode() {
      return createRedeemCode();
    },
    async redeemCodeForUser() {
      return createPersonalAuth();
    },
    async listPersonalAuthsByUserPublicId() {
      return [createPersonalAuth()];
    },
    ...overrides,
  };
}

describe("redeem code authorization service", () => {
  it("rejects invalid redeem code input", async () => {
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository(),
      clock,
    );

    await expect(
      authorizationService.redeemCode(
        {
          code: "",
        },
        {
          userPublicId: "user_public_123",
        },
      ),
    ).resolves.toEqual({
      code: 400003,
      message: "Invalid redeem code input.",
      data: null,
    });
  });

  it("distinguishes missing redeem code from used and expired cases", async () => {
    const missingService = createRedeemCodeAuthorizationService(
      createRepository({
        async findRedeemCodeByCode() {
          return null;
        },
      }),
      clock,
    );

    await expect(
      missingService.redeemCode(
        {
          code: "abcd2345",
        },
        {
          userPublicId: "user_public_123",
        },
      ),
    ).resolves.toEqual({
      code: 404001,
      message: "Redeem code does not exist.",
      data: null,
    });

    const usedService = createRedeemCodeAuthorizationService(
      createRepository({
        async findRedeemCodeByCode() {
          return createRedeemCode({
            status: "used",
            used_by_user_id: 42,
            used_at: now,
          });
        },
      }),
      clock,
    );

    await expect(
      usedService.redeemCode(
        {
          code: "abcd2345",
        },
        {
          userPublicId: "user_public_123",
        },
      ),
    ).resolves.toEqual({
      code: 409002,
      message: "Redeem code already used.",
      data: null,
    });

    const expiredService = createRedeemCodeAuthorizationService(
      createRepository({
        async findRedeemCodeByCode() {
          return createRedeemCode({
            redeem_deadline_at: expiredDeadline,
          });
        },
      }),
      clock,
    );

    await expect(
      expiredService.redeemCode(
        {
          code: "abcd2345",
        },
        {
          userPublicId: "user_public_123",
        },
      ),
    ).resolves.toEqual({
      code: 410001,
      message: "Redeem code redeem deadline has passed.",
      data: null,
    });
  });

  it("rejects inconsistent redeem code rows that already have usage markers", async () => {
    let redeemAttemptCount = 0;
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async findRedeemCodeByCode() {
          return createRedeemCode({
            status: "unused",
            used_by_user_id: 42,
            used_at: now,
          });
        },
        async redeemCodeForUser() {
          redeemAttemptCount += 1;

          return createPersonalAuth();
        },
      }),
      clock,
    );

    await expect(
      authorizationService.redeemCode(
        {
          code: "abcd2345",
        },
        {
          userPublicId: "user_public_123",
        },
      ),
    ).resolves.toEqual({
      code: 409002,
      message: "Redeem code already used.",
      data: null,
    });
    expect(redeemAttemptCount).toBe(0);
  });

  it("redeems an unused code with normalized input and returns personal authorization", async () => {
    let redeemedInputs: unknown[] = [];
    const authorizationService = createRedeemCodeAuthorizationService(
      createRepository({
        async redeemCodeForUser(input) {
          redeemedInputs = [...redeemedInputs, input];

          return createPersonalAuth();
        },
      }),
      clock,
    );

    await expect(
      authorizationService.redeemCode(
        {
          code: " abcd2345 ",
        },
        {
          userPublicId: "user_public_123",
        },
      ),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        redeemCode: {
          publicId: "redeem_code_public_123",
          codeDisplay: "ABCD2345",
          profession: "monopoly",
          level: 3,
          status: "used",
        },
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
    expect(redeemedInputs).toEqual([
      {
        code: "ABCD2345",
        redeemCodeId: 7,
        userPublicId: "user_public_123",
        redeemedAt: now,
        durationDay: 365,
      },
    ]);
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
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        personalAuths: [
          {
            publicId: "personal_auth_public_123",
            redeemCodePublicId: "redeem_code_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-05-18T04:00:00.000Z",
            expiresAt: "2027-05-18T04:00:00.000Z",
            status: "active",
          },
        ],
      },
    });
  });
});
