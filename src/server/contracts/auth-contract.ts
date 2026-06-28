import type { AdminRole, UserStatus, UserType } from "../models/auth";
import type { AdminWorkspaceCapabilitySummary } from "./admin-workspace-role-guard-contract";

export type AuthenticatedUserDto = {
  publicId: string;
  phone: string;
  name: string;
  userType: UserType | null;
  status: UserStatus;
  lockedUntilAt: string | null;
  employeePublicId: string | null;
  organizationPublicId: string | null;
  adminPublicId?: string | null;
  adminRoles?: AdminRole[];
  adminWorkspaceCapability?: AdminWorkspaceCapabilitySummary;
};

export type AuthSessionDto = {
  expiresAt: string;
};

export type AuthContextDto = {
  user: AuthenticatedUserDto;
  session: AuthSessionDto;
};

export type SessionLoginDto = AuthContextDto & {
  token: string;
};

export type UserRegistrationNextAction = "redeem_code";

export type UserRegistrationDto = {
  user: AuthenticatedUserDto;
  nextAction: UserRegistrationNextAction;
};
