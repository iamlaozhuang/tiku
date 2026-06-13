# Task Plan: batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation

## Task

- Task id: `batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation`
- Task kind: `local_verification`
- Branch: `codex/batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation`
- Baseline: `b28ee208eb9653d086ec97a44e1bf2d92c4f2d55`
- Dependency satisfied: `batch-153-personal-learning-ai-route-service-repository-metadata-security-review` is closed.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Batch 146 through batch 153 evidence and audit records under `docs/05-execution-logs/`

## Scope

- Run the queue-declared existing local Playwright validation only:
  - `npm.cmd run test:e2e -- --list`
  - `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- Record redacted evidence with command, pass/fail status, spec name, and test count.
- Update only state, queue, this task plan, this task evidence, and this task audit.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-154-personal-learning-ai-existing-local-e2e-defense-in-depth-validation.md`

## Blocked Files And Actions

- Do not edit `.env.local`, `.env.example`, package files, lockfiles, `src/**`, `tests/**`, `e2e/**`, schema, drizzle, or generated Playwright artifact directories.
- Do not read or write env/secret/provider configuration.
- Do not call any AI provider or run a local provider sandbox.
- Do not write generated content or adopt it into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Do not run full-suite e2e by default, headed/debug e2e, schema/migration, destructive DB, deploy, payment, external-service, PR, force-push, or Cost Calibration work.

## Validation Plan

1. Run pre-edit readiness on the short branch.
2. Run `npm.cmd run test:e2e -- --list`.
3. Run `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`.
4. If Playwright creates `test-results` or `playwright-report`, resolve the paths under `D:\tiku` and remove only those generated artifact directories before commit.
5. Run `git diff --check`.
6. Run `npm.cmd run lint`.
7. Run `npm.cmd run typecheck`.
8. Run `npm.cmd run test:unit`.
9. Run `npm.cmd run build`.
10. Run Module Run v2 pre-commit hardening, module closeout readiness, and pre-push readiness for batch-154.
11. Fast-forward merge to `master`, run closeout/pre-push readiness on `master`, push `origin master`, then delete the merged short branch.

## Risk Controls

- Evidence will not include raw provider payloads, secrets, tokens, database URLs, internal database ids, or generated content.
- Any unexpected source/test/e2e/env/package/schema change is a hard stop.
- Provider/env/dependency/local provider sandbox/generated-content/deploy/payment/external-service/Cost Calibration gates remain blocked.
