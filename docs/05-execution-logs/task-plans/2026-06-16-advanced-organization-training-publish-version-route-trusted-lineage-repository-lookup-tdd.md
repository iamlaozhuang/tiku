# Task Plan: advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd

## Scope

- Implement the repository-level trusted persistence lineage lookup contract for organization-training publish-version.
- Use red-first repository unit tests with synthetic data only.
- Keep this task limited to repository contract behavior and focused repository tests.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-seeding.md`
- `src/server/services/organization-training-route.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/db/schema/organization-training.ts`

## Implementation Plan

1. Add a RED repository test for a wished-for `lookupTrustedPersistenceLineage` method.
2. Verify RED with `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`.
3. Implement the minimal gateway and repository method needed to pass the test.
4. Add miss and invalid-lineage tests if the first GREEN leaves safety gaps.
5. Run the declared validation commands and record results in evidence.

## Boundaries

- No real DB command execution and no row/private data access.
- No schema/drizzle edits, migration generation, or migration execution.
- No route/service runtime wiring changes in this task.
- No provider/model call, dependency/package/lockfile change, dev server, Browser, Playwright/e2e, deploy/payment/
  external-service, PR, force push, or Cost Calibration Gate execution.

## Validation

```powershell
npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd -SkipRemoteAheadCheck
```
