# Standard And Advanced MVP Acceptance Execution Plan

## Status

- Date: `2026-06-22`
- Status: `draft_execution_plan`
- Scope: Standard MVP and Advanced MVP acceptance execution design.
- Execution state: not executed.
- Branch prepared for this document: `codex/acceptance-execution-plan-doc-20260622`
- Release claim: no preview, staging, production, Provider, payment, or release readiness claim is made by this document.

## Purpose

This document defines a complete acceptance execution plan for the current Tiku MVP, split into Standard and Advanced edition scopes. It is designed to answer four questions before any formal acceptance run starts:

1. What must be accepted.
2. Who must execute or review each part.
3. What evidence is required to avoid gaps.
4. Which gates remain outside the current local MVP boundary.

The plan is intentionally evidence-first. It uses the current repository state as the source of truth and separates local MVP acceptance from future staging, Provider, payment, and release gates.

## Source Of Truth

Use the following files as mandatory references during execution:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/local-release-candidate-build-unit-execution-packet.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-checklist.yaml`
- `docs/05-execution-logs/acceptance/role-based-full-flow/staging-acceptance-template.md`

## Current Evidence Baseline

The current local evidence baseline is:

- Use case coverage matrix total: `32`.
- `experience_closed`: `21`.
- `release_blocked`: `11`.
- `missing`: `0`.
- `partial`: `0`.
- `local_experience_ready`: `0`.

Standard MVP baseline:

- Standard use cases: `12`.
- `experience_closed`: `11`.
- `release_blocked`: `1`.
- Release-blocked Standard use case: `UC-STD-AI-SCORING-EXPLANATION`.
- Additional Standard release boundaries remain for real Provider, vector/RAG runtime, and Cost Calibration even where local experience evidence is closed.

Advanced MVP baseline:

- Advanced use cases: `11`.
- `experience_closed`: `10`.
- `release_blocked`: `1`.
- Release-blocked Advanced use case: `UC-ADV-OPS-AUTH-QUOTA`.
- Organization training is `ready_closed_local_only`; this does not equal staging or release readiness.

Latest local validation packet states:

- `lint`: pass.
- `typecheck`: pass.
- `unit`: pass, `297` files and `1261` tests.
- `build`: pass, Next `16.2.6`, Turbopack, `65` static pages.
- Not executed: default `npm test`, e2e/browser/dev server, Provider/model call, env/secret, schema/migration/seed/database, deploy/cloud/staging, payment/external service, and Cost Calibration.

Preview owner acceptance baseline:

- Current first-preview scope is web-only owner acceptance preview.
- Provider default remains disabled.
- Data mode is synthetic or reviewed non-sensitive sample data only.
- `previewReleaseReadyClaim`: `false`.
- AP-01 through AP-11 release gates remain outside the current local MVP closeout.

## Non-Goals And Blocked Boundaries

This plan does not approve or execute:

- Provider enablement, model calls, prompt calls, raw AI output collection, or external AI service access.
- Vector database, real RAG ingestion, real `knowledge_base` corpus validation, or production-like embedding flows.
- Payment, external billing, real `redeem_code` issuance, or paid `authorization` fulfillment.
- `.env*`, secret, token, database URL, Auth header, or cloud credential changes.
- Database migration, schema change, seed mutation, production data import, or production database clone.
- Staging deployment, cloud resource creation, preview URL publication, production release, or remote Git push.
- Full browser/e2e execution without fresh approval.

Any future execution crossing these boundaries must create a separate approval record and evidence packet.

## Acceptance Level Ladder

| Level | Name                              | Purpose                                      | Allowed in current plan | Fresh approval required |
| ----- | --------------------------------- | -------------------------------------------- | ----------------------- | ----------------------- |
| L0    | Document and traceability review  | Confirm scope, source files, and use cases   | Yes                     | No                      |
| L1    | Static local gate                 | Run lint/typecheck/format/diff hygiene       | Yes                     | No                      |
| L2    | Unit and build evidence review    | Verify existing local automated confidence   | Yes                     | No                      |
| L3    | Local API and repository sampling | Validate local service/repository boundaries | Plan only               | Yes, if runtime needed  |
| L4    | Local UI/browser sampling         | Validate user-visible flows in browser       | Plan only               | Yes                     |
| L5    | Role-based manual acceptance      | Execute role scripts and collect evidence    | Plan only               | Yes                     |
| L6    | Staging owner preview             | Execute approved staging preview checklist   | Plan only               | Yes                     |
| L7    | Release candidate decision        | Decide if release gates are met              | No                      | Yes                     |
| L8    | Production release                | Approve production rollout                   | No                      | Yes                     |

The recommended first acceptance run is L0 through L2 plus a prepared L5 script package. L4 to L6 should be scheduled only after account ownership, redaction ownership, and runtime approval are recorded.

## Acceptance Decision Rules

Use one of the following final decisions for each acceptance run:

| Decision                     | Meaning                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `accepted_local_mvp`         | All in-scope local MVP acceptance criteria have evidence, no P0/P1 remains, and blocked release gates are documented. |
| `accepted_with_gaps`         | Core MVP flows are acceptable, non-blocking gaps are documented with owner and next decision, and no P0/P1 remains.   |
| `not_accepted`               | A P0/P1 issue exists, evidence is missing for a required flow, or role/security/data boundaries cannot be proven.     |
| `blocked_by_approval_gate`   | Execution requires Provider, e2e, staging, payment, database, env, or remote action approval that has not been given. |
| `documentation_plan_only`    | Planning is complete, but no runtime acceptance run has been executed.                                                |
| `release_gate_not_satisfied` | Local MVP may be acceptable, but preview, staging, Provider, Cost Calibration, or release gates remain open.          |

## Severity Rules

| Severity | Definition                                                                                                                   | Acceptance impact                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| P0       | Data leakage, authorization bypass, destructive data issue, production boundary violation, or core system unavailable.       | Blocks acceptance and release.                                 |
| P1       | Core Standard or Advanced MVP journey cannot complete, or required audit/evidence cannot be produced.                        | Blocks acceptance.                                             |
| P2       | Important workflow friction, incomplete non-critical state, unclear copy, or recoverable operations issue.                   | May allow `accepted_with_gaps` if tracked with owner and date. |
| P3       | Minor copy, layout, documentation, or low-risk observation that does not affect completion, security, or evidence integrity. | Does not block acceptance if recorded and assigned.            |

## Required Roles

These roles must be represented in the acceptance plan. Real names, emails, and credentials must not be committed.

| Role label                | Purpose                                                          | Minimum evidence                                        |
| ------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| `unauthenticated_visitor` | Confirms locked surfaces do not leak protected content.          | Route or surface, expected denial or purchase guidance. |
| `student`                 | Executes Standard `practice`, `mock_exam`, report, and feedback. | Redacted path, state transitions, pass/fail status.     |
| `advanced_student`        | Executes Advanced personal AI and enhanced learning scope.       | Redacted path and authorization boundary result.        |
| `content_admin`           | Reviews `question`, `paper`, `material`, and publish lifecycle.  | Data labels only, no full paper or OCR text.            |
| `ops_admin`               | Reviews `authorization`, `redeem_code`, quota, and logs.         | Redacted admin evidence and audit summary.              |
| `super_admin`             | Confirms highest-privilege governance boundaries.                | Permission matrix and negative checks.                  |
| `org_admin`               | Executes organization training, assignment, and analytics flow.  | Organization label, employee counts, redacted metrics.  |
| `employee`                | Completes assigned organization learning or exam flow.           | Redacted completion status and report visibility.       |
| `auditor`                 | Reviews `audit_log`, `ai_call_log`, and evidence hygiene.        | Redacted log summary, no payload or secret leakage.     |

## Data Boundary

Allowed data:

- Synthetic seed data.
- Reviewed non-sensitive sample metadata.
- Public labels, internal acceptance ids, route names, status codes, and redacted counts.
- Redacted screenshots or traces stored in ignored runtime artifact paths when runtime approval exists.

Forbidden data:

- Production database clone or production object storage reuse.
- Secret, token, database URL, Auth header, session cookie, raw credential, or plaintext `redeem_code`.
- Raw Provider payload, raw prompt, raw generated response, raw `ai_scoring`, or raw `ai_explanation`.
- Full paper, full textbook, full OCR content, full employee answer, or personally identifiable customer-like data.
- Evidence copied from unapproved staging, production, payment, or external service systems.

## Edition Scope Mapping

The use case catalog and acceptance evidence use different levels of vocabulary. Use this mapping during traceability:

| Catalog `editionScope`           | Acceptance `editionScope` | Acceptance handling                                                                 |
| -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `standard_mvp`                   | `standard`                | Required Standard MVP acceptance row.                                               |
| `advanced_edition`               | `advanced`                | Required Advanced MVP acceptance row.                                               |
| `unified_standard_advanced`      | `cross_cutting`           | Required cross-cutting acceptance or audit row.                                     |
| `future_scope`                   | `future_scope`            | Non-goal or blocked-gate row; do not count as Standard or Advanced MVP completion.  |
| `blocked_gate`                   | `blocked_gate`            | Release gate row; do not count as local MVP completion.                             |
| `auditUseOnly: true` catalog row | `audit_only`              | Governance proof only; cannot seed implementation or user-facing acceptance claims. |

## Required Acceptance Matrix Seed

Every formal acceptance run must expand this seed into the full Acceptance Row Template. A row may be `blocked` or `audit_only`, but it must not be omitted.

| acceptanceId | useCaseId                              | catalogEditionScope       | editionScope  | primaryRole               | currentMatrixStatus | requiredAcceptanceDisposition     | blockedGateSummary                                                               |
| ------------ | -------------------------------------- | ------------------------- | ------------- | ------------------------- | ------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| ACC-STD-001  | UC-STD-ACCOUNT-SESSION                 | standard_mvp              | standard      | student, admin            | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-002  | UC-STD-PERSONAL-AUTH-REDEEM            | standard_mvp              | standard      | student, ops_admin        | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-003  | UC-STD-ORG-AUTH-MANAGED                | standard_mvp              | standard      | ops_admin                 | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-004  | UC-STD-QUESTION-MATERIAL-MANAGE        | standard_mvp              | standard      | content_admin             | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-005  | UC-STD-PAPER-LIFECYCLE                 | standard_mvp              | standard      | content_admin, student    | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-006  | UC-STD-PRACTICE                        | standard_mvp              | standard      | student                   | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-007  | UC-STD-MOCK-EXAM                       | standard_mvp              | standard      | student                   | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-008  | UC-STD-REPORT-MISTAKE-BOOK             | standard_mvp              | standard      | student                   | experience_closed   | required_l5                       | none                                                                             |
| ACC-STD-009  | UC-STD-AI-SCORING-EXPLANATION          | standard_mvp              | standard      | student, admin, auditor   | release_blocked     | required_l5_blocked_release       | provider_model_call, env_secret, quota, raw_prompt_output, Cost Calibration      |
| ACC-STD-010  | UC-STD-KN-RECOMMENDATION               | standard_mvp              | standard      | student, content_admin    | experience_closed   | required_l5_release_boundary      | real Provider/RAG quality and Cost Calibration do not become release-ready       |
| ACC-STD-011  | UC-STD-RAG-KNOWLEDGE-BASE              | standard_mvp              | standard      | admin, student            | experience_closed   | required_l5_release_boundary      | vector provider, storage, real RAG quality, schema/env, and Cost Calibration     |
| ACC-STD-012  | UC-STD-ADMIN-OPS-LOGS                  | standard_mvp              | standard      | ops_admin, super_admin    | experience_closed   | required_l5                       | none                                                                             |
| ACC-ADV-001  | UC-ADV-AUTH-CONTEXT-UPGRADE            | advanced_edition          | advanced      | advanced_student, admin   | experience_closed   | required_l5_release_boundary      | payment, env_secret, Provider, deploy, and Cost Calibration remain blocked       |
| ACC-ADV-002  | UC-ADV-AI-TASK-LIFECYCLE               | advanced_edition          | advanced      | advanced_student, admin   | experience_closed   | required_l5_release_boundary      | Provider, worker, quota, env_secret, deploy, and Cost Calibration remain blocked |
| ACC-ADV-003  | UC-ADV-PERSONAL-AI-QUESTION-GENERATION | advanced_edition          | advanced      | advanced_student          | experience_closed   | required_l5_release_boundary      | Cost Calibration, formal adoption, staging/prod, and Provider remain blocked     |
| ACC-ADV-004  | UC-ADV-PERSONAL-AI-PAPER-GENERATION    | advanced_edition          | advanced      | advanced_student          | experience_closed   | required_l5_release_boundary      | Cost Calibration, formal adoption, staging/prod, and Provider remain blocked     |
| ACC-ADV-005  | UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE  | advanced_edition          | advanced      | org_admin, admin          | experience_closed   | required_l5_release_boundary      | staging/prod, Provider, payment, and Cost Calibration remain blocked             |
| ACC-ADV-006  | UC-ADV-EMPLOYEE-TRAINING-ANSWER        | advanced_edition          | advanced      | employee                  | experience_closed   | required_l5_release_boundary      | staging/prod, Provider, payment, raw answer access, and Cost Calibration         |
| ACC-ADV-007  | UC-ADV-ORG-ANALYTICS-SUMMARY           | advanced_edition          | advanced      | org_admin, admin          | experience_closed   | required_l5_release_boundary      | export, raw sensitive viewer, external-service, deploy, and Cost Calibration     |
| ACC-ADV-008  | UC-ADV-ORG-PORTAL-ADMIN                | advanced_edition          | advanced      | org_admin, admin          | experience_closed   | required_l5_release_boundary      | enterprise implementation, privacy, export, deploy, schema, and UI gates         |
| ACC-ADV-009  | UC-ADV-OPS-AUTH-QUOTA                  | advanced_edition          | advanced      | ops_admin                 | release_blocked     | blocked_by_approval_gate          | AP-02 Cost Calibration, provider measurement, payment, external-service          |
| ACC-ADV-010  | UC-ADV-RETENTION-LOG-GOVERNANCE        | advanced_edition          | advanced      | ops_admin, auditor        | experience_closed   | required_l5_release_boundary      | raw prompt viewer, provider response viewer, hard-delete executor, deploy        |
| ACC-ADV-011  | UC-ADV-FORMAL-CONTENT-SEPARATION       | unified_standard_advanced | cross_cutting | admin, student, org_admin | experience_closed   | required_cross_cutting_l5         | formal adoption into `question` or `paper` requires separate governance review   |
| ACC-AUD-001  | UC-AUDIT-SOURCE-GOVERNANCE             | unified_standard_advanced | audit_only    | auditor, developer        | release_blocked     | audit_only_not_product_acceptance | source governance rewrite and sensitive evidence require fresh approval          |

Future/non-goal and blocked-gate rows from the catalog must remain outside Standard and Advanced MVP completion counts. They are tracked in the AP Gate Table below.

## AP Gate Table

AP gates are release gates, not local MVP acceptance passes. A local MVP may be accepted with these gates open only when the final decision explicitly says local-only and uses `release_gate_not_satisfied` for release questions.

| gateId | Gate name                              | Affected scope or useCaseId                                      | Current boundary                                       | Required approval before execution                                 | Acceptance impact                                                                           | Evidence expectation                                                    |
| ------ | -------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| AP-01  | Provider smoke execution               | Standard/Advanced AI rows, including ACC-STD-009 and ACC-ADV-002 | Real Provider/model call, env_secret, quota, cost      | Fresh Provider/env/cost approval with redaction owner              | Blocks Provider-backed release claims; local fallback may still support local MVP evidence. | Separate Provider smoke evidence; no raw prompt/output/provider payload |
| AP-02  | Ops auth quota Cost Calibration        | UC-ADV-OPS-AUTH-QUOTA                                            | Cost Calibration, provider measurement, payment        | Fresh Cost Calibration, quota, Provider, payment/external approval | Blocks Advanced quota and release readiness.                                                | AP-02 evidence packet with quota/cost decision and redacted summaries   |
| AP-03  | Provider staging execution             | UC-GATE-PROVIDER-STAGING-EXECUTION                               | Provider plus staging/prod/cloud deploy boundary       | Fresh staging, env_secret, Provider, deployment approval           | Blocks staging preview, release candidate, and production release claims.                   | Completed staging approval gate and redacted staging run evidence       |
| AP-04  | Standard AI generation scope change    | UC-FUTURE-STANDARD-AI-GENERATION-NON-GOAL                        | Product scope change for Standard AI generation        | Fresh product scope decision and implementation approval           | Standard MVP must continue to exclude AI question/paper generation until approved.          | Product decision record; not a runtime evidence row                     |
| AP-05  | Standard org self-service scope change | UC-FUTURE-STANDARD-ORG-SELF-SERVICE-NON-GOAL                     | Product/privacy scope change for Standard org portal   | Fresh product, privacy, schema/API/UI approval                     | Standard MVP must keep platform-managed org auth separate from Advanced portal.             | Product decision record; no production organization data                |
| AP-06  | Online payment                         | UC-FUTURE-ONLINE-PAYMENT                                         | Payment, refund, invoice, settlement, external service | Fresh payment/external-service/env/deploy approval                 | Payment remains outside current MVP and release evidence.                                   | Separate payment approval and redacted provider evidence                |
| AP-07  | OCR auto import                        | UC-FUTURE-OCR-AUTO-IMPORT                                        | OCR/parser, storage, provider/external-service, schema | Fresh OCR/parser/storage/schema/provider approval                  | OCR/import remains outside MVP; uploaded/preprocessed content only.                         | Separate OCR approval packet; no full OCR corpus in committed evidence  |
| AP-08  | Org data export                        | UC-FUTURE-ORG-DATA-EXPORT                                        | Export file generation, privacy, object storage        | Fresh export/privacy/object-storage/external-service approval      | Advanced first release permits online summary views only, not export.                       | Separate export approval packet; no raw employee answer or private data |
| AP-09  | Runtime capability list                | UC-FUTURE-RUNTIME-CAPABILITY-LIST                                | Runtime capability implementation, schema, dependency  | Fresh exact-scope implementation approval                          | Runtime capability-list system remains deferred.                                            | Separate exact-scope approval packet                                    |
| AP-10  | Current checkpoint audit repair        | UC-GATE-CURRENT-CHECKPOINT                                       | Code audit repair, source/test/e2e/env/provider gates  | Fresh L1/L2 exact-scope repair approval                            | Current checkpoint findings remain audit context until a scoped repair task exists.         | Separate repair evidence and audit review                               |
| AP-11  | Source governance change               | UC-AUDIT-SOURCE-GOVERNANCE                                       | Source governance rewrite and sensitive evidence       | Fresh source-governance approval                                   | Governance row cannot seed implementation or product acceptance by itself.                  | Source-governance evidence and redaction review                         |

## Module Breakdown

### Module 1: Acceptance Governance And Traceability

Scope:

- Confirm all acceptance rows map to `useCaseId`.
- Track `UC-AUDIT-SOURCE-GOVERNANCE` as audit-only governance evidence, not product acceptance.
- Confirm edition scope is one of `standard`, `advanced`, `cross_cutting`, `future_scope`, `blocked_gate`, or `audit_only`.
- Confirm current execution level is L0, L1, L2, L3, L4, L5, or L6.
- Confirm each blocked gate has `blockedGate` and `nextDecision`.

Primary inputs:

- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Acceptance checks:

- Every required Standard and Advanced use case appears in the acceptance matrix.
- Every release-blocked use case is explicitly marked and not counted as release-ready.
- No result uses informal states such as "looks good" without evidence path.

Evidence required:

- Acceptance matrix file or section.
- Gap list with severity and owner role.
- Decision summary using the allowed decision values.

### Module 2: Standard Account, Session, And Authorization

Scope:

- `UC-STD-ACCOUNT-SESSION`
- `UC-STD-PERSONAL-AUTH-REDEEM`
- `UC-STD-ORG-AUTH-MANAGED`
- Standard login/session behavior.
- Standard `authorization` visibility and purchase/contact boundary.
- No protected content leakage for `unauthenticated_visitor`.

Roles:

- `unauthenticated_visitor`
- `student`
- `ops_admin`

Success path:

- `student` can authenticate and reach allowed Standard surfaces.
- Authorized Standard content is visible only through the intended scope.
- Expired, missing, or mismatched `authorization` returns denial or purchase guidance without leaking content.

Negative checks:

- Direct URL access does not reveal protected `paper`, `question`, report, or analysis content.
- External URL does not expose internal numeric ids.
- Session expiration does not leave stale privileged UI state.

Evidence required:

- Redacted route list and role result.
- Authorization state summary with no secret or credential.
- Denial state evidence for missing or expired auth.

### Module 3: Standard Content And Paper Lifecycle

Scope:

- Standard `question`, `question_option`, `material`, `paper`, `paper_section`, `question_group`, `standard_answer`, `analysis`, and publish lifecycle.
- `UC-STD-QUESTION-MATERIAL-MANAGE`
- `UC-STD-PAPER-LIFECYCLE`
- Content admin review and student visibility boundary.

Roles:

- `content_admin`
- `student`
- `auditor`

Success path:

- `content_admin` can review bounded sample content metadata.
- Published `paper` is visible to an authorized `student`.
- Draft or unpublished content is not visible to `student`.

Negative checks:

- Full paper content is not committed to evidence.
- HTML-native component names and glossary-conflicting names are not introduced by acceptance artifacts.
- Internal `id` values are not used as externally visible URLs.

Evidence required:

- Content label, profession, level, subject, and publish status summary.
- Route or surface evidence for visible and hidden states.
- Audit summary for publish or review actions when runtime approval exists.

### Module 4: Standard Student Learning Flows

Scope:

- Standard `practice`.
- Standard `mock_exam`.
- `UC-STD-PRACTICE`
- `UC-STD-MOCK-EXAM`
- `UC-STD-REPORT-MISTAKE-BOOK`
- `answer_record`.
- `exam_report`.
- `mistake_book`.
- Learning result visibility.

Roles:

- `student`
- `auditor`

Success path:

- `student` starts `practice`, submits answers, and sees appropriate feedback.
- `student` starts `mock_exam`, submits, and sees an `exam_report` or equivalent result surface.
- Wrong answers become available through `mistake_book` or the defined recovery surface.

Negative checks:

- Submitted answers from another `student` are not visible.
- Refresh or resume does not duplicate submitted `answer_record`.
- Report surfaces do not leak full standard answer content beyond intended scope.

Evidence required:

- Flow step table with redacted route names.
- Result status, count, and expected state transitions.
- No raw answer body in committed evidence.

### Module 5: Standard AI And Knowledge Boundary

Scope:

- `UC-STD-AI-SCORING-EXPLANATION`
- `UC-STD-KN-RECOMMENDATION`
- `UC-STD-RAG-KNOWLEDGE-BASE`
- `ai_scoring`
- `ai_explanation`
- `ai_hint`
- `kn_recommendation`
- `model_provider`
- `model_config`
- `prompt_template`
- `knowledge_base`
- `citation`
- `evidence_status`
- `ai_call_log`
- `ai_call_status`

Roles:

- `student`
- `content_admin`
- `auditor`

Success path for local MVP:

- AI-related surfaces show provider-disabled or deterministic local fallback behavior where applicable.
- `evidence_status` and citation boundaries are understandable and do not imply real Provider execution when it did not occur.
- Release-blocked state is visible in the acceptance decision.

Negative checks:

- No real Provider call is made without approval.
- No raw prompt, raw model response, raw generated `ai_explanation`, or provider payload is recorded.
- Weak or missing evidence does not masquerade as sufficient citation support.

Evidence required:

- Provider-disabled state or blocked-gate evidence.
- Local fallback behavior evidence when available.
- Explicit note that real Provider, vector/RAG runtime, and Cost Calibration gates remain blocked.

Standard AI lifecycle checklist:

| Lifecycle item      | Required check                                                                 | Evidence rule                                                            |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `ai_scoring`        | Scoring surface is deterministic fallback or explicitly Provider-disabled.     | Record status and route/surface only; no raw answer or raw score detail. |
| `ai_explanation`    | Explanation surface does not imply real Provider output when Provider is off.  | Record blocked/fallback state; no raw generated explanation.             |
| `ai_hint`           | Hint behavior is unavailable, fallback, or approval-gated.                     | Record state only; no raw hint content from Provider.                    |
| `prompt_template`   | Template governance is visible only as version/name/status metadata.           | Do not record raw prompt body.                                           |
| `model_provider`    | Provider configuration remains disabled or approval-gated.                     | Record provider label and disabled state only; no secret or API key.     |
| `model_config`      | Model config read path is redacted and does not enable real calls.             | Record public config metadata only.                                      |
| `ai_call_status`    | Status is explicit, such as disabled, blocked, fallback, failed, or completed. | Record status, timestamp, and public id only.                            |
| `ai_call_log`       | Log presence and redaction can be audited.                                     | Record summary counts only; no payload, prompt, response, or token.      |
| `kn_recommendation` | Recommendation evidence does not imply real RAG/Provider quality.              | Record `evidence_status` and citation summary only.                      |
| `citation`          | Citation state distinguishes `sufficient`, `weak`, and `none`.                 | No full resource, chunk body, file URL, or private corpus content.       |

Blocked remainder:

- Cost Calibration Gate remains blocked.
- Real Provider and real RAG/vector validation remain outside this plan.

### Module 6: Admin Operations And Audit

Scope:

- Admin surfaces for `authorization`, `redeem_code`, `contact_config`, `audit_log`, and `ai_call_log`.
- `UC-STD-ADMIN-OPS-LOGS`
- Operational visibility and redaction hygiene.

Roles:

- `ops_admin`
- `super_admin`
- `auditor`

Success path:

- Authorized admin roles can see the intended management surfaces.
- `audit_log` and `ai_call_log` views are read-only where expected.
- Redaction rules prevent raw sensitive values from appearing in evidence.

Negative checks:

- Non-admin roles cannot access admin surfaces.
- Plaintext `redeem_code`, token, secret, or raw model payload is not visible in committed evidence.
- Audit summaries are sufficient for accountability without exposing private content.

Evidence required:

- Role permission matrix.
- Redacted log presence summary.
- Evidence hygiene checklist signed by the acceptance executor role.

### Module 7: Advanced Authorization And Personal AI Generation

Scope:

- `UC-ADV-AUTH-CONTEXT-UPGRADE`
- `UC-ADV-AI-TASK-LIFECYCLE`
- `UC-ADV-PERSONAL-AI-QUESTION-GENERATION`
- `UC-ADV-PERSONAL-AI-PAPER-GENERATION`
- `UC-ADV-FORMAL-CONTENT-SEPARATION`
- Advanced edition `authorization`.
- Edition-aware `effectiveEdition` behavior.
- Advanced personal AI generation and enhanced learning boundaries.

Roles:

- `advanced_student`
- `student`
- `ops_admin`
- `auditor`

Success path:

- Advanced-only surfaces are available to `advanced_student` with valid scope.
- Standard `student` cannot access Advanced-only functionality.
- UI behavior aligns with service-layer `effectiveEdition`; UI state is not treated as the authorization boundary.

Negative checks:

- Route tampering does not bypass edition checks.
- Advanced evidence excludes raw prompts, raw generated content, and provider payload.
- Expired or downgraded `authorization` removes Advanced access predictably.

Evidence required:

- Edition comparison matrix.
- Redacted access result by role.
- Explicit Provider-disabled or approval-gated status for generation behavior.

Advanced AI lifecycle checklist:

| Lifecycle item             | Required check                                                                 | Evidence rule                                                              |
| -------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Request creation           | Advanced request surface records a redacted request id or blocked state.       | Do not record raw prompt, full generated content, or private input.        |
| `ai_call_status`           | Task state covers submitted, in-progress, completed, failed, timeout, blocked. | Record status transition summary only.                                     |
| Retry                      | Retry is either deterministic local behavior or explicitly Provider-gated.     | Record retry count/status only; no provider payload.                       |
| Timeout                    | Timeout state is visible and does not leak internal stack or provider detail.  | Record public error class or redacted message only.                        |
| Idempotency                | Duplicate submission does not create uncontrolled duplicate generation.        | Record idempotency key label or duplicate-handling outcome, not raw input. |
| Quota precheck             | Quota check occurs before generation or is blocked by AP-02.                   | Record quota status label only; no pricing or provider measurement output. |
| Formal content separation  | Generated output does not directly write to formal `question` or `paper`.      | Record separation decision and adoption gate status.                       |
| Redacted `ai_call_log`     | Logs show enough metadata for audit without raw generated content.             | Summary counts, statuses, public ids, and timestamps only.                 |
| Provider disabled boundary | Provider disabled state is explicit unless a fresh Provider approval exists.   | Mark `blocked_by_approval_gate` for real Provider quality/cost claims.     |

### Module 8: Advanced Organization Portal, Training, And Analytics

Scope:

- `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
- `UC-ADV-EMPLOYEE-TRAINING-ANSWER`
- `UC-ADV-ORG-ANALYTICS-SUMMARY`
- `UC-ADV-ORG-PORTAL-ADMIN`
- `org_auth`
- `org_tier`
- `organization`
- `employee`
- Organization assignment, employee completion, and analytics summary.

