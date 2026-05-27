# Phase 20 Fix RA-03-09 Mistake Book Completion Plan

**Task id:** `phase-20-fix-ra-03-09-mistake-book-completion`

**Branch:** `codex/phase-20-fix-ra-03-09-mistake-book-completion`

## Scope

Fix `F-RA-03-09-001`: `mistake_book` core lifecycle exists, but manual favorite from arbitrary objective questions and exact `questionType` pagination evidence are incomplete.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Constraints

- Do not touch `.env.local`, `.env.example`, package or lock files, `src/db/schema/**`, `drizzle/**`, or `scripts/**`.
- Do not add dependencies, run migrations, connect to staging/prod/cloud, or call real providers.
- Keep `ai_runtime` local-only; real provider and secret/env work remain blocked.
- Preserve REST response envelope, camelCase DTO fields, and public identifier boundaries.

## Implementation Approach

1. Inspect current `mistake_book` contracts, repository, service, routes, UI, and tests.
2. Add a focused failing test for exact `questionType` pagination and, if supported by existing contracts, manual favorite behavior without schema changes.
3. Implement only the smallest low-risk change inside existing surfaces.
4. If manual favorite requires a new data model, migration, auth permission model change, dependency, env, or provider call, stop and record the approval blocker instead.
5. Run task validation commands and local CI gates, then write evidence before commit/merge.

## Risk Defense

- The task may mention AI explanation entry, but this run will not call real providers or read provider/env secrets.
- Schema/migration and dependency changes are not approved. If required, the task must be skipped or converted to a blocked approval request.

## Planned Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-09-mistake-book-completion`
- Focused unit tests for `mistake_book` list/favorite behavior.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build` if implementation touches frontend, route, browser, or build surface.
