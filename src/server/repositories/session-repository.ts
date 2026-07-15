import type { AuthUserAccessRow } from "./auth-repository";

export type SessionLoginUserRow = AuthUserAccessRow & {
  login_failed_count: number;
  login_failure_user_id: number | null;
  login_failure_user_kind?: "user" | "admin";
};

export type LoginFailureInput = {
  userId: number;
  userKind?: "user" | "admin";
  lockThreshold: number;
  lockUntilAt: Date;
};

export type LoginFailureTransition = {
  loginFailedCount: number;
  lockedUntilAt: Date | null;
};

export type LoginFailureResetInput = {
  expectedLoginFailedCount: number;
  userId: number;
  userKind?: "user" | "admin";
};

export type SessionUserRepository = {
  findLoginUserByPhone(phone: string): Promise<SessionLoginUserRow | null>;
  recordLoginFailure(
    input: LoginFailureInput,
  ): Promise<LoginFailureTransition | null>;
  resetLoginFailures(input: LoginFailureResetInput): Promise<boolean>;
};
