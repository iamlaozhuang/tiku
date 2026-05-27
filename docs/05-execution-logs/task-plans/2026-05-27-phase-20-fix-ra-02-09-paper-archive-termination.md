# Phase 20 Fix RA-02-09 Paper Archive Termination Plan

**Task id:** `phase-20-fix-ra-02-09-paper-archive-termination`

## Required Context Read

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
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-02-question-paper-content.md`

## Finding

- `F-RA-02-09-001`: paper archive exists, but there is no evidence that unfinished `practice` / `mock_exam` sessions for the archived paper are immediately terminated.

## Implementation Plan

1. Add a focused regression test that proves `archivePaper` terminates unfinished `practice` and `mock_exam` sessions while preserving completed or already terminated sessions.
2. Update the paper draft repository archive path to run in one transaction:
   - archive the `paper`;
   - terminate `practice` rows with `practice_status = "in_progress"` for the paper;
   - terminate unfinished `mock_exam` rows with `exam_status` in `in_progress`, `scoring`, `scoring_partial_failed`;
   - keep historical snapshots and existing completed records intact.
3. Keep service/API contracts unchanged: `POST /api/v1/papers/{publicId}/archive` still returns the archived paper response.
4. Update evidence and queue/project state, then run the task-declared gates and local CI.

## Risk Boundaries

- No schema, migration, dependency, env, cloud, deploy, provider, real data, or auth permission-model changes.
- No destructive data operation: existing rows are status-updated to `terminated`; rows are not deleted.
- Scope limited to paper archive runtime behavior, tests, task plan/evidence/state.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-09-paper-archive-termination`
- focused unit regression
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- changed-file Prettier check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
