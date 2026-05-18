import type { UserRegistrationCredentialAdapter } from "../auth/user-registration-boundary";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { EmployeeAccountResultDto } from "../contracts/employee-account-contract";
import { mapEmployeeAccountToApi } from "../mappers/employee-account-mapper";
import type { EmployeeAccountRepository } from "../repositories/employee-account-repository";
import { normalizeCreateEmployeeAccountInput } from "../validators/employee-account";

export type EmployeeAccountService = {
  createEmployeeAccount(
    input: unknown,
  ): Promise<ApiResponse<EmployeeAccountResultDto | null>>;
};

const INVALID_EMPLOYEE_ACCOUNT_INPUT_CODE = 400006;
const ORGANIZATION_NOT_FOUND_CODE = 404004;
const EMPLOYEE_ORGANIZATION_CONFLICT_CODE = 409006;

export function createEmployeeAccountService(
  credentialAdapter: UserRegistrationCredentialAdapter,
  employeeAccountRepository: EmployeeAccountRepository,
): EmployeeAccountService {
  return {
    async createEmployeeAccount(input) {
      const employeeAccountInput = normalizeCreateEmployeeAccountInput(input);

      if (!employeeAccountInput.success) {
        return createErrorResponse(
          INVALID_EMPLOYEE_ACCOUNT_INPUT_CODE,
          employeeAccountInput.message,
        );
      }

      const organization =
        await employeeAccountRepository.findOrganizationByPublicId(
          employeeAccountInput.value.organizationPublicId,
        );

      if (organization === null) {
        return createErrorResponse(
          ORGANIZATION_NOT_FOUND_CODE,
          "Organization does not exist.",
        );
      }

      const existingUser = await employeeAccountRepository.findUserByPhone(
        employeeAccountInput.value.phone,
      );

      if (existingUser !== null) {
        if (existingUser.employee_public_id !== null) {
          return createErrorResponse(
            EMPLOYEE_ORGANIZATION_CONFLICT_CODE,
            "Phone already bound to another organization.",
          );
        }

        const employeeAccount =
          await employeeAccountRepository.bindExistingUserToOrganization({
            userPublicId: existingUser.public_id,
            organizationPublicId:
              employeeAccountInput.value.organizationPublicId,
          });

        return createSuccessResponse(mapEmployeeAccountToApi(employeeAccount));
      }

      const credential = await credentialAdapter.createPasswordCredential({
        phone: employeeAccountInput.value.phone,
        password: employeeAccountInput.value.initialPassword,
      });

      const employeeAccount =
        await employeeAccountRepository.createEmployeeAccount({
          authUserId: credential.authUserId,
          phone: employeeAccountInput.value.phone,
          name: employeeAccountInput.value.name,
          organizationPublicId: employeeAccountInput.value.organizationPublicId,
        });

      return createSuccessResponse(mapEmployeeAccountToApi(employeeAccount));
    },
  };
}

export function createUnavailableEmployeeAccountService(): EmployeeAccountService {
  return {
    async createEmployeeAccount() {
      return createErrorResponse(
        503007,
        "Employee account runtime is not configured.",
      );
    },
  };
}
