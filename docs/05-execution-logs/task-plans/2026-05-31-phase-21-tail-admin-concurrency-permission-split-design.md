# Phase 21 Tail Admin Concurrency Permission Split Design Task Plan

## Task

- Task id: `phase-21-tail-admin-concurrency-permission-split-design`
- Branch: `codex/phase-21-tail-admin-concurrency-permission-split-design`
- Scope: docs-only split plan for RA-06-01 admin UX, concurrency, and permission implementation units.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-06-01-admin-common-ux-concurrency-coverage.md`

## Allowed Scope

Allowed files are limited to the Phase 21 tail docs anchor:

- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

Blocked files remain:

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Plan

1. Record startup recovery and claim evidence.
2. Add RA-06-01 split design to the Phase 21 contract.
3. Define `admin` UX state audit, write concurrency proof, and permission boundary review scopes.
4. Suggest allowedFiles, blockedFiles, riskTypes, validationCommands, and approval gates for each follow-up task.
5. Update queue and project state for this docs-only task.
6. Run task validation, local CI gates, readiness checks, naming checks, quality gate, and `git diff --check`.
7. Commit, merge to `master`, validate on `master`, push `origin master`, delete the merged short-lived branch, and record closeout evidence.

## Risk Controls

- This task does not approve source, test, e2e, schema, migration, dependency, env, staging, prod, cloud, deploy, real provider, destructive data, or force-push work.
- `auth_permission_model`, `transaction/concurrency`, `database_migration`, and `dependency_change` remain implementation-time approval gates.
- Evidence must not include secrets, env values, raw prompts, raw answers, raw model responses, provider payloads, database URLs, full papers, redeem code batches, or customer/customer-like private data.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\02-architecture\interfaces\phase-21-high-risk-tail-contract.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-phase-21-tail-admin-concurrency-permission-split-design.md docs\05-execution-logs\evidence\phase-21-tail-admin-concurrency-permission-split-design.md`
- `npm.cmd run build` skipped because this docs-only task does not touch frontend, route, build, runtime, or browser behavior.
- `npm.cmd run test:e2e` skipped for the same docs-only reason unless `Invoke-QualityGate.ps1` runs broader gates internally.
