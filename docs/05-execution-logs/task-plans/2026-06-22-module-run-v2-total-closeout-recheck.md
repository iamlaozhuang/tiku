# Task Plan: Module Run v2 Total Closeout Recheck

taskId: `module-run-v2-total-closeout-recheck-2026-06-22`

## Scope

Record a docs/state-only closeout recheck after Module Run v2 implementation batches 284-287 and the completion marker
reconcile. The task confirms queue/archive/status, rechecks Local Experience Closure readiness state, and restates the
preview owner acceptance planning boundary.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- Local Experience proposal and bridge scripts

## Implementation Plan

1. Run read-only recovery and status scripts.
2. Add a narrow docs/state queue task for this recheck.
3. Record project-state, evidence, and audit-review conclusions.
4. Do not perform archive apply in this task; only record the archive candidate count and recommend a separate queue
   hygiene follow-up if needed.
5. Validate with status scripts, local experience proposal scripts, Prettier, `git diff --check`, and Module Run v2
   hardening/readiness scripts.

## Risk Boundary

Blocked in this task: source/test changes, package or lockfile changes, schema/migration/seed/database work,
env/secret access, Provider/model calls, dev-server/browser/e2e runtime, deploy, PR, force push, payment/external
services, org_auth runtime behavior, production/staging data access, and Cost Calibration Gate execution.
