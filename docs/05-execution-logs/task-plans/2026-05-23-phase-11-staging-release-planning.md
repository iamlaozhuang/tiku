# Task Plan: phase-11-staging-release-planning

## Metadata

- Task id: `phase-11-staging-release-planning`
- Branch: `codex/phase-11-staging-release-planning`
- Base: `master`
- Created at: `2026-05-23T22:49:57+08:00`
- Human approval: User approved starting Phase 11 staging/release planning only; no staging/prod connection, deployment, cloud resource, or secret change is approved.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-mvp-acceptance-rerun-closeout.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Create a Phase 11 planning contract and queue seed for staging/release planning without performing implementation, deployment, cloud provisioning, or secret changes.

Allowed files:

- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/05-execution-logs/task-plans/2026-05-23-phase-11-staging-release-planning.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-staging-release-planning.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`
- `scripts/**`

## Implementation Plan

1. Run `Test-TaskClaimReadiness.ps1` after queue seeding.
2. Add `phase-11-staging-release-planning-contract.md` with:
   - explicit non-goals for cloud resources, deployment, staging/prod connections, and secret changes;
   - environment boundary checklist for `staging` and `prod`;
   - required human approvals before any future resource, secret, migration, or deployment task;
   - proposed Phase 11 task ordering.
3. Update `mvp-roadmap.md` with a Phase 11 section.
4. Update project state and task queue to close this planning task and leave the next implementation step gated by approval.
5. Write evidence with validation command results and safety boundaries.
6. Run required validation commands.
7. Commit, merge to `master`, rerun necessary master checks, push, and clean the short-lived branch.

## Risk Controls

- No `.env.local` reads or writes.
- No `.env.example` changes.
- No package, lockfile, runtime, migration, schema, script, deployment, or cloud configuration changes.
- No staging/prod database, provider, object storage, or deployment connection.
- Evidence must not contain secrets, URLs containing credentials, provider payloads, or production resource identifiers.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-release-planning
Select-String -Path 'docs\02-architecture\interfaces\phase-11-staging-release-planning-contract.md' -Pattern 'no cloud resources|no deployment|human approval|staging|prod'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
