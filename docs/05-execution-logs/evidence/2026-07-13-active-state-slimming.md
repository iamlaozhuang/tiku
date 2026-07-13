# Active State Slimming Evidence

Date: 2026-07-13

Task: `content-admin-platform-m2-active-state-slimming-2026-07-13`

productClosureContribution: `none; mechanism budget item`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

The task plan owns the full read list and exact archive inventory. No credential, database, provider, browser, product
runtime, product test, or deployment capability was needed.

## Requirement Mapping Result

M2 changes recovery metadata only. It preserves the standing authorization pointer and deployment block without changing
`effectiveEdition`, authorization scope, `redeem_code`, organization, quota, AI, or any other product rule.

## TDD Evidence

- RED: the recovery-surface smoke failed because the new Guard did not exist.
- GREEN: the recovery Guard passes the real repository and 1 positive/6 negative smoke cases.

## Validation

result: pass

validationStatus: pass

reviewStatus: pass

deploymentExecuted: false

### Archive integrity

- Project-state snapshot: 3,722,463 bytes; SHA-256
  `e9d919822577b2279eae4852f05a6aa9c1cd20617936059e6cc9ae99d7139f59`; 894 top-level keys.
- Task-queue snapshot: 1,781,709 bytes; SHA-256
  `ed11a2e07f7d4519d4f02f36449050b4469e4aeba67eedcfcf821ffba7b2cb34`; 241 archived active records.
- Both files were hashed before and after the exact move; bytes and hashes matched. The recovery Guard rechecks hashes,
  lengths, inventory counts, and all existing history-index paths on every hook run.

### Default recovery surface

- `project-state.yaml`: 9,253 bytes / 163 lines / 9 top-level keys.
- `task-queue.yaml`: 15,806 bytes / 310 lines / exactly M2 plus B0.
- `active-state-history-index.yaml`: 2,217 bytes / 42 lines.
- Default state/queue/index read surface: 27,276 bytes, about 0.50% of the 5,504,172 archived bytes.
- New-thread recovery output identifies the Program, M2, B0, standing authorization, canonical serial plan, history
  index, and deployment block without opening either archive snapshot.

### Focused validation

- PowerShell parser: pass for the recovery Guard and smoke.
- YAML parse: pass for both active files, the compact index, and both immutable snapshots.
- Active recovery smoke: pass, 1 positive and 6 negative cases.
- Program Guard smoke: pass, 2 positive and 13 negative cases.
- Real recovery Guard and real Program Guard: pass.
- Active link validation: 158 repository targets checked, 0 missing.
- `Get-TikuNextAction.ps1`: pass; current task and closeout action recovered, no queue/history drift finding.
- Scoped format and `git diff --check`: pass. Immutable snapshots are excluded from write-formatting and verified by
  hash instead.
- Module Run pre-commit hardening: pass for the exact 14-file M2 inventory.
- Product tests/build: not run by design; M2 changed governance parsing/docs/state only and did not change product or
  product-test infrastructure.

Recorded validation commands:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.Smoke.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.ps1 -RepositoryRoot .`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.Smoke.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.ps1 -Phase manual`: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown M2_CHANGED_FILES`: pass through the repository Prettier runtime.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-platform-m2-active-state-slimming-2026-07-13`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-platform-m2-active-state-slimming-2026-07-13`: pass; rerun after this evidence update.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-platform-m2-active-state-slimming-2026-07-13 -SkipRemoteAheadCheck`: required on the clean principal commit before push.

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_current_thread

nextModuleRunCandidate: `content-admin-platform-b0-contract-code-mapping-2026-07-13`

## Closeout

The standing authorization covers the principal commit, ff-only merge, ordinary push, remote comparison, and isolation
cleanup. Git-derived final SHAs and clean state are not copied into a follow-up evidence commit.
