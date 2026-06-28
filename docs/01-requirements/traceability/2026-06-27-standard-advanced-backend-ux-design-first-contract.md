# Standard Advanced Backend UX Design First Contract

## Status

- Date: 2026-06-27
- Task id: `standard-advanced-backend-ux-design-first-contract-2026-06-27`
- Scope: docs/state-only design-first contract for standard and advanced backend workspaces.
- Runtime claim: none.
- Implementation claim: none.

This contract records the information architecture and UX boundary required before backend UI/source implementation. It does not approve source, tests, e2e, schema, migration, seed, package or lockfile changes, `.env*`, browser/dev-server runtime, DB access, Provider calls, Cost Calibration, staging/prod/deploy, payment, OCR/export, external-service work, PR, force push, release readiness, or final Pass.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Source Inputs

| source                                                                                                     | role in this contract                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `docs/01-requirements/00-index.md`                                                                         | Standard MVP goals, non-goals, admin role split, and role-separated addendum entry.                          |
| `docs/01-requirements/modules/01-user-auth.md`                                                             | `organization`, `employee`, `redeem_code`, `personal_auth`, `org_auth`, and employee import boundaries.      |
| `docs/01-requirements/modules/06-admin-ops.md`                                                             | Standard content and operations backend baseline.                                                            |
| `docs/01-requirements/advanced-edition/00-index.md`                                                        | Advanced cross-cutting boundaries and design-first gate requirement.                                         |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                        | `edition`, computed `effectiveEdition`, `auth_upgrade`, `redeem_code`, `org_auth`, quota owner requirements. |
| `docs/01-requirements/advanced-edition/modules/04-organization-training.md`                                | Standard and advanced organization admin/employee training boundaries.                                       |
| `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`                               | Organization summary analytics and privacy boundary.                                                         |
| `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`                              | Operations authorization, quota, upgrade, and redacted governance requirements.                              |
| `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`                           | Organization admin AI question and AI `paper` generation entry boundary.                                     |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`                 | R1-R15 role-separated repair targets and design-first gate.                                                  |
| `docs/05-execution-logs/evidence/2026-06-27-standard-advanced-edition-experience-optimization-planning.md` | Immediate predecessor planning evidence; used as history only.                                               |

## Design Principles

1. Workspace separation is the first UX invariant. `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin` must start in distinct backend workspaces.
2. Authorization is enforced below the UI. `effectiveEdition` is service-computed from valid source authorization, original `edition`, `auth_upgrade`, expiry, revocation, and scope. Menu visibility is only a hint.
3. Organization administration is first-class and `organization`-scoped. It is not a system operations surface with an organization filter.
4. Content administration owns formal `question`, `material`, `paper`, `paper_section`, `paper_asset`, publish, unpublish, and draft/review work. It does not own global user, `redeem_code`, or `org_auth` governance.
5. Operations administration owns `user`, `organization`, `employee`, `redeem_code`, `authorization`, `personal_auth`, `org_auth`, contact configuration, resources, `knowledge_base`, `audit_log`, and `ai_call_log` summaries. It does not author formal content.
6. Advanced entries must be discoverable for eligible roles; URL-only access fails future acceptance.
7. Standard roles need explicit denied or unavailable states for advanced-only surfaces. Silent hiding alone is insufficient because direct route access must also be handled.
8. AI generated content and organization training content remain isolated from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
9. Evidence, logs, and UI summaries must be redacted. Plaintext `redeem_code`, prompt, Provider payload, raw AI output, raw employee answer text, and full paper/question content must not appear in ordinary views or evidence.

## Workspace Information Architecture

| Workspace                       | Primary audience                             | Primary purpose                                                                                                       | Explicit non-goals                                                                                               |
| ------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Operations workspace            | `ops_admin`, `super_admin` where allowed     | Govern `user`, `organization`, `employee`, `redeem_code`, `authorization`, `org_auth`, resources, logs, and summaries | Formal content authoring, organization training authoring, organization AI output editing, raw sensitive viewers |
| Content workspace               | `content_admin`, `super_admin` where allowed | Maintain formal `question`, `material`, `paper`, publish lifecycle, and isolated content AI draft/review entries      | Global user management, `redeem_code`, `org_auth`, employee import, organization analytics                       |
| Standard organization workspace | `org_standard_admin`                         | View organization status, employees, inherited authorization scope, quota/status summaries, and support contacts      | `AI出题`, `AI组卷`, `企业训练`, raw employee answers, global operations                                          |
| Advanced organization workspace | `org_advanced_admin`                         | Manage organization employees, training, summary analytics, and organization-owned AI question/AI `paper` entries     | Platform formal content adoption, payment, Provider configuration, raw employee learner AI output                |

## Conceptual Route Map

Routes below are target product concepts for future implementation tasks. They are not runtime evidence, and they do not expose internal numeric ids.

| Route concept                      | Owner workspace       | Expected role and edition behavior                                                                                                     |
| ---------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/ops`                       | Operations            | `ops_admin` allowed; `content_admin` and organization admins denied or redirected to their own workspace.                              |
| `/admin/ops/users`                 | Operations            | Manage `user` status and reset password flow; organization admins cannot access global user list.                                      |
| `/admin/ops/organizations`         | Operations            | Manage `organization`, tree, employee binding, and platform-maintained organization data.                                              |
| `/admin/ops/redeem-codes`          | Operations            | Govern `redeem_code`; ordinary list and evidence must not expose plaintext values.                                                     |
| `/admin/ops/org-auths`             | Operations            | Govern `org_auth`, `edition`, upgrade state, atomic-scope summaries, conflict warnings, and quota owner summaries.                     |
| `/admin/ops/audit-logs`            | Operations            | Read redacted `audit_log` summaries.                                                                                                   |
| `/admin/ops/ai-call-logs`          | Operations            | Read redacted `ai_call_log` summaries only; no prompt, Provider payload, or raw output.                                                |
| `/admin/content`                   | Content               | `content_admin` allowed; `ops_admin` and organization admins denied from content authoring.                                            |
| `/admin/content/questions`         | Content               | Formal `question`, `material`, `question_group`, `question_option`, `scoring_point`, `analysis`, and `standard_answer` lifecycle.      |
| `/admin/content/papers`            | Content               | Formal `paper`, `paper_section`, `paper_asset`, publish/unpublish, snapshot lifecycle.                                                 |
| `/admin/content/ai-questions`      | Content               | Discoverable content AI `AI出题` draft/review entry; Provider execution and formal adoption remain separate gates.                     |
| `/admin/content/ai-papers`         | Content               | Discoverable content AI `AI组卷` draft/review entry; generated content remains isolated until approved adoption.                       |
| `/admin/organization`              | Organization          | Organization admin landing; role and `effectiveEdition` decide standard or advanced workspace state.                                   |
| `/admin/organization/employees`    | Organization          | Organization-scoped employee status and import guidance; import fields bind to `organization` only.                                    |
| `/admin/organization/auth-status`  | Organization          | Show source `edition`, computed `effectiveEdition`, `upgradeStatus`, expiry, authorized scopes, and quota owner summaries.             |
| `/admin/organization/training`     | Organization advanced | `org_advanced_admin` allowed; `org_standard_admin` receives standard-unavailable state; direct route access must not grant capability. |
| `/admin/organization/analytics`    | Organization advanced | Summary counts, completion, score, and quota views only; export and raw employee subjective answer text remain out of scope.           |
| `/admin/organization/ai-questions` | Organization advanced | Organization-owned `AI出题` entry for valid advanced `org_auth`; output stays organization-owned and separate from formal `question`.  |
| `/admin/organization/ai-papers`    | Organization advanced | Organization-owned `AI组卷` entry for valid advanced `org_auth`; output stays organization-owned and separate from formal `paper`.     |

