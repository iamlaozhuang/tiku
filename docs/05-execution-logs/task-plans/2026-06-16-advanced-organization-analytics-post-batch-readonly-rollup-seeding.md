# Task Plan: Advanced Organization Analytics Post-Batch Readonly Rollup Seeding

## Scope

- Task id: `advanced-organization-analytics-post-batch-readonly-rollup-seeding`
- Branch: `codex/organization-analytics-post-batch-rollup-seeding`
- Baseline: `master == origin/master == a79f0aeb364da0b87e3991d91e396920252c9ff2`
- Task kind: docs-only readonly rollup and queue seeding.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-16-module-run-v2-auto-seed-organization-analytics.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-module-run-v2-auto-seed-organization-analytics.md`
- Batch 185 through batch 188 evidence and audit review files.
- Read-only source inventory for `organization-analytics` files under `src/server` and `src/app`.

## Execution Plan

1. Confirm repository readiness on `master`, remote alignment, clean worktree, and no `codex/*` residue.
2. Read the organization analytics requirement, planning, seed, evidence, audit, and current source inventory.
3. Produce a docs-only rollup that records:
   - closed implementation surfaces;
   - unimplemented or still-blocked surfaces;
   - the safe next task boundary.
4. Seed exactly one pending readonly audit task:
   `advanced-organization-analytics-repository-read-model-boundary-readonly-audit`.
5. Update project state handoff to the seeded readonly audit task.
6. Validate with diff-check, lint, typecheck, GitCompletion, PreCommit, ModuleCloseout, and PrePush readiness.

## Boundary

- No product source or test source modification.
- No DB read/write, schema, migration, provider/model, env/secret, dependency, dev-server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work.
- This task does not claim repository, mapper, route, UI, export, real `audit_log`, formal learning, quota, or AI learning analytics are implemented.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-post-batch-readonly-rollup-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-post-batch-readonly-rollup-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-post-batch-readonly-rollup-seeding`
