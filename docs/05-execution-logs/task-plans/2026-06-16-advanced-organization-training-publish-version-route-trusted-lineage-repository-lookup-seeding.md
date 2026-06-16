# Task Plan: advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding

## Scope

- Seed one pending TDD task for the organization-training publish-version trusted lineage repository lookup.
- Refresh project state from the current local `master` and `origin/master` baseline.
- Keep this task docs/state-only.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`

## Implementation Steps

1. Confirm repository readiness from `master`.
2. Create short branch `codex/advanced-organization-training-trusted-lineage-lookup-seeding`.
3. Add this task plan, evidence, and audit review.
4. Update `project-state.yaml` to the current `7686e98a12ccf8e10174af03f732e5b05fcf210c` baseline and next handoff.
5. Append a closed docs-only seeding task and one pending TDD task to `task-queue.yaml`.
6. Run declared local validation and write results to evidence.
7. Commit, fast-forward merge, push, and cleanup only if readiness gates pass.

## Boundaries

- No product source implementation in this seeding task.
- No real DB access, row/private data access, schema/drizzle edit, migration generation, provider/model call, dev server,
  Browser, Playwright/e2e, dependency/package/lockfile change, staging/prod/cloud/deploy/payment/external-service, PR,
  force push, or Cost Calibration Gate execution.

## Validation

```powershell
npm.cmd exec -- prettier --write docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md
npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding -SkipRemoteAheadCheck
```
