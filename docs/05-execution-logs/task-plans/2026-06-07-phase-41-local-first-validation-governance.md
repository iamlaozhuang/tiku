# Phase 41 Local First Validation Governance Plan

## Scope

- Task id: `phase-41-local-first-validation-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-41-local-first-validation-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The automation governance stack needs a local-first validation rule so development can continue in local `dev` while staging, prod, real provider, payment, and external-service work remain approval-gated.

## Implementation

- Add `docs/04-agent-system/sop/local-first-validation-governance.md`.
- Register `phase-41-local-first-validation-governance` in `task-queue.yaml`.
- Update `project-state.yaml` to include the local-first validation SOP path and current task handoff.
- Record evidence and audit review.

## Boundaries

- No product code.
- No schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No env/secret access or modification.
- No provider, staging, prod, cloud, deploy, payment, or external-service action.
- No code-stage queue seeding.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- `Select-String` for required sections and project terms
- Search check for forbidden conflicting terms in newly created files
