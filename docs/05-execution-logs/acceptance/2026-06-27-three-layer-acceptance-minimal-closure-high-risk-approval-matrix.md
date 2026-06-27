# Three Layer Acceptance Minimal Closure High Risk Approval Matrix

Task id: `three-layer-acceptance-minimal-closure-high-risk-approval-matrix-2026-06-27`
Branch: `codex/three-layer-acceptance-matrix-20260627`
Date: 2026-06-27

## Decision

Decision: `APPROVAL_MATRIX_PREPARED_EXECUTION_BLOCKED_PENDING_FRESH_APPROVAL`.

This document is a docs/state-only acceptance and approval matrix. It does not execute browser runtime, Provider calls,
Provider credential reads, DB reads/writes, Cost Calibration, real retry/adoption mutation, formal publish,
student-visible runtime, `staging`, `prod`, deploy, payment, external service, PR, force push, release readiness, or
final Pass.

## Current Three Layer Status

| Layer   | Acceptance target                          | Current status                                                     | Evidence basis                                                                                                                                                                                                                                                                          | Remaining boundary                                                                                                                                                    |
| ------- | ------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 | Role, entry, and permission acceptance     | `local_role_flow_complete_no_regression_claim_only`                | `docs/05-execution-logs/acceptance/2026-06-26-owner-acceptance-decision-package-after-full-8-row-local-browser-pass.md` records `8 pass / 0 fail / 0 blocked` for the local eight-row role matrix.                                                                                      | Do not claim final Pass, release readiness, `staging`, `prod`, Provider readiness, Cost Calibration, payment, or external-service readiness from this local evidence. |
| Layer 2 | Business function minimal local loop       | `partial_local_business_loop_evidence_exists_closure_not_complete` | Content-admin review source contracts, UI local validation, and credentialed browser smoke evidence exist on 2026-06-27. Formal draft composition and one local publish/rollback evidence also exist, but review/adoption mutation and student-visible runtime remain separately gated. | Needs a focused minimal business closure package before any mutation/browser/DB step.                                                                                 |
| Layer 3 | Real Provider, cost, and pre-release gates | `blocked_with_some_local_provider_smoke_history`                   | 2026-06-26 evidence includes bounded real Provider draft-only paper composition smoke. Cost Calibration, `staging`, `prod`, payment, external service, deployment, release readiness, and final Pass remain blocked.                                                                    | Needs fresh approval per Provider/cost/staging/prod/payment/OCR/export gate before execution.                                                                         |

## Layer 1 Non-Regression Guard

Layer 1 is treated as completed for local role/entry/permission evidence only.

Required non-regression guard for later tasks:

- Any future source/UI/auth change touching `student`, `admin`, `employee`, `organization`, `authorization`,
  `personal_auth`, `org_auth`, `redeem_code`, backend entries, or advanced-only entries should preserve the eight-row
  role matrix.
- Browser rerun is not approved by this document. A future rerun needs local browser/dev-server/e2e approval and
  redacted evidence.
- Evidence must keep credentials, tokens, cookies, DB rows, public identifier inventories, screenshots, traces, page
  text dumps, raw prompts, raw answers, Provider payloads, and full `paper` or `material` content out of committed logs.

## Layer 2 Minimal Business Closure Tasks

The smallest local business closure should focus on one end-to-end chain before broader enhancements:

```text
content_admin generated result review -> explicit adopt/reject decision -> redacted adoption traceability ->
formal draft existence -> publish remains blocked unless separately approved
```

| Order | Proposed task                                                                   | Purpose                                                                                                                                                                                                  | Can run serially now?                        | Fresh approval required before execution                                                                                                              |
| ----- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| L2-1  | `layer-2-business-closure-evidence-rollup-2026-06-27`                           | Docs-only rollup that maps existing content-admin review, formal draft, learner private, organization-owned draft, organization analytics, and formal publish local evidence into one Layer 2 gap table. | Yes, docs/state-only after this task closes. | No high-risk execution approval, but still needs task/closeout approval.                                                                              |
| L2-2  | `content-admin-review-adoption-command-contract-tdd-2026-06-27`                 | Add or verify an explicit adopt/reject command contract and tests for reviewed generated results, preserving redaction and no direct publish.                                                            | No.                                          | Fresh source/test implementation approval.                                                                                                            |
| L2-3  | `content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27`   | Define local route smoke boundary for at most one adopt/reject decision and metadata write/read verification.                                                                                            | Yes as docs-only package if approved.        | Execution remains blocked until L2-4.                                                                                                                 |
| L2-4  | `content-admin-review-adoption-local-route-smoke-execution-2026-06-27`          | Execute capped local route/service smoke for one content-admin review adoption decision.                                                                                                                 | No.                                          | Fresh local DB connection/write/read approval, local test data source approval, mutation cap, rollback/archive strategy, and redacted evidence rules. |
| L2-5  | `content-admin-review-adoption-ui-enablement-local-validation-2026-06-27`       | Enable the UI affordance only after command and mutation boundaries are proven; keep publish/student-visible blocked.                                                                                    | No.                                          | Fresh source/test approval. Browser remains separate.                                                                                                 |
| L2-6  | `content-admin-review-adoption-credentialed-browser-smoke-2026-06-27`           | Credentialed local browser smoke that observes the review loop and confirms mutation controls are used only within the approved cap.                                                                     | No.                                          | Fresh local browser/dev-server/e2e, local credential handling, DB mutation/rollback, and redacted evidence approval.                                  |
| L2-7  | `formal-publish-student-visible-local-verification-approval-package-2026-06-27` | Decide whether the existing one-draft local publish evidence is enough for Layer 2 or whether a fresh student-visible local verification is needed.                                                      | Yes as docs-only package if approved.        | Any publish or student-visible runtime execution remains blocked.                                                                                     |

