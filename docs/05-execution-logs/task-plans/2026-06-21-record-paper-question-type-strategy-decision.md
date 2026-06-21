# Task Plan: Record Paper Question Type Strategy Decision

## Scope

- Task id: `record-paper-question-type-strategy-decision`.
- Branch: `codex/paper-question-type-strategy-decision`.
- User decision: option A, recommended question type distribution only; no hard ratio limit.
- Allowed files are limited to governance state, the existing paper policy document, and this task's plan, evidence, and
  audit review.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Plan

1. Register the follow-up decision in `project-state.yaml` and `task-queue.yaml`.
2. Extend the paper policy document with the option A question type strategy.
3. Record evidence and audit review.
4. Run scoped formatting and Module Run v2 gates.

## Risk Controls

- No source, tests, schema, migration, seed, database, package, lockfile, env, Provider, browser/e2e/dev-server, deploy,
  PR, force-push, payment, external service, or Cost Calibration Gate work.
- The decision is advisory policy only and does not approve implementation.
