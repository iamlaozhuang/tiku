# MVP Roadmap

## Status

Draft for Phase 0.

## Phase 0: Architecture Freeze

Primary deliverables:

- Accepted runtime architecture ADR for Web-first and future multi-client delivery.
- Accepted workplace desktop Web compatibility ADR.
- Global DB/API skeleton covering entity names, ID strategy, API response format, and cross-module invariants.
- Agent automation SOPs, project state, task queue, script skeleton, local gates, and execution evidence.

Dependency order:

- Starts from ADR-001 technology stack selection.
- Must complete before Phase 1 foundation work starts.

## Phase 1: Foundation

Primary deliverables:

- Next.js App Router project baseline aligned with ADR-001 and ADR-002.
- Shared Design Tokens, lint, typecheck, formatting, and local quality gates.
- Server directory boundaries for API route handlers, services, repositories, models, validators, contracts, and mappers.
- Environment configuration, logging baseline, and audit-ready project conventions.

Dependency order:

- Depends on Phase 0 architecture freeze and automation state.
- Must complete before user auth, question paper, and student workflows introduce business contracts.

## Phase 2: User Auth

Primary deliverables:

- Better Auth integration with `user`, `student`, `admin`, `organization`, and `employee` concepts.
- Role and organization boundary for admin and student access.
- Session, authorization, personal auth, org auth, and redeem code foundations.
- API and Web entrypoints that use the standard response contract.

Dependency order:

- Depends on Phase 1 foundation and quality gates.
- Must complete before protected question paper, mock exam, and admin operations.

## Phase 3: Question Paper

Primary deliverables:

- Question, question option, material, question group, paper, paper section, and paper asset data model.
- Paper publishing workflow with immutable published snapshots.
- REST API and service layer for question paper management.
- Admin-facing management screens using the established desktop-first admin shell.

Dependency order:

- Depends on Phase 2 auth for admin permissions and audit ownership.
- Must complete before student practice and mock exam workflows.

## Phase 4: Student Experience

Primary deliverables:

- Student practice, mock exam, answer record, exam report, and mistake book workflows.
- Mobile-first student UI with loading, empty, and error states.
- Mock exam submission and report generation based on published paper snapshots.
- Learning progress views that can later consume AI and RAG outputs.

Dependency order:

- Depends on Phase 3 published paper contracts.
- Must complete before AI scoring and knowledge recommendation workflows become user-visible.

## Phase 5: AI/RAG

Primary deliverables:

- AI scoring, AI explanation, AI hint, and knowledge recommendation services.
- Knowledge base, resource, chunk, embedding, and citation model.
- Model provider, model config, and prompt template management.
- Evidence status handling so RAG citations are not fabricated.

Dependency order:

- Depends on Phase 4 answer records and exam reports.
- Extends Phase 3 question paper and Phase 4 student experience without changing their public contracts.

## Phase 6: Admin Ops

Primary deliverables:

- Admin operations dashboard for audit log, AI call log, model configuration, content operations, and quality monitoring.
- Organization operations views for province, city, and district org tiers.
- Controlled maintenance workflows for high-risk changes and evidence review.
- Reporting workflows for adoption, usage, scoring quality, and operational exceptions.

Dependency order:

- Depends on Phase 2 auth, Phase 3 content management, Phase 4 student activity, and Phase 5 AI/RAG telemetry.
- Completes the MVP operational loop after core learning and AI workflows are stable.

## Phase 7: MVP Local Runtime And Integration Readiness

Primary deliverables:

- `runtime_readiness` transition from baseline contracts to a locally runnable MVP vertical slice.
- Docker PostgreSQL with pgvector as the local `dev` database baseline (`docker_pgvector_dev`).
- Repeatable Drizzle migration and migrate workflow; `drizzle-kit push` remains forbidden.
- Deterministic and `seed_idempotent` dev seed data for one `super_admin`, one `student`, one `organization`, one effective `authorization`, one published `paper`, and mock AI metadata.
- Better Auth session runtime for real `student` and `admin` contexts.
- `mvp_vertical_slice` covering student login, authorized paper access, practice or mock exam answer submission, report visibility, admin login, admin read views, one audited admin action, and mock AI call logging.
- Runtime slice contract at `docs/02-architecture/interfaces/runtime-slice-contract.md`.
- Local E2E readiness evidence that proves the student, admin, `audit_log`, and mock `ai_call_log` flows.

Non-goals:

- `no_horizontal_feature_expansion`: do not add broad new product features.
- Do not replace every `createUnavailable...Service()` surface in one task.
- Do not connect a real AI provider before the mock provider and log redaction chain pass validation (`mock_provider_first`).
- Do not implement full RAG ingestion before the MVP runtime slice is stable.
- Do not containerize the Next.js app before host-run local runtime passes.
- Do not introduce dependencies without the dependency introduction gate and explicit `human approval`.
- Do not deploy to production or modify production data.

Dependency order:

- Depends on Phase 6 admin ops readiness closeout.
- Starts with documentation and runtime slice inventory before any runtime wiring.
- Database migration and seed baseline must land before auth/session runtime.
- Auth/session runtime must land before student and admin flow smoke tests.
- Mock AI logging and audit logging must be validated before real provider or RAG work.

## Phase 8: Product Surface Completion

Primary deliverables:

- Phase 8 product surface contract at `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`.
- Student login/session UI runtime that replaces the placeholder login page for local MVP validation.
- Student profile, authorization, redeem code, and `mistake_book` surfaces that no longer fail as 404 for MVP-visible navigation.
- Admin organization, `org_auth`, employee, and `redeem_code` local runtime slices with security review and audit boundaries.
- Admin UI pages for enterprise authorization and card code operations after runtime slices are available.
- Browser-level verification evidence that separates UI coverage from API/database helper checks.

