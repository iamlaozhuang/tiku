# Owner-Facing Role Gap Capture Scope

## Status

- Date: 2026-06-28
- Scope: role-by-role owner-facing experience validation checklist and gap-capture scope.
- Trigger: owner confirmed the six discussed role groups should be documented after logic review.
- Runtime claim: none.
- Implementation claim: none.

This document records the product verification scope for later local owner-facing walkthroughs and small scoped repairs.
It does not execute browser validation, create implementation tasks, approve schema/migration, call Provider, run Cost
Calibration, modify pricing/quota defaults, deploy staging/prod, touch payment/OCR/export/external services, or claim
release/final Pass.

## Source Inputs

| Source                                                                                               | Role in this scope                                                                                                       |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `docs/01-requirements/00-index.md`                                                                   | Standard MVP goals, non-goals, role-separated addendum entry.                                                            |
| `docs/01-requirements/modules/01-user-auth.md`                                                       | `user`, `employee`, `organization`, `redeem_code`, `personal_auth`, `org_auth`, and employee import rules.               |
| `docs/01-requirements/modules/02-question-paper.md`                                                  | Formal `question`, `paper`, `material`, `paper_section`, `question_option`, `analysis`, and `standard_answer` lifecycle. |
| `docs/01-requirements/modules/03-student-experience.md`                                              | Standard learner practice, `mock_exam`, `exam_report`, and `mistake_book` baseline.                                      |
| `docs/01-requirements/modules/04-ai-scoring.md`                                                      | `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, model config, and Prompt baseline.                       |
| `docs/01-requirements/modules/06-admin-ops.md`                                                       | Operations/content/organization backend boundaries, employee import, content AI draft/review, and admin permissions.     |
| `docs/01-requirements/advanced-edition/00-index.md`                                                  | Advanced edition reading surface and cross-cutting AI/training/log boundaries.                                           |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                  | `edition`, `effectiveEdition`, `auth_upgrade`, `org_auth`, multi-scope, employee import, and quota owner rules.          |
| `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`                                 | AI task status, retry, quota summary, and redacted failure category boundaries.                                          |
| `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`                         | Personal and employee learner `AI训练`, `AI出题`, and `AI组卷` boundaries.                                               |
| `docs/01-requirements/advanced-edition/modules/04-organization-training.md`                          | Standard/advanced organization admin and employee `企业训练` boundaries.                                                 |
| `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`                         | Organization analytics summaries and raw-answer privacy boundary.                                                        |
| `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`                        | Ops authorization, `redeem_code`, `org_auth`, upgrade, employee import, and quota governance.                            |
| `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`                       | Redaction and log governance for `audit_log` and `ai_call_log`.                                                          |
| `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`                     | Organization admin `AI出题` and `AI组卷` boundaries.                                                                     |
| `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`                    | Atomic multi-`profession`/`level`/`subject` `org_auth` direction.                                                        |
| `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`         | AI generation audiences, entries, output ownership, and formal content separation.                                       |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`           | Role-separated standard/advanced targets and R1-R15 repair routing.                                                      |
| `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md` | Backend workspace IA, state, route, data privacy, and role/edition UX contract.                                          |
| `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`                            | Role experience matrix and release-blocked gap inventory.                                                                |
| `docs/03-standards/glossary.yaml`                                                                    | Registered terms and enum names used in this checklist.                                                                  |

Evidence-only context:

- `docs/05-execution-logs/evidence/2026-06-28-local-role-browser-acceptance-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-full-loop-post-provider-rollup-evidence.md`
- `docs/05-execution-logs/evidence/2026-06-28-local-blocked-gate-supersession-triage.md`

## Decision Summary

No additional ordinary role group needs product discussion before documentation. The verification scope is complete when
it covers:

- `org_advanced_admin`
- `org_standard_admin`
- `org_standard_employee`
- `org_advanced_employee`
- `ops_admin`
- `content_admin`
- `personal_standard_student`
- `personal_advanced_student`

`super_admin` is not added as another route-smoke role for this owner-facing loop. It is recorded only as the required
high-privilege owner for future 系统提示词 (`prompt_template`) viewing/editing unless a separate permission model grants
`prompt_template:read` or `prompt_template:write`.

The next useful local verification should be product/UX gap capture, not another proof that the six browser routes are
reachable. Use the completed six-role route evidence only as baseline history.

## Global Verification Rules

