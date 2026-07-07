# Full-role UI/UX batch 1 operations and super admin baseline

Date: 2026-07-07

## Scope

This batch defines the UI/UX remediation baseline for operations pages used by
`ops_admin` and `super_admin`. It builds on the batch 0 global baseline and the
68 screenshot inventory captured outside the repository.

The baseline is documentation-only. It does not change code, accounts,
fixtures, DB content, Provider behavior, packages, env files, schema,
migrations, seed files, deployment state, release readiness, production
usability, staging, or Cost Calibration.

## User Goal And Accessibility Target

Operations users need to answer three questions quickly:

1. Which platform object am I operating on?
2. What is the current state and risk?
3. What is the next safe action?

The accessibility target is not a full WCAG claim from screenshots. The target
for later implementation is clear heading order, keyboard-reachable controls,
visible disabled reasons, sufficient target size, and state text that does not
depend only on color or icons.

## Current Strengths

- The backend shell already separates `运营后台`, `内容后台`, and `组织后台`
  for super admin.
- Operations page families already expose protected views for users,
  organizations, authorizations, `redeem_code`, audit logs, and AI call logs.
- High-risk actions generally use confirmations or guarded controls rather than
  immediate one-click mutation.
- The `redeem_code` page already distinguishes generation, distribution,
  list/detail, status, and operational copy behavior.
- The AI/log page already uses redacted summaries and separate model, prompt,
  audit, call, and cost areas.

## P1 Baseline Items

### 1. Super Admin Organization Workspace Entry Must Be Explicit

Observed pattern:

- The super admin shell offers an `组织后台` workspace entry.
- The target organization pages render a blocked/unauthenticated-looking state
  rather than a clear organization-context state.

Baseline:

- If `super_admin` is not intended to operate inside an organization context,
  the workspace switcher should not present `组织后台` as an ordinary destination.
- If `super_admin` is intended to proxy or inspect organization context, the
  entry should first require an explicit organization selection or explain that
  no organization context is selected.
- The message must not say or imply “please log in” when the admin session is
  valid. Use a missing-context or unsupported-context template.

Suggested state copy:

- Title: `需要选择组织上下文`
- Body: `当前管理员会话有效，但此页面需要明确的组织范围。请选择一个组织，或返回运营后台处理组织与授权。`
- Primary action: `返回运营后台`
- Secondary action, only if supported later: `选择组织`

### 2. Operations Workspace Needs A Summary-First Workbench

Observed pattern:

- The operations pages function as long ledgers and forms.
- The first visible page does not consistently tell the operator what needs
  attention next.

Baseline:

- Every operations page should start with: context, operational summary, and the
  next safe action.
- Long ledgers should move below summary and filters.
- Risk states should be visible before raw row scanning:
  - expiring authorization;
  - quota pressure;
  - disabled or anomalous accounts;
  - failed import or failed mutation;
  - AI/log errors requiring review.

### 3. Organization Operations Must Separate Tree, Auth, Employees, And Audit

Observed pattern:

- Organization management combines organization tree, authorization packages,
  employee operations, import/transfer/unbind review, and lists in one long
  surface.

Baseline:

- Use four stable sections:
  - `组织结构`
  - `企业授权`
  - `员工账号`
  - `操作记录`
- Each section should have its own summary, filters, list/detail area, and
  primary action.
- Create/update/disable actions must keep confirmation and safe wording.
- When a selected organization exists, its context should remain visible while
  working in auth or employee panels.

### 4. User Operations Must Separate Account Families And Risky Actions

Observed pattern:

- User and admin-account management share a dense page with filters, creation,
  list, details, and security policy.

Baseline:

- Split scan paths by account family:
  - platform admin accounts;
  - personal learner accounts;
  - organization employee accounts.
- Account creation should state the distribution responsibility and never imply
  that secrets are recoverable after creation.
- Reset, disable, and enable controls should show the impact before
  confirmation, including session impact and whether authorization is preserved.
- Technical identifier-like details should be hidden by default or moved behind
  a compact “copy safe identifier” affordance.

### 5. Logs Must Be Operator-Readable Before Technical

Observed pattern:

- The AI/log page contains model config, prompt template, formal-adoption
  review, audit log, AI call log, and cost summary in one operations surface.

Baseline:

- Keep the page, but organize it as:
  - `待处理`
  - `模型与配置`
  - `审计日志`
  - `AI调用日志`
  - `用量摘要`
- Show anomalies first, then ledger detail.
- Detail panels must remain redacted summary-only.
- Cost summary can be shown as a local operations estimate, but this batch does
  not perform or claim Cost Calibration.

## P2 Baseline Items

### Contact Configuration

- Keep the editing form, but make the right side a real preview:
  - learner-facing preview;
  - active/inactive or last-saved state;
  - last updated time in user-readable form;
  - safety notice preview.
- Move technical identifier-like metadata out of the primary header.
- The primary save button should stay near the form and describe the exact
  object: `保存购买联系方式`.

### Redeem Code Operations

