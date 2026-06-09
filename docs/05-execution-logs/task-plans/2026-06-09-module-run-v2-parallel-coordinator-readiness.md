# Module Run v2 Parallel Coordinator Readiness Plan

## Task

- Task id: `module-run-v2-parallel-coordinator-readiness`
- Branch: `codex/module-run-v2-parallel-coordinator-readiness`
- Task kind: `implementation`
- Goal: add a first executable readiness gate for the `coordinator + file locks + worker isolation + serial integration`
  upgrade path, while keeping Codex automation in a guardian/coordinator role by default.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/parallel-work-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Implementation Approach

1. Add a RED smoke test for a new parallel readiness gate that classifies candidate task scopes and detects shared-file
   conflicts before worker assignment.
2. Implement `Test-ModuleRunV2ParallelReadiness.ps1` as a read-only local gate that emits stable machine-readable
   decisions.
3. Encode the first durable parallel coordination schema in SOP/state docs without enabling automatic worker creation.
4. Keep closeout, push, thread launch, env/secret, provider, dependency, schema/migration, deploy, payment,
   external-service, and Cost Calibration Gate execution blocked.

## Risk Controls

- No product runtime behavior changes.
- No package, lockfile, dependency, schema, migration, env/secret, provider, deploy, payment, or external-service work.
- No worktree creation, thread creation, cleanup, closeout, push, PR, or force push.
- New script is read-only and works from temporary smoke-test repositories.
- `project-state.yaml` and `task-queue.yaml` remain coordinator-owned serial state.

## Validation

- RED/GREEN smoke test for parallel readiness.
- Task-scoped work readiness.
- Startup readiness.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Scoped Prettier write/check.
- Anchor check for `parallelDecision`, `fileLock`, `coordinator`, `workerIsolation`, `serialIntegration`, and
  `Cost Calibration Gate remains blocked`.
