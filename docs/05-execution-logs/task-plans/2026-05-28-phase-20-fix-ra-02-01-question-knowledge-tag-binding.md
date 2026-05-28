# Phase 20 Fix RA-02-01 Question Knowledge Tag Binding Plan

**Task id:** `phase-20-fix-ra-02-01-question-knowledge-tag-binding`

**Branch:** `codex/phase-20-fix-ra-02-01-question-knowledge-tag-binding`

## Approval Boundary

- Human approval: user approved `phase-20-fix-ra-02-01-question-knowledge-tag-binding` `database_migration` local implementation on 2026-05-28.
- Allowed high-risk scope: local schema, reviewed SQL migration file, repository/service/validator/mapper/test work needed to persist `question` to `knowledge_node` and `tag` bindings.
- Forbidden scope: no `.env.local` read or edit, no `.env.example` edit, no dependency/package/lockfile change, no staging/prod/cloud/deploy/real provider connection, no destructive data operation, no `drizzle-kit push`.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Phase 21/22 planning and status normalization evidence named by the user.

## Finding

`F-RA-02-01-001`: question authoring has DTO/UI placeholders for `knowledgeNodePublicIds` and `tagPublicIds`, but persistent binding is missing. The mapper currently returns empty arrays and the validator omits these fields.

## Implementation Plan

1. Use TDD: add focused failing tests for schema contract, validator normalization, service propagation, and DTO mapping.
2. Add schema for `question_knowledge_node`, `tag`, and `question_tag` with project naming/index rules.
3. Add reviewed local SQL migration only; do not run Drizzle Kit because current config reads `.env.local`.
4. Extend normalized create/update input with `knowledgeNodePublicIds` and `tagPublicIds`.
5. Persist bindings transactionally in the question repository and hydrate public identifiers for list/detail/copy paths.
6. Preserve API DTO camelCase fields and keep internal numeric ids out of responses.
7. Run task validation commands plus local CI gates; record evidence and residual gaps.

## Risk Controls

- Schema changes are additive and preserve existing rows.
- Relationship replacement remains inside the existing question create/update transaction.
- Unknown `knowledge_node` or `tag` public ids are ignored only if existing repository patterns already do so for nullable material; otherwise fail fast in tests if service behavior requires it.
- `drizzle-kit push`, destructive data operations, staging/prod/cloud/provider access, and dependency changes remain blocked.