Roles:

- `org_admin`
- `employee`
- `ops_admin`
- `auditor`

Success path:

- `org_admin` can view approved organization training content metadata.
- `employee` can complete assigned learning or assessment flow.
- `org_admin` can see redacted aggregate completion or analytics status.

Negative checks:

- One organization cannot see another organization's `employee` data.
- Employee answer content is not committed as evidence.
- Organization role does not gain system-level admin privilege.

Evidence required:

- Organization label and synthetic employee count.
- Assignment and completion state transitions.
- Redacted aggregate analytics only.

Blocked remainder:

- Organization training is local-only closed in current evidence. It must not be called staging-ready or release-ready without L6 evidence.

### Module 9: Advanced Ops Quota, Retention, And Recovery Governance

Scope:

- `UC-ADV-OPS-AUTH-QUOTA`
- `UC-ADV-RETENTION-LOG-GOVERNANCE`
- Advanced quota, Cost Calibration, retention, recovery, and operational governance boundaries.

Roles:

- `ops_admin`
- `super_admin`
- `auditor`

Success path for local MVP:

- Current blocked state is explicit and traceable.
- Quota and Cost Calibration gaps are not hidden inside a generic pass.
- Retention and recovery gaps are separated from core learning-flow completion.

Negative checks:

- No payment, Provider, or external service is invoked.
- No quota state is inferred from unapproved provider or payment data.
- Hidden-expired or recovery flows are not marked closed without evidence.

