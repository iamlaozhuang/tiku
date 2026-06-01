# Phase 24 Fresh Validation Orchestration Design

## Goal

Turn the Phase 23 fresh local/dev validation path into a minimal, auditable, rerunnable, and secret-safe local/dev operation without expanding product behavior.

## Scriptable Steps

These steps are safe to automate in the next subtask when all preflight checks pass:

1. Confirm `.env.local` exists without printing its contents.
2. Parse only the `DATABASE_URL` database target classification needed for safety checks.
3. Confirm the target host is loopback/local-dev, and record only `hostClass` and `databaseName`.
4. Replace only the databaseName segment in `.env.local` with a new `tiku_fresh_phase24_*` target, preserving credentials without printing them.
5. Start or confirm the local Docker Compose PostgreSQL service with non-destructive `docker compose up -d tiku-postgres`.
6. Create the fresh database by name through the local container toolchain.
7. Run the reviewed Drizzle migrate workflow with the existing local package.
8. Run `scripts/db/Seed-DevDatabase.ps1`.
9. Run `scripts/local/Invoke-ValidationDataPrep.ps1`.
10. Run `npm.cmd run test:e2e`.
11. Run `npm.cmd run build`.
12. Emit a compact redacted summary: `hostClass`, `databaseName`, command names, pass/fail, and failure summaries.

## Approval-Gated Or Manual Steps

These remain outside the runner unless a later task explicitly approves them:

- dependency add/remove/upgrade or package/lockfile changes;
- `.env.example` changes;
- schema or migration edits;
- migration generation;
- staging/prod/cloud/deploy work;
- real provider or external service calls;
- force push or destructive Git operations;
- any change that would expose credentials, provider payloads, raw prompts, raw student answers, raw model responses, or plaintext `redeem_code`.

## Stop-The-Line Conditions

The runner or playbook must stop and record a blocked gate if it needs any of these:

- raw SQL;
- `drizzle-kit push`;
- migration table repair;
- DB reset, drop, truncate, delete, volume reset, or destructive data operation;
- non-loopback/staging/prod/cloud database target;
- missing `.env.local` or missing `DATABASE_URL`;
- malformed `DATABASE_URL` that cannot be safely rewritten by databaseName only;
- dependency, package, lockfile, schema, migration, or runtime source changes;
- evidence output that would include full DB URL, credentials, token, provider payload, raw prompt, raw student answer, raw model response, or plaintext `redeem_code`.

## Runner Contract For Next Subtask

- Entrypoint: `scripts/local/Invoke-FreshValidationRun.ps1`.
- Required parameter: optional `-DatabaseName`; default must be a fresh `tiku_fresh_phase24_yyyyMMddHHmmss` value.
- Test helper: provide a no-command or plan-only mode so unit tests can verify databaseName replacement and redaction without connecting to Docker or DB.
- Safety checks:
  - hostClass must be loopback/local-dev;
  - databaseName must use an approved fresh prefix;
  - `.env.local` must not be printed;
  - failure summaries must redact secret-like values.
- Command order:
  1. non-destructive Docker Compose service readiness;
  2. fresh database creation;
  3. reviewed Drizzle migrate;
  4. dev seed;
  5. validation data prep;
  6. full e2e;
  7. build.

## Residual Risk

- The runner will modify local `.env.local` databaseName as explicitly approved for this batch. It must not commit or print `.env.local`.
- Creating a fresh local database is non-destructive but can fail if Docker is unavailable or the database name already exists; failures should stop downstream commands.
- Full e2e remains runtime-dependent and may require the local dev server behavior defined by Playwright configuration.
