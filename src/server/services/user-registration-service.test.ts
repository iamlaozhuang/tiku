import { describe, expect, it } from "vitest";

import { createUserRegistrationService } from "./user-registration-service";
import type { UserRegistrationRepository } from "../repositories/user-registration-repository";

const CREDENTIAL_FIELD_NAME = "password";
const SESSION_TOKEN_FIELD = "token";
const IDEMPOTENCY_KEY = "123e4567-e89b-42d3-a456-426614174000";

function createRepository(
  overrides: Partial<UserRegistrationRepository> = {},
): UserRegistrationRepository {
  return {
    async createPersonalRegistration(input) {
      return {
        status: "created",
        user: {
          id: 42,
          auth_user_id: "auth_user_123",
          public_id: "user_public_123",
          phone: input.phone,
          name: input.name,
          user_type: "personal",
          status: "active",
          locked_until_at: null,
          employee_public_id: null,
          organization_public_id: null,
        },
        session: {
          [SESSION_TOKEN_FIELD]: "opaque-registration-session-value",
          auth_user_id: "auth_user_123",
          expires_at: input.expiresAt,
        },
      };
    },
    ...overrides,
  };
}

describe("user registration service", () => {
  it("rejects invalid input or an invalid idempotency key before the unit of work", async () => {
    const unitOfWorkInputs: unknown[] = [];
    const userRegistrationService = createUserRegistrationService(
      createRepository({
        async createPersonalRegistration(input) {
          unitOfWorkInputs.push(input);
          throw new Error("invalid requests must not reach the unit of work");
        },
      }),
    );

    await expect(
      userRegistrationService.registerPersonalUser(
        {
          phone: "bad",
          [CREDENTIAL_FIELD_NAME]: "123",
          name: "",
        },
        IDEMPOTENCY_KEY,
      ),
    ).resolves.toEqual({
      code: 400002,
      message: "Invalid registration input.",
      data: null,
    });
    await expect(
      userRegistrationService.registerPersonalUser(
        {
          phone: "13800000000",
          [CREDENTIAL_FIELD_NAME]: "abc12345",
          name: "张三",
        },
        "short",
      ),
    ).resolves.toEqual({
      code: 400002,
      message: "Invalid registration input.",
      data: null,
    });
    expect(unitOfWorkInputs).toEqual([]);
  });

  it("maps a locked cross-domain conflict without a second side effect", async () => {
    const userRegistrationService = createUserRegistrationService(
      createRepository({
        async createPersonalRegistration() {
          return {
            status: "conflict",
            reason: "admin",
          };
        },
      }),
    );

    await expect(
      userRegistrationService.registerPersonalUser(
        {
          phone: "13800000000",
          [CREDENTIAL_FIELD_NAME]: "abc12345",
          name: "张三",
        },
        IDEMPOTENCY_KEY,
      ),
    ).resolves.toEqual({
      code: 409001,
      message: "Phone already registered.",
      data: null,
    });
  });

  it.each(["created", "recovered"] as const)(
    "maps a %s atomic registration result to the existing success contract",
    async (status) => {
      const unitOfWorkInputs: unknown[] = [];
      const userRegistrationService = createUserRegistrationService(
        createRepository({
          async createPersonalRegistration(input) {
            unitOfWorkInputs.push(input);

            return {
              status,
              user: {
                id: 42,
                auth_user_id: "auth_user_123",
                public_id: "user_public_123",
                phone: input.phone,
                name: input.name,
                user_type: "personal",
                status: "active",
                locked_until_at: null,
                employee_public_id: null,
                organization_public_id: null,
              },
              session: {
                [SESSION_TOKEN_FIELD]: "opaque-registration-session-value",
                auth_user_id: "auth_user_123",
                expires_at: input.expiresAt,
              },
            };
          },
        }),
        {
          now: () => new Date("2026-05-21T12:00:00.000Z"),
        },
      );

      await expect(
        userRegistrationService.registerPersonalUser(
          {
            phone: "13800000000",
            [CREDENTIAL_FIELD_NAME]: "abc12345",
            name: "张三",
          },
          IDEMPOTENCY_KEY,
        ),
      ).resolves.toEqual({
        code: 0,
        message: "ok",
        data: {
          user: {
            publicId: "user_public_123",
            phone: "138****0000",
            name: "张三",
            userType: "personal",
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: null,
            adminRoles: [],
          },
          nextAction: "redeem_code",
          session: {
            expiresAt: "2026-05-28T12:00:00.000Z",
          },
          [SESSION_TOKEN_FIELD]: "opaque-registration-session-value",
        },
      });
      expect(unitOfWorkInputs).toEqual([
        {
          expiresAt: new Date("2026-05-28T12:00:00.000Z"),
          idempotencyKey: IDEMPOTENCY_KEY,
          name: "张三",
          phone: "13800000000",
          [CREDENTIAL_FIELD_NAME]: "abc12345",
          registeredAt: new Date("2026-05-21T12:00:00.000Z"),
        },
      ]);
    },
  );
});
