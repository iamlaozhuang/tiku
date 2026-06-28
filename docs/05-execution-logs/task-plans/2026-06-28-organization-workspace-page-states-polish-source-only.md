# Organization Workspace Page States Polish Source-Only Plan

## Task

- Task id: `organization-workspace-page-states-polish-source-only-2026-06-28`
- Branch: `codex/organization-workspace-page-states-polish-20260628`
- Task kind: `implementation_tdd`
- Execution profile: `local_low_risk_source_only_ui`
- Approval source: current user batch approval on 2026-06-28 for serial local low-risk UX polish tasks and per-task local commit, fast-forward merge, push, and cleanup.

## Required Reading

### Governance And Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- ADRs under `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`

### SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`

### Source And Test Files

- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `tests/unit/organization-portal-admin-entry-surface.test.ts`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`

## Requirement Decision Map

| Decision                                                                                                   | Source                                             | Impact                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Standard organization admins must not receive usable advanced controls.                                    | UX polish planning and ADR-007.                    | Standard-unavailable states must be clear, non-interactive, and backed by service capability summary.                   |
| Advanced organization pages remain local/source-only unless later tasks approve DB/provider/browser gates. | Advanced modules and Cost Calibration blocked SOP. | Training, analytics, and AI pages must communicate draft/summary/provider-blocked boundaries without runtime overclaim. |
| Page states need explicit loading, empty, error, disabled, and upgrade hierarchy.                          | UX-P2 in 2026-06-28 planning.                      | Tests should lock the state semantics and user-facing copy for portal, training, analytics, and AI generation.          |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-state-polish-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-permission-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-local-browser-validation.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`

These are history only. They do not approve browser, DB, Provider, staging/prod, Cost Calibration, release readiness, or final Pass in this task.

## Conflict Check

The task queue, ADR-007, and UX polish planning agree that UI copy must not become the authorization boundary. Page-state polish may improve guidance, disabled states, and information hierarchy, but direct-route decisions must still consume `resolveOrganizationWorkspacePageAccess` and the service-provided capability summary.

## Allowed Scope

- Queue-listed portal, training, analytics, AI generation, and organization workspace access source files.
- Queue-listed focused unit tests.
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, audit review, and acceptance docs.

## Blocked Scope

- Permission model changes beyond presentational state classification.
- DB connection/read/write, schema/migration/seed, `org_auth_scope` persistence.
- Provider call/configuration, prompt/raw AI output, Cost Calibration.
- Browser/dev-server/e2e.
- Package/lockfile/env.
- staging/prod/deploy, payment, OCR/export, external service.
- PR, force push, release readiness, final Pass.

## TDD Plan

1. Add focused expectations for:
   - standard-unavailable pages using `data-admin-ux-state="standard-unavailable"` instead of generic permission-denied;
   - training disabled source-binding guidance naming the create-draft prerequisite and metadata-only boundary;
   - analytics initial empty/ready guidance naming summary-only and export-disabled boundaries;
   - organization AI empty/error/provider-blocked states using organization-specific copy without enabling Provider.
2. Run the focused unit command and confirm the new expectations fail for the intended missing copy/state semantics.
3. Implement the smallest source-only changes in the allowed page components and presentational access helper only if needed.
4. Re-run focused unit tests, lint, typecheck, scoped Prettier, diff check, project status, and Module Run v2 hardening.

## Risk Defenses

- Keep `effectiveEdition` and advanced access decisions service-derived through existing capability summary helpers.
- Do not introduce new routes, schema, providers, package dependencies, or runtime browser evidence.
- Do not expose raw employee answers, full `question`/`paper` content, provider payloads, prompts, tokens, cookies, localStorage values, DB rows, or plaintext `redeem_code`.
- Preserve existing redacted IDs policy in tests and UI.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/organization-workspace/admin-organization-workspace-access.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-page-states-polish-source-only.md docs/05-execution-logs/evidence/2026-06-28-organization-workspace-page-states-polish-source-only.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-page-states-polish-source-only.md docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-page-states-polish-source-only.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/organization-workspace/admin-organization-workspace-access.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-page-states-polish-source-only.md docs/05-execution-logs/evidence/2026-06-28-organization-workspace-page-states-polish-source-only.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-page-states-polish-source-only.md docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-page-states-polish-source-only.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-page-states-polish-source-only-2026-06-28`

## Stop Conditions

- Any requested state requires DB, schema, Provider, browser/e2e, env, dependency, staging/prod, deploy, payment, OCR/export, Cost Calibration, PR, force push, release readiness, or final Pass.
- Focused tests require changing non-allowed files.
- Page-state copy would imply Provider/payment/export/runtime readiness.
