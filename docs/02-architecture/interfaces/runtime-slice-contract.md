# Runtime Slice Contract

## Status

Phase 7 scope anchor for MVP local runtime and integration readiness.

## Purpose

This contract prevents Phase 7 from becoming a broad feature expansion effort. Phase 7 converts selected baseline routes and services into a locally runnable MVP vertical slice. It does not attempt to replace every `createUnavailable...Service()` surface in one pass.

Recovery keywords:

- `runtime_readiness`
- `mvp_vertical_slice`
- `mock_provider_first`
- `seed_idempotent`
- `no_horizontal_feature_expansion`
- `docker_pgvector_dev`

## Sources

- `AGENTS.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`

## Phase 7 Goal

Phase 7 proves that the MVP can run locally against real infrastructure:

- Docker PostgreSQL with pgvector provides the dev database.
- The Next.js app runs on the host first.
- Drizzle migration and migrate workflow is repeatable.
- Dev seed data is deterministic and idempotent.
- Better Auth session runtime provides real `student` and `admin` context.
- Student and admin flows use service/repository boundaries instead of unavailable baseline services.
- `audit_log` and `ai_call_log` are produced by real request paths.
- AI uses a mock provider first, so redaction and logging are verified before real provider credentials are introduced.

## Non-Goals

- No horizontal feature expansion.
- No attempt to replace every unavailable route in one task.
- No real AI provider until the mock provider and `ai_call_log` redaction path pass validation.
- No full RAG ingestion before the runtime slice and mock AI logging are stable.
- No production deployment.
- No app containerization until host-run local runtime passes.
- No dependency change unless a task passes the dependency introduction gate with explicit `human approval`.
- No `drizzle-kit push`; use generated migrations and migrate workflow.

## MVP Vertical Slice

The first runtime slice is intentionally narrow:

1. Dev database starts and accepts migrations.
2. Seed creates:
   - one `super_admin`
   - one `student`
   - one `organization`
   - one valid `authorization`
   - one published `paper` with answerable objective content
   - minimal `model_config` metadata for mock AI
3. Student flow:
   - login
   - authorized paper scope
   - paper list/detail
   - practice or mock exam start
   - answer submission
   - report generation or report placeholder consistent with the contract
4. Admin flow:
   - login as `super_admin`
   - user/content/log read views
   - one safe admin action writes `audit_log`
5. AI mock flow:
   - mock provider call
   - `ai_call_log` write
   - redacted log read through admin surface

## Inventory Method

Runtime inventory is based on:

- `rg "createUnavailable" src/app src/server`
- Unique `createUnavailable...` factory names under `src/server/auth` and `src/server/services`
- API route files under `src/app/api/v1`

Current inventory baseline:

- 24 unavailable runtime factories.
- 62 API route files under `src/app/api/v1`.
- Some factories cover both MVP-required methods and deferred methods. Future runtime tasks must replace those surfaces method-by-method instead of wiring an entire broad service when only a narrow route is in scope.

## Runtime Replacement Priority

### Required For MVP Slice

These surfaces are priority candidates for Phase 7 runtime replacement. They are the only route groups allowed to move from unavailable baseline to real local runtime before the first MVP slice evidence passes.

