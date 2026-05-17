import type { AuthUserAccessRow } from "./auth-repository";

export type CreatePersonalUserInput = {
  authUserId: string;
  phone: string;
  name: string;
};

export type UserRegistrationRepository = {
  findRegisteredUserByPhone(phone: string): Promise<AuthUserAccessRow | null>;
  createPersonalUser(
    input: CreatePersonalUserInput,
  ): Promise<AuthUserAccessRow>;
};
