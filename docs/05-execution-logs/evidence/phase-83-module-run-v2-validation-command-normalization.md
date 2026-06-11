# Evidence: phase-83-module-run-v2-validation-command-normalization

result: pass

## Summary

Phase83 tuned the Module Run v2 validation-command mechanism so legacy focused placeholders can be normalized only through
an explicit scoped unit-test command. The change preserves the existing hard stops for e2e, provider, env/secret,
schema/migration, dependency, deploy, payment, external-service, destructive DB, PR, force-push, and Cost Calibration Gate
work.

Automation remains paused. The unattended runner and autopilot were not executed.

## Required Anchors

- Batch range: phase-83
- RED: `Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract`
  failed before normalization with `HARD_BLOCK_LOCAL_E2E_CAPABILITY` and `HARD_BLOCK_LOCAL_E2E_COMMAND` for
  `npm.cmd run test -- --run focused`.
- GREEN: after mechanism and queue updates, the same readiness command returned `autodriveSchemaDecision: can_autodrive`.
- Commit: `d5a889069d36bdecb2ae9e22f633f87628aa1313` accepted ancestor before the phase83 local commit.
- localFullLoopGate: mechanism validation completed with targeted PowerShell smoke, lint, typecheck, diff check, and
  Module Run v2 readiness gates.
- threadRolloverGate: current thread can continue; no rollover required before closeout.
- nextModuleRunCandidate: `batch-111-personal-learning-ai-request-context-local-contract` after phase83 closeout.
- blocked remainder: automation resume, unattended runner, e2e execution, provider/env/schema/deploy/dependency/payment/
  external-service work, PR/force-push, and Cost Calibration Gate remain blocked.
- Cost Calibration Gate remains blocked.

## Scope

Allowed:

- mechanism scripts and smoke tests for validation-command normalization;
- docs/state task queue and project-state updates;
- phase83 task plan, evidence, and audit review;
- docs-only normalization of batch-111 and batch-112 validation commands to explicit scoped unit commands.

Blocked:

- source product code changes under `src/**`;
- package or lockfile changes;
- schema, migration, `src/db/schema/**`, or `drizzle/**`;
- env/secret reads or writes;
- provider calls, provider configuration, provider cost measurement, and Cost Calibration Gate execution;
- e2e, browser, staging/prod/cloud/deploy, payment, external-service, destructive DB, PR, or force-push work.

## Validation

| Command                                                                                                                                                                                             | Result | Notes                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract` | fail   | RED baseline before normalization: `HARD_BLOCK_LOCAL_E2E_COMMAND` and `HARD_BLOCK_LOCAL_E2E_CAPABILITY`.                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`                                                                 | pass   | Covers hard block without replacement, scoped-unit replacement, advisory baseline, local e2e gate, and closed/proposal states.          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`                                                                        | pass   | Seed output keeps wide focused baseline only in `validationCommandLifecycle.phase: advisory_baseline`, not legacy `validationCommands`. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`                                                             | pass   | Self-review still requires advisory/focused evidence anchors and rejects unsafe seed shapes.                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`                                                               | pass   | Validation surface continues to treat advisory baseline as separate from focused runnable validation.                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId batch-111-personal-learning-ai-request-context-local-contract` | pass   | Batch111 readiness returns `autodriveSchemaDecision: can_autodrive`; future batch111 unit test was not executed.                        |
| `npm.cmd run lint`                                                                                                                                                                                  | pass   | ESLint completed successfully.                                                                                                          |
| `npm.cmd run typecheck`                                                                                                                                                                             | pass   | `tsc --noEmit` completed successfully.                                                                                                  |
| `git diff --check`                                                                                                                                                                                  | pass   | No whitespace errors.                                                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-83-module-run-v2-validation-command-normalization`        | pass   | Module Run v2 closeout readiness passed after evidence and audit were written.                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-83-module-run-v2-validation-command-normalization`             | pass   | Scope, blocked-file, sensitive-evidence, and terminology hardening passed.                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-83-module-run-v2-validation-command-normalization`               | pass   | Pre-push readiness passed before local merge/push.                                                                                      |

## Queue Normalization

- `batch-111-personal-learning-ai-request-context-local-contract` now records
  `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-context-service.test.ts`.
- `batch-112-personal-learning-ai-redacted-result-reference-local-contract` now records
  `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-reference-service.test.ts`.
- Both tasks declare `validationCommandNormalization: approved_docs_only_placeholder_to_scoped_unit`.
- Batch112 remains dependency-blocked by batch111 and was not claimed.

## Automation Pause Check

- No repository TOML file was found with `rg --files -uu -g "*.toml"` excluding `.git`, `.worktrees`, and `node_modules`.
- `%USERPROFILE%\.codex\tiku` contained no TOML files during this check.
- `project-state.yaml` still records `plannedPauseStatus: active` and `plannedPauseKeepsAutomationPaused: true`.
- `tiku-module-run-v2-autopilot`, unattended runner, and scheduled automation were not started or resumed.

Cost Calibration Gate remains blocked.
