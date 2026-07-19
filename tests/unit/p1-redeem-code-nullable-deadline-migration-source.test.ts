import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationSuffix = "_p1_rc_02_redeem_code_nullable_deadline.sql";

type Journal = {
  entries: Array<{ idx: number; tag: string }>;
};

type Snapshot = {
  id: string;
  prevId: string;
  tables: Record<string, { columns: Record<string, { notNull: boolean }> }>;
};

function readMigration() {
  const names = readdirSync(resolve(process.cwd(), "drizzle")).filter((name) =>
    name.endsWith(migrationSuffix),
  );
  expect(names).toHaveLength(1);
  const name = names[0]!;
  return {
    name,
    source: readFileSync(resolve(process.cwd(), "drizzle", name), "utf8"),
  };
}

function readSnapshot(path: string): Snapshot {
  expect(existsSync(path)).toBe(true);
  return JSON.parse(readFileSync(path, "utf8")) as Snapshot;
}

describe("F-0117 redeem_code nullable deadline migration source", () => {
  it("contains exactly the approved DROP NOT NULL statement", () => {
    const { name, source } = readMigration();
    expect(name).toMatch(
      /^\d{14}_p1_rc_02_redeem_code_nullable_deadline\.sql$/u,
    );
    expect(source.replace(/\s+/gu, " ").trim()).toBe(
      'ALTER TABLE "redeem_code" ALTER COLUMN "redeem_deadline_at" DROP NOT NULL;',
    );
    expect(source).not.toMatch(
      /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP TABLE)\b/iu,
    );
  });

  it("changes only redeem_code.redeem_deadline_at in an appendable linear snapshot chain", () => {
    const { name } = readMigration();
    const tag = name.slice(0, -4);
    const journal = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as Journal;
    const matchingEntries = journal.entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.tag === tag);

    expect(matchingEntries).toHaveLength(1);
    const currentMatch = matchingEntries[0]!;
    expect(currentMatch.index).toBeGreaterThan(0);

    const previousEntry = journal.entries[currentMatch.index - 1];
    expect(previousEntry).toBeDefined();
    expect(previousEntry!.tag).toMatch(/^\d{14}_/u);
    expect(Number.isSafeInteger(currentMatch.entry.idx)).toBe(true);
    expect(Number.isSafeInteger(previousEntry!.idx)).toBe(true);
    expect(currentMatch.entry.idx).toBe(previousEntry!.idx + 1);

    const current = readSnapshot(
      resolve(process.cwd(), `drizzle/meta/${tag.slice(0, 14)}_snapshot.json`),
    );
    const previous = readSnapshot(
      resolve(
        process.cwd(),
        `drizzle/meta/${previousEntry!.tag.slice(0, 14)}_snapshot.json`,
      ),
    );

    expect(current.prevId).toBe(previous.id);
    expect(current.id).not.toBe(previous.id);
    expect(
      current.tables["public.redeem_code"]!.columns.redeem_deadline_at!.notNull,
    ).toBe(false);

    const normalizedCurrent = structuredClone(current);
    normalizedCurrent.id = previous.id;
    normalizedCurrent.prevId = previous.prevId;
    normalizedCurrent.tables[
      "public.redeem_code"
    ]!.columns.redeem_deadline_at!.notNull = true;
    expect(normalizedCurrent).toEqual(previous);
  });
});
