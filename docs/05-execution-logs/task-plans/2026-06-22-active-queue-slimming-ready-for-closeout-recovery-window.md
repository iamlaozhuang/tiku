# Active Queue Slimming Ready-For-Closeout Recovery Window Plan

## Task

- Task id: `active-queue-slimming-2026-06-22-ready-for-closeout-recovery-window`
- Date: 2026-06-22
- Branch: `codex/active-queue-slimming-20260622`
- Requested action: move terminal historical active queue entries into the June archive so the active queue keeps only the recovery window for terminal tasks.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Baseline

- `master` and `origin/master` are aligned at `7389f2b6d4aa5b7c7a34244adf612fda3a886152`.
- Baseline diagnostic: `activeQueueTaskCount: 56`, `activeQueueTerminalCount: 13`, `terminalRecoveryWindow: 8`, `archiveCandidateCount: 5`.
- After registering this current terminal maintenance task, the expected archive movement is `6` task blocks so the final terminal recovery window remains `8`.
- This task is docs/state/archive-only. It does not execute or alter product source, tests, schema, migrations, scripts, env/secret files, dependencies, Provider configuration, database state, dev-server/browser/e2e runtime, deploy, PR, force-push, payment, external services, authorization runtime behavior, or Cost Calibration Gate state.

## Candidate Rule

- Terminal statuses: `closed`, `done`, `merged`, `pushed`.
- Recovery window target: `8`.
- After this task is registered as current, keep the most recent eight terminal task blocks in active queue and archive older terminal blocks.
- Do not move `ready_for_closeout` entries in this pass because they are not terminal under the active queue slimming SOP.

## Task Ids To Archive

- `close-organization-detail-management`
- `close-employee-import-management`
- `close-employee-transfer-unbind-management`
- `low-risk-audit-closeout-state-normalization`
- `low-risk-full-unit-regression-repair`
- `closeout-reconcile-commit-checkpoint`

## Risk Controls

- Preserve full archived task bodies as authoritative history.
- Do not remove pending, blocked, ready_for_closeout, planned, claimed, or retrying tasks.
- Do not edit high-risk runtime or product files.
- Evidence uses command/result summaries only and excludes secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`, raw prompts, provider payloads, private answer text, full paper content, internal numeric ids, and publicId inventories.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-slimming-2026-06-22-ready-for-closeout-recovery-window`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId active-queue-slimming-2026-06-22-ready-for-closeout-recovery-window`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId active-queue-slimming-2026-06-22-ready-for-closeout-recovery-window -SkipRemoteAheadCheck`