Layer 2 second-layer enhancements already have local evidence for batch selection, failed retry state, result diff, adoption
history, and UI validation. They should not replace the minimal adopt/reject closure chain above.

## Local Mutation, Test Data, DB, And Rollback Approval Matrix

| Work item                                      | Local controlled mutation                                   | Test data or fixture need                                  | DB read/write need                          | Rollback or cleanup need                                   | Approval status                                  |
| ---------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| Content-admin review adoption command contract | No live mutation in TDD; fake/injected writer only          | Synthetic unit fixtures only                               | None                                        | None                                                       | Fresh source/test approval required              |
| Content-admin review adoption route smoke      | Yes, one review/adoption decision max                       | Existing local generated result or approved setup path     | Local DB read/write required                | Archive/revert metadata strategy required                  | Fresh DB mutation and rollback approval required |
| Batch adoption                                 | Yes, multiple review/adoption decisions                     | Batch candidate source data                                | DB read/write required                      | Batch rollback/partial-failure strategy required           | Blocked; not minimal closure                     |
| Failed retry execution                         | Yes, retry state mutation and possible Provider call        | Failed local task fixture/source                           | DB write and Provider may be required       | Retry cap and failure stop rule required                   | Blocked; Provider/retry approval required        |
| Result diff read-model runtime                 | Read-only if no adoption mutation                           | Existing generated result plus formal draft                | DB read may be required                     | None for read-only                                         | Fresh DB read/runtime approval if executed       |
| Adoption history runtime                       | Read-only if history already exists                         | Existing adoption metadata                                 | DB read may be required                     | None for read-only                                         | Fresh DB read/runtime approval if executed       |
| Learner private generated-result use loop      | Yes if creating private practice or AI paper attempt        | Private learner generated result                           | DB read/write required                      | Private artifact archive/reset strategy required           | Fresh DB mutation approval required              |
| Organization-owned draft/training loop         | Yes if creating organization-private draft/training content | Organization-owned generated result and organization actor | DB read/write required                      | Organization-private draft archive/reset strategy required | Fresh DB mutation approval required              |
| Organization analytics browser smoke           | No mutation expected if read-only                           | Existing organization summary data                         | DB read may be required through app runtime | None unless runtime creates artifacts                      | Fresh browser/dev-server approval required       |
| Formal publish local verification              | Yes, publish state transition                               | One approved local draft `paper`                           | DB write required                           | Archive/rollback strategy required                         | Fresh publish/student-visible approval required  |

## Layer 3 High Risk Approval Matrix