Every later walkthrough or repair derived from this document must check:

- whether the user can naturally find the capability without manual URL entry;
- whether the page supports the role's real business decision or task;
- whether role, `edition`, `effectiveEdition`, `organization`, `profession`, `level`, and `subject` boundaries are
  visible and enforceable;
- whether Loading, Empty, Error, Permission denied, standard-unavailable, disabled, success, and confirmation states are
  present where the workflow needs them;
- whether the Chinese UI is natural and role-appropriate;
- whether direct route access fails safely when the role is not allowed;
- whether no sensitive raw content is visible in ordinary UI or evidence.

Do not treat hidden navigation as authorization. Direct route and service checks remain required.

## Local Walkthrough And Repair Boundary

The preferred next walkthrough starts at `http://localhost:3000/organization/organization-analytics` as
`org_advanced_admin` and captures product/UX/business gaps. It should not repeat the prior six-role route-smoke proof.

If local private acceptance accounts under `D:\tiku-local-private\acceptance` are needed, they may be used only as
localhost login inputs. Credential values, cookies, tokens, localStorage, Authorization headers, account identifiers, or
raw session material must not be copied into evidence, screenshots, terminal output, or committed documents.

If a later gap requires code changes, use a fresh short branch and a task plan before editing source, tests, docs,
state, or evidence. Prefer small, deterministic fixes that do not touch blocked gates. After implementation, run scoped
validation, write redacted evidence and audit review, then stop for the applicable Git closeout approval before commit,
merge, push, cleanup, PR, or force push.

## Role Checklist: `org_advanced_admin`

Primary question: can an advanced organization admin use the workspace to decide, assign, generate, and improve
organization training without entering global operations or formal platform content areas?

### Information Architecture

- Starts in a first-class organization workspace, not `/admin/ops`.
- Shows current `organization`, source `edition`, computed `effectiveEdition`, `upgradeStatus`, expiry, authorized
  scope, and quota owner as summaries.
- Makes `企业训练`, `organization analytics`, `AI出题`, and `AI组卷` discoverable from the organization workspace.
- Keeps global `user`, global `redeem_code`, global `org_auth`, content authoring, Provider config, Cost Calibration,
  payment, staging/prod, and deploy surfaces denied.

### Organization Analytics

- Supports decision-making from organization-level summaries, not just decorative charts.
- Shows participation, completion, score summaries, weak `knowledge_node`, training status, trend or comparison cues,
  and risk groups where data is available.
- Provides practical filters such as time range, `profession`, `level`, `subject`, training task, department or
  organization node where allowed.
- Allows drill-down to summary-level employee progress without raw subjective answer text.
- Provides Empty/Error states that explain whether no training, no employees, no authorization, or no result data exists.
- Does not expose employee raw subjective answers, personal AI output, prompts, Provider payloads, raw AI output, raw DB
  rows, or internal ids.

### Organization Training

- Can create or manage organization training only inside the scoped `organization`.
- Can see assignment target, training objective, `profession`, `level`, `subject`, question or paper-like structure,
  start/end window, version/status, assigned/started/completed counts, and failed/blocked counts.
