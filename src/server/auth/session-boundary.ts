import type { AuthSessionSnapshot } from "./auth-boundary";

export type PasswordCredentialInput = {
  authUserId: string;
  password: string;
};

export type CreateSingleActiveSessionInput = {
  authUserId: string;
  expiresAt: Date;
  passwordForReverification?: string;
};

export class SessionAccountStateError extends Error {
  constructor(readonly reason: "changed" | "disabled" | "locked") {
    super(`Session account is ${reason}.`);
    this.name = "SessionAccountStateError";
  }
}

export type SessionCredentialAdapter = {
  verifyPasswordCredential(input: PasswordCredentialInput): Promise<boolean>;
  createSession?(
    input: CreateSingleActiveSessionInput,
  ): Promise<AuthSessionSnapshot>;
  createSingleActiveSession(
    input: CreateSingleActiveSessionInput,
  ): Promise<AuthSessionSnapshot>;
};
