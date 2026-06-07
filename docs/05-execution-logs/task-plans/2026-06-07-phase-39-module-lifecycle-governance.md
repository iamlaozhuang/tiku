# Phase 39 Module Lifecycle Governance Plan

## Scope

- Task id: `phase-39-module-lifecycle-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-39-module-lifecycle-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The project now has an automated advancement governance charter, but it still needs a module-level lifecycle rule that describes how requirements become modules, how modules become tasks, how modules close, and how the next module starts without losing document freshness or Git recovery state.

## Implementation

- Add `docs/04-agent-system/sop/module-lifecycle-governance.md`.
- Register `phase-39-module-lifecycle-governance` in `task-queue.yaml`.
- Update `project-state.yaml` to include the module lifecycle SOP path and current Git recovery SHA.
- Record evidence and audit review for the module lifecycle governance task.

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