Evidence required:

- Blocked-gate table.
- Follow-up decision list.
- Reference to AP gates that remain open.

Blocked remainder:

- Cost Calibration Gate remains blocked.
- Provider, payment, and external-service validation remain blocked.
- Chain-level recovery and hidden-expired local role-flow evidence remain incomplete until separately executed.

### Module 10: Cross-Role Permission, Redaction, And Security Negative Tests

Scope:

- Role-based access boundaries across Standard and Advanced MVP.
- Evidence redaction.
- Data leakage prevention.
- URL and API response shape governance.

Roles:

- All required roles.

Success path:

- Each role can access only the intended surfaces.
- Protected content is unavailable through direct route entry.
- Evidence files contain no secret, token, raw answer, raw Provider payload, full paper, or customer-like private data.

Negative checks:

- Standard role cannot access Advanced-only flows.
- Organization role cannot cross organization boundary.
- Non-admin role cannot access admin `audit_log` or `ai_call_log`.
- API response samples, when captured, follow `{ code, message, data, pagination? }` and do not omit nullable keys.

Evidence required:

- Permission matrix.
- Redaction checklist.
- P0/P1 absence statement with supporting paths.

### Module 11: Preview And Staging Readiness Boundary

Scope:

- Owner preview package readiness.
- Staging acceptance template readiness.
- Release gate clarity.

