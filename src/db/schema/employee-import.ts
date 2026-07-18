import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { admin, employee, organization } from "./auth";

const idColumn = () =>
  bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey();

const timestampColumn = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull();

const createdAtColumn = () => timestampColumn("created_at").defaultNow();

const updatedAtColumn = () => timestampColumn("updated_at").defaultNow();

export const employeeImportCommandKindValues = [
  "single_create",
  "batch_import",
] as const;
export const employeeImportStatusValues = ["processing", "completed"] as const;
export const credentialDistributionStatusValues = [
  "pending",
  "not_required",
  "open",
  "confirmed",
] as const;
export const employeeImportRowStatusValues = [
  "pending",
  "succeeded",
  "rejected",
] as const;
export const employeeImportOutcomeKindValues = ["created", "bound"] as const;
export const employeeImportCredentialModeValues = [
  "generated",
  "provided",
  "existing_account",
] as const;
export const employeeImportRejectionReasonValues = [
  "invalid_row",
  "duplicate_phone",
  "organization_not_found",
  "cross_domain_conflict",
  "cross_organization_conflict",
  "disabled_account",
  "current_authorization_insufficient",
  "quota_insufficient",
] as const;
export const employeeImportWarningReasonValues = [
  "initial_password_not_applied_to_existing_user",
] as const;

export const employeeImportCommandKindEnum = pgEnum(
  "employee_import_command_kind",
  employeeImportCommandKindValues,
);
export const employeeImportStatusEnum = pgEnum(
  "employee_import_status",
  employeeImportStatusValues,
);
export const credentialDistributionStatusEnum = pgEnum(
  "credential_distribution_status",
  credentialDistributionStatusValues,
);
export const employeeImportRowStatusEnum = pgEnum(
  "employee_import_row_status",
  employeeImportRowStatusValues,
);
export const employeeImportOutcomeKindEnum = pgEnum(
  "employee_import_outcome_kind",
  employeeImportOutcomeKindValues,
);
export const employeeImportCredentialModeEnum = pgEnum(
  "employee_import_credential_mode",
  employeeImportCredentialModeValues,
);
export const employeeImportRejectionReasonEnum = pgEnum(
  "employee_import_rejection_reason",
  employeeImportRejectionReasonValues,
);
export const employeeImportWarningReasonEnum = pgEnum(
  "employee_import_warning_reason",
  employeeImportWarningReasonValues,
);

export const employeeImportCommand = pgTable(
  "employee_import_command",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    actor_admin_id: bigint("actor_admin_id", { mode: "number" })
      .notNull()
      .references(() => admin.id, { onDelete: "restrict" }),
    organization_id: bigint("organization_id", { mode: "number" })
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    command_kind: employeeImportCommandKindEnum("command_kind").notNull(),
    idempotency_scope_hash: text("idempotency_scope_hash").notNull(),
    request_hash: text("request_hash").notNull(),
    row_count: integer("row_count").notNull(),
    employee_import_status: employeeImportStatusEnum("employee_import_status")
      .default("processing")
      .notNull(),
    credential_distribution_status: credentialDistributionStatusEnum(
      "credential_distribution_status",
    )
      .default("pending")
      .notNull(),
    credential_revision: integer("credential_revision").default(0).notNull(),
    current_issue_public_id: text("current_issue_public_id"),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    distribution_confirmed_at: timestamp("distribution_confirmed_at", {
      withTimezone: true,
    }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_employee_import_command_public_id").on(table.public_id),
    uniqueIndex("udx_employee_import_command_idempotency_scope_hash").on(
      table.idempotency_scope_hash,
    ),
    index("idx_employee_import_command_actor_admin_id").on(
      table.actor_admin_id,
    ),
    index("idx_employee_import_command_organization_id").on(
      table.organization_id,
    ),
    check(
      "chk_employee_import_command_row_count",
      sql`${table.row_count} between 1 and 500
        and (${table.command_kind} <> 'single_create' or ${table.row_count} = 1)`,
    ),
    check(
      "chk_employee_import_command_credential_revision",
      sql`${table.credential_revision} >= 0`,
    ),
    check(
      "chk_employee_import_command_state",
      sql`(
        ${table.employee_import_status} = 'processing'
        and ${table.completed_at} is null
        and ${table.credential_distribution_status} = 'pending'
        and ${table.credential_revision} = 0
        and ${table.current_issue_public_id} is null
        and ${table.distribution_confirmed_at} is null
      ) or (
        ${table.employee_import_status} = 'completed'
        and ${table.completed_at} is not null
        and ${table.credential_distribution_status} <> 'pending'
      )`,
    ),
    check(
      "chk_employee_import_command_distribution_state",
      sql`(
        ${table.credential_distribution_status} = 'pending'
        and ${table.employee_import_status} = 'processing'
        and ${table.credential_revision} = 0
        and ${table.current_issue_public_id} is null
        and ${table.distribution_confirmed_at} is null
      ) or (
        ${table.credential_distribution_status} = 'not_required'
        and ${table.employee_import_status} = 'completed'
        and ${table.credential_revision} = 0
        and ${table.current_issue_public_id} is null
        and ${table.distribution_confirmed_at} is null
      ) or (
        ${table.credential_distribution_status} = 'open'
        and ${table.employee_import_status} = 'completed'
        and ${table.distribution_confirmed_at} is null
        and (
          (${table.credential_revision} = 0 and ${table.current_issue_public_id} is null)
          or
          (${table.credential_revision} > 0 and ${table.current_issue_public_id} is not null)
        )
      ) or (
        ${table.credential_distribution_status} = 'confirmed'
        and ${table.employee_import_status} = 'completed'
        and ${table.credential_revision} > 0
        and ${table.current_issue_public_id} is not null
        and ${table.distribution_confirmed_at} is not null
      )`,
    ),
  ],
);

