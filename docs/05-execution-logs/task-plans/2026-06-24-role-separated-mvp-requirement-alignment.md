# 2026-06-24 Role-Separated MVP Requirement Alignment Task Plan

## Task

- Task id: `role-separated-mvp-requirement-alignment-2026-06-24`
- Branch: `codex/role-separated-mvp-requirement-alignment-20260624`
- Owner approval: laozhuang approved `2026-06-24-role-separated-mvp-requirement-alignment`.
- Scope: docs-only requirement alignment before repair implementation planning.

## Goal

Move owner-confirmed role-separated MVP repair requirements from execution/acceptance artifacts into durable
requirement and traceability documents so the requirement tree remains the source of truth for later repair packages.

## Standards And Context Read

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
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-mvp-repair-issue-list-and-requirement-decisions.md`
- `docs/05-execution-logs/acceptance/2026-06-23-advanced-ai-entry-ui-ux-contract.md`

## Requirement Alignment Plan

### Step 1: Register The Docs-Only Task

- Add the task to `docs/04-agent-system/state/task-queue.yaml`.
- Update `docs/04-agent-system/state/project-state.yaml` so the current task, branch, evidence, audit, and allowed scope are explicit.

### Step 2: Define SSOT Routing

- Add or update requirement index text so later repair tasks know where to read durable requirements.
- Add a traceability alignment artifact that maps every owner-confirmed repair item to its canonical requirement document.

### Step 3: Update Authorization And Operations Requirements

- Update `edition-aware-authorization-requirements.md`.
- Update `modules/01-user-auth.md` for employee import and derived authorization semantics.
- Update `modules/06-admin-ops.md` and `stories/epic-06-admin-ops.md` for backend workspace separation, logout, `redeem_code`, `org_auth`, upgrade, and employee import template expectations.
- Update advanced operations authorization/quota module and story for standard/advanced org authorization, `redeem_code`, and upgrade requirements.

### Step 4: Update Learner And Enterprise AI Requirements

- Update personal learner AI generation requirements.
- Update organization training requirements.
- Update organization AI generation requirements.
- Update related advanced edition stories so visible entry, role, edition, and formal-content boundaries are explicit.

### Step 5: Update Traceability Matrices

- Update capability, role-experience, requirement-fulfillment, authorization acceptance, and source index traceability surfaces as needed.
- Every repair requirement must have a durable requirement location and a future validation expectation.

### Step 6: Evidence And Two Independent Review Passes

- Write evidence summarizing changed documents, command results, and redaction boundaries.
- Write an audit review with two independent self-review passes:
  - Review pass 1: SSOT coverage and completeness.
  - Review pass 2: ambiguity, consistency, and implementation-readiness.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/05-execution-logs/task-plans/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Blocked Files And Actions

- No `src/**`, `tests/**`, `e2e/**`, `drizzle/**`, `scripts/**`, package or lockfile edits.
- No `.env*` reads or writes.
- No database, seed, schema, migration, Provider, Cost Calibration, staging/prod, payment, external-service, browser runtime, or dev-server work.
- No final MVP Pass claim.
- No push, PR, or merge without later explicit approval.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown <changed docs>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-mvp-requirement-alignment-2026-06-24`
- Independent self-review pass 1 recorded in audit review.
- Independent self-review pass 2 recorded in audit review.

## Risk Controls

- Keep execution logs as evidence history, not the only source of future implementation requirements.
- Do not duplicate the authorization model; align with `org_auth`, future `org_auth_scope`, `authorization`, `auth_upgrade`, and ADR-007.
- Preserve standard/advanced boundaries and role separation in both learner and backend documents.
- Mark backend UI/UX design-first as a prerequisite for optimization implementation.
- Keep `Covered` contract status distinct from runtime Pass and final acceptance Pass.
