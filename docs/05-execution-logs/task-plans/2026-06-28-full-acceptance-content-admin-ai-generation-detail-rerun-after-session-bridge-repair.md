# Content Admin AI Generation Detail Rerun After Session Bridge Repair Plan

## Task

- Task: `full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair-2026-06-28`
- Branch: `codex/content-admin-ai-rerun-session-bridge-20260628`
- Status: in_progress
- Goal slice: rerun the two scoped `content_admin` AI generation detail-control rows after the local acceptance session
  runtime bridge repair.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-local-acceptance-session-runtime-bridge-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-acceptance-session-runtime-bridge-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-safe-bootstrap.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-content-admin-ai-generation-detail-rerun-after-session-bridge-repair.md`

## Blocked Files And Actions

- `.env*`, package/lockfiles, `src/**`, `tests/**`, `drizzle/**`, `migrations/**`, `seed/**`, `e2e/**`, `scripts/**`,
  private fixture directories, screenshots/traces/raw DOM artifacts, DB rows, Provider payloads, prompts, raw AI IO,
  staging/prod/deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

## Execution Plan

1. Confirm browser automation instructions before browser use.
2. Establish a local safe `content_admin` runtime session through localhost only, without recording session material.
3. Verify `/api/v1/sessions` by redacted status/count summary only.
4. Inspect `/content/ai-question-generation` and `/content/ai-paper-generation` for route and expected control-category
   counts; do not submit AI generation.
5. Run focused unit checks for local bootstrap and shared AI generation entry surface.
6. Write redacted evidence, audit review, and acceptance result for only these two rows.
7. Run scoped formatting, `git diff --check`, Module Run v2 precommit, closeout, and prepush gates.
8. Commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch if the task closes.

## Risk Controls

- Treat login/session bootstrap as localhost test-owned switching only.
- Do not read private account material; this task uses the local safe bootstrap path.
- Evidence must stay at role/route/control category/status/count level.
- If route/control evidence fails, close as blocked with a follow-up task candidate instead of expanding scope.
