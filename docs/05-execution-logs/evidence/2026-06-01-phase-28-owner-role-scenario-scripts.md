# Phase 28 Owner Role Scenario Scripts

## Summary

- Result: pass.
- Scope: docs_only owner-facing acceptance scripts.
- Changed surfaces: evidence only.
- Gates: scripts prepared from existing evidence; no browser, DB, provider, staging, or fresh validation run.
- Forbidden scope (`forbiddenScope`): no product code, scripts, tests, e2e, env, package/lockfile/dependency, schema/drizzle/migration, DB operation, fresh DB full validation, staging/prod/cloud/deploy, real provider, external service, destructive operation, or sensitive evidence disclosure.
- Residual gaps (`residualGaps`): actual owner walkthrough remains a future human activity.

## Student Role Scripts

### S1 Login And Session

- Purpose: confirm a student can sign in, hold a session, and reach the student surface.
- Prerequisites: synthetic/local/dev student account with active session-capable credentials managed outside evidence.
- Steps: open login, authenticate as student, verify redirect to student home, refresh page, sign out or switch role.
- Expected result: student sees only student-appropriate navigation and cannot access admin-only surfaces.
- Evidence basis: `2026-06-01-phase-22-auth-session-smoke.md`; `2026-06-01-phase-22-student-mvp-smoke.md`.
- Limitation: `local/dev-only`.

### S2 Authorization And Redeem

- Purpose: confirm authorization and redeem flow are understandable to a student.
- Prerequisites: synthetic authorization state and a safe masked redeem token prepared outside evidence; do not record plaintext `redeem_code`.
- Steps: start from no/insufficient authorization, open redeem path, submit approved masked test value during human walkthrough, verify authorization state and access to allowed paper scope.
- Expected result: unauthorized state is clear; successful redemption unlocks the intended scope without exposing internal numeric IDs.
- Evidence basis: Phase 20/21 authorization gap closures; `2026-06-01-phase-22-student-mvp-smoke.md`.
- Limitation: `local/dev-only`; plaintext redeem values must not enter evidence.

### S3 Student Home

- Purpose: confirm home page gives the student a clear next action.
- Prerequisites: synthetic papers, authorization, and recent activity records.
- Steps: open home, inspect available practice/mock entry points, verify empty or unavailable states when scope is missing.
- Expected result: student can distinguish available papers, required authorization, and next action.
- Evidence basis: `2026-06-01-phase-26-runtime-capability-matrix.md`; `2026-06-01-phase-22-student-mvp-smoke.md`.
- Limitation: `fixture-only` for some content volume.

### S4 Practice Flow

- Purpose: confirm a student can complete a practice path.
- Prerequisites: synthetic `paper`, `question`, `question_option`, and active authorization.
- Steps: enter practice, answer objective and supported subjective questions, save/submit, review feedback.
- Expected result: answer progress persists in the local/dev path, scoring/feedback is visible, and wrong answers can feed `mistake_book`.
- Evidence basis: `2026-06-01-phase-22-student-mvp-smoke.md`; `2026-06-01-phase-23-e2e-order-data-isolation-hardening-assessment.md`.
- Limitation: `local/dev-only`; AI quality is `mock-only` unless separately approved.

### S5 Mock Exam Flow

- Purpose: confirm a student can start, answer, submit, and complete a `mock_exam`.
- Prerequisites: synthetic published paper configured for mock use.
- Steps: start mock exam, answer questions, submit, inspect completion state and report entry.
- Expected result: submission completes without exposing internal IDs; timeout/retry behavior remains understandable.
- Evidence basis: `2026-06-01-phase-22-student-mvp-smoke.md`; Phase 26 readiness baseline.
- Limitation: `local/dev-only`; long-running real scoring remains `real-provider-blocked`.

### S6 Exam Report

- Purpose: confirm a student can review `exam_report` output.
- Prerequisites: completed practice/mock attempt with generated report data.
- Steps: open report, inspect score, question review, analysis, and learning suggestion areas.
- Expected result: report is readable and connects the student to review actions.
- Evidence basis: Phase 20 report gap evidence; `2026-06-01-phase-26-runtime-capability-matrix.md`.
- Limitation: analytics quality remains owner-review dependent.

### S7 Mistake Book

- Purpose: confirm wrong answers are visible in `mistake_book`.
- Prerequisites: synthetic wrong answer record generated in local/dev.
- Steps: open mistake book, filter/review an item, navigate back to practice or report context.
- Expected result: mistake entry is present and tied to reviewable question context.
- Evidence basis: `2026-06-01-phase-23-e2e-order-data-isolation-hardening-assessment.md`; Phase 26 readiness baseline.
- Limitation: `local/dev-only`; content diversity may be fixture-limited.

### S8 AI Explanation And Hint

- Purpose: confirm AI explanation and AI hint surfaces are discoverable.
- Prerequisites: mock/local-safe AI runtime configured by existing app mechanisms; no real provider.
- Steps: trigger explanation and hint from supported practice/report contexts; inspect redaction-safe output shape.
- Expected result: UI path exists and output is clearly labeled; no raw prompt, raw student answer, raw model response, provider payload, or secret is exposed in evidence.
- Evidence basis: `2026-06-01-phase-22-ai-scoring-persistence-smoke.md`; Phase 26 readiness baseline.
- Limitation: `mock-only`; real provider quality remains `real-provider-blocked`.

## Admin Role Scripts

### A1 User Management

