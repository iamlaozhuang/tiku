# 2026-07-02 Role Auth Training Ops Decision Package

## Status

This is a docs-only requirement decision package for the current discussion round.

It records confirmed product decisions, existing-source readings, and implementation gaps. It does not approve product
source changes, tests, schema, migration, database access, Provider execution, env/secret access, browser/runtime
validation, staging/prod deployment, payment, external-service work, Cost Calibration, release readiness, final Pass, or
production usability claims.

## Source Order

Required sources read or rechecked for this package:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- relevant standard and advanced modules, stories, and 2026-07-02 traceability baselines.

Read-only source inspection was used only to classify implementation gaps. Product source was not changed.

## Reconciliation Anchor

For context-bloat recovery and duplicate-work prevention, use
`docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md` after this package.

That ledger maps each current-thread discussion item to a `CT-REQ-*` row, separates original requirement posture from
current-thread delta, records implementation status without claiming runtime acceptance, and identifies UI/UX contract
work that must precede product source implementation.

## Processing Rule

Each discussed item is classified before becoming follow-up work:

| Class | Meaning                                                                                  | Action                                                                                            |
| ----- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `A`   | Requirement is already explicit and implementation is already sufficiently represented.  | Do not reopen or duplicate work; reference the existing requirement/source path.                  |
| `B`   | Requirement is explicit, but implementation or UI is incomplete.                         | Record as implementation gap for a later scoped source task.                                      |
| `C`   | Requirement was missing, conflicting, or role boundary was unclear before this decision. | Record the confirmed decision in this package and update stable requirement modules where needed. |

## Existing Decisions Not Reopened

- Standard-only MVP still excludes learner AI generation; advanced/content/organization AI generation is scoped by the
  advanced edition and 2026-07-02 AI baseline.
- `effectiveEdition` is service-computed and does not overwrite source `edition`.
- `org_auth` remains the authorization bundle/purchase record; atomic scope decomposition is the approved direction for
  multi-profession and multi-level authorization.
- Employee import binds employees to `organization`; `profession`, `level`, `edition`, and scope authorization are
  derived from active `org_auth`.
- AI generated content remains isolated from platform formal `question`, `paper`, `practice`, `mock_exam`,
  `exam_report`, and `mistake_book` until a governed adoption path applies.
- Lists in backend workspaces use pagination; first-release page-size options are `20`, `50`, and `100`.
- Learner-side lists use a simpler fixed page size of `20` with previous/next navigation unless a later learner UX
  decision changes it.

## Confirmed Decisions

### D01 Personal `redeem_code`

- Personal `redeem_code` first release must distinguish `personal_standard_activation`,
  `personal_advanced_activation`, and `edition_upgrade`.
- Generation must require an explicit `redeem_code_type`, `profession`, and `level`; no implicit default to standard
  activation is acceptable.
- `edition_upgrade` upgrades an active standard `personal_auth` for the same user and `profession + level` by creating
  `auth_upgrade`; it does not create another `personal_auth`.
- If the user already has effective advanced access for the same `profession + level`, an upgrade code must not be
  consumed.
- If multiple eligible standard personal authorizations match, the user or operator must explicitly choose the target
  authorization.
- Generated plaintext values are visible in the generation distribution window. After leaving the window,
  `ops_admin` and `super_admin` can still view/copy plaintext values from ordinary list and detail pages.
- Logs, evidence, screenshots, exports, committed documents, and non-distribution audit summaries must not include
  plaintext `redeem_code` values.

### D02 Enterprise Authorization Overlap Closure

- Active overlapping atomic organization authorization scopes are blocked by default.
- The system must not silently auto-merge overlapping scopes.
- Operators can proceed only through explicit closing actions:
  - renewal successor with non-overlapping validity;
  - manual standard-to-advanced upgrade through `auth_upgrade.source_type = ops_manual`;
  - transactional replacement that cancels or supersedes the old scope;
  - increase-only quota expansion for the same active scope.
- Each action must leave an auditable timeline so operations can complete authorization and the enterprise can continue
  using the purchased capability after closure.

### D03 Multi-Profession And Multi-Level Enterprise Package

- A commercial enterprise authorization package may cover multiple `profession + level` combinations.
- UI may present this as one package, but service checks, quota, expiry, cancellation, conflict detection, and audit must
  decompose it into atomic scopes.
- `auth_scope_type` describes organization coverage only and must not be reused for `profession`, `level`, `subject`, or
  `edition`.

