# Phase 47 Code-Stage Task Seeding Governance Plan

## Scope

- Task id: `phase-47-code-stage-task-seeding-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-47-code-stage-task-seeding-governance`

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
- `docs/04-agent-system/sop/parallel-work-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The automation governance stack needs a rule for future code-stage queue seeding so advanced edition implementation tasks can be created only after explicit approval, with narrow scope, concrete validation, and blocked gate isolation.

## Implementation

- Add `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`.
- Register `phase-47-code-stage-task-seeding-governance` in `task-queue.yaml`.
- Update `project-state.yaml` with the code-stage task seeding SOP path and phase handoff.
- Record evidence and audit review.

## Boundaries

- No product code.
- No schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No actual code-stage queue seeding.
- No implementation queue items.
- No `automation.mode` change.
- No skill, plugin, connector, package, CLI, or Codex configuration installation/change.
- No thread creation, worktree creation, parallel worker execution, or destructive recovery.
- No env/secret access or modification.
- No provider, staging, prod, cloud, deploy, payment, or external-service action.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- Required section search for seeding approval gate, required inputs, seedable task kinds, task template, scope split rules, MVP boundaries, validation selection, seeding review gate, and blocked Cost Calibration Gate wording
- Added-line search check for prohibited conflicting terminology
