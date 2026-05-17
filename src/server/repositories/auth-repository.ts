import type { UserStatus, UserType } from "../models/auth";

export type AuthUserAccessRow = {
  id: number;
  auth_user_id: string;
  public_id: string;
  phone: string;
  name: string;
  user_type: UserType;
  status: UserStatus;
  locked_until_at: Date | null;
  employee_public_id: string | null;
  organization_public_id: string | null;
};

export type AuthUserRepository = {
  findActiveUserByAuthUserId(
    authUserId: string,
  ): Promise<AuthUserAccessRow | null>;
};
