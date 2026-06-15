# Audit Student Experience Unit Suite Timeout Plan

## Task

- Task id: `audit-student-experience-unit-suite-timeout`
- Branch: `codex/audit-student-experience-unit-suite-timeout`
- Date: 2026-06-14 local time
- Strict serial position: task 6 after `fix-ai-mock-provider-secret-like-payload-shape`.

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

- Current branch before short branch creation: `master`
- Short branch: `codex/audit-student-experience-unit-suite-timeout`
- `HEAD`: `b7f96fca3baaa4f460c2b1f02f2c44dc7ac4cadd`
- `master`: `b7f96fca3baaa4f460c2b1f02f2c44dc7ac4cadd`
- `origin/master`: `b7f96fca3baaa4f460c2b1f02f2c44dc7ac4cadd`
- Worktree before task 6 edits: clean.
- Local `codex/*` residue: none.
- Remote `origin/codex/*` residue: none observed.

## Scope

This task is audit-only by default:

- Re-run the targeted student-experience unit file.
- Re-run full unit after tasks 1-5 restored the full unit gate.
- Record whether the timeout is reproducible.
- Do not modify business code or test stability code. If code changes appear necessary, stop and request new
  authorization.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked files and surfaces:

- Source code and unit test code changes.
- `.env.local`, `.env.example`, `.env.*`, and any real secret/provider configuration.
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`.
- `src/db/schema/**`, `drizzle/**`, `e2e/**`, `scripts/**`.
- Provider/model calls, quota use, schema/migration, dependency changes, deployment, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## Evidence Plan

1. Run `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`.
2. Run `npm.cmd run test:unit` to observe whether the timeout still appears in full suite.
3. Run `git diff --check`, `npm.cmd run lint`, and `npm.cmd run typecheck`.
4. Record evidence and audit conclusion without changing source/test code.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`
- `npm.cmd run test:unit`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId audit-student-experience-unit-suite-timeout`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId audit-student-experience-unit-suite-timeout`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId audit-student-experience-unit-suite-timeout`

## Risk Controls

- Do not run e2e.
- Do not modify source/test code.
- Stop immediately if targeted or full unit fails.
- Evidence records command names and pass/fail summaries only; no private data, secrets, provider payloads, or raw rows.
