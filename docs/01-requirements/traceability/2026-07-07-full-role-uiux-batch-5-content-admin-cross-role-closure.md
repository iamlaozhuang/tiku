# Full-role UI/UX batch 5 content admin and cross-role closure baseline

Date: 2026-07-07

## Scope

This batch defines the UI/UX remediation baseline for `content_admin` pages and the same content workspace reachable by
`super_admin`. It also closes cross-role consistency after batches 0 through 4.

The baseline is documentation-only. It does not change code, accounts, fixtures, DB content, Provider behavior, packages,
env files, schema, migrations, seed files, deployment state, release readiness, production usability, staging, or Cost
Calibration.

## User Goal And Accessibility Target

Content operators need to know:

1. Which content domain is active: formal content, AI draft, resource pipeline, or knowledge node?
2. Which items are drafts, pending review, review failed, published, unpublished, indexing, or ready for retrieval?
3. Which actions are safe to perform now, and why are blocked actions disabled?
4. Whether AI output is only a draft candidate and what review step is required before formal adoption.
5. Whether the current user is `content_admin` or `super_admin` without changing the lifecycle constraints.

The accessibility target is not a full WCAG claim from screenshots. Later implementation should verify heading order,
keyboard flow, focus state, target size, status announcements, table navigation, and responsive reflow.

## Current Strengths

- `content_admin` has separated pages for papers, questions, materials, resources, AI question generation, AI paper
  generation, and knowledge nodes.
- `super_admin` can access the same content-workspace family without using the operations menu as the primary content
  owner.
- Formal content pages expose list and status-oriented management surfaces.
- AI content pages expose generation-oriented surfaces and visible history/review-like sections.
- Resource management and knowledge-node management exist in the content workspace, which is the right ownership domain.
- Prior batches already define shared state templates, button hierarchy, edition-boundary copy, and learner versus admin
  shell rules that can be reused here.

## P1 Baseline Items

### 1. Content Workspace Must Become Lifecycle-First

Observed pattern:

- Content pages are functionally separated, but dense lists and forms make users infer the draft/review/publish loop from
  scattered status fields and actions.

Baseline:

- Every content page should start with a compact lifecycle context band:
  - formal drafts;
  - pending review;
  - review failed;
  - published;
  - unpublished or disabled;
  - resource pipeline state where applicable.
- The primary list should be filtered by lifecycle state without hiding the active filter.
- One primary action should exist per page region. Secondary actions should be quiet and grouped.
- Disabled actions must show a reason close to the control, not only after click.
- Formal content and AI draft candidates must stay visually and operationally distinct.

### 2. AI Paper Generation Must Align To Plan-And-Select Semantics

Observed pattern:

- AI question and AI paper pages share generation-heavy surfaces. This can make AI paper generation read like direct
  Provider generation of full formal question bodies.

Baseline:

- `AI出题` may create complete reviewable question draft candidates.
- `AI组卷` should create an assembly plan, select from the formal platform question bank locally, and create a reviewable
  paper draft container.
- The AI paper page must not imply Provider-created full question bodies as the normal paper outcome.
- Result language should distinguish:
  - plan generated;
  - candidates selected;
  - paper draft created;
  - review required before publish.
- If a future implementation still generates full question bodies inside AI paper generation, treat that as a P1 contract
  gap against the 2026-07-06 AI generation recontract baseline.

### 3. AI Draft Adoption Needs A Dominant Review Path

Baseline:

- AI results enter `待审` or editable draft states first.
- Adoption actions should require reviewer confirmation and validation status.
- Direct publish should not be the dominant or implied next step from AI output.
- Duplicate detection, source attribution, reviewer attribution, and validation status should be visible before adoption.
- Rejected AI results should remain traceable as summaries without exposing raw Provider payloads or raw AI output in the
  UI.

### 4. Questions, Materials, And Papers Need List/Detail Separation

Observed pattern:

- Content question, material, and paper pages read as long management workbenches where filters, lists, details, and forms
  compete for priority.

Baseline:

- Default view should be a list with lifecycle filter, search, status, last action, and primary next step.
- Opening one item should reveal the detail/editor workspace for that item only.
- Published or referenced content should show lock reasons and a safe copy-as-new path.
- Review blockers should be shown before publish actions.
- Empty states should distinguish no data, filtered out data, and insufficient capability.

### 5. Resource And Knowledge Pipeline Must Show State Machines

Baseline:

- Resource states should be explicit: uploaded, converting, draft, published, indexing, retrieval-ready, and index-failed.
- Knowledge node states should show tree path, level applicability, linked resource state, and whether retrieval data is
  current.
- Rebuild or re-index actions should be available only with visible preconditions.
- Resource file paths, internal ids, raw chunks, and private storage details should not appear in primary UI.

### 6. Super Admin Must Not Bypass Content Lifecycle Rules

Baseline:

- `super_admin` can access content pages for oversight, but the same content lifecycle, review, redaction, and Provider
  boundaries apply.
- Super-admin copy may add workspace context, but should not introduce separate terminology that conflicts with
  `content_admin`.
- The operations workspace should not become the default owner for content-resource writes.
- Organization and learner AI outputs must remain separate from formal content adoption.

## P2 Baseline Items

### Menu Naming And Grouping

Recommended content menu labels:

