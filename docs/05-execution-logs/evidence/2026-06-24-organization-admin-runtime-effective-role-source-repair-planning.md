# Evidence: organization-admin-runtime-effective-role-source-repair-planning-2026-06-24

## 任务边界

- Task id: `organization-admin-runtime-effective-role-source-repair-planning-2026-06-24`.
- Branch: `codex/org-admin-effective-role-source-planning-20260625`.
- Entry head: `c5a418e59b853f187f48a0f8d12c1ccbc01c9940`.
- Scope: low-risk planning/diagnosis, source read-only, docs/state/evidence/audit only.
- Explicitly not done: no source repair, no `.env*`, no credentials/private account docs, no database connection, no migration, no seed execution, no schema/fixture mutation, no dev server, no browser runtime rerun, no Provider/Cost Calibration/staging/prod/payment/external service, no final Pass claim.

## 机制与任务队列事实

- `Get-TikuProjectStatus.ps1` at entry reported `projectStatusDecision: idle_no_pending_task` and `nextExecutableTask: none`.
- `project-state.yaml` from the previous runtime rerun recorded `expectedNextTask: organization-admin-runtime-effective-role-source-repair-planning-2026-06-24`.
- `task-queue.yaml` did not contain that task id before this task. This task materialized the user-directed planning task in queue/state so local mechanism checks can bind the current deliverables to an explicit task.
- This is not an MVP final pass declaration. The latest runtime acceptance facts remain strict failure for both organization admin rows.

## SSOT Read List

- `AGENTS.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-record-architecture-decisions.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-student-local-automation-runtime.md`.
- `docs/02-architecture/adr/adr-005-admin-local-automation-runtime.md`.
- `docs/02-architecture/adr/adr-006-ai-generation-repository-scope-boundary.md`.
- `docs/02-architecture/adr/adr-007-authorization-upgrade-and-effective-edition-model.md`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement / Role / Acceptance Mapping Result

