# Full-role UI/UX batch 2 organization admin workspace baseline

Date: 2026-07-07

## Scope

This batch defines the UI/UX remediation baseline for organization admin pages used by `org_standard_admin` and
`org_advanced_admin`.

The baseline is documentation-only. It does not change code, accounts, fixtures, DB content, Provider behavior, packages,
env files, schema, migrations, seed files, deployment state, release readiness, production usability, staging, or Cost
Calibration.

## User Goal And Accessibility Target

Organization admins need to answer five questions quickly:

1. Which organization context am I operating in?
2. Am I in standard or advanced organization scope?
3. Which actions are view-only, and which are allowed to create organization-owned work?
4. What can become enterprise training versus what cannot become platform formal content?
5. What employee data is aggregated, and what remains hidden?

The accessibility target is not a full WCAG claim from screenshots. Later implementation should provide clear heading
order, keyboard-reachable controls, visible disabled reasons, consistent state templates, and text that does not depend
only on color or icons.

## Current Strengths

- The organization backend has a separate workspace shell and organization-specific navigation.
- `org_standard_admin` sees a useful organization overview with employee/status and authorization/status cards.
- `org_advanced_admin` sees advanced organization entries for `企业训练`, `统计摘要`, `AI出题`, and `AI组卷`.
- Standard-only direct-route states exist for advanced organization surfaces.
- Enterprise training already uses first-release wording around drafts, source binding, publishing, copying, and
  version-like lifecycle states.
- Organization analytics already separates enterprise-training statistics from formal learning aggregate signals and
  names the raw-answer privacy boundary.
- Organization AI pages already distinguish organization-owned training drafts from platform formal content and expose
  recent task/history sections.

## P1 Baseline Items

### 1. Organization Context Must Use Human-Readable Scope, Not Technical Identifier-Like Text

Observed pattern:

- The organization portal and analytics pages put a technical identifier-like organization value in the primary reading
  path.

Baseline:

- The header should show a human-readable organization name, scope label, edition, and capability state.
- Technical identifier-like values should not dominate the visual hierarchy.
- If a support flow needs a copyable safe reference, keep it behind a secondary copy control with a short label such as
  `复制支持用标识`.
- Evidence, docs, screenshots in repo, and logs must remain redacted.

### 2. Standard Organization Admin Denials Need One Shared Backend-State Template

Observed pattern:

- Standard direct-route denial exists, but advanced route pages can render as a small centered message with large empty
  canvas and little relationship to the organization overview.

Baseline:

- Use one standard-unavailable template across training, analytics, `AI出题`, and `AI组卷`.
- The state should preserve organization workspace context and explain:
  - current standard scope still allows roster/status and authorization/status viewing;
  - the requested feature is advanced-only;
  - upgrade or authorization maintenance is owned by platform operations;
  - the safe return path is organization overview.
- Avoid generic forbidden or login language when the session and organization workspace are valid.

### 3. Training List And Creation Wizard Should Be Separated

Observed pattern:

- The advanced training page can show a training list and the full multi-step creation controls in one long page.

Baseline:

- Default page should start with context, training summary, filters, and the training list.
- `新建企业训练` should open a dedicated wizard surface or an expanded panel that does not compete with the list.
- The four steps remain:
  1. choose source;
  2. configure training;
  3. set publish scope and answer settings;
  4. preview and publish.
- The wizard should show clear step progress, draft save state, disabled reasons, and publish blockers.

### 4. Organization Admin Read/Write Boundary Must Be Explicit

Baseline:

- `org_standard_admin` can view scoped employee roster/status and organization authorization/status.
- `org_advanced_admin` adds organization-owned training, analytics, and organization AI draft workflows.
- Platform operations still owns organization tree mutation, employee import/mutation, employee binding, `org_auth`
  creation, upgrade, renewal, and quota/governance changes.
- UI copy should avoid implying that organization admins can import employees, modify the organization tree, or adjust
  authorization packages in the first release.

### 5. Organization AI Output-To-Training Handoff Needs A Single Clear Path

Observed pattern:

- Organization AI pages show generation forms and recent task/history content, but the next-action hierarchy is dense.

Baseline:

- Organization AI output belongs to the organization draft/training domain.
- The allowed next action is review then copy/create an enterprise-training draft after explicit confirmation.
- The forbidden shortcut is direct platform formal `question`, formal `paper`, `practice`, `mock_exam`, `exam_report`, or
  `mistake_book` write.
- `evidence_status = none` blocks publish; `evidence_status = weak` requires explicit confirmation.
- Prompt, Provider payload, raw AI I/O, global logs, raw employee answers, and out-of-scope task payloads remain hidden.

## P2 Baseline Items

### Portal Information Architecture

- Split portal cards into:
  - standard scope: roster/status and authorization/status;
  - advanced scope: training, analytics, organization `AI出题`, organization `AI组卷`;
  - support scope: contact operations for upgrade, renewal, or authorization changes.
- Use edition badges consistently: `标准版组织后台` and `高级版组织后台`.
- Advanced cards shown to standard admins should be explanatory and non-actionable unless product decides to expose an
  upgrade request route later.

### Organization Analytics

- Keep enterprise-training analytics and formal learning aggregate signals in separate labeled sections.
- Move date range, organization scope, and privacy warning into a compact filter/context band.
- Use small-sample warning prominently when the group is below the approved threshold.
- Keep no-export wording close to the disabled export control.
- Employee summaries should remain aggregate-only and should not reveal raw subjective answers or unrelated personal
  learning.

