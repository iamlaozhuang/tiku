# 2026-07-10 0704 Post-Peripheral Acceptance Ledger

## Purpose

This ledger materializes the owner-approved next 0704 pre-launch peripheral acceptance sequence after the post-AI local
gates were closed. It turns the discussed work into independent serial tasks, with separate short branches, redacted
evidence, adversarial review, closeout, and cleanup for each task.

The goal is not to rerun closed AI generation loops. The goal is to prove that surrounding business workflows are closed:
authorization source, employee governance, organization boundary, resource/RAG binding, model/Prompt/log governance,
content lifecycle, learner routing, failure degradation, and staging-readiness design.

## Global Boundary

- Each task starts from latest `origin/master` on its own `codex/*` branch.
- Each task must read `AGENTS.md`, state, queue, this ledger, relevant requirement SSOT, and recent evidence.
- Business validation tasks must read the private 0704 credential index and use credentials only in memory for redacted
  readiness preflight.
- Validation-only comes first. If a real product defect or product capability gap is found, the validation task records
  a redacted finding, stops, and opens a separate `codex/*` repair task.
- Repair tasks must finish, merge, push, and clean up before the serial queue continues.
- Evidence may record role labels, route labels, status categories, authorization context categories, command results,
  and test counts.
- Evidence must not record credentials, passwords, cookies, tokens, sessions, localStorage, Authorization headers, env
  values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full
  `question`/`paper`/`material`/resource/chunk content, employee raw answers, plaintext `redeem_code`, screenshots,
  traces, raw DOM, or private fixture values.
- Provider-enabled execution, direct DB mutation, destructive DB operation, staging/prod/deploy, env/secret, payment,
  external service, and Cost Calibration remain blocked unless a later task receives fresh explicit approval.
- `staging` work in this sequence is design-only. No staging connection, deployment, cloud resource, secret, Provider
  enablement, or production action is approved by this ledger.

## Serial Task Matrix

| Order | Task id                                       | Status  | Branch                                              | Primary proof target                                                                 |
| ----: | --------------------------------------------- | ------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
|     0 | `0704-post-peripheral-acceptance-ledger`      | closed  | `codex/0704-post-peripheral-acceptance-ledger`      | Freeze this 17-task queue, acceptance standards, stop rules, and redaction boundary. |
|     1 | `0704-org-auth-multiscope-acceptance`         | closed  | `codex/0704-org-auth-multiscope-acceptance`         | Enterprise multi-scope `org_auth` UI and atomic authorization closure.               |
|     2 | `0704-org-employee-import-acceptance`         | closed  | `codex/0704-org-employee-import-acceptance`         | Employee roster import entry, downloadable template, preview, and inherited auth.    |
|     3 | `0704-personal-redeem-code-acceptance`        | closed  | `codex/0704-personal-redeem-code-acceptance`        | Personal `redeem_code` activation, upgrade, rejection, and redaction boundaries.     |
|     4 | `0704-org-tree-auth-inheritance-acceptance`   | blocked | `codex/0704-org-tree-auth-inheritance-acceptance`   | Organization tree, auth inheritance, employee transfer, and tenant isolation.        |
|    4R | `0704-org-tree-employee-transfer-fix`         | pending | `codex/0704-org-tree-employee-transfer-fix`         | Repair employee transfer mutation, quota/session/history convergence, and rerun.     |
|     5 | `0704-org-admin-surface-acceptance`           | pending | `codex/0704-org-admin-surface-acceptance`           | Organization admin surface separation and role boundary details.                     |
|     6 | `0704-resource-rag-management-acceptance`     | pending | `codex/0704-resource-rag-management-acceptance`     | Resource lifecycle, `knowledge_node`, citation, and `evidence_status` binding.       |
|     7 | `0704-model-prompt-log-governance-acceptance` | pending | `codex/0704-model-prompt-log-governance-acceptance` | Model config, Prompt governance, and redacted `ai_call_log` behavior.                |
|     8 | `0704-audit-privacy-governance-acceptance`    | pending | `codex/0704-audit-privacy-governance-acceptance`    | `audit_log` coverage and admin/employee privacy boundaries.                          |
|     9 | `0704-org-training-edge-acceptance`           | pending | `codex/0704-org-training-edge-acceptance`           | Enterprise training source, publish, version, takedown, answer, and result edges.    |
|    10 | `0704-org-analytics-acceptance`               | pending | `codex/0704-org-analytics-acceptance`               | Organization analytics scope, aggregation, filters, and raw-answer exclusion.        |
|    11 | `0704-content-non-ai-publish-acceptance`      | pending | `codex/0704-content-non-ai-publish-acceptance`      | Formal content non-AI publish/takedown/edit-copy/reference boundaries.               |
|    12 | `0704-learner-non-ai-study-acceptance`        | pending | `codex/0704-learner-non-ai-study-acceptance`        | Ordinary learner practice, `mock_exam`, reports, mistake-book, and resume details.   |
|    13 | `0704-role-routing-auth-context-acceptance`   | pending | `codex/0704-role-routing-auth-context-acceptance`   | Login routing, personal/org context choice, quota owner, and direct-route denial.    |
|    14 | `0704-api-route-boundary-acceptance`          | pending | `codex/0704-api-route-boundary-acceptance`          | Direct URL/API adversarial authorization and cross-tenant denial.                    |
|    15 | `0704-failure-degradation-acceptance`         | pending | `codex/0704-failure-degradation-acceptance`         | Missing source, weak/none evidence, quota, Provider-disabled, duplicate failure.     |
|    16 | `0704-staging-readiness-design`               | pending | `codex/0704-staging-readiness-design`               | Staging readiness design, approval boundaries, data isolation, and stop conditions.  |

