# Task Plan: phase-11-staging-entry-student-practice-mock-entry

## Task

- Task id: `phase-11-staging-entry-student-practice-mock-entry`
- Branch: `codex/phase-11-staging-entry-student-practice-mock-entry`
- Date: 2026-05-24
- Goal: close `LPR-RP-003` by ensuring student `practice` and `mock_exam` entry from a paper public id reaches actionable answer flows or an explicit recoverable state.

## Human Approval

The user explicitly approved continuing to fix all local role-play findings after prior fixes were merged and pushed to `origin/master`.

This task remains local dev only. It does not approve staging/prod connection, deployment, cloud resource changes, secret/env changes, package or lockfile changes, schema/migration changes, or provider calls.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-entry-fix-scope.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-entry-student-practice-mock-entry.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-student-practice-mock-entry.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/app/(student)/**`
- `src/features/student/**`
- `src/server/services/**`
- `tests/unit/**`
- `e2e/**`

Blocked files remain blocked: package/lock files, `.env.*`, `drizzle/**`, and `scripts/**`.

## Investigation And TDD Plan

1. Reproduce browser behavior for logged-in student direct links from `/home` into `practice` and `mock_exam`.
2. Add focused tests for actionable entry:
   - `practice?paperPublicId=...` renders an answer panel and submit control;
   - `mock-exam?paperPublicId=...` renders an answer panel and save/submit controls.
3. If a test fails, implement the smallest fix in the student route/runtime layer.
4. If behavior is already fixed by the preceding auth guard and existing runtime path, record that with fresh browser evidence and close this task as validation-only without changing runtime code.
5. Keep error-state improvements for missing objects separate unless needed to make the entry recoverable.

## Risk Controls

- Do not record credentials, tokens, Authorization headers, raw paper/question content beyond bounded UI labels already present in tests.
- Do not change server schema or API contracts.
- Keep fixes limited to student `practice`/`mock_exam` entry behavior.
