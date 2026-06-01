# AI Scoring Retry Local Dev Drift Readonly Audit

## Scope

- Task id: `phase-21-ai-scoring-retry-local-dev-drift-readonly-audit`
- Branch: `codex/ai-scoring-retry-local-dev-drift-audit`
- Task kind: `docs_only`
- User approval: batch task 2 approval on 2026-06-01.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- AI scoring retry persistence task plan and evidence files under `docs/05-execution-logs/`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Actions

- Do not read or modify `.env.local`.
- Do not modify `.env.example`.
- Do not modify `package.json`, lockfiles, dependencies, `scripts/**`, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, or `drizzle/**`.
- Do not connect to any database, run migrations, execute raw SQL, run `drizzle-kit migrate`, repair migration tables, reset/rebuild data, use staging/prod/cloud/deploy, call real providers, perform destructive data operations, force push, delete unknown worktrees, or delete unmerged branches.

## Implementation Plan

1. Register this fresh queue task instead of claiming historical closed/deferred rows.
2. Audit Git reality for current `master` and `origin/master` alignment and relevant AI scoring retry persistence commits.
3. Audit prior evidence for implementation status, post-merge validation, migration attempt status, and closeout state.
4. Record local/dev migration drift facts from existing evidence only, without re-reading env or connecting to DB.
5. Separate facts that are established by Git/evidence from facts that require later approved DB/env validation.
6. Create a security review artifact because this task records `database_migration` and `secret_or_env_change` blocked gates.
7. Run the declared validation commands, local CI, `git diff --check`, readiness, naming, and quality gate.
8. Commit, merge to `master`, push `master`, clean the merged short-lived branch, and confirm no other unmerged `codex/*` branch or unknown worktree remains before task 3.

## Risk Defense

- This task is read/docs audit only and does not repair or verify the live database.
- The only allowed facts about local/dev migration drift are taken from existing evidence files that already recorded sanitized outputs.
- All repair paths remain blocked until later explicit approval for env read, DB connection, migration execution, raw SQL, destructive local rebuild, or migration table repair.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-01-ai-scoring-retry-local-dev-drift-readonly-audit.md docs\05-execution-logs\evidence\2026-06-01-ai-scoring-retry-local-dev-drift-readonly-audit.md docs\05-execution-logs\audits-reviews\2026-06-01-ai-scoring-retry-local-dev-drift-readonly-audit-security-review.md
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```
