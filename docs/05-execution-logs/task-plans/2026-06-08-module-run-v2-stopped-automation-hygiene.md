# Module Run v2 Stopped Automation Hygiene Plan

## Task

- taskId: `module-run-v2-stopped-automation-hygiene`
- branch: `codex/module-run-v2-stopped-automation-hygiene`
- scope: mechanism-only hardening for stopped Codex automation residual artifacts
- status: in progress

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- existing automation lease and startup readiness scripts

## Problem Assessment

When scheduled Codex automation wakes while a human or another Codex thread owns the lane, the correct behavior is to
stop. The current startup and lease gates can detect active leases, expired dirty leases, and stale or dirty automation
worktrees, but there is no single cleanup-safe hygiene command for the residual artifacts that may remain after a stopped
wakeup.

Likely residual artifacts:

- `%USERPROFILE%\.codex\tiku\automation-run-lease.json`
- clean automation worktrees under `%USERPROFILE%\.codex\worktrees`
- temporary dry-run handoff directories under the system temp root named `tiku-autopilot-handoff-*`

## Implementation Plan

1. Add `Test-ModuleRunV2StoppedAutomationHygiene.ps1`.
2. Add smoke coverage for clean inventory, active lease stop, invalid lease stop, expired clean lease cleanup, dirty
   worktree stop, and temporary handoff directory cleanup.
3. Update the automation SOP and matrix with the stopped automation hygiene gate.
4. Write evidence and audit review with the residual artifact handling model.
5. Run focused smoke, startup readiness, global gates, formatting, anchor checks, closeout readiness, and Git completion
   readiness.

## Safety Rules

- Default mode is read-only inventory.
- `-Cleanup` only removes cleanup candidates.
- Active leases hard-block cleanup.
- Invalid leases hard-block cleanup.
- Dirty worktrees hard-block cleanup and require manual inspection.
- Cleanup paths must resolve inside the expected Codex automation roots or system temp root.
- Product code, provider/env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration,
  e2e implementation, and Cost Calibration Gate execution remain blocked.

## Allowed Files

- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-stopped-automation-hygiene.md`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-stopped-automation-hygiene.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-stopped-automation-hygiene.md`

## Blocked Files

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`

## Validation

- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-stopped-automation-hygiene`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-stopped-automation-hygiene -PlannedFiles ...`
- `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped prettier write and check
- required anchor check
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-stopped-automation-hygiene`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Evidence Policy

Record only command decisions, file inventory, and redacted path classes. Do not record secrets, tokens, database URLs,
Authorization headers, provider payloads, raw prompts, raw generated AI content, cleartext `redeem_code`, full `paper`
content, or private answer text.
