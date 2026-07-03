# 2026-07-02 UI/UX Requirement Design Baseline Gap Analysis

## Status

This is a docs-only UI/UX and requirement design baseline.

It does not approve product source changes, tests, schema, migration, DB access, Provider execution, env/secret access,
browser/runtime validation, staging/prod deployment, payment, external-service work, Cost Calibration, release readiness,
final Pass, or production usability claims.

## Purpose

The current requirement tree already contains enough source material to avoid more mechanism archive work. The useful
next step is to pin down the product design baseline and the remaining decision gaps before any UI/source tasks resume.

This document covers:

- role flows and workspace separation;
- enterprise authorization, multi-scope `org_auth`, `redeem_code`, organization tree, employee account, and quota UX;
- organization admin and employee training/statistics flows;
- system operations and content admin management surfaces;
- AI出题 / AI组卷 follow-up actions after generation;
- model, AI interface, Prompt, `audit_log`, and `ai_call_log` governance boundaries.

For the current discussion-round decisions that close several items in this baseline, also read
`docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`.

## Source Authority

| Order | Source                                                                                      | Use in this baseline                                                                                                       |
| ----: | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
|     1 | `AGENTS.md`, code taste commandments, ADRs, UI code standard                                | Execution, naming, architecture, UI and evidence discipline.                                                               |
|     2 | `docs/01-requirements/00-index.md` and standard modules                                     | Standard MVP and shared standard/advanced baseline.                                                                        |
|     3 | Advanced edition index, modules, stories, edition-aware authorization requirements, ADR-007 | Advanced, `edition`, `effectiveEdition`, `authorization`, `org_auth`, `redeem_code`, quota, organization, and AI surfaces. |
|     4 | Latest traceability overlays                                                                | Resolve source-order conflicts and stale residual wording.                                                                 |
|     5 | Current AI generation baseline evidence                                                     | Supersession and closure evidence only; not new requirement scope.                                                         |
|     6 | Capability, use-case, role, delta, and technical matrices                                   | Traceability and landing maps; not runtime pass or implementation approval.                                                |

## First-Principles Baseline

1. Authorization is a runtime service decision. UI visibility helps discovery but never grants access.
2. Every visible capability is the result of actor, organization context, `edition`, `effectiveEdition`, scope, validity,
   expiry, revocation, and quota owner.
3. Workspaces are product domains, not filters on one global backend. Operations, content, and organization workspaces
   must have separate landing, navigation, denial, and audit boundaries.
4. AI generated content is not formal content. Learner AI, organization AI, content AI drafts, and organization training
   remain isolated until a governed adoption path exists.
5. Standard roles need explicit unavailable or denied states for advanced-only surfaces. Silent hiding is not enough
   because direct route access must also fail safely.
6. Logs, evidence, and ordinary admin views are summary surfaces. They must not expose credentials, raw prompts,
   Provider payloads, raw AI output, raw employee answers, full question/paper/material content, internal numeric ids,
   or raw DB rows. Plaintext `redeem_code` has only the 2026-07-02 eligible operations product UI exception; logs,
   evidence, screenshots, exports, audit payloads, and non-eligible views remain redacted.
7. Learner UI is mobile-first. Backend UI is desktop-first, dense, stateful, and task-oriented.

## Role Flow Baseline

