# Phase 12 Model Config Contract Plan

## Task

- TaskId: `phase-12-model-config-contract-plan`
- Branch: `codex/phase-12-model-config-contract-plan`
- Goal: define the redaction-safe SSOT and interface contract for `model_provider`, `model_config`, `prompt_template`, fallback, masking, audit metadata, API envelope, and future task boundaries.

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

- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

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

1. Update `admin-ops-contract.md` with REST paths, `super_admin` permission boundaries, DTO names, masking rules, fallback ordering, prompt template metadata, and audit metadata constraints.
2. Update `ai-rag-contract.md` with Phase 12 local/dev model configuration boundaries, redaction-safe DTO fields, secret input constraints, fallback rules, and snapshot fields.
3. Mark this task closed and keep the next queue task as `phase-12-model-config-schema-migration`.
4. Record evidence showing no runtime/schema/migration/UI/test/dependency/provider/env changes.

## Risk Defense

- No schema, migration, runtime, UI, tests, scripts, package, lockfile, or environment files.
- No `.env.local` or `.env.example` read or write.
- No real provider, cloud, staging, prod, deployment, or secret manager action.
- No raw provider payload, raw prompt, raw answer, raw model response, raw retrieved chunk, full paper, full textbook, OCR full text, or customer-like private content in evidence.
- Future implementation tasks stay split into schema/migration, server runtime, admin UI, local mock runtime, and secret/env/provider approval plan.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
