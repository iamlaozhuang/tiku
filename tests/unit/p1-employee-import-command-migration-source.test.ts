import { Buffer } from "node:buffer";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationSuffix = "_p1_rc_02_employee_import_command_recovery.sql";
const migrationTagSuffix = "_p1_rc_02_employee_import_command_recovery";
const timestampedMigrationNamePattern =
  /^\d{14}_p1_rc_02_employee_import_command_recovery\.sql$/u;
const timestampedMigrationTagPattern =
  /^\d{14}_p1_rc_02_employee_import_command_recovery$/u;
const forbiddenSecretColumnPattern =
  /"(?:phone|name|password|initial_password|request_body|request_payload|raw_file|idempotency_key)"/u;

const expectedEnums = {
  "public.credential_distribution_status": [
    "pending",
    "not_required",
    "open",
    "confirmed",
  ],
  "public.employee_import_command_kind": ["single_create", "batch_import"],
  "public.employee_import_credential_mode": [
    "generated",
    "provided",
    "existing_account",
  ],
  "public.employee_import_outcome_kind": ["created", "bound"],
  "public.employee_import_rejection_reason": [
    "invalid_row",
    "duplicate_phone",
    "organization_not_found",
    "cross_domain_conflict",
    "cross_organization_conflict",
    "disabled_account",
    "current_authorization_insufficient",
    "quota_insufficient",
  ],
  "public.employee_import_row_status": ["pending", "succeeded", "rejected"],
  "public.employee_import_status": ["processing", "completed"],
  "public.employee_import_warning_reason": [
    "initial_password_not_applied_to_existing_user",
  ],
} as const;

const expectedCommandColumns = [
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
];
const expectedRowColumns = [
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
];
const expectedCommandIndexes = [
  "udx_employee_import_command_public_id",
  "udx_employee_import_command_idempotency_scope_hash",
  "idx_employee_import_command_actor_admin_id",
  "idx_employee_import_command_organization_id",
];
const expectedRowIndexes = [
  "udx_employee_import_row_public_id",
  "udx_employee_import_row_employee_import_command_id_row_number",
  "idx_employee_import_row_employee_import_command_id",
  "idx_employee_import_row_employee_id",
];
const expectedCommandChecks = [
  "chk_employee_import_command_row_count",
  "chk_employee_import_command_credential_revision",
  "chk_employee_import_command_state",
  "chk_employee_import_command_distribution_state",
];
const expectedRowChecks = [
  "chk_employee_import_row_number",
  "chk_employee_import_row_state",
];
const expectedCommandForeignKeys = [
  "employee_import_command_actor_admin_id_admin_id_fk",
  "employee_import_command_organization_id_organization_id_fk",
];
const expectedRowForeignKeys = [
  "employee_import_row_employee_id_employee_id_fk",
  "fk_employee_import_row_command",
];

const rowColumn = (columnName: string) =>
  `"employee_import_row"."${columnName}"`;

const expectedRowStateCheckValue = `(
  ${rowColumn("employee_import_row_status")} = 'pending'
  and ${rowColumn("outcome_kind")} is null
  and ${rowColumn("rejection_reason")} is null
  and ${rowColumn("warning_reason")} is null
  and ${rowColumn("credential_mode")} is null
  and ${rowColumn("employee_id")} is null
  and ${rowColumn("credential_updated_at")} is null
) or (
  ${rowColumn("employee_import_row_status")} = 'rejected'
  and ${rowColumn("outcome_kind")} is null
  and ${rowColumn("rejection_reason")} is not null
  and ${rowColumn("warning_reason")} is null
  and ${rowColumn("credential_mode")} is null
  and ${rowColumn("employee_id")} is null
  and ${rowColumn("credential_updated_at")} is null
) or (
  ${rowColumn("employee_import_row_status")} = 'succeeded'
  and ${rowColumn("outcome_kind")} is not null
  and ${rowColumn("rejection_reason")} is null
  and ${rowColumn("credential_mode")} is not null
  and ${rowColumn("employee_id")} is not null
  and (
    (${rowColumn("outcome_kind")} = 'created' and ${rowColumn("credential_mode")} in ('generated', 'provided'))
    or
    (${rowColumn("outcome_kind")} = 'bound' and ${rowColumn("credential_mode")} = 'existing_account')
  )
  and (
    ${rowColumn("warning_reason")} is null
    or (
      ${rowColumn("outcome_kind")} = 'bound'
      and ${rowColumn("credential_mode")} = 'existing_account'
    )
  )
  and (
    (${rowColumn("credential_mode")} = 'generated' and ${rowColumn("credential_updated_at")} is not null)
    or
    (${rowColumn("credential_mode")} <> 'generated' and ${rowColumn("credential_updated_at")} is null)
  )
)`;