| Actor                       | Primary entry                               | Required allowed behavior                                                                                                                          | Required denied or unavailable behavior                                                                                                     |
| --------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Learner home                                | Standard authorized learning, `practice`, `mock_exam`, `exam_report`, `mistake_book`, `redeem_code` and expiry guidance.                           | No advanced `AI训练`; direct advanced AI route is denied or upgrade-guided.                                                                 |
| `personal_advanced_student` | Learner home with `AI训练`                  | `AI训练` exposes `AI出题` and `AI组卷` under personal authorization context.                                                                       | Generated output cannot write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.                        |
| `org_standard_employee`     | Learner home under organization context     | Standard organization-authorized learning only.                                                                                                    | No organization-context `AI训练`; no `企业训练`; direct advanced routes fail safely.                                                        |
| `org_advanced_employee`     | Learner home under organization context     | `AI训练` and assigned `企业训练` are discoverable when valid advanced `org_auth` covers the employee context.                                      | No global admin surfaces; organization AI output visibility remains employee-owned by default.                                              |
| `org_standard_admin`        | Organization backend                        | Organization-scoped employees, authorization/status summaries, support/contact guidance.                                                           | No `企业训练`, `AI出题`, `AI组卷`, system operations, content authoring, Provider, or cost surfaces.                                        |
| `org_advanced_admin`        | Organization backend                        | Organization-scoped employees, authorization/status, `企业训练`, summary analytics, organization `AI出题`, and `AI组卷`.                           | No global `redeem_code`, global `org_auth`, system audit, content authoring, raw employee answers, raw AI output, or Provider config.       |
| `content_admin`             | Content backend                             | Formal `question`, `material`, `paper`, knowledge nodes, resource/knowledge-base management, and content `AI出题` / `AI组卷` draft/review entries. | No global users, organizations, `redeem_code`, `org_auth`, Provider/cost governance, or system operations.                                  |
| `ops_admin`                 | Operations backend                          | Users, organizations, employees, `redeem_code`, `org_auth`, redacted logs, contact/support configuration, and safe AI/model summaries.             | No formal content authoring, no content AI draft creation, no main resource-management ownership, no organization-owned content management. |
| `super_admin`               | Operations/content backend as policy allows | Backend user and role management plus AI model configuration where allowed.                                                                        | Super admin does not bypass redaction, public-id routing, service authorization, or context selection.                                      |

## Workspace Design Baseline

| Workspace             | Core surfaces                                                                                                                                                                           | State requirements                                                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Learner               | Home, authorization context selector, `practice`, `mock_exam`, report, `mistake_book`, `AI训练`, `企业训练`, profile, redeem.                                                           | Loading, empty, error, authorization expired, standard unavailable, quota blocked, retry, and offline/save-failed states.                                                               |
| Operations            | User/admin account management, organization tree, employee management, `redeem_code`, `org_auth`, quota summaries, `audit_log`, `ai_call_log`, model summaries, contact/support config. | Dense list/detail, redacted detail, conflict warnings, destructive confirmation, import preview, batch result summary, and permission denied.                                           |
| Content               | `question`, `material`, `paper`, `paper_section`, `paper_asset`, knowledge tree, resources/knowledge base, content AI draft/review.                                                     | Draft/publish/unpublish states, resource upload/review/publish/rebuild states, lock reasons, validation errors, empty lists, AI draft pending/failed/ready, adopt/reject confirmations. |
| Organization standard | Portal, employees, authorization/status, support guidance.                                                                                                                              | Useful standard dashboard without advanced controls, standard-unavailable direct route state, scoped permission denied.                                                                 |
| Organization advanced | Portal, employees, training, analytics, organization AI generation, authorization/status.                                                                                               | Training draft/published/takedown/version states, analytics empty/error/privacy states, AI task history/failed/insufficient/quota blocked states.                                       |

## Authorization And Organization Baseline

Current stable decisions:

- `effectiveEdition` is service-computed and never written back to overwrite source `edition`.
- Personal `edition_upgrade` is a `redeem_code` kind.
- Organization upgrade is platform operations controlled through `auth_upgrade.source_type = ops_manual`.
- A commercial enterprise package may cover multiple `profession + level` combinations, but eligibility and audit must
  decompose into atomic scopes.
- One atomic organization scope is organization coverage plus one `profession`, one `level`, one `subject`, one
  `edition`, one time window, and one quota rule.
- Existing `org_auth` rows without `subject` are interpreted as covering both `theory` and `skill` until an approved
  subject-scoped contract and schema path exists.
- Employee import binds employees to `organization` only. `profession`, `level`, `edition`, and
  `orgAuthScopePublicId` are computed outputs, not import template fields.
- Organization tree maintenance is platform operations owned unless a later requirement delegates mutation rights.

## AI Generation Baseline

Current baseline:

- `personal_advanced_student` and `org_advanced_employee` use learner `AI训练` with `AI出题` and `AI组卷`.
- `org_advanced_admin` uses organization backend `AI出题` and `AI组卷`.
- `content_admin` uses content backend `AI出题` and `AI组卷` for isolated draft/review content.
- Standard learners, `org_standard_employee`, and `org_standard_admin` remain hidden, denied, upgrade-guided, or
  unavailable for advanced AI generation.