| Priority       | Factory surface                                                                     | Route inventory                                                                                                                                           | Depends on                                                                                             | Follow-up task                                                                                                             | Constraints                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| P0             | `createUnavailableSessionRouteHandlers`                                             | `GET /api/v1/sessions`; `POST /api/v1/sessions`                                                                                                           | Dev database, seed users, Better Auth session boundary                                                 | `phase-7-auth-session-runtime-baseline`                                                                                    | Must resolve `student` and `admin` context without exposing session token internals.                                          |
| P0 conditional | `createUnavailableUserRegistrationRouteHandlers`                                    | `POST /api/v1/users`                                                                                                                                      | Dev database, credential adapter, decision whether seed-only account setup is enough                   | `phase-7-auth-session-runtime-baseline` or later split task                                                                | Prefer seed-supported accounts for the first slice. Wire registration only if the task records why seed data is insufficient. |
| P1             | `createUnavailableStudentPaperService`; `createUnavailableStudentPaperUserResolver` | `GET /api/v1/student-papers/scopes`; `GET /api/v1/student-papers`; `GET /api/v1/student-papers/{publicId}`                                                | Auth session, effective `authorization`, published seed `paper`                                        | `phase-7-student-flow-runtime-smoke`                                                                                       | Must filter by effective authorization before listing or detail lookup.                                                       |
| P1             | `createUnavailablePracticeService`; `createUnavailablePracticeUserResolver`         | `POST /api/v1/practices`; `GET /api/v1/practices/{publicId}`; `POST /api/v1/practices/{publicId}/answers`                                                 | Auth session, effective `authorization`, published seed `paper`, answerable objective content          | `phase-7-student-flow-runtime-smoke`                                                                                       | `restart` and `terminate` practice routes stay deferred until core start/detail/answer flow passes.                           |
| P1             | `createUnavailableMockExamService`; `createUnavailableMockExamUserResolver`         | `POST /api/v1/mock-exams`; `GET /api/v1/mock-exams/{publicId}`; `POST /api/v1/mock-exams/{publicId}/answers`; `POST /api/v1/mock-exams/{publicId}/submit` | Auth session, effective `authorization`, published seed `paper`, deterministic scoring/report behavior | `phase-7-student-flow-runtime-smoke`                                                                                       | `terminate` route stays deferred unless needed for smoke-test cleanup.                                                        |
| P1             | `createUnavailableExamReportService`; `createUnavailableExamReportUserResolver`     | `GET /api/v1/exam-reports`; `GET /api/v1/exam-reports/{publicId}`                                                                                         | Practice or mock exam submission, report generation placeholder or real report model                   | `phase-7-student-flow-runtime-smoke`                                                                                       | `retry-learning-suggestion` stays mock/deferred until mock AI logging is available.                                           |
| P2             | `createUnavailableAdminUserOrgAuthOpsService`                                       | `GET /api/v1/users`                                                                                                                                       | Auth session, `super_admin` seed, admin role resolver                                                  | `phase-7-admin-flow-runtime-smoke`                                                                                         | `reset-password`, redeem code list, and broad organization auth operations are not part of the first read-view slice.         |
| P2             | `createUnavailableAdminContentKnowledgeOpsService`                                  | `GET /api/v1/questions`; `GET /api/v1/papers`                                                                                                             | Auth session, `super_admin` seed, seed question and paper content                                      | `phase-7-admin-flow-runtime-smoke`                                                                                         | `resources`, `knowledge-nodes`, and vector rebuild routes stay deferred.                                                      |
| P2             | `createUnavailableAdminAiAuditLogOpsService`                                        | `GET /api/v1/audit-logs`; `GET /api/v1/ai-call-logs`; `GET /api/v1/model-configs`                                                                         | Auth session, `super_admin` seed, audit log writer, mock AI call log writer                            | `phase-7-admin-flow-runtime-smoke`; `phase-7-audit-log-runtime-baseline`; `phase-7-ai-mock-provider-and-log-runtime-smoke` | Model config enable/disable and AI log summary require separate permission and redaction review.                              |

### Mock Runtime Allowed

These surfaces may use deterministic mock runtime while core logging and redaction are verified:

- AI scoring, explanation, hint, and learning suggestion internals.
- `model_config` provider execution.
- `ai_call_log` provider payload summaries.
- RAG citation and chunk evidence when the task explicitly records `evidence_status: none` or `weak`.

Mock runtime must still use project DTOs, standard API response envelopes, and redaction-safe logs.

| Factory surface                                                                   | Route inventory                                                                       | Mock allowance                                                                                              | Required guardrail                                                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `createUnavailableExamReportService`; `createUnavailableExamReportUserResolver`   | `POST /api/v1/exam-reports/{publicId}/retry-learning-suggestion`                      | May return deterministic mock learning suggestion after `ai_call_log` redaction path exists.                | Must not call real provider or expose raw answer/prompt content.                              |
| `createUnavailableMistakeBookService`; `createUnavailableMistakeBookUserResolver` | `POST /api/v1/mistake-books/{publicId}/ai-explanation`                                | May return deterministic mock `ai_explanation` after the user ownership check and log redaction path exist. | Must not fabricate citations; use `evidence_status: none` or `weak` when retrieval is absent. |
| `createUnavailableAdminAiAuditLogOpsService`                                      | `GET /api/v1/ai-call-logs/summary`                                                    | May summarize seeded/mock `ai_call_log` rows.                                                               | Must aggregate redacted log rows only.                                                        |
| AI service internals without `createUnavailable...` factories                     | `ai_scoring`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `kn_recommendation` | Mock provider first.                                                                                        | Must write `ai_call_log` before any real provider integration.                                |

