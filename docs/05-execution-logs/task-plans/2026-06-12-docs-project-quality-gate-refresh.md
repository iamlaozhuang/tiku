# docs-project-quality-gate-refresh Task Plan

## Task

- Task id: `docs-project-quality-gate-refresh`
- Branch: `codex/docs-project-quality-gate-refresh`
- Task kind: `docs_state_closeout`
- Date: 2026-06-12
- Source: health audit follow-up queue

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-006
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Health audit and follow-up task evidence created on 2026-06-12

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, and audit review

Blocked work:

- No product repair, dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, e2e execution, PR, force-push, or Cost Calibration Gate work.

## Approach

- Mark the health follow-up repair/ADR tasks as closed in `task-queue.yaml`.
- Refresh `project-state.yaml` with the current health follow-up closeout status, quality gate results, and next recommendation.
- Write final evidence and audit review summarizing commits, pushes, validations, residual risk, and self-review.
- Run full local unit tests plus lint/typecheck/build/diff check as the final self-review gate.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `git diff --check`

## Stop Conditions

- Stop if final validation requires e2e, provider, env/secret, dependency, schema/migration, deploy, payment, or external-service work.
- Stop if `master` or `origin/master` diverges and cannot be fast-forwarded.
