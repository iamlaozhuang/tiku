import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, test } from "vitest";

const runnerPath = resolve("scripts/local/Invoke-FreshValidationRun.ps1");
const databaseUrlKey = "DATABASE" + "_URL";
const databaseUrlProtocol = "postgres" + "://";
const fakeCredential = "fake-" + "password";

function buildDatabaseUrl(host: string, databaseName = "tiku") {
  return `${databaseUrlProtocol}tiku:${fakeCredential}@${host}:5432/${databaseName}`;
}

function buildEnvContent(host: string, options: { quoted?: boolean } = {}) {
  const value = buildDatabaseUrl(host);
  return options.quoted === false
    ? `${databaseUrlKey}=${value}\n`
    : `${databaseUrlKey}="${value}"\n`;
}

function runRunner(
  envContent: string,
  databaseName: string,
  options: {
    extraArgs?: string[];
    mode?: "plan" | "preflight" | "full";
    pathPrefix?: string;
  } = {},
) {
  const tempDirectory = mkdtempSync(join(tmpdir(), "tiku-fresh-runner-"));
  const envPath = join(tempDirectory, ".env.local");
  writeFileSync(envPath, envContent, "utf8");
  const modeArguments =
    options.mode === "full"
      ? []
      : [options.mode === "preflight" ? "-PreflightOnly" : "-PlanOnly"];
  const childEnv = { ...process.env };
  const pathKey =
    Object.keys(childEnv).find((key) => key.toLowerCase() === "path") ?? "PATH";

  if (options.pathPrefix) {
    childEnv[pathKey] =
      `${options.pathPrefix}${delimiter}${childEnv[pathKey] ?? ""}`;
  }

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
      ...modeArguments,
      ...(options.extraArgs ?? []),
    ],
    {
      cwd: resolve("."),
      encoding: "utf8",
      env: childEnv,
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

function createCommandShim(commandName: string) {
  const shimDirectory = mkdtempSync(join(tmpdir(), "tiku-command-shim-"));
  writeFileSync(
    join(shimDirectory, `${commandName}.cmd`),
    "@echo off\r\necho fake-command-invoked\r\nexit /b 42\r\n",
    "utf8",
  );
  return shimDirectory;
}

describe("fresh validation runner", () => {
  test("rewrites only the local databaseName and prints a redacted summary", () => {
    const result = runRunner(
      buildEnvContent("127.0.0.1"),
      "tiku_fresh_phase25_unit_001",
    );

    expect(result.status).toBe(0);
    expect(result.updatedEnv).toContain(
      buildDatabaseUrl("127.0.0.1", "tiku_fresh_phase25_unit_001"),
    );
    expect(result.stdout).toContain("hostClass=loopback");
    expect(result.stdout).toContain("databaseName=tiku_fresh_phase25_unit_001");
    expect(result.stdout).not.toContain("fake-password");
    expect(result.stdout).not.toContain("postgres://");
    expect(result.stderr).not.toContain("fake-password");
  });

  test("blocks non-loopback database targets without leaking the URL", () => {
    const result = runRunner(
      buildEnvContent("db.example.com", { quoted: false }),
      "tiku_fresh_phase25_unit_002",
    );

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain("result=failed");
    expect(`${result.stdout}${result.stderr}`).toContain(
      "failureCategory=target_not_local_dev",
    );
    expect(`${result.stdout}${result.stderr}`).not.toContain("fake-password");
    expect(`${result.stdout}${result.stderr}`).not.toContain("postgres://");
  });

  test("preflight validates the target without mutating the env file", () => {
    const envContent = buildEnvContent("localhost");
    const result = runRunner(envContent, "tiku_fresh_phase25_unit_003", {
      mode: "preflight",
    });

    expect(result.status).toBe(0);
    expect(result.updatedEnv).toBe(envContent);
    expect(result.stdout).toContain("mode=preflight");
    expect(result.stdout).toContain("result=pass");
    expect(result.stdout).toContain("hostClass=loopback");
    expect(result.stdout).toContain("databaseName=tiku_fresh_phase25_unit_003");
    expect(result.stdout).not.toContain("fake-password");
    expect(result.stdout).not.toContain("postgres://");
    expect(result.stdout).not.toContain("docker compose");
    expect(result.stdout).not.toContain("reviewed Drizzle migrate");
  });

  test("blocks full migration and seed execution without explicit local DB mutation approval", () => {
    const envContent = buildEnvContent("127.0.0.1");
    const result = runRunner(envContent, "tiku_fresh_phase25_unit_004", {
      mode: "full",
      pathPrefix: createCommandShim("docker"),
    });
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).not.toBe(0);
    expect(result.updatedEnv).toBe(envContent);
    expect(output).toContain("mode=full");
    expect(output).toContain("failureCategory=db_mutation_approval_missing");
    expect(output).not.toContain("fake-command-invoked");
    expect(output).not.toContain("docker compose");
    expect(output).not.toContain("reviewed Drizzle migrate");
    expect(output).not.toContain("dev seed");
    expect(output).not.toContain("fake-password");
    expect(output).not.toContain("postgres://");
  });

  test("allows full mode to reach the first external command only after explicit local DB mutation approval", () => {
    const result = runRunner(
      buildEnvContent("127.0.0.1"),
      "tiku_fresh_phase25_unit_005",
      {
        extraArgs: [
          "-AllowLocalDbMutation",
          "-ConfirmedDatabaseName",
          "tiku_fresh_phase25_unit_005",
        ],
        mode: "full",
        pathPrefix: createCommandShim("docker"),
      },
    );
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).not.toBe(0);
    expect(result.updatedEnv).toContain(
      buildDatabaseUrl("127.0.0.1", "tiku_fresh_phase25_unit_005"),
    );
    expect(output).toContain("failureCategory=docker_unavailable");
    expect(output).toContain("Running: docker compose up tiku-postgres");
    expect(output).toContain("fake-command-invoked");
    expect(output).not.toContain("reviewed Drizzle migrate");
    expect(output).not.toContain("dev seed");
    expect(output).not.toContain("fake-password");
    expect(output).not.toContain("postgres://");
  });
});
