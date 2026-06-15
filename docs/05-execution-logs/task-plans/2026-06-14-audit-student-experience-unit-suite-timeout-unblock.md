# Audit Student Experience Unit Suite Timeout Unblock Plan

## Task

- Task id: `audit-student-experience-unit-suite-timeout-unblock`
- Branch: `codex/fix-student-login-local-session-token`
- Date: 2026-06-14 local time
- Source: fresh user approval to resolve the blocked full unit gate before closing task 1.

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
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-session-policy-consistency.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-session-policy-consistency.md`
- `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`

## Start Baseline

- Current branch: `codex/fix-student-login-local-session-token`
- `HEAD`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- `master`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- `origin/master`: `dc2c14e77d93049cb748c615fa20ee249c3a73f6`
- Worktree status: dirty with the prior task 1 login/session policy edits and evidence.
- Local `codex/*` residue: current branch only.
- Remote `origin/codex/*` residue: none observed.

## Scope

This task diagnoses and, if evidence supports it, minimally unblocks the full-unit timeout in
`tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`
- Previously approved task 1 files already in the working tree:
  - `src/app/(auth)/login/page.tsx`
  - `tests/unit/student-login-ui.test.ts`

Blocked files and surfaces:

- `.env.local`, `.env.example`, `.env.*`, and any real secret/provider configuration.
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`.
- `src/db/schema/**`, `drizzle/**`, `scripts/**`, `e2e/**`.
- Product implementation files outside the already approved login page.
- Provider/model calls, quota use, schema/migration, dependency changes, deployment, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## Debugging Plan

1. Reproduce the targeted student-experience test by running it alone.
2. Re-run the task 1 targeted login/session tests to ensure the task 1 fix still holds.
3. Run full unit again or after a minimal stability change to verify whether the timeout is suite-pressure specific.
4. If the first test fails only by timeout while its assertions pass under a wider timeout, apply the smallest test-only
   timeout adjustment to that test file.
5. Do not touch product code for this unblock.

## TDD / Verification Plan

- RED evidence may be the existing full-unit timeout plus a targeted run that reproduces the timeout or shows the narrow
  test's longer runtime under constrained conditions.
- GREEN, if a test-only timeout adjustment is needed, must be proven by:
  - `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`
  - `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
  - `npm.cmd run test:unit`

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`
- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-student-login-session-policy-consistency`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`

## Risk Controls

- Keep this as a test-stability unblock only.
- Do not run e2e.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Do not modify package files, lockfiles, schema, migrations, scripts, product student-experience implementation, or
  generated report directories.
- Stop immediately on validation failure or a gate requiring additional approval.
