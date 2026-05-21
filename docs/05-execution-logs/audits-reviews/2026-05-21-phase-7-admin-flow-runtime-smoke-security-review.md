# Security Review: Phase 7 Admin Flow Runtime Smoke

## Metadata

- Task id: `phase-7-admin-flow-runtime-smoke`
- Branch: `codex/phase-7-admin-flow-runtime-smoke`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-21
- Verdict: APPROVE

## Files Reviewed

- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/app/api/v1/users/route.ts`
- `src/app/api/v1/questions/route.ts`
- `src/app/api/v1/papers/route.ts`
- `src/app/api/v1/audit-logs/route.ts`
- `tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`

## Risk Types Reviewed

- `admin`
- `authorization`
- `audit_log`
- `api_contract`
- `local_runtime`

## Abuse Cases Considered

- Anonymous request attempts to list admin users, questions, papers, or audit logs.
- Student session token attempts to access admin read-view routes.
- Caller attempts to infer numeric database ids from response DTOs.
- Caller attempts to retrieve password, session token, or credential internals through admin list responses.
- Caller expects deferred mutation routes to become live as part of this smoke task.

## Data Exposure Review

- Runtime DTOs expose `publicId` fields only; database numeric `id` values remain repository-local for joins and counts.
- User list response includes public account metadata and authorization status only; password hashes, auth account ids, session tokens, and internal ids are not selected.
- Question and paper read views use summaries and counts; raw database rows are not returned directly.
- `GET /api/v1/audit-logs` returns an empty local-runtime list in this task because no `audit_log` schema is available in the allowed scope. This gap is explicitly deferred to `phase-7-audit-log-runtime-baseline`.

## Authorization Boundary Review

- Runtime routes resolve the current session through `SessionService.getCurrentSession`.
- Admin access requires a non-null `adminPublicId` and at least one registered admin role: `super_admin`, `ops_admin`, or `content_admin`.
- Non-admin or failed session responses return the standard `401001` envelope with `data: null`.
- This task wires read-only GET routes only; state-changing admin routes remain on unavailable runtime.

## API Contract Review

- Responses use the standard `{ code, message, data, pagination? }` envelope through `createErrorResponse` and `createPaginatedResponse`.
- JSON DTO fields remain camelCase.
- Route folders remain kebab-case under `/api/v1/`.
- No external URL exposes numeric auto-increment ids.

## Test Coverage And Accepted Gaps

- Covered by `tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`:
  - unauthenticated admin access denial;
  - authorized admin read smoke for users, questions, papers, and audit logs;
  - absence of numeric `id`, password text, session token text, and unavailable runtime messages in returned payloads.
- Accepted gap: audit log persistence is not implemented in this task because schema and migration files are blocked and the next queued task owns `audit_log` runtime baseline.