### D04 Administrator And Employee Account Boundary

- Backend admin and organization admin accounts are separated from learner/employee accounts.
- The same phone number must not be reused between admin accounts and learner/employee accounts.
- Existing personal learner accounts can be bound as employees without overwriting password, personal history, or
  personal authorization.
- `org_standard_admin` employee operations remain platform `ops_admin` / `super_admin` owned in the first release.
- Organization admins see organization-scoped roster/status according to role, but first-release tree mutation and
  employee import remain platform-owned.

### D05 Employee Import, Password, Scope, And Transfer

- Employee import is platform `ops_admin` / `super_admin` owned in the first release.
- Import target organization node is explicitly selected by the operator.
- Import accepts `.xlsx` or equivalent tabular input. Required fields are phone and name. `initialPassword` is optional.
- If `initialPassword` is missing, the system generates a random initial password and shows it only in a one-time
  distribution window.
- Import fields must not include `profession`, `level`, `edition`, `orgAuthScopePublicId`, or employee-level
  authorization whitelist fields.
- Employees inherit active `org_auth` scopes that cover their organization node.
- Different employee visibility is solved first by organization-tree segmentation and node-level `org_auth`, not by
  employee-level authorization whitelists.
- Forgot-password handling is platform reset by `ops_admin` / `super_admin`: reset password, revoke active sessions, and
  provide a one-time distribution window. First release does not force first-login password change.
- Employee transfer to a target organization is blocked when the target authorization quota is insufficient.
- Transfer revokes active employee sessions. Submitted training remains attributed to the old organization snapshot.
  In-progress old-organization training cannot continue after transfer.

### D06 Organization Tree

- Organization tree mutation remains platform-owned.
- `ops_admin` can create, edit, disable, and enable organization nodes.
- Node move is restricted to `super_admin`.
- Organization admins do not mutate the tree in the first release.
- Upper-level coverage can be summarized to scoped organization admins, but parent/sibling/global details must not leak
  outside their allowed scope.

### D07 Organization Training

- UI label is `企业训练`; internal code/API may continue to use `organization_training`.
- First release uses a four-step creation wizard:
  1. choose source;
  2. configure training;
  3. set publish scope and answer settings;
  4. preview and publish.
- First-release sources are platform paper library copy snapshot, organization AI result, and organization-private manual
  grouping/manual questions.
- `mock_exam` is not an organization training source entry.
- Publish scope supports current organization node only or current plus descendant nodes.
- When importing a platform paper, organization admin can view full stem, options, `standard_answer`, and `analysis`, and
  edits only the copied snapshot. The source platform paper is not written back.
- Organization AI output can be copied into a training draft. Generated stem, options, `standard_answer`, and `analysis`
  are editable in the draft.
- `evidence_status = none` blocks publish. `evidence_status = weak` permits publish only after explicit confirmation.
- Copying organization AI output into training does not consume additional AI quota.
- Manual grouping first release supports `single_choice`, `multi_choice`, `true_false`, and `short_answer`.
- No complex standalone organization question bank is introduced in the first release.
- `short_answer` uses AI scoring by default. Manual grading is not part of the first release.
- Drafts can be discarded. Published versions are immutable; changes require copying to a new draft and publishing a new
  version. Takedown stops new/in-progress answers while preserving submitted read-only summaries.
- One employee can submit once per published version.
- `answerDeadlineAt` is optional. If it is `null`, employees can answer until takedown. Reminder/badge behavior is
  in-app only.
- Organization training is not formal `mock_exam`, does not create formal `exam_report`, and does not write formal
  `mistake_book`.

### D08 Organization Analytics

- First-release analytics levels are organization overview, training detail, and employee summary.
- Default date range is 30 days. Filters support 7 days, 30 days, 90 days, and custom range.
- No export in the first release.
- Small samples below 5 people show a warning.
- The system may show organization and employee knowledge weak-point summaries derived from training results, without
  exposing raw answers.
- Enterprise AI quota consumption summary is not shown to organization admins in the first release.

### D09 Organization Workspace Menus

- `org_standard_admin` sees overview, read-only employee roster/status where allowed, authorization/status, and
  support/contact guidance.
- `org_advanced_admin` additionally sees `企业训练`, organization analytics, and organization `AI出题` / `AI组卷`.
- Standard organization admin direct access to advanced routes returns denied/unavailable/upgrade-guided state, not a
  generic 404-only experience.
