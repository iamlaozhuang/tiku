# Task Plan: Phase 11 Protected Route Hydration Fix

## Task

Fix the P2 `ProtectedRouteGuard` hydration mismatch recorded during Phase 11 local validation.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-system-validation.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-e2e-postgres-connection-pressure-fix.md`

## Scope

Allowed changes:

- `src/components/ProtectedRouteGuard/**`
- focused unit test under `tests/unit/**`
- E2E files only if needed for evidence
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

The server render starts `ProtectedRouteGuard` in `checking`, but the client initializer reads `localStorage` and can start in `unauthorized` when there is no local token. That creates a first-frame server/client DOM mismatch: `role=status` with loader on the server versus `role=alert` with alert icon on the client.

## TDD Plan

1. Add an SSR + hydration unit regression test with empty local storage.
2. Confirm the test fails on the current implementation due hydration mismatch.
3. Make the client initial state match the server (`checking`) and move unauthorized transition into the effect.
4. Re-run focused unit, full unit, default E2E, build, and agent gates.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-protected-route-hydration-fix`
- `npm.cmd run test:unit -- tests/unit/phase-11-protected-route-hydration-fix.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Keep route protection behavior intact: missing or invalid session still redirects to `/login`.
- Do not weaken role checks.
- Do not touch auth service, schema, migrations, scripts, or environment files.
