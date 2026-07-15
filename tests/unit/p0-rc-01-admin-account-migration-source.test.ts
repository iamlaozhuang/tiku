import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "drizzle/20260715070131_p0_rc_01_admin_account_lifecycle.sql",
);
const previousSnapshotPath = resolve(
  process.cwd(),
  "drizzle/meta/20260706052000_snapshot.json",
);
const repairedSnapshotPath = resolve(
  process.cwd(),
  "drizzle/meta/20260710110500_snapshot.json",
);
const generatedSnapshotPath = resolve(
  process.cwd(),
  "drizzle/meta/20260715070131_snapshot.json",
);
const journalPath = resolve(process.cwd(), "drizzle/meta/_journal.json");
const snapshotDirectoryPath = resolve(process.cwd(), "drizzle/meta");

type DrizzleSnapshot = {
  id: string;
  prevId: string;
  tables: Record<
    string,
    {
      columns: Record<string, unknown>;
      indexes: Record<string, unknown>;
    }
  >;
};

type DrizzleJournal = {
  entries: Array<{ idx: number; tag: string }>;
};

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

describe("RC-01 admin account lifecycle migration source", () => {
  it("is additive and preserves the legacy admin role while backfilling role assignments", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain(
      'ADD COLUMN "login_failed_count" integer DEFAULT 0 NOT NULL',
    );
    expect(sql).toContain('ADD COLUMN "locked_until_at"');
    expect(sql).toContain('ADD COLUMN "disabled_at"');
    expect(sql).toContain('CREATE TABLE "admin_role_assignment"');
    expect(sql).toContain(
      'INSERT INTO "admin_role_assignment" ("admin_id", "admin_role", "created_at")',
    );
    expect(sql).toContain(
      'CREATE UNIQUE INDEX "udx_admin_organization_admin_id"',
    );
    expect(sql).toContain(
      "RC-01 migration blocked: admin_organization contains an admin without an organization admin role",
    );
    expect(sql).toContain(
      "ara.\"admin_role\" IN ('org_standard_admin', 'org_advanced_admin')",
    );
    expect(sql).not.toMatch(/^\s*(?:DROP|TRUNCATE|DELETE)\b/im);
    expect(sql).not.toContain('DROP COLUMN "admin_role"');
  });

  it("keeps the repaired historical snapshot and generated metadata in one linear chain", async () => {
    const [previousSnapshot, repairedSnapshot, generatedSnapshot, journal] =
      await Promise.all([
        readJson<DrizzleSnapshot>(previousSnapshotPath),
        readJson<DrizzleSnapshot>(repairedSnapshotPath),
        readJson<DrizzleSnapshot>(generatedSnapshotPath),
        readJson<DrizzleJournal>(journalPath),
      ]);

    expect(repairedSnapshot.id).not.toBe(previousSnapshot.id);
    expect(repairedSnapshot.prevId).toBe(previousSnapshot.id);
    expect(generatedSnapshot.prevId).toBe(repairedSnapshot.id);
    expect(
      new Set([previousSnapshot.id, repairedSnapshot.id, generatedSnapshot.id])
        .size,
    ).toBe(3);
    expect(
      journal.entries.find(
        (entry) =>
          entry.tag === "20260715070131_p0_rc_01_admin_account_lifecycle",
      ),
    ).toEqual(
      expect.objectContaining({
        idx: 22,
        tag: "20260715070131_p0_rc_01_admin_account_lifecycle",
      }),
    );

    const snapshotFileNames = (await readdir(snapshotDirectoryPath))
      .filter((fileName) => fileName.endsWith("_snapshot.json"))
      .sort();
    const snapshots = await Promise.all(
      snapshotFileNames.map((fileName) =>
        readJson<DrizzleSnapshot>(resolve(snapshotDirectoryPath, fileName)),
      ),
    );

    expect(new Set(snapshots.map((snapshot) => snapshot.id)).size).toBe(
      snapshots.length,
    );
    snapshots.slice(1).forEach((snapshot, index) => {
      expect(snapshot.prevId).toBe(snapshots[index]?.id);
    });
  });

  it("captures the RC-01 schema invariants in the generated snapshot", async () => {
    const snapshot = await readJson<DrizzleSnapshot>(generatedSnapshotPath);
    const adminTable = snapshot.tables["public.admin"];
    const adminOrganizationTable = snapshot.tables["public.admin_organization"];
    const roleAssignmentTable = snapshot.tables["public.admin_role_assignment"];

    expect(adminTable?.columns).toEqual(
      expect.objectContaining({
        disabled_at: expect.any(Object),
        locked_until_at: expect.any(Object),
        login_failed_count: expect.any(Object),
      }),
    );
    expect(roleAssignmentTable?.indexes).toHaveProperty(
      "udx_admin_role_assignment_admin_id_admin_role",
    );
    expect(adminOrganizationTable?.indexes).toHaveProperty(
      "udx_admin_organization_admin_id",
    );
  });
});
