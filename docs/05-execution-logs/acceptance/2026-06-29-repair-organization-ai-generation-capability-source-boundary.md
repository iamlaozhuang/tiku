# Repair Organization AI Generation Capability Source Boundary Acceptance

## Acceptance Criteria

| Criterion                                                                                                                                | Status |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Organization AI generation access derives from service-computed capability metadata.                                                     | pass   |
| Role-present missing capability is denied before task persistence.                                                                       | pass   |
| Role-present false capability is denied before history listing.                                                                          | pass   |
| Provider-disabled local-contract behavior is preserved.                                                                                  | pass   |
| Evidence remains redacted and excludes forbidden sensitive material.                                                                     | pass   |
| No DB, real Provider/AI, browser/dev server, dependency, deploy, release readiness, final Pass, or Cost Calibration action is performed. | pass   |

## Validation

- `npx.cmd vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`: pass, 2 files, 35 tests.
- `npm run typecheck`: pass.
- Final scoped formatting, diff check, and Module Run v2 readiness: pending.

## Acceptance Decision

- Accepted for final closeout after pending validation commands pass and the closeout commit/merge/push/cleanup sequence completes under the materialized local repair-loop policy.
