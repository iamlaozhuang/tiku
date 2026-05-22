# Phase 8 Student Authorization Redeem Runtime Security Review

## Metadata

- Task id: `phase-8-student-authorization-redeem-runtime`
- Branch: `codex/phase-8-student-authorization-redeem-runtime`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-22
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/authorizations/route.ts`
- `src/app/api/v1/personal-auths/route.ts`
- `src/app/api/v1/redeem-codes/redeem/route.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/services/effective-authorization-route.ts`
- `src/server/services/redeem-code-route.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/repositories/effective-authorization-repository.ts`
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/server/mappers/effective-authorization-mapper.ts`
- `src/server/mappers/authorization-mapper.ts`
- `src/server/validators/redeem-code.ts`
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `src/server/services/redeem-code-authorization-service.test.ts`

## Risk Types Reviewed

- `authorization`
- `personal_auth`
- `redeem_code`
- `audit_log`
- `api_contract`
- `secret`

## Abuse Cases Considered

- Missing or malformed `Authorization` header requests student-specific authorization data.
- Admin session attempts to call student authorization APIs.
- User changes request body or URL to redeem for another user.
- Reuse of a consumed `redeem_code`.
- Inconsistent `redeem_code` row with `status=unused` but `used_by_user_id` or `used_at` already set.
- Expired `redeem_code` redemption attempt.
- Expired, cancelled, disabled-organization, or not-yet-started `authorization` sources showing as effective.
- DTO accidentally returns numeric auto-increment `id`, session token, password hash, or code hash.

## Data Exposure Review

- API DTOs expose `publicId` values only; numeric database `id` remains repository-internal.
- `redeem_code.code_hash`, session token, password hash, and secrets are not mapped to API responses.
- `codeDisplay` is the existing display-safe field; the runtime lookup uses normalized input and repository hashing.
- Responses remain standard `{ code, message, data, pagination? }`.
- JSON fields remain camelCase.
- Optional organization fields use `null`, not empty strings.

## Authorization Boundary Review

- Runtime resolver uses the existing local session runtime through `getCurrentSession`.
- Requests without a valid session return `401001` with `data: null`.
- Admin sessions have `userType: null` and are rejected by the student runtime resolver.
- Service calls receive only the authenticated `userPublicId`; request body cannot override user ownership.
- Effective authorization service filters:
  - `personal_auth.status === active`
  - `org_auth.status === active`
  - `organization.status === active`
  - `starts_at <= now`
  - `expires_at >= now`

## Redeem Code Boundary Review

- Input validation normalizes by trimming and uppercasing and accepts only the existing safe 8-character pattern.
- Missing code returns contract-safe `404001`.
- Used code returns `409002`.
- Expired code or past redeem deadline returns `410001`.
- Inconsistent already-used markers are rejected before repository mutation.
- Repository redemption is transactional and updates `redeem_code` only when `status=unused`, `used_by_user_id is null`, and `used_at is null`.
- Created `personal_auth` belongs to the authenticated user resolved from session.

## API Contract Review

- `/api/v1/authorizations`
- `/api/v1/personal-auths`
- `/api/v1/redeem-codes/redeem`

All route paths use `/api/v1/`, kebab-case, and plural resource names with verb action subpath for redemption. DTO keys are camelCase. No URL exposes auto-increment ids.

## Test Coverage

- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
  - student effective authorization list
  - personal authorization list
  - redeem-code redemption
  - missing session and admin session rejection
  - DTO expected shape without numeric ids
- `src/server/services/redeem-code-authorization-service.test.ts`
  - invalid input
  - missing, used, expired code handling
  - inconsistent already-used markers
  - successful redemption mapping
  - personal authorization list mapping

## Accepted Gaps

- Current schema only defines `redeem_code.status` as `unused`, `used`, and `expired`; `cancelled` or `disabled` redeem-code statuses are not representable without a schema migration, which is blocked for this task.
- `org_auth` scope traversal is minimal and matches direct employee organization membership through `org_auth_organization`; broader descendant-scope behavior remains for the admin organization/auth runtime task.
- No E2E was added because this task changes API runtime only and the student redeem/profile UI is a separate queued task.

## Verdict

`APPROVE`: The implementation satisfies the Phase 8 student authorization/redeem runtime security gate for the scoped API runtime. Accepted gaps are non-blocking and constrained by the task's no-schema-change and no-UI scope.
