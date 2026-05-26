# Phase 12 Model Config Admin UI Task Plan

## Task

- TaskId: `phase-12-model-config-admin-ui`
- Branch: `codex/phase-12-model-config-admin-ui`
- Goal: add a management UI component for redaction-safe `model_provider`, `model_config`, and `prompt_template` list/create/edit/enable/disable/fallback display.

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
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-server-runtime.md`

## allowedFiles

- `src/features/admin/**`
- `src/components/admin/**`
- `tests/unit/*admin*model*`
- `tests/unit/**`
- `e2e/content-action-closures.spec.ts`
- `e2e/*model*`
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
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Plan

1. Add failing unit tests for loading/empty/error states and the redaction-safe management workflow.
2. Create a feature component under `src/features/admin/model-config-management/` using existing UI tokens and controls.
3. Support model provider, model config, and prompt template tabs with list/create/edit/enable/disable and fallback priority display.
4. Ensure short-lived secret input is cleared after submit and only masked state is rendered.
5. Ensure raw prompt body is never rendered; prompt templates show digest and masked preview only.
6. Run unit, E2E, build, lint, typecheck, agent readiness, naming, git readiness, and diff checks.

## Risk Defenses

- No app route wiring in this task because `src/app/**` is outside the task queue allowedFiles.
- No package/lockfile/env/schema/migration changes.
- No real provider calls or env reads.
- Tests use synthetic placeholder secret/prompt inputs and assert they are not displayed after save.
- UI text and controls remain code-native; no secret or raw prompt evidence is recorded.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/*admin*model*`
- `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to provider/cloud/staging/prod or deploy.
- Do not record real secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, complete教材, complete试卷, OCR full text, or private customer-like data.
