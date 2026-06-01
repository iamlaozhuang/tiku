# Phase 24 Fresh DB Repeatability Verification Evidence

## Summary

- Result: pass.
- Scope: local_verification.
- Changed surfaces: `.env.local` databaseName may be updated by approved local runner and remains untracked; evidence/state/queue/plan docs.
- Gates: fresh runner pass after local Docker permission escalation; `git diff --check` pass.
- Forbidden scope (`forbiddenScope`): no `.env.example`, dependency, package/lockfile, schema, migration edit, raw SQL, `drizzle-kit push`, migration table repair, destructive DB, staging/prod/cloud/deploy, real provider, or external service.
- Residual gaps (`residualGaps`): closeout gates and final security/readiness audit pending.

## Target Classification

- Intended environment: `dev`.
- hostClass: `loopback`.
- databaseName: `tiku_fresh_phase24_20260601_001`.
- Secret handling: runner may read and update `.env.local` databaseName only; evidence must not record the full URL, username, password, token, provider payload, raw prompt, raw student answer, raw model response, or plaintext `redeem_code`.

## Command Results

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-FreshValidationRun.ps1 -DatabaseName tiku_fresh_phase24_20260601_001`: failed before migrate. Runner printed `hostClass=loopback` and `databaseName=tiku_fresh_phase24_20260601_001`, then failed at `docker compose up tiku-postgres` because native command array forwarding dropped Docker subcommand arguments and Docker saw an invalid `-d` flag. No secret values or DB URL were printed. Classified as runner implementation defect, not a DB blocked gate.
- Retry after scriptblock fix: failed again before migrate at Docker CLI startup with access denied on `C:\Users\jzzhu\.docker\config.json`; no secret values or DB URL were printed. Classified as runner local Docker config isolation defect, not a DB blocked gate.
- Retry after local Docker config isolation: failed before migrate with Docker API permission denied inside sandbox. Reran the same command with approved escalation because local Docker API access was required for the approved local/dev verification.
- Escalated runner execution: pass.
  - `docker compose up tiku-postgres`: pass.
  - fresh database creation: pass, `databaseName=tiku_fresh_phase24_20260601_001`.
  - reviewed Drizzle migrate: pass, migrations applied successfully.
  - dev seed: pass, redacted safe counts recorded by script output.
  - validation data prep: pass, `1 passed`.
  - full e2e: pass, `27 passed`.
  - build: pass.
  - final runner summary: `hostClass=loopback`, `databaseName=tiku_fresh_phase24_20260601_001`.
- `git diff --check`: pass.

## Escalation Record

- Escalation reason: sandboxed command could not access the local Docker API needed for the approved local/dev PostgreSQL helper.
- Approved command prefix: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-FreshValidationRun.ps1`.
- Scope: local/dev only; no staging/prod/cloud/deploy/real provider/external service.
