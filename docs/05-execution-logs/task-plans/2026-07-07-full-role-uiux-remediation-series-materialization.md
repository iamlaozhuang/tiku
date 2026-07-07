# Full-role UI/UX remediation series materialization task plan

Date: 2026-07-07

## Objective

Materialize the approved serial UI/UX remediation baseline work before starting batch 0.

This task creates the series plan, queues batches 0-5, records the post-batch design board as a separate deferred task, and updates state/evidence/audit. It does not perform UI redesign implementation.

## Read gate

Read or refreshed before execution:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- Advanced edition authorization and UI/UX requirement indexes
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- Product Design audit instructions and critical overrides

## Planned changes

- Add series traceability plan.
- Add this task plan.
- Add redacted evidence.
- Add adversarial audit review.
- Update project state to the materialization task.
- Update task queue with:
  - closed materialization task,
  - pending batch 0,
  - pending batches 1-5, serially dependent,
  - deferred repository-external local design board materialization task.

## Guardrails

- Docs/state only.
- No source, tests, package, lockfile, env, schema, migration, seed, DB, Provider, deployment, staging, production, or Cost Calibration changes.
- Evidence remains redacted and limited to role/page labels, counts, safe observations, command names, and pass/fail status.
- Any confirmed product-code defect must be handled later on a separate fix branch.

## Validation plan

- `git diff --check`
- Scoped Prettier check for changed docs/state files.
- Redaction self-review of newly created evidence/audit/plan.
- Module Run v2 pre-commit hardening for this task id.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- Module Run v2 pre-push readiness after merge.
