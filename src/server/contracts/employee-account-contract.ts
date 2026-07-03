import type { AuthenticatedUserDto } from "./auth-contract";

export type EmployeeDto = {
  publicId: string;
  userPublicId: string;
  organizationPublicId: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeOrganizationDto = {
  publicId: string;
  name: string;
};

export type EmployeeAccountDto = {
  employee: EmployeeDto;
  user: AuthenticatedUserDto;
  organization: EmployeeOrganizationDto;
};

export type EmployeeAccountResultDto = {
  employeeAccount: EmployeeAccountDto;
  generatedInitialPassword?: string | null;
};
