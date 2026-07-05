# 2026-07-04 Full-chain Scenario 5 Employee Import Test Contract Repair Plan

## Scope

- Task id: `full-chain-scenario-5-employee-import-test-contract-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-5-employee-import-test-contract-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-5-employee-import-harness-repair-2026-07-04`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`
- Task type: minimal focused unit test contract repair.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-employee-import-harness-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-employee-import-harness-repair.md`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`

## Root Cause

The focused employee import tests expect `importedEmployees` and `rejectedRows`, but the current product contract also
returns the redacted aggregate field `generatedInitialPasswords`. For covered rows where provided passwords are used or
validation rejects rows before account creation, that aggregate is an empty array.

## Repair Plan

- Update only `tests/unit/phase-20-ra-01-04-employee-import.test.ts`.
- Add `generatedInitialPasswords: []` to expected response data for CSV employee-account import cases.
- Preserve existing assertions that audit metadata excludes private password/session values.
- Do not change product source, schema, migrations, seed, dependencies, runtime app behavior, or harness evidence.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/phase-20-ra-01-04-employee-import.test.ts src/server/validators/employee-account.test.ts`
- `npm.cmd run test:unit -- tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped files>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-5-employee-import-test-contract-repair-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-5-employee-import-test-contract-repair-2026-07-04 -SkipRemoteAheadCheck`

## Stop Rules

Stop if product source must change, if the response field exposes private generated password values in covered cases, if
tests require fixture expansion, if validation fails after repair, or if any Provider/staging/prod/Cost/destructive DB
or release-readiness boundary is reached.

## Next Task

After closeout, rerun the Scenario 5 harness repair validation so the corrected CSV/`sourceFormat` contract can close
before Scenario 5 runtime rerun.
