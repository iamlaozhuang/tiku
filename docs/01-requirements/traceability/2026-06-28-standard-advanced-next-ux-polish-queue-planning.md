# Standard Advanced Next UX Polish Queue Planning

## Status

- Date: 2026-06-28
- Task id: `standard-advanced-next-ux-polish-queue-planning-2026-06-28`
- Scope: docs/state-only planning for the next organization backend standard/advanced UX polish queue.
- Runtime claim: none.
- Implementation claim: none.

This document splits the next organization backend UX work into approval-ready tasks. It does not approve source, tests, browser, e2e, schema, migration, seed, package or lockfile changes, `.env*`, DB access, Provider calls, Cost Calibration, staging/prod/deploy, payment, external-service work, PR, force push, release readiness, or final Pass.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Source Inputs

| Source                                                                                               | Role in this planning packet                                                                                            |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                                   | Standard MVP boundaries and role-separated addendum entry.                                                              |
| `docs/01-requirements/modules/06-admin-ops.md`                                                       | Backend workspace split, organization admin boundary, and standard admin non-goals.                                     |
| `docs/01-requirements/advanced-edition/00-index.md`                                                  | Advanced edition cross-cutting requirements and role/edition visibility rules.                                          |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                  | `effectiveEdition`, `org_auth`, `auth_upgrade`, quota owner, and UI-not-auth-boundary rules.                            |
| `docs/01-requirements/advanced-edition/modules/04-organization-training.md`                          | Organization training standard/advanced admin boundary.                                                                 |
| `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`                         | Organization analytics summary-only and export/raw-content boundaries.                                                  |
| `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`                        | Operations `org_auth`, `redeem_code`, quota, and employee import boundaries that organization UX must summarize safely. |
| `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`                     | Organization AI generation discoverability, ownership, and standard-unavailable boundary.                               |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`           | R1-R15 role-separated repair routing.                                                                                   |
| `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md` | Existing backend UX IA, state, route, role, and acceptance label contract.                                              |

## Planning Result

The previous backend shell, role guard, organization workspace source contract, and local browser validation tasks prove the first separated organization workspace path at local source and browser-observation levels. The next useful work is not staging or release readiness. It is a smaller UX polish sequence focused on organization standard/advanced experience detail:

1. Make standard organization backend useful and explanatory without exposing advanced controls.
2. Make advanced organization backend denser and clearer for training, statistics, and AI draft entry points.
3. Preserve the service-side `effectiveEdition` and capability summary boundary.
4. Revalidate role and route outcomes with local browser evidence only after source and contract work.

## UX Polish Scope

| Surface                             | Standard organization admin expectation                                          | Advanced organization admin expectation                                                      | Shared redaction boundary                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Organization portal                 | Employee/status/auth summary, support guidance, advanced-unavailable entry state | Employee/status/auth summary plus discoverable training, analytics, and AI entries           | No internal numeric ids, raw `org_auth`, raw `audit_log`, plaintext `redeem_code`, Provider payload, prompt, or raw output |
| Organization training               | Standard-unavailable state with operations-managed upgrade guidance              | Draft/create/bind/copy states with clear loading, empty, error, and disabled submit behavior | No formal `paper` publish claim, no raw employee subjective answer text                                                    |
| Organization analytics              | Standard-unavailable state with summary explanation                              | Summary-only statistics shell with export disabled and privacy explanation                   | No employee answer text, no export, no row-level private data                                                              |
| Organization AI question generation | Standard-unavailable state and no generation controls                            | Discoverable `AI出题` entry with local-contract-safe history/empty/error states              | No Provider call, prompt, raw AI output, or formal `question` write                                                        |
| Organization AI paper generation    | Standard-unavailable state and no generation controls                            | Discoverable `AI组卷` entry with local-contract-safe history/empty/error states              | No Provider call, prompt, raw AI output, or formal `paper` write                                                           |

## Risk Split

| Order | Task id                                                             | Risk tier                         | Purpose                                                                                                                      | Execution status                                 |
| ----- | ------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1     | `organization-workspace-state-polish-source-only-2026-06-28`        | low-risk source-only UI           | Polish organization portal, training, analytics, and AI entry states/copy without changing authorization source of truth     | Blocked until fresh source-only approval         |
| 2     | `organization-workspace-polish-permission-contract-tdd-2026-06-28`  | permission/authorization contract | Add focused tests for direct-route state decisions, standard-unavailable results, and service capability summary consumption | Blocked until fresh permission contract approval |
| 3     | `organization-workspace-polish-local-browser-validation-2026-06-28` | local browser validation          | Observe localhost role/route matrix after the polish source and contract tasks                                               | Blocked until fresh local browser approval       |

## Task 1 Boundary

`organization-workspace-state-polish-source-only-2026-06-28` should be limited to frontend source and focused unit tests for organization backend polish.

Allowed conceptual files for the later approved task:

- organization portal page/source state components;
- organization training page/source state components;
- organization analytics page/source state components;
- organization AI generation entry page/source state components;
- backend shared state components only when needed for copy/state consistency;
- focused unit tests for rendered state, labels, disabled controls, and absence of advanced controls for standard capability summaries;
- task plan/evidence/audit/acceptance.

Blocked in that task:

- schema, migration, seed, package/lockfile, `.env*`;
- DB connection or write;
- Provider call or configuration;
- browser/dev-server/e2e;
- staging/prod/deploy/payment/external-service;
- Cost Calibration, release readiness, final Pass.

## Task 2 Boundary

`organization-workspace-polish-permission-contract-tdd-2026-06-28` should keep authorization in service/contract space.

Required invariants:

- UI does not compute `effectiveEdition`.
- Direct routes for standard organization admin remain standard-unavailable or denied for advanced-only surfaces.
- Advanced organization admin availability depends on service-side `AdminWorkspaceCapabilitySummary`.
- Missing organization context does not become an advanced availability fallback.
- Contract tests must not require DB rows or Provider execution.

## Task 3 Boundary

`organization-workspace-polish-local-browser-validation-2026-06-28` should run only after tasks 1 and 2 close.

Allowed browser evidence:

- role label;
- route or route group label;
- visible state category;
- pass/fail status;
- aggregate count;
- redacted notes.

Forbidden browser evidence:

- credentials, token, cookie, localStorage, raw DOM, screenshots, traces, DB rows, Provider payload, prompt, raw AI output, plaintext `redeem_code`, full `question`, or full `paper` content.

## Copyable Approval Text

### Source-Only UX Polish

```text
我批准执行低风险 source-only UI 任务 organization-workspace-state-polish-source-only-2026-06-28。允许只修改任务队列列明的组织后台 portal、training、analytics、AI generation 入口相关前端 source 文件、必要 focused unit test，以及本任务 task plan/evidence/audit/acceptance。必须保持 effectiveEdition 由服务层能力摘要计算，UI 不得作为授权边界；禁止 schema/migration/seed、package/lockfile、.env*、DB、Provider、Cost Calibration、staging/prod/deploy、payment/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