| Current label | Baseline label | Reason                                                |
| ------------- | -------------- | ----------------------------------------------------- |
| `试卷管理`    | `试卷与发布`   | Makes lifecycle and publish responsibility explicit.  |
| `题库管理`    | `题库题目`     | Avoids broad wording and aligns to `question`.        |
| `材料管理`    | `材料库`       | Reads as reusable content, not only CRUD.             |
| `资源管理`    | `资源与知识库` | Connects resource ingestion and retrieval readiness.  |
| `AI出题`      | `AI出题`       | Keep direct and role-familiar.                        |
| `AI组卷`      | `AI组卷`       | Keep direct, but clarify plan-and-select in the page. |
| `知识点树`    | `知识点`       | Avoids over-prescribing a visual tree implementation. |

If implementation later adds grouping, put `AI出题` and `AI组卷` under a content AI assistance group while keeping both
entries visible.

### Page Header And Copy

- Each page should show: workspace, content domain, lifecycle responsibility, and primary safe next step.
- Copy should use role-neutral content terms unless the role difference matters.
- Avoid technical labels, raw timestamps, internal ids, storage details, raw chunks, Provider names, or prompt language in
  primary UI.
- Error and blocked states should say what happened, what is safe now, and which role or lifecycle precondition is
  missing.

### Button And State Rules

- Primary: create draft, start review, publish after blockers cleared, generate plan, generate question drafts, rebuild
  index.
- Secondary: view, edit draft, duplicate, export summary, filter, refresh.
- Destructive or high-risk: discard, disable, unpublish, delete, reject, rebuild retrieval data. These require
  confirmation and should use warning/destructive styling.
- Disabled buttons need visible reasons and must not require trial clicks.

## Page-Level Recommendations

| Role            | Page                   | Baseline recommendation                                                                                  |
| --------------- | ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `content_admin` | content papers         | P1: list/detail split with lifecycle filters, publish blockers, and copy-as-new for locked content.      |
| `content_admin` | content questions      | P1: default to searchable ledger; open one editable draft at a time; show review and reference locks.    |
| `content_admin` | content materials      | P1: show material reuse and lock state before edits; keep full material body out of default list rows.   |
| `content_admin` | content resources      | P1: make upload, conversion, publish, indexing, and retrieval-ready states explicit.                     |
| `content_admin` | AI question generation | P1: AI results must become editable question draft candidates with review status before formal adoption. |
| `content_admin` | AI paper generation    | P1: align to plan-and-select; generated outcome is a reviewable paper draft, not direct formal content.  |
| `content_admin` | knowledge nodes        | P1: show tree path, applicability, linked resources, retrieval freshness, and safe move/toggle actions.  |
| `super_admin`   | content workspace      | P1: same lifecycle and redaction rules as `content_admin`; add oversight context only where useful.      |

## Cross-Role Closure

| Area                  | Closed baseline                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| operations workspace  | Owns users, organizations, authorizations, and audit-style oversight; not formal content authoring.  |
| organization admin    | Owns organization context, employee authorization, organization training, and aggregate analytics.   |
| organization employee | Owns own learning, assigned training answers, and organization-context learner AI where authorized.  |
| personal student      | Owns personal learning and personal-context learner AI where authorized.                             |
| content admin         | Owns formal content lifecycle, resource pipeline, content AI drafts, and knowledge nodes.            |
| super admin           | Can oversee multiple workspaces but must not bypass workspace-specific lifecycle or redaction rules. |

Shared implementation work should therefore prioritize reusable state templates, role-aware context bands, consistent
button hierarchy, and isolated domain-specific workflows rather than one-off page fixes.

## Accessibility Risks Visible From Screenshots

- Dense tables and long forms make scan order and keyboard traversal risky.
- AI pages mix input, result, history, and review surfaces in a way that can obscure the next safe action.
- Status chips and disabled buttons need consistent text alternatives and visible reasons.
- Knowledge tree interactions need keyboard-visible focus, breadcrumbs, and safe move confirmation.
- Resource pipeline failures need concise recovery copy without exposing storage or retrieval internals.

These are visible risks from screenshots and source-entry review only. Browser-based accessibility validation remains a
future implementation task.

## Follow-Up Fix Candidates

No code issue is fixed in this batch. Later implementation should first locate root cause before opening a fix branch.

| Candidate                             | Likely area                                    | Required next step                                                          |
| ------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| lifecycle-first content context bands | admin content page shells and page headers     | Design shared content-workspace context component and per-page summaries.   |
| AI paper plan-and-select alignment    | admin AI paper generation page and API service | Confirm current runtime contract, then split plan, selection, and draft UI. |
| AI draft adoption review path         | admin AI result sections                       | Make review/adopt/reject states explicit without direct formal publish.     |
| resource and knowledge state machine  | resource and knowledge management pages        | Add explicit state vocabulary and recovery actions.                         |
| content list/detail density reduction | papers, questions, materials                   | Split default ledgers from detail/editor workspaces.                        |
| super-admin content workspace context | admin layout and content page headers          | Add oversight context without changing content lifecycle constraints.       |

## Explicit Non-Claims

- No code implementation.
- No confirmed current-code defect fixed.
- No new accounts, content, screenshots, browser actions, DB reads/writes, Provider calls, dependency changes, env
  changes, schema/migration/seed changes, staging/prod/deploy work, release readiness, production usability, or Cost
  Calibration.
