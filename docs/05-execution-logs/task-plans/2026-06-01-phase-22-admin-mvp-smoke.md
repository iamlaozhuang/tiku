# Phase 22 Admin MVP Smoke Plan

## Scope

Validate admin MVP local surfaces for content and ops workflows through existing e2e.

## Coverage Targets

- `question`
- `material`
- `paper`
- `paper_section`
- `organization`
- `org_auth`
- `redeem_code`
- `audit_log`
- `ai_call_log`
- role denial boundaries

## Commands

- `npm.cmd run test:e2e -- e2e/staging-required-role-flows.spec.ts e2e/content-action-closures.spec.ts e2e/admin-audit-navigation.spec.ts e2e/admin-role-denial-browser.spec.ts`

## Stop Conditions

Record failure and stop only dependent consolidation if the admin suite exposes a P0/P1 local blocker that requires source/test/schema/script/dependency changes.