| Mapping target               | SSOT requirement                                                               | Diagnosis result                                                                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` landing | Must enter scoped organization workspace, not global ops/content               | Source says correct `adminRoles: ["org_standard_admin"]` lands at `/organization/portal`; historical real browser still landed at `/ops/users`, so runtime payload/source is inconsistent with correct role payload.  |
| `org_advanced_admin` landing | Must enter scoped organization workspace and see advanced organization entries | Source says correct `adminRoles: ["org_advanced_admin"]` lands at `/organization/portal`; historical real browser still landed at `/ops/users`, so runtime payload/source is inconsistent with correct role payload.  |
| Ops denial                   | Organization admins must not access global ops workspace                       | `AdminDashboardLayout` denies ops when any organization admin role is present. Historical direct `/ops/users` access means current session likely did not contain organization admin role.                            |
| Content denial               | Organization admins must not access content workspace                          | `AdminDashboardLayout` denies content when any organization admin role is present. Historical `/content/papers` denial is consistent with non-content roles and does not alone identify the organization role source. |
| Organization advanced routes | Standard denied, advanced allowed                                              | Organization training/analytics/AI pages and service guards read `/api/v1/sessions` `user.adminRoles`; wrong session roles explain both standard/advanced route denial.                                               |
| `effectiveEdition`           | Service-computed edition is authorization context, not UI route source         | No landing or workspace guard traced here uses `effectiveEdition` as the source of `/ops/users` vs `/organization/portal`.                                                                                            |

## Historical Runtime Evidence Reused

Latest real browser evidence remains:

- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.

Observed facts from that runtime rerun:

- `org_standard_admin` and `org_advanced_admin` both failed strict acceptance.
- Login landed at `/ops/users`, not `/organization/portal`.
- `/organization/portal`, `/organization/organization-training`, `/organization/organization-analytics`, `/organization/ai-question-generation`, and `/organization/ai-paper-generation` were rejected.
- `/ops/users` and `/ops/redeem-codes` were still accessible.
- `/content/papers` was rejected.
- Logout returned to `/login`, so logout/session invalidation repair improved the previous stale-session symptom.

## Source Trace

| Boundary                                 | Files read                                                                                                                                                                                                                      | Role source found                                                                                                                                                                                                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login submit and landing                 | `src/app/(auth)/login/page.tsx`; `src/server/contracts/user-auth/session-boundary.ts`                                                                                                                                           | Login POST reads `payload.data.user`, passes it to `createPostLoginSessionBoundary`, and redirects to `sessionBoundary.redirectPath`. `resolveAdminWorkspaceLandingPath` sends `org_standard_admin` or `org_advanced_admin` to `/organization/portal`; otherwise ops/admin fallback can land on `/ops/users`. |
| Login session payload                    | `src/server/auth/session-route.ts`; `src/server/services/session-service.ts`; `src/server/mappers/auth-mapper.ts`                                                                                                               | POST `/api/v1/sessions` calls `sessionService.login`, then maps `loginUser` through `mapAuthContextToApi`; JSON `user.adminRoles` is `authUser.admin_roles ?? []`.                                                                                                                                            |
| Current session payload                  | `src/server/auth/session-cookie.ts`; `src/server/services/auth-service.ts`; `src/server/auth/local-session-runtime.ts`; `src/server/mappers/auth-mapper.ts`                                                                     | GET `/api/v1/sessions` reads `Authorization` or cookie, resolves auth session, then calls `findActiveUserByAuthUserId`; the admin branch maps `admin.admin_role` to `admin_roles`.                                                                                                                            |
| Workspace guard                          | `src/app/(admin)/layout.tsx`; `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`                                                                                                                                    | All `(admin)` pages are wrapped by `AdminDashboardLayout`. The layout fetches `/api/v1/sessions` and decides workspace access from `sessionResponse.data.user.adminRoles`. Any org admin role restricts access to `workspace === "organization"`. Ops workspace requires `ops_admin`.                         |
| Organization portal/menu                 | `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`; `src/features/admin/content-admin-runtime.tsx`                                                                                                        | Portal fetches `/api/v1/sessions`, checks admin context by `adminPublicId` and `adminRoles`, and uses `adminRoles` to show advanced destinations. It displays `organizationPublicId`, but it does not use it to authorize the shell.                                                                          |
| Organization training/analytics/AI pages | `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`; `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`; `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx` | These pages all fetch `/api/v1/sessions` and derive ready/standard-unavailable/unauthorized from `user.adminRoles`.                                                                                                                                                                                           |
| Organization service route guards        | `src/server/services/organization-training-route.ts`; `src/server/services/organization-analytics-route.ts`                                                                                                                     | Service route guards also call `sessionService.getCurrentSession` and inspect `sessionResponse.data.user.adminRoles`. Training/analytics admin runtime roles are `super_admin` or `org_advanced_admin`.                                                                                                       |
| Admin account persistence                | `src/db/schema/auth.ts`; `src/db/dev-seed.ts`                                                                                                                                                                                   | `admin.admin_role` is a single persisted enum column with values including `org_standard_admin` and `org_advanced_admin`. Dev seed rows for `13900000004`/`13900000005` use the two org roles and upsert by `public_id`, but this task did not inspect the real runtime DB or owner-entered private accounts. |

## Role Source Chain

```text
login page
  -> POST /api/v1/sessions
  -> sessionService.login()
  -> sessionUserRepository.findLoginUserByPhone()
  -> local-session-runtime findLoginUserAccountByPhone() first
  -> local-session-runtime findLoginAdminAccountByPhone() second
  -> admin.admin_role
  -> mapAdminAccountRow() admin_roles = normalizeAdminRoles([admin.admin_role])
  -> mapAuthContextToApi() user.adminRoles
  -> createPostLoginSessionBoundary()
  -> redirectPath