- Can move from analytics insight into training creation or adjustment without losing context.
- Can inspect employee progress summaries while preserving answer privacy.
- Supports draft, publish/assign, takedown, expired, completed, and no-assignment states.
- Published organization training/content is not directly edited; changes require copy/new draft/new version semantics.
- Organization training remains separate from formal `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.

### Organization `AI出题`

- Entry is visible for valid advanced `org_auth`; `org_standard_admin` receives denied or standard-unavailable state.
- Generation form captures `profession`, `level`, `subject`, `knowledge_node`, question type, count, difficulty or
  learning objective, and organization context.
- Form validates authorization scope, missing inputs, quota blocked state, data-insufficient state, expired/revoked
  state, and retry/failure state.
- Result is an organization-owned draft or managed learning content proposal, not a formal platform `question`.
- Result structure can show draft question text, `question_option`, `standard_answer`, `analysis`,
  `ai_explanation`, `scoring_point`, `material`, or `question_group` when available, but evidence must not record full
  generated content.
- Adoption into platform formal content is out of scope unless a later governed content adoption path is approved.

### Organization `AI组卷`

- Entry is visible for valid advanced `org_auth`; URL-only access fails future acceptance.
- Generation form captures `profession`, `level`, `subject`, question count, question-type distribution, difficulty,
  `knowledge_node` coverage, `paper_section` structure, training objective, and organization context.
- Result shows draft `paper`-like structure, `paper_section`, question counts, type distribution, and knowledge coverage
  summary.
- Result can support organization-managed training after organization admin confirmation.
- Result is not written into formal platform `paper`, is not published to formal `mock_exam`, and is not exported.
- Failure and retry states expose only safe status and redacted reason categories.

## Role Checklist: `org_standard_admin`

Primary question: can a standard organization admin manage the organization basics without accidentally receiving
advanced training or AI capabilities?

- Starts in the organization workspace with `organization` context.
- Can view or manage organization-scoped employees where the product grants it.
- Can view organization authorization/status summaries: source `edition`, computed `effectiveEdition`,
  `upgradeStatus`, expiry, authorized scopes, and support/contact states.
- Can see enough context to understand why `企业训练`, `AI出题`, `AI组卷`, and advanced analytics are unavailable.
- Direct access to organization training, organization analytics, organization AI question generation, and organization
  AI `paper` generation must return permission denied or standard-unavailable state.
- Must not access global operations, global `org_auth`, global `redeem_code`, content authoring, Provider config, Cost
  Calibration, payment, staging/prod, or deploy surfaces.
- Must not show empty advanced pages that look broken or unfinished.

## Role Checklist: Enterprise Employees

Enterprise employee verification must split standard and advanced employees. A single generic `employee` route check is
not enough for product acceptance.

### Shared Employee Checks

- Employee starts in a learner-facing surface, not an admin workspace.
- Organization context is visible when the employee is using `org_auth`.
- `profession`, `level`, and `subject` available to the employee derive from active organization authorization scope, not
  from import input fields.
- Employee cannot access organization admin, content admin, ops admin, global logs, Provider, Cost, deploy, payment,
  export, or raw sensitive surfaces.
- Practice, `mock_exam`, `exam_report`, and `mistake_book` behavior follows the learner baseline where authorized.
- Chinese UI should use employee language such as “我的训练”, “我的练习”, “学习反馈”, and “授权状态”, not operations or
  database wording.

### `org_standard_employee`

- Has standard organization-authorized learning only.
- Must not see learner `AI训练`.
- Must not see `企业训练`.
- Direct route access to learner AI generation, AI `paper` generation, or enterprise training is denied or
  standard-unavailable.
- If no valid organization authorization covers the selected `profession`/`level`/`subject`, the page explains the
  authorization problem without exposing internal `org_auth` ids.
- No upgrade/payment/pricing/quota-default decision is implied.

### `org_advanced_employee`

Primary question: can an advanced employee complete assigned enterprise training and run personal learning AI workflows
without leaking content to organization admins or formal content records?

#### Enterprise Training

- Shows assigned `企业训练` when valid advanced `org_auth` covers the employee's `organization`.
- Shows task title, target `profession`, `level`, `subject`, status, question count, deadline, and progress summary.
- Supports start, continue, submit, expired, completed, no-task, revoked/expired authorization, and save-failure states.
- Allows answering assigned training without writing formal `practice`, `mock_exam`, `exam_report`, or `mistake_book`
  records unless a later approved formal flow exists.
- Shows feedback that is useful to the employee while preserving organization admin privacy boundaries.

#### Employee `AI出题`

- Entry appears under learner `AI训练`, not content or organization admin backend.
- Purpose is personal or organization-context self-practice and weak-point remediation, not formal content production.
- Form captures active authorization context, `profession`, `level`, `subject`, `knowledge_node`, question type, count,
  difficulty, and learning goal.
- Validates missing scope, standard edition, expired/revoked authorization, quota blocked state, insufficient knowledge
  source, and retry/failure state.
- Generated output stays in the learner AI content domain owned by the employee/user in the organization context.
- It must not write formal `question`, formal `paper`, formal `practice`, formal `mock_exam`, formal `exam_report`, or
  formal `mistake_book` records by itself.
- Organization admins may see redacted usage and quota summaries only; they must not see raw generated content, prompts,
  raw AI input/output, or task details.

#### Employee `AI组卷`

- Entry appears under learner `AI训练` and is discoverable without manual URL.
- Purpose is personal self-test or practice paper generation, not formal platform `paper` production.
- Form captures active authorization context, `profession`, `level`, `subject`, question count, question-type
  distribution, `knowledge_node` range, difficulty, time target, and learning goal.
- Result shows a personal practice-paper structure with `paper_section`, counts, distribution, and knowledge coverage
  summary where available.
- Supports begin answering, previous/next, save, submit confirmation, continue, timeout/expired authorization, and
  failure states.
- Feedback should include score or summary, wrong questions, weak `knowledge_node`, `learning_suggestion`, and clear
  distinction between teacher `analysis` and `ai_explanation`.
- Must not publish, share to other employees, write formal `paper`, or enter organization analytics as raw content.

## Role Checklist: `ops_admin`

Primary question: can platform operations safely govern accounts, organizations, authorization, import, resources, and
logs without becoming a content authoring or Prompt-editing superuser?

### Workspace And Denials

- Starts in the operations workspace.
- Can access `user`, `organization`, `employee`, `redeem_code`, `authorization`, `personal_auth`, `org_auth`,
  resources, `knowledge_base`, `audit_log`, and `ai_call_log` summary surfaces.
- Cannot access content authoring routes for formal `question`, `material`, `paper`, or content AI draft creation.
- Cannot access organization training management, organization analytics, organization AI generation, Provider config,
  Cost Calibration, payment, staging/prod, deploy, OCR/export, or external-service execution.

### User, Organization, And Employee Operations

- `user` list/detail supports `user_type`, status, search/filter, enable/disable, reset password, and redacted status
  summaries.
- `organization` tree supports node status, hierarchy, employees, and authorization status.
- Employee list supports create, bind, unbind, transfer, disable/enable, and import entry where implemented.
- Import and transfer results must record summary counts and redacted reasons, not raw rows or phone numbers.

### Enterprise Authorization And Atomic Scope

- `org_auth` creation explicitly selects `edition = standard | advanced`.
- Standard-to-advanced organization upgrade uses governed `auth_upgrade.source_type = ops_manual`; it does not overwrite
  source `org_auth.edition`.
- A commercial enterprise authorization package may cover multiple `profession`, multiple `level`, and multiple
  `subject` values.
- The system must decompose such a package into atomic authorization scopes for effective checks, quota, expiry,
  cancellation, overlap, and audit.
- One atomic target scope is: effective `organization` coverage plus one `profession`, one `level`, one `subject`, one
  `edition`, one time window, and one quota rule.
- Do not store comma-joined values or unreviewed arrays inside a single `org_auth` field as the authorization source of
  truth.
- UI must show bundle summary, expanded atomic scopes, conflict warnings, quota impact, expiry differences, and
  cancellation implications before submit.
- `auth_scope_type` describes organization coverage only and must not be overloaded for `profession`, `level`,
  `subject`, or `edition`.

### Employee Import At Authorization Time Or After Authorization

- During `org_auth` creation or after authorization, operations can continue to an “导入员工” step.
- The same import should also be reachable from `organization` detail or employee management.
- The import template contains only fields needed to create or bind employees to `organization`.
- The template must not include `profession`, `level`, `subject`, `edition`, `orgAuthId`, `orgAuthScopePublicId`, or
  internal ids.
- Upload preview shows total rows, importable rows, skipped rows, error rows, inherited scope summary, and quota impact
  as computed outputs.
- Typical redacted errors: duplicate employee, invalid phone format, organization unavailable, insufficient
  authorization, quota blocked, or already bound elsewhere.
- Submit requires confirmation and returns success/failure counts only.
- Evidence must not record employee names, phone numbers, raw spreadsheet rows, or complete file contents.
- Employee visible scope updates when organization authorization changes; re-import should not be required solely
  because `org_auth` scope changes.

### `redeem_code`

- Supports single and specified-quantity generation.
- Requires explicit `profession` and `level`.
- Lists and evidence do not expose plaintext `redeem_code`.
- Any reveal/copy flow for distribution is separately permissioned and remains excluded from evidence unless later
  approved.

### Resource, Knowledge, And Logs

- Resource and `knowledge_base` management can cover upload, Markdown publish, `knowledge_node`, vector rebuild trigger,
  and status handling where already implemented or later approved.
- Must not execute OCR/export or external services under this scope.
- `audit_log` and `ai_call_log` views show redacted summaries only.
- Ordinary log details must not show prompt text, Provider payload, raw AI output, secret, token, API key, plaintext
  `redeem_code`, raw employee answers, or full `question`/`paper`/`resource`/`chunk` content.

### Prompt Governance Supplement

- 系统提示词 is modeled by the registered `prompt_template` term for documentation, API, and source planning.
- Ordinary `ops_admin` should not edit `prompt_template`.
- Accepted future governance model: `super_admin` or a separate explicit `prompt_template:read` /
  `prompt_template:write` permission can view and edit `prompt_template`.
- The prompt surface should show purpose, template key, version, status, owner, last updated time, applicable feature,
  and publish state.
- Coverage should include `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, AI question generation, and
  AI `paper` generation.
