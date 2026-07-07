# Full-role UI/UX batch 4 personal students baseline

Date: 2026-07-07

## Scope

This batch defines the UI/UX remediation baseline for `personal_standard_student` and
`personal_advanced_student` learner pages.

The baseline is documentation-only. It does not change code, accounts, fixtures, DB content, Provider behavior, packages,
env files, schema, migrations, seed files, deployment state, release readiness, production usability, staging, or Cost
Calibration.

## User Goal And Accessibility Target

Personal students need to know:

1. Which personal authorization context is active?
2. Which standard learning tasks are available now?
3. Whether `AI训练` is hidden, unavailable, or usable because of the current edition?
4. Whether generated AI output stays in the learner domain and never writes formal content automatically?
5. What to do when a personal route needs organization context, an upgrade, or a valid `redeem_code`?

The accessibility target is not a full WCAG claim from screenshots. Later implementation should verify heading order,
keyboard flow, focus states, touch target sizing, state announcements, and responsive reflow.

## Current Strengths

- `personal_standard_student` keeps standard learning, profile, and `redeem_code` routes visible while `AI训练` is not a
  primary home action.
- `personal_standard_student` direct access to `AI训练` shows an unavailable state instead of a usable generation form.
- `personal_advanced_student` home exposes `AI训练`, satisfying discoverability without manual URL entry.
- `personal_advanced_student` `AI训练` exposes `AI出题` and `AI组卷` modes, authorization context selection, generation
  controls, result area, and history sections.
- Personal direct access to `企业训练` shows a missing-context or unavailable state rather than creating organization
  training capability.
- Profile and `redeem_code` pages already separate authorization summaries, version authorization, and redemption actions.
- Standard learning pages provide empty or unavailable states for practice and mock routes instead of exposing unrelated
  backend or organization controls.

## P1 Baseline Items

### 1. Learner Shell Must Become Desktop-Readable Without Breaking Mobile-First

Observed pattern:

- Personal student screenshots inherit the same learner shell issue found in batch 3: a narrow mobile-first column floats
  in a large desktop canvas.
- The bottom tab bar spans the desktop viewport and uses decorative symbol-style icons.

Baseline:

- Mobile should keep bottom tabs and a single-column learning flow.
- Tablet and desktop should constrain navigation to the content width or use a compact learner top/side navigation
  variant.
- The current learning context should be visible near the page title, not inferred only from button visibility.
- Replace decorative tab symbols with the same line-icon language used elsewhere when implementation begins.

### 2. Standard Personal AI Direct Route Should Be A Pure Standard-Unavailable State

Observed pattern:

- The standard personal direct-route screenshot shows an unavailable state, which is the correct business boundary.
- Future implementation must keep that page free of usable generation, result, or history controls when the active
  authorization is standard.

Baseline:

- Render one standard-unavailable state for `personal_standard_student` direct access to `AI训练`.
- Copy should say the current personal authorization is standard and AI generation requires advanced personal
  authorization or an approved upgrade path.
- Safe actions should return to learner home, profile authorization details, or `redeem_code`.
- Do not show generation forms, task history, result history, quota controls, or retry controls in the unavailable state.

### 3. Personal Advanced AI Page Needs The Shared Five-Zone Structure

Observed pattern:

- The advanced personal AI page has the required ingredients, but the first viewport reads as a dense vertical form and
  history stack.

Baseline:

Use the batch 0 five-zone structure:

1. context: personal authorization, advanced edition, scope, expiry, and quota owner;
2. mode: `AI出题` versus `AI组卷`;
3. parameters: compact task-specific form with clear disabled reasons;
4. boundary: generated output stays in the learner domain and does not write formal records;
5. result/history: summary-first task state, retry, review, and safe failure reason.

The AI组卷 wording must preserve the current contract: AI generates an assembly plan, and local selection uses allowed
formal question sources.

### 4. Personal Authorization Context Should Be Visible Before The Work Area

Observed pattern:

- Profile displays version authorization details, but home and AI pages do not consistently present a compact personal
  authorization context before task controls.

Baseline:

- Home should show a concise context band: authorization source, edition, profession/level, expiry, and current learning
  scope.
- AI pages should show selected authorization and quota owner before generation controls.
- If multiple personal authorization contexts exist, selection must be explicit; the system must not auto-switch to a
  higher edition or quota owner only to unblock generation.
- Internal identifiers and raw technical values must not appear in the primary UI.

### 5. Personal Access To Enterprise Training Needs A Specific Missing-Organization State

Observed pattern:

- Personal users reaching `企业训练` see a centered unavailable state.

Baseline:

- Copy should make the reason specific: the account is valid, but no organization employee context is selected or
  available.
- This is not a login problem and not a personal edition problem.
- Safe action should return to learner home or profile; do not suggest organization-admin actions to personal students.

## P2 Baseline Items

