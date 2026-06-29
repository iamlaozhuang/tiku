# Task Plan: Full Acceptance Personal Advanced Student Workflow

## Status

- Task id: `full-acceptance-personal-advanced-student-workflow-2026-06-29`
- Status: `closed`
- Branch: `codex/personal-advanced-student-acceptance-20260629`
- Created at: `2026-06-29T03:41:51-07:00`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Goal

Verify the owner-facing `personal_advanced_student` learner workflow for advanced AI learning surfaces and generated
content practice/feedback boundaries, using localhost-only browser evidence and no Provider execution.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-personal-advanced-student-workflow.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-personal-advanced-student-workflow.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-personal-advanced-student-workflow.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-personal-advanced-student-workflow.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-personal-advanced-student-workflow.md`

## Blocked Files And Gates

- `.env*`, package/lockfiles, `src/**`, `tests/**`, `src/db/schema/**`, `drizzle/**`, `migrations/**`, `seed/**`,
  `scripts/**`, `e2e/**`, reports, `.next/**`.
- No direct DB access, schema/migration/seed, source/test/package changes, Provider execution/configuration, staging,
  production, deploy, PR, force-push, final Pass, release readiness, or Cost Calibration Gate.

## Evidence Rules

Allowed evidence: role labels, route labels, workflow labels, status labels, count summaries, failure classes, command
names, and commit SHA.

Forbidden evidence: credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents,
connection strings, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`,
Provider payloads, prompts, raw AI input/output, and full generated content.

## Execution Steps

1. Confirm local route health and perform safe session switching for `personal_advanced_student`.
2. Verify shared learner routes and backend denial boundaries.
3. Verify learner `AI出题` discoverability, controls, validation/safe unavailable states, and no Provider execution.
4. Verify learner `AI组卷` discoverability, controls, validation/safe unavailable states, and no Provider execution.
5. Verify generated-content practice/feedback affordances or safe unavailable states without recording full content.
6. Write redacted evidence, audit review, and acceptance summary.
7. Run scoped formatting, `git diff --check`, Module Run v2 pre-commit/closeout/pre-push checks.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Execution Result

- Steps 1-6 executed.
- Result: `blocked_ai_generation_actions_and_generated_practice_feedback_missing`.
- Repair task seeded: `repair-personal-advanced-student-ai-generation-actions-2026-06-29`.
- Steps 7-8 remain required for this blocker-capture task closeout.

## Risks

- Existing localhost session may be a different role; role switch must not inspect or record session material.
- AI controls were visible, but generation/practice actions were unavailable; this is recorded as a major workflow gap.
- Any Provider execution, direct DB access, source repair, or generated-content persistence repair is out of scope for
  this browser-only acceptance task and must become a separate queued task.