(admin) layout / organization pages / route guards
  -> GET /api/v1/sessions
  -> authService.getCurrentAuthContext()
  -> authUserRepository.findActiveUserByAuthUserId()
  -> local-session-runtime findActiveUserAccountByAuthUserId() first
  -> local-session-runtime findActiveAdminAccountByAuthUserId() second
  -> admin.admin_role
  -> mapAdminAccountRow() admin_roles = normalizeAdminRoles([admin.admin_role])
  -> mapAuthContextToApi() user.adminRoles
  -> workspace/menu/service guard decisions
```

## Findings

### Confirmed

1. Effective role for login landing and workspace guard is `AuthContextDto.user.adminRoles`, not `effectiveEdition`.
2. Local runtime admin `adminRoles` is derived from persisted `admin.admin_role` for both login and current-session reads.
3. Correct org roles would not land in global ops:
   - `org_standard_admin` and `org_advanced_admin` route to `/organization/portal`.
   - even contaminated `["org_standard_admin", "ops_admin"]` prefers `/organization/portal`.
4. Correct org roles would not access global ops in `AdminDashboardLayout`; organization roles are restricted to the `organization` workspace before the ops/content checks.
5. Organization portal/training/analytics/AI client pages use the same `/api/v1/sessions` `adminRoles`, so the observed UI denial can be explained by the session payload already being wrong.
6. Organization training/analytics service guards also use current-session `adminRoles`. The advanced routes reject `ops_admin`, so historical advanced route denial is consistent with runtime session role drift.
7. Admin session mapping currently sets `organization_public_id: null` in `mapAdminAccountRow`; it does not hydrate `admin_organization` into `AuthContextDto.user.organizationPublicId`. This is a separate source-level gap for organization-scoped defaults and later API flows.
8. Dev seed and schema are aligned in source: enum values include `org_standard_admin` and `org_advanced_admin`, and dev seed rows assign these roles to the public dev org-admin accounts.

### Pending / Not Verified In This Task

1. The actual owner-entered browser runtime account may be a private account whose persisted `admin.admin_role` remains `ops_admin`.
2. The actual runtime database may not be the same state as the updated dev seed/fixture source, or the seed may not have been applied to the account used in browser validation.
3. A real DB row could only be confirmed by approved local DB inspection or a redacted diagnostic endpoint/logging task; both are outside this task.
4. After fixing role source, organization write/read APIs may still need a source repair around `admin_organization` visible scope and `organizationPublicId` hydration, because session DTO currently exposes `organizationPublicId: null` for admins.

### Excluded

1. Logout/session invalidation is not the primary remaining cause: the latest runtime evidence shows logout passed and returned both rows to `/login`.
2. UI-only landing repair is not supported by source evidence: the landing function already sends correct org roles to `/organization/portal`.
3. `effectiveEdition` is not the direct source for landing or workspace guard decisions in the traced code.
4. A separate organization-guard-only role source was not found. Organization and ops workspace guards share the same `AdminDashboardLayout` session payload source.

## Root-Cause Hypothesis Matrix

| Hypothesis                                                                    | State                          | Evidence                                                                                                             | Next action                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Login and guards are using the wrong field, not `adminRoles`                  | Excluded                       | Landing, layout, org pages, and service route guards all use `user.adminRoles`.                                      | Do not patch UI landing/guard first.                                                             |
| The session `adminRoles` payload is sourced from persisted `admin.admin_role` | Confirmed                      | `local-session-runtime` admin finders select `admin.admin_role`, then `mapAdminAccountRow` maps it to `admin_roles`. | Repair/test this source chain if runtime accounts should resolve to org roles.                   |
| Runtime account row still persists as `ops_admin`                             | Pending, high-likelihood       | Correct org role payload would land/guard correctly; real browser still lands/guards as ops. No DB read approved.    | Create separate repair/verification task with approved scope; avoid reading credentials.         |
| Browser used private old account instead of current dev seed account          | Pending                        | User explicitly identified this possibility; source seed repair does not prove private account state.                | Confirm via approved non-secret DB/account-state diagnostic or owner-provided redacted evidence. |
| Dev seed source still maps org admins as ops                                  | Excluded at source level       | `src/db/dev-seed.ts` maps dev org standard/advanced rows to org roles.                                               | No seed source change in this planning task.                                                     |
| Current session lookup uses a different source than login response            | Mostly excluded for role field | Both login and current-session admin branches resolve through `admin.admin_role`.                                    | Keep tests covering both login and GET session paths in the repair task.                         |
| Organization pages reject because `organizationPublicId` is null              | Pending secondary              | Portal can render role-based shell without it, but route/API flows and default form scope may be affected.           | Repair should include admin organization binding hydration or explicit decision.                 |
| Logout/session invalidation causes stale ops session                          | Excluded as primary            | Latest runtime evidence had logout pass for both rows.                                                               | Keep logout regression tests but do not center next repair on logout.                            |

## Recommended Next Repair Task

Recommended task id: `organization-admin-runtime-effective-role-source-repair-2026-06-25`.

Goal:

- Add focused red tests that prove login response and current session for org admin accounts expose `adminRoles: ["org_standard_admin"]` or `["org_advanced_admin"]` and deny global ops through existing guard behavior.
- Repair the runtime account/session source so org admin account state is not collapsed into `ops_admin`.
- Hydrate or explicitly decide `organizationPublicId` for admin org sessions by using `admin_organization`/visible scope, because the current admin mapper always emits `organizationPublicId: null`.
- Keep browser/runtime rerun and any DB row inspection as separate approval-gated tasks unless the user grants fresh scope.

Suggested allowed files:

- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/local-session-runtime.test.ts`
- `src/server/services/session-service.test.ts`
- `src/server/contracts/user-auth/session-boundary.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `src/server/mappers/auth-mapper.ts` only if DTO mapping requires adjustment
- `src/server/contracts/auth-contract.ts` only if contract shape must be clarified
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`

