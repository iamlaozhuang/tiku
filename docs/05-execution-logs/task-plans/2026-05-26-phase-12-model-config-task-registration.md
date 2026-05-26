# Phase 12 Model Config Task Registration

## Task

- TaskId: `phase-12-model-config-task-registration`
- Branch: `codex/phase-12-model-config-task-registration`
- Goal: register a complete, reviewable Phase 12 task group for redaction-safe `model_provider`, `model_config`, `prompt_template`, local mock runtime, and future secret/env/provider approval boundaries.

## Standards Read

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
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-model-config-secret-crud-planning.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-secret-crud-planning.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-model-config-task-registration.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-task-registration.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

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

## Implementation Approach

Append one closed registration task and five pending follow-up tasks:

1. `phase-12-model-config-contract-plan`
2. `phase-12-model-config-schema-migration`
3. `phase-12-model-config-server-runtime`
4. `phase-12-model-config-admin-ui`
5. `phase-12-model-config-local-mock-runtime`
6. `phase-12-secret-env-provider-approval-plan`

The registration commit does not modify contracts or runtime. It only makes the future queue explicit so each task can start from clean `master` and close independently.

## Risk Defense

- No source code, schema, migration, package, lockfile, script, or environment file changes.
- No `.env.local` or `.env.example` read or write.
- No provider/cloud/staging/prod/deployment action.
- No destructive migration or data operation.
- No real secret, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer-like private content in evidence.
- Later tasks remain individually gated by allowedFiles, blockedFiles, dependencies, validations, evidence, commit, merge, push, and branch cleanup.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