### Deferred Runtime

These surfaces remain baseline or partial until the first slice passes:

| Factory surface                                                                                         | Route inventory                                                                                                                                                 | Deferred reason                                                                                                       | Earliest prerequisite                                                  |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `createUnavailableQuestionService`                                                                      | `POST /api/v1/questions`; `GET/PATCH /api/v1/questions/{publicId}`; `POST /api/v1/questions/{publicId}/disable`; `POST /api/v1/questions/{publicId}/copy`       | Full question CRUD is horizontal content expansion. MVP read views can use admin content read service and seed data.  | Admin read smoke passes and a later content-management task is queued. |
| `createUnavailablePaperDraftService`                                                                    | `POST /api/v1/papers`; `GET/PATCH/DELETE /api/v1/papers/{publicId}`; publish/archive/copy; paper question add/update/delete                                     | Full paper CRUD and publish workflow are broader than seed-supported content.                                         | Dev seed baseline and admin read smoke pass.                           |
| `createUnavailableMaterialService`                                                                      | `GET/POST /api/v1/materials`; `GET/PATCH /api/v1/materials/{publicId}`; copy/disable                                                                            | Material CRUD is not needed for the first answerable paper slice.                                                     | Question/paper CRUD task is approved.                                  |
| `createUnavailablePaperAssetService`                                                                    | `GET/POST /api/v1/paper-assets`; `GET/DELETE /api/v1/paper-assets/{publicId}`                                                                                   | Asset upload/download needs object storage or local storage policy.                                                   | Object storage boundary and file scanning policy are documented.       |
| `createUnavailableOrganizationAuthService`                                                              | `POST /api/v1/org-auths`; `POST /api/v1/org-auths/{publicId}/cancel`; `PATCH /api/v1/organizations/{publicId}`; `POST /api/v1/organizations/{publicId}/disable` | Organization and org authorization mutation is high-risk admin work.                                                  | Admin auth boundary and audit log writer pass.                         |
| `createUnavailableEmployeeAccountService`                                                               | `POST /api/v1/employees`                                                                                                                                        | Employee provisioning is not part of the first `super_admin` and `student` seed slice.                                | Organization runtime and audit logging pass.                           |
| `createUnavailableRedeemCodeAuthorizationService`; `createUnavailableAuthorizationUserResolver`         | `GET /api/v1/personal-auths`; `POST /api/v1/redeem-codes/redeem`                                                                                                | First slice uses seeded effective authorization, not redeem-code onboarding.                                          | Session runtime and authorization expiration-state tests pass.         |
| `createUnavailableEffectiveAuthorizationService`; `createUnavailableEffectiveAuthorizationUserResolver` | `GET /api/v1/authorizations`                                                                                                                                    | User-facing authorization list is separate from the internal authorization filter required by student paper services. | Internal authorization filter is implemented and tested.               |
| `createUnavailableMistakeBookService`; `createUnavailableMistakeBookUserResolver`                       | `GET /api/v1/mistake-books`; detail, favorite, unfavorite, mark-mastered, remove                                                                                | Full mistake book lifecycle is post-report product scope.                                                             | Student report flow and mock AI log flow pass.                         |
| `createUnavailableAdminContentKnowledgeOpsService`                                                      | `GET /api/v1/resources`; `GET /api/v1/knowledge-nodes`; `POST /api/v1/resources/{publicId}/rebuild-vector`                                                      | Knowledge ops and vector rebuild require RAG ingestion and pgvector readiness.                                        | Mock AI log and database vector strategy pass.                         |
| `createUnavailableAdminUserOrgAuthOpsService`                                                           | `GET /api/v1/redeem-codes`; `POST /api/v1/users/{publicId}/reset-password`; broad organization listing beyond MVP read views                                    | Redeem code and password reset surfaces require additional abuse-case coverage.                                       | Audit log writer and admin permission tests pass.                      |
| `createUnavailableAdminAiAuditLogOpsService`                                                            | `POST /api/v1/model-configs/{publicId}/enable`; `POST /api/v1/model-configs/{publicId}/disable`                                                                 | Model config mutation can affect provider cost and secret usage.                                                      | Mock provider logging and explicit model config permission task pass.  |

