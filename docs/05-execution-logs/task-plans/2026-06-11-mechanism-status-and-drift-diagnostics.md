# Mechanism Status And Drift Diagnostics

## Task

- id: `mechanism-status-and-drift-diagnostics`
- branch: `codex/mechanism-serial-governance`
- task group: user-approved four-task serial mechanism governance chain

## Required Sources Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`

## Scope

Extend the read-only next-action diagnostic to report queue status anomalies, missing terminal evidence, and queue/matrix drift.

Allowed changes:

- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- task plan, evidence, and audit review for this task

Blocked:

- product code, tests, e2e, dependencies, lockfiles, schema, migrations, env/secret, provider calls, deployment, PR, force push
- durable repair or mutation of queue, matrix, evidence, archive, worktree, or run registry state beyond this task closeout metadata
- Cost Calibration Gate execution

## Implementation

1. Preserve existing task2 labels and read-only behavior.
2. Add `statusFindings:` with `legacy_status_missing`, `legacy_done`, and unsupported status counts.
3. Add `evidenceFindings:` with `evidenceMissing` count for terminal tasks whose evidence path is absent or missing.
4. Add `driftFindings:` with `queueMatrixDrift` summary for matrix completed batches or source planning tasks missing from the active queue.
5. Require terminal dependencies to have evidence before they can unlock a next executable task.
6. Expand smoke fixtures to cover missing status, legacy done, missing evidence, and matrix drift without writing durable repository state.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `Select-String -Path scripts\agent-system\Get-TikuNextAction.ps1,docs\05-execution-logs\evidence\2026-06-11-mechanism-status-and-drift-diagnostics.md -Pattern 'legacy_status_missing','legacy_done','queueMatrixDrift','evidenceMissing','diagnosticOnly','Cost Calibration Gate remains blocked'`
- `git diff --check`
- commit-time pre-commit hook

## Risk Defense

- Diagnostics remain report-only.
- No queue or matrix repair is automated.
- Smoke keeps fixture hash checks from task2 and adds diagnostic assertions.
- Remote push remains unapproved for this serial task group.
