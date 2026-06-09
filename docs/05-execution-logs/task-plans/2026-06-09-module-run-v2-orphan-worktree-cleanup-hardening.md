# Module Run v2 Orphan Worktree Cleanup Hardening Plan

## Scope

This task fixes a stopped-automation hygiene gap found during the post-closeout control-loop self-check. A bounded
cleanup attempted to remove a stale clean automation worktree. Git removed the worktree registration, but Windows left a
non-Git directory behind. The previous hygiene model then reported `clean` because it only inspected registered Git
worktrees.

This is mechanism-only work: local hygiene script, smoke coverage, SOP/schema/source-of-truth updates, durable state,
evidence, audit review, and paused Codex automation guidance. It does not implement product behavior.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- Latest post-closeout lifecycle hardening plan, evidence, and audit review.

## Problems To Fix

1. Partial `git worktree remove --force` can leave an unregistered automation worktree directory.
2. The next hygiene pass can miss that orphan directory and return `clean`.
3. Windows reparse points such as `node_modules` links can make naive recursive deletion unreliable.
4. The durable schema, SOP, source-of-truth index, and paused automation prompt do not name
   `orphan_worktree_directory` as an explicit bounded cleanup candidate.

## Implementation Steps

1. Register this task in durable state and queue with explicit closeout approval and blocked high-risk surfaces.
2. Extend stopped-automation hygiene to detect non-Git orphan worktree directories under the configured automation
   worktree root.
3. Keep hard stops for orphan directories with Git metadata, dirty registered worktrees, active owners, invalid leases,
   and paths outside approved roots.
4. Use a reparse-point-aware directory deletion helper so cleanup removes links without traversing targets.
5. Add smoke coverage for orphan detection and cleanup.
6. Update SOP, schema, source-of-truth index, evidence, audit review, and paused automation prompt alignment.
7. Run targeted smoke, real hygiene cleanup, startup readiness, lint, typecheck, diff, formatting, module closeout, and
   Git readiness checks.

## Risk Boundaries

- No product implementation.
- No dependency, package, or lockfile change.
- No env/secret read or write.
- No real provider call.
- No real local Docker DB operation.
- No project material, paper, or paper_asset resource read for tests.
- No schema/migration.
- No e2e.
- No staging/prod/cloud/deploy/payment/external-service action.
- No PR, force push, destructive DB operation, or Cost Calibration Gate execution.

## Verification Plan

- `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`
- `Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId module-run-v2-orphan-worktree-cleanup-hardening`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Scoped Prettier write/check for touched docs/state files.
- Anchor checks for `orphan_worktree_directory`, `Remove-ReparsePoint`, and blocked gate text.
- Module closeout readiness and Git completion readiness.
