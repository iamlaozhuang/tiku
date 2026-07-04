# 2026-07-03 Source Landing 8 Role Credential-Backed Local Acceptance Rerun Preflight Gap Split

## Block

`source-landing-8-role-credential-backed-local-acceptance-rerun-preflight-2026-07-03` is blocked before runtime execution.

## Root Cause

The current acceptance harness cannot yet prove the new all-role credential-backed target. The approved private account
fixture exists and contains all eight role markers, but the current e2e suite does not read that fixture and still uses
a mixed coverage model:

- real login for some student/admin/organization flows;
- route-fulfilled session fixtures for some browser denial checks;
- fixture-first contract checks for several role-separated rows.

Running the previous seven-spec sequence would be a false positive for the new target.

## Repair Task

- Task ID: `repair-8-role-credential-backed-acceptance-harness-2026-07-03`
- Purpose: adapt or add the local acceptance harness so each primary role can be exercised through a credential-backed
  local login/session path using approved test-owned inputs and redacted evidence.

## Repair Boundaries

Allowed for the repair only after its own branch and task packet are materialized:

- e2e/test harness source changes scoped to the credential-backed acceptance harness;
- read-only use of `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` as login input;
- local Playwright runtime validation for the repaired harness;
- redacted evidence with role names, route categories, assertion categories, and pass/fail/block summaries only.

Still blocked unless a later task explicitly narrows and approves it:

- product source changes;
- DB schema/migration/seed/reset/import or raw DB row evidence;
- Provider execution, Provider config, Prompt text, or raw AI I/O;
- env-secret output or credential/session/cookie/header evidence;
- screenshots, traces, raw DOM dumps;
- staging/prod/deploy, PR, force push, release readiness, final Pass, production usability, or Cost Calibration.

## Restart Rule

After the repair is committed, fast-forward merged, pushed, and cleaned up, the full 8-role credential-backed local
acceptance rerun must restart from `personal_standard_student`.
