# 2026-07-06 AI Generation Final Local Goal Rollup Audit Plan

## Task

- Task id: `ai-generation-final-local-goal-rollup-audit-2026-07-06`
- Branch: `codex/ai-generation-final-local-goal-rollup-audit-2026-07-06`
- Goal: roll up the 2026-07-06 AI出题 / AI组卷 recontract implementation and local acceptance evidence into one parent-goal audit.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Current 2026-07-06 AI generation evidence and audits in `docs/05-execution-logs/`.

## Scope

Allowed:

- Update `project-state.yaml` and `task-queue.yaml`.
- Add a redacted task plan, evidence file, and audit review.
- Run local source/unit, lint, typecheck, diff, scoped prettier, and Module Run v2 hardening gates.

Blocked:

- Source, test, package, lockfile, dependency, schema, migration, seed, env, secret, Provider-enabled call, direct DB mutation, staging, prod, deploy, Cost Calibration, PR, force push, release readiness, and production usability claims.

## Audit Strategy

1. Derive concrete parent-goal requirements from the 2026-07-06 recontract overlay and active thread goal.
2. Map each requirement to current commits, task queue rows, evidence files, and current source/unit validation.
3. Mark each requirement as proven, partially proven, not tested, or explicitly out of current approval boundary.
4. Do not convert historical Provider-enabled, DB-backed runtime, staging/prod, release, or Cost Calibration non-claims into pass.
5. Record only file names, commit ids, command names, status counts, role labels, and product-level categories.

## Validation Plan

- Run a focused aggregate unit suite covering AI组卷 plan/select services, route wiring, learner handoff, admin/learner UI contracts, quantity validation, Provider-disabled source contracts, and role boundary source tests.
- Run `git diff --check`.
- Run `npm.cmd run typecheck`.
- Run `npm.cmd run lint`.
- Run scoped prettier on the state and new plan/evidence/audit files.
- Run Module Run v2 pre-commit hardening for this task.

## Expected Output

- Evidence: `docs/05-execution-logs/evidence/2026-07-06-ai-generation-final-local-goal-rollup-audit.md`
- Audit: `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-final-local-goal-rollup-audit.md`
- State updates that keep merge/push/cleanup as fresh-approval-required.
