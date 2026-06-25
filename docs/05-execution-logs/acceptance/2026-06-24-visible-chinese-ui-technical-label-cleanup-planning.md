# Acceptance Planning: visible-chinese-ui-technical-label-cleanup-planning-2026-06-24

## Scope

- Task id: `visible-chinese-ui-technical-label-cleanup-planning-2026-06-24`.
- Branch: `codex/visible-chinese-ui-cleanup-planning-20260624`.
- Scope type: docs-only requirement alignment and implementation scope planning.
- Source gap: `GAP-UI-01` from the post-repair gap refresh.
- Product source/test changes in this task: none.
- Runtime or Browser validation in this task: none.
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

## Evidence-Only Read List

- `docs/05-execution-logs/acceptance/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.

## Requirement Mapping Result

| Requirement source                         | Mapping result                                                                                                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `R1`, `R2`, `R7`, `R8`, US-06-13, US-06-14 | Role-separated surfaces must remain discoverable, role-aware, and Chinese for visible UI labels, states, actions, and denial/unavailable messaging.                                                              |
| US-06-01 AC-8                              | Backend UI/UX optimization should have an explicit planning artifact before implementation. This document is a narrow label/copy cleanup plan, not a broad redesign package.                                     |
| Advanced AI scope clarification            | Required AI entries are `AI训练`, `AI出题`, and `AI组卷` where capability permits. Standard edition denial or upgrade guidance must be clear and Chinese.                                                        |
| Edition-aware authorization requirements   | UI visibility is not an authorization boundary. Cleanup may translate labels but must not weaken runtime `effectiveEdition` and capability checks.                                                               |
| ADR-006 and Provider boundaries            | Provider package/config presence is not Provider execution approval. Visible copy may say `模型服务` or `模型供应商`, but this task and the next cleanup task must not call Provider or enable Cost Calibration. |

## Role Mapping Result

| Role row                    | Cleanup relevance                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Direct AI route must not show English technical labels; standard-unavailable or upgrade guidance must be Chinese when shown.           |
| `personal_advanced_student` | Learner AI surface must show Chinese labels including `AI训练`, `AI出题`, and `AI组卷`.                                                |
| `org_standard_employee`     | Standard employee denial/unavailable copy for AI and enterprise training must be Chinese.                                              |
| `org_advanced_employee`     | Learner AI and enterprise training entries and empty states must be Chinese.                                                           |
| `org_standard_admin`        | Organization/backend denial and workspace copy must stay Chinese; this cleanup does not solve organization admin workspace separation. |
| `org_advanced_admin`        | Organization AI entries and backend states must be Chinese; this cleanup does not solve organization admin workspace separation.       |
| `content_admin`             | Content AI draft/review and content management pages must avoid visible English technical labels.                                      |
| `ops_admin`                 | Operations pages must avoid visible English technical labels while preserving redaction and Provider boundaries.                       |

## Acceptance Mapping Result

- Planning result: `ready_for_next_implementation_task_no_source_change`.
- This task closes only the scope-planning item for `GAP-UI-01`.
- It does not make the Chinese UI acceptance row pass, because no product source or runtime validation is executed here.
- It does not declare standard/advanced MVP final Pass.

## Read-Only Source Scan Inventory

| Area                          | Candidate file                                                                              | Visible cleanup candidates                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin shell navigation        | `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`                              | `contact_config` should become a Chinese navigation label such as `购买联系方式`.                                                                                               |
| Learner AI page               | `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`                    | `personal-learning-ai` should become visible Chinese copy such as `个人 AI 训练`; denial/unavailable text should avoid login prompts for an already logged-in standard learner. |
| Ops management                | `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`                            | `Admin Ops`, `runtime API`, `publicId`, and placeholders such as `actionType / publicId / metadata` should be translated or reframed as Chinese operator-facing wording.        |
| Contact config                | `src/features/admin/contact-config/AdminContactConfigPage.tsx`                              | `Contact config`, `Loading contact_config`, English save/load errors, `Admin Ops`, and `runtime API` should become Chinese UI copy.                                             |
| Admin AI generation entry     | `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`                           | Visible `question`, `paper`, `audit_log`, and `Provider` copy should be changed to Chinese business wording while preserving governance boundaries.                             |
| Model config                  | `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`                 | English headings and form labels such as `Model configuration`, `Model providers`, `Provider key`, `Secret value`, and `Base URL` should become Chinese.                        |
| AI audit ops                  | `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`                          | `AI Ops` and `runtime API` should become Chinese backend wording.                                                                                                               |
| User/org/auth ops baseline    | `src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx`                       | `Admin Ops` should become Chinese.                                                                                                                                              |
| Organization training backend | `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`                | Visible `publicId` labels should be reframed as `组织标识`, `企业授权标识`, `来源标识`, or `版本标识` depending on context.                                                     |
| Question/material management  | `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx` | `Content Admin`, `runtime DTO`, `publicId`, `new local draft`, `target question`, and `accepted/discarded/pending` status text should become Chinese.                           |
| Paper management              | `src/components/admin/PaperManagement/AdminPaperManagement.tsx`                             | `Content Admin` and search/helper `publicId` copy should become Chinese operator-facing wording.                                                                                |
| Knowledge node management     | `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`             | `Content Admin`, visible `publicId`, `JSON`, and parent-id labels should become Chinese business labels where visible to operators.                                             |

## Cleanup Rules For Next Implementation

- Replace user-visible English technical labels with Chinese labels in UI text, headings, helper copy, placeholders, aria labels, empty states, and error states.
- Preserve registered English identifiers in source code, API JSON fields, DB fields, type names, route paths, `data-testid`, `data-public-id`, and contract-level tests unless a test is asserting visible UI copy.
- Do not hide or reveal additional secret data. Redacted card values, masked secrets, and no-plaintext-`redeem_code` constraints remain unchanged.
- Do not convert `publicId` to internal database `id`; if an external-safe identifier must remain visible, label it as `业务标识`, `外部标识`, or a domain-specific Chinese label.
- Do not enable Provider execution, model calls, prompt execution, Cost Calibration, payment, staging/prod, or external services.
- Do not solve unrelated functional gaps in the same implementation task.
- Do not declare final Pass after cleanup; require a later runtime rerun to verify all role rows.

## Proposed Next Task

- Task id: `visible-chinese-ui-technical-label-cleanup-2026-06-24`.
- Task kind: `implementation`.
- Required precondition: create or confirm a new task plan with SSOT Read List, Requirement/Role/Acceptance Mapping Result, exact allowed files, and blocked files before editing source.
- Required result: visible English technical labels in the planned scope are replaced with Chinese UI copy; focused tests that assert visible old labels are updated.
- Runtime status: no Browser/runtime validation is included by default; a later rerun task is still required for acceptance.

## Candidate Source Files For Next Task

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

## Candidate Focused Tests For Next Task

- `tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `tests/unit/protected-route-guard-ui.test.ts`.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`.
- `tests/unit/student-personal-ai-generation-ui.test.ts`.
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`.
- `tests/unit/phase-11-audit-log-coverage-hardening.test.ts`.
- `tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`.
- `tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`.
- `tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts`.
- `tests/unit/admin-model-config-management-ui.test.ts`.
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`.
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `tests/unit/organization-training-admin-entry-surface.test.ts`.
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`.
- `tests/unit/admin-question-material-ui.test.ts`.
- `tests/unit/admin-paper-ui.test.ts`.
- `src/features/admin/paper-management/AdminPaperManagementClient.test.tsx`.
- `tests/unit/admin-ai-generation-entry-surface.test.ts`.
- `tests/unit/admin-shell-common-interaction.test.ts`.

## Proposed Validation For Next Task

- Focused unit tests for changed surfaces.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- Module Run v2 pre-commit hardening for the next task id.

## Blocked Remainder

- A later role-separated runtime rerun remains required after implementation to verify visible Chinese UI in Browser.
- Functional gaps not solved by label cleanup remain outside this task, including organization admin workspace separation and any Provider-backed real generation capability.
- Standard/advanced MVP final Pass remains blocked.
