import type { AdminRole } from "../models/auth";

export const LOCAL_ACCEPTANCE_SESSION_ERROR_CODES = {
  invalidRequest: 400001,
  forbidden: 403901,
} as const;

export type LocalAcceptanceSessionRole = Extract<
  AdminRole,
  "content_admin" | "ops_admin"
>;

export type LocalAcceptanceSessionDto = {
  role: LocalAcceptanceSessionRole;
  sessionMode: "cookie";
  expiresAt: string;
};

export function isLocalAcceptanceSessionRole(
  value: unknown,
): value is LocalAcceptanceSessionRole {
  return value === "content_admin" || value === "ops_admin";
}
