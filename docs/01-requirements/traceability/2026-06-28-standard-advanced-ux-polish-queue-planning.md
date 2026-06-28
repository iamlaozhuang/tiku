# Standard Advanced UX Polish Queue Planning

## Status

- Date: 2026-06-28
- Task id: `standard-advanced-ux-polish-queue-planning-2026-06-28`
- Scope: docs/state-only planning for organization backend standard/advanced UX polish.
- Runtime claim: none.
- Implementation claim: none.
- Release readiness claim: none.
- Final Pass claim: none.

This planning packet refreshes the organization backend standard/advanced UX matrix and prepares the next serial task queue. It does not approve source edits, tests, browser/dev-server/e2e, DB, Provider, Cost Calibration, staging/prod/deploy, payment, OCR/export, external-service, PR, force push, release readiness, or final Pass.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Source Inputs

| Source                                                                                                         | Role in this planning packet                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                                             | Standard MVP boundary and role-separated addendum entry.                                                      |
| `docs/01-requirements/modules/06-admin-ops.md`                                                                 | Backend workspace separation, organization admin boundary, and standard admin non-goals.                      |
| `docs/01-requirements/advanced-edition/00-index.md`                                                            | Advanced role/edition requirements and cross-cutting blocked gates.                                           |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                            | `effectiveEdition`, source `edition`, `auth_upgrade`, `org_auth`, quota owner, and UI-not-auth-boundary rule. |
| `docs/01-requirements/advanced-edition/modules/04-organization-training.md`                                    | Organization training eligibility and standard/advanced admin boundaries.                                     |
| `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`                                   | Organization analytics summary-only and export/raw-answer boundaries.                                         |
| `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`                                  | Operations authorization/quota summaries that organization UX may reference safely.                           |
| `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`                               | Organization AI generation discoverability, ownership, standard-unavailable, and Provider-blocked boundary.   |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`                     | Role-separated R1-R15 repair target and runtime gate context.                                                 |
| `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`                   | AI entry and formal content separation requirements.                                                          |
| `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`           | Existing backend UX IA, state, role, and acceptance-label contract.                                           |
| `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`              | Prior polish split; treated as predecessor input, not as approval for this new task queue.                    |
| `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-local-browser-validation.md`         | Latest local browser evidence; used as history only and not as release readiness.                             |
| `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-state-polish-source-only.md`                | Prior source-only page-state polish evidence; used as history only.                                           |
| `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-permission-contract-tdd.md`          | Prior permission contract evidence; used as history only.                                                     |
| `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-shell-source-only.md`                            | Shell/nav/workspace switcher history.                                                                         |
| `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`                      | Backend direct-route guard contract history.                                                                  |
| `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md` | Organization workspace capability-summary integration history.                                                |
| `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-backend-role-browser-validation.md`              | Earlier local role browser observation history.                                                               |

## Planning Result

The current durable evidence supports a local-only organization backend path where standard organization admins are gated from advanced surfaces and advanced organization admins can render organization portal, training, analytics, and AI generation surfaces. That evidence remains local and scoped. It does not close staging, production, Provider, payment, export, OCR, release readiness, or final acceptance.

The next useful work is a serial polish package that separates:

1. shell/navigation/gated-copy source-only polish;
2. page-level empty/loading/error/disabled/upgrade state source-only polish;
3. permission/capability contract TDD for the polished state decisions;
4. local browser validation after source and contract work, with fresh approval only.

## Current Experience Matrix

| Surface                                   | Current local status                                                                                               | Standard organization admin expectation                                                                                                 | Advanced organization admin expectation                                                                                         | UX polish need                                                                                                           | Remaining blocked gates                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Backend shell, workspace switcher, logout | Source-only shell and local browser role matrix have prior evidence.                                               | Clear organization workspace label, no operations/content confusion, visible logout, advanced entries not presented as usable controls. | Clear organization workspace label, visible logout, training/analytics/AI entry cluster visible when capability summary allows. | Tighten shell/nav grouping, gated copy, active workspace hierarchy, unavailable-state wording, and route-return actions. | Browser rerun requires fresh approval; release readiness and final Pass blocked.                                        |
| Organization portal                       | Prior source and browser evidence indicates portal is available.                                                   | Employee/status/auth summary and support guidance only; no advanced training or AI promise.                                             | Portal acts as a launch point for training, analytics, and organization AI generation.                                          | Improve information hierarchy, capability summary labels, upgrade/support guidance, and empty-state copy.                | DB-backed `org_auth`/atomic scope runtime, Provider, staging/prod blocked.                                              |
| Organization training                     | Prior source/contract evidence indicates standard is gated and advanced can render.                                | Standard-unavailable state with operations-managed upgrade guidance; direct route must not grant capability.                            | Draft/create/bind/copy-oriented training management states with safe disabled actions.                                          | Clarify loading, empty, disabled-submit, copy/new-version, standard-unavailable, and no-formal-`paper` wording.          | DB writes, schema/migration, employee answer runtime, staging/prod blocked unless separately approved.                  |
| Organization analytics                    | Prior source/contract evidence indicates standard is gated and advanced can render.                                | Standard-unavailable state; no analytics controls that imply advanced access.                                                           | Summary-only statistics shell, privacy notice, export disabled, no raw answer text.                                             | Clarify empty summaries, loading/error states, export-disabled copy, and privacy hierarchy.                              | Export, raw employee subjective answer text, DB runtime, staging/prod blocked.                                          |
| Organization AI generation                | Prior source/contract evidence indicates standard is gated and advanced can render local-contract-safe entry.      | Standard-unavailable state; no generation controls.                                                                                     | Discoverable `AI出题` and `AI组卷` entries with safe task/history/empty states.                                                 | Clarify Provider-blocked state, generation-disabled copy, history empty/error states, and formal-content separation.     | Provider calls/configuration, prompt/raw output evidence, Cost Calibration, formal `question`/`paper` adoption blocked. |
| Permission/capability contract            | Prior unit evidence covers direct-route role guard and capability summary consumption.                             | Standard access decisions fail closed for advanced-only routes even if URL is typed.                                                    | Advanced availability depends on service-provided capability summary, not UI role labels.                                       | Add focused contract coverage for new shell/nav/page-state decisions and missing-context fallbacks.                      | Real DB-backed authorization computation, schema/migration, `org_auth_scope` blocked.                                   |
| Local browser validation                  | Prior local browser validation exists, including credential-assisted rerun evidence, but it is not a release gate. | Observe standard gated states and visible logout without recording credentials or storage.                                              | Observe advanced rendered states and visible logout without recording raw DOM/screenshots/traces.                               | Rerun after new source/contract polish only, with redacted route/state/count evidence.                                   | Browser/dev-server action requires fresh approval; e2e/full suite, staging/prod, PR, final Pass blocked.                |

## Experience Issues To Carry Forward

| Issue id | Area                  | Problem statement                                                                                                                                                                                     | Planned task                                                              |
| -------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| UX-P1    | Shell/navigation      | Organization admin shell still needs tighter workspace grouping, gated-copy consistency, and return-to-workspace actions for denial/unavailable states.                                               | `organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28` |
| UX-P2    | Entry states          | Standard and advanced entries need consistent empty/loading/error/disabled/upgrade copy across portal, training, analytics, and AI generation.                                                        | `organization-workspace-page-states-polish-source-only-2026-06-28`        |
| UX-P3    | Information hierarchy | Standard organization UX must be useful without overexplaining advanced capabilities; advanced UX must prioritize training, analytics, and AI generation without implying Provider/payment readiness. | Tasks 1 and 2                                                             |
| UX-P4    | Permission contract   | Polished gated copy must remain backed by service/capability decisions and direct-route denial; UI copy must not become the authorization boundary.                                                   | `organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`     |
| UX-P5    | Browser evidence      | Prior local browser evidence should be rerun only after polish tasks, with redacted route/state/count evidence and no raw browser artifacts.                                                          | `organization-workspace-ux-polish-local-browser-validation-2026-06-28`    |
| UX-P6    | High-risk lanes       | DB/schema, real Provider, payment, export/OCR, staging/prod/deploy, and Cost Calibration are unrelated to source polish and must remain separate approval packages.                                   | Future blocked gates only                                                 |

## Risk Split

| Risk tier                             | Allowed in this planning output                                                                                     | Blocked or future approval requirement                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `docs_state_only`                     | Update requirements traceability, queue, project state, task plan, evidence, audit, acceptance.                     | No runtime, source, tests, browser, DB, Provider, deploy, payment, export, OCR.                                              |
| `source_only_ui`                      | Future source-only tasks may adjust shell/nav/page-state copy and focused unit tests after fresh approval.          | No permission model changes, DB, Provider, browser, e2e, schema, package, env.                                               |
| `permission_contract_tdd`             | Future focused contract/source/tests may harden direct-route and capability-summary decisions after fresh approval. | No DB reads/writes, schema/migration, Provider, browser, staging/prod, payment.                                              |
| `local_browser_validation`            | Future localhost-only browser observation may record role, route, state, count, pass/fail after fresh approval.     | No screenshots, traces, raw DOM, credentials, storage dumps, DB rows, e2e specs, staging/prod.                               |
| `db_schema_migration`                 | Not seeded for execution here.                                                                                      | Requires separate schema/migration approval package and local DB gates.                                                      |
| `provider_cost`                       | Not seeded for execution here.                                                                                      | Provider calls/configuration, prompt/raw output, quotas, and Cost Calibration remain blocked.                                |
| `payment_export_ocr_external_service` | Not seeded for execution here.                                                                                      | Requires separate fresh approval and cannot be bundled into UX polish.                                                       |
| `staging_prod_deploy_release`         | Not seeded for execution here.                                                                                      | Requires isolated staging/prod target, env/secret boundary, deployment approval, and cannot be inferred from local evidence. |
| `closeout`                            | Local commit may be allowed by this docs/state task; merge/push/cleanup are not approved here.                      | Fast-forward merge, push, branch cleanup, PR, force push require fresh closeout approval.                                    |

## Serial Follow-Up Queue

| Order | Task id                                                                   | Risk tier                | Purpose                                                                                                                                                                    | Status after this planning task                                         |
| ----- | ------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1     | `organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28` | source-only UI           | Polish backend shell/navigation grouping, gated copy, workspace switcher labels, denial/unavailable return actions, and visible logout context for organization workspace. | Blocked pending fresh source-only UI approval.                          |
| 2     | `organization-workspace-page-states-polish-source-only-2026-06-28`        | source-only UI           | Polish organization portal, training, analytics, and AI generation loading/empty/error/disabled/upgrade states and information hierarchy.                                  | Blocked pending fresh source-only UI approval after task 1.             |
| 3     | `organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`     | permission contract TDD  | Add focused contract coverage that polished source states still consume service-side capability summary and direct-route decisions.                                        | Blocked pending fresh permission contract approval after tasks 1 and 2. |
| 4     | `organization-workspace-ux-polish-local-browser-validation-2026-06-28`    | local browser validation | Observe localhost route/state matrix after source and contract tasks with redacted role/route/state/count evidence only.                                                   | Blocked pending fresh local browser approval after tasks 1-3.           |
| 5     | closeout                                                                  | closeout                 | Commit/merge/push/cleanup decision for the serial package.                                                                                                                 | Not approved here; requires fresh closeout approval.                    |

## Task 1 Boundary

`organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`

Allowed future scope after fresh approval:

- backend shell/navigation source files listed by queue;
- shared backend unavailable/denied state source only where used by shell/nav;
- focused unit tests for navigation grouping, gated copy, workspace switcher labels, visible logout, and no advanced controls for standard summaries;
- task plan, evidence, audit, acceptance, project state, and task queue.

Forbidden:

- permission model or DB-backed authorization changes;
- browser/dev-server/e2e;
- schema/migration/seed;
- package/lockfile/env;
- Provider, Cost Calibration, staging/prod/deploy, payment, OCR/export, external service;
- PR, force push, release readiness, final Pass.

Minimum validation:

- focused unit tests named in the queue entry;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- scoped Prettier write/check;
- `git diff --check`;
- `Get-TikuProjectStatus.ps1`;
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`.

