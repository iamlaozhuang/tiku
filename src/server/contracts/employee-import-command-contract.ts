import type { ApiResponse } from "./api-response";

export type EmployeeImportCommandActor = {
  publicId: string;
  role: "ops_admin" | "super_admin";
  requestIp: string | null;
};

export type NormalizedEmployeeImportCommandInput = {
  commandKind: "single_create" | "batch_import";
  organizationPublicId: string;
  rows: {
    rowNumber: number;
    phone: string;
    name: string;
    initialPassword: string;
  }[];
};

export type EmployeeImportCommandServiceResult<TData> = {
  httpStatus: 200 | 403 | 404 | 409 | 422 | 503;
  response: ApiResponse<TData | null>;
};

export type PreparedEmployeeCredential = {
  credentialMode: "generated" | "provided";
  passwordHash: string;
};

export type IssuedEmployeeCredential = {
  initialPassword: string;
  passwordHash: string;
};

export type EmployeeImportCommandRowDto = {
  publicId: string;
  rowNumber: number;
  status: "pending" | "succeeded" | "rejected";
  outcomeKind: "created" | "bound" | null;
  rejectionReason:
    | "invalid_row"
    | "duplicate_phone"
    | "organization_not_found"
    | "cross_domain_conflict"
    | "cross_organization_conflict"
    | "disabled_account"
    | "current_authorization_insufficient"
    | "quota_insufficient"
    | null;
  warningReason: "initial_password_not_applied_to_existing_user" | null;
  credentialMode: "generated" | "provided" | "existing_account" | null;
  employeePublicId: string | null;
};

export type EmployeeImportCommandDto = {
  publicId: string;
  commandKind: "single_create" | "batch_import";
  organizationPublicId: string;
  status: "processing" | "completed";
  credentialDistributionStatus:
    | "pending"
    | "not_required"
    | "open"
    | "confirmed";
  credentialRevision: number;
  currentIssuePublicId: string | null;
  rowCount: number;
  counts: { pending: number; succeeded: number; rejected: number };
  rows: EmployeeImportCommandRowDto[];
  completedAt: string | null;
  distributionConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeCredentialManifestDto = {
  issuePublicId: string;
  credentialRevision: number;
  rows: {
    rowPublicId: string;
    rowNumber: number;
    employeePublicId: string;
    phone: string;
    name: string;
    initialPassword: string;
  }[];
};

export type EmployeeCredentialIssueInput = {
  expectedCredentialRevision: number;
};

export type EmployeeDistributionConfirmationInput = {
  issuePublicId: string;
  expectedCredentialRevision: number;
};
