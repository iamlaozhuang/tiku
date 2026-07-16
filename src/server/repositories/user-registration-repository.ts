import type { AuthUserAccessRow } from "./auth-repository";
import type { AccountPhoneIdentityConflict } from "./account-phone-identity-lock";

export type CreatePersonalUserInput = {
  authUserId: string;
  phone: string;
  name: string;
};

export type UserRegistrationRepository = {
  findAccountPhoneConflict(
    phone: string,
  ): Promise<AccountPhoneIdentityConflict | null>;
  createPersonalUser(input: CreatePersonalUserInput): Promise<
    | {
        status: "created";
        user: AuthUserAccessRow;
      }
    | {
        status: "conflict";
        reason: AccountPhoneIdentityConflict;
      }
  >;
};
