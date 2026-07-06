# 2026-07-05 Learner AI Training DB Persistence Loop Plan

## Task

- Task id: `learner-ai-training-db-persistence-loop-2026-07-05`
- Branch: `codex/learner-ai-training-db-loop-2026-07-05`
- Goal: add the database persistence foundation for learner AI learning sessions and saved answer feedback so AI出题 and AI组卷 can become resumable beyond in-memory UI state.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-05-learner-ai-training-attempt-stats.md`
- Existing `ai-rag` schema, schema tests, migrations, and personal AI result/request repositories.

## First-Principles Boundary

- A resumable learner AI session needs persisted generated-question snapshots and persisted answer feedback.
- The persistence domain must remain separate from formal `practice`, `answer_record`, `exam_report`, and `mistake_book`.
- Organization employee learner AI sessions must retain actor ownership and organization owner metadata without exposing raw employee answers to organization admins.

## Scope

- In scope:
  - DB schema definitions for learner AI learning session and answer feedback rows.
  - Drizzle migration generation/update for those schema definitions.
  - Schema tests proving table names, columns, indexes, FKs, and forbidden formal/provider columns.
- Out of scope:
  - Runtime DB mutation/migrate execution, route/API wiring, UI wiring, Provider execution, browser runtime, dev server, dependency changes, staging/prod/deploy, release readiness, and final Pass.

## DB And Credential Boundary

- `.env.local` may be read only by existing Drizzle config if `drizzle-kit generate` needs `DATABASE_URL`; values must not be printed or recorded.
- No direct application DB read, raw row output, destructive operation, cleanup/reset, seed, or production/staging DB operation is allowed in this task.
- Generated migration SQL and Drizzle metadata are repository files and may be reviewed/committed.

## Implementation Plan

1. Add RED schema tests for `personal_ai_generation_learning_session` and `personal_ai_generation_learning_answer_feedback`.
2. Add Drizzle schema definitions using glossary-compliant singular table names and public-id lookup indexes.
3. Generate or update migration artifacts through Drizzle Kit.
4. Run focused schema tests, typecheck, lint, full unit where feasible, formatting, diff checks, and Module Run v2 gates.

## Stop Rules

- Stop if Drizzle generation requires dependency changes.
- Stop if migration generation attempts destructive SQL or touches unrelated tables.
- Stop if the schema adds formal `practice`, `answer_record`, `exam_report`, `mistake_book`, raw prompt, Provider payload, or raw AI I/O columns.
