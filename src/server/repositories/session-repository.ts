import type { AuthUserAccessRow } from "./auth-repository";

export type SessionLoginUserRow = AuthUserAccessRow & {
  login_failed_count: number;
};

export type LoginFailureInput = {
  userId: number;
  loginFailedCount: number;
  lockedUntilAt: Date | null;
};

export type SessionUserRepository = {
  findLoginUserByPhone(phone: string): Promise<SessionLoginUserRow | null>;
  recordLoginFailure(input: LoginFailureInput): Promise<void>;
  resetLoginFailures(userId: number): Promise<void>;
};
