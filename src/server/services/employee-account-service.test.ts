import { describe, expect, it } from "vitest";

import { createEmployeeAccountService } from "./employee-account-service";
import type { UserRegistrationCredentialAdapter } from "../auth/user-registration-boundary";
import type {
  EmployeeAccountAccessRow,
  EmployeeAccountRepository,
  EmployeeAccountUserAccessRow,
  EmployeeOrganizationAccessRow,
} from "../repositories/employee-account-repository";

const createdAt = new Date("2026-05-18T12:00:00.000Z");

function createUser(
  overrides: Partial<EmployeeAccountUserAccessRow> = {},
): EmployeeAccountUserAccessRow {
  return {
    id: 42,
    auth_user_id: "auth_user_123",
    public_id: "user_public_123",
    phone: "13800000000",
    name: "李四",
    user_type: "personal",
    status: "active",
    locked_until_at: null,
    employee_public_id: null,
    organization_public_id: null,
    ...overrides,
  };
}

function createEmployee(
  overrides: Partial<EmployeeAccountAccessRow> = {},
): EmployeeAccountAccessRow {
  return {
    id: 501,
    public_id: "employee_public_123",
    user_public_id: "user_public_123",
    organization_public_id: "org_public_123",
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createOrganization(
  overrides: Partial<EmployeeOrganizationAccessRow> = {},
): EmployeeOrganizationAccessRow {
  return {
    public_id: "org_public_123",
    name: "杭州烟草",
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<EmployeeAccountRepository> = {},
): EmployeeAccountRepository {
  return {
    async findUserByPhone() {
      return null;
    },
    async findOrganizationByPublicId(publicId) {
      return createOrganization({
        public_id: publicId,
      });
    },
    async createEmployeeAccount(input) {
      const user = createUser({
        auth_user_id: input.authUserId,
        phone: input.phone,
        name: input.name,
        user_type: "employee",
        employee_public_id: "employee_public_123",
        organization_public_id: input.organizationPublicId,
      });

      return {
        employee: createEmployee({
          user_public_id: user.public_id,
          organization_public_id: input.organizationPublicId,
        }),
        user,
        organization: createOrganization({
          public_id: input.organizationPublicId,
        }),
      };
    },
    async bindExistingUserToOrganization(input) {
      const user = createUser({
        public_id: input.userPublicId,
        user_type: "employee",
        employee_public_id: "employee_public_123",
        organization_public_id: input.organizationPublicId,
      });

      return {
        employee: createEmployee({
          user_public_id: input.userPublicId,
          organization_public_id: input.organizationPublicId,
        }),
        user,
        organization: createOrganization({
          public_id: input.organizationPublicId,
        }),
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

describe("employee account service", () => {
  it("creates a new employee account when the phone does not exist", async () => {
    let credentialInputs: unknown[] = [];
    let createInputs: unknown[] = [];
    const service = createEmployeeAccountService(
      createCredentialAdapter({
        async createPasswordCredential(input) {
          credentialInputs = [...credentialInputs, input];

          return {
            authUserId: "auth_user_123",
          };
        },
      }),
      createRepository({
        async createEmployeeAccount(input) {
          createInputs = [...createInputs, input];

          return createRepository().createEmployeeAccount(input);
        },
      }),
    );

    await expect(
      service.createEmployeeAccount({
        phone: "13800000000",
        name: "李四",
        initialPassword: "abc12345",
        organizationPublicId: "org_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        generatedInitialPassword: null,
        employeeAccount: {
          employee: {
            publicId: "employee_public_123",
            organizationPublicId: "org_public_123",
          },
          user: {
            publicId: "user_public_123",
            userType: "employee",
          },
        },
      },
    });
    expect(credentialInputs).toEqual([
      {
        phone: "13800000000",
        ["password"]: "abc12345",
      },
    ]);
    expect(createInputs).toEqual([
      {
        authUserId: "auth_user_123",
        phone: "13800000000",
        name: "李四",
        organizationPublicId: "org_public_123",
      },
    ]);
  });

  it("generates a one-time initial password when a new employee input omits it", async () => {
    let credentialInputs: { password: string; phone: string }[] = [];
    const service = createEmployeeAccountService(
      createCredentialAdapter({
        async createPasswordCredential(input) {
          credentialInputs = [...credentialInputs, input];

          return {
            authUserId: "auth_user_123",
          };
        },
      }),
      createRepository(),
    );

    const response = await service.createEmployeeAccount({
      phone: "13800000000",
      name: "李四",
      initialPassword: "",
      organizationPublicId: "org_public_123",
    });

    expect(response.code).toBe(0);
    expect(response.data?.generatedInitialPassword).toMatch(
      /^(?=.*[A-Za-z])(?=.*\d).{8,}$/u,
    );
    expect(credentialInputs).toHaveLength(1);
    expect(credentialInputs[0]?.password).toBe(
      response.data?.generatedInitialPassword,
    );
  });

  it("binds an existing unbound user without creating new credentials", async () => {
    let credentialInputs: unknown[] = [];
    let bindInputs: unknown[] = [];
    const service = createEmployeeAccountService(
      createCredentialAdapter({
        async createPasswordCredential(input) {
          credentialInputs = [...credentialInputs, input];

          return {
            authUserId: "auth_user_should_not_be_used",
          };
        },
      }),
      createRepository({
        async findUserByPhone() {
          return createUser({
            user_type: "personal",
            employee_public_id: null,
            organization_public_id: null,
          });
        },
        async bindExistingUserToOrganization(input) {
          bindInputs = [...bindInputs, input];

          return createRepository().bindExistingUserToOrganization(input);
        },
      }),
    );

    await expect(
      service.createEmployeeAccount({
        phone: "13800000000",
        name: "李四",
        initialPassword: "abc12345",
        organizationPublicId: "org_public_123",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        generatedInitialPassword: null,
        employeeAccount: {
          user: {
            publicId: "user_public_123",
            userType: "employee",
          },
        },
      },
    });
    expect(credentialInputs).toEqual([]);
    expect(bindInputs).toEqual([
      {
        userPublicId: "user_public_123",
        organizationPublicId: "org_public_123",
      },
    ]);
  });

  it("rejects invalid input, missing organization, and users bound to another organization", async () => {
    const service = createEmployeeAccountService(
      createCredentialAdapter(),
      createRepository(),
    );

    await expect(
      service.createEmployeeAccount({
        phone: "bad",
        name: "",
        initialPassword: "123",
        organizationPublicId: "",
      }),
    ).resolves.toEqual({
      code: 400006,
      message: "Invalid employee account input.",
      data: null,
    });

    const missingOrganizationService = createEmployeeAccountService(
      createCredentialAdapter(),
      createRepository({
        async findOrganizationByPublicId() {
          return null;
        },
      }),
    );

    await expect(
      missingOrganizationService.createEmployeeAccount({
        phone: "13800000000",
        name: "李四",
        initialPassword: "abc12345",
        organizationPublicId: "org_missing_123",
      }),
    ).resolves.toEqual({
      code: 404004,
      message: "Organization does not exist.",
      data: null,
    });

    const conflictService = createEmployeeAccountService(
      createCredentialAdapter(),
      createRepository({
        async findUserByPhone() {
          return createUser({
            user_type: "employee",
            employee_public_id: "employee_public_999",
            organization_public_id: "org_other_999",
          });
        },
      }),
    );

    await expect(
      conflictService.createEmployeeAccount({
        phone: "13800000000",
        name: "李四",
        initialPassword: "abc12345",
        organizationPublicId: "org_public_123",
      }),
    ).resolves.toEqual({
      code: 409006,
      message: "Phone already bound to another organization.",
      data: null,
    });
  });
});