Roles:

- Acceptance coordinator.
- Evidence redaction reviewer.
- Staging approver.

Success path:

- A future staging run has named role responsibilities in a non-committed or redacted execution packet.
- Environment isolation, secret separation, data mode, and evidence redaction owner are approved before any staging action.
- The outcome remains `blocked_by_approval_gate` until those approvals exist.

Negative checks:

- No staging URL is used without approval.
- No production data is imported.
- No cloud resource, env, secret, or deployment action is taken as part of this local plan.

Evidence required:

- Completed approval gate section in a future staging evidence packet.
- Redacted role assignment summary.
- Explicit `previewReleaseReadyClaim` value.

## L6 Owner Gate

L6 staging or owner preview cannot start until every owner below is named in a non-secret execution packet. Names, emails, and credentials must not be committed unless explicitly redacted and approved.

| Owner key                 | Required before                         | Responsibility                                                                 | Missing-owner impact                         |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| `accountInventoryOwner`   | Any account creation or use             | Inventory reviewer accounts and confirm no production account reuse.           | Blocks L6 execution.                         |
| `accountCreationOwner`    | Any account creation                    | Create only approved non-production accounts after fresh approval.             | Blocks account setup and L6 execution.       |
| `accountDisableOwner`     | Before account use                      | Define reset, disable, and cleanup process for reviewer accounts.              | Blocks account setup and closeout.           |
| `acceptanceReviewerOwner` | Before owner acceptance                 | Own final owner acceptance review and decision wording.                        | Blocks owner acceptance decision.            |
| `sampleDataOwner`         | Before sample data use                  | Confirm data is synthetic or reviewed non-sensitive sample data.               | Blocks L6 data preparation.                  |
| `sourceReviewOwner`       | Before imported or reviewed content use | Approve source metadata and redaction boundaries.                              | Blocks imported/reviewed content use.        |
| `redactionVerifier`       | Before evidence publication             | Verify screenshots, traces, and evidence contain no forbidden material.        | Blocks evidence publication.                 |
| `resetOrSeedOwner`        | Before seed/reset commands              | Own target, backup, rollback, and exact command boundary if seed/reset exists. | Blocks seed/reset; not required if none run. |
| `monitoringOwner`         | Before staging publication              | Confirm application health, auth callback health, and minimum signals.         | Blocks staging publication.                  |
| `incidentOwner`           | Before staging publication              | Own incident triage and escalation during preview.                             | Blocks staging publication.                  |
| `rollbackOwner`           | Before deployment or migration          | Own rollback target, rollback decision, and restore boundary.                  | Blocks deployment/migration rehearsal.       |
| `stopOwner`               | Before staging publication              | Own stop conditions and authority to halt execution.                           | Blocks staging publication.                  |
| `evidenceRedactionOwner`  | Before evidence publication             | Own final redaction signoff for committed and runtime artifact evidence.       | Blocks evidence closeout.                    |
| `stagingResourceOwner`    | Before staging resource action          | Own staging resource boundary, isolation, and non-production confirmation.     | Blocks any staging resource action.          |

