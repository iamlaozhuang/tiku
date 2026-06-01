# Fresh Local Dev DB Validation Flow Docs Plan

## Summary

- Task id: `phase-21-fresh-local-dev-db-validation-flow-docs`
- Branch: `codex/fresh-local-dev-db-flow-docs`
- Base: `master`
- Goal: document a safe, reproducible, recovery-friendly flow for future fresh local/dev DB target selection, reviewed migration, seed/bootstrap, validation data preparation, and fresh DB e2e verification prerequisites.

## Startup Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- latest evidence: `docs/05-execution-logs/evidence/2026-06-01-fresh-local-dev-migration-closeout-reconciliation.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`

Blocked files and actions:

- Do not read, modify, print, copy, or commit `.env.local`.
- Do not modify `.env.example`, package files, lockfiles, dependencies, `scripts/**`, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, or `drizzle/**`.
- Do not connect to any DB, run migrations, run seed/bootstrap, run raw SQL, run `drizzle-kit push`, repair migration tables, or perform destructive data operations.
- Do not use staging, prod, cloud, deploy, real provider, external service, force push, unknown worktree deletion, or unmerged branch deletion.
- Do not write secrets, DB URLs, provider payloads, raw prompts, raw student answers, or raw model responses into evidence.

## Documentation Approach

Create one SOP/playbook that records:

- fresh local/dev DB target confirmation principles;
- `.env.local` handling as future approval-only and value-redacted;
- reviewed migration path using existing Drizzle `migrate`, never `push` or raw SQL;
- seed/bootstrap as future approval-only through existing local mechanisms;
- validation data prep as future approval-only through local/dev APIs with minimal synthetic data;
- known fresh empty DB prerequisites for e2e: seed account, business `paper`, `mistake_book`, `ai_call_log`, and related minimum data;
- blocked gates for raw SQL, destructive reset, migration table repair, schema/src/tests/e2e/script/dependency changes, staging/prod/cloud/deploy, real providers, external services, and secret exposure.

## Validation Plan

Run the queue-declared validation commands:

```powershell
git status --short --branch
git rev-list --left-right --count master...origin/master
git branch --list
git branch --no-merged master
git worktree list
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\04-agent-system\sop\fresh-local-dev-db-validation-playbook.md docs\05-execution-logs\task-plans\2026-06-01-fresh-local-dev-db-validation-flow-docs.md docs\05-execution-logs\evidence\2026-06-01-fresh-local-dev-db-validation-flow-docs.md
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

`npm run build` and `npm run test:e2e` are not part of this docs-only validation because no frontend, runtime, DB, server, test, or build-system surface is changed, and DB/e2e execution is explicitly out of scope for this task.
