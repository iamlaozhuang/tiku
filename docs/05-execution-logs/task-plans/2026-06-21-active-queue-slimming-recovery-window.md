# Active queue slimming recovery window task plan

## Task

- Task id: `active-queue-slimming-2026-06-21-recovery-window`
- Branch: `codex/active-queue-slimming-recovery-window-20260621`
- Requested action: move terminal historical active queue entries into the June archive so the active queue keeps only the recovery window for terminal tasks.

## Read context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Baseline

- `master` and `origin/master` are aligned at `598ef110522cf24257c598c314ad8b8ad4a36e6a`.
- Baseline diagnostic: `activeQueueTaskCount: 82`, `activeQueueTerminalCount: 39`, `terminalRecoveryWindow: 8`, `archiveCandidateCount: 31`.
- This task is docs/state/archive-only. It does not execute or alter product source, tests, schema, migrations, scripts, env/secret files, dependencies, Provider configuration, database state, dev-server/browser/e2e runtime, deploy, PR, force-push, payment, external services, authorization runtime behavior, or Cost Calibration Gate state.

## Implementation plan

1. Register this maintenance task in `project-state.yaml` and `task-queue.yaml` with explicit allowed and blocked files.
2. Append this task as the current terminal maintenance item, then compute archive candidates using the same terminal recovery window rule as `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`.
3. Move full task blocks for the terminal historical candidates from `task-queue.yaml` to `archive/task-queue-archive-2026-06.yaml` without semantic edits.
4. Add one lightweight `task-history-index.yaml` entry per moved task.
5. Update archive/index metadata timestamps and task counts.
6. Run diagnostics and local validation, then record redacted command summaries in evidence.

## Candidate rule

- Terminal statuses: `closed`, `done`, `merged`, `pushed`.
- Recovery window target: `8`.
- After this task is registered as current, keep the most recent eight terminal task blocks in active queue and archive older terminal blocks.
- Expected moved count: `32` terminal task blocks.

## Risk controls

- Preserve full archived task bodies as authoritative history.
- Do not remove pending, blocked, planned, claimed, or retrying tasks.
- Do not edit high-risk runtime or product files.
- Evidence uses command/result summaries only and excludes secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`, raw prompts, provider payloads, private answer text, full paper content, internal numeric ids, and publicId inventories.

## Validation plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-slimming-2026-06-21-recovery-window`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId active-queue-slimming-2026-06-21-recovery-window`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId active-queue-slimming-2026-06-21-recovery-window -SkipRemoteAheadCheck`
