# Phase 12 Model Config Server Runtime Task Plan

## Task

- TaskId: `phase-12-model-config-server-runtime`
- Branch: `codex/phase-12-model-config-server-runtime`
- Goal: implement redaction-safe server contracts, validators, repositories, services, API routes, and unit tests for `model_provider`, `model_config`, and `prompt_template` management.

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
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-model-config-secret-crud-planning.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-secret-crud-planning.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`

## allowedFiles

- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/models/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/model-providers/**`
- `src/app/api/v1/prompt-templates/**`
- `tests/unit/**`
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
- `drizzle/**`
- `src/db/schema/**`
- `scripts/**`

## Implementation Plan

1. Add failing unit coverage for redaction-safe `model_provider`, `model_config`, and `prompt_template` runtime route handlers.
2. Extend admin AI runtime DTO contracts with masked secret metadata, status, fallback ordering, and prompt template metadata.
3. Extend validators so short-lived secret input is converted to masked metadata only; no returned DTO contains secret values.
4. Extend runtime service handlers for list/create/update/enable/disable/reorder operations with `super_admin` mutation gates and redacted audit metadata.
5. Add route exports under `/api/v1/model-providers`, `/api/v1/model-configs`, and `/api/v1/prompt-templates` while preserving the API envelope.
6. Implement repository interface and Postgres methods conservatively enough for runtime integration without destructive data operations or env reads in tests.
7. Run required validation, write evidence, close queue/state, commit, merge to `master`, re-run gates, append post-merge evidence, push, and delete the branch.

## Risk Defenses

- Tests inject repositories and session service so unit runs do not read `.env.local` or connect to a database.
- Secret input is accepted only as short-lived request body data and converted to `apiKeyLastFour`, `secretStatus`, and `maskedSecret` metadata.
- Audit metadata uses fixed redacted summaries and never serializes request bodies, Authorization headers, raw prompt content, raw answers, raw model responses, or raw provider payloads.
- API paths use kebab-case plural nouns and DTO JSON fields use camelCase.
- No dependency or lockfile changes are allowed.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/*model* src/server/services/*model*test.ts src/server/services/*prompt*test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to real providers, cloud, staging, prod, or deployment targets.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, complete textbooks, complete papers, OCR full text, or private customer-like data.
- Do not write real provider keys to database, logs, evidence, tests, snapshots, or frontend.
