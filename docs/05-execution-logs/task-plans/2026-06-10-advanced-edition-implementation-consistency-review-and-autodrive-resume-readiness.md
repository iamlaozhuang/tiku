# Advanced Edition Implementation Consistency Review And Autodrive Resume Readiness Plan

## Summary

- Task id: `advanced-edition-implementation-consistency-review-and-autodrive-resume-readiness`
- Branch: `codex/advanced-edition-autodrive-resume-readiness`
- Task kind: `mechanism_repair`
- Goal: audit advanced-edition matrix, queue, evidence, and code consistency, then repair the confirmed blockers that prevent the primary unattended autopilot from safely continuing.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`

## Scope

Allowed tracked changes:

- seed proposal and automation registration readiness scripts plus focused smoke tests;
- startup readiness closeout routing plus focused smoke tests;
- advanced-edition matrix progress and mechanism source-of-truth references;
- project state, task queue, task plan, evidence, and audit review for this task;
- automated advancement SOP wording only where needed to describe the terminal-task seed skip rule.

Out of scope:

- product code changes under `src/**`;
- dependency, package, lockfile, env/secret, provider, DB, schema, migration, deploy, PR, force push, e2e, and Cost Calibration Gate actions.

The active local automation TOML may be updated outside tracked repository files only to align the primary autopilot prompt and auto-seed approval statement with existing repository readiness anchors.

## Implementation Plan

1. Reconcile current facts:
   - confirm startup readiness is clean and idle;
   - confirm `batch-101` through `batch-104` are terminal in the queue and have evidence/audit records;
   - confirm the matrix still records authorization progress only through `batch-100`;
   - confirm seed proposal currently repeats terminal `batch-101` through `batch-104`.
2. Repair seed proposal:
   - treat a module target closure item as already completed when its generated task id exists in the queue with terminal status;
   - skip a module when all target closure items are terminal, even without a separate module closure marker;
   - keep dependency checks module-level and terminal-task aware;
   - add smoke coverage for terminal `batch-101` and `batch-102` causing the proposal to advance to `ai-task-and-provider`.
3. Repair automation registration guard:
   - require the active primary prompt to contain exact standing closeout auto-seed anchors used by the seed transaction;
   - update the active TOML prompt/approval statement to include the same exact anchors;
   - add smoke coverage for missing exact closeout anchors.
4. Repair startup closeout routing:
   - route structured `ready_for_closeout` tasks to `closeout_recovery` before seed proposal execution;
   - emit `stopTaxonomy: closeout_pending`;
   - add smoke coverage for this terminal handoff.
5. Repair matrix drift only after evidence confirms terminal batch trust:
   - add `batch-101` through `batch-104` to authorization-context completed batches;
   - update the latest authorization progress status to local L4 authorization-and-access closure.
6. Record review evidence and audit:
   - classify findings as `state_drift`, `seed_blocker`, `automation_config_gap`, `evidence_gap`, `code_quality_risk`, and `next_module_candidate`;
   - record blocked gates and redaction boundary.
7. Validate, mark ready for closeout, and use the approved closeout script.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 3 -PlanOnly`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-edition-implementation-consistency-review-and-autodrive-resume-readiness`

## Stop Conditions

- Evidence for any terminal authorization batch is missing, not approved, or contradicts the queue status.
- The next seed proposal still repeats terminal `batch-101` through `batch-104`.
- The active automation registration no longer has exactly one primary scheduled ACTIVE automation.
- Any repair requires product code, dependency, env/secret, provider, DB, schema/migration, deploy, PR, force push, or Cost Calibration Gate execution.

Cost Calibration Gate remains blocked.
