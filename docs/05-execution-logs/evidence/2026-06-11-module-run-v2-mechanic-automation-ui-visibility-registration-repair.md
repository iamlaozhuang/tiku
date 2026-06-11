# Codex Automation UI Visibility Registration Repair Evidence

## Task

- id: `module-run-v2-mechanic-automation-ui-visibility-registration-repair`
- branch: `codex/mechanism-serial-governance`
- task kind: `mechanism_repair`
- result: pass

## Summary

The Codex UI did not list the previously recorded automation even though local TOML files existed under the Codex automation directory. Direct update of `tiku-module-run-v2-autopilot-2` through the Codex automation API failed because that id was not present in the app registry.

Repair applied:

- Created one Codex app-managed automation with id `tiku-module-run-v2-autopilot`.
- Updated the app-managed automation prompt with the required mechanism anchors.
- Paused the stale local-only `tiku-module-run-v2-autopilot-2` record instead of deleting it.
- Updated mechanism state and script defaults so `tiku-module-run-v2-autopilot` is the only scheduled `ACTIVE` automation.
- Preserved `tiku-module-run-v2-autopilot-2` as a historical prompt anchor.
- Preserved `tiku-module-run-v2-mechanic-2` as the on-demand mechanic identity anchor.

## Validation

| Command                                                                                                                                    | Result | Summary                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------- |
| Codex automation API `view` for `tiku-module-run-v2-autopilot`                                                                             | pass   | Rendered the automation card in the app.                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.Smoke.ps1` | pass   | Registration readiness smoke passed.                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1`       | pass   | `activeAutomationRegistrationCount: 1`; active id is `tiku-module-run-v2-autopilot`; stale `-2` id is `PAUSED`. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`      | pass   | Startup readiness smoke passed after fixture registration fields and posture isolation were repaired.           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`               | pass   | Autopilot runner smoke passed.                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Set-ModuleRunV2RunRegistryFinalizer.Smoke.ps1`             | pass   | Run registry finalizer smoke passed.                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`             | pass   | Unattended readiness smoke passed.                                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`        | pass   | Stopped automation hygiene smoke passed.                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`                                    | pass   | Diagnostic remains read-only and reports no pending task.                                                       |

## Blocked Work

- No duplicate `ACTIVE` automation remains.
- No product code was changed.
- No dependency, package, lockfile, schema, migration, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, PR, force push, or Cost Calibration Gate action was performed.

## Product Closure Contribution

productClosureContribution: none; mechanism budget item.

## Local Full Loop

localFullLoopGate: L0/L1 mechanism governance and script smoke validation.

blocked remainder: user may refresh the Codex UI automation list to confirm the card appears in the list view; direct tool rendering already confirms the app-managed automation exists.

threadRolloverGate: continue_current_thread.

nextModuleRunCandidate: none; current queue still has no pending task.

## Redaction

Evidence records ids, statuses, paths, and command summaries only. It does not include secrets, tokens, database URLs, Authorization headers, provider payloads, raw prompts, raw generated AI content, plaintext redeem_code, full paper content, or private answer text.

Cost Calibration Gate remains blocked.
