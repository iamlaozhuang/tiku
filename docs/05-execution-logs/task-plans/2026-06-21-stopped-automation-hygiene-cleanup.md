# Stopped automation hygiene cleanup task plan

## Task

- Task id: `stopped-automation-hygiene-cleanup-2026-06-21`
- Branch: `codex/stopped-automation-hygiene-cleanup-20260621`
- Requested action: execute the approved stopped automation hygiene cleanup and then recommend the next work item.

## Read context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`

## Baseline

- `master` and `origin/master` are aligned at `b3cc3ff852852a7003482433382565ad3b0ea587`.
- `Get-TikuProjectStatus.ps1` reports `stoppedAutomationHygieneDecision: cleanup_available`.
- Read-only hygiene reports one expired active terminal registry path, counted as two cleanup candidates by the script because it records both the cleanup kind and the run-registry action for the same file.
- Active queue is already slimmed to `terminalRecoveryWindow=8`.

## Implementation plan

1. Register this docs/state hygiene cleanup task in `project-state.yaml` and `task-queue.yaml`.
2. Execute `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup` through the existing script safety rails.
3. Rerun stopped automation hygiene read-only and project status diagnostics.
4. Preserve the active queue recovery window by moving the oldest terminal task displaced by this current task to the June archive and history index.
5. Record redacted evidence and audit review.
6. Run formatting, lint, typecheck, `git diff --check`, queue diagnostics, and Module Run v2 readiness gates.

## Risk controls

- Cleanup is limited to script-approved paths under `%USERPROFILE%\.codex\tiku`.
- No product source, tests, schema, migrations, scripts, dependencies, env/secret files, Provider configuration, database state, browser/e2e/dev-server runtime, deployment, PR, force-push, payment, external services, or Cost Calibration Gate work.
- Evidence records command summaries and registry/run ids only; no secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`, prompt/provider payloads, private answer text, full paper content, internal numeric ids, or publicId inventories.
- If cleanup produces hard blocks or deferred cleanup, stop after evidence/audit and do not force-delete anything manually.

## Validation plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `npx.cmd prettier --check --ignore-unknown ...`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stopped-automation-hygiene-cleanup-2026-06-21`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId stopped-automation-hygiene-cleanup-2026-06-21`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId stopped-automation-hygiene-cleanup-2026-06-21 -SkipRemoteAheadCheck`
