# Evidence: batch-123-personal-learning-ai-api-route-local-contract-bridge

result: pass

## Summary

- module: personal-learning-ai
- sourcePlanningTask: `seed-next-personal-learning-ai-product-tasks`
- targetClosureItem: API route/local contract bridge
- moduleRunVersion: 2
- branch: `codex/batch-123-personal-learning-ai-api-route-local-contract-bridge`
- scope: existing `/api/v1/personal-ai-generation-requests` route adapter and route-service unit coverage only
- Cost Calibration Gate remains blocked.

## Batch Evidence

- Batch range: batch-123
- seededImplementationTask: true
- implementationAutoSeedGate: passed before implementation edits.
- localExperienceClosureGate: personal-learning-ai-experience remains local-only.
- localFullLoopGate: L4 local API contract gates.
- threadRolloverGate: no thread rollover required for this narrow route-service task.
- nextModuleRunCandidate: `batch-124-personal-learning-ai-student-local-request-entry-ui` after batch-123 closes.
- blocked remainder: UI, e2e edits, provider calls, env/secret, schema/migration, dependency, deploy, payment,
  external-service, formal generated-content write paths, PR, force-push, and Cost Calibration Gate remain blocked.

## RED:

- Command: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- Result: failed before implementation, `Test Files 1 failed (1)`, `Tests 1 failed | 4 passed (5)`.
- Failure anchor: expected `experienceSurface: "student_local_browser"` and local browser state fields, but the route
  returned the existing base request contract.

## GREEN:

- Command: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- Result: passed after implementation, `Test Files 1 passed (1)`, `Tests 5 passed (5)`.

## Implementation Notes

- Added an explicit `responseMode: "local_browser_experience"` route-service branch.
- Reused `buildPersonalAiGenerationLocalBrowserExperienceReadModel()` instead of duplicating request-flow or result
  reference mapping.
- Preserved existing default route behavior for callers that do not request the local browser experience contract.
- Kept resolver `userPublicId` precedence over request body identity.
- Did not add provider calls, persistence, schema/migration, UI, e2e edits, or formal generated-content write paths.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId seed-next-personal-learning-ai-product-tasks -CandidateTaskId batch-123-personal-learning-ai-api-route-local-contract-bridge`:
  passed before edits.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  passed before edits.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:unit`: passed, `Test Files 243 passed (243)`, `Tests 869 passed (869)`.
- `npm.cmd run build`: passed, Next.js 16.2.6 compiled successfully and generated 54 static pages.
- `git diff --check`: passed.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-123-personal-learning-ai-api-route-local-contract-bridge`:
  passed with `filesToScan: 7`.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-123-personal-learning-ai-api-route-local-contract-bridge`:
  passed.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-123-personal-learning-ai-api-route-local-contract-bridge`:
  passed with accepted-ancestor state SHA checks for `master` and `origin/master`.
- e2e: not run because this task does not touch UI/e2e and declares localE2EValidation blocked.

## Commit

- Commit: `24b0edd32e8217f524eb00a184abfc10a79f0a32` is the pre-batch-123 baseline checkpoint. The final immutable SHA is
  reported after commit because this evidence file participates in the commit object.

## Out Of Scope

- No UI, e2e, repository, mapper, schema, migration, env, provider, deploy, payment, external-service, PR, force-push,
  dependency, package, lockfile, or formal generated-content write-path changes.
- Cost Calibration Gate remains blocked.
