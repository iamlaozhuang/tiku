# Phase 32 Advanced Edition Doc Governance State Sync Task Plan

## Goal

Synchronize the project governance state after the advanced edition requirements-stage handoff, while explicitly pausing code-stage queue seeding and keeping Cost Calibration Gate blocked.

## Scope

This is a docs-only governance synchronization task.

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-06-phase-32-advanced-edition-doc-governance-state-sync.md`
- `docs/05-execution-logs/evidence/2026-06-06-phase-32-advanced-edition-doc-governance-state-sync.md`

Blocked changes:

- product code under `src/**`
- database schema or migrations under `src/db/schema/**` or `drizzle/**`
- tests, e2e, scripts, package, lockfile, dependencies
- `.env.local`, `.env.example`, env/secret work
- provider, staging, prod, cloud, deploy, payment, or external-service work
- Cost Calibration Gate execution
- code-stage implementation task decomposition

## Context Read

The following governance sources were restored before the task:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`

## Implementation Steps

1. Confirm clean worktree and active short branch.
2. Add a `phase-32-advanced-edition-doc-governance-state-sync` queue item as a docs-only task.
3. Update `project-state.yaml` to reflect the new governance phase, latest known master/origin master SHA, current task, branch, evidence path, and next recommended action.
4. Write evidence with command outputs, scope boundaries, and Cost Calibration Gate blocked statement.
5. Run docs-only validation:
   - `git diff --check`
   - Prettier check for modified markdown/yaml files
   - Pattern checks for `phase-32-advanced-edition-doc-governance-state-sync`, `Cost Calibration Gate remains blocked`, `code-stage queue seeding remains paused`, and `taskKind: docs_only`

## Risk Defense

- The task updates only governance state and evidence.
- The task does not create code implementation subtasks.
- The task records the latest confirmed commit `6d895796fa099c43037bd1c2eb65870e4f342e96` as the current master/origin master reference.
- The task keeps `phase-30-advanced-edition-cost-calibration-gate` as a blocked gate that still requires fresh explicit approval before execution.

## Completion Criteria

- Queue and project state both identify Phase 32 as docs-only governance state sync.
- Next recommended action points to document governance hardening, not code-stage implementation.
- Evidence includes validation command results.
- Worktree contains no product code, schema, migration, API, provider, env/secret, staging/prod/cloud/deploy, payment, or external-service changes.
