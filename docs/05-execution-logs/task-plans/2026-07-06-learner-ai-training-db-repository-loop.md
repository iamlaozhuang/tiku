# 2026-07-06 Learner AI Training DB Repository Loop

## Scope

- Task id: `learner-ai-training-db-repository-loop-2026-07-06`
- Branch: `codex/learner-ai-training-db-repository-loop-2026-07-06`
- Goal step: continue closed-loop item 2 by connecting learner AI learning sessions to the new persistence tables.

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
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`

## Implementation Plan

1. Add RED tests proving the learning-session repository is missing and the service incorrectly allows `sourceResultPublicId: null` for a DB-persisted session.
2. Add a Drizzle-backed repository adapter for `personal_ai_learning_session` and `personal_ai_learning_answer_feedback`, reusing ADR-002 service/repository layering.
3. Enforce persisted source-result linkage before session creation so the DTO and DB foreign-key contract stay aligned.
4. Keep answer feedback as an upserted latest record per session question and preserve blocked formal write boundaries.
5. Run focused tests, typecheck, lint, full unit, formatting, diff checks, Module Run v2 gates, and write redacted evidence/audit.

## Boundaries

- No Provider call, Provider configuration, Cost Calibration, browser runtime, dev server, e2e, staging/prod, dependency, schema, migration, seed, env/secret access, runtime DB connection, or DB mutation.
- Evidence must not include raw generated question/material/paper content, raw DB rows, internal ids, credentials, env values, prompts, Provider payloads, raw AI I/O, screenshots, traces, cookies, tokens, or PII.
