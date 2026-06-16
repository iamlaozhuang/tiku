# Evidence: advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd

## Module Run V2 Anchors

- Task id: `advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd`
- Branch: `codex/advanced-organization-training-trusted-lineage-repository-lookup`
- Head at evidence creation: `589906aba3b7f05753c3383ee055034da4905958`
- Evidence created at: `2026-06-16T01:47:29-07:00`
- Task kind: implementation.
- Batch range: single queued TDD task.
- localFullLoopGate: L2 repository contract TDD without real DB execution.
- threadRolloverGate: not required; current thread has enough context for this bounded repository task.
- automationHandoffPolicy: standing autonomy is recorded in repository state and materialized in this task; high-risk gates remain blocked.
- nextModuleRunCandidate: advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-readonly-recheck
- nextTaskPolicy: recommended
- Cost Calibration Gate remains blocked.
- RED: PASS. First focused unit run failed because `repository.lookupTrustedPersistenceLineage` did not exist. Second
  focused unit run failed because blank public identifiers still queried the gateway. Third focused unit run failed
  because invalid internal lineage was returned unchanged.
- GREEN: PASS. The focused repository unit command passed after adding the repository lookup contract, public identifier
  normalization, and internal lineage normalization.
- Commit: `589906aba3b7f05753c3383ee055034da4905958` accepted baseline before this local TDD task.
- result: pass_tdd_repository_trusted_lineage_lookup_contract

## Implementation Summary

- Added `OrganizationTrainingTrustedPersistenceLineage` and lookup input types to the organization-training repository.
- Added `lookupTrustedPersistenceLineage` to the repository contract.
- Added `findTrustedPersistenceLineageByPublicIds` to the repository gateway abstraction.
- Added a Postgres repository query path that resolves internal organization and org auth ids from public identifiers
  through the existing `organization`, `org_auth`, and `org_auth_organization` schema relationship.
- Added repository tests for successful lookup, blank public identifier short-circuiting, and invalid internal lineage
  rejection.
- No real DB command was executed.

## Validation

Commands:

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

Results:

- RED `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`: PASS expected failure;
  1 failed, 4 passed. Failure: `repository.lookupTrustedPersistenceLineage is not a function`.
- GREEN `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`: PASS; 5 passed.
- RED blank identifier run: PASS expected failure; 1 failed, 5 passed. Failure: blank identifier returned lineage instead
  of `null`.
- GREEN blank identifier run: PASS; 6 passed.
- RED invalid lineage run: PASS expected failure; 1 failed, 6 passed. Failure: invalid `organizationId` returned instead
  of `null`.
- GREEN/final focused unit run: PASS; 7 passed.
- `npm.cmd exec -- prettier --write ...`: PASS.
- `git diff --check`: PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run typecheck`: PASS.
- `Test-GitCompletionReadiness`: PASS.
- `Test-ModuleRunV2PreCommitHardening`: PASS.
- `Test-ModuleRunV2ModuleCloseoutReadiness`: PASS.
- `Test-ModuleRunV2PrePushReadiness -SkipRemoteAheadCheck`: PASS.

## Blocked Gates Preserved

- No real DB command execution and no row/private data access.
- No schema/drizzle edits, migration generation, or migration execution.
- No route/service runtime wiring changes.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload.
- No dependency, package, or lockfile changes.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No quota/cost measurement or Cost Calibration Gate.
- No public identifier value list exposure.
- No PR or force push.

## Taste Compliance Self-Check

- Standard API response: not applicable; repository contract task does not change API response envelope.
- Naming discipline: PASS; new names use organization, authorization, org auth, and lineage terminology already present in
  the module.
- Public ID boundary: PASS; tests use synthetic public identifiers and no real identifier values.
- Layering: PASS; repository does not import route/service types and route/service wiring remains unchanged.
- Dependency isolation: PASS; no dependency/package/lockfile change.
- Schema and migration boundary: PASS; no schema/drizzle/migration file was changed.
- Evidence before conclusion: PASS; RED/GREEN, local validation, and Module Run v2 readiness results are recorded before
  closeout.
