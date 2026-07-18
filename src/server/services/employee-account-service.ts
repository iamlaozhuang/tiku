import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { EmployeeAccountResultDto } from "../contracts/employee-account-contract";
import { mapEmployeeAccountToApi } from "../mappers/employee-account-mapper";
import {
  EmployeeAccountMutationError,
  type EmployeeAccountRepository,
} from "../repositories/employee-account-repository";
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

      if (employeeAccountInput.value.initialPassword.length === 0) {
        return createErrorResponse(
          INVALID_EMPLOYEE_ACCOUNT_INPUT_CODE,
          "Invalid employee account input.",
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

        let employeeAccount;

        try {
          employeeAccount =
            await employeeAccountRepository.bindExistingUserToOrganization({
              userPublicId: existingUser.public_id,
              organizationPublicId:
                employeeAccountInput.value.organizationPublicId,
            });
        } catch (error) {
          return mapEmployeeAccountMutationError(error);
        }

        return createSuccessResponse(mapEmployeeAccountToApi(employeeAccount));
      }

      let employeeAccount;

      try {
        employeeAccount = await employeeAccountRepository.createEmployeeAccount(
          {
            ...employeeAccountInput.value,
          },
        );
      } catch (error) {
        return mapEmployeeAccountMutationError(error);
      }

      return createSuccessResponse(mapEmployeeAccountToApi(employeeAccount));
    },
  };
}

function mapEmployeeAccountMutationError(
  error: unknown,
): ApiResponse<EmployeeAccountResultDto | null> {
  if (!(error instanceof EmployeeAccountMutationError)) {
    throw error;
  }

  if (error.reason === "organization_not_found") {
    return createErrorResponse(
      ORGANIZATION_NOT_FOUND_CODE,
      "Organization does not exist.",
    );
  }

  if (
    error.reason === "quota_insufficient" ||
    error.reason === "no_active_authorization"
  ) {
    return createErrorResponse(
      EMPLOYEE_ORGANIZATION_CONFLICT_CODE,
      "Organization authorization quota is insufficient.",
    );
  }

  return createErrorResponse(
    EMPLOYEE_ORGANIZATION_CONFLICT_CODE,
    "Phone already bound to another organization.",
  );
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
