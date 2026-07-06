# 2026-07-05 Learner AI Training Attempt Stats Plan

## Task

- Task id: `learner-ai-training-attempt-stats-2026-07-05`
- Branch: `codex/learner-ai-training-attempt-stats-2026-07-05`
- Goal: extend the learner AI learning-session contract so personal advanced students and organization advanced employees can have saved answer feedback and a resumable statistics snapshot for AI出题 and AI组卷 generated drafts.

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
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/05-execution-logs/task-plans/2026-07-05-ai-generation-learning-session-loop.md`
- `docs/05-execution-logs/evidence/2026-07-05-ai-generation-learning-session-loop.md`
- Relevant learner AI learning-session source and tests.

## First-Principles Boundary

- Generated learner AI content is not governed formal `question`, `paper`, `practice`, `answer_record`, `exam_report`, or `mistake_book` content.
- A stable learner closed loop still needs durable session state: created questions, saved answer feedback, resume status, and aggregate statistics.
- The reusable service should own scoring and statistics so UI, future DB adapters, and role-specific routes do not duplicate logic.

## Scope

- In scope:
  - Service contract/model additions for saved learner AI answer feedback.
  - A resumable progress/statistics read model for personal and organization-owned learner AI sessions.
  - TDD coverage for personal and organization employee ownership contexts.
  - Formal write boundaries remain blocked.
- Out of scope:
  - DB schema/migration/seed, direct DB connection/mutation, Provider execution, env/secret access, browser runtime, dev server, dependency changes, staging/prod/deploy, release readiness, and final Pass.

## Implementation Plan

1. Add RED service tests proving answer feedback is saved, latest feedback is used, progress can be resumed, and actor isolation blocks cross-user reads.
2. Extend the learning-session contract and repository interface with saved feedback and progress read operations.
3. Implement statistics calculation in the service using existing normalized feedback and formal write boundaries.
4. Run focused tests, typecheck, lint, full unit where feasible, scoped formatting, diff checks, and Module Run v2 gates.

## Stop Rules

- Stop if this requires schema/migration/seed changes or DB access; those need a separate bounded DB task.
- Stop if the implementation writes or implies formal `practice`, `answer_record`, `exam_report`, or `mistake_book`.
- Stop if role isolation would require exposing raw employee generated content to organization admins.