| Package or gate                                       | Active queue basis                                              | Fresh approval must specify                                                                                                                                                                         | Execution remains blocked until                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| AP-01 Provider smoke blocked tasks                    | Six blocked `provider_smoke_execution` tasks in active queue    | Provider, model, base URL, credential alias, secret source handling, call cap, retry cap, token cap, spend cap, evidence fields, stop conditions, whether Qwen console remediation is owner-handled | Owner gives task-specific Provider and credential approval; no secret values may be recorded |
| AP-02 Cost Calibration                                | `ap-02-ops-auth-quota-cost-calibration-approval-package`        | Pricing source/date, sample workflows, max spend, token/cost fields, quota unit ledger, owner stop rule, redacted `ai_call_log` summary policy                                                      | Cost Calibration fresh approval                                                              |
| AP-03 Provider staging execution                      | `ap-03-provider-staging-execution-approval-package`             | `staging` resource owner, isolated DB/storage/auth/secret/provider quota, command list, rollback owner, evidence redaction, no `prod` data                                                          | Staging/resource/deploy/provider approval                                                    |
| AP-04 Standard AI generation scope change             | `ap-04-standard-ai-generation-scope-change-approval-package`    | Product scope, provider/env/quota/cost boundary, formal adoption boundary, student-visible boundary, source files, validation commands                                                              | Product scope and implementation approval                                                    |
| AP-05 Standard organization self-service scope change | `ap-05-standard-org-self-service-scope-change-approval-package` | Privacy model, schema/API/UI boundaries, deployment/data boundary, organization authorization impact                                                                                                | Scope, schema, and deployment approvals                                                      |
| AP-06 Online payment                                  | `ap-06-online-payment-approval-package`                         | Payment provider, sandbox/real boundary, refund/invoice/settlement/reconciliation, env/deploy boundary, external callbacks, evidence policy                                                         | Payment/external-service/env/deploy approval                                                 |
| AP-07 OCR auto import                                 | `ap-07-ocr-auto-import-approval-package`                        | OCR provider/parser/storage/schema/dependency plan, import cap, rollback, redaction of full OCR text and `paper` content                                                                            | Dependency/schema/provider/storage approvals                                                 |
| AP-08 Organization data export                        | `ap-08-org-data-export-approval-package`                        | Export format, file generation/download path, privacy/permission/audit boundary, retention, deploy/external-service decision                                                                        | Export/privacy/runtime approval                                                              |
| AP-09 Runtime capability list                         | `ap-09-runtime-capability-list-approval-package`                | Capability model, API/UI/data model, exact allowed source/test files, validation, rollback                                                                                                          | Source/test/schema approval                                                                  |
| AP-10 Current checkpoint audit repair                 | `ap-10-current-checkpoint-audit-repair-approval-package`        | Exact audit target, allowed source/test/e2e files, validation commands, stop conditions, sensitive evidence boundary                                                                                | Audit repair approval                                                                        |
| AP-11 Source governance change                        | `ap-11-source-governance-change-approval-package`               | Source ids, catalog/matrix rows, requirement change rules, blocked gates, sensitive evidence policy                                                                                                 | Governance/source change approval                                                            |
| Release readiness and final Pass                      | Not approved by any package above                               | Decision criteria, included/excluded gates, owner accountable decision, evidence list, residual risk acceptance                                                                                     | Separate fresh final decision approval                                                       |

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Serial Execution And Human Stop Points

Recommended serial order:

1. Close this docs/state matrix task locally.
2. Request fresh closeout approval if the owner wants ff-only merge, push, and branch cleanup.
3. Run a docs-only Layer 2 evidence rollup and gap audit.
4. Stop for fresh approval before source/test implementation or DB/browser/runtime mutation.
5. Execute the minimal content-admin review adoption chain only if approved.
6. Stop for fresh approval before Provider/cost/staging/prod/payment/OCR/export execution.
7. Run a docs-only high-risk package consolidation/retirement task to decide which AP-01 through AP-11 packages are
   obsolete, duplicate, or still needed.
8. Execute only the owner-selected high-risk gate packages, one gate at a time.
9. Keep release readiness and final Pass blocked unless the owner gives a separate fresh decision.

Can be serial without high-risk execution:

- Docs-only Layer 2 evidence rollup.
- Docs-only high-risk package consolidation and retirement proposal.
- Docs-only approval package refreshes.

Must wait for human approval:

- Source/test implementation.
- Local browser/dev-server/e2e execution.
- DB read/write/seed/migration or rollback execution.
- Provider call, Provider credential read, Provider configuration, or retry execution.
- Cost Calibration.
- Formal publish or student-visible runtime.
- `staging`, `prod`, deploy, payment, external service, OCR provider, export generation/download.
- PR, force push, release readiness, final Pass.

## Queue Quantity Estimate

Active queue before this task was created:

- `blocked`: 18
- `ready_for_closeout`: 26
- `closed`: 9
- Non-terminal total: 44

After this task is registered and before closeout, expected non-terminal total is 45.

Estimated remaining work:

| Goal slice                                                                             | Estimated task count           | Notes                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal three-layer closure without high-risk execution                                | 5-7 additional tasks           | Includes this matrix closeout, Layer 2 evidence rollup, minimal Layer 2 approval package, high-risk consolidation proposal, and closeout/hygiene tasks. |
| Minimal Layer 2 business closure with approved local mutation/browser                  | 4-6 additional execution tasks | Contract TDD, local route smoke approval, route smoke execution, UI enablement, credentialed browser smoke, optional publish verification decision.     |
| Minimal Layer 3 Provider/cost/pre-release path with selected execution                 | 5-8 additional tasks           | Provider checkpoint cleanup or one smoke, Cost Calibration package/execution, staging package, release boundary decision, evidence/audit closeout.      |
| Clear all high-risk approval packages conservatively                                   | 16-20 tasks                    | Treats six AP-01 Provider smoke blocked tasks plus AP-02 through AP-11 as individual review/retire/execute-or-close decisions.                          |
| Clear all high-risk approval packages with a consolidated docs-only retirement package | 6-8 tasks                      | Possible only if owner approves consolidation of duplicates/obsolete packages without executing high-risk actions.                                      |

