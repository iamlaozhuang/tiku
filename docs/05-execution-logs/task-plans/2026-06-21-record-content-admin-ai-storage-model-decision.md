# Task Plan: Record Content Admin AI Storage Model Decision

## Scope

- Task id: `record-content-admin-ai-storage-model-decision`.
- Branch: `codex/content-admin-ai-storage-model-decision`.
- User decision: option A, use an isolated AI generation result or draft review surface before formal `question` or
  `paper` adoption.
- Allowed files are limited to governance state, the existing content_admin AI policy document, and this task's plan,
  evidence, and audit review.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Plan

1. Register the follow-up storage model decision in `project-state.yaml` and `task-queue.yaml`.
2. Extend the content_admin AI policy document with the option A isolated review-surface rule.
3. Record evidence and audit review.
4. Run scoped formatting and Module Run v2 gates.

## Risk Controls

- No source, tests, schema, migration, seed, database, model output persistence, Provider call, prompt/provider payload,
  package, lockfile, env, browser/e2e/dev-server, deploy, PR, force-push, payment, external service, or Cost Calibration
  Gate work.
- This records the storage model decision only; implementation remains blocked until fresh approval.