- Editing flow should support draft, validation, publish, rollback, and `audit_log`.
- Prompt text must not contain secrets, API keys, connection strings, or tokens.
- `ai_call_log` should record Prompt version and redacted summary, not raw Prompt text in ordinary evidence.
- This supplement does not approve Provider calls, Prompt execution, model configuration changes, or source/schema work.

## Role Checklist: `content_admin`

Primary question: can content admins maintain formal content and review AI drafts without entering operations,
organization, Provider, or raw sensitive surfaces?

### Formal Content

- Starts in the content workspace.
- Can manage formal `question`, `material`, `paper`, `paper_section`, `paper_asset`, `knowledge_node`, and tags.
- Question list supports `profession`, `level`, `subject`, question type, status, tag, `knowledge_node`, and keyword
  filters.
- Question editor preserves `question_option`, `standard_answer`, `analysis`, `scoring_point`, `material`, and
  `question_group` semantics.
- Paper management supports draft, choose questions, set score, organize `paper_section`, publish validation, unpublish,
  copy, and source asset handling.
- `knowledge_node` management supports tree maintenance, sort/move/disable, bound question counts, and
  `kn_recommendation` review or correction.
- Content admin cannot access operations `user`, global `organization`, `employee` import, `redeem_code`, `org_auth`,
  global logs, organization training/analytics, Provider config, Cost Calibration, payment, deploy, OCR/export, or
  external services.