These are estimates, not execution authorization.

## Copyable Centralized Approval Text

The owner may copy and edit one of the following. These texts intentionally do not approve release readiness or final Pass.

### A. Docs-Only Consolidation Approval

```text
I approve a docs/state-only consolidation task for the three-layer acceptance queue and high-risk approval packages.
Scope is limited to project-state.yaml, task-queue.yaml, task plans, evidence, audits, and acceptance docs. Codex may
classify AP-01 through AP-11 as keep, retire, merge, or blocked, and may update queue/docs accordingly. Do not run
browser/dev-server/e2e, do not connect to or mutate DB, do not read credentials or .env files, do not call Providers,
do not run Cost Calibration, do not publish or create student-visible runtime, do not touch staging/prod/deploy/payment/
external services, do not create PRs or force push, and do not claim release readiness or final Pass.
```

### B. Layer 2 Minimal Local Business Closure Approval

```text
I approve a Layer 2 minimal local business closure package for the content_admin generated-result review loop only.
Allowed future tasks must be split into contract/source TDD, local route-smoke approval, capped local route-smoke
execution, UI enablement, and credentialed browser smoke. Any DB read/write, test data setup, local credentials,
browser/dev-server/e2e execution, mutation cap, and rollback/archive strategy must be explicitly recorded in each task
before execution. Provider calls, Provider credential reads, Cost Calibration, staging/prod/deploy/payment/external
services, formal publish beyond the named task, student-visible runtime, PR, force push, release readiness, and final
Pass remain blocked unless separately approved.
```

### C. Provider Smoke Reconciliation Approval

```text
I approve a docs-only Provider smoke reconciliation package. Codex may compare existing AP-01 blocked Provider smoke
tasks with the 2026-06-26 real Provider paper composition smoke evidence and propose which Provider tasks to retire,
merge, or keep blocked. Do not read Provider credentials, do not read .env files, do not call Providers, do not retry
Qwen/DeepSeek, do not change Provider configuration, do not run Cost Calibration, and do not claim Provider readiness,
release readiness, or final Pass.
```

### D. Cost Calibration Execution Approval Template

```text
I approve a future Cost Calibration execution task only under a separate task plan that names pricing source/date,
provider/model, sample workflows, maximum call count, retry cap, token cap, spend cap, evidence fields, and stop
conditions. Evidence must be redacted and must not include secrets, prompts, raw outputs, Provider payloads, DB rows, or
private content. This approval does not approve staging/prod/deploy/payment/external services, production quota defaults,
release readiness, or final Pass unless separately stated.
```

### E. Staging Readiness Approval Template

```text
I approve a future staging readiness package only after a task plan defines isolated staging DB/storage/auth/secret/
provider resources, data source, deployment target, rollback owner, monitoring owner, allowed accounts, redaction rules,
and exact validation commands. Production data and prod resources remain blocked. This approval does not approve prod,
payment, external services, release readiness, or final Pass.
```

## Explicit Non-Claims

- No source, test, e2e, package, lockfile, schema, migration, script, env, or runtime artifact was changed by this
  acceptance matrix.
- No browser/dev-server/e2e runtime was executed.
- No DB connection, read, write, migration, seed, rollback, or destructive operation was executed.
- No Provider call, Provider credential read, Provider configuration, retry, or Cost Calibration was executed.
- No formal publish, student-visible runtime, `staging`, `prod`, deploy, payment, external service, PR, force push,
  release readiness, production readiness, or final Pass was executed or claimed.

## Fresh Closeout Acceptance

- Fresh closeout approval source:
  `current_user_fresh_closeout_approval_2026_06_27_three_layer_acceptance_matrix`.
- ff-only merge to `master`: completed locally from `6a03a93e00c4c0052e2953fcf5705b594d4ee1a7` to
  `bd413e46ca17cdf04d74f50fc142811e095e4a33`.
- Push to `origin/master`: approved after master gates pass.
- Short-branch cleanup: approved after push success.
- PR, force push, Provider, DB, browser/e2e, Cost Calibration, `staging`/`prod`, payment/external service, release
  readiness, and final Pass remain not approved and not claimed.
