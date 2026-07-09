# Content AI adoption read model plan

## Scope

- Task: restore content-admin AI generation history read model after formal adoption.
- Branch: `codex/content-ai-adoption-read-model`
- Boundary: read-model/API/UI status only; no Provider execution, no direct DB connection or mutation, no schema/migration/seed, no dependency or package/lockfile change.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`

## Implementation Plan

1. Extend admin AI generation result persistence read model to include the matching platform formal-adoption row without N+1 queries.
2. Map adoption review/write status into API DTO fields that can distinguish pending review, rejected, approved, and draft-created states.
3. Update content AI UI labels/actions to use persisted adoption state after refresh.
4. Add focused unit coverage for the read-model mapping and UI state.

## Validation

- Targeted unit tests for admin AI generation result persistence/read-model and content AI UI.
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `git diff --check`

## Risk Review

- Preserve redacted evidence only.
- Do not expose raw generated content, Provider payloads, prompts, DB rows, session, token, credential, env, or internal numeric ids.
- Do not weaken content-admin/super-admin adoption authorization.
- Do not change formal content write behavior or paper publish behavior in this branch.
