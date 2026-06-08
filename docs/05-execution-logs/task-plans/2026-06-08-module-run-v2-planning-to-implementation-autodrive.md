# Module Run v2 Planning To Implementation Autodrive Task Plan

## Task

- Task id: `module-run-v2-planning-to-implementation-autodrive`
- Task kind: `implementation`
- Branch: `codex/module-run-v2-planning-to-implementation-autodrive`
- Goal: add the missing mechanism layer that lets successful Module Run v2 planning seed and hand off approved low-risk
  local implementation tasks without requiring another manual restart, while keeping high-risk gates hard blocked.

## Scope

Allowed:

- Add a planning-to-implementation auto-seed readiness script and smoke tests.
- Update Module Run v2 matrix, automated advancement SOP, code-stage seeding boundary, project state, and task queue.
- Update the pending `module-run-v2-ai-task-and-provider-planning` task so it may seed low-risk implementation tasks only
  through the new gate.
- Write task plan, evidence, and audit review.

Blocked:

- Product implementation.
- Provider call or provider configuration.
- Env/secret reading or changes.
- Staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, and product e2e implementation.
- Cost Calibration Gate execution.

## Batch Plan

### Batch 1: Auto-Seed Gate Script

- RED: no local hard block verifies whether a planning task is allowed to seed implementation tasks.
- GREEN: add `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1` and smoke tests covering pass/fail cases.
- localFullLoopGate: L2.

### Batch 2: Governance Policy Alignment

- RED: SOP/matrix/seeding plan still treat planning output as proposal-only with no safe path to queued implementation.
- GREEN: add `implementationAutoSeedGate` and document exact criteria for low-risk auto-seeded implementation tasks.
- localFullLoopGate: L1.

### Batch 3: Queue Handoff Alignment

- RED: the next `ai-task-and-provider` planning task cannot seed executable implementation tasks after successful
  planning.
- GREEN: update its allowed scope, validation anchors, and handoff wording so automation can continue to approved local
  implementation tasks when the new gate passes.
- localFullLoopGate: L1.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-planning-to-implementation-autodrive`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-planning-to-implementation-autodrive -PlannedFiles ...`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped prettier write/check
- required anchor check for `implementationAutoSeedGate`, `autoDriveLocalImplementationApproval`,
  `module-run-v2-ai-task-and-provider-planning`, `localExperienceClosureGate`, and
  `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-planning-to-implementation-autodrive`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop immediately if this mechanism task would require product implementation, provider/env/secret/deploy/payment,
external-service, dependency, schema/migration, business e2e implementation, or Cost Calibration Gate execution.