- Organization admins do not see global audit logs, global AI logs, model/provider configuration, Prompt governance,
  global `redeem_code`, global `org_auth`, system user management, or raw employee answers.

### D10 Operations Workspace

- Enterprise authorization creation uses a guided flow: package metadata, atomic scope selection/expansion,
  conflict/quota review, and final confirmation.
- Authorization detail must expose an auditable timeline for create, renewal, upgrade, replace, quota expansion, cancel,
  and audit events.
- `redeem_code` generation uses a guided flow: type, scope, duration, deadline, quantity, review, generate, and
  distribution.
- Card lists and other backend lists must support pagination with page-size options `20`, `50`, and `100`, and should
  preserve filters in URL query state.
- `super_admin` manages backend roles. `ops_admin` may create and maintain organization admin accounts only when that is
  explicitly scoped. Phone uniqueness is enforced across admin and learner/employee account domains, while learner
  accounts may still be bound as employees inside the learner/employee domain.

### D11 Content AI, Organization AI, Model, Prompt, And Logs

- Content AI results are drafts/review candidates only; they are not directly published.
- For content AI adoption, `evidence_status = none` blocks adoption. `evidence_status = weak` requires explicit
  confirmation.
- Content AI consumes platform quota, not enterprise quota.
- Organization AI cannot directly create formal platform question bank or paper-library records; it can be copied into an
  organization training draft.
- Prompt management is read-only registry in the first release. Editable Prompt UI requires a later security/design
  approval.
- `super_admin` manages `model_provider` and `model_config`. `ops_admin` receives summaries only.
- API keys show status and last four characters only, never plaintext.
- `model_config` must provide a super-admin-only connection test action. The health request must use minimal synthetic
  payload without user data, raw prompt, private content, full question, or paper material. It writes redacted
  `audit_log` and `ai_call_log` metadata with action `model_config_health_check`. Failure must not auto-disable the
  model.
- Global `audit_log` and `ai_call_log` remain `super_admin` / `ops_admin` surfaces only; content and organization
  workspaces see only object-level redacted summaries where approved.
- First release has no log export, delete, or archive action.
- Global contact configuration is maintained by `super_admin` / `ops_admin`. No online payment, pricing page, contract
  management, or payment links are introduced.

### D12 Content Resource Management

- Resource management for教材、讲义课件、Markdown/RAG resources moves to the content workspace as a content operation.
- First-release write authority is `content_admin` and `super_admin`; `ops_admin` does not own the main resource
  management entry.
- The operations resource entry should be removed from primary navigation, redirected, or reduced to explicitly scoped
  read-only support in a later source task.
- Resource UX must be understandable to non-technical users: upload, parse/review, publish, and vector rebuild should
  use business wording and clear state labels rather than exposing raw `chunk` / `embedding` concepts.

### D13 Learner Auth, Login, Redeem, And Profile

- Registration success must create a learner session and route to `/redeem-code`.
- Unified login routes by account role: backend admins to their workspace, organization admins to organization backend,
  and learners/employees to learner home.
- Learners without effective authorization land on a stable redeem page, not an unauthenticated bounce loop.
- Forgot-password guidance is contact operations/customer support only; first release has no learner self-service
  password reset.
- Redeem uses benefit preview plus explicit confirm. `edition_upgrade` requires target selection when more than one
  eligible standard authorization exists.
- Learner home shows authorization source/effective learning range; AI context selection shows source, edition,
  effective edition, scope, expiry, and quota owner.
- If both personal and organization advanced contexts exist, personal remains the default personal-learning context and
  organization quota is used only after explicit organization-context selection.
- Profile separates effective learning ranges, authorization source detail, and account/actions; no self phone/password
  edit is introduced.

### D14 Learner Practice, Mock, Report, And Mistake Book

- Practice and `mock_exam` preserve existing learning-flow rules, including resume and secondary confirmation for restart
  or destructive actions.
- Skill flows must group by material, `question_group`, and `paper_section` where those structures exist.
- `mock_exam` does not show answers, analysis, or correctness feedback during the exam, but it may show a collapsible
  answer navigator for current, answered, and unanswered status.
- Reports must show question review, scoring-point reasons, learning suggestion full text, and RAG citations when
  available.
- Student-side history and mistake-book lists use fixed page size `20` and previous/next navigation.
- First-release `mistake_book` remains objective-question only.

### D15 Employee Enterprise Training Experience