type Journal = {
  entries: { idx: number; tag: string; version: string }[];
};

type SnapshotColumn = {
  name: string;
  type: string;
  primaryKey: boolean;
  notNull: boolean;
  default?: unknown;
  identity?: { name: string };
  typeSchema?: string;
};

type SnapshotForeignKey = {
  name: string;
  tableFrom: string;
  tableTo: string;
  columnsFrom: string[];
  columnsTo: string[];
  onDelete: string;
  onUpdate: string;
};

type SnapshotTable = {
  name: string;
  schema: string;
  columns: Record<string, SnapshotColumn>;
  indexes: Record<string, { name: string; isUnique: boolean }>;
  foreignKeys: Record<string, SnapshotForeignKey>;
  checkConstraints: Record<string, { name: string; value: string }>;
};

type Snapshot = {
  id: string;
  prevId: string;
  version: string;
  dialect: string;
  tables: Record<string, SnapshotTable>;
  enums: Record<string, { name: string; schema: string; values: string[] }>;
  schemas: Record<string, unknown>;
  sequences: Record<string, unknown>;
  roles: Record<string, unknown>;
  policies: Record<string, unknown>;
  views: Record<string, unknown>;
};

function readGeneratedMigration(): { name: string; source: string } {
  const drizzleDirectory = resolve(process.cwd(), "drizzle");
  const migrationNames = readdirSync(drizzleDirectory).filter((name) =>
    name.endsWith(migrationSuffix),
  );

  expect(migrationNames).toHaveLength(1);

  return {
    name: migrationNames[0]!,
    source: readFileSync(resolve(drizzleDirectory, migrationNames[0]!), "utf8"),
  };
}

function readSnapshot(snapshotPath: string): Snapshot {
  return JSON.parse(readFileSync(snapshotPath, "utf8")) as Snapshot;
}

function normalizeSql(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function getCreateTableColumns(source: string, tableName: string): string[] {
  const tableMatch = source.match(
    new RegExp(
      `CREATE TABLE "${tableName}" \\(\\r?\\n([\\s\\S]*?)\\r?\\n\\);`,
      "u",
    ),
  );

  expect(tableMatch).not.toBeNull();

  const columnSection = tableMatch?.[1]?.split(/\r?\n\tCONSTRAINT/u)[0] ?? "";
  return [...columnSection.matchAll(/^\t"([^"]+)"\s/gmu)].map(
    (match) => match[1]!,
  );
}

function parseCreatedEnums(source: string): Record<string, string[]> {
  return Object.fromEntries(
    [
      ...source.matchAll(
        /CREATE TYPE "([^"]+)"\."([^"]+)" AS ENUM\(([^;]+)\);/gu,
      ),
    ].map((match) => [
      `${match[1]}.${match[2]}`,
      [...match[3]!.matchAll(/'([^']+)'/gu)].map(
        (valueMatch) => valueMatch[1]!,
      ),
    ]),
  );
}

function getNewKeys(
  current: Record<string, unknown>,
  previous: Record<string, unknown>,
): string[] {
  return Object.keys(current)
    .filter((key) => !(key in previous))
    .sort();
}

function getRemovedKeys(
  current: Record<string, unknown>,
  previous: Record<string, unknown>,
): string[] {
  return Object.keys(previous)
    .filter((key) => !(key in current))
    .sort();
}

