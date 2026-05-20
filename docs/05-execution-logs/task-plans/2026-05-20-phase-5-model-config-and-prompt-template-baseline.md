# Phase 5 Model Config And Prompt Template Baseline Task Plan

## Metadata

- Task id: `phase-5-model-config-and-prompt-template-baseline`
- Branch: `codex/phase-5-model-config-and-prompt-template-baseline`
- Base: `master`
- Date: 2026-05-20
- Task type: schema, model, validator, prompt template baseline

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-rag-contract-and-threat-model-baseline.md`

## Goal

Add the Phase 5 baseline for `model_provider`, `model_config`, and `prompt_template` without introducing dependencies, environment variables, migrations, or real provider calls.

## Scope

Allowed outputs:

- Task plan, evidence, and security review for this task.
- `src/db/schema/**` for schema and schema tests.
- `src/server/models/**` for inferred row types and snapshot helpers.
- `src/server/contracts/**` for camelCase DTO contracts.
- `src/server/validators/**` for server-side input normalization.
- `src/ai/**` for static prompt template definitions.
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked outputs:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Keep work in the isolated worktree `F:\tiku\.worktrees\phase-5-model-config-and-prompt-template-baseline`.
2. Write failing tests for AI schema table names, columns, indexes, enum values, model config snapshot redaction, scoring fallback rejection, and prompt template registration.
3. Add `src/db/schema/ai-rag.ts` and export it from `src/db/schema/index.ts`.
4. Add `src/server/models/ai-rag.ts` for row types, AI function types, and `createModelConfigSnapshot`.
5. Add `src/server/contracts/ai-rag-contract.ts` for camelCase DTO shapes without numeric ids or secrets.
6. Add `src/server/validators/ai-rag.ts` for provider/config/template normalization, API key display derivation, timeout/retry bounds, and scoring fallback prevention.
7. Add `src/ai/prompts/templates.ts` with versioned prompt template definitions for `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, and `learning_suggestion`.
8. Create security review with `APPROVE` or non-blocking `COMMENT` only.
9. Update queue/state to mark this task done and hand off to `phase-5-ai-call-log-and-redaction-baseline`.
10. Run validation commands and record evidence.

## Risk Controls

- No real API keys, placeholder secrets, or provider credentials are written.
- Provider API key input normalization stores only last-four display metadata in this baseline.
- `model_config` snapshots omit provider secret references and preserve repeatability metadata only.
- `ai_scoring` rejects fallback model config references to preserve scoring consistency.
- Prompt templates are versioned static definitions and do not execute model calls.
- No migration files are generated in this task.
- Public DTOs use `publicId` and camelCase; numeric ids remain internal row fields only.

## Validation Plan

Run and record:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-model-config-and-prompt-template-baseline`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --name-only -- package.json pnpm-lock.yaml package-lock.json drizzle/** .env.example`
- `git status --short --branch`
