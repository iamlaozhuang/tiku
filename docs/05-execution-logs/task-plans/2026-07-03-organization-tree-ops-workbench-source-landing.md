# 2026-07-03 Organization Tree Ops Workbench Source Landing Plan

## Task

`organization-tree-ops-workbench-source-landing-2026-07-03`

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

- `AdminOrgAuthRedeemPage.tsx` already provides organization node create, edit, disable, enable, validation, detail, employee import, and `org_auth` creation surfaces.
- Existing organization tree UI does not visibly explain inherited `org_auth`, quota impact, disabled-node meaning, or first-release organization-admin read-only boundaries.
- Existing operations page has an employee transfer approval-required card, but no broader pending-work cards for expiring authorization, quota risk, overlap blockers, or organization tree follow-up.
- Existing organization tree UI has no node move action, but it also does not clearly state that move is restricted to `super_admin` and outside the current ops-admin write surface.

## Implementation Plan

1. Add an organization-tree guidance surface that explains platform ownership, inherited authorization, disabled-node impact, and node-move restriction in business language.
2. Improve organization list/detail copy so parent/child structure, inherited authorization, employee counts, and no-delete/no-internal-id behavior are easier for non-technical operators.
3. Add operations pending-work cards that route to existing anchors/details without auto-renew, auto-upgrade, auto-merge, or auto-resolve behavior.
4. Extend focused unit tests for organization-tree guidance, move restriction copy, inherited-access explanation, pending-work cards, and existing mutation calls.

## Boundaries

- No schema, migration, seed, dependency, package/lockfile, Provider call, env secret access, browser/dev-server/e2e, direct DB connection, staging/prod deploy, PR, force push, Cost Calibration, release readiness, final Pass, or production-readiness claim.
- No employee-level authorization whitelist, no organization-admin tree mutation, no new move endpoint, no cascade mutation API change, no auto overlap closure, no plaintext `redeem_code` evidence.
- Evidence must not record credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full question/paper/material/resource/chunk content, screenshots, traces, or raw DOM.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push readiness gates for this task id.
