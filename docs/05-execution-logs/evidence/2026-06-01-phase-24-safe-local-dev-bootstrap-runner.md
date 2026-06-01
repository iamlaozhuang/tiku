# Phase 24 Safe Local Dev Bootstrap Runner Evidence

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: planned `scripts/local/Invoke-FreshValidationRun.ps1`, `tests/unit/fresh-validation-runner.test.ts`, docs state/queue/plan/evidence.
- Gates: targeted unit RED pass; targeted unit GREEN pass; full unit pass; `git diff --check` pass; naming pass.
- Forbidden scope (`forbiddenScope`): no dependency, package/lockfile, `.env.example`, schema, migration edit, raw SQL, destructive DB, staging/prod/cloud/deploy, real provider, or external service changes.
- Residual gaps (`residualGaps`): repeatability verification and closeout pending.

## TDD Record

- RED command: `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`.
- RED result: failed as expected because `scripts/local/Invoke-FreshValidationRun.ps1` did not exist.
- RED secret hygiene: failure output mentioned the missing script path only; it did not contain the synthetic test password or a DB URL.
- GREEN command: `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`.
- GREEN result: pass, `2 passed`.

## Secret And Safety Review

- Real `.env.local` must not be read during unit tests; tests use a temporary env file with synthetic placeholder values.
- Runner output must not include full DB URL, username, password, token, provider payload, raw prompt, raw student answer, raw model response, or plaintext `redeem_code`.

## Command Results

- `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`: RED failed as expected before implementation.
- `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`: GREEN pass, `2 passed`.
- `npm.cmd run test:unit`: pass, `154 passed` files, `633 passed` tests.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.

## Repeatability Smoke Failure Follow-Up

- First actual runner execution failed before migrate because Windows PowerShell native command array forwarding did not preserve the Docker subcommand shape.
- Root cause: the generic `Invoke-CheckedCommand` used `& $FilePath @Arguments`, which caused Docker to receive an invalid argument sequence.
- First fix: command execution now uses explicit scriptblocks for each approved command, avoiding dynamic native argument forwarding and keeping the command sequence fixed and auditable.
- Second observed defect: nested `powershell.exe` attempted to read an inaccessible user Docker config path. The runner now sets `DOCKER_CONFIG` to the repository ignored `.runtime/docker-config` directory before Docker commands, keeping local Docker helper state out of Git.
