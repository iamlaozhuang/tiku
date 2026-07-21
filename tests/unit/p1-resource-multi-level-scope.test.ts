import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "drizzle/20260720173000_p1_rc_03_resource_multi_level_scope.sql",
);
const runtimeRepositoryPath = join(
  process.cwd(),
  "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
);
const recommendationRepositoryPath = join(
  process.cwd(),
  "src/server/repositories/knowledge-recommendation-runtime-repository.ts",
);
const snapshotPath = join(
  process.cwd(),
  "drizzle/meta/20260720173000_snapshot.json",
);

describe("F-0088 resource multi-level persistence", () => {
  it("adds an explicit level list without converting legacy null into general coverage", () => {
    expect(existsSync(migrationPath)).toBe(true);

    const migration = readFileSync(migrationPath, "utf8");
    expect(migration).toContain('ADD COLUMN "level_list" integer[]');
    expect(migration).toContain(
      'SET "level_list" = ARRAY["level"] WHERE "level" IS NOT NULL',
    );
    expect(migration).not.toMatch(/COALESCE\s*\(\s*"level_list"/i);
    expect(migration).not.toMatch(/WHERE\s+"level"\s+IS\s+NULL/i);

    const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as {
      tables: Record<
        string,
        {
          columns: Record<string, { type: string; notNull: boolean }>;
          indexes: Record<string, { method: string }>;
        }
      >;
    };
    expect(snapshot.tables["public.resource"].columns.level_list).toEqual(
      expect.objectContaining({ type: "integer[]", notNull: false }),
    );
    expect(
      snapshot.tables["public.resource"].indexes.idx_resource_level_list,
    ).toEqual(expect.objectContaining({ method: "gin" }));
  });

  it("uses explicit empty arrays and containment while excluding null coverage", () => {
    const runtimeRepository = readFileSync(runtimeRepositoryPath, "utf8");
    const recommendationRepository = readFileSync(
      recommendationRepositoryPath,
      "utf8",
    );

    for (const source of [runtimeRepository, recommendationRepository]) {
      expect(source).toContain("cardinality(${resource.level_list}) = 0");
      expect(source).toContain("${resource.level_list} @> ARRAY[${");
      expect(source).not.toContain(
        "or(isNull(resource.level), eq(resource.level",
      );
    }
  });
});