Required L6 account classes:

| Account class                 | Purpose                                     | Data boundary                                                      |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `owner_admin_reviewer`        | Review admin and owner acceptance flows.    | Non-production reviewed account only.                              |
| `organization_admin_reviewer` | Review organization admin workflows.        | Synthetic or reviewed non-sensitive organization metadata only.    |
| `student_reviewer`            | Review student `practice` and `mock_exam`.  | Synthetic or reviewed non-sensitive student data only.             |
| `ops_reviewer`                | Review `audit_log` and `ai_call_log` views. | Redacted metadata only; no Provider payload or raw generated data. |

L6 stop conditions:

- Any AP-01 through AP-11 gate claim without its own evidence and approval.
- Provider, env, schema, database, deploy, browser/e2e, dependency, payment, or Cost Calibration action without fresh approval.
- Sensitive raw content, identifier, prompt, generated output, full paper, raw answer, secret, or token exposure.
- Missing named owner for staging resource boundary.
- Preview-ready, release-ready, or production-ready claim before gate evidence exists.

## Execution Phases

### Phase 0: Entry Gate And Scope Freeze

Inputs:

- Current branch.
- Latest `project-state.yaml`.
- Latest `task-queue.yaml`.
- Latest local evidence packets.

Actions:

1. Confirm the acceptance run level: L0 through L2 for local document and automated evidence, or L4 through L6 only with fresh approval.
2. Freeze accepted use case list for the run.
3. Confirm no runtime, Provider, staging, payment, database, or deploy action is being performed unless separately approved.

