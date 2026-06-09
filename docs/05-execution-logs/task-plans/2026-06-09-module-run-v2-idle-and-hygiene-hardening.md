# Module Run v2 Idle And Hygiene Hardening Plan

## Scope

This serial mechanism task fixes the non-product control-loop issues found during the latest full self-check:

- closed-task readiness diagnostics should not look like unsafe execution failures during audit-only checks;
- expired run-registry noise should be classifiable and cleanable when it no longer owns a lane;
- startup should surface merged `codex/*` branch cleanup availability without blocking idle startup;
- `nextModuleRunCandidate` output should use a consistent idle recommendation;
- startup should report local tooling readiness more precisely than `node_modules_present`;
- project-state handoff should stop telling agents to finish an already closed task.

This task does not unpause the Codex automation, create worker threads, claim product work, or seed business tasks.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/parallel-work-governance.md`
- Latest orphan worktree cleanup plan, evidence, and audit review.

## Implementation Steps

1. Register this task as the current mechanism task in durable state and queue.
2. Add audit-friendly closed-task decisions to schema/work readiness where appropriate.
3. Add expired active terminal registry cleanup classification without touching worktrees.
4. Add startup advisories for local tooling detail and merged branch cleanup availability.
5. Normalize default idle `nextModuleRunCandidate` wording across mechanism outputs.
6. Update SOP/schema/source-of-truth notes, evidence, and audit review.
7. Run focused smoke tests plus startup, hygiene, branch hygiene, acceptance, lint/typecheck, diff, and formatting checks.

## Risk Boundaries

- No product implementation.
- No dependency, package, or lockfile change.
- No env/secret read or write.
- No provider call.
- No local Docker DB operation.
- No project material, paper, or paper_asset read for tests.
- No schema/migration.
- No e2e.
- No staging/prod/cloud/deploy/payment/external-service action.
- No PR, force push, destructive DB operation, or Cost Calibration Gate execution.

## Verification Plan

- `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- `Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -SummaryOnly`
- `Test-ModuleRunV2BranchHygiene.ps1 -SummaryOnly`
- `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`
- `Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId module-run-v2-idle-and-hygiene-hardening`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Scoped Prettier write/check for touched docs/state files.