- Purpose: confirm admin can inspect user accounts and role state.
- Prerequisites: synthetic users for admin, student, employee, and disabled/edge states where available.
- Steps: open user management, search/filter, inspect detail, verify role/status display.
- Expected result: admin sees appropriate account fields without sensitive credential material.
- Evidence basis: Phase 20 user management gap closure; Phase 26 runtime matrix.
- Limitation: `local/dev-only`.

### A2 Organization And Employee

- Purpose: confirm organization hierarchy and employee management are reviewable.
- Prerequisites: synthetic province/city/district organizations and employee examples.
- Steps: browse organization tree, open employees, inspect enable/disable/transfer-related states where present.
- Expected result: hierarchy and employee linkage are understandable.
- Evidence basis: Phase 20 organization/employee evidence; Phase 26 runtime matrix.
- Limitation: owner should validate real hierarchy wording before staging.

### A3 Org Authorization

- Purpose: confirm `org_auth` allocation and scope presentation.
- Prerequisites: synthetic organization authorization with quota/scope examples.
- Steps: inspect org authorization list/detail, verify status, quota, scope, and expiry presentation.
- Expected result: admin can understand authorization status without direct database IDs.
- Evidence basis: Phase 20/21 authorization evidence; Phase 26 readiness baseline.
- Limitation: `local/dev-only`.

### A4 Redeem Code

- Purpose: confirm redeem code batch management is operable.
- Prerequisites: synthetic redeem batch with masked display only.
- Steps: open batch/list/detail, review status and assignment/use state; do not copy plaintext codes into evidence.
- Expected result: admin can manage and audit code state without exposing plaintext `redeem_code`.
- Evidence basis: Phase 20 redeem code evidence; Phase 26 runtime matrix.
- Limitation: sensitive value handling must be reviewed again before staging.

### A5 Question Bank

- Purpose: confirm question creation, classification, and review surfaces.
- Prerequisites: synthetic questions across objective/subjective/fill types with `knowledge_node` and `tag`.
- Steps: list/filter questions, inspect detail, confirm options/scoring/analysis fields.
- Expected result: business terms match glossary and authoring flow is understandable.
- Evidence basis: Phase 20 question evidence; Phase 26 runtime matrix.
- Limitation: content quality remains owner-review dependent.

### A6 Material

- Purpose: confirm material management and references.
- Prerequisites: synthetic materials linked to question/paper flows.
- Steps: browse material list/detail and linked questions or groups.
- Expected result: material context is clear and does not expose raw private content.
- Evidence basis: Phase 3/20 material evidence; Phase 26 baseline.
- Limitation: large file conversion/storage remains future environment-dependent.

### A7 Paper

- Purpose: confirm paper composition, publish, archive/copy boundaries.
- Prerequisites: synthetic paper with sections, questions, and publishable state.
- Steps: inspect draft, composition, publish checks, lifecycle state, and student availability.
- Expected result: paper lifecycle is understandable and blocked states are visible.
- Evidence basis: Phase 20 paper lifecycle evidence; Phase 22 student/admin smoke; Phase 26 baseline.
- Limitation: staging data reset/seed policy remains `staging-blocked`.

### A8 Knowledge Node

- Purpose: confirm knowledge node tree and question binding are reviewable.
- Prerequisites: synthetic `knowledge_node` hierarchy and question bindings.
- Steps: browse tree, inspect bound questions/resources, verify filter behavior.
- Expected result: knowledge structure is understandable for owner review.
- Evidence basis: Phase 20 knowledge binding evidence; Phase 26 runtime matrix.
- Limitation: real taxonomy completeness requires owner content review.

### A9 Resource And Knowledge Base

- Purpose: confirm resource ingestion/index surfaces and knowledge base management.
- Prerequisites: synthetic/local resources and mock embedding/chunk records.
- Steps: inspect resource list, knowledge base state, chunk/citation indicators where surfaced.
- Expected result: admin can see local/mock indexing state and known limits.
- Evidence basis: Phase 20 RAG/resource evidence; Phase 26 runtime matrix.
- Limitation: `mock-only` and `fixture-only`; real provider/vector cloud remains blocked.

### A10 Model Config

- Purpose: confirm model configuration and fallback presentation.
- Prerequisites: local/mock model config records.
- Steps: inspect list/detail, active/default state, fallback configuration, and safe disabled states.
- Expected result: model config is understandable without exposing secrets.
- Evidence basis: Phase 20 model config evidence; Phase 26 readiness baseline.
- Limitation: real provider and secret/env changes remain blocked.

### A11 Audit Log

- Purpose: confirm audit log visibility for admin actions.
- Prerequisites: synthetic admin/user actions that generate audit entries.
- Steps: open audit log, filter by actor/action/time, inspect redaction behavior.
- Expected result: audit data supports owner review without secrets or sensitive payloads.
- Evidence basis: Phase 22 admin smoke; Phase 26 runtime matrix.
- Limitation: staging retention/monitoring policy remains `staging-blocked`.

### A12 AI Call Log

- Purpose: confirm AI call log observability without leaking sensitive AI payloads.
- Prerequisites: mock/local AI calls that generate redacted `ai_call_log`.
- Steps: open AI call log, inspect status, provider/model labels, redaction-safe metadata.
- Expected result: admin sees operational status without raw prompt, raw answer, raw model response, provider payload, token, or secret.
- Evidence basis: `2026-06-01-phase-22-ai-scoring-persistence-smoke.md`; Phase 26 security and blocked gates audit.
- Limitation: `mock-only`; real-provider redaction remains blocked.