- `org_advanced_employee` uses the learner app entry for `企业训练`; `org_standard_employee` does not see it and direct
  route access fails safely.
- Employee training list cards show title, organization node, profession/level/subject, version, question count,
  deadline, status, and submitted score where available.
- Employee answering must use real question/material/option/text-answer UI, with save-draft and submit-confirm flows.
  Numeric-only answered-count or score-entry forms are not acceptable as the user-facing training answer experience.
- After submission, employees may see their own submitted answer, score, standard answer, analysis, and subjective
  scoring-point reasons. Organization admins still cannot see raw employee answers.
- Deadline, takedown, transfer, or invalid organization authorization blocks unsubmitted continuation and leaves submitted
  summaries read-only.

### D16 Organization Training Management Detail

- `org_advanced_admin` training management starts from a list and a primary "新建企业训练" action.
- The four-step wizard source chooser must be searchable/filterable and must not require raw public id entry.
- Platform paper import shows full stem, options, `standard_answer`, and `analysis`; edits apply only to the copied
  training snapshot.
- Drafts can be edited, copied, or discarded with reason. Published versions can be viewed, copied to a new draft, or
  taken down with reason.
- Detail pages show lifecycle timeline and redacted aggregate status, not raw employee answers.
- Training management lists use backend pagination and preserve filters in URL query where practical.

### D17 Organization Analytics Separation

- Organization analytics may show enterprise-training analytics and formal `practice` / `mock_exam` aggregate signals,
  but they must be separated into clearly labeled sections.
- Formal learning signals must not be mixed into enterprise-training completion/score metrics.
- Knowledge weak-point summaries are allowed as aggregate, privacy-preserving analysis.
- Enterprise AI quota consumption summary is not shown to organization admins.

### D18 System Admin, Prompt, And No-Repeat Process

- `super_admin` owns backend account and role management for `ops_admin`, `content_admin`, organization admins, and
  platform-level admin permissions.
- User management must distinguish registered-but-unauthorized personal users, standard users, advanced users,
  employees, disabled users, and backend admins.
- Prompt management remains read-only in first release. `super_admin` may view full prompt text for registered project
  prompt templates; `ops_admin` sees metadata only.
- Prompt full text remains forbidden in logs, evidence, screenshots, exports, and non-super-admin views.
- Future discussion packets must not ask the owner to reconfirm already locked decisions. They should cite the
  requirement source and `CT-REQ-*` row, then raise only actual conflicts, implementation gaps, or missing decisions.

## Adversarial Recheck Corrections

### D19 ADR-007 Plaintext Exception Supersession

- ADR-007 originally used blanket wording that could be read as forbidding any plaintext `redeem_code` exposure.
- The 2026-07-02 current decision supersedes that wording only for the eligible operations product UI:
  `ops_admin` and `super_admin` may view/copy plaintext in the generation distribution window and in ordinary
  operations list/detail pages.
- The old prohibition remains fully active for evidence, committed docs, logs, screenshots, exports,
  non-distribution audit summaries, non-eligible roles, and audit payload contents.

### D20 Operations Resource Entry Correction

- The owner described the old resource management entry as being under the system/admin backend; earlier docs also
  placed resource and Markdown/RAG management under operations.
- Current decision is that resource management belongs to the content workspace. `super_admin` may still access it
  through the content workspace, but the system operations main navigation must not remain the resource write entry.
- Operations resource upload, publish, enable/disable, and vector rebuild bullets are historical/migrated behavior unless
  a future scoped read-only support task explicitly authorizes an operations view.

### D21 User Management Detail Correction

- User management must visibly distinguish registered-but-unauthorized personal users, standard personal users,
  advanced personal users, organization employees, disabled users, and backend admins.
- Backend admin account management for `ops_admin`, `content_admin`, and organization admins belongs to `super_admin`.
  `ops_admin` may maintain organization admin accounts only when explicitly scoped.
- No physical deletion and no phone modification are introduced in the first release; reset uses generated one-time
  password distribution and session revocation where applicable.
- Admin account domains, including organization admins, are separate from learner/employee accounts and cannot reuse the
  same phone. This does not remove the existing learner-to-employee binding model inside the learner/employee account
  domain.

### D22 Organization Analytics Formal-Learning Correction

- Enterprise-training analytics and formal `practice` / `mock_exam` aggregate signals are both useful, but they must be
  separate sections.
- Formal learning signals must not be mixed into enterprise-training completion, score, deadline, or version metrics.
- Knowledge weak-point summaries may include formal learning aggregate signals only when privacy-preserving and scoped to
  the organization authorization context.