Blocked unless separately approved:

- `.env*`, private account/credential files, direct DB connection, schema/migration, seed execution or mutation, package/lockfile changes, e2e spec changes, dev server/browser runtime, Provider/Cost Calibration/staging/prod/payment/external service, PR/force push, and final Pass claim.

## Validation

Validated at `2026-06-25T05:51:12-07:00`.

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Result | Notes                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`                                                                                                                                                                                                                                                                                                                                                   | PASS   | 2 files passed; 11 tests passed.                                                                  |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md` | PASS   | Evidence formatting was updated; other listed files were unchanged by Prettier in the first pass. |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md` | PASS   | `All matched files use Prettier code style!`                                                      |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | PASS   | No whitespace errors.                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-effective-role-source-repair-planning-2026-06-24`                                                                                                                                                                                                                                                                               | PASS   | `filesToScan: 5`; all five changed files matched allowed scope; pre-commit hardening passed.      |

Final diagnosis status before closeout: `reviewed_effective_role_source_diagnosis_no_final_pass`.

Closeout update:

- Fresh approval source: current user message at `2026-06-25`, "先执行commit/merge/push/cleanup".
- Closeout timestamp: `2026-06-25T05:56:36-07:00`.
- Final status for this task: `closed_effective_role_source_diagnosis_no_final_pass`.
- No MVP final Pass claim was made.

## 品味合规自检 Checklist

- [x] 没有修改产品源码、测试源码、数据库 schema、migration 或 seed。
- [x] 没有读取 `.env*`、凭据、私有账号文件或连接数据库。
- [x] API/DB/前端命名仅在文档中引用既有术语，未引入新缩写。
- [x] 没有使用空字符串代替 `null` 的代码改动。
- [x] 没有新增 UI 魔法颜色、间距、硬编码主题逻辑或组件结构。
- [x] 没有把 UI 可见性当作授权边界；结论基于 session/service/source trace。
- [x] 没有宣称标准版/高级版 MVP final Pass。
- [x] 下一步 repair 范围明确分离源码修复与高风险 DB/runtime 验证。