### Content `AI出题`

- Entry is discoverable from the content workspace.
- Output enters content AI draft/review domain first.
- Form captures `profession`, `level`, `subject`, `knowledge_node`, question type, count, difficulty, and source/context
  constraints.
- Draft may include question stem, `question_option`, `standard_answer`, `analysis`, `scoring_point`, `material`, or
  `question_group` structure when relevant.
- Formal adoption requires human review, edit, validation, ownership/source attribution, and `audit_log`.
- Direct write to formal `question`, direct publish, or bypass of duplicate and validation checks is forbidden.
- Evidence must not record prompt text, raw AI output, or complete generated question content.

### Content `AI组卷`

- Entry is discoverable from the content workspace.
- Output enters content AI draft/review domain first.
- Form captures `profession`, `level`, `subject`, question count, question-type distribution, difficulty,
  `knowledge_node` coverage, `paper_section` structure, and source pool constraints.
- Draft result shows `paper_section`, count, distribution, knowledge coverage summary, and candidate selection summary
  where available.
- Formal adoption requires content admin review, adjustment, validation, and `audit_log`.
- Direct formal `paper` publish, export, payment, Provider-cost decision, or external-service integration is forbidden.

### Review States

- Draft review must distinguish pending review, adopted, rejected, and needs revision.
- Review should expose reviewer action, status, safe summary, and next action.
- It must not leak prompt, raw Provider payload, raw AI output, or complete generated content into evidence.

## Role Checklist: Personal Students

Personal learner verification should split standard and advanced personal students because AI capability is editioned.

### Shared Learner Checks

- Learner home shows authorized `profession`, `level`, and `subject` in business language.
- Practice, `mock_exam`, `exam_report`, and `mistake_book` are usable according to the standard learner requirements.
- No learner can access backend operations, content admin, organization admin, global logs, Provider, Cost, deploy,
  payment, OCR/export, or external-service surfaces.
- Mobile-first interaction is important: controls should be reachable, text should not overflow, and task progress should
  be clear.

### `personal_standard_student`

- Has standard personal learning only.
- Does not receive usable `AI训练`.
- Direct route access to learner `AI出题` or `AI组卷` is denied or standard-unavailable.
- Upgrade guidance can exist, but must not open pricing, payment, quota default, or Cost Calibration decisions under this
  scope.

### `personal_advanced_student`

- Has discoverable learner `AI训练`.
- `AI训练` exposes `AI出题` and `AI组卷`.
- AI question generation captures `profession`, `level`, `subject`, `knowledge_node`, question type, count, difficulty,
  and learning goal.
