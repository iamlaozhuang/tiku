# Phase 8 Admin Redeem Code Runtime Security Review

## Metadata

- Task id: `phase-8-admin-redeem-code-runtime`
- Branch: `codex/phase-8-admin-redeem-code-runtime`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-22`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/redeem-codes/route.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-admin-redeem-code-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-admin-redeem-code-runtime.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Risk Types Reviewed

- `admin`
- `redeem_code`
- `authorization`
- `audit_log`
- `api_contract`
- `secret`

## Abuse Cases Considered

- Unauthenticated caller requests `GET /api/v1/redeem-codes`.
- Authenticated non-admin or missing-admin-context caller attempts to read card-code data.
- `content_admin` attempts to read operational card-code data.
- Caller tampers with `page`, `pageSize`, `sortBy`, `sortOrder`, `status`, or `keyword`.
- Caller searches for a raw card code hoping to reveal plaintext.
- API response accidentally leaks numeric database ids, `code_hash`, auth user ids, session token, password hash, or raw card-code text.

## Data Exposure Review

- API DTOs expose `publicId`, masked `codeDisplay`, `canViewPlainText`, profession, level, status, `redeemedUserPublicId`, and `createdAt`.
- `canViewPlainText` is always `false`.
- Repository maps `used_by_user_id` to `redeemedUserPublicId` and does not return numeric ids.
- `code_hash` is never selected for the admin list response.
- `code_display` is passed through a masking helper before leaving the repository.
- Session tokens, password hashes, auth user ids, and secrets are not returned or logged by this slice.

## Authorization Boundary Review

- Route handler uses the existing `createLocalSessionRuntime` session boundary.
- Missing, invalid, or non-admin sessions receive `401001`.
- `super_admin` and `ops_admin` can read the list.
- `content_admin` receives `403601`.
- `publicId` is not treated as an authorization grant.
- This slice does not add organization-scoped admin tenancy; it follows the current global admin role model used by the preceding Phase 8 admin org_auth runtime.

## API Contract Review

- Route remains under `/api/v1/redeem-codes`.
- Response shape is `{ code, message, data, pagination? }`.
- JSON fields are camelCase.
- Empty optional `redeemedUserPublicId` returns `null`.
- Empty list behavior is repository-driven and returns `redeemCodes: []` with pagination.
- External DTO and URL do not expose numeric auto-increment ids.

## Audit Log Review

- No state-changing operation is activated in this task.
- Generate, cancel, disable, export, or plaintext-view operations remain deferred.
- Because this slice is read-only, it does not write `audit_log`.
- Future mutation routes must include explicit audit writes before merge.

## Test Coverage And Accepted Gaps

- Unit tests cover unauthenticated access, unauthorized admin role denial, standard paginated response shape, public-id-only DTOs, and masked code display.
- Full unit suite, quality gate, build, naming scan, and Git completion inventory were run and recorded in evidence.
- E2E was skipped because no UI or browser flow changed.
- Accepted gap: cancelled/disabled card-code lifecycle states are not covered because the current schema enum only supports `unused`, `used`, and `expired`, and this task is forbidden from schema/migration changes.

## Verdict

`APPROVE`

The implemented read-only runtime satisfies the current task security boundary. Remaining card-code mutation and plaintext/export behavior is intentionally deferred and must receive a separate security review with audit-log coverage.
