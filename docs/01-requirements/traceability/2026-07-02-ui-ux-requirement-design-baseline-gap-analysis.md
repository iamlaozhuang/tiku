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
6. Logs, evidence, and ordinary admin views are summary surfaces. They must not expose credentials, plaintext
   `redeem_code`, raw prompts, Provider payloads, raw AI output, raw employee answers, full question/paper/material
   content, internal numeric ids, or raw DB rows.
7. Learner UI is mobile-first. Backend UI is desktop-first, dense, stateful, and task-oriented.

## Role Flow Baseline

| Actor                       | Primary entry                               | Required allowed behavior                                                                                                                | Required denied or unavailable behavior                                                                                               |
| --------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Learner home                                | Standard authorized learning, `practice`, `mock_exam`, `exam_report`, `mistake_book`, `redeem_code` and expiry guidance.                 | No advanced `AI训练`; direct advanced AI route is denied or upgrade-guided.                                                           |
| `personal_advanced_student` | Learner home with `AI训练`                  | `AI训练` exposes `AI出题` and `AI组卷` under personal authorization context.                                                             | Generated output cannot write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.                  |
| `org_standard_employee`     | Learner home under organization context     | Standard organization-authorized learning only.                                                                                          | No organization-context `AI训练`; no `企业训练`; direct advanced routes fail safely.                                                  |
| `org_advanced_employee`     | Learner home under organization context     | `AI训练` and assigned `企业训练` are discoverable when valid advanced `org_auth` covers the employee context.                            | No global admin surfaces; organization AI output visibility remains employee-owned by default.                                        |
| `org_standard_admin`        | Organization backend                        | Organization-scoped employees, authorization/status summaries, support/contact guidance.                                                 | No `企业训练`, `AI出题`, `AI组卷`, system operations, content authoring, Provider, or cost surfaces.                                  |
| `org_advanced_admin`        | Organization backend                        | Organization-scoped employees, authorization/status, `企业训练`, summary analytics, organization `AI出题`, and `AI组卷`.                 | No global `redeem_code`, global `org_auth`, system audit, content authoring, raw employee answers, raw AI output, or Provider config. |
| `content_admin`             | Content backend                             | Formal `question`, `material`, `paper`, knowledge nodes, content `AI出题` and `AI组卷` draft/review entries.                             | No global users, organizations, `redeem_code`, `org_auth`, Provider/cost governance, or system operations.                            |
| `ops_admin`                 | Operations backend                          | Users, organizations, employees, `redeem_code`, `org_auth`, resources, knowledge base, redacted logs, safe AI/model governance surfaces. | No formal content authoring, no content AI draft creation, no organization-owned content management.                                  |
| `super_admin`               | Operations/content backend as policy allows | Backend user and role management plus AI model configuration where allowed.                                                              | Super admin does not bypass redaction, public-id routing, service authorization, or context selection.                                |

## Workspace Design Baseline

| Workspace             | Core surfaces                                                                                                                                                                           | State requirements                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Learner               | Home, authorization context selector, `practice`, `mock_exam`, report, `mistake_book`, `AI训练`, `企业训练`, profile, redeem.                                                           | Loading, empty, error, authorization expired, standard unavailable, quota blocked, retry, and offline/save-failed states.                         |
| Operations            | User/admin account management, organization tree, employee management, `redeem_code`, `org_auth`, quota summaries, resources, knowledge base, `audit_log`, `ai_call_log`, model config. | Dense list/detail, redacted detail, conflict warnings, destructive confirmation, import preview, batch result summary, and permission denied.     |
| Content               | `question`, `material`, `paper`, `paper_section`, `paper_asset`, knowledge tree, content AI draft/review.                                                                               | Draft/publish/unpublish states, lock reasons, validation errors, empty lists, AI draft pending/failed/ready, adopt/reject confirmations.          |
| Organization standard | Portal, employees, authorization/status, support guidance.                                                                                                                              | Useful standard dashboard without advanced controls, standard-unavailable direct route state, scoped permission denied.                           |
| Organization advanced | Portal, employees, training, analytics, organization AI generation, authorization/status.                                                                                               | Training draft/published/takedown/version states, analytics empty/error/privacy states, AI task history/failed/insufficient/quota blocked states. |

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

| Surface         | Output owner                                        | Allowed next action baseline                                                                                                    | Forbidden shortcut                                                                                    |
| --------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Learner AI      | Owning user or employee under selected auth context | View generated learning content, retry failed task, regenerate within quota, keep personal/employee domain.                     | Direct formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write.   |
| Organization AI | Owning `organization`                               | Organization admin reviews organization-owned output, may use it for organization-managed training after explicit confirmation. | Direct platform formal content adoption or raw employee learner AI inspection.                        |
| Content AI      | Platform content review domain                      | Content admin reviews, edits, rejects, or adopts into editable formal drafts with attribution and `audit_log`.                  | Direct publish, direct formal write, bypassing validation, duplicate checks, or reviewer attribution. |

## Gap And Decision Register

