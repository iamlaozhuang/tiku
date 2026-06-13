# Task Plan: batch-143-personal-learning-ai-local-role-flow-persistent-history-validation

## Baseline

- Branch: `codex/batch-143-personal-learning-ai-local-role-flow-persistent-history-validation`
- Baseline HEAD/master/origin/master: `e2068bfdd1632f3fe2324db189293a228f4c09e2`
- Pre-edit readiness: passed; no tracked, staged, or untracked changes before this plan/status update.
- Dependency: `batch-142-personal-learning-ai-persistent-history-security-review` is `closed` / `pass`.

## Governance Read

- `AGENTS.md` project instructions supplied in the session.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-143-personal-learning-ai-local-role-flow-persistent-history-validation.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-143-personal-learning-ai-local-role-flow-persistent-history-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-143-personal-learning-ai-local-role-flow-persistent-history-validation.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, package/lockfiles, `src/**`, `tests/**`, `e2e/**`, `drizzle/**`,
  `playwright-report/**`, and `test-results/**`.
- Product source edits, e2e spec authoring or modification, schema/migration, provider calls, generated-content
  persistence, dependency/env/secret/deploy/payment/external-service work, PR, force-push, full-suite e2e expansion, and
  Cost Calibration Gate execution remain blocked.

## Validation Plan

- Run the queue-declared existing local e2e spec only:
  `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- Also run the user-required local gates for this task:
  `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit`, and `npm.cmd run build`.
- Run `git diff --check`.
- Write redacted evidence and audit with only command, pass/fail, spec name, and test count for the local e2e evidence.
- Run Module Run v2 pre-commit hardening, module closeout readiness, and pre-push readiness.

## Risk Controls

- Do not record provider payload, raw generated content, full paper content, credentials, bearer tokens, database rows,
  or screenshots.
- Do not edit e2e spec or source code if the existing spec fails; record the failure and stop for a follow-up task.
- Treat provider/generated-content/staging/prod/deploy/payment/external-service and Cost Calibration Gate as blocked
  remainders.
