# Phase 26 Audit State Recovery Preflight Plan

## Summary

- Task id: `phase-26-audit-state-recovery-preflight`.
- Scope: docs-only governance state recovery.
- Branch: `codex/phase-26-mvp-health-audit`.
- Allowed files: `project-state.yaml`, `task-queue.yaml`, this plan, and matching evidence.
- Forbidden scope: `src/**`, `scripts/**`, `tests/**`, `e2e/**`, env files, package/lockfiles, schema/drizzle/migrations, DB operations, staging/prod/cloud/deploy, real provider, external service, force push, and sensitive evidence content.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Latest Phase 25 evidence files.

## Execution Plan

1. Compare Git reality with `project-state.yaml`: branch, cleanliness, `master`/`origin/master`, local branches, worktrees, and latest evidence.
2. Register the fresh Phase 26 parent and serial child tasks; do not reuse historical closed/deferred/blocked items.
3. Update recovery handoff to the Phase 26 docs-only audit baseline.
4. Record drift and residual risk in evidence.

## Stop-The-Line Conditions

- Any required product-code, env, DB, provider, dependency, schema, migration, or destructive action is discovered.
- Git reality shows unmerged or unknown worktrees that would make state reconciliation unsafe.
