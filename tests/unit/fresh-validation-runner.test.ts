import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, test } from "vitest";

const runnerPath = resolve("scripts/local/Invoke-FreshValidationRun.ps1");

function runRunner(envContent: string, databaseName: string) {
  const tempDirectory = mkdtempSync(join(tmpdir(), "tiku-fresh-runner-"));
  const envPath = join(tempDirectory, ".env.local");
  writeFileSync(envPath, envContent, "utf8");

  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      runnerPath,
      "-EnvPath",
      envPath,
      "-DatabaseName",
      databaseName,
      "-PlanOnly",
    ],
    {
      cwd: resolve("."),
      encoding: "utf8",
    },
  );

  return {
    envPath,
    stderr: result.stderr,
    stdout: result.stdout,
    status: result.status,
    updatedEnv: readFileSync(envPath, "utf8"),
  };
}

describe("fresh validation runner", () => {
  test("rewrites only the local databaseName and prints a redacted summary", () => {
    const result = runRunner(
      'DATABASE_URL="postgres://tiku:fake-password@127.0.0.1:5432/tiku"\n',
      "tiku_fresh_phase24_unit_001",
    );

    expect(result.status).toBe(0);
    expect(result.updatedEnv).toContain(
      "postgres://tiku:fake-password@127.0.0.1:5432/tiku_fresh_phase24_unit_001",
    );
    expect(result.stdout).toContain("hostClass=loopback");
    expect(result.stdout).toContain("databaseName=tiku_fresh_phase24_unit_001");
    expect(result.stdout).not.toContain("fake-password");
    expect(result.stdout).not.toContain("postgres://");
    expect(result.stderr).not.toContain("fake-password");
  });

  test("blocks non-loopback database targets without leaking the URL", () => {
    const result = runRunner(
      "DATABASE_URL=postgres://tiku:fake-password@db.example.com:5432/tiku\n",
      "tiku_fresh_phase24_unit_002",
    );

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      "Blocked: DATABASE_URL host is not local/dev loopback.",
    );
    expect(`${result.stdout}${result.stderr}`).not.toContain("fake-password");
    expect(`${result.stdout}${result.stderr}`).not.toContain("postgres://");
  });
});