### Blocked By Dependency Or Environment

These surfaces are not allowed to move to real runtime until the named dependency or environment boundary is explicitly available:

| Factory surface                                                                          | Blocking dependency or environment                                          | Runtime constraint                                                                                |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `createUnavailableSessionRouteHandlers`                                                  | Dev PostgreSQL, Better Auth schema/session adapter, local-only auth secret  | No session runtime without isolated `dev` database and local secret boundary.                     |
| `createUnavailableUserRegistrationRouteHandlers`                                         | Credential adapter and account setup strategy                               | Do not wire public registration if seeded local accounts satisfy the first slice.                 |
| `createUnavailablePaperAssetService`                                                     | Object storage bucket/prefix or approved local file storage policy          | No file upload route without path, size, type, and cleanup rules.                                 |
| `createUnavailableAdminContentKnowledgeOpsService` for vector rebuild                    | pgvector availability, embedding strategy, RAG ingestion plan               | No vector rebuild without deterministic chunking and `evidence_status` rules.                     |
| `createUnavailableAdminAiAuditLogOpsService` for provider-affecting model config actions | AI provider env vars, secret policy, mock-provider evidence                 | No real provider enablement before mock log redaction passes.                                     |
| `createUnavailableRedeemCodeAuthorizationService`                                        | Effective authorization persistence and redeem code lifecycle state machine | No redeem route without active, expired, used, cancelled, disabled, and not-yet-started coverage. |

### Split Or Confirmation Risks

These items need explicit confirmation in the follow-up task plan before code changes:

- Practice and mock exam are both listed in the Phase 7 queue. If implementation time forces a narrower first smoke path, the task must record whether `practice` or `mock_exam` is the primary answer-submission path and why the other remains deferred.
- `GET /api/v1/papers` and `GET /api/v1/questions` can be served through admin read-view services, while paper/question CRUD factories remain deferred.
- `POST /api/v1/users` is conditional. Seed-supported accounts are preferred unless a later task records a local registration requirement.
- Any route group that combines reads and writes must be wired method-by-method. Import replacement alone is not sufficient evidence that only MVP-safe methods became live.
- Public identifiers remain lookup handles only. Every route with `{publicId}` still needs ownership, role, or scope checks in the service layer.

## Auth And Authorization Boundary

Every runtime replacement task must define and verify:

- authenticated session source
- `student` or `admin` role resolution
- organization scope when applicable
- effective `authorization` filtering for student content
- public identifier lookup combined with ownership and scope checks
- no numeric auto-increment `id` in external URLs or DTOs

`publicId` is only a lookup handle. It is never an authorization mechanism.

## Audit And AI Log Boundary

Runtime actions must write logs through service-level boundaries:

- High-risk admin actions write `audit_log`.
- Mock AI calls write `ai_call_log`.
- Logs are redaction-safe before persistence and before API response mapping.
- Secrets, password hashes, session tokens, API keys, raw prompts, raw answers, raw chunks, raw provider payloads, and raw provider errors are not returned to clients.

## Validation Expectations

Phase 7 tasks should prefer these gates:

- `Test-TaskClaimReadiness.ps1`
- `Test-AgentSystemReadiness.ps1`
- `Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `Test-NamingConventions.ps1` for API/service/contract/route work
- Docker database start and health check for database runtime tasks
- migration/migrate command for migration tasks
- seed idempotency command for seed tasks
- focused unit and integration tests
- one or more Playwright E2E smoke tests for final local readiness

Do not claim full MVP runtime readiness until the local E2E readiness evidence task records the completed student, admin, audit, and mock AI flows.
