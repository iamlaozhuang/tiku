import type { AdminRole, UserStatus, UserType } from "../models/auth";

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
