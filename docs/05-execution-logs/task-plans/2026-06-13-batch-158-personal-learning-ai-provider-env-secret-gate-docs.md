# Task Plan: batch-158-personal-learning-ai-provider-env-secret-gate-docs

## Task

- Task id: `batch-158-personal-learning-ai-provider-env-secret-gate-docs`
- Task kind: `blocked_gate`
- Branch: `codex/batch-158-personal-learning-ai-provider-env-secret-gate-docs`
- Baseline: `fdf99a625d78963fc8fea93e660edad8b0587e7d`
- Dependency satisfied: `batch-157-personal-learning-ai-dependency-introduction-gate-docs` is closed.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-13-batch-157-personal-learning-ai-dependency-introduction-gate-docs.md`

## Scope

- Record docs-only provider key destination, environment variable naming, secret handling boundaries, redaction rules,
  and fresh approval requirements for future personal-learning-ai provider work.
- Update only project state, task queue status for this task, this task plan, this task evidence, and this task audit.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-158-personal-learning-ai-provider-env-secret-gate-docs.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-158-personal-learning-ai-provider-env-secret-gate-docs.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-158-personal-learning-ai-provider-env-secret-gate-docs.md`

## Blocked Files And Actions

- Do not read, create, or modify `.env.local`, `.env.example`, any env file, secret file, provider configuration, or
  provider key destination.
- Do not edit `package.json`, any lockfile, `src/**`, `tests/**`, `e2e/**`, schema, drizzle, materials, paper assets, or
  generated Playwright artifact directories.
- Do not install dependencies, call providers, configure provider endpoints, run local provider sandbox, write generated
  content, deploy, touch payment or external-service surfaces, create a PR, force-push, or execute Cost Calibration.

## Validation Plan

1. Run pre-edit readiness on the short branch.
2. Record provider/env/secret gate evidence without reading or writing env/secret files.
3. Run Prettier check on changed docs/state files.
4. Run `git diff --check`.
5. Run the queue-declared anchor check for `provider key destination`, `environment variable naming`,
   `provider/env/secret work remains blocked`, and `Cost Calibration Gate remains blocked`.
6. Run `npm.cmd run lint`.
7. Run `npm.cmd run typecheck`.
8. Run `npm.cmd run test:unit`.
9. Run `npm.cmd run build`.
10. Run Module Run v2 pre-commit hardening, module closeout readiness, and pre-push readiness for batch-158.
11. Fast-forward merge to `master`, run closeout/pre-push readiness on `master`, push `origin master`, then delete the
    merged short branch.

## Risk Controls

- Evidence will not include secret values, provider payloads, database URLs, raw generated content, or internal
  autoincrement ids.
- Any env/secret/provider configuration read or write is a hard stop.
- Future provider/env/secret work must use a separate queued task with explicit fresh approval and redacted evidence.
