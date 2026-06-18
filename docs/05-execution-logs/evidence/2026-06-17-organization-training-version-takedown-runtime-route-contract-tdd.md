# Organization Training Version Takedown Runtime Route Contract TDD Evidence

## Summary

- taskId: `organization-training-version-takedown-runtime-route-contract-tdd`
- result: pass
- executionProfile: `local_unit_tdd`
- validationPolicy: `local_unit`
- branch: `codex/organization-training-version-takedown-runtime-route-contract-tdd`
- targetUseCase: `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`

## Approval And Scope

- Approved by the current 2026-06-17 user prompt: "批准执行下一步建议的任务".
- Scope was limited to the no-schema version takedown runtime route/repository/API contract.
- No schema/drizzle/migration, package/lockfile/dependency, `.env*`, provider/model, dev server, Browser/Playwright
  runtime, full e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work
  was performed.
- Evidence omits secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads, raw prompts, raw answers,
  public identifier inventories, row data, private data, screenshots, traces, and DOM dumps.
- Cost Calibration Gate remains blocked.

## Module Run v2 Evidence

- Batch range: single local_unit_tdd implementation task.
- Commit: `d06e2662c55ec5cd7eb26aae9c7a5d54e13a5b8c` is the pre-task baseline; the final task commit is produced after
  local validation and closeout readiness.
- localFullLoopGate: not_used_for_this_local_unit_tdd. This task did not start a dev server, run Browser, execute
  Playwright runtime, or run full e2e.
- threadRolloverGate: no rollover required for this single scoped task.
- nextModuleRunCandidate: `organization-training-employee-answer-runtime-repository-contract-tdd`.

## TDD Evidence

RED:

- Command: `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- Result: expected fail.
- Failure anchors:
  - route suite could not resolve the missing `take-down` App Router entrypoint.
  - repository suite reported `lookupVersionOrganizationPublicId` and `takeDownVersion` were not implemented.

GREEN:

- Command: `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- Result: pass.
- Outcome: 2 test files passed, 36 tests passed.

## Implementation Evidence

- Added thin App Router POST entrypoint for `/api/v1/organization-trainings/[publicId]/take-down`.
- Added takedown route contract that:
  - validates request body with the existing takedown validator,
  - rejects path/body version public id mismatch,
  - resolves organization-admin actor context,
  - resolves trusted version organization public id from repository-backed runtime lookup,
  - calls the existing service `takeDownVersion`,
  - returns the standard `{ code, message, data }` envelope.
- Added repository contract that:
  - looks up version organization public id by version public id,
  - updates lifecycle fields on `organization_training_version` using existing `version_status`, `taken_down_at`, and
    `takedown_reason`,
  - excludes runtime access policy from persistence input,
  - maps rows through the existing DTO mapper and does not expose internal numeric IDs.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - Result: pass diagnostic. Reported current branch and blocked Cost Calibration Gate.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
  - Result: pass diagnostic after status enum correction. Reported current task active/claimed and no unsupported status.
- `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
  - Result: pass. 2 test files, 36 tests.
- `npm.cmd run test:e2e -- --list`
  - Result: pass. Listed 28 tests in 11 files. No Browser or Playwright runtime execution was run.
- `npx.cmd prettier --check --ignore-unknown ...`
  - Initial result: failed for 3 changed source/test files.
  - Fix: scoped `prettier --write` on allowed changed files.
  - Final result: pass. All matched files use Prettier code style.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Initial result: failed on a test mock return type that widened string literals.
  - Fix: added an explicit `OrganizationTrainingVersionRow | null` mock return annotation.
  - Final result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-version-takedown-runtime-route-contract-tdd`
  - Initial result: failed because the exact `[publicId]` route path in `allowedFiles` did not match the script wildcard
    interpretation.
  - Fix: added a wildcard allowedFiles entry for the same App Router route surface.
  - Final result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-version-takedown-runtime-route-contract-tdd`
  - Initial result: failed on lifecycle phase/evidence anchor normalization.
  - Fix: changed the RED command lifecycle phase to `advisory_baseline` and added Module Run v2 evidence anchors.
  - Final result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-version-takedown-runtime-route-contract-tdd`
  - Result: pass.

## Closure Boundary

- This task closes only the version takedown runtime route/repository/API contract gap.
- It does not claim `experience_closed`.
- Organization-training local experience remains blocked by admin UI entry surface, employee answer runtime routes and UI,
  draft/source-context/copy schema gate, and future approved localhost-only full-flow validation.
- nextModuleRunCandidate: `organization-training-employee-answer-runtime-repository-contract-tdd`.

## 品味合规自检 Checklist

- [x] API route keeps the standard `{ code, message, data }` response envelope.
- [x] REST path uses kebab-case and plural resource path.
- [x] JSON fields remain camelCase through DTOs.
- [x] No auto-increment internal ID is exposed in API payloads.
- [x] Repository uses Drizzle query builder, not hand-written SQL.
- [x] No schema, dependency, provider, env, or external-service work was introduced.
- [x] Implementation is scoped to the existing route/service/repository layering.
- [x] Tests proved the missing behavior first and then passed after implementation.
