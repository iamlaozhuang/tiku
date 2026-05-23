# Task Plan: phase-11-local-product-readiness-roleplay-run

## Task

- Task id: `phase-11-local-product-readiness-roleplay-run`
- Branch: `codex/phase-11-local-product-readiness-roleplay-run`
- Date: 2026-05-23
- Type: local product readiness role-play audit

## Human Approval

The user approved continuing with a systematic local role-play product readiness run before broader Phase 11 staging work.

This approval covers local dev role-play observation, issue classification, audit review/evidence writing, and queue/state updates only.

It does not approve cloud resources, deployment, staging/prod connections, secret/env changes, dependency changes, schema or migration changes, runtime code changes, script changes, provider calls, or production resource changes.

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
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-local-product-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-audit.md`

## Scope

Execute a local dev product readiness role-play run and record findings without fixing product code:

- Re-run task claim readiness after correcting the restored dependency state if needed.
- Use only local dev surfaces; do not connect to staging/prod, deploy, or read/output secrets.
- Cover `student`, `admin`, `content`, `unauthenticated`, and `error-state` roles/surfaces.
- Record observed bugs, half-finished buttons, non-closed flows, permission issues, and empty/error-state problems.
- Classify each issue as `P0`, `P1`, `P2`, or `P3`.
- Provide a `stagingDecision` for each issue and an overall staging entry decision.
- Keep evidence redacted: no secret, token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, or private customer/customer-like data.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
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
- No provider call beyond the already approved local dev boundary.
- No secret/env file read or output.
- Browser observations may reference route paths, roles, visible control names, summarized states, and redacted issue evidence only.

## Execution Steps

1. Confirm task claim readiness passes on `codex/phase-11-local-product-readiness-roleplay-run`.
2. Inspect available local runtime scripts and existing role/route assumptions without reading `.env.local`.
3. Confirm local Docker service status with `docker compose ps`.
4. Start or reuse the local dev server if required for browser observation.
5. Run role-play checks for unauthenticated access, student flows, admin ops, content ops, and error-state surfaces.
6. Write the audit review with issue records, severities, `stagingDecision`, and recommended owner tasks.
7. Write evidence with redacted validation results and local boundary statements.
8. Update `project-state.yaml` and `task-queue.yaml` to close the task after validation.
9. Run all task validation commands.
10. Commit, merge to `master`, validate on `master`, push `origin/master`, and clean up the merged branch.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-product-readiness-roleplay-run`
- `docker compose ps`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Initial Recovery Note

The first task claim readiness run failed because `project-state.yaml` recorded `phase-11-local-product-readiness-audit` as closed while `task-queue.yaml` still recorded that dependency as `validated`. The recovery action is limited to updating the previous task status to `closed` in `task-queue.yaml`, matching the latest merged master state.
