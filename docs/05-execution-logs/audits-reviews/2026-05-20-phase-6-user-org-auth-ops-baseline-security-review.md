# Security Review: Phase 6 User Organization Authorization Ops Baseline

## Metadata

- Task id: `phase-6-user-org-auth-ops-baseline`
- Branch: `codex/phase-6-user-org-auth-ops-baseline`
- Base: `master` at `0abe123 docs(agent): record admin shell cleanup closeout`
- Reviewer: Codex
- Review date: 2026-05-21
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/services/admin-user-org-auth-ops-service.ts`
- `src/server/services/admin-user-org-auth-ops-route.ts`
- `src/app/api/v1/users/route.ts`
- `src/app/api/v1/users/[publicId]/reset-password/route.ts`
- `src/app/api/v1/organizations/route.ts`
- `src/app/api/v1/redeem-codes/route.ts`
- `src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx`
- `src/app/(admin)/ops/users/page.tsx`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`

## Risk Types Reviewed

- `authorization`
- `auth`
- `admin`
- `api_contract`
- `redeem_code`
- `organization`

## Abuse Cases Considered

- A non-admin or disabled user calls admin user, organization, authorization, or redeem code APIs directly.
- An admin changes a `publicId` in a URL to reset another user password outside role scope.
- Numeric database `id` values leak in DTOs, DOM attributes, route params, or tests.
- Clear-text redeem codes are shown to users without the explicit operations role gate.
- User management UI hides actions but route/service code omits server-side permission checks.
- Organization or authorization data crosses permitted organization scope by changing request filters.
- Unavailable runtime route handlers return non-standard response envelopes or leak implementation detail.

## Data Exposure Review

- DTOs expose `publicId` and camelCase fields only.
- Tests assert user and redeem code summaries do not expose internal `id` properties.
- The UI uses `data-public-id` and avoids `data-id`.
- The default redeem code baseline renders `RC-2026-****`; clear text appears only when `canViewRedeemCodePlainText` is true in service context.
- No passwords, password hashes, sessions, cookies, bearer tokens, API keys, provider secrets, raw prompts, or raw AI outputs are returned or logged.

## Authorization Boundary Review

- The baseline service models role-sensitive behavior: `ops_admin` can view operations summaries but cannot reset passwords; password reset requires `super_admin`.
- Runtime route files currently use unavailable services, so they do not perform real state changes without future explicit wiring.
- The UI is treated as convenience only; it does not claim to enforce authorization.
- Future repository-backed implementation must combine authenticated admin session, role, organization scope, and target resource state checks before returning data or mutating state.

## API Contract Review

- Added admin operation route adapter returns the standard `{ code, message, data, pagination? }` shape.
- API route folders are kebab-case and externally visible route params use `publicId`.
- JSON/DTO fields are camelCase.
- Empty runtime data uses `null`; lists use arrays.
- No auto-increment ids are exposed in routes, DTOs, or UI attributes.

## Test Coverage And Accepted Gaps

- Unit tests cover list query defaults, DTO public identifier shape, permission-denied password reset, unavailable runtime response envelope, route request adaptation, guarded redeem code display, UI states, confirmation dialogs, and toast feedback.
- Browser/IAB validation was not run because the task is covered by unit/build gates and the startup instruction asked to avoid heavy Browser/IAB unless needed.
- Repository/database-backed authorization checks remain an accepted future gap because this task does not add schema, migrations, production data access, or real runtime wiring.

## Verdict

`APPROVE`: no blocking security issues found for this baseline. Remaining authorization and persistence work must stay behind future service/repository security review before real admin operations are enabled.
