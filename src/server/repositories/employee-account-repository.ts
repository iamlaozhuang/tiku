import type { AuthUserAccessRow } from "./auth-repository";
import type { NormalizedCreateEmployeeAccountInput } from "../validators/employee-account";

export type EmployeeAccountUserAccessRow = AuthUserAccessRow;

export type EmployeeAccountAccessRow = {
  id: number;
  public_id: string;
  user_public_id: string;
  organization_public_id: string;
  created_at: Date;
  updated_at: Date;
};

export type EmployeeOrganizationAccessRow = {
  public_id: string;
  name: string;
};

export type EmployeeAccountResult = {
  employee: EmployeeAccountAccessRow;
  user: EmployeeAccountUserAccessRow;
  organization: EmployeeOrganizationAccessRow;
};

export type CreateEmployeeAccountInput = Omit<
  NormalizedCreateEmployeeAccountInput,
  "initialPassword"
> & {
  authUserId: string;
};

export type BindExistingUserToOrganizationInput = {
  userPublicId: string;
  organizationPublicId: string;
};

export type EmployeeAccountRepository = {
  findUserByPhone(phone: string): Promise<EmployeeAccountUserAccessRow | null>;
  findOrganizationByPublicId(
    publicId: string,
  ): Promise<EmployeeOrganizationAccessRow | null>;
  createEmployeeAccount(
    input: CreateEmployeeAccountInput,
  ): Promise<EmployeeAccountResult>;
  bindExistingUserToOrganization(
    input: BindExistingUserToOrganizationInput,
  ): Promise<EmployeeAccountResult>;
};