- AI `paper` generation captures `profession`, `level`, `subject`, question count, type distribution,
  `knowledge_node` coverage, difficulty, and self-test goal.
- Generated content is personal learning content owned by the user and must not write formal `question` or `paper`.
- Practice on generated content should support answer, feedback, wrong-question handling where applicable, weak
  `knowledge_node`, `learning_suggestion`, and clear `analysis` versus `ai_explanation` wording.
- Provider mock/contract, failure, retry, quota blocked, expired authorization, and unavailable states must be clear.

## Cross-Role Chinese UI And Interaction Checklist

Every later page-level verification should include Chinese UI quality:

- No visible raw enum values such as `single_choice`, `paper_section`, `org_auth`, or `effectiveEdition` unless the page
  is explicitly a technical/admin summary that still has a Chinese label beside it.
- No English placeholder text, untranslated component labels, or database-field copy.
- Use role-appropriate terms:
  - learner: 学习、练习、模拟考试、错题本、AI训练、学习建议;
  - enterprise employee: 我的训练、我的练习、学习反馈、企业授权;
  - organization admin: 组织训练、员工进度、授权状态、分析决策;
  - content admin: 题目、材料、试卷、草稿评审、发布校验;
  - ops admin: 用户、企业、员工、授权、卡密、日志.
- Forms explain how to fix validation errors.
- Destructive actions require confirmation and clear consequence wording.
- Success states tell the user what changed and what they can do next.
- Empty states distinguish no data, no permission, no authorization, no assignment, and advanced unavailable.
- Error states avoid stack traces, raw DB rows, secrets, Provider payloads, prompts, or raw AI output.
- Tables and cards do not truncate critical Chinese text on desktop; learner and employee pages are checked on mobile.
- Status is not communicated by color alone.

## Gap Capture Format For Later Walkthroughs

Use one row per observed gap:

| Field            | Meaning                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `gapId`          | Stable id such as `ORG-ADV-ANALYTICS-001`.                                                                         |
| Role             | One of the role ids in this document.                                                                              |
| Surface          | Page or workflow name, not a secret URL with internal ids.                                                         |
| Expected         | Requirement from this document or linked SSOT.                                                                     |
| Observed         | Redacted behavior summary.                                                                                         |
| Severity         | `critical`, `major`, `minor`, or `polish`.                                                                         |
| Fix class        | `copy`, `empty_state`, `permission`, `navigation`, `workflow`, `data_contract`, `source_required`, `blocked_gate`. |
| Safe next action | Small local repair, docs-only clarification, or blocked by fresh approval.                                         |

Evidence may record role labels, route labels, status labels, counts, severity, and redacted summaries only.

## Recommended Walkthrough Order

1. Start from `org_advanced_admin` at `http://localhost:3000/organization/organization-analytics` and capture
   owner-facing gaps in analytics, training, AI question generation, and AI `paper` generation.
2. Check `org_standard_admin` denial/unavailable boundaries against the same advanced surfaces.
3. Split enterprise employee checks into `org_standard_employee` and `org_advanced_employee`.
4. Check `ops_admin` operations flows, especially `org_auth`, multi-scope authorization, employee import, and log
   redaction.
5. Check `content_admin` formal content and AI draft/review flows.
6. Check `personal_standard_student` and `personal_advanced_student` learner AI boundaries and ordinary learning flows.
7. Apply the cross-role Chinese UI checklist to every page inspected.

## Blocked Gates Preserved

This scope does not approve:

- another six-role route smoke or walkthrough unless the owner requests it as a new validation task;
- Cost Calibration, cost measurement, pricing, or production quota defaults;
- Provider calls, Provider configuration, Prompt execution, or env/secret access;
- staging/prod/cloud/deploy, release readiness, production readiness, or final Pass;
- payment, OCR, export, or external-service work;
- package or lockfile changes;
- `.env*` changes;
- schema, migration, seed, DB write, destructive DB operation, or `drizzle-kit push`;
- PR creation, force push, or remote deployment;
- evidence containing credentials, connection strings, secret, token, cookie, localStorage, Authorization header, raw DB
  rows, internal ids, email/phone, plaintext `redeem_code`, raw DOM, screenshots, traces, Provider payload, prompt, raw
  AI output, employee subjective answers, or full `question`/`paper`/`resource`/`chunk` content.
