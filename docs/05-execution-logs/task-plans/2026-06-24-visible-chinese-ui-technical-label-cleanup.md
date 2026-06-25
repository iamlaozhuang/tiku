# Task Plan: visible-chinese-ui-technical-label-cleanup-2026-06-24

## Metadata

- Task id: `visible-chinese-ui-technical-label-cleanup-2026-06-24`.
- Branch: `codex/visible-chinese-ui-label-cleanup-20260624`.
- Task kind: `implementation`.
- Execution profile: `low_risk_visible_ui_copy_cleanup_no_runtime`.
- Approval consumed: current user selected this next task on 2026-06-24.
- Runtime validation: blocked for this task.
- Final Pass claim: none.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- `GAP-UI-01` from the visible Chinese UI planning task is the implementation target.
- R1, R2, R7, R8, US-06-13, and US-06-14 require role-separated backend surfaces to have clear Chinese navigation,
  labels, states, and denial or unavailable messaging.
- US-06-15 requires content-admin `AI出题` and `AI组卷` draft/review entries and copy that does not imply direct formal
  `question` or `paper` writes.
- The advanced AI scope clarification requires discoverable learner/admin AI entries while preserving formal-content and
  Provider gates.
- ADR-006 confirms installed AI packages are not Provider execution approval.
- ADR-007 confirms UI visibility is not an authorization boundary; this task must not change `effectiveEdition` or
  authorization behavior.

## Requirement Mapping Result

- This task maps to visible UI copy only: headings, labels, helper text, placeholders, aria labels, empty/error states,
  and status wording.
- It does not change runtime authorization, route guards, service contracts, API field names, database fields, data
  model, Provider configuration, or content adoption behavior.
- Registered English identifiers remain valid in source code and API contracts. They should be replaced only where they
  are user-visible UI text.

## Role Mapping Result

- `personal_standard_student`: direct advanced-only UI copy should be Chinese when displayed; this task does not solve
  account state or runtime denial.
- `personal_advanced_student`: learner AI page visible label should use Chinese `个人 AI 训练` wording.
- `org_standard_employee` and `org_advanced_employee`: this task may clean shared learner/organization-training labels,
  but does not fix employee entry availability.
- `org_standard_admin` and `org_advanced_admin`: organization backend labels may be cleaned where in scope; workspace
  separation remains a later functional task.
- `content_admin`: content management and AI draft/review pages must avoid visible English technical labels.
- `ops_admin`: operations pages must avoid visible English technical labels while keeping redaction and Provider gates.

## Acceptance Mapping Result

- Expected result: source and focused test checks pass for visible Chinese UI label cleanup.
- Browser/runtime role-row acceptance remains blocked until a later approved runtime rerun.
- Standard/advanced MVP final Pass remains blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.

## Conflict Check

- No SSOT conflict found. Requirements allow registered English identifiers in contracts and source, while role runtime
  acceptance requires visible user-facing UI to be Chinese.
- Evidence logs are used only to locate visible labels and prioritize cleanup. They do not create new behavior
  requirements.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- `docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`.
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`.
- `src/features/admin/contact-config/AdminContactConfigPage.tsx`.
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`.
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`.
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`.
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx`.
- `src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx`.
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`.
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`.
- `src/components/admin/PaperManagement/AdminPaperManagement.tsx`.
- `src/features/admin/paper-management/AdminPaperManagementClient.test.tsx`.
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `tests/unit/protected-route-guard-ui.test.ts`.
- `tests/unit/student-personal-ai-generation-ui.test.ts`.
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`.
- `tests/unit/phase-11-audit-log-coverage-hardening.test.ts`.
- `tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`.
- `tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`.
- `tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts`.
- `tests/unit/admin-model-config-management-ui.test.ts`.
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `tests/unit/organization-training-admin-entry-surface.test.ts`.
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`.
- `tests/unit/admin-question-material-ui.test.ts`.
- `tests/unit/admin-paper-ui.test.ts`.
- `tests/unit/admin-ai-generation-entry-surface.test.ts`.
- `tests/unit/admin-shell-common-interaction.test.ts`.

## Blocked Files And Actions

- Blocked files: `.env*`, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`, `e2e/**`,
  `playwright-report/**`, `test-results/**`, `.next/**`, and local private credential paths.
- Blocked actions: Browser or Playwright runtime observation, dev-server start, credential entry or credential document
  access, account mutation, database read/write, schema/migration, dependency change, Provider call or configuration,
  Provider cost/quota measurement, Cost Calibration, staging/prod/cloud/deploy, payment/external service, PR,
  force-push, and final Pass claim.

## Implementation Approach

1. Search only the allowed source files for visible English technical labels identified by the planning output.
2. Replace user-visible labels with concise Chinese business wording.
3. Preserve internal names, route paths, API fields, `data-*` attributes, and registered domain identifiers in code.
4. Update focused tests only where they assert visible old UI strings.
5. Run the queued focused unit test command, lint, typecheck, diff check, and hardening.
6. Write evidence and audit review with changed-file inventory, validation results, residual runtime gap, and next task.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/protected-route-guard-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts tests/unit/phase-11-audit-log-coverage-hardening.test.ts tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts tests/unit/admin-model-config-management-ui.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts src/features/admin/paper-management/AdminPaperManagementClient.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-shell-common-interaction.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId visible-chinese-ui-technical-label-cleanup-2026-06-24`.
