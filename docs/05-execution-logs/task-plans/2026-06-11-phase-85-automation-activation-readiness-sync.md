# Task Plan: phase-85-automation-activation-readiness-sync

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- Latest phase84 evidence and audit review

## Goal

Prepare the local Codex automation registration for a controlled activation decision without starting the unattended
runner, executing e2e, changing product code, or activating scheduled automation during this task.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Allowed local automation action:

- Update the existing `tiku-module-run-v2-autopilot` automation prompt to restore registration readiness anchors while
  preserving `status: PAUSED`.

Blocked:

- `src/**`, `tests/**`, `e2e/**`
- package or lockfile changes
- schema, migration, `src/db/schema/**`, or `drizzle/**`
- env/secret reads or writes
- provider calls, provider configuration, provider cost measurement
- staging, prod, cloud, deploy, payment, or external-service work
- unattended runner execution, e2e execution, PR creation/update, force push, and Cost Calibration Gate execution

## Implementation Plan

1. Record the pre-change registration hard block as RED evidence.
2. Add this phase85 task to the queue with explicit closeout policy and activation boundaries.
3. Update the local automation prompt through the Codex automation tool, keeping the primary automation PAUSED.
4. Verify registration no longer fails for missing prompt anchors while planned pause is still active.
5. Close the planned pause in `project-state.yaml`, update the handoff to the activation decision surface, and record the
   next candidate as `batch-111-personal-learning-ai-request-context-local-contract`.
6. Classify the existing auto-seed readiness failure as not part of the batch111 already-pending claim path unless a
   script review finds the runner claim path invokes it; if it does, stop and seed a phase86 repair instead.
7. Run non-mutating activation preflight, closeout, pre-commit hardening, and pre-push readiness before local closeout.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationLeaseReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract -NoWrite -AllowProtectedBranch`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1 -SkipAutomationRegistrationCheck -AllowProtectedBranch`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-85-automation-activation-readiness-sync`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-85-automation-activation-readiness-sync`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-85-automation-activation-readiness-sync`

## Risk Controls

- Activation itself remains outside this task's commit.
- The primary automation must remain PAUSED until all evidence, audit, merge, and push gates finish.
- If any gate reports a hard block, stop and record the blocker instead of activating automation.
- Cost Calibration Gate remains blocked.