## Priority Repair Gate

Two validation tasks have explicit priority defect handling because the owner identified likely product capability gaps:

1. `0704-org-auth-multiscope-acceptance` must verify whether the operations UI can select multiple `profession`, `level`,
   `subject`, and `edition` values in a guided enterprise authorization flow, then preview the expanded atomic scope rows
   before submit.
2. `0704-org-employee-import-acceptance` must verify whether the organization or operations flow provides an employee
   roster upload entry, downloadable template, preview, quota/conflict feedback, and inherited authorization behavior.

If either task confirms a real product capability gap, the next serial item must be a separate repair task:

| Trigger validation task               | Repair task id candidate                | Continue condition                                                            |
| ------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| `0704-org-auth-multiscope-acceptance` | `0704-org-auth-multiscope-ui-fix`       | Closed: repair merged, pushed, cleaned, and affected validation rerun passed. |
| `0704-org-employee-import-acceptance` | `0704-org-employee-import-template-fix` | Closed: repair merged, pushed, cleaned, and affected validation rerun passed. |

Additional validation-discovered repair gate:

| Trigger validation task                     | Repair task id candidate              | Continue condition                                                            |
| ------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| `0704-org-tree-auth-inheritance-acceptance` | `0704-org-tree-employee-transfer-fix` | Closed: repair merged, pushed, cleaned, and affected validation rerun passed. |

## Task Acceptance Standards

### 0. `0704-post-peripheral-acceptance-ledger`

- This ledger exists and lists all 17 serial tasks.
- Task queue and project state point at this ledger and the current/next task.
- Stop-on-defect and repair-before-continue rules are explicit.
- Evidence is redacted and contains no credential or sensitive runtime material.
- No source, test, package, lockfile, schema, migration, seed, Provider, browser, DB, staging, prod, deploy, env, secret,
  payment, external-service, or Cost Calibration action is executed.

### 1. `0704-org-auth-multiscope-acceptance`

- Operations enterprise authorization UI supports a guided multi-select bundle for `profession`, `level`, `subject`, and
  `edition`.
- The UI shows a pre-submit preview of expanded atomic scope rows, quota/expiry/cancellation categories, and conflict
  warnings.
