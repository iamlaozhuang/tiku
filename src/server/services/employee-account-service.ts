import { randomInt } from "node:crypto";

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
const INITIAL_PASSWORD_LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const INITIAL_PASSWORD_UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const INITIAL_PASSWORD_DIGITS = "23456789";
const INITIAL_PASSWORD_CHARACTERS = `${INITIAL_PASSWORD_LOWERCASE}${INITIAL_PASSWORD_UPPERCASE}${INITIAL_PASSWORD_DIGITS}`;

function pickRandomCharacter(characters: string): string {
  return characters[randomInt(characters.length)] ?? characters[0] ?? "a";
}

function shuffleCharacters(characters: string[]): string[] {
  return characters.reduceRight((shuffledCharacters, _, index) => {
    const swapIndex = randomInt(index + 1);
    const nextCharacters = [...shuffledCharacters];
    const currentCharacter = nextCharacters[index] ?? "";

    nextCharacters[index] = nextCharacters[swapIndex] ?? "";
    nextCharacters[swapIndex] = currentCharacter;

    return nextCharacters;
  }, characters);
}

function generateEmployeeInitialPassword(): string {
  const requiredCharacters = [
    pickRandomCharacter(INITIAL_PASSWORD_LOWERCASE),
    pickRandomCharacter(INITIAL_PASSWORD_UPPERCASE),
    pickRandomCharacter(INITIAL_PASSWORD_DIGITS),
  ];
  const remainingCharacters = Array.from({ length: 9 }, () =>
    pickRandomCharacter(INITIAL_PASSWORD_CHARACTERS),
  );

  return shuffleCharacters([
    ...requiredCharacters,
    ...remainingCharacters,
  ]).join("");
}

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

        return createSuccessResponse({
          ...mapEmployeeAccountToApi(employeeAccount),
          generatedInitialPassword: null,
        });
      }

      const generatedInitialPassword =
        employeeAccountInput.value.initialPassword.length === 0
          ? generateEmployeeInitialPassword()
          : null;
      const initialPassword =
        generatedInitialPassword ?? employeeAccountInput.value.initialPassword;
      const credential = await credentialAdapter.createPasswordCredential({
        phone: employeeAccountInput.value.phone,
        ["password"]: initialPassword,
      });

      const employeeAccount =
        await employeeAccountRepository.createEmployeeAccount({
          authUserId: credential.authUserId,
          phone: employeeAccountInput.value.phone,
          name: employeeAccountInput.value.name,
          organizationPublicId: employeeAccountInput.value.organizationPublicId,
        });

      return createSuccessResponse({
        ...mapEmployeeAccountToApi(employeeAccount),
        generatedInitialPassword,
      });
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
