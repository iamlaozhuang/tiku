# Evidence: phase-84-module-run-v2-validation-command-normalization-required-path

result: pass

## Summary

Phase84 completes the Module Run v2 validation-command normalization repair path. A task with
`validationCommandNormalization: approved_docs_only_placeholder_to_scoped_unit`, a safe
`normalizedValidationCommand`, and a remaining legacy `npm.cmd run test -- --run focused` command now receives
`autodriveSchemaDecision: validation_command_normalization_required` instead of `stop_for_hard_block`.

The new decision is routed as a proposal action only. It does not execute validation commands, does not rewrite the
queue, and does not broaden e2e/provider/schema/env/dependency/deploy/payment/external-service or Cost Calibration Gate
permissions.

Automation remains paused. `tiku-module-run-v2-autopilot`, the unattended runner, scheduled automation, and e2e were not
started.

## Required Anchors

- Batch range: phase-84
- RED: the new normalization-required smoke fixtures failed against the previous production logic:
  - `Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1` returned `HARD_BLOCK_VALIDATION_COMMAND_NORMALIZATION_REQUIRED`.
  - `Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1` mapped the readiness failure to `agentAction: stop_for_hard_block`.
  - `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1` rejected `propose_validation_command_normalization` as an
    unknown action.
- GREEN: after the mechanism change, the same three smoke fixtures passed and the new path emits
  `validation_command_normalization_required`, `propose_validation_command_normalization`, and
  `serialExecutorDecision: validation_command_normalization_required`.
- Commit: `212d8e17a42d31e6d5d1b236edf34a815642343a` accepted ancestor before the phase84 local commit.
- localFullLoopGate: mechanism validation completed with targeted PowerShell smoke, lint, typecheck, diff check, and
  Module Run v2 readiness gates.
- threadRolloverGate: current thread can continue; no rollover required before closeout.
- nextModuleRunCandidate: after phase84 closeout, reread `task-queue.yaml`; the expected candidate remains
  `batch-111-personal-learning-ai-request-context-local-contract` if its dependencies and readiness still pass.
- blocked remainder: automation resume, unattended runner, automatic task-queue rewrite, e2e execution, provider/env/
  schema/deploy/dependency/payment/external-service work, PR/force-push, and Cost Calibration Gate remain blocked.
- Cost Calibration Gate remains blocked.

## Scope

Allowed:

- readiness, dispatcher, serial executor scripts and their smoke tests;
- autodrive control schema and automated advancement governance docs;
- task queue/project-state updates for phase84;
- phase84 task plan, evidence, and audit review.

Blocked:

- source product code under `src/**`;
- product tests under `tests/**` or `e2e/**`;
- package or lockfile changes;
- schema, migration, `src/db/schema/**`, or `drizzle/**`;
- env/secret reads or writes;
- provider calls, provider configuration, provider cost measurement, and Cost Calibration Gate execution;
- e2e, browser, staging/prod/cloud/deploy, payment, external-service, destructive DB, PR, or force-push work.

## Validation

| Command                                                                                                                                                                                                    | Result         | Notes                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`                                                                        | fail then pass | RED showed `HARD_BLOCK_VALIDATION_COMMAND_NORMALIZATION_REQUIRED`; GREEN passed with `validation_command_normalization_required`.         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`                                                                         | fail then pass | RED mapped to hard block; GREEN maps to `agentAction: propose_validation_command_normalization`.                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`                                                                       | fail then pass | RED rejected the action; GREEN emits `serialExecutorDecision: validation_command_normalization_required` and does not execute validation. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`                                                                               | pass           | Seed transaction smoke passed; broad focused baseline remains advisory-only.                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`                                                                    | pass           | Self-review smoke passed and still rejects unsafe seed shapes.                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`                                                                      | pass           | Validation surface smoke passed.                                                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`        | pass           | Batch111 readiness returns `autodriveSchemaDecision: can_autodrive`; future batch111 unit test was not executed.                          |
| `npm.cmd run lint`                                                                                                                                                                                         | pass           | ESLint completed successfully.                                                                                                            |
| `npm.cmd run typecheck`                                                                                                                                                                                    | pass           | `tsc --noEmit` completed successfully.                                                                                                    |
| `git diff --check`                                                                                                                                                                                         | pass           | No whitespace errors.                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-84-module-run-v2-validation-command-normalization-required-path` | pass           | Module Run v2 closeout readiness passed after evidence and audit were written.                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-84-module-run-v2-validation-command-normalization-required-path`      | pass           | Scope, blocked-file, sensitive-evidence, and terminology hardening passed.                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-84-module-run-v2-validation-command-normalization-required-path`        | pass           | Pre-push readiness passed before local merge/push.                                                                                        |

## Automation Pause Check

- `project-state.yaml` still records `plannedPauseStatus: active` and `plannedPauseKeepsAutomationPaused: true`.
- `%USERPROFILE%\.codex\automations\tiku-module-run-v2-autopilot\automation.toml` records `status = "PAUSED"`.
- `%USERPROFILE%\.codex\automations\tiku-module-run-v2-autopilot-2\automation.toml` records `status = "PAUSED"`.
- `%USERPROFILE%\.codex\automation-on-demand\tiku-module-run-v2-mechanic-2\automation.toml` records
  `status = "PAUSED"`.
- No automation runner, unattended runner, scheduled automation, or e2e command was launched.

Cost Calibration Gate remains blocked.
