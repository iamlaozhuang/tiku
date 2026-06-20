# Module Run v2 Mechanic Seed Transaction Scope Plan

## Task

- Mechanic id: `tiku-module-run-v2-mechanic-2`
- Autopilot id: `tiku-module-run-v2-autopilot`
- Scope: update pre-commit hardening seed transaction recognition to match the current seed script output.

## Problem

`New-ModuleRunV2ImplementationSeed.ps1` now materializes more than the legacy three-file seed transaction. It creates
the task queue entries, seed evidence/audit, seeded task evidence/audit templates, and may be paired with approval/state
records and a task plan. `Test-ModuleRunV2PreCommitHardening.ps1` still recognizes only the legacy three-file set, so a
valid low-risk seed transaction is rejected as out of scope.

## Plan

1. Keep the seed transaction hard block behavior.
2. Permit only the known seed transaction file families:
   - `docs/04-agent-system/state/task-queue.yaml`
   - `docs/04-agent-system/state/project-state.yaml`
   - `docs/04-agent-system/state/*-auto-seed-approval-decision.yaml`
   - `docs/05-execution-logs/task-plans/*-auto-seed*.md`
   - `docs/05-execution-logs/evidence/*-auto-seed*.md`
   - `docs/05-execution-logs/audits-reviews/*-auto-seed*.md`
   - `docs/05-execution-logs/evidence/batch-*.md`
   - `docs/05-execution-logs/audits-reviews/batch-*.md`
3. Preserve blocked file checks for `src/**`, `tests/**`, `e2e/**`, env, dependency, schema, migration, materials, and
   paper assets.
4. Rerun the mechanic pre-commit hardening, seed self-review, lint, typecheck, and diff check.

## Boundaries

- No product runtime source change.
- No provider/model call.
- No env, dependency, schema, migration, deploy, payment, PR, force-push, or Cost Calibration Gate work.
