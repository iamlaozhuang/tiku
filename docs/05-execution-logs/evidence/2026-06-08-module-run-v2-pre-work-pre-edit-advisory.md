# Module Run v2 Pre-Work Pre-Edit Advisory Evidence

## Summary

- result: pass
- scope: implementation
- branch: `codex/module-run-v2-pre-work-pre-edit-advisory`
- base branch: `master`
- base SHA: `318c65ec74388a7ba369f2d0665762d35864f485`
- changed surfaces: `scripts/agent-system/**`, state, queue, task plan, evidence, audit review
- forbiddenScope: `.husky/**`, package/lockfile, product code, env/secret, provider, staging/prod/cloud/deploy, payment,
  external-service, schema, migration, Cost Calibration Gate
- Cost Calibration Gate remains blocked

## Implementation

Added:

- `scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1`

The advisory script supports:

- `-Mode pre-work|pre-edit`
- optional `-TaskId`, defaulting to `project-state.yaml` `currentTask.id`
- optional `-PlannedFiles`, including both PowerShell array input and comma-separated CLI input
- queue-driven `allowedFiles`, `blockedFiles`, `riskTypes`, and `validationCommands` reporting
- Module Run v2 anchor reporting for `hookIntegrationMatrix`, `automationHandoffPolicy`, `threadRolloverGate`, and
  `Cost Calibration Gate remains blocked`
- planned file classification:
  - `ADVISORY_ALLOWED_FILE`
  - `ADVISORY_OUT_OF_SCOPE`
  - `ADVISORY_BLOCKED_FILE`

The script is report-only. Advisory findings exit `0` and do not block commit, push, or editing.

## TDD Evidence

RED:

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.Smoke.ps1`
- Result: failed as expected.
- Failure reason: `Missing advisory script: D:\tiku\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1`

GREEN:

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.Smoke.ps1`
- Result: pass.
- Output: `Module Run v2 work readiness smoke passed`

Manual advisory checks:

- `pre-work` command passed and reported branch, task metadata, allowed files, blocked files, risk types, validation
  commands, and Module Run v2 anchors.
- `pre-edit` command passed and classified:
  - `scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1` as `ADVISORY_ALLOWED_FILE`
  - `README.md` as `ADVISORY_OUT_OF_SCOPE`
  - `.husky/pre-commit` as `ADVISORY_BLOCKED_FILE`

## Validation Results

Passed:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.Smoke.ps1`:
  pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1
-Mode pre-work -TaskId module-run-v2-pre-work-pre-edit-advisory`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1
-Mode pre-edit -TaskId module-run-v2-pre-work-pre-edit-advisory -PlannedFiles
scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1,README.md,.husky/pre-commit`: pass
- `git diff --check`: pass
- scoped `prettier --write` for markdown and YAML files only: pass
- scoped `prettier --check` for markdown and YAML files only: pass
- required anchor check for `Module Run v2`, `pre-work`, `pre-edit`, `ADVISORY_BLOCKED_FILE`, and
  `Cost Calibration Gate remains blocked`: pass
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass

## Redaction And Blocked Gates

- No `.env.local` or `.env.example` content was read or modified.
- No secret, token, API key, database URL, Authorization header, provider payload, raw prompt, raw response, raw
  generated AI content, plaintext redeem_code, full paper content, raw answer, or employee subjective answer text was
  recorded.
- Provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost
  Calibration Gate execution remain blocked.

## Next Recommendation

Pilot the advisory script manually in the first Module Run v2 planning task. Do not wire it into `.husky/**` until it has
proven stable in at least one real Module Run.
