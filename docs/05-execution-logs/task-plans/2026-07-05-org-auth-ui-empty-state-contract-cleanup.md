# 2026-07-05 Org Auth UI Empty State Contract Cleanup Plan

## Scope

Align the remaining phase-8 org auth UI test with the current first-create empty-data contract.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- Current full-unit evidence from the paper legacy alias cleanup task

## Implementation Approach

1. Run the focused failing phase-8 test first and record RED.
2. Compare with the later phase-20 first-create test that requires organization creation controls to remain visible when enterprise data is empty.
3. Update the stale phase-8 expectation to assert the current first-create surface and preserve the existing error-state assertion.
4. Run focused phase-8 test plus adjacent phase-20 organization first-create test, then typecheck, lint, format, diff, and full unit audit.

## Boundaries

- Test contract/docs only unless RED analysis proves a UI regression.
- No source UI change, DB action, Provider call, browser/e2e/dev-server, env/credential access, dependency change, schema/migration/seed, staging/prod/deploy, release readiness, final Pass, or Cost Calibration claim.

## Risk Controls

- Empty enterprise data must still allow first organization creation.
- Error envelope behavior must remain visible.
- Do not remove loading, unauthorized, or error state coverage.
