# Evidence: advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd

## Module Run V2 Anchors

- Task id: `advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd`
- Branch: `codex/advanced-organization-training-runtime-wiring-tdd`
- Head at evidence creation: `89b624fa73ce289fff88da7ea54071211fc7396a`
- Evidence created at: `2026-06-16T02:15:32-07:00`
- Task kind: implementation.
- Batch range: single queued TDD task.
- localFullLoopGate: L2 route runtime wiring TDD without real DB execution.
- threadRolloverGate: not required; current thread has enough context for this bounded route wiring task.
- automationHandoffPolicy: standing autonomy is recorded in repository state and materialized in this task; high-risk
  gates remain blocked.
- nextModuleRunCandidate: advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck
- nextTaskPolicy: recommended
- Cost Calibration Gate remains blocked.
- RED: PASS. The new focused runtime route unit test first failed because the runtime route factory still returned
  `403063` organization-admin actor context unavailable. That showed the runtime factory ignored the injected admin
  resolver and therefore could not reach the repository trusted lineage lookup path.
- GREEN: PASS. The runtime route factory now accepts the narrow runtime route options, creates one Postgres repository,
  wires `repository.lookupTrustedPersistenceLineage` into route options, and uses the same repository for publish
  persistence without running a real DB command in unit tests.
- Commit: `89b624fa73ce289fff88da7ea54071211fc7396a` accepted baseline before this local TDD task.
- result: pass_tdd_route_runtime_trusted_lineage_lookup_wiring

## Implementation Summary

- Added a focused route unit test for default runtime wiring using a mocked repository factory and synthetic admin
  context.
- Kept the test on route behavior: request input flows through runtime handlers, repository lookup receives
  actor-scoped public identifiers, and publish persistence receives trusted internal lineage.
- Added `OrganizationTrainingRuntimeRouteOptions` with only `resolveOrganizationAdminContext` as the exposed runtime
  option for this task.
- Changed `createOrganizationTrainingRuntimeRouteHandlers` to create one Postgres repository, pass
  `repository.lookupTrustedPersistenceLineage` into `createOrganizationTrainingRouteHandlers`, and build the runtime
  store from the same repository.
- No real DB command was executed.

## Validation

Commands:

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd -SkipRemoteAheadCheck
```

Results:

- RED `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts`: PASS expected failure; 1 failed,
  11 passed. Failure: route returned `403063` organization-admin actor context unavailable instead of reaching trusted
  lineage lookup.
- GREEN `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts`: PASS; 12 passed.
- Post-format focused unit rerun: PASS; 12 passed.
- First `npm.cmd run typecheck`: failed because the new test mock return type inferred a narrower payload than
  `OrganizationTrainingPublishedVersionDto`. The mock was typed to the real DTO contract.
- Final `npm.cmd run typecheck`: PASS.
- `git diff --check`: PASS.
- `npm.cmd run lint`: PASS.
- `Test-GitCompletionReadiness`: PASS.
- `Test-ModuleRunV2PreCommitHardening`: PASS.
- `Test-ModuleRunV2ModuleCloseoutReadiness`: PASS.
- `Test-ModuleRunV2PrePushReadiness -SkipRemoteAheadCheck`: PASS.

## Blocked Gates Preserved

- No `.env*` read, output, or edit.
- No real DB command execution and no row/private data access.
- No schema/drizzle edits, migration generation, or migration execution.
- No repository implementation change.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload.
- No dependency, package, or lockfile changes.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No quota/cost measurement or Cost Calibration Gate.
- No public identifier value list exposure.
- No PR or force push.

## Taste Compliance Self-Check

- Standard API response: PASS; publish route still returns the standard `{ code, message, data }` envelope.
- Naming discipline: PASS; new runtime route option and test names use existing organization-training terminology.
- Public ID boundary: PASS; tests use synthetic public identifiers only and no real identifier lists are recorded.
- Layering: PASS; route runtime wiring passes repository capabilities through dependency injection without moving DB
  access into the route layer.
- Dependency isolation: PASS; no dependency/package/lockfile change.
- Schema and migration boundary: PASS; no schema/drizzle/migration file was changed.
- Evidence before conclusion: PASS; RED/GREEN, local validation, and blocked gates are recorded before closeout.
