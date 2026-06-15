# Fix Personal AI Generation User Type Boundary Plan

## Task

- Task id: `fix-personal-ai-generation-user-type-boundary`
- Branch: `codex/fix-personal-ai-generation-user-type-boundary`
- Date: 2026-06-14 local time
- Source story: current-state checkpoint implementation audit follow-up.
- Strict serial position: task 2 after `fix-student-login-session-policy-consistency`.

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
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

## Start Baseline

- Current branch before short branch creation: `master`
- Short branch: `codex/fix-personal-ai-generation-user-type-boundary`
- `HEAD`: `33d86504a67c3d44aca6c8eb84d1b35a3699ef92`
- `master`: `33d86504a67c3d44aca6c8eb84d1b35a3699ef92`
- `origin/master`: `33d86504a67c3d44aca6c8eb84d1b35a3699ef92`
- Worktree before edits: clean.
- Local `codex/*` residue: none.
- Remote `origin/codex/*` residue: none observed.
- Queue status: the user-requested task id was not present before this plan; this task records the fresh serial
  instruction in state/queue.

## Scope

This task adds the missing user type boundary for the personal AI generation request route:

- Add a negative unit test proving an `employee` session cannot enter the personal AI generation request path.
- Implement the smallest resolver boundary that accepts only `userType: "personal"`.
- Preserve the existing personal user path and standard response envelopes.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

Blocked files and surfaces:

- `.env.local`, `.env.example`, `.env.*`, and any real secret/provider configuration.
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`.
- `src/db/schema/**`, `drizzle/**`, `e2e/**`, `scripts/**`.
- Provider/model calls, quota use, schema/migration, dependency changes, deployment, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## TDD Plan

1. RED: Add a route/resolver unit test where the session service returns `userType: "employee"` and the POST response is
   the standard unauthorized envelope.
2. Run `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts` and confirm the new
   test fails because employee sessions are currently accepted.
3. GREEN: Change `createPersonalAiGenerationRequestUserResolver` to return `null` unless
   `sessionResponse.data.user.userType === "personal"`.
4. Re-run the targeted unit test and confirm both the new employee negative test and existing personal happy paths pass.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-personal-ai-generation-user-type-boundary`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-personal-ai-generation-user-type-boundary`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-personal-ai-generation-user-type-boundary`

## Risk Controls

- Evidence must not include token values, Authorization headers, passwords, secrets, database URLs, row data, provider
  payloads, model responses, or private user data.
- Do not run e2e.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Do not modify package files, lockfiles, schema, migrations, scripts, or generated report directories.
- Stop immediately on validation failure or any gate that requires new human approval.
