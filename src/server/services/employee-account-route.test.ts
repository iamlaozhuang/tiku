import { describe, expect, it } from "vitest";

import { createEmployeeAccountRouteHandlers } from "./employee-account-route";
import type { EmployeeAccountService } from "./employee-account-service";

function createService(): EmployeeAccountService {
  return {
    async createEmployeeAccount() {
      return {
        code: 0,
        message: "ok",
        data: {
          employeeAccount: {
            employee: {
              publicId: "employee_public_123",
              userPublicId: "user_public_123",
              organizationPublicId: "org_public_123",
              createdAt: "2026-05-18T12:00:00.000Z",
              updatedAt: "2026-05-18T12:00:00.000Z",
            },
            user: {
              publicId: "user_public_123",
              phone: "13800000000",
              name: "李四",
              userType: "employee",
              status: "active",
              lockedUntilAt: null,
              employeePublicId: "employee_public_123",
              organizationPublicId: "org_public_123",
            },
            organization: {
              publicId: "org_public_123",
              name: "杭州烟草",
            },
          },
        },
      };
    },
  };
}

describe("employee account route handlers", () => {
  it("returns standard employee account creation responses", async () => {
    const handlers = createEmployeeAccountRouteHandlers(createService());

    await expect(
      handlers
        .POST(
          new Request("http://localhost/api/v1/employees", {
            method: "POST",
            body: JSON.stringify({
              phone: "13800000000",
              name: "李四",
              initialPassword: "abc12345",
              organizationPublicId: "org_public_123",
            }),
          }),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        employeeAccount: {
          employee: {
            publicId: "employee_public_123",
          },
          user: {
            publicId: "user_public_123",
          },
          organization: {
            publicId: "org_public_123",
          },
        },
      },
    });
  });
});