Exit criteria:

- Scope statement exists.
- Decision values are selected from this document.
- Blocked gates are listed before execution begins.

### Phase 1: Traceability Matrix Preparation

Actions:

1. Create one acceptance row for each required Standard and Advanced use case.
2. Link each row to edition, role, route or surface, expected result, evidence path, and status.
3. Mark known release-blocked rows before any pass/fail decision.

Exit criteria:

- No required use case is missing.
- Every blocked row has `blockedGate` and `nextDecision`.

### Phase 2: Account And Data Preparation Plan

Actions:

1. Inventory required role accounts by label only.
2. Inventory synthetic sample data by label only.
3. Confirm forbidden data is not used.
4. Record account and data owners in the runtime execution packet, not in committed credentials.

Exit criteria:

- No real credential is committed.
- No plaintext `redeem_code` is committed.
- Data source is synthetic or reviewed non-sensitive sample data.

### Phase 3: Automated Local Gates

Required commands for a local L1 static run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
git diff --check
```

Required commands for a local L2 unit and build run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
git diff --check
```

If `npm.cmd run build` is skipped, the run must not be called L2. It can only be reported as L1, L1 plus unit evidence, or `blocked_by_approval_gate` if build execution requires approval in that context.

Optional command only for approved targeted runtime inventory:

