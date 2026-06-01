# Phase 25 Runner Preflight And Diagnostics Evidence

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: planned `scripts/local/Invoke-FreshValidationRun.ps1`, `tests/unit/fresh-validation-runner.test.ts`, docs state/queue/plan/evidence.
- Gates: targeted unit RED pass; targeted unit GREEN pass; full unit pass; `git diff --check` pass after fixing one trailing whitespace failure; naming pass.
- Forbidden scope (`forbiddenScope`): no dependency, package/lockfile, `.env.example`, schema, migration edit, raw SQL, destructive DB, staging/prod/cloud/deploy, real provider, external service, or secret disclosure.
- Residual gaps (`residualGaps`): repeatability smoke and closeout pending.

## TDD Record

- RED command: `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`.
- RED result: failed as expected, `3 failed`, because the existing runner did not support phase-25 databaseName prefixes, `-PreflightOnly`, or stable redacted failure categories.
- GREEN command: `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`.
- GREEN result: pass, `3 passed`.
- Full unit command after implementation and trailing-whitespace fix: `npm.cmd run test:unit`.
- Full unit result: pass, `154 passed` files, `634 passed` tests.

## Secret And Safety Review

- Real `.env.local` must not be read during unit tests; tests use temporary env files with synthetic placeholder values.
- Runner output must not include full DB URL, username, password, token, provider payload, raw prompt, raw student answer, raw model response, or plaintext `redeem_code`.

## Command Results

- `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`: RED failed as expected before implementation, `3 failed`.
- `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`: GREEN pass, `3 passed`.
- `npm.cmd run test:unit`: pass, `154 passed` files, `634 passed` tests.
- `git diff --check`: first run failed on one trailing whitespace in `scripts/local/Invoke-FreshValidationRun.ps1`; fixed.
- `git diff --check`: pass after whitespace fix.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.

## Implementation Notes

- Added `-PreflightOnly`, which reads and classifies the configured local/dev target but exits before env mutation, Docker, DB creation, migration, seed, validation data prep, e2e, or build.
- Kept existing `-PlanOnly` behavior for compatibility: it still applies the databaseName target and skips external commands.
- Generalized allowed fresh databaseName prefixes from `tiku_fresh_phase24_*` to `tiku_fresh_phase<digits>_*`.
- Added redacted summary output with `mode`, `result`, `hostClass`, `databaseName`, and `failureCategory` when failing.
- Added stable failure categories for target/env checks and fixed command sequence failures.
