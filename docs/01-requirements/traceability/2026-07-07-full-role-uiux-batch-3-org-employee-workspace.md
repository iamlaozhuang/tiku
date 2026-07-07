# Full-role UI/UX batch 3 organization employee workspace baseline

Date: 2026-07-07

## Scope

This batch defines the UI/UX remediation baseline for organization employee learner pages used by
`org_standard_employee` and `org_advanced_employee`.

The baseline is documentation-only. It does not change code, accounts, fixtures, DB content, Provider behavior, packages,
env files, schema, migrations, seed files, deployment state, release readiness, production usability, staging, or Cost
Calibration.

## User Goal And Accessibility Target

Organization employees need to know:

1. Which organization authorization context is active?
2. Which learning tasks are standard learning versus advanced-only AI or enterprise training?
3. Which actions consume organization quota or produce organization-scoped learning content?
4. What can be saved, submitted, or reviewed by the employee?
5. What remains invisible to organization admins, especially raw employee answers and learner AI output?

The accessibility target is not a full WCAG claim from screenshots. Later implementation should verify heading order,
keyboard flow, focus states, target sizes, state announcements, and responsive reflow.

## Current Strengths

- The learner home already hides `AI训练` and `企业训练` when the employee authorization context is not advanced.
- `org_advanced_employee` home exposes both `AI训练` and `企业训练`, satisfying discoverability at the entry level.
- Enterprise training direct-route denial exists for standard employees.
- Enterprise training answer UI supports saving drafts, submitting, and viewing the employee's own result.
- Learner AI page exposes authorization context selection, `AI出题` and `AI组卷` modes, generation feedback, and history
  sections.
- Standard core learning surfaces remain available for standard organization employees.

## P1 Baseline Items

### 1. Learner Shell Must Become Desktop-Readable Without Breaking Mobile-First

Observed pattern:

- Desktop screenshots show a mobile-first learner column floating in a large empty canvas.
- The bottom tab bar stretches across the full desktop width and uses decorative text-symbol icons.

Baseline:

- Mobile should keep bottom tabs and single-column interaction.
- Tablet/desktop should constrain navigation to the content width or use a compact top/side learner navigation pattern.
- The current learning context should be visible near the page title, not only inferred from content.
- Replace decorative tab symbols with the same line-icon language used elsewhere when source implementation begins.

### 2. Standard Employee AI Direct Route Should Be A Pure Unavailable State

Observed pattern:

- Standard employee direct access to the AI page shows an unavailable message, but the page still contains AI history
  shells and uses learner AI page wording.

Baseline:

- For `org_standard_employee`, direct `AI训练` route should render a single standard-unavailable state.
- Do not show generation form, task history, result history, or quota context on unavailable state.
- Copy should say the current organization authorization is standard and AI generation requires advanced organization
  authorization.
- Safe action should return to home or profile authorization details.

### 3. Employee AI Page Must Not Read As Personal-Only When Using Organization Authorization

Observed pattern:

- The advanced employee AI page can show organization authorization contexts while the header still reads as a personal AI
  surface.

Baseline:

- Use `AI训练` as the page title family.
- The context band should explicitly show `组织授权`, `高级版`, organization quota owner, and selected scope.
- Personal-versus-organization wording should be conditional on the selected context.
- Date and scope labels should be human-readable; avoid raw timestamp-like strings in the primary interface.
- The system must not auto-switch context to obtain a higher edition or more quota.

### 4. Enterprise Training Should Start From A List/Detail Flow

Observed pattern:

- The advanced employee enterprise training page can render multiple assigned trainings with full answer areas expanded on
  one long page.

Baseline:

- Default view should be a list of assigned trainings with status, deadline, progress, and primary action.
- Opening one training should reveal the answer workspace for that training only.
- Save draft, submit, confirm submit, and view own result should remain clear.
- Employee results are for the employee's own view; organization admin views remain aggregate/redacted.
- The list page should not expose all question snapshots and all answer inputs at once.

### 5. Standard And Advanced Employee State Templates Need Shared Copy

Baseline:

- Standard employee advanced routes: `当前组织授权为标准版，此功能需要高级版企业授权。`
- Advanced employee no training: `当前组织还没有发布给你的企业训练。`
- Missing organization context: `当前账号未绑定可用组织上下文。`
- Provider unavailable: `当前无法执行生成请求；可保留参数或查看历史摘要。`
- Quota blocked: `当前组织授权范围或额度不足，无法继续生成。`