```powershell
npm.cmd run test:e2e -- --list
```

Docs-only command set:

```powershell
npx.cmd prettier --check --ignore-unknown <changed-docs>
git diff --check
```

Exit criteria:

- Command, timestamp, branch, and result are recorded in evidence.
- If a command is skipped, the evidence states why.

### Phase 4: Standard MVP Walkthrough

Execution order:

1. Standard account/session/authorization.
2. Standard content and paper lifecycle.
3. Standard student `practice`.
4. Standard student `mock_exam`.
5. Standard result, report, and `mistake_book`.
6. Standard AI/knowledge boundary with Provider disabled unless approved.
7. Standard admin and audit visibility.

Exit criteria:

- Required Standard use cases have evidence.
- `UC-STD-AI-SCORING-EXPLANATION` remains release-blocked unless future approved Provider and Cost Calibration evidence exists.
- No P0/P1 remains.

### Phase 5: Advanced MVP Walkthrough

Execution order:

1. Advanced `authorization` and `effectiveEdition`.
2. Advanced personal learning and AI boundary.
3. Organization portal and `org_auth`.
4. Organization training content lifecycle.
5. Employee assignment and completion.
6. Organization analytics summary.
7. Advanced ops quota and Cost Calibration blocked-gate review.

Exit criteria:

- Required Advanced use cases have evidence.
- `UC-ADV-OPS-AUTH-QUOTA` remains release-blocked unless future approved Cost Calibration, Provider, payment, and external-service evidence exists.
- No P0/P1 remains.

### Phase 6: Permission, Redaction, And Security Sweep

Actions:

1. Run cross-role access matrix checks.
2. Confirm direct-route negative checks.
3. Inspect committed evidence for forbidden data.
4. Record redaction reviewer result.

Exit criteria:

- Evidence Hygiene checklist passes.
- No secret, token, raw prompt, raw response, full paper, full answer, or private data is present.

### Phase 7: Defect Triage And Gap Decision

Actions:

1. Grade every defect P0 through P3.
2. Assign owner role and next decision for each gap.
3. Decide whether the run is `accepted_local_mvp`, `accepted_with_gaps`, `not_accepted`, `blocked_by_approval_gate`, or `release_gate_not_satisfied`.

Exit criteria:

- P0/P1 issues are resolved or the run is not accepted.
- P2/P3 issues have owner role and disposition.
- Blocked gates are visible in the final report.

### Phase 8: Final Acceptance Report

Actions:

1. Write final acceptance evidence.
2. Link command evidence, role-flow evidence, defect list, and decision summary.
3. State explicitly whether the decision is local MVP only or release-related.

Exit criteria:

- Report can be reviewed without private data.
- Claims match evidence level.
- Release gates are not collapsed into local MVP acceptance.

### Phase 9: Optional Staging Preview Approval Package

Actions require fresh approval:

1. Fill approval gate from `docs/05-execution-logs/acceptance/role-based-full-flow/staging-acceptance-template.md`.
2. Confirm staging URL, data isolation, secret separation, and evidence redaction reviewer.
3. Execute staging only after approval is recorded.

Exit criteria:

- Staging decision uses the staging template values.
- `prod` remains untouched.
- No production data import occurs.

## Acceptance Row Template

Use this table shape for the execution evidence:

| Field                 | Required | Description                                                                               |
| --------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `acceptanceId`        | Yes      | Stable local acceptance id, such as `ACC-STD-001`.                                        |
| `useCaseId`           | Yes      | Requirement id from the use case catalog.                                                 |
| `catalogEditionScope` | Yes      | Original `editionScope` from the use case catalog.                                        |
| `editionScope`        | Yes      | `standard`, `advanced`, `cross_cutting`, `future_scope`, `blocked_gate`, or `audit_only`. |
| `role`                | Yes      | Role label from this document.                                                            |
| `routeOrSurface`      | Yes      | Redacted route, page, API family, or admin surface.                                       |
| `expectedResult`      | Yes      | Evidence-bounded expected behavior.                                                       |
| `actualResult`        | Yes      | Observed result or `not_executed` when plan-only.                                         |
| `evidencePath`        | Yes      | Repository path or ignored runtime artifact reference.                                    |
| `status`              | Yes      | `pass`, `fail`, `blocked`, `audit_only`, `not_executed`, or `not_in_scope`.               |
| `defectId`            | No       | Linked defect id when status is `fail`.                                                   |
| `blockedGate`         | No       | Required when status is `blocked`.                                                        |
| `nextDecision`        | No       | Required for blocked or gap rows.                                                         |
| `redactionStatus`     | Yes      | `clean`, `requires_review`, or `rejected_for_sensitive_content`.                          |
| `reviewerRole`        | Yes      | Reviewer role label; do not commit real personal information or credential.               |

Example values:

| acceptanceId | useCaseId                  | catalogEditionScope       | editionScope  | role      | routeOrSurface      | expectedResult                   | actualResult | evidencePath                   | status       | defectId | blockedGate | nextDecision                 | redactionStatus | reviewerRole |
| ------------ | -------------------------- | ------------------------- | ------------- | --------- | ------------------- | -------------------------------- | ------------ | ------------------------------ | ------------ | -------- | ----------- | ---------------------------- | --------------- | ------------ |
| ACC-STD-001  | UC-STD-ACCOUNT-SESSION     | standard_mvp              | standard      | student   | student session     | Authorized session reaches scope | not_executed | future evidence packet section | not_executed |          |             | Execute in approved L5 run   | clean           | auditor      |
| ACC-ADV-009  | UC-ADV-OPS-AUTH-QUOTA      | advanced_edition          | advanced      | ops_admin | quota governance    | Blocked gate remains explicit    | not_executed | future evidence packet section | blocked      |          | AP-02       | Prepare Cost Calibration run | clean           | auditor      |
| ACC-X-001    | cross-role-redaction-sweep | unified_standard_advanced | cross_cutting | auditor   | evidence inspection | No forbidden data committed      | not_executed | future evidence packet section | not_executed |          |             | Execute before closeout      | clean           | auditor      |

