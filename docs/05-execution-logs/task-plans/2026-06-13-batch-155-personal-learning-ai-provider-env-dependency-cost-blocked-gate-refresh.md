# Task Plan: batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh

## Task

- Task id: `batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh`
- Task kind: `blocked_gate`
- Branch: `codex/batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh`
- Baseline: `c0b25394c733f7eb57b20473eadaed38a866c32e`
- Dependency satisfied: `batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation` is closed.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-13-batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`

## Scope

- Record the post-hardening blocked gate for dependency introduction, provider/env/secret work, local provider sandbox,
  generated-content writes, deploy/payment/external-service work, and Cost Calibration.
- Confirm no env/secret, package/lockfile, provider call, provider configuration, local provider sandbox, deployment,
  payment, external-service, generated-content write, or Cost Calibration action occurred.
- Update only state, queue, this task plan, this task evidence, and this task audit.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-155-personal-learning-ai-provider-env-dependency-cost-blocked-gate-refresh.md`

## Blocked Files And Actions

- Do not edit `.env.local`, `.env.example`, package files, lockfiles, `src/**`, `tests/**`, `e2e/**`, schema, drizzle,
  materials, paper assets, or generated Playwright artifact directories.
- Do not read or write env/secret/provider configuration.
- Do not install, remove, or upgrade dependencies.
- Do not call any AI provider or run a local provider sandbox.
- Do not write generated content or adopt it into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or
  `mistake_book`.
- Do not run e2e, schema/migration, destructive DB, deploy, payment, external-service, PR, force-push, or Cost
  Calibration work.

## Validation Plan

1. Run pre-edit readiness on the short branch.
2. Record blocked-gate evidence and audit.
3. Run `git diff --check`.
4. Run the queue-declared `Select-String` blocked-gate anchor check.
5. Run `npm.cmd run lint`.
6. Run `npm.cmd run typecheck`.
7. Run `npm.cmd run test:unit`.
8. Run `npm.cmd run build`.
9. Run Module Run v2 pre-commit hardening, module closeout readiness, and pre-push readiness for batch-155.
10. Fast-forward merge to `master`, run closeout/pre-push readiness on `master`, push `origin master`, then delete the
    merged short branch.

## Risk Controls

- Evidence will not include secrets, tokens, provider payloads, database URLs, raw generated content, or internal
  autoincrement ids.
- Any unexpected source/test/e2e/env/package/schema/provider/deploy change is a hard stop.
- Future provider, env, dependency, generated-content, deploy, payment, external-service, and Cost Calibration work must
  be separately queued and freshly approved.
