# Phase 20 Fix RA-02-03 Question Knowledge Tag Filters Plan

**Task id:** `phase-20-fix-ra-02-03-question-knowledge-tag-filters`

**Branch:** `codex/phase-20-fix-ra-02-03-question-knowledge-tag-filters`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
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
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-02-question-paper-content.md`

## Approval Boundary

- Human approval: user approved `phase-20-fix-ra-02-03-question-knowledge-tag-filters` implementation on 2026-05-28.
- Approved risk: local `database_migration` boundary only when reusing the already landed `question_knowledge_node` and `question_tag` tables.
- Stop condition: if implementation requires new schema, new migration, `drizzle/**`, or `src/db/schema/**`, stop and record blocked evidence before changing those files.
- Still forbidden: `.env.local`, `.env.example`, package/lockfile/dependency changes, staging/prod/cloud/deploy/real provider, destructive data operations, and `drizzle-kit push`.

## Implementation Plan

1. Add RED tests for API query propagation and service/repository list filtering by `knowledgeNodePublicId` and `tagPublicId`.
2. Extend list-query normalization with nullable single public identifier filters while preserving existing pagination and filter behavior.
3. Extend the question route reader to pass the new query params.
4. Add repository SQL conditions using the existing `question_knowledge_node` and `question_tag` relationship tables, without schema or migration edits.
5. Run focused tests, then task validation commands and local CI gates.
6. Update evidence, task queue, and project state; commit, merge to `master`, validate, push, and delete the short-lived branch after successful closeout.

## Risk Defense

- Use Drizzle query builders only; no raw SQL strings.
- Keep DTO shape unchanged; list filters affect selection only and continue returning `knowledgeNodePublicIds` and `tagPublicIds`.
- Avoid UI changes unless backend route/service tests show a necessary gap; existing UI already has client-side filter controls.
- Security review is recorded in task evidence because this changes API query behavior over admin/content data.