- Service behavior uses atomic scope computation for allow/deny decisions.
- Employee capabilities are derived from current valid `org_auth`, not account labels or stale UI state.
- Standard employees/admins are denied advanced capabilities; advanced employees/admins receive eligible capabilities.
- Cross-profession, cross-level, cross-organization, expired, revoked, cancelled, or overlapping active scopes are denied
  or blocked by status category.
- Audit evidence records action/status categories only.

### 2. `0704-org-employee-import-acceptance`

- Organization or operations surfaces expose an employee roster upload entry.
- A downloadable reusable template exists.
- Template fields exclude `profession`, `level`, `edition`, and internal authorization scope identifiers.
- Upload preview shows count categories, validation failures, quota impact, inherited authorization categories, and
  confirmation state.
- Duplicate account, malformed row, insufficient quota, cross-domain conflict, disabled account, and cross-organization
  conflict categories fail safely.
- Confirmed employees can log in and inherit current organization authorization context.
- Disable, removal, password reset, and transfer cause permissions to converge without stale access.

### 3. `0704-personal-redeem-code-acceptance`

- `personal_standard_activation`, `personal_advanced_activation`, and `edition_upgrade` workflows remain separated.
- `edition_upgrade` upgrades only an active standard `personal_auth`; it does not create a new `personal_auth`.
- Already advanced, used, expired, revoked, wrong-kind, or out-of-scope codes fail safely.
- Learner authorization context and entries update after redemption.
- Plaintext `redeem_code` values stay within eligible operations UI exception only and never enter evidence, logs, exports,
  screenshots, or committed docs.

### 4. `0704-org-tree-auth-inheritance-acceptance`

- Organization node create/edit/disable categories behave as specified.
- Authorization binds to the intended organization node and descendant policy.
- Employees inherit only the current organization authorization context.
- Employee transfer removes old-organization training, analytics, and AI access.
- Historical submitted summaries remain read-only and scoped.
- Sibling, parent, and unrelated organization access is denied.
- 2026-07-10 validation result: blocked because employee transfer execution has only review UI and lacks a mutation route,
  service action, and repository transaction. Queue continuation requires `0704-org-tree-employee-transfer-fix` plus rerun.

### 5. `0704-org-admin-surface-acceptance`

- `org_standard_admin` sees only scoped employee roster/status, organization authorization/status, organization info, and
  support surfaces.
- `org_advanced_admin` sees eligible enterprise training, analytics, and organization AI surfaces inside organization
  scope.
- Organization admins cannot access global operations, content authoring, model config, Prompt governance, global logs,
  global `redeem_code`, or global `org_auth`.
- Organization admins cannot view employee learner AI raw results, raw answers, raw generated content, Provider payloads,
  raw Prompt text, or global AI task payloads.

### 6. `0704-resource-rag-management-acceptance`

- `content_admin` can manage resource lifecycle and `knowledge_node` bindings.
- Non-content roles cannot write resources or knowledge base state.
- Published resources can be consumed by RAG-capable features through citation and `evidence_status` categories.
- Takedown prevents future use while preserving historical redacted reference categories.
- `evidence_status = none` never fabricates citations; `weak` requires explicit degradation or confirmation behavior.

### 7. `0704-model-prompt-log-governance-acceptance`

- `super_admin` owns model configuration governance.
- `ops_admin` can view only permitted summaries.
- Prompt template governance follows first-release read-only or explicitly controlled edit rules.
- `ai_call_log` surfaces show status categories, use categories, duration buckets, actor role labels, and redacted failure
  categories only.
- Provider-disabled, timeout, quota, empty result, and unavailable states degrade safely without leaking raw Provider,
  prompt, output, or stack content.

### 8. `0704-audit-privacy-governance-acceptance`

- Authorization, upgrade, revocation, employee import, employee disable, training publish, resource publish, and model
  config changes produce `audit_log` categories.
- Audit/log views are scoped to the viewer role.
- Employee raw answers and learner AI raw results are not exposed through organization admin or operations logs.
- Sensitive values never appear in evidence or committed logs.

### 9. `0704-org-training-edge-acceptance`

