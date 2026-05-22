# Phase 9 Auth Session Account Completion Plan

## Task

Claim and implement `phase-9-auth-session-account-completion`.

## Branch

`codex/phase-9-auth-session-account-completion`

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-requirements-runtime-gap-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-requirements-runtime-gap-inventory.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md` through `06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md` through `epic-06-admin-ops.md`

## Current Findings

- `/api/v1/sessions` already uses `createLocalSessionRouteHandlers`.
- `session-service` already covers student-side 7-day sessions, single active session replacement, and 3-failure/5-minute lock behavior for student `user` rows.
- Admin login currently resolves through the same phone lookup fallback, but admin lock and 8-hour/multi-session behavior from US-06-13 is not yet proven.
- `/api/v1/users` uses admin read runtime for `GET`, but public `POST` registration still uses `createUnavailableUserRegistrationRouteHandlers`.
- `/api/v1/users/{publicId}/reset-password` still uses `createUnavailableAdminUserOrgAuthOpsService`.
- Existing registration service and tests cover validation, duplicate phone, and redeem-code next-action DTOs, but the local runtime route is not wired.

## Implementation Result

- Added local personal registration runtime and wired `POST /api/v1/users` to it while preserving admin `GET /api/v1/users`.
- Added `/register` student auth page with validation, duplicate-phone handling, and successful redirect to `/redeem-code`.
- Added login-page handling for disabled-account responses.
- Updated session behavior so student users keep 7-day single-active sessions, while admin users receive 8-hour multi-session login behavior.
- Added disabled-account login rejection before credential verification or session creation.
- Left `/api/v1/users/{publicId}/reset-password` deferred because the current route contract does not define a safe password delivery model and a complete reset requires admin UI/audit-log runtime work owned by `phase-9-admin-ops-runtime-ui-completion`.

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-auth-session-account-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-auth-session-account-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-auth-session-account-completion-security-review.md`
- `src/app/(auth)/**`
- `src/app/api/v1/sessions/**`
- `src/app/api/v1/users/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Approach

1. Use TDD for each runtime gap: add focused failing tests, verify red, implement minimal runtime wiring, then verify green.
2. Wire local personal user registration for `POST /api/v1/users` without introducing dependencies, schema changes, external SMS/email, or production credentials.
3. Preserve `GET /api/v1/users` admin read runtime while adding the registration POST handler.
4. Password reset was evaluated and deferred to `phase-9-admin-ops-runtime-ui-completion`; see evidence and security review for the boundary rationale.
5. Evaluate admin account/session rules for US-06-13 and implement only auth/session-boundary items inside allowed files.
6. Keep all external DTOs on public identifiers only; do not expose numeric `id`, session tokens in evidence/UI/logs, password hashes, or secrets.
7. Add or update unit/E2E coverage only for the changed surfaces.
8. Complete security review before merge/closeout.

## Risk Controls

- No package, lockfile, `.env.example`, schema, migration, `drizzle/**`, external provider, production resource, SMS, email, or payment changes.
- No bypass of `createLocalSessionRuntime` or service/repository layering.
- No session token, password, secret, API key, password hash, or raw credential value in evidence beyond test-only placeholder labels.
- High-risk auth/session/account work must finish with security review verdict `APPROVE` before merge.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-auth-session-account-completion`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