function expectColumnContract(
  table: SnapshotTable,
  columnName: string,
  contract: Partial<SnapshotColumn>,
): void {
  expect(table.columns[columnName]).toMatchObject({
    name: columnName,
    ...contract,
  });
}

function readGeneratedSnapshotChain(): {
  current: Snapshot;
  previous: Snapshot;
  migrationTag: string;
} {
  const { name } = readGeneratedMigration();
  const migrationTag = name.slice(0, -".sql".length);
  const journal = JSON.parse(
    readFileSync(resolve(process.cwd(), "drizzle/meta/_journal.json"), "utf8"),
  ) as Journal;
  const matchingEntries = journal.entries.filter(
    (entry) => entry.tag === migrationTag,
  );

  expect(matchingEntries).toHaveLength(1);
  expect(journal.entries.at(-1)?.tag).toBe(migrationTag);
  expect(migrationTag).toMatch(timestampedMigrationTagPattern);

  const currentEntryIndex = journal.entries.findIndex(
    (entry) => entry.tag === migrationTag,
  );
  const previousEntry = journal.entries[currentEntryIndex - 1];
  expect(previousEntry).toBeDefined();
  expect(matchingEntries[0]?.idx).toBe((previousEntry?.idx ?? -1) + 1);

  const currentSnapshotPath = resolve(
    process.cwd(),
    `drizzle/meta/${migrationTag.slice(0, 14)}_snapshot.json`,
  );
  const previousSnapshotPrefix = previousEntry?.tag.split("_", 1)[0] ?? "";
  const previousSnapshotPath = resolve(
    process.cwd(),
    `drizzle/meta/${previousSnapshotPrefix}_snapshot.json`,
  );

  expect(existsSync(currentSnapshotPath)).toBe(true);
  expect(existsSync(previousSnapshotPath)).toBe(true);

  return {
    current: readSnapshot(currentSnapshotPath),
    previous: readSnapshot(previousSnapshotPath),
    migrationTag,
  };
}

