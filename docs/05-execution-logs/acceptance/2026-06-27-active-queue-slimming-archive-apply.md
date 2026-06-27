# Acceptance: active-queue-slimming-archive-apply-2026-06-27

## Decision

ACCEPTED AS LOCAL DOCS-STATE ARCHIVE APPLY.

## Acceptance Criteria

- Only terminal task blocks are moved from the active queue to the June archive.
- Every moved task id receives a `task-history-index.yaml` entry.
- The active queue retains all non-terminal tasks and the 8 terminal recovery blocks.
- Queue slimming diagnostic reports `archiveCandidateCount: 0` after movement.
- Scoped formatting, diff check, Module Run v2 hardening, and project status diagnostics pass.
- No source, tests, browser/dev-server/e2e runtime, DB, schema/migration, Provider, dependencies, PR, force push, release
  readiness, final Pass, or Cost Calibration Gate surfaces are touched.

## Outcome

216 terminal historical task blocks were moved into `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
and indexed in `docs/04-agent-system/state/task-history-index.yaml`. Active queue slimming now reports zero archive
candidates. Merge, push, and branch cleanup still require fresh closeout approval.