## Defect Template

| Field                 | Required | Description                                                            |
| --------------------- | -------- | ---------------------------------------------------------------------- |
| `defectId`            | Yes      | Stable id such as `DEF-20260622-001`.                                  |
| `severity`            | Yes      | `P0`, `P1`, `P2`, or `P3`.                                             |
| `module`              | Yes      | Module name from this document.                                        |
| `role`                | Yes      | Role label.                                                            |
| `reproductionSummary` | Yes      | Short redacted reproduction path.                                      |
| `expected`            | Yes      | Expected behavior.                                                     |
| `actual`              | Yes      | Actual behavior.                                                       |
| `evidencePath`        | Yes      | Redacted evidence path.                                                |
| `ownerRole`           | Yes      | Responsible role, not a committed personal name or credential.         |
| `disposition`         | Yes      | `fix_before_acceptance`, `follow_up`, `accepted_risk`, or `duplicate`. |

## Evidence Hygiene Checklist

| Check                                                                                 | Required result |
| ------------------------------------------------------------------------------------- | --------------- |
| No secret, token, database URL, Auth header, or session cookie                        | `pass`          |
| No plaintext `redeem_code`                                                            | `pass`          |
| No raw Provider payload, raw prompt, raw model response, raw `ai_explanation`         | `pass`          |
| No full paper, full textbook, full OCR content, or full employee answer               | `pass`          |
| No customer-like private data                                                         | `pass`          |
| Runtime screenshots/traces kept in ignored artifact path when runtime approval exists | `pass`          |
| Committed evidence limited to approved documentation and redacted evidence paths      | `pass`          |
| Blocked gates recorded instead of being silently treated as pass                      | `pass`          |
| `previewReleaseReadyClaim` is not set to true without L6/L7 evidence and approval     | `pass`          |
| Standard and Advanced edition boundaries are reviewed through service-layer semantics | `pass`          |

## Validation Command Matrix

Allowed for this docs-only planning task:

```powershell
npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-06-22-mvp-acceptance-execution-plan-documentation.md docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md docs/05-execution-logs/evidence/2026-06-22-mvp-acceptance-execution-plan-documentation.md docs/05-execution-logs/audits-reviews/2026-06-22-mvp-acceptance-execution-plan-documentation.md
git diff --check
```

Required for a future L2 local acceptance refresh:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
git diff --check
```

Allowed only with fresh approval:

```powershell
npm.cmd run test:e2e -- --list
npm.cmd run test:e2e -- <approved-target-spec>
npm.cmd run dev
```

Prohibited without fresh approval:

- `npm.cmd test` when it chains e2e or browser execution.
- Full e2e/browser suite.
- Provider or model calls.
- Real RAG/vector ingestion.
- Payment or external service calls.
- `.env*`, secret, token, or cloud configuration changes.
- Database schema, migration, seed, or production data operation.
- Staging deploy, production deploy, remote Git push, or PR creation.

## Recommended Acceptance Calendar

Use separate packets to avoid mixing scope:

| Day or session | Focus                        | Output                                                      |
| -------------- | ---------------------------- | ----------------------------------------------------------- |
| Session 1      | L0-L2 local evidence refresh | Automated evidence packet and traceability matrix.          |
| Session 2      | Standard MVP L5 walkthrough  | Standard role-flow evidence and defect list.                |
| Session 3      | Advanced MVP L5 walkthrough  | Advanced role-flow evidence and blocked-gate table.         |
| Session 4      | Cross-role and redaction     | Permission matrix, redaction checklist, security sweep.     |
| Session 5      | Decision review              | Final local MVP decision and follow-up package.             |
| Separate run   | Optional L6 staging preview  | Approved staging evidence packet, if fresh approval exists. |

## Implementation Advice

1. Start with L0 through L2 and reuse the current local evidence baseline only as a baseline, not as a fresh pass. If formal acceptance is being held, rerun the selected local commands and write a new evidence packet.
2. Split Standard and Advanced acceptance into separate execution packets. This makes it easier to decide whether Standard MVP can be accepted while Advanced Provider, Cost Calibration, or organization gates remain blocked.
3. Keep all Provider, payment, staging, env, database, and cloud decisions in separate approval packages. Do not mix them into the local MVP acceptance meeting.
4. Assign the full L6 Owner Gate before any L6 run, including account inventory, account creation, account disable, acceptance review, sample data, source review, redaction verification, monitoring, incident, rollback, stop, evidence redaction, and staging resource ownership.
5. Use `accepted_with_gaps` when user-facing MVP flows are locally acceptable but AP gates remain unresolved. Use `release_gate_not_satisfied` whenever someone asks whether the same evidence is enough for preview, staging, or release.
6. Treat `effectiveEdition` as the authority for edition checks. UI-only differences are acceptance evidence for usability, not for authorization correctness.
7. For AI-related flows, record Provider-disabled behavior and blocked gates explicitly. A local fallback can support MVP experience acceptance, but it does not prove real Provider quality, cost, quota, or safety.
8. Before any staging preview, fill the existing staging acceptance template and record approvals for staging URL, resource isolation, secret separation, data mode, and redaction reviewer.
9. Make every defect decision evidence-backed. P0/P1 blocks acceptance; P2/P3 can be accepted only with owner role, next decision, and follow-up scope.
10. Close with a single sentence decision that includes scope, such as `accepted_local_mvp for Standard only`, `accepted_with_gaps for Standard and Advanced local MVP`, or `blocked_by_approval_gate for release`.

## Suggested Final Report Shape

```markdown
# Standard And Advanced MVP Acceptance Report

## Decision

Decision: `accepted_with_gaps`
Scope: local MVP only.
Release claim: none.

## Evidence

- Traceability matrix:
- Automated commands:
- Standard role-flow packet:
- Advanced role-flow packet:
- Permission and redaction packet:

## Blocking Gates

- Cost Calibration Gate:
- Provider:
- Real RAG/vector:
- Payment/external service:
- Staging:
- Production release:

## Defects

| defectId | severity | module | status | disposition |
| -------- | -------- | ------ | ------ | ----------- |

## Evidence Hygiene

Decision:
Reviewer role:
Forbidden data found:
```
