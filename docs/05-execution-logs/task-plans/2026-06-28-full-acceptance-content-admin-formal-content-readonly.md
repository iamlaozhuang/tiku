# Content Admin Formal Content Read-Only Acceptance Plan

## Task

- Task: `full-acceptance-content-admin-formal-content-readonly-2026-06-28`
- Branch: `codex/content-admin-formal-content-readonly-20260628`
- Status: in_progress
- Goal slice: redacted read-only coverage for the `content_admin.formal_content` owner-facing checklist row.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- Relevant existing source/tests for content formal surfaces, read-only only.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-content-admin-formal-content-readonly.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-content-admin-formal-content-readonly.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-content-admin-formal-content-readonly.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-content-admin-formal-content-readonly.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-content-admin-formal-content-readonly.md`

## Blocked Files And Actions

- `.env*`, package/lockfiles, `src/**`, `tests/**`, `drizzle/**`, `migrations/**`, `seed/**`, `e2e/**`, `scripts/**`,
  private fixture directories, browser screenshots/traces/raw DOM artifacts, DB rows, Provider payloads, prompts, raw AI
  IO, staging/prod/deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

## Execution Plan

1. Establish a local safe `content_admin` runtime session through localhost only, without recording session material.
2. Inspect content workspace and formal content routes using redacted route/control/status/count summaries only.
3. Do not click create/edit/disable/copy/publish/archive/upload/import/submit actions.
4. Run focused unit checks for content question/material, paper, and knowledge-node/resource surfaces.
5. Write redacted evidence, audit review, and acceptance result for the scoped checklist row.
6. Run scoped formatting, `git diff --check`, Module Run v2 precommit, closeout, and prepush gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch if the task closes.

## Risk Controls

- Use only the local safe bootstrap path; do not read private account material.
- Evidence records only route labels, status labels, feature categories, and counts.
- Any blocked route or missing workflow category becomes a follow-up task candidate; no scope expansion inside this task.