### Organization Training

- List rows should expose lifecycle and next action without showing all edit/publish/copy controls at once.
- Drafts need: edit, bind source, preview employee view, publish readiness, discard.
- Published versions need: view summary, copy to new draft, takedown with reason, read-only historical summaries.
- Source selection should keep the approved sources clear:
  - platform paper snapshot;
  - organization AI result;
  - manual grouping/manual questions.
- `mock_exam` remains out of source entry.

### Organization AI Pages

Apply the batch 0 five-zone structure:

1. Context: organization, edition, quota owner, and draft domain.
2. Mode: `AI出题` versus `AI组卷`.
3. Parameters: compact grouped form.
4. Boundary note: organization training draft only; no platform formal writes.
5. Result/history: task status, review, retry, copy-to-training-draft, and safe failure reason.

Use one primary green action per generation section. Secondary actions should be review, history, save draft, or return.

### Button And State Rules

- Disabled buttons must have visible reasons in the same panel.
- Destructive actions such as discard or takedown require confirmation and reason capture.
- Long task-history rows should favor progressive disclosure over always-open dense details.
- Pagination and filter state should remain near the list they affect.

## Page-Level Recommendations

| Role                 | Page                                | Baseline recommendation                                                                                  |
| -------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | organization portal                 | Keep roster/status and authorization/status first; show advanced capability explanation without action.  |
| `org_standard_admin` | organization training direct route  | Shared standard-unavailable template with current allowed scope and operations-owned upgrade guidance.   |
| `org_standard_admin` | organization analytics direct route | P1: use the same full-width backend-state template instead of a narrow/empty-looking refusal state.      |
| `org_standard_admin` | organization AI direct routes       | Shared standard-unavailable template; no generation form, history, quota, or task details.               |
| `org_advanced_admin` | organization portal                 | Add readable organization context, standard/advanced summary, and split standard versus advanced cards.  |
| `org_advanced_admin` | enterprise training                 | Separate list from creation wizard; keep lifecycle, version, takedown, and draft blockers visible.       |
| `org_advanced_admin` | analytics                           | Keep aggregate-only sections; reduce filter/result density; replace technical scope text in header.      |
| `org_advanced_admin` | organization AI question generation | Apply five-zone AI structure and make review-to-training-draft the dominant next action after success.   |
| `org_advanced_admin` | organization AI paper generation    | Same as AI question generation, while preserving local assembly-plan behavior and no formal-paper write. |

## State Templates For Organization Admins

| State                         | Copy direction                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| Standard unavailable          | `当前为标准版组织后台，仅开放员工名单、员工状态和授权状态查看。此功能需要高级版企业授权。`          |
| Missing organization context  | `当前管理员会话有效，但此页面需要明确的组织范围。`                                                  |
| No enterprise training        | `当前组织还没有企业训练。高级版管理员可从平台试卷快照、组织 AI 结果或手工编题创建训练草稿。`        |
| Draft not publishable         | `当前草稿缺少必要内容或依据，暂不能发布。`                                                          |
| Weak evidence publish warning | `资料依据较弱，发布前需要确认适用范围和员工可见内容。`                                              |
| Analytics small sample        | `当前样本较少，统计结果仅作趋势参考。可扩大组织范围或统计周期后再判断。`                            |
| Provider unavailable          | `当前无法执行生成请求；可查看历史摘要或保留表单，等待具备审批的本地执行条件。`                      |
| Quota blocked                 | `当前组织授权范围或额度不足，生成请求不能继续。请联系平台运营处理授权或额度。`                      |
| Redacted privacy boundary     | `仅展示组织范围内脱敏汇总，不展示员工原始作答、个人无关学习、Prompt、Provider payload 或原始结果。` |

## Accessibility Risks Visible From Screenshots

- Long training and AI pages increase keyboard traversal and scanning cost.
- Centered standard-unavailable states can be hard to relate to the current workspace when the main canvas is otherwise
  empty.
- Dense labels, status chips, and secondary explanations may be hard to read at common workplace monitor scaling.
- Technical identifier-like text in the primary reading path weakens assistive-technology clarity and visual hierarchy.
- Disabled controls and post-generation next actions need text reasons, not only color, opacity, or spatial grouping.

These are visible risks from screenshots and source-entry review only. Keyboard order, focus style, screen-reader labels,
contrast, responsive reflow, and live region behavior still require implementation verification in later tasks.

## Follow-Up Fix Candidates

No code issue is fixed in this batch. Later work should first locate root cause before opening a fix branch.

| Candidate                                      | Likely area                              | Required next step                                                                  |
| ---------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| organization context display is too technical  | organization portal and analytics header | Confirm display-name source and safe copy-reference behavior before implementation. |
| standard-unavailable layout consistency        | organization advanced route state pages  | Reproduce all standard direct routes and replace with shared state component.       |
| training list and wizard density               | organization training page               | Split list/summary from create wizard in a dedicated UI branch.                     |
| organization AI post-generation action density | organization AI pages                    | Make review-to-training-draft handoff the primary success path.                     |
| organization admin read/write wording          | portal and admin copy                    | Audit labels so roster/status is not confused with employee mutation authority.     |

## Explicit Non-Claims

- No code implementation.
- No confirmed current-code defect fixed.
- No new accounts, content, screenshots, browser actions, DB reads/writes, Provider calls, dependency changes, env
  changes, schema/migration/seed changes, staging/prod/deploy work, release readiness, production usability, or Cost
  Calibration.
