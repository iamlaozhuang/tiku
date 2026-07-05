# 2026-07-05 AI Generation Learning Session Loop Plan

## Task

- Task id: `ai-generation-learning-session-loop-2026-07-05`
- Branch: `codex/ai-generation-learning-loop-2026-07-05`
- Goal: create the first reusable closed-loop service for learner AI generated question drafts so personal advanced students and organization advanced employees can answer the current generated draft and receive objective feedback without writing formal question, paper, practice, answer_record, exam_report, or mistake_book data.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- Relevant AI generation, result persistence, practice, and student experience source files.

## First-principles Boundary

- AI generated learner content is not formal vetted content.
- Formal practice and mistake_book records depend on formal paper/question lineage.
- Therefore the first closed-loop step must be an isolated learning session over the current parsed AI draft, with explicit formal write blocks and deterministic local scoring only for objective questions.

## Scope

- In scope:
  - A reusable server-side contract/model/validator/service for isolated personal AI learning sessions.
  - Conversion from parsed AI question draft summaries into session questions.
  - Canonical supported question types: `single_choice`, `multi_choice`, `true_false`, `short_answer`.
  - Deterministic objective answer feedback for `single_choice`, `multi_choice`, and `true_false`.
  - Rejection of weak grounding, empty generated question content, and paper summary-only drafts.
- Out of scope:
  - UI wiring, browser runtime, DB connection, DB mutation, schema/migration/seed changes, Provider execution, AI scoring, formal adoption, formal practice, answer_record, exam_report, mistake_book, staging/prod, dependency changes, release readiness, and final production claims.

## Implementation Plan

1. Add RED focused unit tests for isolated session creation, objective answer feedback, weak evidence rejection, and paper summary-only rejection.
2. Add contracts, model types, validator helpers, and service implementation that reuse existing route-integrated structured preview DTOs.
3. Keep all formal writes blocked by explicit status fields and absent repository calls.
4. Run focused tests, typecheck, lint, scoped prettier, diff checks, Module Run v2 gates, then update evidence/audit/state.

## Stop Rules

- Stop if implementation requires Provider execution, Provider credentials, env secret reads, DB connection, DB mutation, schema/migration/seed, dependency changes, browser runtime, dev server, or full generated content in evidence.
- Stop if the service would blur isolated AI learning with formal practice, answer_record, exam_report, or mistake_book.
