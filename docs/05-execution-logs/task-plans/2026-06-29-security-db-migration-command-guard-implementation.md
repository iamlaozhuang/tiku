# Security DB Migration Command Guard Implementation Task Plan

## Task

- Task id: `security-db-migration-command-guard-implementation-2026-06-29`
- Branch: `codex/db-migration-command-guard-20260629`
- Scope: local guard/script/test/governance docs minimal change.
- Goal: require explicit local DB mutation approval before `scripts/local/Invoke-FreshValidationRun.ps1` full mode can execute create database, Drizzle migrate, dev seed, e2e, or build commands.

## Required Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest closeout task plan, evidence, audit, and acceptance for `detail-security-local-continuation-closeout-audit-2026-06-29`
- Current `scripts/local/Invoke-FreshValidationRun.ps1` and `tests/unit/fresh-validation-runner.test.ts`

## Authorization And Boundaries

User approval: execute `security-db-migration-command-guard-implementation-2026-06-29`.

Allowed:

- Minimal local guard changes in `scripts/local/Invoke-FreshValidationRun.ps1`.
- Focused unit tests in `tests/unit/fresh-validation-runner.test.ts`.
- Scoped governance state, queue, traceability, evidence, audit, acceptance, and this task plan.
- Local validation only.
- Commit, fast-forward merge to `master`, push `origin/master`, and clean the merged short branch after validation passes.

Forbidden:

- No DB connection, raw row read, DB mutation, schema change, migration execution, or seed execution.
- No real env, secret, connection string, credential, token, cookie, session, localStorage, or Authorization header read or evidence.
- No package or lockfile change; no dependency install, update, remove, or audit fix.
- No Provider/AI calls or configuration.
- No browser/dev-server/e2e runtime, raw DOM, screenshots, traces, or report capture.
- No staging/prod/cloud/deploy, release readiness, final Pass, PR, force-push, or Cost Calibration.

## TDD Plan

1. Add a failing unit test proving full mode without explicit local DB mutation approval stops before env mutation and before external DB/migration/seed commands.
2. Add a focused positive-path unit test proving full mode with explicit approval can proceed to the first external command shim without leaking the fake URL.
3. Implement the smallest guard in `Invoke-FreshValidationRun.ps1`.
4. Re-run the focused test and required local validation.

## Planned Validation

```powershell
npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts
npx.cmd prettier --write --ignore-unknown scripts/local/Invoke-FreshValidationRun.ps1 tests/unit/fresh-validation-runner.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/evidence/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-command-guard-implementation.md
npx.cmd prettier --check --ignore-unknown scripts/local/Invoke-FreshValidationRun.ps1 tests/unit/fresh-validation-runner.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/task-plans/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/evidence/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/audits-reviews/2026-06-29-security-db-migration-command-guard-implementation.md docs/05-execution-logs/acceptance/2026-06-29-security-db-migration-command-guard-implementation.md
npm.cmd run lint
npm.cmd run typecheck
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src src/db drizzle migrations seed scripts/db scripts/ai e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-db-migration-command-guard-implementation-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-db-migration-command-guard-implementation-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-db-migration-command-guard-implementation-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged short branch are approved by the current task-specific user approval.

This is not release readiness, not a final Pass, and not Cost Calibration.
