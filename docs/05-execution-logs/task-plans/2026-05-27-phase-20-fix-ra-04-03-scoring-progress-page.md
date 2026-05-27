# Phase 20 Fix RA-04-03 Scoring Progress Page Plan

**Task id:** `phase-20-fix-ra-04-03-scoring-progress-page`

**Branch:** `codex/phase-20-fix-ra-04-03-scoring-progress-page`

## Scope

Fix `F-RA-04-03-001`: scoring progress page behavior/evidence is incomplete.

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
- Keep scoring/progress verification local and deterministic unless the queue explicitly permits otherwise.
- Preserve REST response envelope, camelCase DTO fields, public identifiers, and existing authorization boundaries.

## Implementation Approach

1. Inspect RA-04 audit finding, current scoring/progress routes, services, UI, and tests.
2. Add focused failing tests for the missing scoring progress behavior.
3. Implement the smallest low-risk change within existing route/service/UI surfaces.
4. If the fix requires a real provider, model config/env change, schema migration, dependency change, auth permission change, or deploy/cloud work, stop and record the high-risk approval blocker instead.
5. Run task validation commands and local CI gates; write evidence before commit/merge.

## Risk Defense

- `browser_runtime` means browser/build verification may be required.
- Real AI provider and env/secret work remain blocked; this task must not read `.env.local` or call staging/prod/cloud/provider endpoints.

## Planned Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-04-03-scoring-progress-page`
- Focused unit/UI tests for scoring progress behavior.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
