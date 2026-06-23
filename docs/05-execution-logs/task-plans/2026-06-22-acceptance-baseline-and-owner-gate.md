# Acceptance Baseline And Owner Gate Task Plan

taskId: acceptance-baseline-and-owner-gate-2026-06-22
branch: codex/acceptance-baseline-owner-gate-20260622
createdAt: "2026-06-22T13:15:00-07:00"
status: owner_assignment_repair_validated

## Read Inputs

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-checklist.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-naming-packet.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-owner-assignment-staging-boundary-packet.yaml`
- `docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md`

## Scope

This task freezes the Standard and Advanced MVP acceptance baseline and checks whether the L6 owner gate can pass.
It is a docs/state-only task. It does not run browser/e2e validation, start a dev server, read or edit env files,
call Provider/model APIs, touch schema/migration/database data, change dependencies, deploy, create accounts, or make
previewReleaseReady, productionReady, or acceptance-pass claims.

## Implementation Approach

1. Freeze the baseline to the current acceptance plan, serial batch id, and current `master`/`origin/master` commit.
2. Inspect the preview owner acceptance checklist, naming packet, and staging boundary packet for real named owner
   assignments.
3. Record the L6 owner gate as blocked if required owner roles remain unnamed.
4. Update queue and project state so later serial acceptance tasks cannot proceed until this gate is repaired.
5. Write redacted evidence and audit review records that make the stop condition explicit.

## 2026-06-22 Owner Assignment Repair

User approved a single-owner model: `laozhuang` is the accountable owner for accounts, data, evidence, monitoring,
incident response, rollback, stop authority, staging boundary, and final acceptance review. Codex is only an execution
and evidence-preparation assistant and is not an accountable owner.

Repair approach:

1. Record `laozhuang` as the non-sensitive named owner reference for required L6 owner roles.
2. Keep conditional roles assigned to `laozhuang` only if the related scope is later requested and fresh approval
   exists.
3. Keep account creation/disablement, staging resources, Provider/model calls, env/secret changes, database work,
   browser/e2e runtime, deployment, payment/external-service work, PR/force-push/release, and Cost Calibration Gate
   blocked without future fresh approval.
4. Close the baseline and owner gate task after local validation evidence passes.

## Risk Controls

- Do not invent owner names, email addresses, account identifiers, credentials, or contact details.
- Do not mark the task as acceptance passed.
- Keep AP-01 through AP-11, Provider, staging, payment, database, env, dependency, browser/e2e, and Cost Calibration
  gates blocked unless a future fresh approval and matching evidence exist.
- Keep committed evidence metadata-only and free of secrets, raw prompts, Provider payloads, raw generated content,
  raw employee answers, full paper content, plaintext redeem codes, and private identifiers.

## Validation Plan

- Run the task queue validation command:
  `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-22-acceptance-baseline-and-owner-gate.md docs/05-execution-logs/evidence/2026-06-22-acceptance-baseline-and-owner-gate.md docs/05-execution-logs/audits-reviews/2026-06-22-acceptance-baseline-and-owner-gate.md`
- Run `git diff --check`.
- Run Module Run v2 local hardening checks where applicable for a docs/state blocked closeout.
