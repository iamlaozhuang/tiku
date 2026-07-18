import type {
  EmployeeImportCommandActor,
  EmployeeImportCommandRowDto,
  IssuedEmployeeCredential,
  PreparedEmployeeCredential,
} from "../contracts/employee-import-command-contract";

export type EmployeeImportRejectionReason = Exclude<
  EmployeeImportCommandRowDto["rejectionReason"],
  null
>;

export type EmployeeImportCommandRowRecord = EmployeeImportCommandRowDto;

export type EmployeeImportCommandRecord = {
  publicId: string;
  actorAdminPublicId: string;
  organizationPublicId: string;
  commandKind: "single_create" | "batch_import";
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
  rows: EmployeeImportCommandRowRecord[];
  completedAt: Date | null;
  distributionConfirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ClaimEmployeeImportCommandInput = {
  actor: EmployeeImportCommandActor;
  commandKind: EmployeeImportCommandRecord["commandKind"];
  organizationPublicId: string;
  idempotencyScopeHash: string;
  requestHash: string;
  rows: { rowNumber: number; rowRequestHash: string }[];
};

export type EmployeeImportPreflightIdentityState =
  | "absent"
  | "personal_active"
  | "employee_same_organization"
  | "employee_other_organization"
  | "disabled_user"
  | "admin_phone_conflict";

export type PreflightEmployeeImportRowsInput = {
  actor: EmployeeImportCommandActor;
  organizationPublicId: string;
  rows: { rowNumber: number; phone: string }[];
};

export type EmployeeImportPreflightFacts = {
  organizationStatus: "active" | "not_found";
  authorization: {
    status: "available" | "unavailable";
    activeScopeCount: number;
    effectiveEdition: "standard" | "advanced" | null;
    availableSeatCount: number | null;
  };
  rows: {
    rowNumber: number;
    identityState: EmployeeImportPreflightIdentityState;
  }[];
};

export type FindClaimedEmployeeImportCommandInput = {
  actor: EmployeeImportCommandActor;
  idempotencyScopeHash: string;
};

export type ClaimedEmployeeImportCommand = {
  command: EmployeeImportCommandRecord;
  requestHash: string;
};

export type ProcessEmployeeImportRowInput = {
  actor: EmployeeImportCommandActor;
  commandPublicId: string;
  rowNumber: number;
  rowRequestHash: string;
  phone: string;
  name: string;
  preparedCredential: PreparedEmployeeCredential | null;
  prevalidatedRejectionReason: EmployeeImportRejectionReason | null;
};

export type FindEmployeeImportCommandInput = {
  actor: EmployeeImportCommandActor;
  commandPublicId: string;
};

export type EmployeeCredentialIssueTarget = {
  rowPublicId: string;
  rowNumber: number;
  employeePublicId: string;
};

export type EmployeeCredentialIssueTargetSet = {
  commandPublicId: string;
  credentialRevision: number;
  targets: EmployeeCredentialIssueTarget[];
};

export type IssueEmployeeCredentialsInput = {
  actor: EmployeeImportCommandActor;
  commandPublicId: string;
  expectedCredentialRevision: number;
  credentials: (Pick<IssuedEmployeeCredential, "passwordHash"> & {
    rowPublicId: string;
  })[];
};

export type EmployeeCredentialIssueResult = {
  issuePublicId: string;
  credentialRevision: number;
  rows: {
    rowPublicId: string;
    rowNumber: number;
    employeePublicId: string;
    phone: string;
    name: string;
  }[];
};

export type ConfirmEmployeeCredentialDistributionInput = {
  actor: EmployeeImportCommandActor;
  commandPublicId: string;
  issuePublicId: string;
  expectedCredentialRevision: number;
};

export type EmployeeImportCommandRepository = {
  preflightRows(
    input: PreflightEmployeeImportRowsInput,
  ): Promise<EmployeeImportPreflightFacts>;
  findClaimedCommand(
    input: FindClaimedEmployeeImportCommandInput,
  ): Promise<ClaimedEmployeeImportCommand | null>;
  claimCommand(
    input: ClaimEmployeeImportCommandInput,
  ): Promise<EmployeeImportCommandRecord>;
  processRow(input: ProcessEmployeeImportRowInput): Promise<void>;
  findCommand(
    input: FindEmployeeImportCommandInput,
  ): Promise<EmployeeImportCommandRecord | null>;
  listIssueTargets(
    input: FindEmployeeImportCommandInput,
  ): Promise<EmployeeCredentialIssueTargetSet>;
  issueCredentials(
    input: IssueEmployeeCredentialsInput,
  ): Promise<EmployeeCredentialIssueResult>;
  confirmDistribution(
    input: ConfirmEmployeeCredentialDistributionInput,
  ): Promise<EmployeeImportCommandRecord>;
};

export class EmployeeImportCommandError extends Error {
  constructor(
    readonly reason:
      | "actor_forbidden"
      | "command_not_found"
      | "idempotency_request_mismatch"
      | "credential_distribution_closed"
      | "credential_revision_stale"
      | "credential_manifest_stale"
      | "active_session"
      | "account_state_changed"
      | "credential_baseline_changed",
  ) {
    super(reason);
  }
}