### D23 Organization AI To Training Draft Contract Detail

The confirmed organization AI handoff contract must preserve these details:

1. Entry is from an organization AI result, not from `mock_exam`.
2. Source result must belong to the same allowed `organization` scope.
3. Copying creates or updates an organization training draft, never formal platform `question` or `paper`.
4. Generated stem, options, `standard_answer`, and `analysis` are copied into the draft snapshot.
5. Copied fields are editable before publish.
6. Source attribution to the AI task/result remains visible in draft history.
7. `evidence_status = none` blocks publish.
8. `evidence_status = weak` requires explicit confirmation before publish.
9. Copying to a training draft does not consume additional enterprise AI quota.
10. Draft publish still goes through the four-step training wizard and preview.
11. Published versions remain immutable; later changes copy to a new draft/version.
12. Employee answering and analytics remain enterprise-training surfaces, not formal `mock_exam`, `exam_report`, or
    `mistake_book`.

### D24 AI Call Log Detail Redaction Correction

- Older admin requirements wording that mentioned complete input/output summaries is superseded by the current log
  governance boundary.
- `ai_call_log` detail may show redacted input/output summaries, status, duration, cost/quota metadata, object type,
  object id, model/provider metadata, and failure category.
- It must not show raw Prompt, Provider payload, raw AI input/output, full `question`/`paper`/`material` content, or raw
  employee answers. Object-level summaries and failure diagnostics follow the same redaction rule.

### D25 Organization Backend And Account-Domain Correction

- Older user-auth wording said the enterprise backend was not open in the first release. That is superseded by the
  confirmed role-separated organization workspaces.
- First release organization backend access is bounded: `org_standard_admin` gets scoped read-only organization,
  employee roster/status, and authorization/status views; `org_advanced_admin` additionally gets enterprise training,
  organization analytics, and organization AI.
- Platform operations still owns organization tree mutation, employee import/mutation, and `org_auth` configuration.
  Enterprise self-service for those operations remains future work.

### D26 Employee Create/Import Field Correction

- Employee single-create and batch-import flows both require operations to explicitly select the target `organization`
  node before creating or importing employees.
- Import rows contain phone and name, plus optional initial password. Single-create also accepts optional initial
  password. If omitted, the system generates a password and shows it only in a one-time distribution window.
- Import templates must not contain `profession`, `level`, `edition`, `orgAuthScopePublicId`, or employee-level
  authorization whitelist fields. Employee access is inherited from valid `org_auth` on the selected organization node.

### D27 Card Redemption Story Backfill

- User stories must carry the same personal `redeem_code_type` behavior as module requirements and ADR-007.
- `personal_standard_activation` creates or grants standard personal authorization; `personal_advanced_activation`
  creates or grants advanced personal authorization.
- `edition_upgrade` requires a matching valid standard personal authorization and explicit target selection if multiple
  matches exist. Plaintext list/detail access remains limited to `ops_admin` and `super_admin`.

### D28 Organization AI Generated-Output Visibility Correction

- Eligible `org_advanced_admin` users need organization-scoped AI task status/history and generated output visibility to
  review results and copy generated stem, options, `standard_answer`, and `analysis` into an organization training draft.
- This visibility is not permission to inspect raw Prompt, Provider payload, raw AI IO, global AI logs, out-of-scope raw
  task payloads, raw employee learner AI outputs, or unredacted evidence/audit content.

### D29 Organization-Admin Employee Write Wording Correction

- Older backend UX and role-separated docs used "manage employees" for organization admins. The current first-release
  decision narrows that wording to scoped employee roster/status and authorization/status visibility.
- Employee import, profile mutation, transfer, disable/unbind, password reset, and organization-tree mutation remain
  platform `ops_admin` / `super_admin` operations unless a later task explicitly delegates a write flow.

### D30 Generic Organization-Admin Advanced Capability Wording Correction

- Generic "organization admin" wording for enterprise training and organization AI must be read as eligible
  `org_advanced_admin` only unless a sentence explicitly discusses both standard and advanced roles.
- `org_standard_admin` remains denied, hidden, unavailable, or upgrade-guided for enterprise training and organization
  AI routes.

### D31 Future-Extension And Account-Domain Wording Cleanup

- Future extension wording should refer to enterprise self-service delegation, such as organization-tree maintenance,
  employee import/mutation, and authorization configuration, rather than implying all organization admin workspaces are
  future-only.
