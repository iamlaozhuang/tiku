# Module Run v2 Post-Closeout Lifecycle Hardening Plan

## Scope

This task fixes the remaining Module Run v2 mechanism interruptions found during the full control-loop self-check. It
is mechanism-only: local governance scripts, smoke tests, SOP/schema/index/state/queue records, evidence, audit review,
and paused automation guidance. It does not implement product behavior.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/`
- `scripts/agent-system/`
- Latest recovery-chain plan, evidence, and audit review.

## Problems To Fix

1. Post-closeout state reconciliation currently tries to make committed `project-state.yaml` equal the current commit
   SHA, which is self-referential and becomes stale as soon as the state file is committed.
2. Startup treats a closed, clean, no-pending-task state as `closeout_recovery`, causing a runner to keep trying to
   recover when there is nothing to do.
3. Recovery self-repair still models accepted SHA drift as a writable repair instead of a non-writing checkpoint
   confirmation.
4. Stopped automation and branch hygiene reports can be too verbose for recurring scheduled wakeups.
5. Task validation commands are not phase-aware, so pre-edit readiness commands can be confused with post-closeout
   commands.
6. The source-of-truth index, SOP, schema, evidence, audit, and automation guidance need to describe the improved
   contracts consistently.

## Implementation Steps

1. Register this task in `project-state.yaml` and `task-queue.yaml` with explicit closeout approval and blocked
   high-risk surfaces.
2. Change post-closeout state reconciliation to use `accepted_ancestor_checkpoint` semantics and avoid writing
   self-referential SHAs during `-Execute`.
3. Change startup readiness so closed, clean, no-pending-task state returns `no_executable_task`; reserve
   `closeout_recovery` for incomplete or actionable closeout recovery.
4. Change recovery self-repair so accepted post-closeout checkpoints do not produce writable repair loops.
5. Add compact summary options for stopped automation hygiene and branch hygiene, with smoke coverage.
6. Add validation lifecycle metadata to the schema/SOP and current task records so pre-edit commands are not treated as
   post-closeout rerun obligations.
7. Update acceptance coverage, evidence, audit review, source-of-truth index, and paused automation guidance.
8. Run targeted smokes, full local gates, closeout readiness, Git completion readiness, approved closeout, and post-merge
   verification.

## Risk Boundaries

- No product implementation.
- No dependency, package, or lockfile change.
- No env/secret write.
- No real provider call.
- No real local Docker DB operation.
- No project material, paper, or paper_asset resource read for tests.
- No schema/migration.
- No e2e.
- No staging/prod/cloud/deploy/payment/external-service action.
- No PR, force push, destructive DB operation, or Cost Calibration Gate execution.

## Verification Plan

- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit`
- Targeted smoke tests for changed scripts.
- Autodrive control-loop acceptance gate.
- Startup readiness and unattended closeout recovery no-write diagnostics.
- Compact stopped-automation and branch-hygiene dry-run checks.
- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- Prettier check for touched docs/state files.
- Module closeout readiness and Git completion readiness.
