# Module Run v2 Unattended Automation Control Task Plan

## Task

- Task id: `module-run-v2-unattended-automation-control`
- Branch: `codex/module-run-v2-unattended-automation-control`
- Current mode: `local_auto_candidate`
- Goal: make the local automation mechanism decide when unattended advancement may continue, when it must stop for a
  hard block, and when a thread rollover is suggested or required.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`

## Scope

Allowed:

- Add a local unattended readiness script and smoke test.
- Add a local thread rollover decision script and smoke test.
- Update governance SOP/state to describe the stop-decision control point.
- Write evidence and audit review.

Blocked:

- Cost Calibration Gate execution.
- Provider, env/secret, staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, `.env.local`, `.env.example`,
  product implementation, `src/**`, `tests/**`, and `e2e/**`.
- Creating or scheduling a remote Codex automation without a separate explicit thread-management or automation task.

## RED/GREEN Plan

1. RED: a missing unattended readiness script fails because no script exists.
2. GREEN: `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` proves:
   - current branch must not be protected;
   - Git remote divergence is a hard block;
   - stale `project-state.yaml` repository SHA is a hard block unless explicitly allowed for fixture testing;
   - missing plan/evidence/audit paths are hard blocks;
   - blocked risk surfaces produce stop decisions;
   - a clean local task emits `unattendedStopDecision: continue`.
3. RED: a missing thread rollover script fails because no script exists.
4. GREEN: `Test-ModuleRunV2ThreadRolloverReadiness.Smoke.ps1` proves:
   - Batches 0-3 can continue;
   - Batch 4 suggests a new thread;
   - Batch 6 requires a new thread;
   - module closeout or execution-module change requires a new thread;
   - context compaction requires recovery audit or a new thread decision.

## localFullLoopGate

- Target: `L1` for mechanism scripts and governance docs.
- L8 blocked remainder: provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema,
  migration, and Cost Calibration Gate remain blocked.

## Stop Conditions

Stop immediately if validation fails outside this scope, Git remote is ahead, a blocked gate becomes necessary, evidence
would expose protected content, or a required new-thread decision prevents safe continuation.
