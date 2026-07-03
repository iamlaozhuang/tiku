import type { AuthSessionSnapshot } from "./auth-boundary";
import type { CreateSingleActiveSessionInput } from "./session-boundary";

export type CreatePasswordCredentialInput = {
  phone: string;
  password: string;
};

export type CreatedPasswordCredential = {
  authUserId: string;
};

export type UserRegistrationCredentialAdapter = {
  createPasswordCredential(
    input: CreatePasswordCredentialInput,
  ): Promise<CreatedPasswordCredential>;
};

export type UserRegistrationSessionCredentialAdapter =
  UserRegistrationCredentialAdapter & {
    createSingleActiveSession(
      input: CreateSingleActiveSessionInput,
    ): Promise<AuthSessionSnapshot>;
  };
