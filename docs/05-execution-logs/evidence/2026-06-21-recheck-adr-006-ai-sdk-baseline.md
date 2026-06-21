# Evidence: Recheck ADR-006 AI SDK Baseline

**Date:** 2026-06-21
**Task id:** `recheck-adr-006-ai-sdk-baseline`
**Branch:** `codex/recheck-adr-006-ai-sdk-baseline`
**Evidence mode:** command/result summary only.

## Read-Only Package Facts

`package.json` currently records:

- `ai` `^6.0.204`
- `@ai-sdk/alibaba` `^1.0.28`
- `@ai-sdk/openai-compatible` `^2.0.50`

No package or lockfile was changed.

## Validation Results

| command                                                                                                                                                         | result                                                                                                                                                                             | evidence                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                              | pass                                                                                                                                                                               | Exit 0, no whitespace errors.                                                                                                       |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...`                                                                                                     | pass                                                                                                                                                                               | `All matched files use Prettier code style!`                                                                                        |
| `rg -n "AI SDK\s+\| `ai`                                                                                                                                        | Deferred until an approved provider integration task passes dependency introduction gate and provider/env gates" docs\02-architecture\adr\adr-006-runtime-dependency-alignment.md` | pass                                                                                                                                | Remaining deferred line is `Optional AI providers`; installed AI SDK baseline is no longer recorded as wholly deferred. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId recheck-adr-006-ai-sdk-baseline` | pass                                                                                                                                                                               | Scanned 6 changed docs/state files; all matched allowed scope; pre-commit hardening passed.                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId recheck-adr-006-ai-sdk-baseline`   | pass                                                                                                                                                                               | Git readiness passed; `master` and `origin/master` both at `cdc8accd`; evidence and audit paths present; pre-push readiness passed. |

## Runtime Boundary

No Provider call, Provider configuration, `.env` read/change, prompt/provider payload exposure, browser/e2e/dev-server runtime, database, schema, migration, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work was performed.
