# 2026-07-03 Source Landing 8 Role Credential-Backed Local Acceptance Rerun Preflight Plan

## Task

- Task ID: `source-landing-8-role-credential-backed-local-acceptance-rerun-preflight-2026-07-03`
- Branch: `codex/source-landing-8-role-credential-backed-local-acceptance-rerun-preflight-2026-07-03`
- Depends on: `source-landing-8-role-local-account-data-fixture-hardening-2026-07-03`
- Goal: verify whether the current local acceptance harness can honestly run the requested credential-backed 8-role rerun
  before executing browser/runtime tests.

## Scope

Read-only preflight only. This task may inspect e2e source patterns and prior evidence, but it must not run acceptance,
start a dev server, launch a browser, read private account values, modify product/test source, connect to DB, call a
Provider, change env/dependency/schema/migration/seed/script files, deploy, or claim release readiness.

## Preflight Standard

The rerun may proceed only if the harness can prove every primary role through credential-backed local runtime coverage.
Existing fixture-first or route-fulfilled checks may supplement the rerun but cannot replace the primary role login/session
proof.

## Planned Checks

- Confirm whether e2e specs reference the approved private account fixture path.
- Confirm whether all eight primary roles have a current credential-backed runtime harness path.
- Stop and split a repair task if the current harness would only reproduce the earlier fixture-first checkpoint.
