# Phase 21 Tail AI Scoring Retry Persistence Design Task Plan

## Task

- Task id: `phase-21-tail-ai-scoring-retry-persistence-design`
- Branch: `codex/phase-21-tail-ai-scoring-retry-persistence-design`
- Scope: docs-only design and approval checklist for durable `ai_scoring` retry persistence.

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
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-04-02-ai-scoring-timeout-retry-persistence.md`

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
2. Add the `ai_scoring` retry storage design candidates to the Phase 21 contract.
3. Record migration approval evidence requirements, data retention rule, rollback plan, and validation commands.
4. Update queue and project state for this docs-only task.
5. Run task validation, local CI gates, readiness checks, naming checks, quality gate, and `git diff --check`.
6. Commit, merge to `master`, validate on `master`, push `origin master`, delete the merged short-lived branch, and record closeout evidence.

## Risk Controls

- `database_migration` remains explicitly unapproved for implementation; this task only documents what approval must contain.
- No schema, migration, Drizzle output, source, tests, e2e, dependency, lockfile, env, staging, prod, cloud, deploy, real provider, destructive data, or force-push work is allowed.
- Evidence must not contain secrets, env values, raw prompts, raw answers, raw model responses, provider payloads, database URLs, full papers, or customer/customer-like private data.
- Any future command that loads `.env.local` must be treated as secret-sensitive; this task does not execute it.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\02-architecture\interfaces\phase-21-high-risk-tail-contract.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-phase-21-tail-ai-scoring-retry-persistence-design.md docs\05-execution-logs\evidence\phase-21-tail-ai-scoring-retry-persistence-design.md`
- `npm.cmd run build` skipped because this docs-only task does not touch frontend, route, build, runtime, or browser behavior.
- `npm.cmd run test:e2e` skipped for the same docs-only reason unless `Invoke-QualityGate.ps1` runs broader gates internally.
