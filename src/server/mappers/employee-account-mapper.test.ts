import { describe, expect, it } from "vitest";

import { mapEmployeeAccountToApi } from "./employee-account-mapper";

describe("mapEmployeeAccountToApi", () => {
  it("maps employee account rows to camelCase DTOs without internal ids", () => {
    const mappedEmployeeAccount = mapEmployeeAccountToApi({
      employee: {
        id: 501,
        public_id: "employee_public_123",
        user_public_id: "user_public_123",
        organization_public_id: "org_public_123",
        created_at: new Date("2026-05-18T12:00:00.000Z"),
        updated_at: new Date("2026-05-18T12:00:00.000Z"),
      },
      user: {
        id: 42,
        auth_user_id: "auth_user_123",
        public_id: "user_public_123",
        phone: "13800000000",
        name: "李四",
        user_type: "employee",
        status: "active",
        locked_until_at: null,
        employee_public_id: "employee_public_123",
        organization_public_id: "org_public_123",
      },
      organization: {
        public_id: "org_public_123",
        name: "杭州烟草",
      },
    });

    expect(mappedEmployeeAccount).toEqual({
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
    });
    expect(mappedEmployeeAccount.employeeAccount.employee).not.toHaveProperty(
      "id",
    );
    expect(mappedEmployeeAccount.employeeAccount.user).not.toHaveProperty("id");
    expect(mappedEmployeeAccount.employeeAccount.user).not.toHaveProperty(
      "authUserId",
    );
  });
});
