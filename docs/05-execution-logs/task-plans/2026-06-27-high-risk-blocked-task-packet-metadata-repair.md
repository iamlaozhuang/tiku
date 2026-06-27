# High-risk blocked task packet metadata repair task plan

## Task

- Task id: `high-risk-blocked-task-packet-metadata-repair-2026-06-27`
- Branch: `codex/high-risk-blocked-metadata-repair-20260627`
- Requested action: repair high-risk blocked task packet metadata only.

## Read context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Baseline

- `master` and `origin/master` are aligned at `73f791412d4a3c12bccfd4a0cbafe83d2e68d5c6`.
- Queue slimming diagnostic reports `queueSlimmingDecision: clean`, `selfRepairCandidateCount: 0`, and
  `highRiskRepairBlockedCount: 19`.
- The repair scope is metadata only; it does not unblock the high-risk capabilities themselves.

## Implementation plan

1. Register this docs/state metadata repair task in `task-queue.yaml` and `project-state.yaml`.
2. Identify all 19 task packets reported by the same missing-field rules as
   `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`.
3. Fill only required packet metadata fields: `executionProfile`, `validationPolicy`, `evidencePath`,
   `auditReviewPath`, `planPath`, `allowedFiles`, `blockedFiles`, `validationCommands`, and `closeoutPolicy` where
   missing.
4. Preserve each target task's blocked/high-risk status and do not approve execution of browser, DB, Provider, payment,
   deployment, source, release readiness, final Pass, PR, or force push work.
5. Run queue slimming/self-repair diagnostic and docs/state gates.

## Risk controls

- No product source, tests, schema, migrations, scripts, dependencies, env/secret files, Provider configuration, DB
  state, browser/e2e/dev-server runtime, deployment, PR, force-push, release readiness, final Pass, payment, external
  services, or Cost Calibration Gate work.
- The metadata repair may add file paths and validation command strings, but it must not execute the target blocked
  tasks.
- Evidence records task ids and aggregate counts only; it does not include secrets, tokens, database URLs,
  Authorization headers, raw DB rows, plaintext `redeem_code`, prompt/provider payloads, private answer text, full
  paper content, internal numeric ids, or publicId inventories.

## Validation plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId high-risk-blocked-task-packet-metadata-repair-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId high-risk-blocked-task-packet-metadata-repair-2026-06-27`
