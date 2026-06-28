# Local Full Loop Active Queue Slimming After Post Provider Rollup Acceptance

Task id: `local-full-loop-active-queue-slimming-after-post-provider-rollup-2026-06-28`

Branch: `codex/local-full-loop-queue-slimming-20260628`

## Acceptance Criteria

- Move approved terminal queue candidates to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
- Add `task-history-index.yaml` entries for every moved task id.
- Keep current task and recent recovery window in active queue.
- Record moved ids, before/after counts, and residual archive candidate count.
- Run scoped formatting, whitespace, queue slimming diagnostic, ProjectStatus, Module Run v2 pre-commit hardening, and
  pre-push readiness.
- Preserve blocked gates: Cost Calibration, release/final, Provider, env, DB/runtime/browser/e2e, staging/prod/deploy,
  payment/OCR/export, external-service, PR, force push, package/lockfile, schema/migration.

## Acceptance Result

Accepted. Queue slimming diagnostic reports `clean` with archive candidate count 0. The active queue now contains 12
tasks: 3 blocked non-terminal gates and 9 terminal recovery entries including the current closed task. Scoped formatting,
`git diff --check`, ProjectStatus, Module Run v2 pre-commit hardening, and pre-push readiness passed.

All blocked gates remained blocked; this task did not execute Provider, Cost Calibration, runtime, DB, browser/e2e,
dev-server, source/test/script, package/lockfile, `.env*`, schema/migration/seed, staging/prod/deploy,
payment/OCR/export, external-service, PR, force push, release readiness, or final Pass work.
