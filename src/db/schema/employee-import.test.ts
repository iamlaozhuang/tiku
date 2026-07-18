import { Buffer } from "node:buffer";

import { getTableName } from "drizzle-orm";
import { getTableConfig, PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  credentialDistributionStatusValues,
  employeeImportCommand,
  employeeImportCommandKindValues,
  employeeImportCredentialModeValues,
  employeeImportOutcomeKindValues,
  employeeImportRejectionReasonValues,
  employeeImportRow,
  employeeImportRowStatusValues,
  employeeImportStatusValues,
  employeeImportWarningReasonValues,
} from "./employee-import";

type PgTable = Parameters<typeof getTableConfig>[0];

function getColumnNames(table: PgTable): string[] {
  return getTableConfig(table).columns.map((column) => column.name);
}

function getIndexNames(table: PgTable): string[] {
  return getTableConfig(table).indexes.flatMap((schemaIndex) =>
    schemaIndex.config.name ? [schemaIndex.config.name] : [],
  );
}

function getCheckNames(table: PgTable): string[] {
  return getTableConfig(table).checks.map((schemaCheck) => schemaCheck.name);
}

function getForeignKeyNames(table: PgTable): string[] {
  return getTableConfig(table).foreignKeys.map((foreignKey) =>
    foreignKey.getName(),
  );
}

function getCheckSql(table: PgTable, checkName: string): string {
  const schemaCheck = getTableConfig(table).checks.find(
    (candidate) => candidate.name === checkName,
  );

  expect(schemaCheck).toBeDefined();

  return new PgDialect()
    .sqlToQuery(schemaCheck!.value)
    .sql.replace(/\s+/gu, " ");
}

const forbiddenSecretColumns = [
  "phone",
  "name",
  "password",
  "initial_password",
  "request_body",
  "request_payload",
  "raw_file",
  "idempotency_key",
];

describe("employee import command persistence schema", () => {
  it("registers the command and row state enums", () => {
    expect(employeeImportCommandKindValues).toEqual([
      "single_create",
      "batch_import",
    ]);
    expect(employeeImportStatusValues).toEqual(["processing", "completed"]);
    expect(credentialDistributionStatusValues).toEqual([
      "pending",
      "not_required",
      "open",
      "confirmed",
    ]);
    expect(employeeImportRowStatusValues).toEqual([
      "pending",
      "succeeded",
      "rejected",
    ]);
    expect(employeeImportOutcomeKindValues).toEqual(["created", "bound"]);
    expect(employeeImportCredentialModeValues).toEqual([
      "generated",
      "provided",
      "existing_account",
    ]);
    expect(employeeImportRejectionReasonValues).toEqual([
      "invalid_row",
      "duplicate_phone",
      "organization_not_found",
      "cross_domain_conflict",
      "cross_organization_conflict",
      "disabled_account",
      "current_authorization_insufficient",
      "quota_insufficient",
    ]);
    expect(employeeImportWarningReasonValues).toEqual([
      "initial_password_not_applied_to_existing_user",
    ]);
  });

  it("persists command identity and distribution state without raw input", () => {
    expect(getTableName(employeeImportCommand)).toBe("employee_import_command");
    expect(getColumnNames(employeeImportCommand)).toEqual([
      "id",
      "public_id",
      "actor_admin_id",
      "organization_id",
      "command_kind",
      "idempotency_scope_hash",
      "request_hash",
      "row_count",
      "employee_import_status",
      "credential_distribution_status",
      "credential_revision",
      "current_issue_public_id",
      "completed_at",
      "distribution_confirmed_at",
      "created_at",
      "updated_at",
    ]);
    expect(getColumnNames(employeeImportCommand)).not.toEqual(
      expect.arrayContaining(forbiddenSecretColumns),
    );
  });

  it("persists one redacted outcome per command row", () => {
    expect(getTableName(employeeImportRow)).toBe("employee_import_row");
    expect(getColumnNames(employeeImportRow)).toEqual([
      "id",
      "public_id",
      "employee_import_command_id",
      "row_number",
      "row_request_hash",
      "employee_import_row_status",
      "outcome_kind",
      "rejection_reason",
      "warning_reason",
      "credential_mode",
      "employee_id",
      "credential_updated_at",
      "created_at",
      "updated_at",
    ]);
    expect(getColumnNames(employeeImportRow)).not.toEqual(
      expect.arrayContaining(forbiddenSecretColumns),
    );
  });

  it("names command indexes, foreign keys, and state constraints", () => {
    expect(getIndexNames(employeeImportCommand)).toEqual([
      "udx_employee_import_command_public_id",
      "udx_employee_import_command_idempotency_scope_hash",
      "idx_employee_import_command_actor_admin_id",
      "idx_employee_import_command_organization_id",
    ]);
    expect(getForeignKeyNames(employeeImportCommand)).toEqual([
      "employee_import_command_actor_admin_id_admin_id_fk",
      "employee_import_command_organization_id_organization_id_fk",
    ]);
    expect(getCheckNames(employeeImportCommand)).toEqual([
      "chk_employee_import_command_row_count",
      "chk_employee_import_command_credential_revision",
      "chk_employee_import_command_state",
      "chk_employee_import_command_distribution_state",
    ]);
  });

  it("names row indexes, foreign keys, and state constraints", () => {
    expect(getIndexNames(employeeImportRow)).toEqual([
      "udx_employee_import_row_public_id",
      "udx_employee_import_row_employee_import_command_id_row_number",
      "idx_employee_import_row_employee_import_command_id",
      "idx_employee_import_row_employee_id",
    ]);
    expect(getForeignKeyNames(employeeImportRow)).toEqual([
      "employee_import_row_employee_id_employee_id_fk",
      "fk_employee_import_row_command",
    ]);
    expect(getCheckNames(employeeImportRow)).toEqual([
      "chk_employee_import_row_number",
      "chk_employee_import_row_state",
    ]);
  });

  it("closes succeeded outcome and credential mode combinations", () => {
    const rowStateCheckSql = getCheckSql(
      employeeImportRow,
      "chk_employee_import_row_state",
    );

    expect(rowStateCheckSql).toContain(
      `( ("employee_import_row"."outcome_kind" = 'created' and "employee_import_row"."credential_mode" in ('generated', 'provided')) or ("employee_import_row"."outcome_kind" = 'bound' and "employee_import_row"."credential_mode" = 'existing_account') )`,
    );
    expect(rowStateCheckSql).toContain(
      `( "employee_import_row"."warning_reason" is null or ( "employee_import_row"."outcome_kind" = 'bound' and "employee_import_row"."credential_mode" = 'existing_account' ) )`,
    );
    expect(rowStateCheckSql).toContain(
      `( ("employee_import_row"."credential_mode" = 'generated' and "employee_import_row"."credential_updated_at" is not null) or ("employee_import_row"."credential_mode" <> 'generated' and "employee_import_row"."credential_updated_at" is null) )`,
    );
  });

  it("keeps every persisted PostgreSQL identifier within 63 UTF-8 bytes", () => {
    const identifiers = [employeeImportCommand, employeeImportRow].flatMap(
      (table) => [
        getTableName(table),
        ...getColumnNames(table),
        ...getIndexNames(table),
        ...getForeignKeyNames(table),
        ...getCheckNames(table),
      ],
    );

    expect(
      identifiers.filter((identifier) => Buffer.byteLength(identifier) > 63),
    ).toEqual([]);
  });
});
