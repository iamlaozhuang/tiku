import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

function listTypeScriptSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listTypeScriptSourceFiles(path);
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [path] : [];
  });
}

describe("P1 account phone identity writer guard", () => {
  it("keeps every user or administrator account writer behind the shared locked check", () => {
    const repositoryRoot = process.cwd();
    const writerFiles = listTypeScriptSourceFiles(
      join(repositoryRoot, "src", "server"),
    )
      .filter((path) => !path.endsWith(".test.ts"))
      .filter((path) =>
        /\.insert\((?:user|admin)\)/u.test(readFileSync(path, "utf8")),
      )
      .map((path) => relative(repositoryRoot, path).split(sep).join("/"))
      .sort();

    expect(writerFiles).toEqual([
      "src/server/auth/local-session-runtime.ts",
      "src/server/repositories/admin-flow-runtime-repository.ts",
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    ]);

    writerFiles.forEach((path) => {
      const source = readFileSync(join(repositoryRoot, path), "utf8");

      expect(source).toMatch(
        /await findAccountPhoneIdentityConflictUnderLock\([\s\S]*?\.insert\((?:user|admin)\)/u,
      );
    });
  });
});
