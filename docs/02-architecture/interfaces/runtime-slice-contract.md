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

## Runtime Replacement Priority

### Required For MVP Slice

These surfaces are priority candidates for Phase 7 runtime replacement:

- `GET /api/v1/sessions`
- `POST /api/v1/users` for local dev registration or seed-supported account setup when needed
- `GET /api/v1/student-papers/scopes`
- `GET /api/v1/student-papers`
- `GET /api/v1/student-papers/{publicId}`
- `POST /api/v1/practices`
- `GET /api/v1/practices/{publicId}`
- `POST /api/v1/practices/{publicId}/answers`
- `POST /api/v1/mock-exams`
- `GET /api/v1/mock-exams/{publicId}`
- `POST /api/v1/mock-exams/{publicId}/answers`
- `POST /api/v1/mock-exams/{publicId}/submit`
- `GET /api/v1/exam-reports`
- `GET /api/v1/exam-reports/{publicId}`
- `GET /api/v1/users`
- `GET /api/v1/questions`
- `GET /api/v1/papers`
- `GET /api/v1/audit-logs`
- `GET /api/v1/ai-call-logs`
- `GET /api/v1/model-configs`

### Mock Runtime Allowed

These surfaces may use deterministic mock runtime while core logging and redaction are verified:

- AI scoring, explanation, hint, and learning suggestion internals.
- `model_config` provider execution.
- `ai_call_log` provider payload summaries.
- RAG citation and chunk evidence when the task explicitly records `evidence_status: none` or `weak`.

Mock runtime must still use project DTOs, standard API response envelopes, and redaction-safe logs.

### Deferred Runtime

These surfaces remain baseline or partial until the first slice passes:

- Full question and paper CRUD beyond seed-supported content.
- Bulk employee import.
- Redeem code batch generation.
- Full mistake book lifecycle.
- Full RAG resource ingestion, chunking, embedding, and vector rebuild.
- Real provider-backed AI calls.
- Admin analytics and export workflows.

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
