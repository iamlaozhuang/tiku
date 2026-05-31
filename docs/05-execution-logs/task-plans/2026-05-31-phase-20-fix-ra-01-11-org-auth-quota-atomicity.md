# Task Plan: phase-20-fix-ra-01-11-org-auth-quota-atomicity

## Required Reading

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Scope

- Task id: `phase-20-fix-ra-01-11-org-auth-quota-atomicity`
- Branch: `codex/phase-20-fix-ra-01-11-org-auth-quota-atomicity`
- Task kind: `implementation`
- Finding source: Phase 18 RA-01 audit finding `F-RA-01-11-001`
- Allowed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, `docs/05-execution-logs/task-plans/**`, `docs/05-execution-logs/evidence/**`, `docs/05-execution-logs/audits-reviews/**`, `src/**`, `tests/**`, `e2e/**`
- Blocked files: `.env.local`, `.env.example`, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`

## Implementation Plan

1. Add a RED unit test proving `org_auth` creation must keep scope locking, overlap recheck, quota count, `org_auth` insert, and `org_auth_organization` insert in one repository-level atomic flow.
2. Move the repository `createOrgAuth` mutation into a transaction.
3. Acquire a deterministic PostgreSQL transaction advisory lock for the requested `profession` / `level` / covered organization scope before overlap and quota checks.
4. Recheck overlapping active `org_auth` records inside the locked transaction.
5. Count active employees and insert `org_auth` plus covered organizations inside the same transaction.
6. Keep route/service API responses unchanged: standard `{ code, message, data, pagination? }`, camelCase DTOs, public identifiers only.

## Risk Gate

- Dependency change: not approved and not needed.
- Database schema or migration: not approved and not needed.
- Auth or permission model: approved by user for this batch; existing `super_admin` / `ops_admin` mutation boundary remains.
- Secret or environment change: not approved; do not read or modify `.env.local` or `.env.example`.
- Destructive data operation: no destructive operation; local runtime mutation is limited to task behavior.
- Deploy, PR, force push: not approved. Push is approved only for `origin master` after local merge per user instruction.

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-11-org-auth-quota-atomicity.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-20-ra-06-04-org-auth-detail-route-alignment.test.ts
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run test:e2e
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

`npm.cmd run build` is planned to be skipped unless the implementation unexpectedly touches frontend page, route, build config, or render behavior.

## Evidence

- Evidence path: `docs/05-execution-logs/evidence/phase-20-fix-ra-01-11-org-auth-quota-atomicity.md`
- Security review: required because the task changes `org_auth` authorization mutation behavior.
- Residual risk target: none beyond local runtime behavior; no dependency, schema, env, cloud, deploy, or real provider scope.