Copyable approval text:

```text
我批准执行低风险 source-only UI 任务 organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28。允许只修改任务队列列明的后台 shell/nav/gated copy 相关前端 source 文件、必要 focused unit test，以及本任务 task plan/evidence/audit/acceptance 和 state/queue。必须保持 effectiveEdition 由服务层能力摘要计算，UI 不得作为授权边界；禁止 schema/migration/seed、package/lockfile、.env*、DB、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

## Task 2 Boundary

`organization-workspace-page-states-polish-source-only-2026-06-28`

Allowed future scope after fresh approval:

- organization portal, training, analytics, and organization AI generation entry source files listed by queue;
- organization workspace access helper only for presentational state classification, not authorization computation;
- focused unit tests for empty/loading/error/disabled/upgrade/standard-unavailable copy and absence of advanced controls for standard capability summaries;
- task plan, evidence, audit, acceptance, project state, and task queue.

Forbidden:

- DB-backed `org_auth`, `auth_upgrade`, `org_auth_scope`, quota, or permission model implementation;
- Provider calls/configuration, prompts, raw AI output, formal `question`/`paper` adoption;
- browser/dev-server/e2e;
- schema/migration/seed;
- package/lockfile/env;
- staging/prod/deploy, payment, OCR/export, external service;
- release readiness or final Pass.

Minimum validation:

- focused unit tests named in the queue entry;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- scoped Prettier write/check;
- `git diff --check`;
- `Get-TikuProjectStatus.ps1`;
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-page-states-polish-source-only-2026-06-28`.