- Phone-domain wording should remain precise: admin and organization-admin accounts cannot reuse learner/employee
  account phones, while an existing learner account may still be bound as an employee inside the learner/employee account
  domain.

### D32 Older Role-Matrix Resource Ownership Cleanup

- Older role-experience and backend UX matrix rows that list resources under `ops_admin` are superseded by the current
  resource ownership decision.
- Resource write ownership belongs to the content workspace for `content_admin` and `super_admin`. Operations read-only
  support requires a later explicit task.

### D33 Second-Pass Residual Wording Cleanup

- Final validation found additional stale wording in advanced module/story text, source indexes, capability matrices, and
  requirement fulfillment rows. These are not new product decisions; they are clarifications under D30, D32, CT-REQ-044,
  and CT-REQ-057.
- Future work must not use old cleartext-prohibition rows to block the eligible operations product UI exception, old
  `ops_admin` resource rows to preserve resource write ownership, or generic "organization admin" wording to grant
  advanced-only capabilities to `org_standard_admin`.
- Requirement fulfillment rows for employee import must also follow the platform-owned employee write boundary:
  `ops_admin` / `super_admin` perform import, while organization admins view roster/status in the first release.

### D34 Closure Recheck Ops Resource Checklist Cleanup

- Historical owner-facing `ops_admin.resource_knowledge_and_logs` wording is superseded wherever it could imply active
  resource write ownership.
- `ops_admin` scope is accounts, organizations, employees, authorization, `redeem_code`, imports, and redacted
  log-summary governance.
- Resource/`knowledge_base` management, `knowledge_node` maintenance, Markdown publish, upload, and vector rebuild stay
  in the content workspace for `content_admin` / `super_admin`.

## Implementation Gap Register

