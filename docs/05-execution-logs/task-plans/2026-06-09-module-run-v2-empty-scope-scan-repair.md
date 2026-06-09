# Module Run v2 Empty Scope Scan Repair Plan

## Task

- taskId: `module-run-v2-empty-scope-scan-repair`
- branch: `codex/module-run-v2-empty-scope-scan-repair`
- taskKind: `implementation`
- scope: local mechanism script repair, smoke coverage, state/queue alignment, evidence, and audit review.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- Previous evidence: `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-automation-handoff-contract-hardening.md`
- Previous audit: `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-automation-handoff-contract-hardening.md`

## Problem Statement

`Invoke-ModuleRunV2Autopilot.ps1 -CloseoutRecovery -DryRunHandoff` stops with `autopilotDecision: stop_for_hard_block`
when the current worktree is clean and no explicit `-ReadinessChangedFiles` are provided. The nested unattended
readiness script reports `filesToScan: 0`, then fails with:

```text
HARD_BLOCK_ERROR Cannot bind argument to parameter 'FilesToScan' because it is an empty array.
```

This is a mechanism boundary bug. A clean closeout recovery with zero changed files should be allowed to write a
redacted heartbeat with `changedFiles: []`; a dirty closeout recovery without explicit files must remain blocked.

## Implementation Approach

1. Add smoke coverage first for clean closeout recovery without explicit changed files.
2. Add autopilot smoke coverage for `-CloseoutRecovery -DryRunHandoff` without `-ReadinessChangedFiles`.
3. Make the minimal script change so `Write-RunRegistryHeartbeat` accepts an empty `FilesToScan` collection.
4. Re-run focused smoke tests, startup readiness, and the previously blocked closeout recovery dry-run autopilot command.
5. Record evidence and audit review before returning to next-task decision handling.

## Allowed Files

- `scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-empty-scope-scan-repair.md`
- `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-empty-scope-scan-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-empty-scope-scan-repair.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`
- `package.json`, lockfiles
- `src/**`, `tests/**`, `e2e/**`
- `src/db/schema/**`, `drizzle/**`
- provider/env/secret, staging/prod/cloud/deploy, payment, external-service
- dependency, schema, migration, product implementation, Cost Calibration Gate execution

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-empty-scope-scan-repair -PlannedFiles scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1,scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1,docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/task-queue.yaml,docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-empty-scope-scan-repair.md,docs/05-execution-logs/evidence/2026-06-09-module-run-v2-empty-scope-scan-repair.md,docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-empty-scope-scan-repair.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1 -CloseoutRecovery -DryRunHandoff`
- `git diff --check`
- scoped Prettier write/check for changed scripts and docs
- anchor check for `AllowEmptyCollection`, `filesToScan: 0`, `closeoutRecovery`, `DryRunHandoff`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if the repair requires product code, dependency/package/lockfile changes, schema/migration, provider/env/secret,
staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, or broad automation redesign.
