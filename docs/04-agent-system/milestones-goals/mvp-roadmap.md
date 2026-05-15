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
