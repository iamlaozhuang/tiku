# 2026-07-03 Source Landing 8 Role Local Account Data Fixture Hardening Plan

## Task

- Task ID: `source-landing-8-role-local-account-data-fixture-hardening-2026-07-03`
- Branch: `codex/source-landing-8-role-local-account-data-fixture-hardening-2026-07-03`
- Depends on: `source-landing-8-role-credential-backed-fixture-hardening-plan-2026-07-03`
- Goal: prepare a redacted readiness inventory for the local test-owned accounts, organization contexts, authorization
  contexts, and fixture/data prerequisites needed before the credential-backed 8-role local acceptance rerun.

## Boundary

This task may read the private account fixture file only as read-only account input metadata and only through commands
that output redacted role-presence results. It must not output, copy, normalize, commit, or summarize account values.

Approved private account fixture path for this task:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

## Allowed Work

- Confirm the private account fixture file exists.
- Confirm whether the eight primary role markers are present, without printing matching lines.
- Read existing e2e specs and prior evidence as non-sensitive source references.
- Produce a redacted readiness matrix and stop criteria for the runtime rerun.
- Update state, queue, evidence, and audit.

## Blocked Work

- No acceptance rerun.
- No dev server, browser, screenshot, trace, DOM dump, or Playwright runtime command.
- No DB read/write/reset/import, raw row evidence, schema, migration, or seed action.
- No product source, test source, fixture source, script, dependency, package, lockfile, env, Provider, staging/prod,
  deployment, release readiness, final Pass, production usability, or Cost Calibration work.

## Planned Redacted Checks

```powershell
# Output only role booleans and existence status; never output matching lines or file contents.
# Read e2e specs only for role/spec coverage counts.
```

## Validation

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-03-source-landing-8-role-local-account-data-fixture-hardening.md docs/05-execution-logs/acceptance/2026-07-03-source-landing-8-role-local-account-data-fixture-readiness.md docs/01-requirements/traceability/2026-07-03-source-landing-8-role-local-account-data-fixture-hardening.md docs/05-execution-logs/evidence/2026-07-03-source-landing-8-role-local-account-data-fixture-hardening.md docs/05-execution-logs/audits-reviews/2026-07-03-source-landing-8-role-local-account-data-fixture-hardening.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId source-landing-8-role-local-account-data-fixture-hardening-2026-07-03
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId source-landing-8-role-local-account-data-fixture-hardening-2026-07-03 -SkipRemoteAheadCheck
```