| Id    | Source inspection summary                                                                                                                                         | Requirement impact                                                                                                                    | Later task direction                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `G01` | `redeem_code_type` enum exists in schema, but admin list/detail currently expose `canViewPlainText: false`.                                                       | Confirmed plaintext list/detail behavior for eligible operators is not implemented.                                                   | Scoped `redeem_code` UI/API/service task.                                                             |
| `G02` | Redemption and generation runtime are not fully proven for all three personal `redeem_code_type` values.                                                          | Standard activation, advanced activation, and upgrade behavior needs focused implementation validation.                               | Scoped personal authorization and redemption task.                                                    |
| `G03` | Current employee import UI/source references `initialPassword`; optional random one-time generation is gap.                                                       | Confirmed import fields and one-time password window need implementation.                                                             | Scoped employee import/password task.                                                                 |
| `G04` | Employee transfer UI still displays `approval_required` wording in inspected source.                                                                              | Confirmed transfer should block on insufficient target quota and close with explicit transaction/session UX.                          | Scoped employee transfer source task.                                                                 |
| `G05` | Organization training surfaces exist, but four-step wizard, source copy rules, deadline/reminder policy, and discard/takedown semantics need alignment.           | Confirmed training workflow is broader than current generic surface.                                                                  | Organization training UX/source task after design.                                                    |
| `G06` | Organization analytics summary exists, but knowledge weak-point summaries and no-enterprise-AI-quota-summary rule need alignment.                                 | Confirmed analytics scope differs from current summary fields.                                                                        | Organization analytics source task after design.                                                      |
| `G07` | Organization AI generation route/surface exists, but copy-to-training-draft flow is not fully specified in source.                                                | Confirmed organization AI follow-up action is training draft creation, not formal platform adoption.                                  | Organization AI to training draft contract task.                                                      |
| `G08` | Model configuration management exists, but no confirmed connection-test action was found.                                                                         | Confirmed `model_config_health_check` action needs design/source implementation.                                                      | Super-admin model config health-check task.                                                           |
| `G09` | Atomic multi-scope `org_auth` remains a product direction and not a fully implemented scope table contract.                                                       | Multi-profession/multi-level package needs schema/API/UI contract before source changes.                                              | Docs-only atomic scope contract before implementation.                                                |
| `G10` | Organization admin role boundaries are partially represented, but first-release read/write split must be proven in runtime.                                       | `org_standard_admin` employee operations remain platform-owned; org admins need scoped read-only/status UX.                           | Role/workspace runtime validation and targeted source task.                                           |
| `G11` | Resource management has both operations and content-adjacent surfaces in current source.                                                                          | Confirmed ownership moves to content workspace and ops main resource entry should not remain the primary path.                        | Content resource IA/source task after UX contract.                                                    |
| `G12` | Registration route creates the user but the inspected service does not set a login session.                                                                       | Confirmed registration success must leave the learner authenticated and route to `/redeem-code`.                                      | Scoped registration/session/redeem task.                                                              |
| `G13` | Learner AI authorization context selection and quota-owner confirmation are not fully represented in inspected learner surfaces.                                  | Confirmed AI quota owner must be explicit before organization quota use.                                                              | Learner AI context source task after UX contract.                                                     |
| `G14` | Employee training UI still exposes numeric answer/score-oriented fields and old `组织培训` wording in places.                                                     | Confirmed employee-facing `企业训练` requires real question-answer UI and post-submit feedback.                                       | Employee training source task after UX contract.                                                      |
| `G15` | Model/Prompt UI includes editable Prompt-style controls and masked prompt preview behavior.                                                                       | Confirmed first release is read-only Prompt registry with super-admin full-text view only.                                            | Prompt registry source task after security/design review.                                             |
| `G16` | Organization analytics source includes formal learning and quota concepts, but UI boundaries need alignment.                                                      | Confirmed formal learning must be separated and enterprise AI quota summary hidden from org admins.                                   | Organization analytics boundary task.                                                                 |
| `G17` | ADR-007 and operations resource/user-management stable docs had older or under-detailed wording after the first package.                                          | Later work could incorrectly hide plaintext from eligible ops UI, leave resource write entry in ops, or miss user-management filters. | Recheck patch updates ADR/stable docs and ledger rows.                                                |
| `G18` | Stable admin log wording used a broad complete input/output summary phrase.                                                                                       | Later work could expose raw Prompt, Provider payload, AI IO, full content, or employee answers in `ai_call_log` detail.               | Recheck patch limits log details to redacted summaries.                                               |
| `G19` | Stable user-auth text still said enterprise backend was not open and used broad phone-domain wording.                                                             | Later work could remove confirmed organization-admin workspaces or block learner-to-employee binding incorrectly.                     | Recheck patch clarifies organization backend scope.                                                   |
| `G20` | Stable user-auth employee create/import text still implied manual single-create password entry and omitted explicit target-node selection.                        | Later work could miss one-time generated password distribution or include auth fields in import templates.                            | Recheck patch clarifies employee create/import fields.                                                |
| `G21` | User-auth stories carried generation type rows but not equivalent redemption semantics or eligible-role plaintext list wording.                                   | Later work could implement story ACs as generic card generation/list without upgrade target selection or role-limited plaintext.      | Recheck patch aligns story ACs with module requirements.                                              |
| `G22` | Organization AI module wording could deny generated-output/task-summary visibility entirely.                                                                      | Later work could make organization AI unusable for training-draft copy even though the owner confirmed that handoff.                  | Recheck patch separates reviewable output from raw AI logs.                                           |
| `G23` | Advanced organization training docs, older backend UX, and older role traceability still used broad "manage employees" wording for organization admins.           | Later work could accidentally delegate employee mutation to organization admins despite the confirmed platform-owned boundary.        | Second-pass patch narrows this to scoped read-only status.                                            |
| `G24` | Advanced index, organization modules, and older traceability matrices used generic "organization admin" wording for advanced-only training and AI capabilities.   | Later work could grant `org_standard_admin` enterprise training or organization AI by interpreting broad wording literally.           | Second-pass patch names `org_advanced_admin` explicitly.                                              |
| `G25` | Stable future-extension and phone-domain wording remained easy to misread after organization workspace and learner-to-employee binding decisions.                 | Later work could treat current organization workspaces as future-only or block learner-to-employee binding incorrectly.               | Second-pass patch clarifies extension and phone domains.                                              |
| `G26` | Older role-experience and backend UX matrices still listed resources in `ops_admin` allowed behavior.                                                             | Later work could preserve operations resource write ownership despite the confirmed content-workspace migration.                      | Second-pass patch removes resource write from ops matrices.                                           |
| `G27` | Advanced modules/stories still had residual generic "organization admin" wording for organization training, organization AI, analytics, and learner-AI summaries. | Later work could expose advanced-only training/analytics/AI usage surfaces to `org_standard_admin`.                                   | Final recheck patch narrows those rows to eligible `org_advanced_admin` where needed.                 |
| `G28` | Older backend UX/source/capability matrices still had blanket cleartext or ordinary-list prohibitions for `redeem_code`.                                          | Later work could override the confirmed eligible `ops_admin` / `super_admin` plaintext list/detail/distribution UI exception.         | Final recheck patch adds eligible-operations exception wording while keeping evidence/log redaction.  |
| `G29` | Requirement fulfillment matrix still mapped resource management to `ops_admin` management.                                                                        | Later work could treat resource write migration as optional instead of required.                                                      | Final recheck patch changes the row to content workspace ownership and old-route cleanup.             |
| `G30` | Requirement fulfillment rows still allowed employee import for "organization admins where allowed".                                                               | Later work could accidentally delegate first-release employee import/write operations to organization admins.                         | Final recheck patch narrows employee import rows to `ops_admin` / `super_admin`.                      |
| `G31` | Active use-case/capability catalogs still used generic `org_admin` for advanced-only organization AI/training/analytics and broad organization portal rows.       | Later work could grant `org_standard_admin` advanced-only surfaces or miss first-release read-only standard admin boundaries.         | Fourth-pass patch resolves actors to `org_standard_admin` versus `org_advanced_admin`.                |
| `G32` | Root/story account wording still said phone was simply unique, without the confirmed account-domain distinction.                                                  | Later work could accidentally block learner-to-employee binding or allow admin/learner phone reuse inconsistently.                    | Fourth-pass patch clarifies learner/employee-domain uniqueness plus cross-domain non-reuse.           |
| `G33` | Active catalog rows still contained blanket cleartext/card wording and organization analytics quota-summary wording.                                              | Later work could deny eligible operations plaintext UI or reintroduce enterprise AI quota consumption summaries for org admins.       | Fourth-pass patch preserves eligible ops UI exception and removes org-admin AI quota summary wording. |
| `G34` | Stable RAG module/story still placed manual vector rebuild under operations after resource management moved to content.                                           | Later work could preserve a hidden operations resource write action through vector rebuild even after content-workspace migration.    | Closure recheck patch moves vector rebuild actor wording to `content_admin` / `super_admin`.          |
| `G35` | Owner-facing `ops_admin` checklist still listed resource/knowledge management and vector rebuild as active operations scope.                                      | Later walkthrough or source tasks could reuse historical checklist wording as an active `ops_admin` resource-write grant.             | Closure recheck patch supersedes the row and narrows `ops_admin` to operations plus redacted logs.    |

