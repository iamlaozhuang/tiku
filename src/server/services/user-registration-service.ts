import type { UserRegistrationCredentialAdapter } from "../auth/user-registration-boundary";
import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { UserRegistrationDto } from "../contracts/auth-contract";
import { mapUserRegistrationToApi } from "../mappers/auth-mapper";
import type { UserRegistrationRepository } from "../repositories/user-registration-repository";
import { normalizeUserRegistrationInput } from "../validators/user-registration";

export type UserRegistrationService = {
  registerPersonalUser(
    input: unknown,
  ): Promise<ApiResponse<UserRegistrationDto | null>>;
};

const INVALID_REGISTRATION_INPUT_CODE = 400002;
const DUPLICATE_PHONE_CODE = 409001;

export function createUserRegistrationService(
  credentialAdapter: UserRegistrationCredentialAdapter,
  userRegistrationRepository: UserRegistrationRepository,
): UserRegistrationService {
  return {
    async registerPersonalUser(input) {
      const registrationInput = normalizeUserRegistrationInput(input);

      if (!registrationInput.success) {
        return createErrorResponse(
          INVALID_REGISTRATION_INPUT_CODE,
          registrationInput.message,
        );
      }

      const existingUser =
        await userRegistrationRepository.findRegisteredUserByPhone(
          registrationInput.value.phone,
        );

      if (existingUser !== null) {
        return createErrorResponse(
          DUPLICATE_PHONE_CODE,
          "Phone already registered.",
        );
      }

      const credential = await credentialAdapter.createPasswordCredential({
        phone: registrationInput.value.phone,
        password: registrationInput.value.password,
      });

      const registeredUser =
        await userRegistrationRepository.createPersonalUser({
          authUserId: credential.authUserId,
          phone: registrationInput.value.phone,
          name: registrationInput.value.name,
        });

      return createSuccessResponse(mapUserRegistrationToApi(registeredUser));
    },
  };
}
