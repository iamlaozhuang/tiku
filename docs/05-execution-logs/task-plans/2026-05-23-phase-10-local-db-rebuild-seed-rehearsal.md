# Task Plan: phase-10-local-db-rebuild-seed-rehearsal

## Metadata

- Task id: `phase-10-local-db-rebuild-seed-rehearsal`
- Branch: `codex/phase-10-local-db-rebuild-seed-rehearsal`
- Base branch: `master`
- Created at: `2026-05-23T00:00:00+08:00`
- Task plan policy: `required`
- Human approval: user explicitly replied `好，继续推进` after the next task was identified as `phase-10-local-db-rebuild-seed-rehearsal`; this approves local `dev` Docker/PostgreSQL rebuild and seed rehearsal only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-fresh-checkout-readiness.md`

## Scope

Allowed files for this task:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-db-rebuild-seed-rehearsal.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-db-rebuild-seed-rehearsal.md`
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

## Implementation Approach

1. Confirm task claim readiness before database work.
2. Use existing project artifacts only:
   - `compose.yaml` for local Docker PostgreSQL + pgvector.
   - `drizzle/` migration files for schema application.
   - `scripts/db/Seed-DevDatabase.ps1` for deterministic local seed data.
3. Rebuild only the local `dev` Docker database volume:
   - Capture `docker compose ps` before rebuild.
   - Run `docker compose down --volumes`.
   - Run `docker compose up -d`.
   - Verify the container returns healthy.
4. Apply migrations with the existing local Drizzle CLI and `.env.local` loading behavior from `drizzle.config.ts`.
5. Run the existing dev seed script twice and compare the summary counts to prove idempotent seed rehearsal.
6. Run the task-queue validation commands:
   - `Test-AgentSystemReadiness.ps1`
   - `Invoke-QualityGate.ps1`
   - `npm.cmd run build`
   - `npm.cmd run test:e2e`
   - `Test-NamingConventions.ps1`
   - `Test-GitCompletionReadiness.ps1 -BaseBranch master`
7. Write evidence, update `project-state.yaml` and `task-queue.yaml`, commit, merge to `master`, rerun necessary gates on `master`, push, and clean up the local branch.

## Risk Controls

- Destructive operation is restricted to the local Docker PostgreSQL volume for `dev`; no staging, prod, cloud, production database, object storage, or external service is touched.
- Do not read, print, commit, or modify `.env.local`.
- Do not record database URLs, passwords, session tokens, API keys, raw prompts, raw model responses, raw answers, or real content.
- Do not modify dependencies, lockfiles, schemas, migrations, runtime source, Docker config, or seed scripts.
- If rebuild, migration, seed, build, or E2E fails, record the blocker in evidence and do not expand `allowedFiles`.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-db-rebuild-seed-rehearsal
docker compose ps
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
