# Task Plan: phase-11-staging-entry-fix-scope

## Task

- Task id: `phase-11-staging-entry-fix-scope`
- Branch: `codex/phase-11-staging-entry-fix-scope`
- Date: 2026-05-24
- Type: staging entry fix scope planning

## Human Approval

The user requested to continue after `phase-11-local-product-readiness-roleplay-run`.

This approval covers local planning, staging-entry fix scope definition, queue/state updates, and evidence only.

It does not approve cloud resources, deployment, staging/prod connections, secret/env changes, dependency changes, schema or migration changes, runtime code changes, script changes, provider calls, or production resource changes.

High-risk implementation tasks, especially `auth_permission_model`, remain blocked until explicit human approval is recorded in the task plan and evidence for that implementation task.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`

## Scope

Define a bounded staging-entry fix scope from the local role-play findings:

- Classify which findings must block staging entry.
- Decide which fixes should be in the first staging-entry fix package.
- Decide which observations can be named known limitations.
- Register follow-up implementation/planning tasks with explicit risk gates.
- Keep all implementation tasks blocked if they require high-risk approval not yet granted.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-entry-fix-scope.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-entry-fix-scope.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-fix-scope.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`
- `scripts/**`

## Risk Controls

- No application source edits.
- No dependency, package, or lockfile edits.
- No database schema, migration, seed, script, or destructive data operation.
- No staging/prod connection.
- No cloud resource creation or deployment.
- No provider calls.
- No secret/env file read or output.
- Implementation tasks involving `src/**`, auth route guards, runtime flows, or permissions remain separate and require their own task claim readiness.

## Execution Steps

1. Create the task entry in `task-queue.yaml` with allowed/blocked files and validation commands.
2. Run `Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-entry-fix-scope`.
3. Write a staging-entry fix scope review mapping each role-play finding to a decision.
4. Register follow-up tasks for approved planning boundaries and blocked implementation candidates.
5. Update `project-state.yaml` and task queue status for this planning task.
6. Run validation commands and append results to evidence.
7. Commit, merge to `master`, validate on `master`, push `origin/master`, and clean up the merged branch if all gates pass.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-entry-fix-scope`
- `Select-String -Path 'docs\05-execution-logs\audits-reviews\2026-05-24-phase-11-staging-entry-fix-scope.md' -Pattern 'LPR-RP-001|P0|block_staging_entry|human approval|known limitation'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
