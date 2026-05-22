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
