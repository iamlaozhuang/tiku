# Detail Optimization And Security Review Kickoff

- Task id: `detail-optimization-security-review-kickoff-2026-06-29`
- Branch: `codex/detail-optimization-security-review-kickoff-20260629`
- Status: in_progress
- Date: `2026-06-29`

## Purpose

Start the next workstream after local durable-goal completion: detail optimization inventory, security review, and
executable repair task splitting. This package is docs/state-only and does not open release readiness, final Pass, Cost
Calibration, staging smoke, Provider execution, DB work, source/test repair, dependency change, schema/migration/seed,
PR, or force-push.

## Baseline Confirmation

| Baseline item                   | Current status                                                                  | Impact for this kickoff                                   |
| ------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `master` and `origin/master`    | aligned at `31e13b861` before branch creation                                   | current master is the review baseline                     |
| Local durable goal              | complete within approved local scope                                            | used as input, not as release readiness                   |
| Release readiness docs plan     | complete docs-only                                                              | release readiness remains blocked                         |
| Isolated staging target package | prepared docs-only; concrete staging URL or deploy target label is not recorded | staging smoke remains blocked                             |
| Full unit baseline              | latest recorded pass: 318 files and 1438 tests                                  | regression signal only; no tests were run in this kickoff |
| Cost Calibration                | not executed                                                                    | remains blocked                                           |
| Provider readiness              | not claimed                                                                     | Provider budget remains zero                              |
| Final Pass                      | not claimed                                                                     | owner decision task remains separate and blocked          |

## Review Phasing Matrix

| Phase | Area                                | Primary risk questions                                                                                   | Candidate read surfaces                                | Output before fix                                                    | Status                                       |
| ----- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------- |
| 1     | Data redaction and logs             | Can logs, audit summaries, AI call records, and evidence accidentally expose secrets, PII, IDs, prompts? | services, repositories, mappers, API routes, evidence  | findings inventory; one finding per scoped fix task                  | next smallest safe task                      |
| 2     | Permission and role boundary        | Are role/edition/org boundaries enforced in service/repository paths rather than UI-only state?          | auth, services, repositories, API routes, auth tests   | findings inventory; authorization fix tasks split by role/workflow   | queued                                       |
| 3     | API contract and input validation   | Are `/api/v1/` paths, camelCase JSON, null/list behavior, validators, and response wrappers consistent?  | API routes, validators, contracts, mappers, unit tests | findings inventory; route-level or contract-level fix tasks          | queued                                       |
| 4     | UI/UX detail optimization           | Are tokens, states, interaction feedback, naming, and mobile/desktop split aligned with standards?       | app routes, features, components, globals, UI tests    | findings inventory; UI polish tasks split by surface                 | queued                                       |
| 5     | AI/Provider boundary                | Are Provider calls/config/prompts gated, redacted, and isolated from release/cost decisions?             | `src/ai`, `src/rag`, services, API routes, AI tests    | findings inventory; Provider fixes require separate fresh approval   | queued with provider budget zero             |
| 6     | DB/schema/migration risk            | Are schema, repository, migration, and seed boundaries reviewable without DB connection or mutation?     | schema, migrations, repositories, repository tests     | findings inventory; schema/migration tasks require separate approval | queued read-only, no DB connection           |
| 7     | Dependency and supply-chain risk    | Are installed/deferred dependencies aligned with ADR-006 and the dependency introduction gate?           | package metadata, lockfiles, ADR-006, dependency SOP   | findings inventory; dependency changes require isolated approval     | queued read-only, no package/lockfile edit   |
| 8     | Test and acceptance regression risk | Are unit/e2e/acceptance gates mapped to high-risk behavior without reusing release/final-pass claims?    | tests, e2e names, acceptance/evidence summaries        | findings inventory; validation repairs split by test or workflow     | queued read-only, no runtime in this kickoff |

## Executable Task Queue

| Order | Task id                                                       | Type                 | Default status                           | Notes                                                                                  |
| ----- | ------------------------------------------------------------- | -------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| 1     | `security-data-redaction-log-boundary-inventory-2026-06-29`   | security inventory   | pending                                  | next smallest safe task; docs/source read-only; no runtime, DB, Provider, or fix       |
| 2     | `security-permission-role-boundary-inventory-2026-06-29`      | security inventory   | pending after owner selection or phase 1 | checks service-level authorization source of truth                                     |
| 3     | `security-api-contract-input-validation-inventory-2026-06-29` | security inventory   | pending after owner selection or phase 1 | checks REST/API contract and validation surfaces                                       |
| 4     | `detail-ui-ux-token-state-inventory-2026-06-29`               | detail optimization  | pending after owner selection or phase 1 | checks UI detail risks before any polish fix                                           |
| 5     | `security-ai-provider-boundary-inventory-2026-06-29`          | security inventory   | pending after owner selection or phase 1 | Provider budget remains zero; no prompt or payload evidence                            |
| 6     | `security-db-schema-migration-risk-inventory-2026-06-29`      | security inventory   | pending after owner selection or phase 1 | no DB connection; no migration execution                                               |
| 7     | `security-dependency-supply-chain-inventory-2026-06-29`       | security inventory   | pending after owner selection or phase 1 | no install, audit network call, package, or lockfile change unless separately approved |
| 8     | `test-acceptance-regression-risk-inventory-2026-06-29`        | regression inventory | pending after owner selection or phase 1 | no browser/e2e runtime in the inventory task                                           |

## Fix Task Split Rule

- Inventory tasks do not fix source, tests, dependencies, schemas, seeds, migrations, Provider configuration, or
  environment settings.
- Every confirmed finding becomes its own fix task or a tightly scoped batch only when the task records exact
  allowedFiles/blockedFiles, DB boundary, AI/Provider boundary, credential boundary, evidence redaction, validation
  commands, and closeoutPolicy.
- Dependency changes must be isolated from business/source fixes and must cite human approval evidence.
- DB/schema/migration work must be isolated from source/UI fixes and must not execute `drizzle-kit push`.
- Provider and Cost Calibration work remain blocked until separate fresh approval records model, request cap, cost cap,
  redaction, stop conditions, and rollback/disable plan.
- Release readiness, final Pass, staging/prod/cloud/deploy, PR, and force-push remain blocked by default.

## Next Smallest Safe Task

Recommended next task: `security-data-redaction-log-boundary-inventory-2026-06-29`.

Reason: it improves the safety foundation for every later audit and fix by checking evidence/log redaction and secret
boundaries first, while staying read-only and avoiding browser, DB, Provider, dependency, schema, and release surfaces.
