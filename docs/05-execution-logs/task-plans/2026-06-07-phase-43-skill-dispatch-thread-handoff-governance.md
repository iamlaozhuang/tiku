# Phase 43 Skill Dispatch Thread Handoff Governance Plan

## Scope

- Task id: `phase-43-skill-dispatch-thread-handoff-governance`
- Task kind: `docs_only`
- Branch: `codex/phase-43-skill-dispatch-thread-handoff-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/codex-app-readiness-audit-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Problem

The automation governance stack needs a skill dispatch and thread handoff rule so required skills, plugin fallbacks, context compaction recovery, and new-thread continuation are auditable.

## Implementation

- Add `docs/04-agent-system/sop/skill-dispatch-and-thread-handoff-governance.md`.
- Register `phase-43-skill-dispatch-thread-handoff-governance` in `task-queue.yaml`.
- Update `project-state.yaml` to include the skill/thread handoff SOP path and current task handoff.
- Record evidence and audit review.

## Boundaries

- No product code.
- No schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No skill, plugin, connector, package, CLI, or Codex configuration installation/change.
- No thread creation or thread management action.
- No env/secret access or modification.
- No provider, staging, prod, cloud, deploy, payment, or external-service action.
- No code-stage queue seeding.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- `Select-String` for required sections and project terms
- Search check for forbidden conflicting terms in newly created files
