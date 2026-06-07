# Phase 44 Parallel Work Governance Plan

## Scope

- Task id: `phase-44-parallel-work-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-44-parallel-work-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/skill-dispatch-and-thread-handoff-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The automation governance stack needs a rule for parallel threads, branches, and worktrees. Without it, parallel work could create state conflicts, hidden branch drift, unclear merge order, or unreviewable evidence.

## Implementation

- Add `docs/04-agent-system/sop/parallel-work-governance.md`.
- Register `phase-44-parallel-work-governance` in `task-queue.yaml`.
- Update `project-state.yaml` with the parallel work SOP path and phase handoff.
- Record evidence and audit review.

## Boundaries

- No product code.
- No schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No actual parallel thread, branch batch, or worktree execution beyond this single task branch.
- No skill, plugin, connector, package, CLI, or Codex configuration installation/change.
- No thread creation or thread management action.
- No env/secret access or modification.
- No provider, staging, prod, cloud, deploy, payment, or external-service action.
- No code-stage queue seeding.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- Required section search for parallel entry, coordinator role, file lock, serial integration, stop conditions, and blocked Cost Calibration Gate wording
- Added-line search check for prohibited conflicting terminology
