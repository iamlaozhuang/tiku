# Fix L6 Runtime Blockers: mistake_book Cookie Session And Duplicate Key

taskId: fix-l6-runtime-blockers-mistake-book-and-duplicate-key-2026-06-23
status: in_progress
createdAt: "2026-06-23T02:46:00-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: user_approved_runtime_blocker_repair_2026_06_23

## Context

The L6 owner preview actual walkthrough found two local runtime gaps:

1. Student `/mistake-book` returned a login-required state while the same student session could access `/home` and
   `/profile`.
2. Browser error logs contained repeated React duplicate-key errors with key `user-dev-student`.

This repair batch handles only those local blockers before any Provider, Cost Calibration, staging, payment, or release
decision work resumes.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/001-tech-stack-and-runtime.md`
- `docs/02-architecture/adr/002-runtime-layering-and-boundary.md`
- `docs/02-architecture/adr/003-frontend-workplace-web-compatibility.md`
- `docs/02-architecture/adr/004-environment-and-secret-isolation.md`
- `docs/02-architecture/adr/005-staging-prod-and-preview-boundaries.md`
- `docs/02-architecture/adr/006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/007-edition-aware-authorization-model.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- L6 walkthrough evidence:
  `docs/05-execution-logs/evidence/2026-06-23-acceptance-l6-owner-preview-actual-walkthrough.md`

## Root-Cause Hypotheses

- P1 likely comes from `student-mistake-book-runtime` passing only the raw `Authorization` header to
  `SessionService.getCurrentSession`. Browser login uses an HttpOnly `tiku_session` cookie, so the resolver must use the
  shared `getRequestAuthorization(request)` cookie/header adapter like other runtime routes.
- P2 likely comes from admin user list SQL expanding one `user` row into multiple rows through
  `leftJoin(personal_auth)`. The browser log key `user-dev-student` matches the admin user list public id.

## Implementation Plan

1. Add failing unit coverage for cookie-backed `mistake_book` route access.
2. Add failing unit coverage for duplicate user rows in the admin user list repository path.
3. Update `createStudentMistakeBookUserResolver` to use the shared request authorization adapter.
4. Update the admin user list repository to aggregate personal authorization status per user and keep a defensive
   publicId de-duplication boundary for UI stability.
5. Run focused tests first, then lint/typecheck/diff checks and Module Run v2 hardening.
6. Re-check local browser `/mistake-book` and duplicate-key logs after the code repair.
7. Record evidence and audit review without secrets, cookies, tokens, screenshots, raw DB rows, or private payloads.

## Boundaries

Allowed:

- Local source/test/doc/state changes required for the two defects.
- Local unit tests, lint, typecheck, format checks, browser route verification.

Blocked:

- `.env*` access or change.
- Database migration, seed, reset, truncate, drop, or `drizzle-kit push`.
- Provider/model calls, Provider configuration, Cost Calibration.
- staging/prod/cloud deployment, payment, external services.
- dependency or lockfile changes.
- push, PR, force push.
- final Standard/Advanced MVP Pass claim.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/phase-8-student-mistake-book-runtime.test.ts`
- `npm.cmd run test:unit -- tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`
- `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-l6-runtime-blockers-mistake-book-and-duplicate-key-2026-06-23`

## Risk Controls

- Keep the cookie adaptation in the shared session boundary instead of exposing tokens to client code.
- Keep admin user list rows keyed by stable `publicId`; fix duplicated data before it reaches the UI.
- Preserve existing publicId-only response contracts and avoid numeric id exposure.
- Do not record credentials, cookie values, Authorization headers, raw DB rows, or local storage values in evidence.
