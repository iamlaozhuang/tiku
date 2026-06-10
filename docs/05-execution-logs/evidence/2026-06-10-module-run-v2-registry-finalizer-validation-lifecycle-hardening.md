# Module Run v2 Registry Finalizer Validation Lifecycle Hardening Evidence

**Task id:** `module-run-v2-registry-finalizer-validation-lifecycle-hardening`

**Branch:** `codex/module-run-v2-registry-finalizer-validation-lifecycle`

**Task kind:** `mechanism_repair`

**result:** pass

result: pass

## Summary

Batch 102:

Mechanic Lane B:

Lane B implements mechanism-only hardening after Lane A closed `batch-102`.

- Added a run registry finalizer for terminal registry state.
- Startup dirty active-owner classification now uses validation-surface before the heartbeat shortcut when evidence and audit exist.
- Auto-seeded tasks now declare `validationCommandLifecycle`, with broad repository baseline under `advisory_baseline`.
- Serial validation failures write terminal registry state through the finalizer.

Cost Calibration Gate remains blocked.

## RED

RED: batch-102 stopped with a dirty owner worktree whose focused gates passed, while broad baseline validation failed outside task scope and the run registry stayed `active/readiness` with empty `changedFiles`.

The mechanism failure mode was reproducible in startup classification: a dirty active owner with `safeToAdopt: false` could remain a stale active-owner stop instead of a governed validation-surface owner-recovery decision.

## GREEN

GREEN: mechanism smokes now cover the repair.

- Finalizer smoke records real changed files and cleanup-ready terminal state.
- Startup smoke covers focused pass plus advisory broad baseline failure with dirty owner and `safeToAdopt: false`, expecting `manual_required_owner_recovery` instead of stale active owner.
- Seed and self-review smokes require `validationCommandLifecycle`.
- Serial executor smoke records finalizer output on validation failure.

## Validation Results

| Command                                                                                                                                                                                               | Result | Notes                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Set-ModuleRunV2RunRegistryFinalizer.Smoke.ps1`                                                                        | pass   | Finalizer wrote stopped and cleanup-ready registry states with real `changedFiles`.                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`                                                                 | pass   | Covers fresh active owner protection plus evidence/audit-backed dirty owner recovery before heartbeat shortcut.                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`                                                                          | pass   | Seeded tasks include `validationCommandLifecycle` and advisory baseline.                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`                                                               | pass   | Self-review now requires lifecycle and advisory baseline.                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`                                                                  | pass   | Validation failure writes finalizer output to a temp registry root.                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`                                                                 | pass   | Focused pass plus advisory broad baseline failure stays closeout-ready when commit/audit are present.                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`                                                                          | pass   | Runner owner-recovery and control-loop smoke passed.                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`                                                                    | pass   | Dispatcher maps closeout and owner-recovery actions.                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`                                                             | pass   | Control-loop acceptance passed.                                                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`                                                                   | pass   | Schema smoke passed.                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId module-run-v2-registry-finalizer-validation-lifecycle-hardening` | pass   | `autodriveSchemaDecision: can_autodrive`.                                                                                                |
| `git diff --check`                                                                                                                                                                                    | pass   | No whitespace errors.                                                                                                                    |
| `npm.cmd run lint`                                                                                                                                                                                    | pass   | Initial run without local `node_modules` failed to resolve packages; passed after temporary junction to existing `D:\tiku\node_modules`. |
| `npm.cmd run typecheck`                                                                                                                                                                               | pass   | `tsc --noEmit` passed with existing dependencies only.                                                                                   |

No dependency install, package/lockfile edit, env/secret access, provider call, DB operation, e2e, deploy, payment, PR, force push, or Cost Calibration Gate action was performed.

Commit: b6bbff22.

## Next Autopilot Handoff

Pending post-merge next-autopilot takeover proof.

localFullLoopGate: mechanism L4 local control-loop validation.

threadRolloverGate: continue current mechanic thread through closeout; no new Codex thread launch is required.

nextModuleRunCandidate: pending next-autopilot takeover proof after merge and push.

## Redaction Check

This evidence contains no secrets, tokens, database URLs, Authorization headers, provider payloads, raw prompts, raw model responses, plaintext `redeem_code`, full `paper` content, DB rows, or customer/customer-like private data.
