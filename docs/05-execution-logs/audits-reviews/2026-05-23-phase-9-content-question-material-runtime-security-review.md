# Security Review: phase-9-content-question-material-runtime

## Metadata

- Task id: `phase-9-content-question-material-runtime`
- Branch: `codex/phase-9-content-question-material-runtime`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-23`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/questions/**`
- `src/app/api/v1/materials/**`
- `src/app/api/v1/knowledge-nodes/route.ts`
- `src/server/repositories/question-repository.ts`
- `src/server/repositories/material-repository.ts`
- `src/server/repositories/content-knowledge-node-runtime-repository.ts`
- `src/server/repositories/runtime-database.ts`
- `src/server/services/question-service.ts`
- `src/server/services/material-service.ts`
- `src/server/services/content-question-material-runtime.ts`
- `tests/unit/phase-9-content-question-material-runtime.test.ts`

## Risk Types Reviewed

- `content`
- `question`
- `material`
- `audit_log`
- `api_contract`

## Abuse Cases Considered

- Anonymous users call question, material, or knowledge-node APIs and receive content data.
- An `ops_admin` attempts to create or mutate content through content-backend APIs.
- A caller changes `{publicId}` to another resource and receives numeric database ids or internal schema rows.
- A locked question or material is edited through the new runtime.
- A failed content mutation proceeds without an audit trail.
- Audit metadata leaks session tokens, passwords, secrets, raw provider payloads, or request bodies.
- `knowledge-nodes` route is expanded beyond the queued read-only scope and silently activates unaudited mutations.

## Data Exposure Review

- Route parameters remain `publicId`; no external route exposes numeric database `id`.
- Question and material mappers expose camelCase DTOs and do not return `material_id`, `question_id`, `created_by_admin_id`, or `updated_by_admin_id`.
- Knowledge-node list DTO exposes public identifiers, `levelList`, path/name metadata, status, and count metadata only.
- Audit entries store actor public id, role, action type, target public id, result status, IP, and a redacted metadata summary. They do not include request bodies or session tokens.
- Tests assert serialized payloads and audit entries do not include `"id"`, `material_id`, `question_id`, passwords, secrets, or the sample session token.

## Authorization Boundary Review

- New content runtime route handlers call `sessionService.getCurrentSession` before returning content data.
- Admin identity must include `adminPublicId` and at least one valid admin role.
- Content access is restricted to `super_admin` and `content_admin`.
- `ops_admin` receives `403621 Admin permission denied` on protected content operations, with an audit failure entry for mutation attempts.
- Existing service-level locked-resource checks are preserved: locked questions/materials still return conflict errors before update mutation.
- The route layer passes authenticated admin public id into repository mutation context so writes resolve admin ownership through server-side lookup, not client-supplied ids.

## API Contract Review

- REST routes remain under `/api/v1/`.
- Paths remain kebab-case plural nouns.
- JSON keys remain camelCase.
- Response envelopes remain `{ code, message, data, pagination? }`.
- Empty optional fields remain `null`; list responses use `[]`.
- `knowledge-nodes` remains list-only in this task. No hidden create/edit/move/disable route was added.
- No dependency, schema, migration, environment, AI provider, object storage, SMS, email, payment, deployment, or production-resource change was introduced.

## Test Coverage And Accepted Gaps

- Unit tests added for:
  - unauthenticated request rejection;
  - non-content-admin mutation rejection and redacted audit failure;
  - authenticated question/material/knowledge-node responses with public identifiers only;
  - successful question/material mutation audit entries.
- Existing question and material service/route tests continue to pass.
- Full unit, quality gate, build, naming, and final Git inventory results are recorded in evidence.
- Accepted gap: DB-backed repository behavior is not exercised against Docker PostgreSQL in this task; no integration test framework for content CRUD is introduced because dependency/tooling and migration scope are blocked.
- Accepted gap: knowledge-node mutation security is deferred because no mutation routes are in this task's API surface.
- Accepted gap: question knowledge-node/tag persistence remains deferred to later AI/RAG knowledge binding tasks.

## Verdict

`APPROVE`. The implementation replaces unavailable content runtime routes with authenticated, permission-checked, public-id-only API behavior; preserves standard response envelopes; and records redaction-safe audit boundaries for content mutations. Residual gaps are scoped to later queued tasks and do not block this task.
