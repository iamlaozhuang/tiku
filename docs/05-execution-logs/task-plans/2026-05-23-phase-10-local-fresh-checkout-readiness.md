# Task Plan: phase-10-local-fresh-checkout-readiness

## Metadata

- Task id: `phase-10-local-fresh-checkout-readiness`
- Branch: `codex/phase-10-local-fresh-checkout-readiness`
- Base branch: `master`
- Created at: `2026-05-23T00:00:00+08:00`
- Task plan policy: `required`

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
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-planning-and-queue-seeding.md`

## Scope

Allowed files for this task:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-fresh-checkout-readiness.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-fresh-checkout-readiness.md`
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

1. Confirm the repository starts from a clean `master` baseline and create the short-lived task branch before any edits.
2. Run `Test-TaskClaimReadiness.ps1` for this task and stop if the queue dependency or allowed-file gate fails.
3. Record local reproducibility signals without changing dependencies, source, schema, migrations, or environment files:
   - Git branch and cleanliness.
   - Docker/PostgreSQL container state.
   - Node/npm availability and local dependency script availability through declared validation commands.
   - Quality gate, build, E2E, naming convention, and git completion readiness results.
4. Write evidence with exact command outcomes and explicitly scope the conclusion to the local `dev` boundary.
5. Update `project-state.yaml` and `task-queue.yaml` only after the declared validation commands have passed.
6. Commit the approved docs/state changes, merge back to `master` only if gates pass, rerun necessary gates on `master`, record post-merge evidence, push `origin/master`, and delete the merged short-lived branch.

## Risk Controls

- Do not modify `package.json`, lockfiles, `.env.example`, `.env.local`, `src/**`, or `drizzle/**`.
- Do not run dependency introduction, dependency upgrade, production deployment, staging deployment, real provider calls, or production-resource operations.
- Do not record secrets, API keys, passwords, session tokens, raw prompts, raw model responses, or real content excerpts.
- If Docker/PostgreSQL or any validation command fails, record the blocker in evidence and do not expand `allowedFiles`.
- Treat this as fresh-checkout readiness evidence, not as a full database rebuild or real-content/provider rehearsal; those are later queue tasks.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-fresh-checkout-readiness
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
