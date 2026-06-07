# Phase 42 Codex App Readiness Audit Governance Plan

## Scope

- Task id: `phase-42-codex-app-readiness-audit-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-42-codex-app-readiness-audit-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The automation governance stack needs a Codex Windows desktop readiness audit rule so tool, permission, skill, plugin, browser, thread, and cleanup boundaries are visible before long automated runs.

## Implementation

- Add `docs/04-agent-system/sop/codex-app-readiness-audit-governance.md`.
- Register `phase-42-codex-app-readiness-audit-governance` in `task-queue.yaml`.
- Update `project-state.yaml` to include the Codex App readiness SOP path and current task handoff.
- Record evidence and audit review.

## Boundaries

- No product code.
- No schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No Codex configuration changes.
- No skill, plugin, connector, package, or CLI installation.
- No session history cleanup, cache deletion, GUI launch, or browser launch.
- No env/secret access or modification.
- No provider, staging, prod, cloud, deploy, payment, or external-service action.
- No code-stage queue seeding.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- `Select-String` for required sections and project terms
- Search check for forbidden conflicting terms in newly created files
