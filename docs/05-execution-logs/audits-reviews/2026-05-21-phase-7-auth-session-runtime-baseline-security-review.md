# Security Review: Phase 7 Auth Session Runtime Baseline

## Metadata

- Task id: `phase-7-auth-session-runtime-baseline`
- Branch: `codex/phase-7-auth-session-runtime-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-21
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/sessions/route.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/local-session-runtime.test.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/mappers/auth-mapper.ts`
- `src/server/mappers/auth-mapper.test.ts`
- `src/server/repositories/auth-repository.ts`
- `src/server/repositories/session-repository.ts`
- `src/server/services/auth-service.test.ts`
- `src/server/services/session-service.ts`
- `src/server/services/session-service.test.ts`
- `src/server/services/user-registration-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-21-phase-7-auth-session-runtime-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-auth-session-runtime-baseline.md`

## Risk Types Reviewed

- `auth`
- `session`
- `authorization`
- `api_contract`
- `local_runtime`

## Abuse Cases Considered

- Missing, malformed, empty, or non-bearer authorization headers must return the existing `401001 Unauthorized.` response.
- Expired or missing session tokens must not query or expose user details.
- Disabled student or admin accounts must not resolve to an authenticated context.
- Password login failures must not reveal whether phone or password failed.
- Student login failure counters must use internal numeric ids only inside the service/repository boundary.
- Admin login currently has no persisted failed-login counter because `admin` has no `login_failed_count`; this is accepted for P0 baseline and must be revisited before broad admin account lifecycle work.
- Session creation deletes existing sessions for the same Better Auth user id before inserting one opaque session token.

## Data Exposure Review

- `GET /api/v1/sessions` returns `user` and `session.expiresAt`; it does not return token, session row id, password hash, auth account rows, cookie internals, or numeric database ids.
- `POST /api/v1/sessions` returns an opaque bearer token for local MVP API use and does not expose token generation internals or session row id.
- Auth DTO fields remain camelCase; database `snake_case` remains inside repository and mapper boundaries.
- `adminPublicId` returns the public admin handle only; it is not treated as authorization proof.
- `adminRoles` contains role names from the approved `admin_role` enum only.

## Authorization Boundary Review

- Runtime resolution requires a valid bearer session before returning user context.
- `publicId` is only mapped into DTOs after session ownership is resolved by Better Auth `auth_user_id`; it is not used as the authorization decision.
- Student context is resolved from active `user` rows.
- Admin context is resolved from active `admin` rows and exposes only `admin_public_id` and `admin_role` values needed for follow-up admin runtime tasks.
- This task does not implement student paper, practice, mock exam, report, audit log, AI log, redeem code, registration, or admin operation authorization.

## API Contract Review

- Route path remains `/api/v1/sessions`.
- Response envelope remains `{ code, message, data }`.
- JSON fields remain camelCase.
- Optional admin fields are returned by the mapper as `adminPublicId: null` and `adminRoles: []` for non-admin users.
- No external URL exposes an auto-increment primary key.

## Test Coverage And Accepted Gaps

- RED/GREEN coverage added in `src/server/auth/local-session-runtime.test.ts`.
- Existing auth/session mapper and service tests were updated for explicit admin context fields.
- Full `npm.cmd run test:unit` passed with `82` files and `278` tests.
- `Invoke-QualityGate.ps1`, `npm.cmd run build`, and `Test-NamingConventions.ps1` passed.
- Accepted gap: no browser or E2E session login flow in this task; Phase 7 queues this after session baseline through student/admin smoke tasks.
