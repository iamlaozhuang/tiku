# 2026-07-06 Learner AI Training API UI Loop

## Scope

- Task id: `learner-ai-training-api-ui-loop-2026-07-06`
- Branch: `codex/learner-ai-training-api-ui-loop-2026-07-06`
- Goal step: continue closed-loop item 2 by connecting learner AI training session creation, answer feedback, progress resume, and UI actions to the persisted service/repository path.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`

## Implementation Plan

1. Add RED route and UI tests proving learner AI training session actions still use local-only state and lack REST routes for persisted session create/progress/answer submission.
2. Add thin `/api/v1/personal-ai-generation-learning-sessions` route handlers over the existing service/repository contract, reusing ADR-002 transport, service, repository, and standard response layering.
3. Wire the student AI training UI to create a persisted learning session from an accepted AI generation result before answering.
4. Submit learner answers through the persisted route and load saved progress/feedback through the progress route so refresh/resume uses stored state.
5. Preserve formal write boundaries: no automatic formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
6. Run focused tests, typecheck, lint, full unit, formatting, diff checks, Module Run v2 gates, and write redacted evidence/audit.

## Boundaries

- No Provider call, Provider configuration, Cost Calibration, browser runtime, dev server, e2e, staging/prod, dependency, schema, migration, seed, env/secret access, runtime DB connection, direct DB mutation, or cleanup/reset.
- Evidence must not include raw generated question/material/paper content, raw DB rows, internal ids, credentials, env values, prompts, Provider payloads, raw AI I/O, screenshots, traces, cookies, tokens, session material, Authorization headers, or PII.
