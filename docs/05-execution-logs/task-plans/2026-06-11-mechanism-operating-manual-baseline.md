# Mechanism Operating Manual Baseline Plan

## Summary

- Task id: `mechanism-operating-manual-baseline`
- Branch: `codex/mechanism-serial-governance`
- Task kind: `docs_only`
- Goal: create a concise active operating manual for the Tiku advancement mechanism and register the four approved serial governance tasks so later work has a clear queue-first entry.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`

## Scope

Allowed changes:

- Add `docs/04-agent-system/operating-manual.md`.
- Add four serial task entries to `docs/04-agent-system/state/task-queue.yaml`.
- Update `docs/04-agent-system/state/project-state.yaml` to point pre-commit scope scanning at this active task.
- Add the operating manual to `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`.
- Add task plan, evidence, and audit review for this task.

Blocked changes:

- No product code under `src/**`.
- No scripts except later approved tasks.
- No dependency, package, lockfile, schema, migration, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, PR, force push, or Cost Calibration Gate action.

## Implementation Plan

1. Write a short operating manual that reduces the recovery surface to current mode, task selection, single source-of-truth rules, status policy, blocked gates, completion standard, mechanism budget, push boundary, product closure contribution, and stop rules.
2. Register the four serial tasks:
   - `mechanism-operating-manual-baseline`
   - `mechanism-next-action-readonly-diagnostic`
   - `mechanism-status-and-drift-diagnostics`
   - `mechanism-runner-consumes-next-action`
3. Keep task 2 through task 4 `pending` and make each depend on the previous task.
4. Write evidence and audit review for this task.
5. Run scoped formatting, anchor checks, and `git diff --check`.
6. Commit this task as one focused local commit.

## Validation

- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\operating-manual.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\mechanism-source-of-truth-index.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-mechanism-operating-manual-baseline.md docs\05-execution-logs\evidence\2026-06-11-mechanism-operating-manual-baseline.md docs\05-execution-logs\audits-reviews\2026-06-11-mechanism-operating-manual-baseline.md`
- `Select-String -Path docs\04-agent-system\operating-manual.md,docs\04-agent-system\state\task-queue.yaml,docs\05-execution-logs\evidence\2026-06-11-mechanism-operating-manual-baseline.md -Pattern 'single source of truth','mechanism work budget','push boundary','productClosureContribution','Cost Calibration Gate remains blocked','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log'`
- `git diff --check`

## Stop Conditions

- The manual conflicts with existing SOPs instead of acting as a concise entry point.
- The queue registration makes high-risk actions executable.
- Any change touches blocked files or requires env/secret, provider, dependency, schema, migration, deploy, PR, force push, or Cost Calibration Gate work.

Cost Calibration Gate remains blocked.
