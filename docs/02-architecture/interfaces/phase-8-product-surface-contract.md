# Phase 8 Product Surface Contract

## Status

Planning anchor for Phase 8.

## Purpose

Phase 8 turns MVP-visible but incomplete product surfaces into small, reviewable runtime slices. It follows Phase 7, which made the local MVP business flow runnable but did not complete every student and admin UI entrypoint.

This contract is intentionally narrower than broad product expansion. It exists to make 404 pages, unavailable route handlers, and browser verification gaps explicit before implementation tasks are claimed.

## Inputs

- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/05-execution-logs/evidence/2026-05-22-fix-local-business-flow-runtime.md`

## Current Gaps

### Student Surface

- `/login` exists but remains a placeholder UI instead of a complete local login/session workflow.
- Student home, practice, mock exam, and report routes exist and were made locally runnable in Phase 7.
- Student navigation still references `/redeem-code`, but the page route is absent.
- Personal center/profile UI is absent.
- `mistake_book` API route files exist, but their service and resolver wiring still use unavailable placeholders.
- A student-facing `mistake_book` UI route is absent.

### Admin Surface

- Admin read pages exist for users, questions, papers, audit log, AI call log, and model config visibility.
- Enterprise authorization surfaces are absent or unavailable at the UI/runtime boundary.
- `organization`, `org_auth`, `employee`, and `redeem_code` admin route handlers still contain unavailable service boundaries in multiple entrypoints.
- Some high-risk admin actions, such as password reset and model config enable/disable, remain unavailable and require separate security review before activation.

### Verification Surface

- The existing Playwright E2E is still a smoke baseline unless a task explicitly extends it.
- A complete Phase 8 browser verification must prove student login/session, student authorization/profile/redeem or `mistake_book` pages, admin organization/auth/redeem pages, audit logging, and AI log redaction where applicable.

## Phase 8 Goals

- Replace MVP-visible 404 student pages with real UI routes and contract-safe unavailable/error states where runtime is intentionally deferred.
- Wire missing local runtime for student `authorization`, `personal_auth`, `redeem_code`, and `mistake_book` flows in small slices.
- Wire missing local runtime for admin `organization`, `org_auth`, `employee`, and `redeem_code` flows in small slices.
- Add browser-level E2E coverage only after the relevant UI and runtime slices exist.
- Keep every task independently claimable, reviewable, and verifiable through the queue.

## Non-Goals

- Do not add production deployment, staging deployment, or remote resource changes.
- Do not introduce, remove, or upgrade dependencies without the dependency introduction gate and human approval.
- Do not connect a real AI provider in Phase 8 product surface tasks.
- Do not implement full RAG ingestion, vector rebuild, or broad content CRUD unless a later task explicitly scopes it.
- Do not change database schema unless a queued task declares migration risk and passes the security review gate.
- Do not hide unavailable runtime by weakening API contracts or returning fixture-only success for protected actions.

## Task Ordering

1. `phase-8-student-login-session-ui-runtime`
2. `phase-8-student-authorization-redeem-runtime`
3. `phase-8-student-profile-redeem-ui`
4. `phase-8-student-mistake-book-runtime`
5. `phase-8-student-mistake-book-ui`
6. `phase-8-admin-organization-org-auth-runtime`
7. `phase-8-admin-redeem-code-runtime`
8. `phase-8-admin-org-auth-redeem-ui`
9. `phase-8-product-surface-browser-verification`

## Security And Privacy Boundaries

- Auth/session tasks are high-risk and require security review.
- Organization, authorization, employee, redeem code, audit log, AI call log, and model config tasks are high-risk and require security review when they modify runtime behavior.
- Browser pages must not display secrets, raw session tokens, API keys, raw prompts, or raw AI answers unless the contract explicitly allows a redacted diagnostic field.
- Admin actions that mutate data must write `audit_log` or explicitly record why the action is read-only.
- AI-related checks must use the mock provider unless a separate approved task introduces external provider configuration.

## Validation Expectations

Each implementation task must include:

- Task plan before code changes.
- Evidence under `docs/05-execution-logs/evidence/`.
- Unit tests for service or mapper behavior when runtime changes.
- Browser or Playwright verification for UI work.
- `Invoke-QualityGate.ps1`.
- `npm.cmd run build` when runtime or UI changes are included.
- `npm.cmd run test:e2e` when browser coverage changes or the task depends on browser flow correctness.
- `Test-NamingConventions.ps1`.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`.
