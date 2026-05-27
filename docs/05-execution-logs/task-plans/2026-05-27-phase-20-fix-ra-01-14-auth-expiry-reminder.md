# Phase 20 Fix RA-01-14 Auth Expiry Reminder

## Task

- Task id: `phase-20-fix-ra-01-14-auth-expiry-reminder`
- Finding: `F-RA-01-14-001`
- Goal: show students an authorization expiry reminder within 15 days, with once-per-day dismissal suppression.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-01-user-auth-authorization.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Scope

- Allowed implementation surface: student home UI and focused tests.
- Allowed governance files: task plan, evidence, `project-state.yaml`, `task-queue.yaml`.
- Blocked: auth permission model changes, backend authorization behavior changes, schema, migration, package/lockfile, env files, dependency changes, staging/prod/cloud/deploy/provider work.

## TDD Plan

1. Add a failing student home UI test for 15-day reminder display.
2. Add a failing same-day dismissal suppression test using localStorage.
3. Implement pure UI helper logic from existing effective authorization DTOs.
4. Persist dismissal date per authorization scope using localStorage only.

## Risk Defense

- No auth/session/permission model changes.
- No database or API contract changes.
- No dependency changes.
- Suppression is client-local only and does not affect effective authorization checks.
- UI continues to expose public business fields only, not internal ids or tokens.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-14-auth-expiry-reminder`
- Focused failing tests before implementation.
- `npm.cmd run test:unit -- student-home-ui.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
