import type { AuthUserAccessRow } from "./auth-repository";

export type SessionLoginUserRow = AuthUserAccessRow & {
  login_failed_count: number;
  login_failure_user_id: number | null;
  login_failure_user_kind?: "user" | "admin";
};

export type LoginFailureInput = {
  userId: number;
  userKind?: "user" | "admin";
  loginFailedCount: number;
  lockedUntilAt: Date | null;
};

export type SessionUserRepository = {
  findLoginUserByPhone(phone: string): Promise<SessionLoginUserRow | null>;
  recordLoginFailure(input: LoginFailureInput): Promise<void>;
  resetLoginFailures(
    userId: number,
    userKind?: "user" | "admin",
  ): Promise<void>;
};
