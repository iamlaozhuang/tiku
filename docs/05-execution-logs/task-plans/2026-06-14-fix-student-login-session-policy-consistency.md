# Fix Student Login Session Policy Consistency Plan

## Task

- Task id: `fix-student-login-session-policy-consistency`
- Branch: `codex/fix-student-login-local-session-token`
- Date: 2026-06-14 local time
- Source story: master-health-baseline follow-up after `fix-student-login-local-session-token`
- Human decision: Option A, keep `server_session` and `exposeBearerTokenToClient: false`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/evidence/2026-06-14-current-state-checkpoint-and-implementation-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-current-state-checkpoint-and-implementation-audit.md`

## Start Baseline

- Current branch: `codex/fix-student-login-local-session-token`
- `HEAD`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- `master`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- `origin/master`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- Worktree status: dirty from the prior blocked attempt.
- Dirty files at start:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `src/app/(auth)/login/page.tsx`
  - `docs/05-execution-logs/task-plans/2026-06-14-fix-student-login-local-session-token.md`
  - `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-local-session-token.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-local-session-token.md`
- Local `codex/*` residue: current branch only.
- Remote `origin/codex/*` residue: none observed.
- Queue status: `fix-student-login-local-session-token` is blocked; the six new user-requested task ids were not present before this plan, so this task records the fresh user instruction in queue/state.

## Scope

The task resolves the failed login-session attempt by preserving the server-session policy:

- Remove the login page `localStorage` bearer-token persistence introduced by the failed attempt.
- Update `tests/unit/student-login-ui.test.ts` so successful login verifies redirect, API call, and no token rendering, without expecting browser token persistence.
- Read-only confirm `src/server/contracts/user-auth/session-boundary.ts`; do not modify it.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/app/(auth)/login/page.tsx`
- `tests/unit/student-login-ui.test.ts`

Blocked files and surfaces:

- `.env.local`, `.env.example`, `.env.*`, and any real secret/provider configuration.
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`.
- `src/server/contracts/user-auth/session-boundary.ts` except read-only confirmation.
- `src/db/schema/**`, `drizzle/**`, `scripts/**`, `e2e/**`.
- Provider/model calls, quota use, schema/migration, dependency changes, deployment, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## TDD Plan

1. RED: Update the student login UI test to assert that successful server-session login does not persist a bearer token
   to `localStorage`.
2. Run `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
   and confirm failure while the failed-attempt login page still writes `localStorage`.
3. GREEN: Remove the login page storage key and `window.localStorage.setItem` call only.
4. Re-run the same targeted command and confirm the tests pass.
5. Run the full validation surface before closeout.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-student-login-session-policy-consistency`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`

## Risk Controls

- Evidence must not include token values, Authorization headers, passwords, secrets, database URLs, row data, provider
  payloads, model responses, or private user data.
- Do not run e2e.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Do not modify package files, lockfiles, schema, migrations, scripts, or generated report directories.
- Stop immediately on validation failure or any gate that requires new human approval.
