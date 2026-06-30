# AGENTS.md User Instruction Adoption Task Plan

## Task

- Task id: `agents-md-user-instruction-adoption-2026-06-29`
- Branch: `codex/agents-md-user-instruction-adoption-20260629`
- Scope: adopt user-authored `AGENTS.md` instruction update plus scoped governance files.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest evidence for `security-db-migration-command-guard-implementation-2026-06-29`

## Boundaries

Allowed: `AGENTS.md`, scoped state/queue, traceability, plan, evidence, audit, acceptance.

Forbidden: source/test/script implementation changes, package or lockfile changes, DB connection/mutation/migration/seed,
Provider/AI calls or config, browser/e2e, staging/prod/cloud/deploy, release readiness, final Pass, PR, force-push, and
Cost Calibration.

## Validation

```powershell
npx.cmd prettier --write --ignore-unknown AGENTS.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/task-plans/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/evidence/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/audits-reviews/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/acceptance/2026-06-29-agents-md-user-instruction-adoption.md
npx.cmd prettier --check --ignore-unknown AGENTS.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/task-plans/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/evidence/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/audits-reviews/2026-06-29-agents-md-user-instruction-adoption.md docs/05-execution-logs/acceptance/2026-06-29-agents-md-user-instruction-adoption.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId agents-md-user-instruction-adoption-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId agents-md-user-instruction-adoption-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId agents-md-user-instruction-adoption-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout

If validation passes, commit locally, fast-forward merge to `master`, push `origin/master`, and delete the merged short
branch.

This is not release readiness, not a final Pass, and not Cost Calibration.
