# Module Run v2 Mechanism State Source Sync Plan

## Summary

Synchronize durable mechanism state before script hardening. This prevents future hooks from reading stale SHA, stale
phase, or an already completed `currentTask`.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- latest Module Run v2 hook and pilot evidence

## Implementation

- Update `project-state.yaml` to current phase `module-run-v2-mechanism-completion`, Git baseline
  `1ab334a71acbc1124f5fed8c23d37d149b7a7a57`, and current task
  `module-run-v2-mechanism-state-source-sync`.
- Add the umbrella closeout task and six approved mechanism tasks to `task-queue.yaml`.
- Update hook matrix status from planned-only to partially implemented under hardening.
- Align automation SOP wording with current `local_auto_candidate` reality.

## Validation

- `git diff --check`
- scoped Prettier write/check for changed governance files
- anchor check for current SHA, `local_auto_candidate`, hook status, and Cost Calibration Gate blocked wording
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