- The first 20 AI generation issue classes are closed or superseded by the 2026-07-02 baseline. Do not reopen them
  without fresh current-baseline failure evidence.

Post-generation design baseline:

| Surface         | Output owner                                        | Allowed next action baseline                                                                                                                  | Forbidden shortcut                                                                                    |
| --------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Learner AI      | Owning user or employee under selected auth context | View generated learning content, retry failed task, regenerate within quota, keep personal/employee domain.                                   | Direct formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write.   |
| Organization AI | Owning `organization`                               | Eligible `org_advanced_admin` reviews organization-owned output and may use it for organization-managed training after explicit confirmation. | Direct platform formal content adoption or raw employee learner AI inspection.                        |
| Content AI      | Platform content review domain                      | Content admin reviews, edits, rejects, or adopts into editable formal drafts with attribution and `audit_log`.                                | Direct publish, direct formal write, bypassing validation, duplicate checks, or reviewer attribution. |

## Gap And Decision Register

| Id          | Area                                    | Current source reading                                                                                                                                                                         | Gap                                                                                                                                                                                   | Suggested decision                                                                                                                                                                                                                                                                                    |
| ----------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UX-REQ-01` | Multi-scope `org_auth`                  | Product direction is atomic child scopes under `org_auth`; current implementation is single `profession` and single `level`.                                                                   | Schema/API/UI design for atomic scope rows is not approved.                                                                                                                           | Create a docs-only contract package that fixes `org_auth_scope` fields, list/detail DTOs, conflict rules, quota attribution, backward compatibility, and public-id routing before schema work.                                                                                                        |
| `UX-REQ-02` | `org_auth` bundle UI                    | Sources require bundle summary, expanded atomic rows, quota/expiry/cancellation differences, and conflict warnings.                                                                            | Exact create/edit/detail flow is not specified.                                                                                                                                       | Current discussion pins a 4-step operations flow: package metadata, atomic scope selection/expansion, conflict/quota review, and final confirmation.                                                                                                                                                  |
| `UX-REQ-03` | `redeem_code` detail and reveal         | 2026-07-02 decision confirms three personal `redeem_code` kinds and permits `ops_admin` / `super_admin` to view/copy plaintext in generation distribution, ordinary list, and detail surfaces. | Product decision is now pinned; implementation remains incomplete because generation/redemption/runtime UI are not fully wired to all three kinds and plaintext list/detail behavior. | Implement only after a scoped source task: explicit `redeem_code_type` generation, standard/advanced/upgrade redemption semantics, eligible-role plaintext list/detail/copy, and redacted audit/evidence.                                                                                             |
| `UX-REQ-04` | Organization tree and employee accounts | Operations owns organization tree; organization admins view scoped employees/status.                                                                                                           | Organization admin read-only boundary needs UI/source proof so old "manage employees" wording is not implemented as write authority.                                                  | First release: organization admins view scoped roster/status only; tree mutation remains platform-owned. `ops_admin` can create/edit/disable/enable nodes; node move is `super_admin` only.                                                                                                           |
| `UX-REQ-05` | Employee import                         | Template fields and inheritance rules are defined.                                                                                                                                             | Preview UX for inherited scopes, quota blocked rows, optional generated password distribution, and row-level remediation needs design.                                                | Use import preview with row status, inherited scope summary, quota impact, blocked reason, and one-time password distribution window; submit only accepted rows.                                                                                                                                      |
| `UX-REQ-06` | Organization training creation          | Advanced admin can create training; output is separate from formal `paper`.                                                                                                                    | Creation wizard, source selection, assignment, versioning, takedown, and employee retake policy were under-specified.                                                                 | Current discussion pins a 4-step wizard: choose source, configure training, set publish scope/answer settings, preview/publish. Sources are platform paper snapshot, organization AI result, and manual grouping; `mock_exam` is not a source.                                                        |
| `UX-REQ-07` | Organization analytics                  | Summary-only counts, completion, scores, and timing are required; export/raw views are out.                                                                                                    | Metric granularity by training, employee, organization node, time range, weak-point summary, and small sample warning needed confirmation.                                            | First release metrics: organization overview, training detail, employee summary, default 30-day window with 7/30/90/custom filters, knowledge weak-point summaries, small-sample warning, no export, and no enterprise AI quota consumption summary.                                                  |
| `UX-REQ-08` | Backend user/admin management           | Super admin maintains backend users; ops/content/org roles are separated.                                                                                                                      | Exact system-admin UI for backend accounts, role assignment, lockout, and workspace switcher is not fully specified.                                                                  | Create a system admin/backend account design addendum: user list, role assignment, status, reset password, audit, and multi-role workspace switching.                                                                                                                                                 |
| `UX-REQ-09` | AI generation post-actions              | Generation count/contract baseline is closed; output domains are defined.                                                                                                                      | Per-surface history, retry, accept/reject/adopt, edit, version, delete/takedown, and quota-blocked states need UX detail.                                                             | Split into content AI adoption design, organization AI/training use design, and learner AI history/retry design; keep Provider and formal adoption gates separate.                                                                                                                                    |
| `UX-REQ-10` | AI interface and Prompt governance      | `model_config` is super-admin managed; Prompt templates are service-side files in standard MVP.                                                                                                | Editable `prompt_template` admin UI is not currently approved, model connection testing needed explicit scope, and super-admin full-text prompt visibility needed a product decision. | First release: super admin manages `model_provider`/`model_config` and gets a minimal redacted connection test; Prompt templates are a read-only registry. `super_admin` can view full registered prompt text; ops sees metadata only. Editable Prompt UI requires separate security/design approval. |
| `UX-REQ-11` | `ai_call_log` detail                    | Standard admin ops mentions input/output summary; advanced governance forbids prompt, Provider payload, and raw output exposure.                                                               | "完整输入输出摘要" can be misread as raw content access.                                                                                                                              | Interpret all AI log detail as redacted summaries only. Raw prompt/Provider/raw output viewers stay out of scope pending explicit approval.                                                                                                                                                           |
| `UX-REQ-12` | Learner auth context and quota owner    | System must not auto-switch context to obtain higher `effectiveEdition` or quota.                                                                                                              | Exact learner context selector and organization quota consumption confirmation are not designed.                                                                                      | Show active context on learner AI/training entry; require explicit organization context selection before consuming organization quota when both personal and organization contexts exist.                                                                                                             |
| `UX-REQ-13` | Content admin AI adoption               | Two-step adoption is required.                                                                                                                                                                 | Duplicate detection, source attribution, reviewer attribution, draft edit mapping, and publish validation handoff need detailed UX/API contract.                                      | Create content AI draft/review adoption contract before any source work; adoption creates editable formal drafts only, never published content.                                                                                                                                                       |
| `UX-REQ-14` | Content resource management             | Standard MVP originally placed resources/Markdown knowledge base in operations; content workspace already needs resource context for content/RAG maintenance.                                  | Ownership and non-technical resource workflow needed decision.                                                                                                                        | Resource management moves to content workspace. Use guided upload, parse/review, publish, and rebuild states with business wording; ops main resource entry should be removed, redirected, or explicitly read-only in later source work.                                                              |
| `UX-REQ-15` | Learner login/register/redeem/profile   | Standard user-auth exists and self password recovery is excluded.                                                                                                                              | Registration session continuity, redeem preview/confirm, and profile block design needed explicit UX contract.                                                                        | Registration creates a learner session and routes to `/redeem-code`; forgot password is contact support only; redeem uses preview plus confirm; profile separates learning ranges, authorization source detail, and account/actions.                                                                  |
| `UX-REQ-16` | Learner practice/mock/report/mistake    | Student practice, `mock_exam`, reports, and `mistake_book` are standard MVP surfaces.                                                                                                          | Mock answer navigator, report detail depth, student pagination, and objective-only mistake-book boundary needed reconciliation.                                                       | Allow a collapsible mock navigator for current/answered/unanswered only; no in-exam answer/analysis feedback; reports include question review, scoring reasons, suggestions, and citations; student lists use fixed page size 20; mistake book objective-only.                                        |
| `UX-REQ-17` | Employee enterprise training answer UI  | Advanced employee `企业训练` exists but current surfaces are not yet a full learner-grade answer experience.                                                                                   | Employee-facing list, question-answer, submit, and result states need design.                                                                                                         | Employee training uses real question/material/option/text-answer UI with save draft and submit confirm; post-submit employee can see own answer, score, standard answer, analysis, and subjective scoring reasons; org admins still cannot see raw answers.                                           |
| `UX-REQ-18` | Organization training management detail | Four-step wizard and source model are confirmed.                                                                                                                                               | Source chooser, draft/published actions, detail timeline, takedown reason, and pagination/filter behavior need detailed interaction contract.                                         | `org_advanced_admin` starts from list + "新建企业训练"; source chooser is searchable/filterable; drafts edit/copy/discard with reason; published versions view/copy/takedown with reason; detail timeline stays redacted.                                                                             |
| `UX-REQ-19` | Organization analytics separation       | Organization analytics includes enterprise training and can also compute formal learning signals from organization authorization context.                                                      | Formal `practice`/`mock_exam` aggregate signals could be confused with enterprise-training metrics.                                                                                   | Show enterprise-training analytics and formal learning aggregate signals in separate labeled sections; weak-point summaries are aggregate and privacy-preserving; no organization-admin enterprise AI quota summary.                                                                                  |
| `UX-REQ-20` | Organization tree operations UX         | Organization tree ownership is platform-controlled.                                                                                                                                            | Non-technical explanation of hierarchy, inherited access, quota impact, disabled nodes, and move restrictions is still needed.                                                        | Treat organization tree as its own UX contract: ops can create/edit/disable/enable, super admin moves nodes, organization admins see scoped read-only inherited access without parent/sibling/global leakage.                                                                                         |
| `UX-REQ-21` | Operations pending workbench            | Operations guided flows are confirmed.                                                                                                                                                         | Operators need a work queue for expiring authorization, quota risk, and unresolved overlap blockers without automatic resolution.                                                     | Add pending-work cards that route to detail/wizards; do not auto-renew, auto-upgrade, auto-merge, or auto-resolve.                                                                                                                                                                                    |

## Adversarial Recheck Addendum

The post-package recheck found fifteen details that must be treated as fixed inputs for later UI/UX contracts:

- `redeem_code` plaintext has a narrow eligible-operations UI exception despite older ADR-007 blanket wording; evidence,
  logs, screenshots, exports, audit payloads, and non-eligible views remain redacted.
- Resource management is a content-workspace flow; old system/operations resource write entries must be removed,
  redirected, or explicitly downgraded to later-approved read-only support.
- User-management UX must distinguish no-auth personal users, standard users, advanced users, employees, disabled users,
  and backend admins, with `super_admin` owning backend role/account management.
- Organization analytics must separate enterprise-training analytics from formal `practice` / `mock_exam` aggregate
  signals.
- Organization AI result-to-training draft design must preserve all 12 handoff details recorded in `CT-REQ-048`.
- `ai_call_log` detail design may show redacted summaries only; raw Prompt, Provider payload, raw AI IO, full content,
  and raw employee answers stay out of UI/API surfaces.
- First release includes bounded organization-admin workspaces; platform operations still owns organization tree
  mutation, employee import/mutation, and `org_auth` configuration.
- Employee create/import UX must start from explicit target-node selection, keep authorization fields out of the import
  template, and provide a one-time initial-password distribution window when the system generates passwords.
- Card redemption/list UX must include the three `redeem_code_type` redemption semantics, upgrade target selection when
  ambiguous, eligible-role plaintext viewing, pagination, and redacted audit/evidence boundaries.
- Organization AI UX must let eligible `org_advanced_admin` users review their own generated output for training-draft
  copy,
  while still blocking raw Prompt, Provider payload, raw AI IO, global logs, and out-of-scope task payloads.
- Organization-admin employee surfaces are read-only status/roster surfaces in the first release; employee writes remain
  platform-owned.
- Generic "organization admin" labels are not enough for advanced-only surfaces; UI/UX contracts must explicitly name
  `org_standard_admin` denied/unavailable states and `org_advanced_admin` allowed states.
- Current organization admin workspaces are in scope, while enterprise self-service delegation remains future work; phone
  reuse is blocked across admin and learner/employee account domains, not inside learner-to-employee binding.
- Older role matrices must not preserve resource write ownership under operations; content workspace owns resource
  writes, and operations read-only support needs a later explicit task.
- Older source indexes, capability matrices, and requirement fulfillment rows must be read through the current exception
  and ownership rows: eligible plaintext UI is allowed only for `ops_admin` / `super_admin`, resource writes belong to
  content, and advanced-only organization capabilities require `org_advanced_admin`.
- Fourth-pass residual cleanup also normalizes active use-case/capability/acceptance catalogs: generic `org_admin`
  rows must be resolved to `org_standard_admin` versus `org_advanced_admin`, employee import actors are first-release
  `ops_admin` / `super_admin`, broad phone uniqueness means account-domain uniqueness, and organization analytics must
  not reintroduce enterprise AI quota consumption summaries.
- Closure recheck additionally normalizes vector rebuild wording: content-resource rebuild actions belong to the content
  workspace for `content_admin` / `super_admin`, not the operations workspace.

## Resolved Or Superseded Items

| Item                                                                             | Current reading                                                                                                                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Standard base AI generation non-goal versus advanced/content AI generation scope | Resolved by source order: standard-only MVP still excludes AI generation; unified standard/advanced scope includes approved advanced/content entries.        |
| Old content-admin AI blocked wording                                             | Superseded by 2026-06-23 scope clarification and 2026-07-02 AI baseline.                                                                                     |
| Old AI组卷 count or AI出题 residuals                                             | Closed or superseded by 2026-07-02 acceptance baseline normalization and goal-completion audit.                                                              |
| Role matrix release-blocked rows versus AI generation closure                    | Resolved by scope: AI generation bounded goal is closed; role-separated runtime/final Pass remains unclaimed.                                                |
| OCR evidence versus product OCR feature                                          | Product OCR remains a non-goal; local preprocessing evidence does not create an app OCR requirement.                                                         |
| Current `org_auth_scope` wording versus implemented table reality                | Product direction is atomic scopes; schema/runtime remains a future decision, not a current source bug in this docs-only task.                               |
| `redeem_code` plaintext reveal policy                                            | Resolved by 2026-07-02 decision: eligible operations roles may view/copy plaintext in distribution, list, and detail UI; evidence/logs/docs remain redacted. |

## Recommended Next Design Tasks

1. `ops-authorization-governance-ux-contract-2026-07-02`: `organization`, `employee`, `redeem_code`, `org_auth`,
   upgrade, multi-scope, quota, and audit UX contract.
2. `organization-training-analytics-ai-ux-contract-2026-07-02`: organization standard/advanced admin, employee
   `企业训练`, analytics, and organization AI generation post-actions.
3. `content-ai-draft-adoption-ux-contract-2026-07-02`: content AI draft/review/adoption flow into formal draft
   `question` and `paper`.
4. `learner-ai-context-ux-contract-2026-07-02`: learner `AI训练`, auth context selection, quota owner confirmation,
   history, retry, and standard-unavailable states.
5. `admin-model-prompt-log-governance-ux-contract-2026-07-02`: model provider/config, read-only Prompt version registry,
   redacted `ai_call_log`, and audit summary design.
6. `content-resource-management-ux-contract-2026-07-02`: content-owned resource upload, review, publish, rebuild, and
   non-technical RAG/resource wording.
7. `learner-core-experience-ux-contract-2026-07-02`: login/register/redeem/profile plus practice, `mock_exam`, report,
   and `mistake_book` interaction details.
8. `system-admin-user-management-ux-contract-2026-07-02`: backend account, learner/no-auth/standard/advanced user,
   employee, and admin-role management surfaces.
9. `organization-tree-and-ops-workbench-ux-contract-2026-07-02`: organization tree inherited access plus operations
   pending-work routing.

Each follow-up remains docs-only unless a later task explicitly approves source, tests, schema, runtime, Provider,
browser, DB, dependency, deploy, or Cost Calibration work.

## Explicit Non-Claims

- No release readiness.
- No final Pass.
- No production usability.
- No role-separated runtime Pass.
- No Provider readiness.
- No Cost Calibration.
- No staging/prod/cloud deployment.
- No schema or migration approval.
- No permission to record credentials, env values, raw DB rows, Provider payloads, prompts, AI raw output, plaintext
  `redeem_code`, employee subjective answers, or full question/paper/material content.