Copyable approval text:

```text
我批准执行低风险 source-only UI 任务 organization-workspace-page-states-polish-source-only-2026-06-28。允许只修改任务队列列明的组织后台 portal、training、analytics、AI generation 页面状态相关前端 source 文件、必要 focused unit test，以及本任务 task plan/evidence/audit/acceptance 和 state/queue。目标是完善空态、加载态、错误态、禁用态、升级提示和信息层级；禁止 schema/migration/seed、package/lockfile、.env*、DB、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

## Task 3 Boundary

`organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`

Allowed future scope after fresh approval:

- route guard/capability contract source files listed by queue;
- organization workspace access adapter only when needed to consume service-provided capability summary;
- focused unit tests for direct-route denial, standard-unavailable decisions, missing organization context, and advanced capability summary consumption;
- task plan, evidence, audit, acceptance, project state, and task queue.

Forbidden:

- DB connection/read/write, schema/migration/seed, `org_auth_scope` persistence;
- Provider, Cost Calibration, browser/dev-server/e2e;
- package/lockfile/env;
- staging/prod/deploy, payment, OCR/export, external service;
- release readiness or final Pass.

Minimum validation:

- focused unit tests named in the queue entry;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- scoped Prettier write/check;
- `git diff --check`;
- `Get-TikuProjectStatus.ps1`;
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`.

