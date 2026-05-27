# Phase 20 Fix RA-03-01 Student Home Scope Guidance

## Task

- Task id: `phase-20-fix-ra-03-01-student-home-scope-guidance`
- Finding: `F-RA-03-01-001`
- Goal: persist the last selected student home authorization scope at runtime and strengthen no-authorization guidance toward redeem-code recovery.

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
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-03-student-experience.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Scope

- Allowed implementation surface: student home UI/runtime behavior and focused tests.
- Allowed governance files: task plan, evidence, `project-state.yaml`, `task-queue.yaml`.
- Blocked: auth permission model changes, backend authorization behavior changes, schema, migration, package/lockfile, env files, dependency changes, staging/prod/cloud/deploy/provider work.

## TDD Plan

1. Add a failing student home UI test proving runtime scope selection is persisted to localStorage and reused on remount.
2. Add or adjust a failing no-authorization guidance test only if the current state does not direct students to `/redeem-code` strongly enough without changing auth guards.
3. Implement minimal localStorage persistence for selected scope using existing public business fields.
4. Keep no-auth recovery local to UI guidance unless route-level behavior already exists.

## Risk Defense

- No auth/session/permission model changes.
- No database or API contract changes.
- No dependency changes.
- Do not persist tokens or internal ids; persist only `profession` and `level`.
- UI behavior must remain compatible with existing runtime fetch flow and tests.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-01-student-home-scope-guidance`
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
