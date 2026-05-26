# Phase 12 Model Config Schema Migration

## Task

- TaskId: `phase-12-model-config-schema-migration`
- Branch: `codex/phase-12-model-config-schema-migration`
- Goal: verify and extend schema/migration support for redaction-safe `model_provider`, `model_config`, `prompt_template`, and `ai_call_log` metadata without destructive data operations or real secrets.

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

## Allowed Files

- `src/db/schema/**`
- `drizzle/**`
- `src/db/schema/*.test.ts`
- `src/server/models/ai-rag.test.ts`
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
- `scripts/**`

## Implementation Approach

1. RED: extend `src/db/schema/ai-rag.test.ts` to assert Phase 12 metadata columns and indexes.
2. GREEN: add non-destructive schema fields in `src/db/schema/ai-rag.ts`.
3. Add a reviewable Drizzle SQL migration and meta snapshot update with only `ALTER TABLE ADD COLUMN`, `CREATE INDEX`, and enum/schema metadata changes as needed.
4. Update `src/server/models/ai-rag.test.ts` only if schema `$inferSelect` type changes require adjacent test fixture fields for typecheck.
5. Verify migration text contains no `DROP`, `DELETE`, or `TRUNCATE`.
6. Mark the task closed only after focused schema tests, lint, typecheck, agent readiness, naming, git completion readiness, and diff checks pass.

## Risk Defense

- No destructive data operations.
- No real secret storage; only redaction-safe metadata such as secret status, last four marker, rotation timestamp, and references.
- No `.env.local` or `.env.example` read or write.
- No provider/cloud/staging/prod/deployment action.
- No package or lockfile changes.
- Evidence must not contain secret values, tokens, Authorization headers, database URLs, raw provider payloads, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer-like private content.

## Validation Commands

- `npm.cmd run test:unit -- src/db/schema/*.test.ts`
- `npm.cmd run test:unit -- src/db/schema`
- `npm.cmd run test:unit -- src/server/models/ai-rag.test.ts`
- `rg -n "DROP|DELETE|TRUNCATE|model_provider|model_config|prompt_template|secret" drizzle src/db/schema`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
