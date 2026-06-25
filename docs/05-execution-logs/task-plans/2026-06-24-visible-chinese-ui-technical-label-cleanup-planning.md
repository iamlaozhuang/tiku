# Task Plan: visible-chinese-ui-technical-label-cleanup-planning-2026-06-24

## Metadata

- Task id: `visible-chinese-ui-technical-label-cleanup-planning-2026-06-24`.
- Branch: `codex/visible-chinese-ui-cleanup-planning-20260624`.
- Task kind: `docs_requirement_alignment`.
- Execution profile: `ui_cleanup_scope_planning_no_source_change`.
- Approval consumed: current user selected this next task on 2026-06-24.
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

- `R1`, `R2`, `R7`, `R8`, US-06-13, and US-06-14 require role-separated backend workspaces, clear navigation,
  role-aware denial states, and visible Chinese UI.
- US-06-01 AC-8 requires backend UI/UX optimization to be preceded by a design artifact. This planning task does not
  replace a broader design-first package; it narrows the next low-risk copy/label cleanup implementation.
- The 2026-06-24 gap refresh identifies `GAP-UI-01` as the highest-priority local blocker.
- ADR-006 confirms installed Provider packages are not runtime approval. Provider labels may be translated or hidden in
  UI copy, but real Provider execution remains blocked.

## Requirement Mapping

- This planning task maps to visible UI acceptance language only. It does not change authorization behavior, role
  routing, Provider behavior, content draft workflow, or any data model.
- The next implementation should convert user-facing English technical labels into Chinese, while preserving registered
  domain identifiers in code, API contracts, database schema, `data-*` attributes, and tests where they are not visible
  UI copy.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.

## Conflict Check

- No SSOT conflict was found. Requirements allow registered English domain identifiers in source and contracts, while
  runtime acceptance now requires visible UI labels, actions, states, and denial/unavailable messages to be Chinese.
- Execution evidence must not be treated as a new requirement source. It is used only to locate observed labels and
  prioritize the cleanup.

## Read-Only Source Scan

- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`.
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`.
- `src/features/admin/contact-config/AdminContactConfigPage.tsx`.
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`.
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`.
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`.
- `src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx`.
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`.
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`.
- `src/components/admin/PaperManagement/AdminPaperManagement.tsx`.
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.

## Blocked Files And Actions

- Blocked files: `.env*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`,
  `drizzle/**`, `.next/**`, `playwright-report/**`, `test-results/**`, and local private credential paths.
- Blocked actions: product source edit, test edit, browser/runtime observation, dev-server start, credential entry or
  credential-file access, account mutation, database read/write, schema/migration, dependency change, Provider call or
  configuration, Cost Calibration, staging/prod/deploy, payment/external service, PR, force push, and final Pass claim.

## Plan

1. Register this docs-only planning task in state and queue.
2. Produce a scoped implementation planning output for the next cleanup task, including visible labels, candidate files,
   non-replacement rules, tests likely affected, and validation commands.
3. Write evidence and audit review with mapping results and blocked remainder.
4. Run scoped formatting, whitespace, and Module Run v2 hardening gates before closeout.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md docs/05-execution-logs/acceptance/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md docs/05-execution-logs/acceptance/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-visible-chinese-ui-technical-label-cleanup-planning.md`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId visible-chinese-ui-technical-label-cleanup-planning-2026-06-24`.