Non-goals:

- Do not add production deployment, staging deployment, or external resource operations.
- Do not introduce dependencies without dependency gate approval.
- Do not connect real AI providers; continue using the mock provider unless a separate approved task changes that boundary.
- Do not implement full RAG ingestion or broad content CRUD in the same task family.
- Do not weaken auth, authorization, audit, or redaction contracts to make browser checks pass.

Dependency order:

- Depends on Phase 7 local runtime readiness and closeout.
- Starts with planning and queue seeding before any implementation.
- Student login/session UI runtime is first because later browser verification depends on role switching.
- Student authorization/redeem runtime precedes the student profile/redeem UI task.
- Student `mistake_book` runtime precedes the student `mistake_book` UI task.
- Admin organization and `org_auth` runtime precedes admin enterprise authorization UI.
- Final browser verification runs after the student and admin product surfaces exist.

## Phase 9: MVP Acceptance Completion

Primary deliverables:

- Phase 9 MVP acceptance contract at `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`.
- Requirements-to-runtime gap inventory that maps `epic-01` through `epic-06` to implemented routes, services, UI pages, tests, and known residual gaps.
- Completed student mobile-first Web flows for registration/login, authorization, home, practice, mock exam, scoring status, exam report, profile, redeem code, and mistake book.
- Completed admin PC Web flows for operations and content management, including users, organizations, employees, org auth, redeem codes, questions, materials, papers, resources, knowledge nodes, model configs, audit logs, and AI call logs.
- Mock-provider-first AI and RAG runtime that supports scoring, explanation, hint, knowledge recommendation, resource lifecycle, chunking, `evidence_status`, citation display, and redacted `ai_call_log` evidence.
- REST API contract verification for the future multi-client boundary without implementing a mini program client.
- Final MVP browser/API acceptance evidence proving current in-scope requirements are runnable or explicitly deferred with product approval.

Non-goals:

- Do not deploy or modify production resources.
- Do not connect real SMS, email, payment, production credentials, real AI providers, or public object storage without a separate approved task.
- Do not implement WeChat mini program UI unless the queue is explicitly updated with human approval.
- Do not introduce dependencies without the dependency introduction gate and human approval.
- Do not bypass auth/session runtime, expose auto-increment IDs, or leak tokens, passwords, secrets, API keys, `code_hash`, raw prompts, raw answers, or raw model responses.

Dependency order:

- Depends on Phase 8 product surface completion and browser verification closeout.
- Starts with planning and queue seeding, then a requirements-to-runtime gap inventory before any feature implementation.
- Runtime tasks precede their corresponding UI completion tasks.
- AI/RAG tasks must remain mock-provider-first until redaction, audit, and dependency gates are complete.
- Final browser/API acceptance runs only after student, admin, AI/RAG, and REST contract verification tasks are closed.

Closeout status:

- Phase 9 local MVP acceptance is closed by `docs/05-execution-logs/evidence/2026-05-23-phase-9-closeout-release-readiness.md`.
- Release readiness is limited to local `dev` MVP acceptance and owner review. Production, staging, real provider, deployment, and customer-network acceptance require separate approved tasks.

## Phase 10: Local Release Candidate Hardening

Primary deliverables:

- Phase 10 local release candidate contract at `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`.
- Fresh local checkout readiness proof for Docker PostgreSQL, migration/seed workflow, quality gates, build, and E2E.
- Local database rebuild and seed rehearsal that proves the MVP can be recreated without production data.
- Local dry run for real教材/试卷/resource inputs without committing sensitive source files or large verbatim content.
- Real `model_provider` safety plan for local `dev` API key handling, feature flags, cost/volume limits, failure handling, and evidence redaction.
- Local real-provider smoke tests for AI scoring, AI explanation, AI hint, `kn_recommendation`, and `ai_call_log` redaction after explicit human approval.
- Local RAG smoke tests with real content for resource lifecycle, chunking, retrieval, `evidence_status`, `citation`, authorization filtering, and non-fabrication guarantees.
- Final local MVP acceptance rerun after real-content and optional real-provider smoke tests.

Non-goals:

- Do not deploy or configure cloud servers.
- Do not create, modify, or connect staging/prod resources.
- Do not commit `.env.local`, API keys, secrets, raw prompts, raw answers, raw model responses, full教材/试卷 files, or long content excerpts.
- Do not introduce dependencies, schema changes, migrations, or external service configuration without the required gate and explicit human approval.
- Do not implement WeChat mini program UI or production release workflows in this phase.

Dependency order:

- Depends on Phase 9 local MVP acceptance closeout.
- Starts with planning and queue seeding before any local RC hardening task.
- Fresh checkout and database rebuild rehearsal precede real content and real provider tests.
- Real provider smoke testing requires a safety plan and explicit human approval before any credential is used.
- Final local MVP acceptance rerun happens only after real-content and approved provider smoke tests are recorded.

Closeout status:

- Phase 10 is blocked, not closed, by `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-mvp-acceptance-rerun-closeout.md`.
- Local release candidate hardening is validated through planning, fresh checkout, database rebuild, redacted real-content metadata dry run, provider safety planning, and one bounded local DeepSeek smoke.
- Final local MVP acceptance rerun is deferred because `phase-10-local-rag-real-content-smoke-test` is blocked by missing allowed runtime/import scope for real-content RAG validation.
- Next required action is an explicit follow-up task with allowed runtime/import files or an approved pre-seeded local dev fixture/data set for real-content RAG smoke.
