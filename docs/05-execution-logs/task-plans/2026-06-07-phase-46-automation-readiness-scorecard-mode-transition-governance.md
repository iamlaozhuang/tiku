# Phase 46 Automation Readiness Scorecard Mode Transition Governance Plan

## Scope

- Task id: `phase-46-automation-readiness-scorecard-mode-transition-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-46-automation-readiness-scorecard-mode-transition-governance`

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
- `docs/04-agent-system/sop/parallel-work-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/codex-app-readiness-audit-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The automation governance stack needs a readiness scorecard and mode transition rule so `semi_auto` cannot be upgraded by implication, old approval, or incomplete local-only evidence.

## Implementation

- Add `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`.
- Register `phase-46-automation-readiness-scorecard-mode-transition-governance` in `task-queue.yaml`.
- Update `project-state.yaml` with the scorecard SOP path and phase handoff.
- Record evidence and audit review.

## Boundaries

- No product code.
- No schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No `automation.mode` change; it remains `semi_auto`.
- No actual mode transition proposal execution.
- No code-stage queue seeding.
- No skill, plugin, connector, package, CLI, or Codex configuration installation/change.
- No thread creation, worktree creation, parallel worker execution, or destructive recovery.
- No env/secret access or modification.
- No provider, staging, prod, cloud, deploy, payment, or external-service action.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- Required section search for mode labels, scorecard dimensions, readiness verdicts, mode transition gate, automatic advancement blockers, evidence shape, and blocked Cost Calibration Gate wording
- Added-line search check for prohibited conflicting terminology
