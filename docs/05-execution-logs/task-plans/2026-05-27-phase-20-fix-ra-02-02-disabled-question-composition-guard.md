# Phase 20 Fix RA-02-02 Disabled Question Composition Guard Plan

**Task id:** `phase-20-fix-ra-02-02-disabled-question-composition-guard`

**Branch:** `codex/phase-20-fix-ra-02-02-disabled-question-composition-guard`

## Scope

Fix `F-RA-02-02-001`: disabled questions must not be selectable for new draft-paper composition through the API.

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
- Do not add dependencies, run migrations, connect to staging/prod/cloud, or perform destructive data operations.
- Preserve copied published/archived paper behavior: disabled source questions already present in source papers remain included and marked in copied drafts.
- Only block newly adding disabled source questions to draft papers.

## Implementation Approach

1. Confirm the RA-02 audit finding and US-02-02 acceptance criteria.
2. Add a focused failing regression test for disabled source question composition.
3. Tighten only the new-composition source-question lookup to require `question.status = available`.
4. Keep paper copy lookup unrestricted so the RA-02-10 disabled-source marker behavior remains intact.
5. Run task validation commands, local CI gates, and record evidence before commit/merge.

## Risk Defense

- No schema or migration is needed because `question.status` already exists.
- No authorization model changes are needed; this task enforces existing question lifecycle rules.
- If implementation requires database/schema changes, stop and record the `database_migration` approval blocker instead.

## Planned Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-02-disabled-question-composition-guard`
- Focused unit tests for disabled question composition guard.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
