# Fix Personal AI Generation Persistence Failure Semantics Plan

## Task

- Task id: `fix-personal-ai-generation-persistence-failure-semantics`
- Branch: `codex/fix-personal-ai-generation-persistence-failure-semantics`
- Date: 2026-06-14 local time
- Source story: current-state checkpoint implementation audit follow-up.
- Strict serial position: task 4 after `fix-personal-ai-generation-unique-request-identifiers`.

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
- `docs/05-execution-logs/evidence/2026-06-14-current-state-checkpoint-and-implementation-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-current-state-checkpoint-and-implementation-audit.md`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

## Start Baseline

- Current branch before short branch creation: `master`
- Short branch: `codex/fix-personal-ai-generation-persistence-failure-semantics`
- `HEAD`: `6b313f37b84a48b61fd2cbe11aad2e85c06123fc`
- `master`: `6b313f37b84a48b61fd2cbe11aad2e85c06123fc`
- `origin/master`: `6b313f37b84a48b61fd2cbe11aad2e85c06123fc`
- Worktree before task 4 edits: clean.
- Local `codex/*` residue: none.
- Remote `origin/codex/*` residue: none observed.

## Scope

This task fixes local browser POST persistence failure semantics:

- Add RED coverage proving a `createOrReuseRequest` failure no longer returns a durable-looking success response.
- Implement the smallest route/service change that returns a standard redacted error envelope on persistence failure.
- Preserve personal user path, created/reused persistence success behavior, history failure behavior, and redaction.

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

1. RED: Change the existing persistence-unavailable route unit test to expect a nonzero standard error envelope with
   `data: null` instead of `code: 0` local browser success.
2. Run `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts` and confirm the
   test fails because the route still masks the persistence exception as accepted.
3. GREEN: Have the persistence metadata step return an explicit failure signal and have POST return a redacted error
   envelope for that signal.
4. Re-run the target unit test and confirm created/reused success behavior and the new failure semantics all pass.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-personal-ai-generation-persistence-failure-semantics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-personal-ai-generation-persistence-failure-semantics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-personal-ai-generation-persistence-failure-semantics`

## Risk Controls

- Evidence must not include token values, Authorization headers, passwords, secrets, database URLs, row data, provider
  payloads, model responses, raw prompts, generated content, or private user data.
- Do not run e2e.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Do not modify package files, lockfiles, schema, migrations, scripts, or generated report directories.
- Stop immediately on validation failure or any gate that requires new human approval.
