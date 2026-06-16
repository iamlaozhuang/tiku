# Task Plan: advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding

## Scope

- Seed one pending TDD task for wiring the existing trusted lineage repository lookup into the organization-training
  publish route runtime path.
- Update durable state and queue metadata only.
- Create evidence and audit records for this docs/state-only seeding task.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd.md`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/repositories/organization-training-repository.ts`

## Current Finding

The route layer already has a trusted lineage resolver option and tests for injected lookup behavior. The runtime route
factory still creates the Postgres repository only for `publishVersion`; it does not yet pass
`repository.lookupTrustedPersistenceLineage` into `createOrganizationTrainingRouteHandlers`.

## Implementation Plan

1. Create this task plan before state edits.
2. Update `project-state.yaml` to record the seeding task as closed and point the handoff to the pending runtime wiring
   TDD task.
3. Append two queue entries:
   - closed docs/state-only seeding task;
   - pending red-first route runtime wiring TDD task.
4. Record evidence and audit for this seeding task.
5. Run formatting and local governance gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch after gates pass.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md`

## Blocked Gates

- No `.env*` read, output, or edit.
- No DB access and no row/private data access.
- No provider/model call or provider configuration.
- No schema/drizzle edit, migration generation, or migration execution.
- No dependency, package, or lockfile change.
- No product source, test, script, route, service, repository, mapper, contract, model, validator, UI, or e2e artifact
  change during this seeding task.
- No dev server, Browser, Playwright, or e2e execution.
- No staging/prod/cloud/deploy/payment/external-service work.
- No quota/cost measurement or Cost Calibration Gate.
- No PR and no force push.

## Validation Plan

```powershell
npm.cmd exec -- prettier --write docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md
npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding.md
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-seeding -SkipRemoteAheadCheck
```
