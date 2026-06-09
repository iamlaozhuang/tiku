# Module Run v2 Post-Done Closeout Authorization Adoption Evidence

## Task

- Task id: `module-run-v2-post-done-closeout-authorization-adoption`
- Status: in progress.
- Approval: User explicitly requested the mechanism repair first, then automatic closeout of the current branch, and
  authorized commit, fast-forward merge to `master`, push to `origin/master`, and cleanup during mechanism operation.

## Scope

- Mechanism scripts and smoke tests for post-done closeout authorization adoption.
- Current completed task files carried only so the repaired closeout can commit the already verified branch state.
- Governance state, queue, plan, evidence, and audit review for this mechanism repair.

## Guardrails

- No provider calls or provider configuration.
- No env/secret access.
- No dependency/package/lockfile changes.
- No schema/migration changes.
- No API/UI/e2e/deploy/payment/external-service work.
- No force push.
- Cost Calibration Gate remains blocked.

## Evidence Status

result: pass
Passed: post-done closeout authorization adoption mechanism is locally verified.

## Batch Evidence

- Batch range: Module Run v2 post-done closeout authorization adoption for the carried
  `module-run-v2-ai-task-lifecycle-local-contract` branch.
- Commit: `b8f0871ac87accdd54c051f79179404982760229` current branch HEAD before approved closeout execution.
- localFullLoopGate: L2.
- threadRolloverGate: continue current thread until approved closeout executes.
- nextModuleRunCandidate: ai-task-and-provider.

## Implementation

- Added `CloseoutAuthorizationStatement` to `Invoke-ModuleRunV2ApprovedCloseout.ps1`.
- Added matching `CloseoutAuthorizationStatement` support to `Invoke-ModuleRunV2Autopilot.ps1` so `-CloseoutRecovery`
  can pass fresh user authorization into the approved closeout path.
- Added matching `CloseoutAuthorizationStatement` support to `Test-ModuleRunV2UnattendedReadiness.ps1` so the
  closeout-recovery dirty-worktree gate can accept the same fresh user authorization statement.
- Kept the closeout authorization parser strict: approval must include commit, merge, push, and cleanup or automation
  worktree parking language.
- Updated smoke coverage for approved closeout and autopilot parameter handling.

## Validation

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-post-done-closeout-authorization-adoption -PlannedFiles scripts/agent-system/Invoke-ModuleRunV2ApprovedCloseout.ps1,scripts/agent-system/Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1,src/server/contracts/ai-task-domain-contract.ts,src/server/models/ai-task-domain.ts,src/server/validators/ai-task-domain.ts,src/server/validators/ai-task-domain.test.ts,src/server/services/ai-task-domain-service.ts,src/server/services/ai-task-domain-service.test.ts,docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/task-queue.yaml,docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md,docs/05-execution-logs/evidence/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md,docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md,docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-post-done-closeout-authorization-adoption.md,docs/05-execution-logs/evidence/2026-06-09-module-run-v2-post-done-closeout-authorization-adoption.md,docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-post-done-closeout-authorization-adoption.md
Exit code: 0
work readiness passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1
RED: exit code 1 before implementation because CloseoutAuthorizationStatement was not a recognized parameter.
GREEN: exit code 0 after implementation.
Module Run v2 approved closeout smoke passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1
RED: exit code 1 before implementation because CloseoutAuthorizationStatement was not a recognized parameter.
GREEN: exit code 0 after implementation.
Module Run v2 autopilot smoke passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
Exit code: 0
Module Run v2 unattended readiness smoke passed.
```

```text
npm.cmd run test:unit -- src/server/validators/ai-task-domain.test.ts src/server/services/ai-task-domain-service.test.ts
Exit code: 0
Test Files 2 passed (2)
Tests 6 passed (6)
```

```text
npm.cmd run lint
Exit code: 0
```

```text
npm.cmd run typecheck
Exit code: 0
```

```text
git diff --check
Exit code: 0
```

```text
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.ps1 scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1 scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1 scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1 src\server\contracts\ai-task-domain-contract.ts src\server\models\ai-task-domain.ts src\server\validators\ai-task-domain.ts src\server\validators\ai-task-domain.test.ts src\server\services\ai-task-domain-service.ts src\server\services\ai-task-domain-service.test.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md docs\05-execution-logs\evidence\2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md docs\05-execution-logs\audits-reviews\2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md docs\05-execution-logs\task-plans\2026-06-09-module-run-v2-post-done-closeout-authorization-adoption.md docs\05-execution-logs\evidence\2026-06-09-module-run-v2-post-done-closeout-authorization-adoption.md docs\05-execution-logs\audits-reviews\2026-06-09-module-run-v2-post-done-closeout-authorization-adoption.md
Exit code: 0
All matched files use Prettier code style.
```

```text
Select-String -Path scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.ps1,scripts\agent-system\Invoke-ModuleRunV2Autopilot.ps1,scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1,scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1,docs\05-execution-logs\evidence\2026-06-09-module-run-v2-post-done-closeout-authorization-adoption.md -Pattern 'CloseoutAuthorizationStatement','approvedCloseoutContinuation','post-done closeout authorization','Cost Calibration Gate remains blocked'
Exit code: 0
Required anchors were present.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-post-done-closeout-authorization-adoption
Exit code: 0
module-closeout readiness passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Exit code: 0
Git completion readiness inventory completed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-post-done-closeout-authorization-adoption
Exit code: 0
pre-push readiness passed.
```

## Final Validation Addendum

- `Invoke-ModuleRunV2ApprovedCloseout.ps1`, `Invoke-ModuleRunV2Autopilot.ps1`,
  `Test-ModuleRunV2UnattendedReadiness.ps1`, `Test-ModuleRunV2PrePushReadiness.ps1`, and the unattended readiness smoke
  now tolerate Git CRLF warnings from scoped child-process output long enough to inspect the mechanism result.
- Re-ran the final mechanism smoke and gate set after the warning-handling repair:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
Exit code: 0
Module Run v2 unattended readiness smoke passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-post-done-closeout-authorization-adoption
Exit code: 0
pre-push readiness passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-post-done-closeout-authorization-adoption
Exit code: 0
module-closeout readiness passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1
Exit code: 0
Module Run v2 approved closeout smoke passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1
Exit code: 0
Module Run v2 autopilot smoke passed.
```

```text
git diff --check
Exit code: 0
No whitespace errors.
```

```text
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
Exit code: 0
All matched files use Prettier code style.
```

## Blocked Gates

- Provider calls and provider configuration were not touched.
- Env/secret files were not read or changed.
- Dependency declarations, packages, and lockfiles were not changed.
- Schema, migration, repository, mapper, REST API, UI/browser, e2e, deploy, payment, external-service, force push, and
  Cost Calibration Gate execution remain blocked.