### Home Information Architecture

- Group quick actions by purpose:
  - standard learning: practice, mock, report, mistake book;
  - account: profile and `redeem_code`;
  - advanced: `AI训练`, only when advanced is available.
- For standard students, missing `AI训练` should be explainable from profile or upgrade guidance, not only from hidden
  navigation.
- Subject grouping and paper counts should remain close to the selected scope.
- Empty states should distinguish no authorization, no published paper, and not-yet-attempted learning history.

### AI训练 Flow

- Use `AI训练` as the learner AI family title.
- Keep `AI出题` and `AI组卷` as explicit modes.
- Show the selected personal authorization context before parameters.
- Put boundary text near the submit action, not buried below histories.
- History rows should be summary-first with expand/review actions.
- Disabled generation, retry, feedback, or practice actions should have visible reasons.

### Profile And Redeem Flow

- Profile should separate account, effective authorization, version authorization, authorization details, and personal
  authorization records.
- The UI may show the signed-in user's own account information, but evidence and committed docs must stay redacted.
- `redeem_code` should remain preview-then-confirm.
- Preview should communicate whether the card opens standard access, advanced access, or upgrades an existing standard
  personal authorization.
- When an upgrade has multiple possible targets, target selection must be explicit before confirmation.

### Standard Learning Pages

- Practice and mock empty states should distinguish missing entry, no published paper, and expired authorization.
- Reports and mistake book filters should be visually tied to the list they control.
- `mistake_book` remains objective-only unless a later approved requirement changes it.
- Report detail should separate score, review, scoring reason, suggestion, and citation areas without exposing raw
  sensitive content in evidence.

## Page-Level Recommendations

| Role                        | Page                         | Baseline recommendation                                                                                |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `personal_standard_student` | home                         | Keep standard learning visible; make standard context and upgrade path discoverable outside hidden AI. |
| `personal_standard_student` | AI direct route              | P1: pure standard-unavailable state, with return/profile/redeem actions only.                          |
| `personal_standard_student` | enterprise training route    | Missing organization context state, not login or generic permission wording.                           |
| `personal_standard_student` | profile/redeem               | Show personal authorization and version status clearly; preserve preview-confirm redemption.           |
| `personal_standard_student` | practice/mock/report/mistake | Preserve standard learning; improve desktop-readable layout and empty-state specificity.               |
| `personal_advanced_student` | home                         | Make `AI训练` prominent under a visible personal advanced context band.                                |
| `personal_advanced_student` | AI训练                       | P1: five-zone layout, visible quota owner, and boundary note before result/history.                    |
| `personal_advanced_student` | enterprise training route    | Explain that enterprise training requires employee organization context; return to home/profile.       |
| `personal_advanced_student` | profile/redeem               | Separate personal auth, effective edition, upgrade status, expiry, and quota owner.                    |
| `personal_advanced_student` | practice/mock/report/mistake | Preserve standard learning flows; avoid AI output being visually mixed into formal reports.            |

## Accessibility Risks Visible From Screenshots

- Desktop learner pages have excessive empty space and full-width bottom navigation.
- Decorative navigation symbols are inconsistent with the icon language used elsewhere.
- Centered unavailable states in a large blank canvas need stronger relationship to the current learner context.
- Long AI pages can create high keyboard traversal cost before result/history areas.
- Disabled or unavailable actions need visible reasons and state announcements.
- Profile and redemption pages risk dense stacked cards on desktop; grouped context and summary/detail structure would
  improve scanability.

These are visible risks from screenshot and source-entry review only. Keyboard order, screen-reader labels, contrast,
zoom resilience, and live region behavior still require later implementation verification.

## Follow-Up Fix Candidates

No code issue is fixed in this batch. Later work should first locate root cause before opening a fix branch.

| Candidate                                  | Likely area                               | Required next step                                                         |
| ------------------------------------------ | ----------------------------------------- | -------------------------------------------------------------------------- |
| learner desktop layout and navigation      | `StudentAppLayout` and learner pages      | Design responsive shell variant and verify mobile behavior remains intact. |
| standard personal AI unavailable leakage   | learner AI unavailable rendering          | Ensure standard state renders no generation, result, or history controls.  |
| personal AI page density and zone order    | learner AI page                           | Reorder context, mode, parameters, boundary, result/history.               |
| personal auth context and quota visibility | home, AI page, profile                    | Add concise context band without exposing raw identifiers.                 |
| enterprise-training personal route copy    | learner organization training route state | Replace generic denial with missing organization context wording.          |

## Explicit Non-Claims

- No code implementation.
- No confirmed current-code defect fixed.
- No new accounts, content, screenshots, browser actions, DB reads/writes, Provider calls, dependency changes, env
  changes, schema/migration/seed changes, staging/prod/deploy work, release readiness, production usability, or Cost
  Calibration.
