# Phase 12 Model Config Local Mock Runtime Task Plan

## Task

- TaskId: `phase-12-model-config-local-mock-runtime`
- Branch: `codex/phase-12-model-config-local-mock-runtime`
- Goal: keep AI scoring, explanation, hint, knowledge recommendation, and learning suggestion on local mock/deterministic providers while attaching redaction-safe model_config runtime metadata to AI call logs.

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
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-admin-ui.md`

## allowedFiles

- `src/server/services/*ai*`
- `src/server/services/*model*`
- `src/server/services/*mock*`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `tests/unit/**`
- `e2e/**`
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

1. Add failing unit tests for local mock runtime selection and redaction-safe AI call log metadata.
2. Add a service-level helper that derives redaction-safe model_config metadata from `ModelConfigSnapshot`.
3. Include that metadata in AI call log draft `requestRedactedSnapshot` for scoring, explanation, hint, knowledge recommendation, and learning suggestion mock runtime.
4. Preserve local deterministic/mock provider behavior and fallback selection.
5. Ensure no raw prompt, answer, provider payload, model output, secret, or env value is stored in metadata.
6. Run unit, E2E, build, lint, typecheck, agent readiness, naming, git readiness, and diff checks.

## Risk Defenses

- No real provider calls, env reads, cloud/staging/prod access, or deployment.
- No schema/migration changes.
- Metadata helper derives only public IDs, function type, model name, prompt template key/version, timeout/retry, fallback public ID, and static redaction policy.
- Tests assert synthetic raw prompt/provider strings are absent from AI call log drafts.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/*ai* tests/unit/*model* src/server/services/*ai*test.ts src/server/services/*model*test.ts`
- `npm.cmd run test:e2e`
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
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full教材, full试卷, OCR full text, or customer-like private data.
