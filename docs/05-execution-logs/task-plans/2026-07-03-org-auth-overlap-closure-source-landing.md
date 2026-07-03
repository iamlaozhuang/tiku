# 2026-07-03 Org Auth Overlap Closure Source Landing Plan

## Task

`org-auth-overlap-closure-source-landing-2026-07-03`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Source Observations

- Runtime service already blocks overlapping enterprise authorization creation and records redacted audit metadata.
- `AdminOrgAuthRedeemPage.tsx` already maps overlap failure to a user-facing message and has a four-step create flow.
- Existing create flow does not show an explicit atomic-scope preview before submit.
- Existing overlap guidance says default block and explicit actions, but does not separately present the four closure paths and their no-auto-merge boundary.

## Implementation Plan

1. Add atomic-scope preview rows inside the organization authorization create panel using existing selected organization, profession, level, edition, date, and quota inputs.
2. Add explicit overlap closure action guidance for renewal successor, manual standard-to-advanced upgrade, transactional replacement, and increase-only quota expansion.
3. Improve the overlap error message so operators know to use explicit closure actions rather than expecting automatic merge.
4. Extend focused tests for atomic preview, closure guidance, and overlap error copy.

## Boundaries

- No schema, migration, seed, dependency, package/lockfile, Provider call, env secret access, browser/dev-server/e2e, direct DB connection, staging/prod deploy, PR, force push, Cost Calibration, release readiness, final Pass, or production-readiness claim.
- No new `org_auth_scope` table, no new overlap API, no upgrade/renewal/replacement/quota mutation route, no auto merge, no service/repository change, and no runtime database connection.
- Evidence must not record credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full question/paper/material/resource/chunk content, screenshots, traces, or raw DOM.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push readiness gates for this task id.
