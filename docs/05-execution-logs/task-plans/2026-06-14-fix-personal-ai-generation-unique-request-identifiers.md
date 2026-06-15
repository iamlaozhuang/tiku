# Fix Personal AI Generation Unique Request Identifiers Plan

## Task

- Task id: `fix-personal-ai-generation-unique-request-identifiers`
- Branch: `codex/fix-personal-ai-generation-unique-request-identifiers`
- Date: 2026-06-14 local time
- Source story: current-state checkpoint implementation audit follow-up.
- Strict serial position: task 3 after `fix-personal-ai-generation-user-type-boundary`.

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
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`

## Start Baseline

- Current branch before short branch creation: `master`
- Short branch: `codex/fix-personal-ai-generation-unique-request-identifiers`
- `HEAD`: `c46bbf16efbe8ef3b844e0d180c23de2ffe7dc6a`
- `master`: `c46bbf16efbe8ef3b844e0d180c23de2ffe7dc6a`
- `origin/master`: `c46bbf16efbe8ef3b844e0d180c23de2ffe7dc6a`
- Worktree before task 3 edits: clean.
- Local `codex/*` residue: none.
- Remote `origin/codex/*` residue: none observed.

## Scope

This task removes static personal AI generation request identifiers from the student page submit payload:

- Add a negative RED unit test proving two consecutive submits produce different `requestPublicId`, `taskPublicId`, and
  `idempotencyKeyHash` values.
- Implement local unique identifier generation without introducing dependencies or changing schema.
- Preserve existing personal AI generation UI behavior and redacted contract rendering.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`

Blocked files and surfaces:

- `.env.local`, `.env.example`, `.env.*`, and any real secret/provider configuration.
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`.
- `src/db/schema/**`, `drizzle/**`, `e2e/**`, `scripts/**`.
- Provider/model calls, quota use, schema/migration, dependency changes, deployment, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## TDD Plan

1. RED: Add a UI unit test that clicks submit twice and captures both POST request bodies.
2. RED expected failure: both bodies currently contain the static `requestPublicId`, `taskPublicId`, and
   `idempotencyKeyHash` values from `personalAiGenerationRequestDraft`.
3. GREEN: Generate those three identifiers at submit time using built-in browser/JavaScript primitives only.
4. Re-run the target UI unit test and confirm consecutive POST bodies differ while the rest of the payload remains
   session-aligned and redacted.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-personal-ai-generation-unique-request-identifiers`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-personal-ai-generation-unique-request-identifiers`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-personal-ai-generation-unique-request-identifiers`

## Risk Controls

- Evidence must not include token values, Authorization headers, passwords, secrets, database URLs, row data, provider
  payloads, model responses, or private user data.
- Do not run e2e.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Do not modify package files, lockfiles, schema, migrations, scripts, or generated report directories.
- Stop immediately on validation failure or any gate that requires new human approval.
