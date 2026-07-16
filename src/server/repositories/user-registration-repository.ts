import { createHash } from "node:crypto";

import type { AuthSessionSnapshot } from "../auth/auth-boundary";
import type { AuthUserAccessRow } from "./auth-repository";
import type { AccountPhoneIdentityConflict } from "./account-phone-identity-lock";

export type CreatePersonalRegistrationInput = {
  expiresAt: Date;
  idempotencyKey: string;
  name: string;
  password: string;
  phone: string;
  registeredAt: Date;
};

type CompletedPersonalRegistration = {
  session: AuthSessionSnapshot;
  user: AuthUserAccessRow;
};

export type PersonalRegistrationResult =
  | ({ status: "created" } & CompletedPersonalRegistration)
  | ({ status: "recovered" } & CompletedPersonalRegistration)
  | {
      status: "conflict";
      reason: AccountPhoneIdentityConflict;
    };

export type UserRegistrationRepository = {
  createPersonalRegistration(
    input: CreatePersonalRegistrationInput,
  ): Promise<PersonalRegistrationResult>;
};

export function createRegistrationSessionId(idempotencyKey: string): string {
  const keyDigest = createHash("sha256").update(idempotencyKey).digest("hex");

  return `registration-session-${keyDigest}`;
}
