# Repair Organization AI Generation Capability Source Boundary Acceptance

## Acceptance Criteria

| Criterion                                                                                                                                           | Status |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Organization AI generation access derives from service-computed capability metadata.                                                                | pass   |
| Role-present missing capability is denied before task persistence.                                                                                  | pass   |
| Role-present false capability is denied before history listing.                                                                                     | pass   |
| Provider-disabled local-contract behavior is preserved.                                                                                             | pass   |
| Evidence remains redacted and excludes forbidden sensitive material.                                                                                | pass   |
| No DB, real Provider/AI, browser/dev server, dependency, deploy, release readiness, final Pass, or Cost Calibration action is performed or claimed. | pass   |

## Validation

- `npx.cmd vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`: pass, 2 files and 35 tests.
- `npm run typecheck`: pass.
- scoped prettier write/check: pass.
- `git diff --check`: pass.
- Module Run v2 precommit hardening: pass.
- Module Run v2 closeout readiness: pass after closeout evidence/audit update.
- Module Run v2 prepush readiness: pass.
- Commit hook for `caa61f3fdde71e3cc1860cf7155986e1a135c5ee`: pass.

## Acceptance Decision

- Accepted for local closeout under the materialized local repair-loop policy. Fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup remain within the approved local closeout scope after final state commit passes.
