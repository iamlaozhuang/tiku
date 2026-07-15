import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("P0 RC-04 migration source", () => {
  const drizzleDirectory = resolve(process.cwd(), "drizzle");
  const migrationName = readdirSync(drizzleDirectory).find((name) =>
    name.endsWith("_p0_rc_04_content_paper_aggregate_snapshot.sql"),
  );

  it("adds aggregate revision, stable random child identities, and command idempotency", () => {
    expect(migrationName).toBeDefined();

    const migrationSource = readFileSync(
      resolve(drizzleDirectory, migrationName ?? "missing.sql"),
      "utf8",
    );
    const normalizedMigrationSource = migrationSource.toLowerCase();

    expect(migrationSource).toContain(
      'ALTER TABLE "paper" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL',
    );
    expect(migrationSource).toContain('CREATE TABLE "paper_command"');
    expect(migrationSource).toContain(
      "ADD COLUMN \"public_id\" text DEFAULT 'psp_' || replace(gen_random_uuid()::text, '-', '') NOT NULL",
    );
    expect(migrationSource).toContain(
      "ADD COLUMN \"public_id\" text DEFAULT 'qgroup_' || replace(gen_random_uuid()::text, '-', '') NOT NULL",
    );
    expect(migrationSource).toContain(
      'CREATE UNIQUE INDEX "udx_paper_command_public_id"',
    );
    expect(migrationSource).toContain(
      'CREATE UNIQUE INDEX "udx_paper_scoring_point_public_id"',
    );
    expect(migrationSource).toContain(
      'CREATE UNIQUE INDEX "udx_question_group_public_id"',
    );
    expect(normalizedMigrationSource).not.toMatch(
      /(?:psp_|qgroup_)[^;\n]*(?:\bid\b|row_number)/u,
    );
    expect(normalizedMigrationSource).not.toMatch(/^\s*(?:drop|truncate)\b/imu);
  });

  it("keeps the generated snapshot and journal entry in the chain", () => {
    const journalPath = resolve(process.cwd(), "drizzle/meta/_journal.json");
    const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
      entries: { idx: number; tag: string }[];
    };
    const entry = journal.entries.find((candidate) =>
      candidate.tag.endsWith("_p0_rc_04_content_paper_aggregate_snapshot"),
    );

    expect(entry).toEqual(expect.objectContaining({ idx: 24 }));
    const timestamp = entry?.tag.slice(0, 14) ?? "missing";
    expect(
      existsSync(
        resolve(process.cwd(), `drizzle/meta/${timestamp}_snapshot.json`),
      ),
    ).toBe(true);
  });
});
