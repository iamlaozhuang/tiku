# Phase 45 Failure Retry Human Takeover Governance Plan

## Scope

- Task id: `phase-45-failure-retry-human-takeover-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-45-failure-retry-human-takeover-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/skill-dispatch-and-thread-handoff-governance.md`
- `docs/04-agent-system/sop/parallel-work-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The automation governance stack needs a failure and takeover rule so agents do not retry blindly, bypass blocked gates, or ask for human intervention without a recoverable evidence package.

## Implementation

- Add `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`.
- Register `phase-45-failure-retry-human-takeover-governance` in `task-queue.yaml`.
- Update `project-state.yaml` with the failure retry and human takeover SOP path and phase handoff.
- Record evidence and audit review.

## Boundaries

- No product code.
- No schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No actual failure injection, destructive recovery, thread creation, worktree creation, or parallel worker execution.
- No skill, plugin, connector, package, CLI, or Codex configuration installation/change.
- No env/secret access or modification.
- No provider, staging, prod, cloud, deploy, payment, or external-service action.
- No code-stage queue seeding.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- Required section search for failure classification, retry budget, retry preconditions, human takeover triggers, blocked task recording, human handoff package, recovery after human decision, and blocked Cost Calibration Gate wording
- Added-line search check for prohibited conflicting terminology
