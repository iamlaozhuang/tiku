# Phase 14 Local Runtime Baseline Task Plan

**Task id:** `phase-14-local-runtime-baseline`

**Branch/worktree:** `codex/phase-14-local-runtime-baseline` / `.worktrees/phase-14-local-runtime-baseline`

**Date:** 2026-05-26

## Goal

Fix local e2e baseline instability caused by Next dev runtime Postgres connection exhaustion, then verify the full local e2e suite. Keep the scope local-only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-14-local-e2e-baseline-diagnostics.md`

## Scope

Allowed:

- Local runtime database connection management.
- Targeted route error envelope hardening when a service/repository throws unexpectedly.
- Tests and evidence needed to prove local e2e stability.

Forbidden:

- Do not read, modify, output, or summarize `.env.local` or `.env.example`.
- Do not modify dependencies, package manifests, lockfiles, schema, migrations, scripts, staging/prod/cloud, real provider configuration, deployment, or PRs.
- Do not run destructive seed reset, data cleanup, or migration.
- Do not record secrets, tokens, Authorization headers, database URLs, raw prompts, raw answers, raw model responses, raw provider payloads, full paper/textbook/OCR text, or customer-like private data.

## TDD Plan

1. RED: add a unit test proving runtime Postgres client creation is shared per process/cache key.
2. RED: add a unit test proving a route handler returns a standard JSON envelope when its service throws.
3. GREEN: implement a shared runtime Postgres client registry and wire local runtime database creators through it.
4. GREEN: add targeted route error envelope wrapper on the routes observed in the failing baseline.
5. Run focused unit tests, then targeted e2e specs, then full gates.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/runtime-database-baseline.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`
- `npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts`
- `npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
