# Task Plan: Phase 11 Local E2E PostgreSQL Connection Pressure Fix

## Task

Fix the P1 local validation finding where default `npm.cmd run test:e2e` can exhaust local PostgreSQL connections under Playwright parallel workers.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-system-validation.md`

## Scope

Allowed changes:

- `playwright.config.ts`
- `e2e/local-business-flow.spec.ts`
- focused unit test under `tests/unit/**`
- this task plan and evidence
- agent state and task queue status

Forbidden changes:

- No dependency, `package.json`, or lockfile changes.
- No schema, migration, or script changes.
- No `.env.local`, `.env.example`, secret, token, provider payload, raw prompt, raw answer, or raw model response access or output.
- No staging/prod connection.
- No deployment.
- No cloud, DNS, Tencent Cloud COS, public object storage URL, or external resource change.

## Root Cause

The previous local validation evidence shows:

- default `npm.cmd run test:e2e` failed with PostgreSQL `53300 too many clients already`;
- `npm.cmd run test:e2e -- --workers=1` passed 15/15;
- therefore the default local Playwright worker configuration is too aggressive for the current local database/dev-server runtime.

## TDD Plan

1. Add a unit regression test asserting Playwright local default workers are capped at `1`.
2. Run the focused test and confirm it fails with the existing config.
3. Update `playwright.config.ts` minimally.
4. Re-run the focused test, full unit tests, default E2E, build, and agent gates.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-e2e-postgres-connection-pressure-fix`
- `npm.cmd run test:unit -- tests/unit/phase-11-local-e2e-postgres-connection-pressure-fix.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Prefer a deterministic local E2E cap over changing database schema, migrations, pools, or scripts.
- Keep CI override available if CI later needs a different worker model.
- Keep E2E synchronization fixes limited to the default-suite blocker found during validation.
- Do not touch package or lockfiles.