### Permission Contract Polish

```text
我批准执行权限/授权 contract 任务 organization-workspace-polish-permission-contract-tdd-2026-06-28。允许修改任务队列列明的组织后台 route guard/capability contract adapter、validator/mapper/service adapter、focused unit test，以及本任务 task plan/evidence/audit/acceptance。必须保持 effectiveEdition 由服务层计算，UI 不得作为授权边界；禁止 schema/migration/seed、DB 连接或写入、Provider、Cost Calibration、staging/prod/deploy、payment/external-service、浏览器/e2e、PR、force push、release readiness 和 final Pass。
```

### Local Browser Validation

```text
我批准执行本地浏览器验证任务 organization-workspace-polish-local-browser-validation-2026-06-28。范围仅限 localhost/127.0.0.1 上的既有本地目标和任务队列列明的组织后台标准版/高级版角色与路由；证据只能记录角色、路由、状态、数量和脱敏结果。禁止记录凭据、token、cookie、localStorage、原始 DOM、截图、trace、DB 行、Provider payload、prompt、原始 AI 输出、明文 redeem_code 或完整题目/试卷内容。禁止 DB/schema/migration、Provider、Cost Calibration、staging/prod/deploy、payment/external-service、PR、force push、release readiness 和 final Pass。
```

## Closeout Statement

This document closes only the planning label for the next UX polish queue. It does not prove source implementation, permission enforcement beyond existing evidence, browser acceptance for the proposed follow-ups, Provider readiness, staging readiness, release readiness, or final Pass.