- Training sources include platform formal content snapshot, organization AI result, and organization-private manual
  grouping where implemented.
- Publish scope, deadline, answer setting, version, and takedown categories behave as specified.
- Published versions are immutable; changes require a new draft/version.
- Takedown blocks unstarted and in-progress answers while preserving submitted summaries.
- One employee submits once per published version.
- Enterprise training does not create or pollute formal `mock_exam`, `exam_report`, or `mistake_book` records.

### 10. `0704-org-analytics-acceptance`

- Organization overview, training detail, employee summary, date filters, empty states, and small-sample warning categories
  behave as specified.
- Analytics are organization-scoped.
- Enterprise training metrics stay separate from formal learning aggregate signals.
- Organization admins see summaries/status only, not employee raw answers or raw AI content.
- Enterprise AI quota consumption summary remains hidden from organization admins in first release.

### 11. `0704-content-non-ai-publish-acceptance`

- Formal `question`, `paper`, `material`, `paper_section`, `question_group`, and `scoring_point` relationships remain
  stable.
- Publish, takedown, edit-copy, referenced-content immutability, and incomplete-content blocking behave as specified.
- Published content can be referenced by allowed practice, `mock_exam`, enterprise training, and AI assembly flows.
- Takedown blocks new entry while preserving permitted historical status categories.
- AI draft adoption into formal content remains governed and is not rerun by default.

### 12. `0704-learner-non-ai-study-acceptance`

- Ordinary practice, `mock_exam`, result/report, objective `mistake_book`, and resume/continue categories remain usable.
- Material groups and paper-section structure render at status level without leaking answers during `mock_exam`.
- Refresh, relogin, duplicate entry, content takedown, organization disable, and authorization loss converge safely.
- Standard and advanced authorization differences do not break baseline non-AI learning access.

### 13. `0704-role-routing-auth-context-acceptance`

- Each role lands in the correct workspace after login.
- Personal and organization authorization contexts are explicit when both are available.
- Organization context controls quota owner, eligible surfaces, route labels, and denial categories.
- No-auth users are routed to redemption or support surfaces.
- Standard users cannot reach advanced capability by direct URL.
- Admin roles cannot reach learner-only AI result surfaces.

### 14. `0704-api-route-boundary-acceptance`

- Direct URL/API calls deny standard-to-advanced escalation.
- Cross-organization training, employee, analytics, and resource access is denied or empty by category.
- Employee-to-admin, organization-admin-to-operations, organization-admin-to-content, and organization-admin-to-model/log
  access is denied.
- Expired authorization, disabled account, disabled organization, and stale session cannot bypass service-layer checks.
- Error bodies do not leak internal paths, stack traces, SQL, Provider details, or raw sensitive content.

### 15. `0704-failure-degradation-acceptance`

- No source, no knowledge coverage, no resource, weak/none evidence, quota exhaustion, Provider disabled, Provider
  unavailable, timeout, network failure, duplicate submit, stale history, and resume failure produce safe status
  categories.
- Failures do not write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records
  outside approved flows.
- Admin-side failure visibility remains redacted and aggregate.

### 16. `0704-staging-readiness-design`

- Design covers staging data isolation, account matrix, credential governance, database/storage/log/provider/domain
  boundaries, migration/rollback rehearsal, seed/redaction rules, monitoring, evidence template, and stop conditions.
- The design identifies every future action that requires fresh explicit approval.
- The task executes no staging/prod/deploy/cloud/env/secret/Provider/Cost Calibration action.
- The result does not claim staging readiness, production readiness, release readiness, final Pass, or Provider readiness.

## Current Closed Evidence To Reuse

- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-role-credential-catalog-consolidation-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-authorization-lifecycle-acceptance-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-multitenancy-boundary-acceptance-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-non-ai-learning-smoke-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-content-non-ai-publish-smoke-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-exception-degradation-smoke-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-release-candidate-local-gates-evidence.md`

## Result

This ledger seeds the next serial acceptance run. The current task is docs/state governance only. Runtime acceptance and
any product repairs remain for the subsequent task branches.