export const employeeImportRow = pgTable(
  "employee_import_row",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    employee_import_command_id: bigint("employee_import_command_id", {
      mode: "number",
    }).notNull(),
    row_number: integer("row_number").notNull(),
    row_request_hash: text("row_request_hash").notNull(),
    employee_import_row_status: employeeImportRowStatusEnum(
      "employee_import_row_status",
    )
      .default("pending")
      .notNull(),
    outcome_kind: employeeImportOutcomeKindEnum("outcome_kind"),
    rejection_reason: employeeImportRejectionReasonEnum("rejection_reason"),
    warning_reason: employeeImportWarningReasonEnum("warning_reason"),
    credential_mode: employeeImportCredentialModeEnum("credential_mode"),
    employee_id: bigint("employee_id", { mode: "number" }).references(
      () => employee.id,
      { onDelete: "restrict" },
    ),
    credential_updated_at: timestamp("credential_updated_at", {
      withTimezone: true,
    }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    foreignKey({
      columns: [table.employee_import_command_id],
      foreignColumns: [employeeImportCommand.id],
      name: "fk_employee_import_row_command",
    }).onDelete("cascade"),
    uniqueIndex("udx_employee_import_row_public_id").on(table.public_id),
    uniqueIndex(
      "udx_employee_import_row_employee_import_command_id_row_number",
    ).on(table.employee_import_command_id, table.row_number),
    index("idx_employee_import_row_employee_import_command_id").on(
      table.employee_import_command_id,
    ),
    index("idx_employee_import_row_employee_id").on(table.employee_id),
    check("chk_employee_import_row_number", sql`${table.row_number} > 0`),
    check(
      "chk_employee_import_row_state",
      sql`(
        ${table.employee_import_row_status} = 'pending'
        and ${table.outcome_kind} is null
        and ${table.rejection_reason} is null
        and ${table.warning_reason} is null
        and ${table.credential_mode} is null
        and ${table.employee_id} is null
        and ${table.credential_updated_at} is null
      ) or (
        ${table.employee_import_row_status} = 'rejected'
        and ${table.outcome_kind} is null
        and ${table.rejection_reason} is not null
        and ${table.warning_reason} is null
        and ${table.credential_mode} is null
        and ${table.employee_id} is null
        and ${table.credential_updated_at} is null
      ) or (
        ${table.employee_import_row_status} = 'succeeded'
        and ${table.outcome_kind} is not null
        and ${table.rejection_reason} is null
        and ${table.credential_mode} is not null
        and ${table.employee_id} is not null
        and (
          (${table.outcome_kind} = 'created' and ${table.credential_mode} in ('generated', 'provided'))
          or
          (${table.outcome_kind} = 'bound' and ${table.credential_mode} = 'existing_account')
        )
        and (
          ${table.warning_reason} is null
          or (
            ${table.outcome_kind} = 'bound'
            and ${table.credential_mode} = 'existing_account'
          )
        )
        and (
          (${table.credential_mode} = 'generated' and ${table.credential_updated_at} is not null)
          or
          (${table.credential_mode} <> 'generated' and ${table.credential_updated_at} is null)
        )
      )`,
    ),
  ],
);
