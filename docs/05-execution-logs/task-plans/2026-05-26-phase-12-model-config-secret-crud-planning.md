# Phase 12 Model Config Secret CRUD Safe Planning

## Task

- TaskId: `phase-12-plan-model-config-secret-crud`
- Branch: `codex/phase-12-model-config-secret-crud-planning`
- Goal: Convert the blocked provider/model_config/prompt CRUD gate into a closed, planning-only boundary that future implementation tasks can reference without weakening secret, provider, cloud, staging, prod, schema, runtime, dependency, or evidence redaction controls.

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
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-model-config-secret-crud-planning.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-secret-crud-planning.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files And Actions

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
- No secret/env read, write, output, generation, rotation, or injection.
- No provider/cloud/staging/prod connection, configuration, deployment, or real provider call.
- No raw provider payload, raw prompt, raw answer, raw model response, Authorization header, token, database URL, full paper, full textbook, OCR full text, or customer/customer-like private content in evidence.

## Planning Decision

This task closes only the planning gate. It does not implement provider, `model_config`, `model_provider`, or `prompt_template` CRUD.

Future work should be split into independently approvable tasks:

1. `phase-12-model-config-contract-plan`
   - Scope: docs/interface contract only.
   - Purpose: define redaction-safe DTOs, role permissions, fallback semantics, audit fields, and API response envelopes.
   - Still blocked from runtime, schema, env, provider, and prompt content changes.
2. `phase-12-model-config-local-runtime-mock`
   - Scope: local deterministic/mock provider catalog and enable/disable/fallback behavior only, if later approved.
   - Purpose: prove admin operations without real credentials or provider calls.
   - Must not read `.env.local`, call providers, or record raw prompt/model content.
3. `phase-12-prompt-template-contract-plan`
   - Scope: prompt template metadata/versioning contract only.
   - Purpose: define prompt key, version, status, function mapping, rollback semantics, and evidence redaction rules.
   - Raw prompt text storage/editing remains separately gated.
4. `phase-12-secret-env-provider-approval-plan`
   - Scope: approval checklist and owner matrix only.
   - Purpose: define who can create/rotate secrets, where secrets live, quota limits, redaction policy, and rollback owner before any implementation.
   - Must remain blocked until explicit future approval.

## Risk Defense

- Keep this task documentation-only and queue/state-only.
- Treat `model_provider`, `model_config`, and `prompt_template` as glossary identifiers; do not invent new abbreviations.
- Preserve ADR-004 and ADR-005 environment isolation: dev, staging, and prod remain separate; this task creates or changes none of them.
- Preserve AI/RAG contract redaction: no secret, raw prompt, raw answer, raw model response, raw provider payload, raw retrieved chunk, or provider error payload can be recorded.
- Keep future implementation task boundaries small so schema/runtime/UI/provider work cannot be smuggled into a planning commit.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
