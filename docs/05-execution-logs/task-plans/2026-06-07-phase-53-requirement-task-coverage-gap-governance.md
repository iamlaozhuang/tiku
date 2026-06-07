# Phase 53 Requirement Task Coverage Gap Governance Task Plan

## Task

- Task id: `phase-53-requirement-task-coverage-gap-governance`
- Branch: `codex/phase-53-requirement-task-coverage-gap-governance`
- Task kind: `docs_only`
- Automation mode: `semi_auto`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-07-phase-52-docs-auto-candidate-mode-transition-proposal.md`

## Goal

Create a docs-only governance SOP that prevents module or task completion from being treated as exhaustive without requirement-to-use-case coverage evidence.

## Allowed Files

- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-53-requirement-task-coverage-gap-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-53-requirement-task-coverage-gap-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-53-requirement-task-coverage-gap-governance.md`

## Blocked Scope

This task must not change product code, product tests, e2e tests, API, UI, service, repository, mapper, validator, schema, migration, scripts, dependencies, packages, lockfiles, env/secret files, provider configuration, staging/prod/cloud/deploy configuration, payment integration, external-service integration, Codex configuration, plugins, connectors, or `automation.mode`.

This task must not seed code-stage implementation queue items.

## Approach

1. Add `requirement-task-coverage-and-gap-audit-governance.md`.
2. Define the coverage chain from requirement source to residual gap decision.
3. Define a coverage matrix shape and status model.
4. Define required audit passes for roles, flows, risks, validation, and residual gaps.
5. Add explicit high-risk coverage expectations for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.
6. Synchronize `project-state.yaml` and `task-queue.yaml` for phase-53.
7. Validate docs-only scope and formatting.

## Risk Defenses

- Keep `automation.mode` as `semi_auto`.
- Keep code-stage queue seeding unapproved.
- Keep Cost Calibration Gate blocked.
- Do not claim any runtime behavior changed.
- Do not expose protected evidence content.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\sop\requirement-task-coverage-and-gap-audit-governance.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-53-requirement-task-coverage-gap-governance.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-53-requirement-task-coverage-gap-governance.md docs\05-execution-logs\evidence\2026-06-07-phase-53-requirement-task-coverage-gap-governance.md`
- `Select-String -Path docs\04-agent-system\sop\requirement-task-coverage-and-gap-audit-governance.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-53-requirement-task-coverage-gap-governance.md,docs\05-execution-logs\evidence\2026-06-07-phase-53-requirement-task-coverage-gap-governance.md -Pattern 'Coverage Model','Mapping Requirements','Coverage Status Rules','Required Audit Passes','High-Risk Business Surface Pass','Gap Handling','Module Closeout Rule','Cost Calibration Gate remains blocked','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log'`
- `git diff --unified=0 -- <changed files> | Select-String -Pattern '^\+.*(license|exam_paper)' -CaseSensitive`

## Stop Conditions

Stop if validation fails outside docs-only scope, changed files exceed allowed files, blocked files are touched, or the task would require code-stage queue seeding, product code, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate execution.
