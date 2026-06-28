# Standard Advanced Backend UX Design First Contract

Task id: `standard-advanced-backend-ux-design-first-contract-2026-06-27`

Branch: `codex/standard-advanced-backend-ux-contract-20260627`

Task kind: `docs_state_planning`

## Goal

Create a docs/state-only design-first contract for standard and advanced backend workspaces before any UI/source implementation. The contract must define information architecture, routes, role/edition boundaries, states, component reuse, acceptance labels, and follow-up task split for operations, content, and organization admin workspaces.

This task does not modify source, tests, e2e, schema, migration, seed, package or lockfiles, `.env*`, Provider configuration, Cost Calibration, browser/dev-server runtime, DB, staging/prod, payment, OCR/export, PR, force push, release readiness, or final Pass state.

## Documents Read

- `AGENTS.md`
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
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/2026-06-21-admin-experience-gap-closure-plan.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-27-standard-advanced-edition-experience-optimization-planning.md`

The evidence-only source is used only as the immediate predecessor planning record. It does not authorize runtime work or source implementation.

## Requirement Decision Map

- Backend UI/UX optimization must run a design-first pass before implementation.
- `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin` require separated backend workspaces, role-aware landing, visible logout, scoped navigation, and unrelated-surface denial.
- Organization admin is a first-class `organization`-scoped admin domain, not an `ops_admin` page with a filter.
- `org_standard_admin` can manage employees and view organization authorization/status only.
- `org_advanced_admin` can manage employees, training, analytics summaries, and organization-owned AI question/AI `paper` generation entries.
- Content backend requires content lifecycle surfaces plus discoverable `AI出题` and `AI组卷` draft/review entries; generated content must remain separate from formal `question` and `paper`.
- Operations backend owns `redeem_code`, `org_auth`, `authorization`, `employee`, `audit_log`, and `ai_call_log` summaries; it must not become a content authoring workspace.
- `effectiveEdition` is service-computed. UI navigation, visibility, or route presence must not be treated as the authorization boundary.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Conflict Check

- Standard MVP originally excluded enterprise self-service, but the 2026-06-24 role-separated addendum requires first-class standard/advanced organization admin workspaces for the unified standard/advanced acceptance track.
- Advanced AI generation entries are required for advanced contexts, while Provider execution and cost remain blocked. The design contract must therefore separate discoverable entry and request shell from real Provider execution.
- Content/organization AI output must remain isolated from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` until a later governed adoption path is approved.
- Historical browser evidence may inform the contract, but this task will not rerun browser validation or claim runtime acceptance.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/**`
- `docs/05-execution-logs/task-plans/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/evidence/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/acceptance/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`

## Blocked Files And Actions

- `src/**`
- `tests/**`
- `e2e/**`
- `schema/**`, `drizzle/**`, migrations, seed files
- `package.json`, lockfiles
- `.env*`
- Browser, dev-server, Playwright/e2e runtime
- DB connection or mutation
- Provider call or Provider configuration
- Cost Calibration
- staging/prod/deploy/payment/OCR/export/external-service work
- PR, force push, release readiness, final Pass

## Documentation Approach

1. Create this task plan before state or requirement edits.
2. Add a design-first UX contract under `docs/01-requirements/traceability/`.
3. Update requirement indexes only if needed to expose the new contract from the SSOT reading surface.
4. Register and close this docs/state task in `task-queue.yaml`.
5. Update `project-state.yaml` current task and planning summary.
6. Create evidence, audit review, and acceptance records with redacted summaries.
7. Preserve all high-risk gates as blocked.

## Contract Sections To Produce

- Scope and non-goals.
- Workspace information architecture.
- Target route map using public route concepts only; no numeric ids.
- Role/edition capability and denial matrix for `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin`.
- Shared backend shell and component reuse rules.
- List/detail/form states: loading, empty, error, permission denied, standard unavailable, advanced available, conflict warning, destructive confirmation.
- Data and evidence redaction rules.
- Acceptance labels that distinguish `design_contract`, `source_only`, `permission_contract`, `browser_validation`, and blocked high-risk gates.
- Follow-up task split from low to high risk.
- Copyable approval text for the next source-only or contract task.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/00-index.md docs/01-requirements/advanced-edition/00-index.md docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/task-plans/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/evidence/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/audits-reviews/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/acceptance/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/00-index.md docs/01-requirements/advanced-edition/00-index.md docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/task-plans/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/evidence/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/audits-reviews/2026-06-27-standard-advanced-backend-ux-design-first-contract.md docs/05-execution-logs/acceptance/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-advanced-backend-ux-design-first-contract-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-advanced-backend-ux-design-first-contract-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId standard-advanced-backend-ux-design-first-contract-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- The contract would require source, test, schema, migration, package, lockfile, `.env*`, browser, DB, Provider, staging/prod, deploy, payment, OCR/export, or external-service work.
- Evidence would need credentials, tokens, DB URLs, prompt, provider payload, raw AI output, raw employee answer text, plaintext `redeem_code`, screenshots, traces, or full `question`/`paper` content.
- The task would need to claim release readiness or final Pass.
- Validation reports a hard blocker that cannot be fixed inside docs/state-only scope.