## Role And Edition Matrix

| Role                 | Operations workspace                           | Content workspace                                 | Organization workspace                                                                  | Required denial or unavailable behavior                                                                 |
| -------------------- | ---------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ops_admin`          | Allowed for scoped operations functions        | Denied for formal content authoring               | Denied unless separately assigned organization role                                     | Content authoring routes show permission denied; no content draft creation.                             |
| `content_admin`      | Denied except explicitly shared profile/logout | Allowed for formal content and content AI entries | Denied unless separately assigned organization role                                     | Operations routes show permission denied; no `redeem_code`, `org_auth`, or global employee management.  |
| `org_standard_admin` | Denied for global operations                   | Denied for formal content authoring               | Allowed for employees, organization status, authorization summaries, and support states | `企业训练`, `AI出题`, and `AI组卷` show standard-unavailable or upgrade guidance; direct access denied. |
| `org_advanced_admin` | Denied for global operations                   | Denied for platform formal content authoring      | Allowed for employees, authorization status, training, analytics, and organization AI   | Formal platform adoption, Provider config, raw employee answer viewers, and global logs remain denied.  |
| `super_admin`        | Allowed where product policy grants it         | Allowed where product policy grants it            | May impersonate no organization by default; explicit organization context is required   | Super admin power must not bypass redaction, public-id-safe routing, or context selection requirements. |

## Navigation Contract

- Backend landing must choose one workspace based on the user's active role and selected context.
- If a user has multiple backend roles, the switcher must show workspaces as separate destinations rather than merging menus.
- Global navigation must include a visible logout action in every backend workspace.
- Active workspace labels must use product terms: operations, content, and organization. Do not label organization admin as operations.
- Advanced-only navigation items are shown only when the service-computed capability summary says they are available.
- Direct route access must be checked again by route/service guard. Hidden navigation is never enough.

## State Contract

Every future backend workspace implementation must define these states before source edits:

| State                      | Required behavior                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading                    | Stable skeleton or loading layout that does not shift critical navigation.                                                                               |
| Empty                      | Explain the empty data category and the next allowed action for the role.                                                                                |
| Error                      | Show retry or support path without leaking stack traces, raw DB rows, secrets, Provider payloads, prompt, or raw output.                                 |
| Permission denied          | State that the current role cannot access the surface; provide return-to-workspace action.                                                               |
| Standard unavailable       | For standard organization roles, explain that advanced training or AI surfaces require advanced `org_auth` or upgrade handled by platform operations.    |
| Upgrade pending or expired | Show `upgradeStatus` and expiry summary without exposing internal ids or raw audit metadata.                                                             |
| Conflict warning           | For `org_auth` or atomic-scope planning, show overlap/quota/expiry conflict summaries before submit.                                                     |
| Quota blocked              | Block the action with a redacted reason; do not silently create partial authorization or generation tasks.                                               |
| Destructive confirmation   | Required before disable, revoke, takedown, unpublish, or restore-type actions; evidence records only action category, actor role, status, and timestamp. |

## Component Reuse Contract

Future source tasks should prefer shared backend primitives while keeping workspace ownership separate:

| Primitive                     | Purpose                                                                                 | Boundary                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `AdminWorkspaceLayout`        | Shared shell, header, workspace switcher, logout, and responsive desktop backend layout | Must receive workspace and capability summary; must not compute `effectiveEdition` from UI state.      |
| `WorkspaceNav`                | Role-aware navigation groups                                                            | Menu visibility is advisory only; route guards remain required.                                        |
| `ScopedPageHeader`            | Title, status chips, primary action, and context summary                                | Must avoid internal numeric ids and sensitive raw values.                                              |
| `DataTable`                   | Dense admin lists for repeated operational/content/organization records                 | Must provide loading, empty, error, pagination, and redacted display states.                           |
| `DetailDrawer` or detail page | Record detail inspection without nested cards                                           | Clear ownership: operations details, content details, and organization details cannot share authority. |
| `PermissionDeniedState`       | Denial and return action                                                                | Must be usable for role denial and direct-route denial.                                                |
| `UpgradeRequiredState`        | Standard-unavailable or advanced-only guidance                                          | Must not promise payment, pricing, Provider readiness, or immediate upgrade execution.                 |
| `ConflictWarningPanel`        | `org_auth` scope overlap, quota, expiry, and cancellation warnings                      | Must stay summary-only and cannot require schema execution in source-only tasks.                       |
| `RedactedAuditSummary`        | `audit_log` and `ai_call_log` summaries                                                 | Must not render prompt, Provider payload, raw AI output, plaintext `redeem_code`, secret, or token.    |

Component names are contract names for future implementation planning. Actual source file creation requires a separate source approval.

## Data And Privacy Contract

- Use public ids in UI-visible routes and links. External URLs must not expose auto-increment primary keys.
- Show source `edition`, computed `effectiveEdition`, `upgradeStatus`, expiry, scope, and quota owner as summaries.
- Do not show plaintext `redeem_code` in ordinary lists, evidence, audit summaries, or screenshots. Any future reveal/copy workflow requires a separate scoped approval.
- Organization admins must not inspect raw employee subjective answer text, personal learner AI outputs, prompt, raw AI input/output, Provider payload, or generated task raw content.
- `audit_log` and `ai_call_log` views are redacted summaries only.
- Export, OCR, payment, external-service integration, and raw sensitive viewers remain future scope.

## Acceptance Label Model

| Label                  | Meaning                                                                                 | This contract can close it |
| ---------------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| `design_contract`      | IA, route concepts, states, role/edition matrix, and follow-up split are specified      | yes                        |
| `source_only`          | Future UI/source files implement copy, layout, navigation, and local state              | no                         |
| `permission_contract`  | Future guard/service/contract tests enforce role and `effectiveEdition` behavior        | no                         |
| `browser_validation`   | Future approved local browser run observes role routes and denial/availability states   | no                         |
| `db_schema`            | Future schema/migration work for atomic `org_auth_scope`, upgrade, or quota persistence | no                         |
| `provider_cost`        | Future Provider or Cost Calibration execution                                           | no                         |
| `staging_prod_release` | Future staging/prod/deploy/release readiness                                            | no                         |
| `final_pass`           | Final acceptance or release pass                                                        | no                         |

## Follow-Up Task Split

Recommended order after this contract:

| Order | Task id                                                                        | Purpose                                                                                                             | Risk tier                         |
| ----- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1     | `backend-workspace-shell-source-only-2026-06-27`                               | Implement shared backend shell, workspace switcher, visible logout, and denial/unavailable state components         | pure UI/source-only               |
| 2     | `content-ops-organization-nav-entry-source-only-2026-06-27`                    | Wire scoped menu entries for operations, content, and organization admin surfaces without runtime browser execution | pure UI/source-only               |
| 3     | `backend-workspace-role-guard-contract-tdd-2026-06-27`                         | Add or harden role guard and direct-route denial contract tests                                                     | permission/authorization contract |
| 4     | `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`    | Implement standard/advanced organization admin workspace states and training/AI unavailable boundaries              | source plus permission contract   |
| 5     | `content-admin-ai-entry-draft-review-contract-planning-2026-06-27`             | Plan content AI `AI出题` and `AI组卷` draft/review shell without Provider or formal adoption                        | docs/state-only                   |
| 6     | `ops-auth-workspace-redeem-code-org-auth-contract-planning-2026-06-27`         | Plan operations `redeem_code`, `org_auth`, upgrade, employee import, and redacted audit UX                          | docs/state-only                   |
| 7     | `standard-advanced-backend-role-browser-validation-2026-06-27`                 | Run smallest approved local browser matrix for backend workspaces after source tasks                                | browser validation                |
| 8     | `org-auth-atomic-scope-schema-approval-package-2026-06-27`                     | Prepare schema/migration approval for future atomic organization authorization scopes                               | DB/schema planning                |
| 9     | `content-organization-ai-generation-provider-cost-approval-package-2026-06-27` | Prepare Provider/Cost boundary for AI generation after source shells and contract tests                             | Provider/Cost planning            |

This contract does not seed executable implementation tasks. Each follow-up requires its own task entry, approval boundary, allowed files, validation, evidence, audit review, and commit.

## Copyable Approval Text

### Source-Only Workspace Shell

```text
我批准执行低风险 source-only UI 任务 backend-workspace-shell-source-only-2026-06-27。允许只修改任务队列列明的后台 shell、导航、状态组件相关 src 前端文件、必要的 focused unit test 以及 docs/evidence/audit。必须遵守 2026-06-27-standard-advanced-backend-ux-design-first-contract.md；禁止 schema/migration/seed、package/lockfile、.env*、DB、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

### Permission Contract

```text
我批准执行权限/授权 contract 任务 backend-workspace-role-guard-contract-tdd-2026-06-27。允许修改任务队列列明的 route guard、capability contract、validator/mapper/service adapter、focused unit test 和 docs/evidence/audit。必须保持 effectiveEdition 由服务层计算，UI 不得作为授权边界；禁止 schema/migration/seed、DB 连接或写入、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

### Browser Validation

```text
我批准执行本地浏览器验证任务 standard-advanced-backend-role-browser-validation-2026-06-27。范围仅限 localhost/127.0.0.1 上的既有本地目标和任务队列列明的后台角色/路由；证据只能记录角色、路由、状态、数量和脱敏结果。禁止记录凭据、token、cookie、localStorage、原始 DOM、截图、trace、DB 行、Provider payload、prompt、原始 AI 输出、明文 redeem_code 或完整题目/试卷内容。禁止 DB/schema/migration、Provider、Cost Calibration、staging/prod/deploy、payment/external-service、PR、force push、release readiness 和 final Pass。
```

## Closeout Statement

This contract closes only the `design_contract` label for backend UX planning. It does not prove runtime behavior, source implementation, permission enforcement, browser acceptance, Provider readiness, staging readiness, release readiness, or final Pass.
