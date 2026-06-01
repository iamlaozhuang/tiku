# Admin Permission Boundary Review Security Review

## Metadata

- Task id: `phase-21-admin-permission-boundary-review`
- Branch: `codex/phase-21-admin-permission-boundary-review`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-06-01
- Verdict: APPROVE

## Files Reviewed

- `src/server/services/admin-user-org-auth-ops-service.ts`
- `src/server/services/admin-content-knowledge-ops-service.ts`
- `src/server/services/admin-ai-audit-log-ops-service.ts`
- `tests/unit/phase-21-admin-permission-boundary-review.test.ts`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`

## Risk Types Reviewed

- `admin_ops`
- `authorization`
- `auth_permission_model`
- `data_contract`
- `local_human_verification`
- `evidence_integrity`

## Abuse Cases Considered

- `super_admin`, `ops_admin`, and `content_admin` role confusion.
- Non-admin access to admin operations.
- Disabled admin or disabled user access.
- Permissionless user access.
- `publicId` tampering to access or mutate another visible resource.
- API response envelope drift.
- Internal numeric `id` exposure.
- Secret, token, password hash, session internal, raw prompt, raw answer, raw model output, raw chunk, provider payload, or redeem code clear-text leakage outside approved boundaries.

## Data Exposure Review

- No DTO fields were added.
- Responses still return `data: null` for permission denied and not found results.
- No numeric internal `id`, password hash, session internal, raw prompt, raw answer, raw model output, raw chunk, provider payload, secret, token, database URL, or clear-text redeem code exposure was added.
- The new proof test asserts standard response objects and does not record private data.

## Authorization Boundary Review

- `super_admin`: may reset user password and enable model config when active and target `publicId` exists.
- `ops_admin`: may reset user password when active and target user `publicId` exists; may not rebuild content vectors or mutate model config.
- `content_admin`: may rebuild content vectors when active and target resource `publicId` exists; may not reset user credentials or mutate model config.
- Non-admin or permissionless roles are denied with the existing `4036xx` admin permission error.
- Disabled actors are denied before high-risk mutation success.
- Tampered target `publicId` values return the existing `4046xx` resource-not-found error instead of succeeding.

## API Contract Review

- API envelope remains `{ code, message, data, pagination? }`.
- JSON field casing remains camelCase.
- External references remain `publicId`; no URL or DTO exposes internal auto-increment `id`.
- Error codes stay within existing admin contract ranges: `403601/403621/403641` and `404601/404621/404641`.

## Test Coverage And Accepted Gaps

- Focused TDD coverage: role matrix, disabled actor rejection, no-role rejection, and publicId tamper rejection.
- Related regression coverage: admin user/org/auth baseline, content/knowledge baseline, AI/audit baseline, and redeem_code concurrency proof.
- Full local coverage: `test:unit` passed 152 files / 628 tests; `test:e2e` passed 26 tests after investigation of one transient `409311` run.
- Accepted gap: this task does not add database-backed integration tests beyond the existing local e2e suite because schema/database changes and destructive database operations are outside scope.
