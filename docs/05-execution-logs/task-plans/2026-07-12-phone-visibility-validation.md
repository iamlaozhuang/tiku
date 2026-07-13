# Phone Visibility Validation Plan

**Task:** `user-led-phone-visibility-validation-2026-07-12`

**Baseline:** `c789dbc4e1df74db75569f70bff09516168dd6dd`

## Objective

Independently validate the accepted phone-visibility policy after its runtime enforcement was merged. This task is validation-only: it does not modify runtime source, schemas, test data, Provider configuration, or dependencies.

## Required Reading Completed

- `AGENTS.md`, code-taste commandments, ADR-001 through ADR-007, requirements indexes, advanced-edition authorization requirements, user-auth and operations modules/stories, and full-role traceability.
- The accepted phone-visibility decision and both prior task plans, evidence, and audits.
- The current route handlers, repository and mapper boundaries, operations UI, organization employee output, existing unit tests, audit-log contract coverage, and user-approved role credential index.

## Validation Order

1. Inventory direct routes, ordinary DTO egresses, role checks, audit summaries, client storage, and export routes.
2. Re-run targeted and full unit suites, quality gates, and static source checks.
3. Use the approved localhost browser scope only for the operations default display at 390px. Confirm the existing process-only 0704 acceptance target by a successful canonical operations-role login, without reading or changing its environment. Do not request reveal/copy, inspect browser storage, capture raw DOM or embedded state, or retain a screenshot containing a full phone.
4. Perform two adversarial reviews: authorization/privacy leakage and regression/data-boundary review. If fresh evidence reveals a runtime defect, stop and open a separate implementation task; do not repair it in this validation task.

## Boundaries

- Browser credential use is memory-only and no credential, phone value, token, session, cookie, environment value, raw DOM, database URL, or business row enters repository evidence.
- The task may use the already-running localhost service only. It must not restart it, modify `.env.local`, read a database URL, directly connect to the database, or mutate any data. Runtime target confirmation is behavioral only.
- No database connection or mutation, migration, fixture/seed change, Provider action, dependency change, staging, production, deploy, PR, force push, or Cost Calibration action.
- The next prelaunch test-data refresh remains a separate decision and is not started here.