| Id          | Area                                    | Current source reading                                                                                                           | Gap                                                                                                                                              | Suggested decision                                                                                                                                                                                 |
| ----------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UX-REQ-01` | Multi-scope `org_auth`                  | Product direction is atomic child scopes under `org_auth`; current implementation is single `profession` and single `level`.     | Schema/API/UI design for atomic scope rows is not approved.                                                                                      | Create a docs-only contract package that fixes `org_auth_scope` fields, list/detail DTOs, conflict rules, quota attribution, backward compatibility, and public-id routing before schema work.     |
| `UX-REQ-02` | `org_auth` bundle UI                    | Sources require bundle summary, expanded atomic rows, quota/expiry/cancellation differences, and conflict warnings.              | Exact create/edit/detail flow is not specified.                                                                                                  | Design a 3-step operations flow: package metadata, atomic scope expansion, conflict/quota review before submit.                                                                                    |
| `UX-REQ-03` | `redeem_code` detail and reveal         | Plaintext values are forbidden in ordinary views/evidence; controlled distribution workflow is allowed but not designed.         | Reveal/copy permissions, masking, one-time reveal, and audit wording are undefined.                                                              | Keep list/detail masked by default; require a separate governed reveal/copy design with permission, reason, expiry, and redacted audit before implementation.                                      |
| `UX-REQ-04` | Organization tree and employee accounts | Operations owns organization tree; organization admins manage scoped employees.                                                  | Whether organization admins can edit organization metadata or subtree is ambiguous.                                                              | First release: organization admins may manage scoped employees and view org status only; tree mutation remains `ops_admin` only. Delegate editing only via later approval.                         |
| `UX-REQ-05` | Employee import                         | Template fields and inheritance rules are defined.                                                                               | Preview UX for inherited scopes, quota blocked rows, partial failures, and row-level remediation needs design.                                   | Use import preview with row status, inherited scope summary, quota impact, and blocked reason; submit only accepted rows.                                                                          |
| `UX-REQ-06` | Organization training creation          | Advanced admin can create training; output is separate from formal `paper`.                                                      | Creation wizard, source selection, assignment, versioning, takedown, and employee retake policy are under-specified.                             | Design first-release flow as draft -> assign/publish version -> employee answers once -> copy new version for changes -> takedown stops new answers.                                               |
| `UX-REQ-07` | Organization analytics                  | Summary-only counts, completion, scores, and timing are required; export/raw views are out.                                      | Metric granularity by training, employee, organization node, time range, and quota is not pinned.                                                | First release metrics: training count, assigned/started/completed, average score, time summary, quota usage summary by organization scope; no export or raw answer view.                           |
| `UX-REQ-08` | Backend user/admin management           | Super admin maintains backend users; ops/content/org roles are separated.                                                        | Exact system-admin UI for backend accounts, role assignment, lockout, and workspace switcher is not fully specified.                             | Create a system admin/backend account design addendum: user list, role assignment, status, reset password, audit, and multi-role workspace switching.                                              |
| `UX-REQ-09` | AI generation post-actions              | Generation count/contract baseline is closed; output domains are defined.                                                        | Per-surface history, retry, accept/reject/adopt, edit, version, delete/takedown, and quota-blocked states need UX detail.                        | Split into content AI adoption design, organization AI/training use design, and learner AI history/retry design; keep Provider and formal adoption gates separate.                                 |
| `UX-REQ-10` | AI interface and Prompt governance      | `model_config` is super-admin managed; Prompt templates are service-side files in standard MVP.                                  | Editable `prompt_template` admin UI is not currently approved, but user-facing design need is emerging.                                          | First release: super admin can manage `model_provider`/`model_config`; Prompt templates are read-only version registry if surfaced. Editable Prompt UI requires separate security/design approval. |
| `UX-REQ-11` | `ai_call_log` detail                    | Standard admin ops mentions input/output summary; advanced governance forbids prompt, Provider payload, and raw output exposure. | "完整输入输出摘要" can be misread as raw content access.                                                                                         | Interpret all AI log detail as redacted summaries only. Raw prompt/Provider/raw output viewers stay out of scope pending explicit approval.                                                        |
| `UX-REQ-12` | Learner auth context and quota owner    | System must not auto-switch context to obtain higher `effectiveEdition` or quota.                                                | Exact learner context selector and organization quota consumption confirmation are not designed.                                                 | Show active context on learner AI/training entry; require explicit organization context selection before consuming organization quota when both personal and organization contexts exist.          |
| `UX-REQ-13` | Content admin AI adoption               | Two-step adoption is required.                                                                                                   | Duplicate detection, source attribution, reviewer attribution, draft edit mapping, and publish validation handoff need detailed UX/API contract. | Create content AI draft/review adoption contract before any source work; adoption creates editable formal drafts only, never published content.                                                    |

## Resolved Or Superseded Items

| Item                                                                             | Current reading                                                                                                                                       |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard base AI generation non-goal versus advanced/content AI generation scope | Resolved by source order: standard-only MVP still excludes AI generation; unified standard/advanced scope includes approved advanced/content entries. |
| Old content-admin AI blocked wording                                             | Superseded by 2026-06-23 scope clarification and 2026-07-02 AI baseline.                                                                              |
| Old AI组卷 count or AI出题 residuals                                             | Closed or superseded by 2026-07-02 acceptance baseline normalization and goal-completion audit.                                                       |
| Role matrix release-blocked rows versus AI generation closure                    | Resolved by scope: AI generation bounded goal is closed; role-separated runtime/final Pass remains unclaimed.                                         |
| OCR evidence versus product OCR feature                                          | Product OCR remains a non-goal; local preprocessing evidence does not create an app OCR requirement.                                                  |
| Current `org_auth_scope` wording versus implemented table reality                | Product direction is atomic scopes; schema/runtime remains a future decision, not a current source bug in this docs-only task.                        |

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
