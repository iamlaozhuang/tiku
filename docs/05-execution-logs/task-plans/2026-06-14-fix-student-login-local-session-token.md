# Fix Student Login Local Session Token Plan

## Task

- Task id: `fix-student-login-local-session-token`
- Branch: `codex/fix-student-login-local-session-token`
- Date: 2026-06-14 local time
- Source story: `master-health-baseline`
- Trigger: master health baseline found one failing unit test in `tests/unit/student-login-ui.test.ts`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- Current-state checkpoint and implementation audit evidence/review.
- Unified repair evidence/review for the completed `unified-repair-*` queue.

## Start Baseline

- Branch before short branch creation: `master`
- `HEAD`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- `master`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- `origin/master`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- Worktree before edits: clean.
- Local `codex/*` branches before task: none.
- Remote `origin/codex/*` branches before task: none.
- Queue status: no `status: pending` entries; all `unified-repair-*` tasks are closed.

## Scope

This task repairs the student login success path so the API session token returned by `/api/v1/sessions` is persisted
under the existing local client key expected by protected student flows.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-local-session-token.md`
- `src/app/(auth)/login/page.tsx`
- `tests/unit/student-login-ui.test.ts`

Blocked files and surfaces:

- `.env.local`, `.env.example`, `.env.*`, and any real secret/provider configuration.
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`.
- `src/db/schema/**`, `drizzle/**`, `scripts/**`, `e2e/**`.
- Provider/model calls, quota use, schema/migration, dependency changes, deployment, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## Root Cause Hypothesis

The login page consumes `payload.data.user` to compute the post-login boundary, but it does not persist
`payload.data.token`. `ProtectedRouteGuard` and the student runtime already use `tiku.localSessionToken`, so the student
login UI test fails because `localStorage.getItem("tiku.localSessionToken")` remains `null` after successful login.

## TDD Plan

1. Re-run `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts` on the short branch and record RED.
2. Use the existing failing test as the regression test; do not weaken or delete it.
3. Implement the smallest login-page change that writes the returned token to `localStorage` after a valid response and
   before redirect.
4. Re-run the targeted unit test and record GREEN.
5. Run the full validation surface before closeout.

## Implementation Approach

- Reuse the existing storage key `tiku.localSessionToken`.
- Keep the token out of rendered UI and evidence.
- Do not change API contracts, session payload shape, auth model, schemas, dependencies, or route behavior.
- Keep the page adapter thin and aligned with ADR-002.
- Stop if the fix requires any blocked file or blocked gate.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-student-login-local-session-token`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-local-session-token`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-student-login-local-session-token`

## Risk Controls

- Evidence must not include token values, Authorization headers, passwords, secrets, database URLs, row data, or private
  user data.
- Do not run e2e.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Do not modify package files, lockfiles, schema, migrations, scripts, or generated report directories.
