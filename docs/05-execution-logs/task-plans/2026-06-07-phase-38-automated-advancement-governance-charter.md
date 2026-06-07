# Phase 38 Automated Advancement Governance Charter Plan

## Scope

- Task id: `phase-38-automated-advancement-governance-charter`
- Task kind: `docs_only`
- Branch: `codex/phase-38-automated-advancement-governance`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Implementation

- Add `docs/04-agent-system/sop/automated-advancement-governance.md`.
- Register the docs-only charter task in `task-queue.yaml`.
- Update `project-state.yaml` to point to the charter task and SOP path.
- Record evidence and audit review.

## Governance Decisions

- Keep `automation.mode` as `semi_auto`; this task defines governance but does not activate unrestricted automation.
- Keep code-stage queue seeding paused unless explicitly approved later.
- Keep Cost Calibration Gate blocked pending fresh explicit approval.
- Keep merge, push, deployment, provider, env/secret, payment, and external-service actions under explicit approval gates.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-docs>`
- `Select-String` for required sections and blocked gate wording
- Search check on new files for forbidden terms that conflict with project terminology