describe("P1 employee import command generated migration source", () => {
  it("uses the required 14-digit timestamp migration prefix", () => {
    const { name } = readGeneratedMigration();

    expect(name).toMatch(timestampedMigrationNamePattern);
  });

  it("creates the complete eight-enum contract with exact values", () => {
    const { source } = readGeneratedMigration();

    expect(parseCreatedEnums(source)).toEqual(expectedEnums);
  });

  it("contains exactly the approved two-table additive DDL", () => {
    const { source } = readGeneratedMigration();
    const statements = source
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);
    const tableNames = [...source.matchAll(/CREATE TABLE "([^"]+)"/gu)].map(
      (match) => match[1]!,
    );
    const alterTargets = [...source.matchAll(/ALTER TABLE "([^"]+)"/gu)].map(
      (match) => match[1]!,
    );

    expect(statements).toHaveLength(22);
    expect(
      statements.every((statement) =>
        /^(?:CREATE TYPE|CREATE TABLE|CREATE (?:UNIQUE )?INDEX|ALTER TABLE)\b/u.test(
          statement,
        ),
      ),
    ).toBe(true);
    expect(
      statements.filter((statement) => statement.startsWith("CREATE TYPE")),
    ).toHaveLength(8);
    expect(
      statements.filter((statement) => statement.startsWith("CREATE TABLE")),
    ).toHaveLength(2);
    expect(
      statements.filter((statement) => statement.startsWith("ALTER TABLE")),
    ).toHaveLength(4);
    expect(
      statements.filter((statement) =>
        /^CREATE (?:UNIQUE )?INDEX\b/u.test(statement),
      ),
    ).toHaveLength(8);
    expect(tableNames).toEqual([
      "employee_import_command",
      "employee_import_row",
    ]);
    expect(alterTargets).toEqual([
      "employee_import_command",
      "employee_import_command",
      "employee_import_row",
      "employee_import_row",
    ]);
    expect(source).not.toMatch(/^\s*(?:DROP|TRUNCATE|RENAME)\b/imu);
  });

  it("locks complete SQL columns, indexes, checks, and foreign keys", () => {
    const { source } = readGeneratedMigration();
    const indexNames = [
      ...source.matchAll(/CREATE (?:UNIQUE )?INDEX "([^"]+)"/gu),
    ].map((match) => match[1]!);
    const checkNames = [...source.matchAll(/CONSTRAINT "([^"]+)" CHECK/gu)].map(
      (match) => match[1]!,
    );
    const foreignKeyNames = [
      ...source.matchAll(/ADD CONSTRAINT "([^"]+)" FOREIGN KEY/gu),
    ].map((match) => match[1]!);

    expect(getCreateTableColumns(source, "employee_import_command")).toEqual(
      expectedCommandColumns,
    );
    expect(getCreateTableColumns(source, "employee_import_row")).toEqual(
      expectedRowColumns,
    );
    expect(indexNames).toEqual([
      ...expectedCommandIndexes,
      ...expectedRowIndexes,
    ]);
    expect(checkNames).toEqual([
      ...expectedCommandChecks,
      ...expectedRowChecks,
    ]);
    expect(foreignKeyNames).toEqual([
      ...expectedCommandForeignKeys,
      ...expectedRowForeignKeys,
    ]);
    expect(source).not.toMatch(forbiddenSecretColumnPattern);
  });

  it("locks the complete succeeded-row state expression in generated SQL", () => {
    const { source } = readGeneratedMigration();

    expect(normalizeSql(source)).toContain(
      normalizeSql(
        `CONSTRAINT "chk_employee_import_row_state" CHECK (${expectedRowStateCheckValue})`,
      ),
    );
  });

  it("keeps every generated SQL identifier within 63 UTF-8 bytes", () => {
    const { source } = readGeneratedMigration();
    const identifiers = [
      ...new Set([...source.matchAll(/"([^"]+)"/gu)].map((match) => match[1]!)),
    ];

    expect(
      identifiers.filter((identifier) => Buffer.byteLength(identifier) > 63),
    ).toEqual([]);
  });

  it("keeps one terminal journal tag and a linear timestamped snapshot", () => {
    const { current, previous, migrationTag } = readGeneratedSnapshotChain();

    expect(migrationTag.endsWith(migrationTagSuffix)).toBe(true);
    expect(current.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
    expect(current.id).not.toBe(previous.id);
    expect(current.prevId).toBe(previous.id);
    expect(current.version).toBe(previous.version);
    expect(current.dialect).toBe("postgresql");
  });

  it("adds only the approved enums and tables to the previous snapshot", () => {
    const { current, previous } = readGeneratedSnapshotChain();

    expect(getNewKeys(current.tables, previous.tables)).toEqual([
      "public.employee_import_command",
      "public.employee_import_row",
    ]);
    expect(getRemovedKeys(current.tables, previous.tables)).toEqual([]);
    expect(getNewKeys(current.enums, previous.enums)).toEqual(
      Object.keys(expectedEnums).sort(),
    );
    expect(getRemovedKeys(current.enums, previous.enums)).toEqual([]);

    for (const tableName of Object.keys(previous.tables)) {
      expect(current.tables[tableName]).toEqual(previous.tables[tableName]);
    }
    for (const enumName of Object.keys(previous.enums)) {
      expect(current.enums[enumName]).toEqual(previous.enums[enumName]);
    }

    expect(current.schemas).toEqual(previous.schemas);
    expect(current.sequences).toEqual(previous.sequences);
    expect(current.roles).toEqual(previous.roles);
    expect(current.policies).toEqual(previous.policies);
    expect(current.views).toEqual(previous.views);
  });

  it("locks the complete generated snapshot enum and table structure", () => {
    const { current } = readGeneratedSnapshotChain();
    const commandTable = current.tables["public.employee_import_command"]!;
    const rowTable = current.tables["public.employee_import_row"]!;

    for (const [enumName, values] of Object.entries(expectedEnums)) {
      expect(current.enums[enumName]).toEqual({
        name: enumName.slice("public.".length),
        schema: "public",
        values,
      });
    }

    expect(commandTable.name).toBe("employee_import_command");
    expect(commandTable.schema).toBe("");
    expect(Object.keys(commandTable.columns)).toEqual(expectedCommandColumns);
    expect(Object.keys(commandTable.indexes)).toEqual(expectedCommandIndexes);
    expect(Object.keys(commandTable.checkConstraints)).toEqual(
      expectedCommandChecks,
    );
    expect(Object.keys(commandTable.foreignKeys)).toEqual(
      expectedCommandForeignKeys,
    );

    expect(rowTable.name).toBe("employee_import_row");
    expect(rowTable.schema).toBe("");
    expect(Object.keys(rowTable.columns)).toEqual(expectedRowColumns);
    expect(Object.keys(rowTable.indexes)).toEqual(expectedRowIndexes);
    expect(Object.keys(rowTable.checkConstraints)).toEqual(expectedRowChecks);
    expect(Object.keys(rowTable.foreignKeys)).toEqual(expectedRowForeignKeys);

    expectColumnContract(commandTable, "id", {
      type: "bigint",
      primaryKey: true,
      notNull: true,
      identity: { name: "employee_import_command_id_seq" },
    });
    expectColumnContract(commandTable, "command_kind", {
      type: "employee_import_command_kind",
      typeSchema: "public",
      notNull: true,
    });
    expectColumnContract(commandTable, "employee_import_status", {
      type: "employee_import_status",
      typeSchema: "public",
      default: "'processing'",
      notNull: true,
    });
    expectColumnContract(commandTable, "credential_distribution_status", {
      type: "credential_distribution_status",
      typeSchema: "public",
      default: "'pending'",
      notNull: true,
    });
    expectColumnContract(commandTable, "credential_revision", {
      type: "integer",
      default: 0,
      notNull: true,
    });
    expectColumnContract(commandTable, "current_issue_public_id", {
      type: "text",
      notNull: false,
    });
    expectColumnContract(commandTable, "completed_at", {
      type: "timestamp with time zone",
      notNull: false,
    });
    expectColumnContract(commandTable, "distribution_confirmed_at", {
      type: "timestamp with time zone",
      notNull: false,
    });

    expectColumnContract(rowTable, "id", {
      type: "bigint",
      primaryKey: true,
      notNull: true,
      identity: { name: "employee_import_row_id_seq" },
    });
    expectColumnContract(rowTable, "employee_import_row_status", {
      type: "employee_import_row_status",
      typeSchema: "public",
      default: "'pending'",
      notNull: true,
    });
    expectColumnContract(rowTable, "employee_import_command_id", {
      type: "bigint",
      notNull: true,
    });
    expectColumnContract(rowTable, "employee_id", {
      type: "bigint",
      notNull: false,
    });
    expectColumnContract(rowTable, "credential_updated_at", {
      type: "timestamp with time zone",
      notNull: false,
    });

    expect(rowTable.foreignKeys.fk_employee_import_row_command).toEqual({
      name: "fk_employee_import_row_command",
      tableFrom: "employee_import_row",
      tableTo: "employee_import_command",
      columnsFrom: ["employee_import_command_id"],
      columnsTo: ["id"],
      onDelete: "cascade",
      onUpdate: "no action",
    });
    expect(
      normalizeSql(
        rowTable.checkConstraints.chk_employee_import_row_state!.value,
      ),
    ).toBe(normalizeSql(expectedRowStateCheckValue));
    expect(
      rowTable.foreignKeys.employee_import_row_employee_id_employee_id_fk,
    ).toMatchObject({
      tableFrom: "employee_import_row",
      tableTo: "employee",
      columnsFrom: ["employee_id"],
      columnsTo: ["id"],
      onDelete: "restrict",
    });

    const targetColumns = [
      ...Object.keys(commandTable.columns),
      ...Object.keys(rowTable.columns),
    ];
    expect(targetColumns).not.toEqual(
      expect.arrayContaining([
        "phone",
        "name",
        "password",
        "initial_password",
        "request_body",
        "request_payload",
        "raw_file",
        "idempotency_key",
      ]),
    );
  });
});
