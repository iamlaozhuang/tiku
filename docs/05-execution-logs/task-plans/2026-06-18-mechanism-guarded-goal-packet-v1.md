# mechanism-guarded-goal-packet-v1

## Scope

Implement guarded serial goal packet v1 as a read-only mechanism gate. The task must preserve safety and must not run or
authorize product work, Browser/Playwright runtime, e2e execution, provider/model calls, dependency changes, schema
changes, deploy/cloud/payment/external-service work, PR, force-push, or Cost Calibration Gate.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Existing next-action/status and queue-drain scripts.

## Implementation Plan

1. Add `Test-ModuleRunV2GuardedGoalPacket.ps1` plus smoke coverage.
2. Classify docs/state/audit-only tasks as packet-closeout eligible only when evidence/audit and task-scoped local commit
   closeout exist.
3. Classify product/runtime scope as one task and one closeout.
4. Classify `local_full_flow` as single-task only.
5. Surface read-only goal packet metrics through `Get-TikuNextAction.ps1` and `Get-TikuProjectStatus.ps1` without changing
   local-experience repair priority.
6. Update operating manual, mechanism tuning SOP, profile catalog, autodrive schema, and source-of-truth index.

## Risk Controls

- No product source, e2e spec, schema, dependency, provider/model, `.env*`, deploy/cloud/payment/external-service, PR,
  force-push, destructive DB, or Cost Calibration Gate work.
- The v1 gate is diagnostic-only and does not mutate queue state.
- `local_full_flow` remains single-task only.
- Product/runtime implementation tasks remain one task and one closeout.
