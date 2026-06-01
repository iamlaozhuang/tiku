# Authorization Overlap Concurrency Proof Security Review

## Metadata

- Task id: `phase-21-authorization-overlap-concurrency-proof`
- Branch: `codex/phase-21-authorization-overlap-concurrency-proof`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-06-01
- Verdict: APPROVE pending completion of declared validation commands.

## Files Reviewed

- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `tests/unit/phase-21-authorization-overlap-concurrency-proof.test.ts`
- `docs/05-execution-logs/evidence/2026-06-01-authorization-overlap-concurrency-proof.md`

## Risk Types Reviewed

- `admin_ops`
- `transaction_concurrency`
- `authorization`
- `data_contract`
- `local_human_verification`
- `evidence_integrity`

## Abuse Cases Considered

- Racing two org_auth creations with the same organization, `auth_scope_type`, `profession`, `level`, and effective date range.
- Using a different organization to bypass overlap checks.
- Using a different `auth_scope_type`, `profession`, or `level` to incorrectly collide or bypass.
- Boundary date ranges that touch, overlap, or do not overlap.
- Returning non-envelope conflict errors.
- Leaking internal numeric ids or authorization internals in conflict responses.

## Data Exposure Review

- Conflict responses continue to use the standard `{ code, message, data }` envelope.
- The overlap conflict path returns `409005` with `data: null`; it does not expose internal numeric `id`, matched organization IDs, lock keys, or existing authorization details.
- The implementation only uses `publicId` at the service/API boundary.

## Authorization Boundary Review

- The changed path is limited to `org_auth.create`, which is already guarded by `requireOrgAuthManager(...)`.
- No admin role expansion was introduced.
- No employee import, redeem_code, model config, organization mutation, or other write path was changed.

## API Contract Review

- Existing envelope format is preserved.
- Existing `orgAuthScopeOverlapResponse` (`409005`) is reused for overlap conflicts, including the racing-write case after repository create returns `null`.
- JSON field naming remains camelCase; no snake_case JSON fields were added.

## Test Coverage And Accepted Gaps

- Focused source-level proof covers:
  - all approved overlap dimensions in the repository predicate;
  - transaction-scoped advisory lock and overlap recheck before insert;
  - service mapping of post-create overlap to the overlap envelope.
- Accepted gap: no database schema uniqueness constraint was added because schema/migration changes were outside approval and the existing transaction lock strategy provides the approved local proof path.
