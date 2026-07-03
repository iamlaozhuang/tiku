# 2026-07-03 Employee Import Password Source Landing Plan

## Task

`employee-import-password-source-landing-2026-07-03`

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

- Employee import already requires an operator-selected target organization in the UI and blocks `profession`, `level`, `edition`, and `orgAuthScopePublicId` columns.
- Current CSV/TSV parser still treats `initialPassword` as required and rejects omitted or empty passwords.
- Current employee account service requires `initialPassword` before credential creation and does not return one-time generated password distribution data.
- Current import result panel shows aggregate import feedback only, without a one-time generated password distribution window.

## Implementation Plan

1. Allow employee account create/import normalization to accept omitted `initialPassword` while preserving password validation when a password is supplied.
2. Generate a random initial password only when creating a new employee user and the operator omitted it; do not generate or display a password when binding an existing unbound learner account.
3. Return generated initial passwords in the import result response for a one-time distribution window only.
4. Update the operations employee import panel copy, preview, result display, and tests for target-node selection, no authorization columns, optional password generation, and one-time distribution.

## Boundaries

- No schema, migration, seed, dependency, package/lockfile, Provider call, env secret access, browser/dev-server/e2e, direct DB connection, staging/prod deploy, PR, force push, Cost Calibration, release readiness, final Pass, or production-readiness claim.
- No employee-level authorization whitelist, no `profession`/`level`/`edition`/`orgAuthScopePublicId` import input, no organization-admin self-service import, and no ordinary employee list/detail password plaintext display.
- Evidence must not record actual password values, credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full question/paper/material/resource/chunk content, screenshots, traces, or raw DOM.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts src/server/services/employee-account-service.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push readiness gates for this task id.
