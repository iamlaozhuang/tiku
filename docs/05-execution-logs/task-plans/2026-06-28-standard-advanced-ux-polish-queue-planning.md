# Standard Advanced UX Polish Queue Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the organization backend standard/advanced UX polish matrix and seed the next approval-ready serial task queue without touching runtime, source, DB, Provider, staging/prod, or release gates.

**Architecture:** This is an L0 docs/state planning task. It uses requirements and execution evidence as inputs, records a traceability contract, updates task state and queue metadata, and writes evidence/audit/acceptance outputs. Future work is split by risk tier so source-only UI, permission contract, local browser validation, DB/schema, Provider/Cost, staging/prod, payment, OCR/export, and closeout cannot be conflated.

**Tech Stack:** Next.js/TypeScript monolith context only; this task changes Markdown/YAML docs and runs scoped formatting plus Module Run v2 governance checks.

---

## Task

- Task id: `standard-advanced-ux-polish-queue-planning-2026-06-28`
- Branch: `codex/standard-advanced-ux-polish-queue-planning-20260628`
- Task kind: `docs_state_planning`
- Runtime claim: none.
- Release claim: none.
- Cost Calibration Gate: blocked pending fresh explicit approval.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- ADR-007 and `edition-aware-authorization-requirements.md`: `effectiveEdition` is service-computed; UI visibility and copy are not authorization boundaries.
- ADR-004 and ADR-005: dev, staging, and prod remain isolated; this task does not authorize staging/prod resources or release decisions.
- ADR-006: installed AI SDK packages do not authorize Provider calls, Provider configuration, env/secret access, or Cost Calibration.
- `modules/06-admin-ops.md`: organization backend is a first-class organization workspace, separate from operations and content workspaces.
- `modules/04-organization-training.md`: standard organization admins cannot manage training; advanced organization admins can manage training inside organization scope.
- `modules/05-organization-analytics.md`: organization analytics is summary-only; export and raw employee answer text remain blocked.
- `modules/08-organization-ai-generation.md`: organization AI generation entries are discoverable only for valid advanced organization context; Provider and formal content adoption remain blocked.
- `2026-06-27-standard-advanced-backend-ux-design-first-contract.md`: future UX work must preserve shell, nav, gated states, permission-denied states, standard-unavailable states, and redacted summaries.
- `2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`: prior three-task polish packet is historical input; this task refreshes the matrix and creates the next split requested by current approval.

## Requirement Mapping

This task maps current organization backend UX polish into four follow-up execution packets:

1. Shell/navigation/gated-copy source-only polish.
2. Organization workspace page-state source-only polish.
3. Permission/authorization contract TDD for UX-sensitive direct-route and capability decisions.
4. Local browser validation after the source and contract tasks, only with fresh approval.

The task also records blocked high-risk lanes for DB/schema, Provider/Cost, staging/prod/deploy, payment, OCR/export, external-service, PR/force push, release readiness, final Pass, and closeout.

## Evidence-Only Sources

Historical execution logs read as evidence only:

- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-shell-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-backend-role-browser-validation.md`
- `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`

These logs do not supersede requirement SSOT documents or ADRs.

## Conflict Check

No SSOT conflict blocks this docs/state planning task.

The durable sources agree that:

- standard organization admin UX should be useful and explanatory without enabling advanced-only controls;
- advanced organization admin UX should expose training, analytics, and organization AI generation entries;
- page state and gated copy can be polished as source-only UI work, but authorization remains service/contract-owned;
- local browser evidence can validate visible role/route states but cannot claim staging, release, Provider, payment, or final Pass readiness.

## File Plan

- Create `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`.
- Update `docs/01-requirements/00-index.md`.
- Update `docs/01-requirements/advanced-edition/00-index.md`.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-ux-polish-queue-planning.md`.
- Create `docs/05-execution-logs/audits-reviews/2026-06-28-standard-advanced-ux-polish-queue-planning.md`.
- Create `docs/05-execution-logs/acceptance/2026-06-28-standard-advanced-ux-polish-queue-planning.md`.

## Implementation Steps

- [x] Step 1: Record the refreshed experience matrix, risk tiering, follow-up task boundaries, validation gates, and copyable approval text in the new traceability document.
- [x] Step 2: Add requirement index links for the new planning traceability document.
- [x] Step 3: Update project state with this task as the current docs/state planning checkpoint and record blocked gates.
- [x] Step 4: Add the planning task and blocked follow-up queue entries to `task-queue.yaml`.
- [x] Step 5: Write evidence, audit review, and acceptance documents with redaction and blocked-work statements.
- [x] Step 6: Run scoped Prettier write/check on changed docs/state files.
- [x] Step 7: Run `git diff --check`.
- [x] Step 8: Run `Get-TikuProjectStatus.ps1` and Module Run v2 pre-commit hardening for this task.
- [ ] Step 9: Commit locally if validation passes; do not merge, push, create PR, force push, or delete the branch.

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`

## Blocked Scope

- `src/**`
- `tests/**`
- `e2e/**`
- schema, drizzle, migration, seed
- `package.json` and lockfiles
- `.env*`
- browser/dev-server/e2e runtime
- DB connection, read, write, migration, or seed
- Provider call or configuration
- Cost Calibration
- staging/prod/deploy
- payment, OCR, export, or external-service
- PR, force push
- release readiness or final Pass

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/00-index.md docs/01-requirements/advanced-edition/00-index.md docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/task-plans/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/evidence/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/audits-reviews/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/acceptance/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/00-index.md docs/01-requirements/advanced-edition/00-index.md docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/task-plans/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/evidence/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/audits-reviews/2026-06-28-standard-advanced-ux-polish-queue-planning.md docs/05-execution-logs/acceptance/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-advanced-ux-polish-queue-planning-2026-06-28`

## Stop Conditions

- Any source/test/e2e/schema/package/env edit becomes necessary.
- Any browser/dev-server/DB/Provider/staging/payment runtime becomes necessary.
- Requirements conflict and need owner decision before task split.
- Evidence would need sensitive data or runtime proof.
- Closeout actions beyond local commit are requested without fresh approval.

Cost Calibration Gate remains blocked pending fresh explicit approval.
