# Phase 12 Secret Env Provider Approval Plan

## Task

- TaskId: `phase-12-secret-env-provider-approval-plan`
- Branch: `codex/phase-12-secret-env-provider-approval-plan`
- Goal: document the approval gate for future real provider, staging, prod, secret storage, env injection, quota, logging, rollback, and rotation work.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-local-mock-runtime.md`

## allowedFiles

- `docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Plan

1. Extend the staging secret/env plan with a Phase 12 provider approval runbook.
2. Extend the AI/RAG contract with a blocked future-real-provider task boundary.
3. Record owner matrix, approval evidence requirements, storage responsibility, rotation, quota, cost, logging redaction, rollback, and incident gates.
4. Keep future real provider / secret / staging / prod work blocked until separate explicit human approval.
5. Run docs-only validation gates and close out.

## Risk Defenses

- No source, schema, migration, package, lockfile, env, script, cloud, staging, prod, or provider changes.
- No secret values, keys, tokens, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, or raw model responses in evidence.
- The runbook records names, responsibilities, and gates only.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to provider/cloud/staging/prod or deploy.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full教材, full试卷, OCR full text, or private customer-like data.
