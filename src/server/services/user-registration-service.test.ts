import { describe, expect, it } from "vitest";

import { createUserRegistrationService } from "./user-registration-service";
import type { UserRegistrationSessionCredentialAdapter } from "../auth/user-registration-boundary";
import type { UserRegistrationRepository } from "../repositories/user-registration-repository";

const CREDENTIAL_FIELD_NAME = "password";
const SESSION_TOKEN_FIELD = "token";

function createRepository(
  overrides: Partial<UserRegistrationRepository> = {},
): UserRegistrationRepository {
  return {
    async findAccountPhoneConflict() {
      return null;
    },
    async createPersonalUser(input) {
      return {
        status: "created",
        user: {
          id: 42,
          auth_user_id: input.authUserId,
          public_id: "user_public_123",
          phone: input.phone,
          name: input.name,
          user_type: "personal",
          status: "active",
          locked_until_at: null,
          employee_public_id: null,
          organization_public_id: null,
        },
      };
    },
    ...overrides,
  };
}

function createCredentialAdapter(
  overrides: Partial<UserRegistrationSessionCredentialAdapter> = {},
): UserRegistrationSessionCredentialAdapter {
  return {
    async createPasswordCredential() {
      return {
        authUserId: "auth_user_123",
      };
    },
    async createSingleActiveSession(input) {
      return {
        [SESSION_TOKEN_FIELD]: "opaque-registration-session-value",
        auth_user_id: input.authUserId,
        expires_at: input.expiresAt,
      };
    },
    ...overrides,
  };
}

describe("user registration service", () => {
  it("rejects invalid registration input with the standard response envelope", async () => {
    const userRegistrationService = createUserRegistrationService(
      createCredentialAdapter(),
      createRepository(),
    );

    await expect(
      userRegistrationService.registerPersonalUser({
        phone: "bad",
        [CREDENTIAL_FIELD_NAME]: "123",
        name: "",
      }),
    ).resolves.toEqual({
      code: 400002,
      message: "Invalid registration input.",
      data: null,
    });
  });

  it("rejects duplicate phone registration before creating credentials", async () => {
    let credentialInputs: unknown[] = [];
    const userRegistrationService = createUserRegistrationService(
      createCredentialAdapter({
        async createPasswordCredential(input) {
          credentialInputs = [...credentialInputs, input];

          return {
            authUserId: "auth_user_123",
          };
        },
      }),
      createRepository({
        async findAccountPhoneConflict() {
          return "user";
        },
      }),
    );

    await expect(
      userRegistrationService.registerPersonalUser({
        phone: "13800000000",
        [CREDENTIAL_FIELD_NAME]: "abc12345",
        name: "张三",
      }),
    ).resolves.toEqual({
      code: 409001,
      message: "Phone already registered.",
      data: null,
    });
    expect(credentialInputs).toEqual([]);
  });

  it("rejects an administrator-domain phone before creating credentials", async () => {
    const credentialInputs: unknown[] = [];
    const userRegistrationService = createUserRegistrationService(
      createCredentialAdapter({
        async createPasswordCredential(input) {
          credentialInputs.push(input);
          return { authUserId: "auth_user_123" };
        },
      }),
      createRepository({
        async findAccountPhoneConflict() {
          return "admin";
        },
      }),
    );

    await expect(
      userRegistrationService.registerPersonalUser({
        phone: "13800000000",
        [CREDENTIAL_FIELD_NAME]: "abc12345",
        name: "张三",
      }),
    ).resolves.toEqual({
      code: 409001,
      message: "Phone already registered.",
      data: null,
    });
    expect(credentialInputs).toEqual([]);
  });

  it("maps a locked write conflict without creating a session", async () => {
    const sessionInputs: unknown[] = [];
    const userRegistrationService = createUserRegistrationService(
      createCredentialAdapter({
        async createSingleActiveSession(input) {
          sessionInputs.push(input);
          return {
            [SESSION_TOKEN_FIELD]: "unexpected-session",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      }),
      createRepository({
        async createPersonalUser() {
          return {
            status: "conflict",
            reason: "admin",
          };
        },
      }),
    );

    await expect(
      userRegistrationService.registerPersonalUser({
        phone: "13800000000",
        [CREDENTIAL_FIELD_NAME]: "abc12345",
        name: "张三",
      }),
    ).resolves.toEqual({
      code: 409001,
      message: "Phone already registered.",
      data: null,
    });
    expect(sessionInputs).toEqual([]);
  });

  it("creates a personal user and returns redeem code next action metadata", async () => {
    let credentialInputs: unknown[] = [];
    let sessionInputs: unknown[] = [];
    let createdUsers: unknown[] = [];
    const userRegistrationService = createUserRegistrationService(
      createCredentialAdapter({
        async createPasswordCredential(input) {
          credentialInputs = [...credentialInputs, input];

          return {
            authUserId: "auth_user_123",
          };
        },
        async createSingleActiveSession(input) {
          sessionInputs = [...sessionInputs, input];

          return {
            [SESSION_TOKEN_FIELD]: "opaque-registration-session-value",
            auth_user_id: input.authUserId,
            expires_at: input.expiresAt,
          };
        },
      }),
      createRepository({
        async createPersonalUser(input) {
          createdUsers = [...createdUsers, input];

          return {
            status: "created",
            user: {
              id: 42,
              auth_user_id: input.authUserId,
              public_id: "user_public_123",
              phone: input.phone,
              name: input.name,
              user_type: "personal",
              status: "active",
              locked_until_at: null,
              employee_public_id: null,
              organization_public_id: null,
            },
          };
        },
      }),
      {
        now: () => new Date("2026-05-21T12:00:00.000Z"),
      },
    );

    await expect(
      userRegistrationService.registerPersonalUser({
        phone: "13800000000",
        [CREDENTIAL_FIELD_NAME]: "abc12345",
        name: "张三",
      }),
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
    expect(credentialInputs).toEqual([
      {
        phone: "13800000000",
        [CREDENTIAL_FIELD_NAME]: "abc12345",
      },
    ]);
    expect(createdUsers).toEqual([
      {
        authUserId: "auth_user_123",
        phone: "13800000000",
        name: "张三",
      },
    ]);
    expect(sessionInputs).toEqual([
      {
        authUserId: "auth_user_123",
        expiresAt: new Date("2026-05-28T12:00:00.000Z"),
      },
    ]);
  });
});
