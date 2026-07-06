# 2026-07-05 Admin Permission Session Contract Cleanup Plan

## Scope

Repair the current full-unit red subset in admin permission/session tests after later password reset distribution-window and cookie-backed session contracts superseded older expectations.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- Current full-unit evidence from the previous contract cleanup task

## Implementation Approach

1. Run the focused failing tests first and record RED.
2. Confirm whether reset password distribution payloads are required by current admin user/org-auth contracts.
3. Confirm whether raw `tiku_session` cookie requests should authenticate through `getRequestAuthorization` and then apply role permission checks.
4. If current runtime behavior is contract-correct, update stale test expectations only.
5. Rerun focused tests, typecheck, lint, format, diff, and full unit audit.

## Boundaries

- No production authorization logic change unless RED analysis proves an implementation security bug.
- No Provider call, DB connection/mutation, schema/migration/seed, browser/e2e/dev-server, env/credential access, dependency change, staging/prod/deploy, release readiness, final Pass, or Cost Calibration claim.

## Risk Controls

- Preserve fail-closed permission behavior: authenticated content admin still cannot read operations user management.
- Preserve reset password redaction boundary: tests assert structure without recording new private values in evidence.
- Do not weaken session or role checks to satisfy tests.
