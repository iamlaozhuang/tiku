# Evidence: phase-11-staging-entry-auth-route-guards

## Summary

- Task id: `phase-11-staging-entry-auth-route-guards`
- Branch: `codex/phase-11-staging-entry-auth-route-guards`
- Date: 2026-05-24
- Type: local dev route guard implementation

## Human Approval

The user explicitly approved starting `phase-11-staging-entry-auth-route-guards` after the scope task was merged and pushed to `origin/master`.

This approval covered local dev implementation and validation only. No approval was given in this task to deploy, connect staging/prod, create or modify cloud resources, change secrets/env files, change dependencies, change lockfiles, change schema/migrations, or call providers.

## Safety Boundary

- No cloud resources created or modified.
- No deployment performed.
- No staging/prod connection made.
- No staging/prod secret created, read, changed, or output.
- No `.env.local` or `.env.example` change.
- No dependency, package, lockfile, database schema, migration, or script change.
- No provider call.
- Evidence does not include Authorization headers, session tokens, secrets, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or customer/customer-like private data.

## Implementation

- Added a shared client route guard at `src/components/ProtectedRouteGuard/`.
- Wrapped `StudentAppLayout` with a student guard.
- Wrapped `AdminDashboardLayout` with an admin guard.
- Guard behavior:
  - reads only the local session token presence from `localStorage`;
  - redirects missing local sessions to `/login`;
  - validates `/api/v1/sessions` before rendering protected layout chrome;
  - allows student routes only when `userType` is present;
  - allows admin/content routes only when `adminPublicId` and `adminRoles` are present;
  - fails closed and shows an explicit non-secret status state before redirect.
- Added unit coverage in `tests/unit/protected-route-guard-ui.test.ts`.
- Added browser coverage in `e2e/local-auth-route-guard.spec.ts`.

## TDD Log

- Initial unit command with `.test.tsx` filename: failed because current Vitest include pattern is `tests/unit/**/*.test.ts`.
- Renamed the test to `tests/unit/protected-route-guard-ui.test.ts` without changing test config.
- Red test result before implementation: 4 expected failures confirming protected shells rendered without redirect/fetch guard.
- Green test result after implementation: 4 tests passed.

## Validation Log

- `Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-entry-auth-route-guards`: pass.
- `docker compose ps`: `tiku-postgres-dev` healthy on local `127.0.0.1:5432`.
- `npm.cmd run test:unit -- --run tests/unit/protected-route-guard-ui.test.ts`: pass.
  - 1 test file passed.
  - 4 tests passed.
- `npm.cmd run test:e2e -- --grep "local auth route guards"`: pass.
  - 3 Chromium tests passed.
  - Covered `/home`, `/ops/users`, and `/content/questions` without local session.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Invoke-QualityGate.ps1`: pass.
  - `lint`: pass.
  - `typecheck`: pass.
  - `test:unit`: 106 test files passed, 385 tests passed.
  - `format:check`: pass.
- `npm.cmd run build`: pass.
- `Test-NamingConventions.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; all changed files are in the task allowlist.

## Notes

- Direct sandboxed `npm.cmd run lint` and `npm.cmd run typecheck` hit local `node_modules` EPERM reads before rerunning with approved escalation; the actual lint/typecheck gates passed.
- `next build` reports that `.env.local` is present as an environment source, but this task did not read or output its contents.

## Staging Decision

`LPR-RP-001` can be treated as `fixed_for_local_staging_entry_candidate` for the covered local protected route shells.

Staging remains blocked by the previously recorded P1/P2 findings until those are fixed or explicitly scoped as known limitations:

- `LPR-RP-002`: admin AI/audit navigation.
- `LPR-RP-003`: student practice and `mock_exam` entry closure.
- `LPR-RP-004`: content action closure.
- `LPR-RP-005` through `LPR-RP-007`: named known-limitations or follow-up fixes depending on acceptance scope.
