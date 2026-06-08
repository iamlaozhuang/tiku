# Module Run v2 Autopilot Orchestration Control Task Plan

## Task

- Task id: `module-run-v2-autopilot-orchestration-control`
- Branch: `codex/module-run-v2-unattended-automation-control`
- Current mode: `local_auto_candidate`
- Goal: complete the three missing automation layers for an autopilot-style Module Run v2 flow:
  - handoff generator;
  - automation orchestrator;
  - thread launch policy.

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

- Add `New-ModuleRunV2ThreadHandoff.ps1` and smoke test.
- Add `Test-ModuleRunV2ThreadLaunchPolicy.ps1` and smoke test.
- Add `Invoke-ModuleRunV2Autopilot.ps1` and smoke test.
- Update SOP/state/matrix/source index for the new control points.
- Generate one redacted handoff file for this mechanism closeout.

Blocked:

- Cost Calibration Gate execution.
- Provider, env/secret, staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, `.env.local`, `.env.example`,
  product implementation, `src/**`, `tests/**`, and `e2e/**`.
- Starting the next business module implementation in this thread.

## RED/GREEN Plan

1. RED: handoff smoke fails because the handoff generator does not exist.
2. GREEN: handoff generator writes a concise, redacted handoff with recovery read order, blocked gates, next candidate,
   and thread tool instructions.
3. RED: thread launch policy smoke fails because the policy script does not exist.
4. GREEN: launch policy maps rollover decisions to `continue_current_thread`, `prepare_handoff`, `launch_new_thread`, or
   `stop_for_human_handoff`.
5. RED: autopilot smoke fails because the orchestrator does not exist.
6. GREEN: orchestrator combines stop-decision, thread decision, handoff, and launch policy into a machine-readable
   `autopilotDecision`.

## localFullLoopGate

- Target: `L1`.
- L8 blocked remainder: provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema,
  migration, and Cost Calibration Gate remain blocked.

## Stop Conditions

Stop if the scripts require real thread creation during tests, remote scheduling, blocked gates, business implementation,
or any forbidden surface. The scripts may produce launch instructions, but this task does not start the next module.
