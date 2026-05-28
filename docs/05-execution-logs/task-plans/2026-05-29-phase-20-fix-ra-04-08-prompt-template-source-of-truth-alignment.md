# Phase 20 Fix RA-04-08 Prompt Template Source Of Truth Alignment Plan

**Task id:** `phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`

**Branch:** `codex/phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md`

## Finding

`F-RA-04-08-001`: prompt template source of truth is split between static definitions, local `dev_*` runtime keys, and admin mutation routes.

## Implementation Plan

1. Align local/mock runtime prompt template keys and template hashes to `src/ai/prompts/templates.ts` definitions.
2. Keep prompt template REST surface read-only for the first-phase server-config source-of-truth policy by returning an unavailable response from create/update/enable/disable handlers without calling repositories.
3. Update focused tests so redaction-safe prompt metadata still appears in lists and AI call logs, while prompt template mutation is blocked.
4. Do not include raw prompt bodies in evidence.

## Risk Controls

- No schema, migration, drizzle, package, lockfile, env, external service, real provider, cloud, deploy, auth permission, or destructive data change.
- Do not delete route files; keep route shape stable but make prompt template mutations unavailable.
- Prompt template bodies remain in static source files and are not copied into evidence.
