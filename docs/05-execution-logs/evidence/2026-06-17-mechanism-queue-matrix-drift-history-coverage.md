# Evidence: mechanism queue matrix drift history coverage

result: pass

## Summary

- task: `mechanism-queue-matrix-drift-history-coverage`
- branch: `codex/mechanism-queue-matrix-drift-history-coverage`
- executionProfile: `docs_state_lite`
- scope: local mechanism diagnostic script and smoke coverage only

## Required Anchors

- changed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-queue-matrix-drift-history-coverage.md`
  - `docs/05-execution-logs/evidence/2026-06-17-mechanism-queue-matrix-drift-history-coverage.md`
  - `docs/05-execution-logs/task-plans/2026-06-17-mechanism-queue-matrix-drift-history-coverage.md`
  - `scripts/agent-system/Get-TikuNextAction.ps1`
  - `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- RED: PASS. After the smoke fixture added one history-covered matrix batch and one history-covered source planning task, `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1` failed because current diagnostics reported `matrixBatchMissingInQueue:2,sourcePlanningTaskMissingInQueue:2` instead of the expected `1,1`.
- GREEN: PASS. After script repair, `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1` passed.
- Closeout implementation commit: `0830cd075fb5d9e0ffd2d9ebaa9347ac553c3125`.
- validation commands and results:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`: passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`: passed; local diagnostic reported `queueMatrixDrift=matrixBatchMissingInQueue:0,sourcePlanningTaskMissingInQueue:0`.
  - `npx.cmd prettier --check --ignore-unknown <mechanism-queue-matrix-drift-history-coverage changed files>`: passed.
  - `npm.cmd run lint`: passed.
  - `npm.cmd run typecheck`: passed.
  - `git diff --check`: passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-queue-matrix-drift-history-coverage`: passed.
- redaction status: PASS; evidence contains only command names, pass/fail status, and aggregate diagnostic counts.
- blocked remainder: high-risk gates remain separately blocked.
- residual risk: existing legacy status/evidence findings remain non-blocking diagnostics outside this task; this change only fixes matrix/history coverage drift accounting.
- Cost Calibration Gate remains blocked.

## Implementation Notes

- `Get-TikuNextAction.ps1` now counts both active queue ids and `task-history-index.yaml` ids when checking matrix completed batch and source planning task coverage.
- `Get-TikuNextAction.Smoke.ps1` now proves history-covered matrix entries are not reported as missing while genuinely missing entries remain visible in drift diagnostics.

## Taste Compliance Self-Check

- Frontend/UI rules: not applicable; no UI files changed.
- N+1 and DB schema rules: PASS; no database, schema, migration, or Drizzle change.
- API response contract: not applicable; no API response behavior changed.
- Naming discipline: PASS; mechanism names use existing queue/matrix/task-history terminology.
- Comment discipline: PASS; no unnecessary comments added.
- Immutability: PASS; script builds new covered id collections and does not mutate parsed task blocks.
- Evidence before conclusion: PASS; RED/GREEN and validation commands are recorded.

## Redaction Boundary

Evidence records command names, pass/fail status, and aggregate diagnostic behavior only. It must not include `.env*`, secrets, tokens, cookies, Authorization headers, database URLs, provider payloads, raw prompt, raw answer, plaintext `redeem_code`, row data, private data, publicId inventories, or full paper/material content.
