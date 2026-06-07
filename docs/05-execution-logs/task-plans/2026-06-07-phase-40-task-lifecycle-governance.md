# Phase 40 Task Lifecycle Governance Plan

## Scope

- Task id: `phase-40-task-lifecycle-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-40-task-lifecycle-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The project now has automation and module lifecycle governance, but it still needs a task-level lifecycle SOP that defines pre-task reading, planning, TDD, validation, review, evidence, commit, closeout, handoff, and the post-closeout SHA rule.

## Implementation

- Add `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- Register `phase-40-task-lifecycle-governance` in `task-queue.yaml`.
- Update `project-state.yaml` to include the task lifecycle SOP path and current task handoff.
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
