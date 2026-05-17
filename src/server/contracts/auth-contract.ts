import type { UserStatus, UserType } from "../models/auth";

export type AuthenticatedUserDto = {
  publicId: string;
  phone: string;
  name: string;
  userType: UserType;
  status: UserStatus;
  lockedUntilAt: string | null;
  employeePublicId: string | null;
  organizationPublicId: string | null;
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
