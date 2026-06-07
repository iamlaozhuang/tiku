# Phase 54 Task Queue Archival Index Governance Task Plan

## Task

- Task id: `phase-54-task-queue-archival-index-governance`
- Branch: `codex/phase-54-task-queue-archival-index-governance`
- Task kind: `docs_only`
- Automation mode: `semi_auto`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-53-requirement-task-coverage-gap-governance.md`

## Goal

Create a docs-only governance SOP for keeping the active task queue readable while preserving historical audit recovery through archive files and an index.

## Allowed Files

- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-54-task-queue-archival-index-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-54-task-queue-archival-index-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-54-task-queue-archival-index-governance.md`

## Blocked Scope

This task must not move or delete queue entries, create archive files, create a task history index, change product code, change dependencies, touch schema or migration files, alter scripts, change env/secret files, run provider or browser business flows, change `automation.mode`, seed code-stage tasks, or execute Cost Calibration Gate.

## Approach

1. Add `task-queue-archival-and-index-governance.md`.
2. Define active queue, archive, and index roles.
3. Define archive eligibility and batch rules.
4. Define index shape and recovery lookup rules.
5. Define active queue size signals.
6. Keep actual archive movement as a future separately approved task.
7. Synchronize `project-state.yaml` and `task-queue.yaml` for phase-54.
8. Validate docs-only scope and formatting.

## Risk Defenses

- Do not move historical task entries in this task.
- Do not create `task-history-index.yaml` in this task.
- Keep `automation.mode` as `semi_auto`.
- Keep Cost Calibration Gate blocked.
- Keep code-stage queue seeding unapproved.
- Do not claim active queue slimming has happened.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\sop\task-queue-archival-and-index-governance.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-54-task-queue-archival-index-governance.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-54-task-queue-archival-index-governance.md docs\05-execution-logs\evidence\2026-06-07-phase-54-task-queue-archival-index-governance.md`
- `Select-String -Path docs\04-agent-system\sop\task-queue-archival-and-index-governance.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-54-task-queue-archival-index-governance.md,docs\05-execution-logs\evidence\2026-06-07-phase-54-task-queue-archival-index-governance.md -Pattern 'Queue File Roles','Active Queue Definition','Archive Eligibility','Archive Batch Rules','History Index Shape','Recovery Rules','Active Queue Size Signals','Blocked Gates','Cost Calibration Gate remains blocked','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log'`
- `git diff --unified=0 -- <changed files> | Select-String -Pattern '^\+.*(license|exam_paper)' -CaseSensitive`

## Stop Conditions

Stop if validation fails outside docs-only scope, changed files exceed allowed files, blocked files are touched, or the task would require moving/deleting queue entries, creating an index, product code, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, code-stage queue seeding, `automation.mode` change, or Cost Calibration Gate execution.