- Preserve plaintext `redeem_code` display for eligible operations UI. This is
  an explicit product requirement.
- Improve scanning with grouped filters:
  - card type;
  - edition;
  - profession/level;
  - unused/used/expired;
  - generation batch or distribution window.
- Generated distribution should remain distinct from the historical list.
- Copy actions need visible feedback and a reminder that evidence/logs remain
  redacted.

### Buttons And Disabled States

- One primary action per section.
- Destructive actions use error styling and confirmation.
- Disabled buttons must pair with a reason visible in the same panel.
- Secondary buttons should be used for navigation, detail view, or setup.

### Menu Naming

Recommended operations menu names:

| Current family    | Preferred display | Reason                                       |
| ----------------- | ----------------- | -------------------------------------------- |
| contact config    | `购买联系方式`    | Stable and user-facing.                      |
| users             | `账号与用户`      | Distinguishes platform and learner accounts. |
| organizations     | `企业与授权`      | Covers org tree plus `org_auth`.             |
| redeem code       | `卡密与兑换`      | Keeps `redeem_code` concept but adds action. |
| audit and AI logs | `日志与AI治理`    | Broader than one ledger, less technical.     |

These are baseline recommendations, not approved code changes.

## Page-Level Recommendations

| Role          | Page                 | Baseline recommendation                                                                |
| ------------- | -------------------- | -------------------------------------------------------------------------------------- |
| `super_admin` | `ops-contact-config` | Add learner-facing preview, save scope, last update, and secondary metadata placement. |
| `super_admin` | `ops-users`          | Same as operations user page; emphasize super admin can create platform roles.         |
| `super_admin` | `ops-organizations`  | Same as operations organization page; show platform-wide impact before mutations.      |
| `super_admin` | `ops-redeem-codes`   | Preserve plaintext display; separate distribution from historical ledger.              |
| `super_admin` | `ops-ai-audit-logs`  | Prioritize anomalies and governance tasks before raw summary rows.                     |
| `super_admin` | organization entry   | P1: clarify missing organization context or hide unsupported ordinary entry.           |
| `ops_admin`   | `ops-organizations`  | Split organization tree, auth, employee, and audit tasks.                              |
| `ops_admin`   | `ops-users`          | Split account families and risky actions.                                              |
| `ops_admin`   | `ops-redeem-codes`   | Keep eligible plaintext display; improve filters, status badges, and copy feedback.    |
| `ops_admin`   | `ops-ai-audit-logs`  | Separate audit log, AI call log, model config, prompt registry, and usage summaries.   |

## State Templates For Operations

| State                         | Copy direction                                                              |
| ----------------------------- | --------------------------------------------------------------------------- |
| No operations data            | `当前没有可展示的运营数据，可先从账号、企业授权或卡密生成入口开始。`        |
| Missing organization context  | `当前管理员会话有效，但此页面需要明确的组织范围。`                          |
| Standard organization context | `当前为标准版组织范围，仅展示员工、授权和基础状态；高级能力不可用。`        |
| High-risk action confirmation | `此操作会影响平台级账号、授权或会话，请确认对象和影响范围。`                |
| Plaintext redeem code shown   | `当前页面允许运营分发查看明文；证据、日志、导出和非授权页面仍保持脱敏。`    |
| Redacted log detail           | `仅展示脱敏摘要，不展示原始请求、密钥、会话、Provider 请求或完整生成内容。` |
| Provider or model unavailable | `当前无法执行模型相关操作，可查看历史摘要或等待具备审批的配置任务。`        |

## Accessibility Risks Visible From Screenshots

- Very long desktop pages increase keyboard and screen-reader traversal cost.
- Dense table/list cards can obscure the relationship between filters and rows.
- Small secondary metadata and status badges may be hard to read at common
  workplace monitor scaling.
- Disabled actions need text reasons, not only opacity.
- Technical identifier-like chips should not dominate reading order.

These are visible risks from screenshots and source review only. Keyboard,
focus order, screen-reader labeling, and contrast still require implementation
verification in a later code/design task.

## Follow-Up Fix Candidates

No code issue is fixed in this batch. Later work should first locate root cause
before opening a fix branch.

| Candidate                                     | Likely area                                                       | Required next step                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| super admin organization workspace state copy | Admin shell plus organization workspace capability/state handling | Reproduce and trace session, role, and organization context without recording sensitive data. |
| operations menu naming                        | Admin shell menu labels                                           | Confirm product naming decision before implementation.                                        |
| technical identifier-like UI prominence       | Operations list/detail components                                 | Decide which identifiers remain visible, hidden, or copy-only.                                |
| operations long-page density                  | Operations page components                                        | Implement sectioned summaries and detail expansion in separate UI branches.                   |

## Explicit Non-Claims

- No code implementation.
- No confirmed current-code defect fixed.
- No new accounts, content, screenshots, browser actions, DB reads/writes,
  Provider calls, dependency changes, env changes, schema/migration/seed
  changes, staging/prod/deploy work, release readiness, production usability,
  or Cost Calibration.