## P2 Baseline Items

### Home Information Architecture

- Add a compact context band: organization name/scope, authorization source, edition, expiry, and quota owner.
- Group quick actions by capability:
  - standard learning: practice, mock, report, mistake book;
  - account: profile, redeem;
  - advanced: `AI训练`, `企业训练`.
- For standard employees, omit advanced actions from primary actions and provide a short read-only explanation in profile
  or authorization details.
- Avoid making employees infer standard/advanced state from missing buttons alone.

### AI训练 Flow

- Apply the batch 0 five-zone AI structure:
  1. context;
  2. mode;
  3. parameters;
  4. boundary;
  5. result/history.
- The boundary should say learner AI output stays in the employee learning domain and does not write formal `question`,
  `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Generation feedback controls should remain disabled with reasons until a task exists.
- History rows should default to summary with expand/review actions.

### 企业训练 Flow

- First screen should prioritize: assigned count, due soon, in progress, submitted, and not started.
- Training detail should show one question sequence at a time or a clear navigator for larger assignments.
- Submit confirmation should state that post-submit result viewing is employee-owned.
- Takedown and deadline states should explain whether answer is still allowed, draft-only, or read-only summary.

### Standard Core Learning Pages

- Practice and mock empty states should distinguish no published paper from no authorization.
- Reports and mistake book should show filters and empty states close to the list they affect.
- Profile should distinguish personal authorization, organization authorization, effective edition, and quota owner without
  exposing internal identifiers.
- Redeem-code flow remains personal authorization oriented unless a later requirement adds employee self-service
  organization upgrades.

## Page-Level Recommendations

| Role                    | Page                         | Baseline recommendation                                                                                 |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `org_standard_employee` | home                         | Keep standard learning visible; show organization standard context and omit advanced primary actions.   |
| `org_standard_employee` | AI direct route              | P1: pure standard-unavailable state, no generation/history shells.                                      |
| `org_standard_employee` | enterprise training route    | Keep unavailable state; make copy organization-standard specific and return to home/profile.            |
| `org_standard_employee` | profile/redeem               | Show own authorization context clearly; no internal identifiers or organization-admin capability hints. |
| `org_standard_employee` | practice/mock/report/mistake | Preserve standard learning; improve desktop-responsive layout and empty-state specificity.              |
| `org_advanced_employee` | home                         | Make `AI训练` and `企业训练` prominent under an advanced organization context band.                     |
| `org_advanced_employee` | enterprise training          | P1: list/detail split; do not expand all training answer workspaces by default.                         |
| `org_advanced_employee` | AI训练                       | P1: rename context from personal-only wording to selected authorization context; clarify quota owner.   |

## Accessibility Risks Visible From Screenshots

- Desktop learner pages have excessive empty space and a full-width bottom navigation that increases pointer travel.
- Decorative text-symbol navigation icons reduce consistency and assistive clarity.
- Long enterprise-training pages increase keyboard traversal and make the current active assignment hard to track.
- Standard unavailable states centered in large blank canvas need clearer relationship to the current learner context.
- Disabled AI feedback controls need visible reasons and state announcements.
- Raw timestamp-like date strings and technical labels weaken scanability.

These are visible risks from screenshots and source-entry review only. Keyboard order, screen-reader labels, contrast,
zoom resilience, and live region behavior still require implementation verification in later tasks.

## Follow-Up Fix Candidates

No code issue is fixed in this batch. Later work should first locate root cause before opening a fix branch.

| Candidate                                 | Likely area                            | Required next step                                                                  |
| ----------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| learner desktop layout and navigation     | `StudentAppLayout` and learner pages   | Design responsive shell variant and verify mobile behavior remains intact.          |
| standard employee AI unavailable leakage  | learner AI route unavailable rendering | Ensure standard state does not render generation/history shells.                    |
| employee AI context naming                | learner AI header/context band         | Make title and helper copy depend on selected authorization context.                |
| enterprise training all-expanded list     | employee organization training page    | Split assigned training list from active answer detail.                             |
| raw timestamp-like labels in context rows | learner AI authorization context rows  | Replace with human-readable date and scope chips without recording internal values. |

## Explicit Non-Claims

- No code implementation.
- No confirmed current-code defect fixed.
- No new accounts, content, screenshots, browser actions, DB reads/writes, Provider calls, dependency changes, env
  changes, schema/migration/seed changes, staging/prod/deploy work, release readiness, production usability, or Cost
  Calibration.
