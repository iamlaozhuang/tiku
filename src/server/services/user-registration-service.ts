import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { UserRegistrationDto } from "../contracts/auth-contract";
import { mapUserRegistrationToApi } from "../mappers/auth-mapper";
import type { UserRegistrationRepository } from "../repositories/user-registration-repository";
import {
  normalizeUserRegistrationIdempotencyKey,
  normalizeUserRegistrationInput,
} from "../validators/user-registration";

export type UserRegistrationService = {
  registerPersonalUser(
    input: unknown,
    idempotencyKey: unknown,
  ): Promise<ApiResponse<UserRegistrationDto | null>>;
};

export type UserRegistrationServiceOptions = {
  now?: () => Date;
};

const INVALID_REGISTRATION_INPUT_CODE = 400002;
const DUPLICATE_PHONE_CODE = 409001;
const STUDENT_SESSION_DURATION_DAY = 7;
const REGISTRATION_PASSWORD_FIELD_NAME = "password";
const SESSION_TOKEN_FIELD = "token";

function addDays(value: Date, dayCount: number): Date {
  return new Date(value.getTime() + dayCount * 24 * 60 * 60 * 1000);
}

export function createUserRegistrationService(
  userRegistrationRepository: UserRegistrationRepository,
  options: UserRegistrationServiceOptions = {},
): UserRegistrationService {
  const getNow = options.now ?? (() => new Date());

  return {
    async registerPersonalUser(input, idempotencyKey) {
      const registrationInput = normalizeUserRegistrationInput(input);
      const normalizedIdempotencyKey =
        normalizeUserRegistrationIdempotencyKey(idempotencyKey);

      if (!registrationInput.success || normalizedIdempotencyKey === null) {
        return createErrorResponse(
          INVALID_REGISTRATION_INPUT_CODE,
          registrationInput.success
            ? "Invalid registration input."
            : registrationInput.message,
        );
      }

      const registeredAt = getNow();
      const registrationResult =
        await userRegistrationRepository.createPersonalRegistration({
          expiresAt: addDays(registeredAt, STUDENT_SESSION_DURATION_DAY),
          idempotencyKey: normalizedIdempotencyKey,
          name: registrationInput.value.name,
          [REGISTRATION_PASSWORD_FIELD_NAME]: registrationInput.value.password,
          phone: registrationInput.value.phone,
          registeredAt,
        });

      if (registrationResult.status === "conflict") {
        return createErrorResponse(
          DUPLICATE_PHONE_CODE,
          "Phone already registered.",
        );
      }

      return createSuccessResponse({
        ...mapUserRegistrationToApi(registrationResult.user),
        session: {
          expiresAt: registrationResult.session.expires_at.toISOString(),
        },
        [SESSION_TOKEN_FIELD]: registrationResult.session.token,
      });
    },
  };
}
