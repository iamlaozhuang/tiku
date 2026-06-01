# Phase 22 Auth Session Smoke Plan

## Scope

Validate local/dev auth and session behavior through existing e2e only. Do not record credentials or tokens.

## Steps

1. Run `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`.
2. Run `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`.
3. Record protected-route, login/session, and redaction outcomes.

## Stop Conditions

Stop downstream admin/student runtime checks if auth/session e2e fails in a way that prevents local role access.
