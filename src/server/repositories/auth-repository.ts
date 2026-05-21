import type { AdminRole, UserStatus, UserType } from "../models/auth";

export type AuthUserAccessRow = {
  id: number;
  auth_user_id: string;
  public_id: string;
  phone: string;
  name: string;
  user_type: UserType | null;
  status: UserStatus;
  locked_until_at: Date | null;
  employee_public_id: string | null;
  organization_public_id: string | null;
  admin_public_id?: string | null;
  admin_roles?: AdminRole[];
};

export type AuthUserRepository = {
  findActiveUserByAuthUserId(
    authUserId: string,
  ): Promise<AuthUserAccessRow | null>;
};
