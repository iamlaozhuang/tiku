# Phase 17 Local E2E Prerequisite Readiness Audit Plan

**Task id:** `phase-17-local-e2e-prerequisite-readiness-audit`

**Branch:** `codex/phase-17-local-e2e-prerequisite-readiness-audit`

**Date:** 2026-05-27

## Goal

Audit whether local runtime prerequisites are ready for the Phase 16 requirement implementation audit. This task may run local non-destructive commands and inspect source/test files for readiness inventory, but it must not fix bugs, edit runtime/test/e2e/script files, change dependencies, read env files, call real providers, use staging/prod/cloud, deploy, or reset data.

## Inputs

- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-17-prerequisite-readiness-checklist.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-full-audit-prerequisites.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-audit-catalog.md`
- `playwright.config.ts`
- `package.json`
- `compose.yaml`
- `src/db/dev-seed.ts`
- `src/db/dev-seed.test.ts`
- `e2e/**`

## Verification Steps

1. Confirm Git baseline and branch isolation.
2. Inspect local scripts and Playwright configuration.
3. Inspect local database service availability without reading env files.
4. Inspect dev seed and role fixture coverage without recording secrets.
5. Run non-destructive dev seed unit coverage.
6. Run e2e list discovery.
7. Run full e2e through the existing script.
8. If a full e2e run fails, isolate the failing spec once to classify fixed blocker vs local state instability.
9. Register prerequisite queue tasks for missing readiness conditions.
10. Record evidence and update the readiness audit report.

## Forbidden Actions

- Do not read `.env.local` or `.env.example`.
- Do not modify `package.json`, lockfiles, source, tests, e2e, schema, migrations, drizzle files, or scripts.
- Do not run destructive seed reset, migration push, or data deletion.
- Do not call real AI providers.
- Do not use staging/prod/cloud/deploy resources.
- Do not fix bugs discovered during this audit.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-17-local-e2e-prerequisite-readiness-audit.md docs\05-execution-logs\evidence\2026-05-27-phase-17-local-e2e-prerequisite-readiness-audit.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-17-local-e2e-prerequisite-readiness-audit.md`

## Completion Criteria

- Readiness report created.
- Evidence records command outcomes with redaction.
- Missing prerequisites are registered as future queue work.
- Phase 17 task is closed without changing runtime code.
