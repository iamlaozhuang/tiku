# Mechanism Historical Evidence Debt Register Evidence

## Summary

- Task id: `mechanism-historical-evidence-debt-register`
- Branch: `codex/mechanism-historical-evidence-debt-register`
- result: pass
- Evidence mode: `lite`
- Redaction: pass
- Scope: mechanism diagnostics and governance state only

## Approval Boundary

Approved by the current 2026-06-17 user prompt to execute the recommended mechanism task under project mechanism rules.

Blocked gates remained blocked:

- `.env*` read/write/output
- secret/token/cookie/Authorization header/DB URL/private data disclosure
- provider/model call
- schema/drizzle/migration
- dependency/package/lockfile
- staging/prod/cloud/deploy/payment/external-service
- PR/force-push
- Cost Calibration Gate

## TDD Evidence

RED:

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- Result: failed as expected before implementation
- Expected failure: `HistoricalEvidenceDebtPath` parameter was not supported yet

GREEN:

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- Result: pass

## Implementation Evidence

Changed behavior:

- `Get-TikuNextAction.ps1` accepts optional `HistoricalEvidenceDebtPath`.
- `Get-TikuNextAction.ps1` reads `docs/04-agent-system/state/historical-evidence-debt.yaml` when present.
- Historical evidence diagnostics now report registered and unregistered legacy-unavailable evidence separately.
- `missingHistoricalEvidence` now means unregistered missing historical evidence, while registered debt remains visible under `registeredLegacyUnavailableEvidence`.
- The debt register is explicitly non-evidence and does not satisfy dependency evidence gates.

Local real-state diagnostic after implementation:

- `historicalEvidenceFindings: missingHistoricalEvidence=0; closureEvidenceRecovered=1; archivedEvidenceRecovered=0; registeredLegacyUnavailableEvidence=5; unregisteredLegacyUnavailableEvidence=0; notBlockingCurrentRun=true`
- `driftFindings: queueMatrixDrift=matrixBatchMissingInQueue:0,sourcePlanningTaskMissingInQueue:0; notBlockingCurrentRun=true`
- The five known early legacy evidence gaps are registered as historical evidence debt.

No historical evidence was fabricated.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`: pass
- `npx.cmd prettier --check --ignore-unknown scripts/agent-system/Get-TikuNextAction.ps1 scripts/agent-system/Get-TikuNextAction.Smoke.ps1 docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/04-agent-system/state/historical-evidence-debt.yaml docs/05-execution-logs/task-plans/2026-06-17-mechanism-historical-evidence-debt-register.md`: pass
- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `git diff --check`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-historical-evidence-debt-register`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId mechanism-historical-evidence-debt-register`: pass

## Redaction Statement

This evidence records only command names, pass/fail status, and mechanism diagnostic counts. It does not include secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads, raw prompts, raw answers, publicId inventories, row data, or private data.

## Closeout Anchors

- Batch range: single mechanism maintenance task `mechanism-historical-evidence-debt-register`
- Commit: `f12fb219a9d22c59c77eaf0850ba36c8c7e3b17f`
- localFullLoopGate: not_applicable_docs_state_lite; no Browser, Playwright, dev server, provider, DB, staging, prod, cloud, deploy, payment, external-service, or Cost Calibration Gate work was run.
- threadRolloverGate: no rollover required for this single local mechanism task.
- nextModuleRunCandidate: none; final pre-merge diagnostic reported `idle_no_pending_task` and `no_seed_candidate`.

Cost Calibration Gate remains blocked.
