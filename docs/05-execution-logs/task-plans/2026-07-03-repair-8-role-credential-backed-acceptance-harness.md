# 2026-07-03 Repair 8 Role Credential-Backed Acceptance Harness Plan

## Task

- Task ID: `repair-8-role-credential-backed-acceptance-harness-2026-07-03`
- Branch: `codex/repair-8-role-credential-backed-acceptance-harness-2026-07-03`
- Depends on: `source-landing-8-role-credential-backed-local-acceptance-rerun-preflight-2026-07-03`
- Goal: add a focused local e2e harness that can exercise all eight primary roles through credential-backed login/session
  paths using approved test-owned private account input.

## Root Cause

The prior rerun preflight showed the current seven-spec sequence would reproduce a mixed checkpoint. It does not read
the approved private 8-role account fixture and therefore cannot honestly prove all eight primary roles as
credential-backed runtime paths.

## TDD Plan

1. RED: add a focused failing harness test that expects all eight primary role credentials to load from the approved
   private fixture.
2. GREEN: implement the minimal private fixture loader and credential-backed login/session checks.
3. Verify: run the focused Playwright spec with `--trace=off`, then run scoped governance gates.

## Boundaries

Allowed:

- `e2e/credential-backed-8-role-local-acceptance.spec.ts`
- Docs/state/evidence/audit for this task.
- Read-only use of `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` as login input.
- Focused local Playwright validation with redacted evidence.

Blocked:

- Product source changes.
- DB direct read/write/reset/import, schema, migration, seed, raw row evidence.
- Provider call/configuration, Prompt text, raw AI input/output.
- Env-secret output, credential/session/cookie/header/localStorage evidence.
- Screenshots, traces, DOM dumps.
- Staging/prod/deploy, PR, force push, release readiness, final Pass, production usability, Cost Calibration.
