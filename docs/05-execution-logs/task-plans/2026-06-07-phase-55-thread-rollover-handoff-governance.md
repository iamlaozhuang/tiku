# Phase 55 Thread Rollover Handoff Governance Task Plan

## Task

- Task id: `phase-55-thread-rollover-handoff-governance`
- Branch: `codex/phase-55-thread-rollover-handoff-governance`
- Task kind: `docs_only`
- Automation mode: `semi_auto`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/04-agent-system/sop/skill-dispatch-and-thread-handoff-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-54-task-queue-archival-index-governance.md`

## Goal

Create a docs-only governance SOP for when Codex should continue the current thread, suggest a new thread, require a new thread, or stop for human handoff.

## Allowed Files

- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-55-thread-rollover-handoff-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-55-thread-rollover-handoff-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-55-thread-rollover-handoff-governance.md`

## Blocked Scope

This task must not create or manage Codex threads, change product code, change dependencies, touch schema or migration files, alter scripts, change env/secret files, run provider or browser business flows, change `automation.mode`, seed code-stage tasks, or execute Cost Calibration Gate.

## Approach

1. Add `thread-rollover-and-handoff-governance.md`.
2. Define decision labels for continuing, suggesting rollover, requiring rollover, and stopping.
3. Define current-thread continuation criteria.
4. Define suggest and require signals.
5. Define handoff shape and receiving-thread startup gate.
6. Define Agent autonomy boundary and user cooperation model.
7. Synchronize `project-state.yaml` and `task-queue.yaml` for phase-55.
8. Validate docs-only scope and formatting.

## Risk Defenses

- Do not create a new thread in this task.
- Do not treat Agent suggestion as thread-management approval.
- Keep `automation.mode` as `semi_auto`.
- Keep Cost Calibration Gate blocked.
- Keep code-stage queue seeding and product implementation unapproved.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\sop\thread-rollover-and-handoff-governance.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-55-thread-rollover-handoff-governance.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-55-thread-rollover-handoff-governance.md docs\05-execution-logs\evidence\2026-06-07-phase-55-thread-rollover-handoff-governance.md`
- `Select-String -Path docs\04-agent-system\sop\thread-rollover-and-handoff-governance.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-55-thread-rollover-handoff-governance.md,docs\05-execution-logs\evidence\2026-06-07-phase-55-thread-rollover-handoff-governance.md -Pattern 'Decision Labels','Continue Current Thread Criteria','Suggest New Thread Signals','Require New Thread Signals','Rollover Preparation Gate','New Thread Startup Gate','Agent Autonomy Boundary','User Cooperation Model','Cost Calibration Gate remains blocked','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log'`
- `git diff --unified=0 -- <changed files> | Select-String -Pattern '^\+.*(license|exam_paper)' -CaseSensitive`

## Stop Conditions

Stop if validation fails outside docs-only scope, changed files exceed allowed files, blocked files are touched, or the task would require thread creation, product code, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, code-stage queue seeding, `automation.mode` change, or Cost Calibration Gate execution.
