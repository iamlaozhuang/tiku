# AI Scoring Retry Persistence Closeout Audit Plan

## Task

- Task id: `phase-21-ai-scoring-retry-persistence-closeout-audit`
- Branch: `codex/phase-21-ai-scoring-retry-persistence-closeout-audit`
- Kind: docs/state/evidence audit only.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Human Approval

User approved task 4 as a docs-only closeout/drift audit for AI scoring retry persistence.

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- `.env.local`
- `.env.example`
- package and lockfile changes
- dependency changes
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- migration execution
- staging/prod/cloud/deploy/real provider/external service
- destructive data operations
- force push

## Audit Plan

1. Compare AI scoring retry persistence evidence with Git history.
2. Reconcile queue statuses only where Git reality proves the closeout state.
3. Update project-state to current `master` / `origin/master` SHA and current task handoff.
4. If any required next step would need database migration, secret/env, destructive data, staging/prod/cloud/deploy, or real provider work, record the blocked gate and stop that work.
5. Validate the docs-only change with diff, scoped Prettier, readiness, git completion, naming, and quality gate.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-01-ai-scoring-retry-persistence-closeout-audit.md docs\05-execution-logs\evidence\2026-06-01-ai-scoring-retry-persistence-closeout-audit.md docs\05-execution-logs\audits-reviews\2026-06-01-ai-scoring-retry-persistence-closeout-audit.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
