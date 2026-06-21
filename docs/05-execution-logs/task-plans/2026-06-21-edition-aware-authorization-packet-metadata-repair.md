# 2026-06-21 Edition-Aware Authorization Packet Metadata Repair Plan

## Goal

Repair the docs/state-only packet split so each future edition-aware authorization packet has the mechanism metadata
needed for later task-level approval and execution.

## Read Standards And Decisions

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Scope

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- matching evidence and audit review

Blocked changes:

- `src/**`
- `tests/**`
- `e2e/**`
- `drizzle/**`
- package or lock files
- `.env*`
- scripts
- provider, deployment, payment, database, or Cost Calibration Gate work

## Repair Steps

1. Add a closed docs-state repair task for this metadata correction.
2. Add missing `executionProfile`, `evidenceMode`, `validationPolicy`, `queueSelectionMode`, `planPath`,
   `evidencePath`, `auditReviewPath`, and `closeoutPolicy` fields to the five future packets.
3. Update `project-state.yaml` to reflect the current docs-state repair task and accepted master baseline.
4. Run docs/state validation, hardening, closeout readiness, pre-push readiness, FF merge, push, and branch cleanup.

## Risk Controls

- This task does not approve or execute any future schema/API/service/UI/e2e packet.
- All future runtime packets remain blocked until task-level fresh approval.
- Evidence records only command names, branch names, task ids, commit ids, and redacted summaries.