## Completeness Checklist

- Personal card kinds, upgrade target selection, and plaintext list/detail visibility recorded.
- Organization overlap default block and explicit closure actions recorded.
- Multi-profession/multi-level enterprise package atomic decomposition recorded.
- Admin/employee account separation and phone non-reuse recorded.
- Employee import fields, optional password generation, forgot-password reset, inherited scope, and transfer behavior
  recorded.
- Organization tree ownership, node move restriction, and scoped summary boundary recorded.
- Organization training four-step wizard, sources, paper snapshot, organization AI draft copy, evidence gating, draft,
  publish, takedown, deadline, and non-formal boundaries recorded.
- Organization analytics levels, date ranges, no export, small sample warning, weak-point summary, and no enterprise AI
  quota summary recorded.
- Organization workspace menu boundaries recorded.
- Organization-admin employee write boundary and advanced-only capability naming recorded.
- Operations workspace guided flows, timelines, pagination, and backend role management boundaries recorded.
- Content AI, organization AI, model connection test, Prompt registry, logs, and contact configuration recorded.
- Content resource ownership migration, learner auth/redeem/profile, learner practice/mock/report/mistake, employee
  training answer/result, system-admin account management, organization analytics separation, Prompt full-text registry,
  and no-repeat discussion process recorded.
- Second-pass residual wording cleanup for advanced-only organization admin capabilities, eligible plaintext UI
  exception, content-owned resource management, and platform-owned employee import recorded.
- Fourth-pass active-catalog cleanup for generic `org_admin`, account-domain phone uniqueness, eligible plaintext UI
  exception, and organization analytics no-AI-quota-summary wording recorded.
- Closure recheck cleanup for resource/vector rebuild actor ownership and owner-facing `ops_admin` checklist
  supersession recorded.

## Non-Claims

- No source implementation is complete by this package.
- No runtime acceptance is claimed.
- No production quota defaults are approved.
- No release readiness, final Pass, production usability, Cost Calibration, Provider readiness, staging/prod deployment,
  PR, or force-push is claimed.
