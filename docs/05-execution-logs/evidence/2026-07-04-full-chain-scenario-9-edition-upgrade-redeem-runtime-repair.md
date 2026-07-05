# 2026-07-04 Full-Chain Scenario 9 Edition Upgrade Redeem Runtime Repair Evidence

Status: closed

## Scope

- Task id: `full-chain-scenario-9-edition-upgrade-redeem-runtime-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-9-edition-upgrade-redeem-runtime-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-9-advanced-personal-pre-provider-2026-07-04`

## Redaction

- Private values output: false
- Plaintext card values output: false
- Raw DB rows or internal ids output: false
- Browser screenshots, raw DOM, traces, Provider payloads, prompts, raw AI I/O, full content: false

## Validation

- Focused unit tests: passed_exit_0; 3 files, 18 tests.
- Lint: passed_exit_0.
- Typecheck: passed_exit_0.
- Scoped Prettier write: passed_exit_0.
- Scoped Prettier check: passed_exit_0.
- `git diff --check`: passed_exit_0.
- Blocked path diff: passed_exit_0_no_output.
- Module Run v2 pre-commit: passed_exit_0.
- Module Run v2 pre-push: initial_failed_checkpoint_drift_then_passed_exit_0_after_state_checkpoint_repair.

## Implementation Summary

- Repository contract now carries `redeem_code_type`, `profession`, and `level` into the redemption write path.
- `personal_standard_activation` writes standard `personal_auth`.
- `personal_advanced_activation` writes advanced `personal_auth`.
- `edition_upgrade` requires one active matching standard `personal_auth`, writes `auth_upgrade`, and returns the existing `personal_auth` without inserting another one.
- Related unit fixtures were updated for the stricter row contract.

## Boundary Result

- Product source changed: true, limited to redeem runtime source and unit tests listed in the task plan.
- Schema, migration, seed, dependency, browser, dev server, DB runtime, Provider, staging/prod, Cost Calibration, destructive DB operation: not executed.
- Release readiness, final Pass, production usability claim: not claimed.
