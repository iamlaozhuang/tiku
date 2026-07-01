import type { AdminRole, UserStatus, UserType } from "../models/auth";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";

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
  admin_workspace_capability?: AdminWorkspaceCapabilitySummary | null;
};

export type AuthUserRepository = {
  findActiveUserByAuthUserId(
    authUserId: string,
  ): Promise<AuthUserAccessRow | null>;
};
