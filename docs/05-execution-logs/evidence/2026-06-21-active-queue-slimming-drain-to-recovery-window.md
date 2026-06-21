# Active queue slimming drain to recovery window evidence

## Task

- Task id: `active-queue-slimming-2026-06-21-drain-to-recovery-window`
- Branch: `codex/active-queue-slimming-2026-06-21-drain-to-recovery-window`
- Commit: pending
- Scope: docs/state/archive-only active queue slimming to drain terminal candidates to `terminalRecoveryWindow=8`.

## Allowed files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-21-active-queue-slimming-drain-to-recovery-window.md`
- `docs/05-execution-logs/evidence/2026-06-21-active-queue-slimming-drain-to-recovery-window.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-active-queue-slimming-drain-to-recovery-window.md`

## Blocked files and gates

- Blocked files: `.env*`, package/lockfiles, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`, `playwright-report/**`, `test-results/**`.
- Blocked gates: provider/model call, env/secret access, schema/migration, dependency changes, payment, deploy, PR, force-push, destructive DB, staging/prod/cloud DB, Cost Calibration Gate.

## Redaction

Evidence records command/result summaries and task ids only. It does not include secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext redeem codes, raw prompts, raw generated AI content, provider payloads, raw employee answer text, or full paper content.

## Candidate verification

- Batch range: single docs/state/archive queue slimming task, `active-queue-slimming-2026-06-21-drain-to-recovery-window`.
- RED: pre-move diagnostic showed `activeQueueTaskCount: 50`, `activeQueueTerminalCount: 34`, `terminalRecoveryWindow: 8`, and `archiveCandidateCount: 25`. After this task became current, the previous closed `currentTask` also became eligible, making the drain target `26` terminal blocks.
- GREEN: post-move diagnostic showed `queueSlimmingDecision: clean`, `activeQueueTaskCount: 25`, `activeQueueNonTerminalCount: 17`, `activeQueueTerminalCount: 8`, `archiveCandidateCount: 0`, `selfRepairCandidateCount: 0`, and `highRiskRepairBlockedCount: 19`.
- GREEN after close: post-close diagnostic stayed clean with `activeQueueTaskCount: 25`, `activeQueueNonTerminalCount: 16`, `activeQueueTerminalCount: 9`, and `archiveCandidateCount: 0`.
- Structural parser selected and verified `26` terminal blocks before movement; movement result: `moved=26`.
- Archived task ids:
  - `active-queue-slimming-2026-06-21-diagnostic-window-2`
  - `active-queue-slimming-2026-06-21-post-edition-window`
  - `module-run-v2-personal-ai-local-transport-contract-planning`
  - `module-run-v2-personal-ai-local-ui-browser-planning`
  - `module-run-v2-cross-role-local-flow-planning`
  - `blocked-gates-approval-package-materialization`
  - `ap-01-ai-scoring-provider-execution-approval-package`
  - `mechanism-authorization-seed-dedup-history-index`
  - `batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
  - `batch-213-ai-task-and-provider-local-task-request-policy-and-result-referen`
  - `batch-214-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
  - `batch-215-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`
  - `mechanism-ai-task-provider-auto-seed-history-dependency`
  - `batch-216-personal-learning-ai-personal-generation-request-flow`
  - `batch-217-personal-learning-ai-paper-and-mock-exam-context-selection`
  - `batch-218-personal-learning-ai-local-ui-browser-experience-for-request-and`
  - `batch-219-personal-learning-ai-redacted-ai-call-log-reference-without-stori`
  - `batch-220-organization-training-organization-admin-training-draft-publish-ta`
  - `batch-221-organization-training-employee-answer-lifecycle-local-role-flow`
  - `batch-222-organization-training-paper-and-mock-exam-context-usage-without-ex`
  - `batch-223-organization-training-audit-log-redacted-reference`
  - `batch-224-organization-analytics-aggregate-only-organization-metrics`
  - `batch-225-organization-analytics-privacy-preserving-employee-statistics`
  - `batch-226-organization-analytics-export-readiness-contracts-without-object-st`
  - `batch-227-organization-analytics-audit-log-redacted-reference`
  - `batch-228-ops-governance-and-retention-operations-facing-authorization-and-quota-go`
- Archive path: `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
- History index path: `docs/04-agent-system/state/task-history-index.yaml`.

## Validation commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId active-queue-slimming-2026-06-21-drain-to-recovery-window -PlannedFiles ...`
  - Result: pass.
  - Key output: `work readiness passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
  - Result: pass diagnostic.
  - Key output after movement and close: `queueSlimmingDecision: clean`, `archiveCandidateCount: 0`, `selfRepairCandidateCount: 0`, `highRiskRepairBlockedCount: 19`, `firstArchiveCandidates: none`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - Result: pass diagnostic.
  - Key output while in progress: `projectStatusDecision: current_task_active`, `projectStatusAction: finish_current_task`.
  - Key output after close: `projectStatusDecision: seed_proposal_available`, `projectStatusAction: request_auto_seed_approval:ai-task-and-provider`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
  - Result: pass diagnostic.
  - Key output while in progress: `currentTask: active-queue-slimming-2026-06-21-drain-to-recovery-window(in_progress)`, `recommendedAction: finish_current_task_closeout:active-queue-slimming-2026-06-21-drain-to-recovery-window`.
  - Key output after close: `recommendedAction: request_auto_seed_approval:ai-task-and-provider`, `stopReason: auto_seed_approval_required`.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-21-active-queue-slimming-drain-to-recovery-window.md docs/05-execution-logs/evidence/2026-06-21-active-queue-slimming-drain-to-recovery-window.md docs/05-execution-logs/audits-reviews/2026-06-21-active-queue-slimming-drain-to-recovery-window.md`
  - Result: pass.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/task-plans/2026-06-21-active-queue-slimming-drain-to-recovery-window.md docs/05-execution-logs/evidence/2026-06-21-active-queue-slimming-drain-to-recovery-window.md docs/05-execution-logs/audits-reviews/2026-06-21-active-queue-slimming-drain-to-recovery-window.md`
  - Result: pass.
  - Key output: `All matched files use Prettier code style!`
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId active-queue-slimming-2026-06-21-drain-to-recovery-window`
  - Result: pass.
  - Key output: `pre-commit hardening passed`, `filesToScan: 7`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId active-queue-slimming-2026-06-21-drain-to-recovery-window`
  - Result: pending.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId active-queue-slimming-2026-06-21-drain-to-recovery-window`
  - Result: pending.

## Thread rollover gate

- threadRolloverGate: not_required_current_turn
- nextModuleRunCandidate: pending_diagnostic_after_closeout
- localFullLoopGate: not applicable for this docs_state_archive_only task; local full flow and browser/e2e runtime remain blocked unless separately approved.

## Closeout

- Cost Calibration Gate remains blocked.
- Blocked remainder: provider/model call, env/secret access, schema/migration, dependency changes, payment, deploy, PR, force-push, destructive DB, staging/prod/cloud DB, product source changes, tests, and e2e remain blocked.
- Product source changed: no.
- Tests/e2e changed: no.
- Schema/migration changed: no.
- Scripts changed: no.
- Env/dependency/provider/payment/deploy changed: no.
- PR/force-push/destructive DB/Cost Calibration Gate used: no.
- FF merge/push/branch cleanup: pending.
