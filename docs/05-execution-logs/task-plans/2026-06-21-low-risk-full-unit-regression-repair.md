# Low Risk Full Unit Regression Repair Plan

## Task

- Task id: `low-risk-full-unit-regression-repair`
- Date: 2026-06-21
- Branch: `codex/low-risk-closeout-state-normalization`
- Scope: low-risk source/test repair required before merging the P0 state normalization branch.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `tests/unit/admin-paper-ui.test.ts`
- `src/server/services/effective-authorization-service.test.ts`
- `src/server/contracts/effective-authorization-contract.ts`

## RED

- `npm.cmd run test:unit` failed after P0 docs/state closeout:
  - `tests/unit/admin-paper-ui.test.ts`: `createPaperQuestionTypeDistributionFeedback` attempted to call `.filter` on a missing `questionTypeDistribution`.
  - `tests/unit/admin-paper-ui.test.ts`: the create-paper response fixture also used a legacy list-summary shape without `paperSections`, so `mapPaperDraftToSummary` could not synthesize distribution metadata from a full draft.
  - `src/server/services/effective-authorization-service.test.ts`: expected authorization context DTOs did not include current `edition`, `upgradeStatus`, `expiresAt`, and `displayStatus` fields.

## Root Cause

- Paper admin UI renders API/list fixtures that predate `questionTypeDistribution`; the code has a draft normalizer but the feedback helper itself was not defensive and the draft-to-summary mapper assumed missing `questionTypeDistribution` always meant a full draft with `paperSections`.
- Effective authorization service now returns edition-aware context fields per current contract, but the oldest exact `toEqual` test still asserts the pre-field-expansion shape.

## Implementation Plan

1. Make `createPaperQuestionTypeDistributionFeedback` treat missing `questionTypeDistribution` as an empty distribution.
2. Make `mapPaperDraftToSummary` fall back to existing distribution metadata, or an empty list, when a legacy response lacks both `questionTypeDistribution` and `paperSections`.
3. Update only the stale exact authorization-context expectation to include the current DTO fields.
4. Run focused RED/GREEN tests, full unit suite, lint, typecheck, Prettier, and Module Run v2 gates.
5. Record evidence and audit review; keep e2e/dev-server/browser/runtime proof blocked.

## Non-Goals

- No product behavior expansion beyond compatibility with missing distribution metadata.
- No schema, migration, seed, database, package, lockfile, env/secret, Provider, dev server, browser/e2e, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work.
