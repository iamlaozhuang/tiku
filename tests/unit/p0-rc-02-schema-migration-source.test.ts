import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("P0 RC-02 migration source", () => {
  it("adds organization revision and deterministic employee quota reservations", () => {
    const drizzleDirectory = resolve(process.cwd(), "drizzle");
    const migrationName = readdirSync(drizzleDirectory).find((name) =>
      name.endsWith("_p0_rc_02_organization_scope_quota_employee.sql"),
    );

    expect(migrationName).toBeDefined();

    const migrationSource = readFileSync(
      resolve(drizzleDirectory, migrationName ?? "missing.sql"),
      "utf8",
    );
    const normalizedMigrationSource = migrationSource.toLowerCase();

    expect(migrationSource).toContain(
      'ALTER TABLE "organization" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL',
    );
    expect(migrationSource).toContain('CREATE TABLE "employee_org_auth"');
    expect(normalizedMigrationSource).toContain("row_number() over");
    expect(normalizedMigrationSource).toContain(
      "with recursive organization_ancestor",
    );
    expect(normalizedMigrationSource).toContain(
      "tree_integrity.parent_organization_id is null",
    );
    expect(normalizedMigrationSource).toContain("ranked_employee_scope");
    expect(normalizedMigrationSource).toContain("account_quota");
    expect(normalizedMigrationSource).toContain("used_quota");
  });

  it("keeps the generated snapshot and journal entry present", () => {
    const journalPath = resolve(process.cwd(), "drizzle/meta/_journal.json");
    const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
      entries: { tag: string }[];
    };
    const entry = journal.entries.find((candidate) =>
      candidate.tag.endsWith("_p0_rc_02_organization_scope_quota_employee"),
    );

    expect(entry).toBeDefined();
    const timestamp = entry?.tag.slice(0, 14) ?? "missing";
    expect(
      existsSync(
        resolve(process.cwd(), `drizzle/meta/${timestamp}_snapshot.json`),
      ),
    ).toBe(true);
  });
});