Copyable approval text:

```text
我批准执行权限/授权 contract 任务 organization-workspace-ux-polish-permission-contract-tdd-2026-06-28。允许修改任务队列列明的组织后台 route guard/capability contract、service adapter、workspace access adapter、focused unit test，以及本任务 task plan/evidence/audit/acceptance 和 state/queue。必须保持 effectiveEdition 由服务层计算，UI 文案和菜单可见性不得作为授权边界；禁止 schema/migration/seed、DB 连接或读写、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

## Task 4 Boundary

`organization-workspace-ux-polish-local-browser-validation-2026-06-28`

Allowed future scope after fresh approval:

- localhost/127.0.0.1 existing target checks only;
- role/route/state/count/pass-fail browser observation for organization backend standard and advanced roles;
- evidence, audit, acceptance, project state, and task queue updates;
- no source/test/e2e file changes.

Forbidden evidence:

- credentials, token, cookie, localStorage/session storage, raw DOM, screenshots, traces, videos, HTML reports;
- DB rows, database URL, Authorization header, secrets;
- Provider payload, prompt, raw AI output;
- plaintext `redeem_code`, full `question`, full `paper`, employee subjective answer text.

Minimum validation:

- local target check only if approved;
- approved redacted browser observation command only;
- scoped Prettier write/check on docs/state/evidence files;
- `git diff --check`;
- `Get-TikuProjectStatus.ps1`;
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-ux-polish-local-browser-validation-2026-06-28`.

Copyable approval text:

```text
我批准执行本地浏览器验证任务 organization-workspace-ux-polish-local-browser-validation-2026-06-28。范围仅限 localhost/127.0.0.1 上的既有本地目标和任务队列列明的组织后台标准版/高级版角色与路由；证据只能记录角色、路由、状态、数量和脱敏结果。禁止记录凭据、token、cookie、localStorage、原始 DOM、截图、trace、DB 行、Provider payload、prompt、原始 AI 输出、明文 redeem_code、员工主观答案或完整题目/试卷内容。禁止 DB/schema/migration、Provider、Cost Calibration、staging/prod/deploy、payment/OCR/export/external-service、PR、force push、release readiness 和 final Pass。
```

## Closeout Boundary

This planning task may use local commit when validation passes. It does not approve:

- fast-forward merge to `master`;
- push to `origin/master`;
- branch cleanup;
- PR creation;
- force push;
- release readiness;
- final Pass.

Copyable closeout approval text for a later fresh decision:

```text
我批准对 standard-advanced-ux-polish-queue-planning-2026-06-28 的已验证本地提交执行 closeout：仅允许 fast-forward merge 到 master、运行必要 master 门禁、push origin/master，并在确认已合入后删除对应短分支。不得创建 PR、force push、执行 staging/prod/deploy/payment/OCR/export/external-service、DB、Provider、Cost Calibration，且不得声明 release readiness 或 final Pass。
```

## Closeout Statement

This document closes only the docs/state planning label for the refreshed organization backend UX polish queue. It does not prove source implementation, permission enforcement beyond existing local evidence, browser acceptance for future polish tasks, DB readiness, Provider readiness, staging readiness, release readiness, or final Pass.
