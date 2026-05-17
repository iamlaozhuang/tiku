import { describe, expect, it } from "vitest";

import { createUserRegistrationService } from "./user-registration-service";
import type { UserRegistrationCredentialAdapter } from "../auth/user-registration-boundary";
import type { UserRegistrationRepository } from "../repositories/user-registration-repository";

function createRepository(
  overrides: Partial<UserRegistrationRepository> = {},
): UserRegistrationRepository {
  return {
    async findRegisteredUserByPhone() {
      return null;
    },
    async createPersonalUser(input) {
      return {
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
      };
    },
    ...overrides,
  };
}

function createCredentialAdapter(
  overrides: Partial<UserRegistrationCredentialAdapter> = {},
): UserRegistrationCredentialAdapter {
  return {
    async createPasswordCredential() {
      return {
        authUserId: "auth_user_123",
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
        password: "123",
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
        async findRegisteredUserByPhone() {
          return {
            id: 42,
            auth_user_id: "auth_user_123",
            public_id: "user_public_123",
            phone: "13800000000",
            name: "张三",
            user_type: "personal",
            status: "active",
            locked_until_at: null,
            employee_public_id: null,
            organization_public_id: null,
          };
        },
      }),
    );

    await expect(
      userRegistrationService.registerPersonalUser({
        phone: "13800000000",
        password: "abc12345",
        name: "张三",
      }),
    ).resolves.toEqual({
      code: 409001,
      message: "Phone already registered.",
      data: null,
    });
    expect(credentialInputs).toEqual([]);
  });

  it("creates a personal user and returns redeem code next action metadata", async () => {
    let credentialInputs: unknown[] = [];
    let createdUsers: unknown[] = [];
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
        async createPersonalUser(input) {
          createdUsers = [...createdUsers, input];

          return {
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
          };
        },
      }),
    );

    await expect(
      userRegistrationService.registerPersonalUser({
        phone: "13800000000",
        password: "abc12345",
        name: "张三",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        user: {
          publicId: "user_public_123",
          phone: "13800000000",
          name: "张三",
          userType: "personal",
          status: "active",
          lockedUntilAt: null,
          employeePublicId: null,
          organizationPublicId: null,
        },
        nextAction: "redeem_code",
      },
    });
    expect(credentialInputs).toEqual([
      {
        phone: "13800000000",
        password: "abc12345",
      },
    ]);
    expect(createdUsers).toEqual([
      {
        authUserId: "auth_user_123",
        phone: "13800000000",
        name: "张三",
      },
    ]);
  });
});
