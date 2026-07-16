import type { UserRegistrationSessionCredentialAdapter } from "../auth/user-registration-boundary";
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

export type UserRegistrationServiceOptions = {
  now?: () => Date;
};

const INVALID_REGISTRATION_INPUT_CODE = 400002;
const DUPLICATE_PHONE_CODE = 409001;
const STUDENT_SESSION_DURATION_DAY = 7;
const CREDENTIAL_FIELD_NAME = "password";
const SESSION_TOKEN_FIELD = "token";

function addDays(value: Date, dayCount: number): Date {
  return new Date(value.getTime() + dayCount * 24 * 60 * 60 * 1000);
}

export function createUserRegistrationService(
  credentialAdapter: UserRegistrationSessionCredentialAdapter,
  userRegistrationRepository: UserRegistrationRepository,
  options: UserRegistrationServiceOptions = {},
): UserRegistrationService {
  const getNow = options.now ?? (() => new Date());

  return {
    async registerPersonalUser(input) {
      const registrationInput = normalizeUserRegistrationInput(input);

      if (!registrationInput.success) {
        return createErrorResponse(
          INVALID_REGISTRATION_INPUT_CODE,
          registrationInput.message,
        );
      }

      const accountPhoneConflict =
        await userRegistrationRepository.findAccountPhoneConflict(
          registrationInput.value.phone,
        );

      if (accountPhoneConflict !== null) {
        return createErrorResponse(
          DUPLICATE_PHONE_CODE,
          "Phone already registered.",
        );
      }

      const credential = await credentialAdapter.createPasswordCredential({
        phone: registrationInput.value.phone,
        [CREDENTIAL_FIELD_NAME]: registrationInput.value.password,
      });

      const personalUserResult =
        await userRegistrationRepository.createPersonalUser({
          authUserId: credential.authUserId,
          phone: registrationInput.value.phone,
          name: registrationInput.value.name,
        });

      if (personalUserResult.status === "conflict") {
        return createErrorResponse(
          DUPLICATE_PHONE_CODE,
          "Phone already registered.",
        );
      }

      const registeredUser = personalUserResult.user;
      const session = await credentialAdapter.createSingleActiveSession({
        authUserId: credential.authUserId,
        expiresAt: addDays(getNow(), STUDENT_SESSION_DURATION_DAY),
      });

      return createSuccessResponse({
        ...mapUserRegistrationToApi(registeredUser),
        session: {
          expiresAt: session.expires_at.toISOString(),
        },
        [SESSION_TOKEN_FIELD]: session.token,
      });
    },
  };
}
