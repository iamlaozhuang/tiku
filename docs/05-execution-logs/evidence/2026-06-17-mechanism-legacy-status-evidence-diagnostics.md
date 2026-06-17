# Evidence: mechanism legacy status evidence diagnostics

result: pass

## Summary

- task: `mechanism-legacy-status-evidence-diagnostics`
- branch: `codex/mechanism-legacy-status-evidence-diagnostics`
- executionProfile: `docs_state_lite`
- scope: local mechanism diagnostic script and smoke coverage only

## Required Anchors

- changed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-legacy-status-evidence-diagnostics.md`
  - `docs/05-execution-logs/evidence/2026-06-17-mechanism-legacy-status-evidence-diagnostics.md`
  - `docs/05-execution-logs/task-plans/2026-06-17-mechanism-legacy-status-evidence-diagnostics.md`
  - `scripts/agent-system/Get-TikuNextAction.ps1`
  - `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- RED: PASS. After the smoke fixture expected `historicalQueueFindings` / `historicalEvidenceFindings` and added a known `blocked_validation_failure` status, `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1` failed because current output still used `statusFindings`, `evidenceFindings`, and reported `unsupportedStatus=1`.
- GREEN: PASS. After script repair, `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1` passed.
- Closeout implementation commit: `5abdd7c9c0a879bcc263c27198732ca104dcf653`.
- validation commands and results:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`: passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`: passed; local diagnostic reported `historicalQueueFindings: legacy_status_missing=0; legacy_terminal=5; knownBlockedValidation=1; unsupportedStatus=0` and `historicalEvidenceFindings: missingHistoricalEvidence=6`.
  - `npx.cmd prettier --check --ignore-unknown <mechanism-legacy-status-evidence-diagnostics changed files>`: passed.
  - `npm.cmd run lint`: passed.
  - `npm.cmd run typecheck`: passed.
  - `git diff --check`: passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-legacy-status-evidence-diagnostics`: passed.
- redaction status: PASS; evidence contains only command names, pass/fail status, and aggregate diagnostic counts.
- blocked remainder: high-risk gates remain separately blocked.
- residual risk: historical evidence gaps are not fabricated or closed by this task; they remain visible as historical evidence diagnostics, not current actionable blockers.
- Cost Calibration Gate remains blocked.

## Implementation Notes

- `Get-TikuNextAction.ps1` now reports historical queue hygiene as `historicalQueueFindings` and historical missing evidence as `historicalEvidenceFindings`.
- `blocked_validation_failure` is now treated as a known blocked validation status and no longer counted as unsupported status.
- Verbose output keeps first-item detail under `historicalQueueFindingsVerbose` and `historicalEvidenceFindingsVerbose`.

## Taste Compliance Self-Check

- Frontend/UI rules: not applicable; no UI files changed.
- N+1 and DB schema rules: PASS; no database, schema, migration, or Drizzle change.
- API response contract: not applicable; no API response behavior changed.
- Naming discipline: PASS; mechanism names use explicit historical queue/evidence diagnostic terminology.
- Comment discipline: PASS; no unnecessary comments added.
- Immutability: PASS; script records diagnostics into separate collections and does not mutate parsed task blocks.
- Evidence before conclusion: PASS; RED/GREEN and validation commands are recorded.

## Redaction Boundary

Evidence records command names, pass/fail status, and aggregate diagnostic behavior only. It must not include `.env*`, secrets, tokens, cookies, Authorization headers, database URLs, provider payloads, raw prompt, raw answer, plaintext `redeem_code`, row data, private data, publicId inventories, or full paper/material content.
