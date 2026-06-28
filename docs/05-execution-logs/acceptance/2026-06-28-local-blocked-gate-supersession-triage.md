# Local Blocked Gate Supersession Triage Acceptance

Task id: `local-blocked-gate-supersession-triage-2026-06-28`

Branch: `codex/local-blocked-gate-triage-20260628`

## Acceptance Criteria

- Close only old blocked tasks that are superseded by later local evidence.
- Keep the staging pre-release task blocked.
- Move active queue terminal overflow into the June archive and update `task-history-index.yaml`.
- Keep active queue recoverable through current task, the staging gate, and the terminal recovery window.
- Record traceability, evidence, audit review, acceptance, validation results, and blocked gate boundaries.
- Do not execute runtime, browser/e2e/dev-server, DB, Provider, env, source/test/script, package/lockfile, schema/migration/seed, staging/prod/deploy, payment/OCR/export, external-service, PR, force push, Cost Calibration, release readiness, or final Pass work.

## Acceptance Result

Accepted. Two stale active blocked records are closed as superseded, one staging blocked gate remains, and 3 terminal
entries were archived with history index entries. Active queue now has 10 tasks: 1 blocked non-terminal staging gate and
9 terminal recovery entries including the current closed task.

Scoped Prettier, `git diff --check`, queue slimming diagnostic, ProjectStatus, Module Run v2 pre-commit hardening, and
pre-push readiness passed. No release readiness or final Pass is claimed.
