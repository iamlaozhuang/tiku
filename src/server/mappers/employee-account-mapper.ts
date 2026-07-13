import type { EmployeeAccountResultDto } from "../contracts/employee-account-contract";
import type { EmployeeAccountResult } from "../repositories/employee-account-repository";
import { maskPhoneForDisplay } from "./phone-display-mapper";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapEmployeeAccountToApi(
  employeeAccount: EmployeeAccountResult,
): EmployeeAccountResultDto {
  return {
    employeeAccount: {
      employee: {
        publicId: employeeAccount.employee.public_id,
        userPublicId: employeeAccount.employee.user_public_id,
        organizationPublicId: employeeAccount.employee.organization_public_id,
        createdAt: employeeAccount.employee.created_at.toISOString(),
        updatedAt: employeeAccount.employee.updated_at.toISOString(),
      },
      user: {
        publicId: employeeAccount.user.public_id,
        phone: maskPhoneForDisplay(employeeAccount.user.phone),
        name: employeeAccount.user.name,
        userType: employeeAccount.user.user_type,
        status: employeeAccount.user.status,
        lockedUntilAt: formatNullableTimestamp(
          employeeAccount.user.locked_until_at,
        ),
        employeePublicId: employeeAccount.user.employee_public_id,
        organizationPublicId: employeeAccount.user.organization_public_id,
      },
      organization: {
        publicId: employeeAccount.organization.public_id,
        name: employeeAccount.organization.name,
      },
    },
  };
}
