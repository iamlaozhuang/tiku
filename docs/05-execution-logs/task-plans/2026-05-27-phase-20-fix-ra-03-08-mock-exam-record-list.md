# Phase 20 Fix RA-03-08 Mock Exam Record List Plan

**Task id:** `phase-20-fix-ra-03-08-mock-exam-record-list`

**Branch:** `codex/phase-20-fix-ra-03-08-mock-exam-record-list`

## Scope

Fix `F-RA-03-08-001`: the student `mock_exam` record list is currently report-backed, may omit `terminated` attempts, and sorts by report `generatedAt` instead of attempt `startedAt`.

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
- Preserve REST response envelope, camelCase DTO fields, and `publicId` URL boundary.
- Keep the change inside the existing service/repository/UI/test surfaces unless implementation discovery proves a blocked gate is required.

## Implementation Approach

1. Add a focused failing test that proves the list includes `terminated`, `scoring`, `scoring_partial_failed`, and `completed` attempt records and orders by `startedAt`.
2. Inspect existing `exam_report`, `mock_exam`, and student UI boundaries before choosing the smallest runtime change.
3. Prefer existing tables and DTO contracts; do not introduce schema or migration work.
4. Update UI/tests only if the runtime contract exposes a new field such as `startedAt` or changes sort semantics.
5. Run task validation commands and local CI gates, then write evidence before commit/merge.

## Risk Defense

- If completing the fix requires database migration, auth permission model changes, env/secrets, dependency changes, provider/cloud work, or destructive data operations, stop implementation and record an approval request instead.
- If the `exam_report` contract conflict cannot be resolved without a new API surface, keep the scope bounded to source/tests and record residual product/API boundary evidence.

## Planned Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-08-mock-exam-record-list`
- Focused unit tests for the record list behavior.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- Changed-file Prettier check.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build` if implementation touches browser, routing, or build surface.
