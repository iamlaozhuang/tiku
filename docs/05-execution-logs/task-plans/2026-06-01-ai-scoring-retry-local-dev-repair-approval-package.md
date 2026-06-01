# AI Scoring Retry Local Dev Repair Approval Package

## Scope

- Task id: `phase-21-ai-scoring-retry-local-dev-repair-approval-package`
- Branch: `codex/ai-scoring-retry-local-dev-repair-approval`
- Task kind: `blocked_gate`
- User approval: batch task 3 approval on 2026-06-01.

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
- AI scoring retry persistence evidence, including the read-only drift audit.

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
2. Use existing evidence to define repair options for local/dev migration drift.
3. For each option, document required approvals, risks, validation commands, and rollback or recovery boundaries.
4. Explicitly list operations requiring future separate approval: `.env.local` read, DB connection, `drizzle-kit migrate`, raw SQL, reset/rebuild, migration table repair, schema/drizzle/source/test/e2e changes, staging/prod/cloud/deploy, and real provider work.
5. Create a security review artifact because the package discusses `database_migration`, `secret_or_env_change`, and `destructive_data_operation` gates.
6. Run the declared validation commands, local CI, `git diff --check`, readiness, naming, and quality gate.
7. Commit, merge to `master`, push `master`, clean the merged short-lived branch, and confirm no other unmerged `codex/*` branch or unknown worktree remains.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-01-ai-scoring-retry-local-dev-repair-approval-package.md docs\05-execution-logs\evidence\2026-06-01-ai-scoring-retry-local-dev-repair-approval-package.md docs\05-execution-logs\audits-reviews\2026-06-01-ai-scoring-retry-local-dev-repair-approval-package-security-review.md
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```
