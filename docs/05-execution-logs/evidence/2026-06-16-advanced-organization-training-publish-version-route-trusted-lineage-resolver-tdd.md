# Evidence: advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd

## Module Run V2 Anchors

- Task id: `advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd`
- Branch: `codex/advanced-organization-training-trusted-lineage-resolver`
- Head at evidence creation: `6be342ef837eafa92065b1fc5fc824f0dfc48938`
- Evidence created at: `2026-06-16T01:30:33-07:00`
- Task kind: implementation.
- Batch range: single queued TDD task.
- localFullLoopGate: L2 route resolver TDD without DB access.
- threadRolloverGate: not required; current thread has enough context for this bounded route task.
- automationHandoffPolicy: standing autonomy is recorded in repository state and materialized in this task; high-risk gates remain blocked.
- nextModuleRunCandidate: advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd
- nextTaskPolicy: recommended
- Cost Calibration Gate remains blocked.
- RED: PASS. `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts` failed because the route returned `403064` lineage unavailable when the new trusted lookup option was supplied but not yet used.
- GREEN: PASS. The same unit command passed after adding the route-level trusted lineage lookup contract and resolver factory.
- Commit: `6be342ef837eafa92065b1fc5fc824f0dfc48938` accepted baseline before this local TDD task.
- result: pass_tdd_route_trusted_lineage_resolver_contract

## Implementation Summary

- Added `OrganizationTrainingTrustedPersistenceLineageLookup` and input contract to the publish route service.
- Added `createOrganizationTrainingPersistenceLineageResolver` as a route-level resolver factory.
- The resolver derives trusted lookup input from `publishInput.organizationPublicId`, `publishInput.authorizationPublicId`, and verified `OrganizationTrainingAdminContext`.
- The resolver rejects actor scope mismatch before lookup and returns lineage unavailable when lookup misses.
- The resolver normalizes internal lineage ids and rejects invalid internal ids.
- Runtime DB-backed lookup remains a later task; this task did not access DB or change repository mapper/schema.

## Validation

Commands:

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd -SkipRemoteAheadCheck
```

Results:

- RED `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts`: PASS expected failure; 1 failed, 8 passed.
- GREEN `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts`: PASS; 11 passed.
- `npm.cmd exec -- prettier --check ...`: PASS.
- `git diff --check`: PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run typecheck`: PASS.
- `Test-GitCompletionReadiness`: PASS.
- `Test-ModuleRunV2PreCommitHardening`: PASS.
- `Test-ModuleRunV2ModuleCloseoutReadiness`: PASS.
- `Test-ModuleRunV2PrePushReadiness -SkipRemoteAheadCheck`: PASS.

## Blocked Gates Preserved

- No real DB access and no row/private data.
- No database-backed lineage lookup implementation.
- No repository mapper changes.
- No schema, migration, script, dependency, package, or lockfile changes.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload.
- No quota/cost measurement or Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No formal target write.
- No public identifier value list exposure.
- No PR or force push.

## Taste Compliance Self-Check

- Standard API response: PASS; blocked cases continue to use the standard `{ code, message, data }` envelope.
- Naming discipline: PASS; new route contract names use registered organization/admin/authorization terminology.
- Public ID boundary: PASS; tests use synthetic public identifiers and no real identifier values.
- Layering: PASS; route resolver contract is isolated from repository mapper and DB wiring.
- Dependency isolation: PASS; no dependency/package/lockfile change.
- Schema and migration boundary: PASS; no schema/drizzle/migration change.
- Evidence before conclusion: PASS; RED and GREEN results are recorded before closeout.
