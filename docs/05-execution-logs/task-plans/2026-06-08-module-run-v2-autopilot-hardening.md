# Module Run v2 Autopilot Hardening Task Plan

## Task

- Task id: `module-run-v2-autopilot-hardening`
- Branch: `codex/module-run-v2-autopilot-hardening`
- Current mode: `local_auto_candidate`
- Goal: harden the Module Run v2 autopilot mechanism so post-closeout recovery, handoff decisions, and Codex automation wakeups can run without stale-state hard blocks or repository pollution.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`

## Scope

Allowed:

- Harden unattended readiness for post-closeout state recovery.
- Add autopilot closeout recovery orchestration.
- Add dry-run handoff and autopilot decision paths that do not edit tracked files.
- Refresh Codex automation configuration and evidence for local dry-run autopilot validation.
- Update mechanism SOP/state/matrix/source index and execution logs.

Blocked:

- Cost Calibration Gate execution.
- Provider, env/secret, staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, `.env.local`, `.env.example`, product implementation, `src/**`, `tests/**`, and `e2e/**`.
- Starting `ai-task-and-provider` implementation.

## RED/GREEN Plan

1. RED: completed-task unattended readiness fails with stale state or `status=done`.
2. GREEN: closeout recovery accepts clean, aligned Git with repository SHA ancestry and blocks dirty or divergent states.
3. RED: autopilot cannot recover from a completed current task without skipping readiness.
4. GREEN: `Invoke-ModuleRunV2Autopilot.ps1 -CloseoutRecovery` runs the controlled handoff path after recovery audit.
5. RED: autopilot/handoff decision can dirty the repo during a read-only self-check.
6. GREEN: `-DryRun` and `-DryRunHandoff` keep decisions outside tracked files unless durable handoff writing is explicitly needed.
7. GREEN: Codex automation prompt and evidence prefer closeout recovery plus dry-run handoff for routine wakeups.

## localFullLoopGate

- Target: `L1`.
- L8 blocked remainder: provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost Calibration Gate remain blocked.

## Stop Conditions

Stop on non-fast-forward, remote ahead, hook failure, sensitive evidence, scope drift, dirty worktree outside this task, blocked gates, or any requirement to execute provider/env/deploy/payment/external-service/schema/dependency work.
