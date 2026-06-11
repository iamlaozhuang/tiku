# Mechanism Next Action Read-Only Diagnostic

## Task

- id: `mechanism-next-action-readonly-diagnostic`
- branch: `codex/mechanism-serial-governance`
- task group: user-approved four-task serial mechanism governance chain

## Required Sources Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`

## Scope

Add a read-only diagnostic entry point that answers the next mechanism action without claiming work or mutating state.

Allowed changes:

- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- task queue and source-of-truth index registration
- task plan, evidence, and audit review for this task
- `project-state.yaml` current-task closeout metadata

Blocked:

- product code, tests, e2e, dependencies, lockfiles, schema, migrations, env/secret, provider calls, deployment, PR, force push
- durable task claim, cleanup, merge, push, or Cost Calibration Gate execution

## Implementation

1. Parse project-state and task-queue with local PowerShell helpers only.
2. Report fixed labels: `repository:`, `currentTask:`, `queueDecision:`, `nextActionDecision:`, `nextExecutableTask:`, `blockedGates:`, `validationNeeded:`, `recommendedAction:`, `stopReason:`, `diagnosticOnly: true`.
3. Select the first `pending` task whose dependencies are terminal (`done`, `closed`, `pushed`, `merged`).
4. Treat dirty worktree as an advisory stop, not a mutation.
5. Keep high-risk gates blocked in output.
6. Smoke-test with a temporary repository and hash checks to prove fixture state remains unchanged.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `Select-String -Path scripts\agent-system\Get-TikuNextAction.ps1,docs\05-execution-logs\evidence\2026-06-11-mechanism-next-action-readonly-diagnostic.md -Pattern 'repository:','currentTask:','queueDecision:','nextExecutableTask:','blockedGates:','validationNeeded:','recommendedAction:','stopReason:','Cost Calibration Gate remains blocked'`
- `git diff --check`
- commit-time pre-commit hook

## Risk Defense

- The script is read-only and has no writer path.
- Smoke verifies input fixture hashes before and after execution.
- The diagnostic does not replace startup, closeout, schema, capability, or blocked-gate checks.
- Remote push remains unapproved for this serial task group.
