# Design-First Scope: organization-admin-workspace-design-first-scope-2026-06-24

## Summary

This is the design-first artifact required before organization admin backend source changes. It defines the immediate
implementation scope for `GAP-ORG-01` without approving runtime/browser validation or final MVP Pass.

## Requirement Mapping Result

- Result: `pass_organization_admin_workspace_design_first_scope_defined_no_source_no_runtime`.
- Requirement SSOT mapped:
  - `US-06-01 AC-8`: design-first backend UI/UX artifact.
  - `US-06-13 AC-8..AC-9`: workspace landing, logout, and direct-route denial.
  - `US-06-14 AC-3..AC-5`: standard/advanced organization admin workspace split.
  - Advanced organization training and organization AI modules.
  - ADR-007 and edition-aware authorization SSOT.

## Role Mapping Result

| Role row             | Workspace landing       | Navigation and surfaces                                                                  | Denial or unavailable states                                                                                                   |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `org_standard_admin` | `/organization/portal`  | `组织概览`; employee/auth status summaries inside organization scope; visible `退出登录` | No `企业训练`, `统计摘要`, `AI出题`, or `AI组卷`; `/ops/*` and `/content/*` show no-access; direct advanced routes unavailable |
| `org_advanced_admin` | `/organization/portal`  | `组织概览`, `企业训练`, `统计摘要`, `AI出题`, `AI组卷`; visible `退出登录`               | No global ops/content authoring; no Provider/cost/payment/staging-prod surfaces                                                |
| `ops_admin`          | `/ops/users`            | System operations only                                                                   | No organization admin workspace unless separately authorized                                                                   |
| `content_admin`      | `/content/papers`       | Content backend only                                                                     | No organization admin workspace unless separately authorized                                                                   |
| `super_admin`        | `/ops/users` by default | Global admin compatibility remains                                                       | Super admin compatibility does not change org-only role acceptance rows                                                        |

## Acceptance Mapping Result

- Planning/design acceptance: passed.
- Runtime acceptance: not executed.
- Chinese UI acceptance for implementation:
  - Organization portal visible copy must use Chinese labels.
  - Route status copy must use Chinese.
  - Buttons, navigation, empty/error/loading/unavailable states, and denial messages must be Chinese.
  - Technical labels such as `Organization Portal`, `Organization Training`, `local shell`, `publicId`, `runtime API`,
    `Provider`, or raw role names must not be visible in the organization admin workflow.
- Final MVP Pass: not claimed.

## Information Architecture

Organization workspace root:

- Route: `/organization/portal`.
- Page title: `组织后台`.
- Subtitle: `管理员工、查看组织授权状态，并按版本进入企业训练和组织 AI 能力。`
- Header badge: `组织范围`.
- Visible logout: existing layout top bar `退出登录`.

Standard organization admin portal sections:

- `组织概览`: current organization public identifier may be shown as `组织标识` only if needed for local verification.
- `员工管理`: summary card, no global user list. The first implementation may provide a scoped local status surface and
  link target placeholder only if no organization-scoped employee API exists.
- `授权状态`: summary card showing standard/high-level availability and expiry/upgrade placeholder state, using redacted
  labels.
- `不可用能力`: explain that `企业训练`, `AI出题`, and `AI组卷` require高级版组织授权.

Advanced organization admin portal sections:

- Standard sections plus:
  - `企业训练` link to `/organization/organization-training`.
  - `统计摘要` link to `/organization/organization-analytics`.
  - `AI出题` link to `/organization/ai-question-generation`.
  - `AI组卷` link to `/organization/ai-paper-generation`.

No page should link to global `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`, `/ops/resources`,
`/ops/ai-audit-logs`, `/content/*`, Provider controls, payment, staging/prod, or deployment surfaces.

## Route Matrix

| Route                                        | `org_standard_admin`                         | `org_advanced_admin` | Notes                                                 |
| -------------------------------------------- | -------------------------------------------- | -------------------- | ----------------------------------------------------- |
| `/organization/portal`                       | Allowed                                      | Allowed              | First-class workspace landing.                        |
| `/organization/organization-training`        | Standard-unavailable or denied, Chinese copy | Allowed              | Must not rely on hidden menu only.                    |
| `/organization/organization-analytics`       | Standard-unavailable or denied, Chinese copy | Allowed              | Aggregate-only; no raw employee answer text.          |
| `/organization/ai-question-generation`       | Standard-unavailable, Chinese copy           | Allowed              | Existing AI surface should remain provider-gated.     |
| `/organization/ai-paper-generation`          | Standard-unavailable, Chinese copy           | Allowed              | Existing AI surface should remain provider-gated.     |
| `/ops/users`, `/ops/organizations`, `/ops/*` | Denied                                       | Denied               | Organization admins must not enter system operations. |
| `/content/papers`, `/content/*`              | Denied                                       | Denied               | Organization admins must not enter content authoring. |

## State And Copy Requirements

- Loading: `正在校验后台权限`, `正在加载组织后台`, `正在加载企业训练`, or similarly Chinese.
- Unauthorized: `请先登录后台`.
- Forbidden workspace: `无权访问此后台工作区`.
- Standard unavailable: `标准版组织后台暂不开放此功能`.
- Error: `组织后台加载失败，请刷新页面或重新登录。`
- Empty: `暂无组织范围内数据`.
- Success/failure toasts or inline messages must not include secrets, raw prompts, raw generated content, or internal
  auto-increment ids.

## Implementation Scope For Next Task

Next task id: `organization-admin-workspace-runtime-repair-2026-06-24`.

Allowed source and test files:

- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`.
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`.
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`.
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/server/services/organization-training-route.ts`.
- `src/server/services/organization-analytics-route.ts`.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `tests/unit/organization-portal-admin-entry-surface.test.ts`.
- `tests/unit/organization-training-admin-entry-surface.test.ts`.
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`.
- `tests/unit/admin-ai-generation-entry-surface.test.ts`.
- `tests/unit/auth/session-personal-auth-boundary.test.ts`.
- `tests/unit/student-login-ui.test.ts`.
- `src/server/services/organization-training-route.test.ts`.
- `src/server/services/organization-analytics-route.test.ts`.
- Standard docs/state/task plan/evidence/audit files for the implementation task.

Implementation task required outcomes:

1. Pure organization admin login contract and UI tests assert `/organization/portal`.
2. Organization portal removes English visible copy and shows standard/advanced role-appropriate Chinese surfaces.
3. Standard org admin sees employee/auth status summaries but no training/AI links.
4. Advanced org admin sees training, analytics, `AI出题`, and `AI组卷`.
5. Direct standard access to training/analytics/AI produces Chinese denied or unavailable states.
6. Organization training and analytics service guards include the approved organization admin roles and exclude unrelated
   global ops/content access where appropriate.
7. Unit/static gates pass; runtime/browser final acceptance remains a later task.

## Explicit Non-Goals

- No real Provider-backed `AI出题` or `AI组卷` generation.
- No prompt execution, provider payload, raw generated output, or cost/quota calibration.
- No schema, migration, seed, or database mutation.
- No employee import template redesign in this implementation slice.
- No staging/prod/cloud/deploy, payment, external service, PR, force push, or final Pass.

## Split Conditions

The next implementation must stop and split if it needs:

- new database tables, migrations, seed changes, or live DB inspection;
- new API contracts beyond the listed organization training/analytics role guards;
- Provider, env, quota, cost, or raw generated content;
- browser/runtime observation with owner credential handling;
- changes outside the allowed source/test files above.
