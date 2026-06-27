# organization analytics UX design-first package

## Task

- Task id: `organization-analytics-ux-design-first-package-2026-06-27`
- Branch: `codex/org-analytics-ux-design-package-20260627`
- Approval source: current user serial batch request on 2026-06-27.

## Scope

- Prepare a design-first package for organization admin AI usage and training analytics UX.
- Decide whether source, UI, and browser validation are necessary follow-up tasks.
- Keep the current task limited to docs/state/task-plan/evidence/audit/acceptance package work.
- Do not implement source, tests, UI, browser/e2e, DB, schema, package, lockfile, scripts, or runtime validation.

## Requirement Inputs

- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/05-execution-logs/acceptance/2026-06-26-organization-admin-ai-usage-statistics-ux-enhancement-approval.md`

## Design Package Approach

- Treat organization analytics UX as a second-layer enhancement for AI generation closure, and as a necessary future
  acceptance surface once organization-owned training content becomes employee-visible.
- Define a desktop-first organization admin analytics surface, not a system operations page with an organization filter.
- Use redacted summary cards, tables, status distributions, and audit links instead of raw answer/content viewers.
- Include loading, empty, permission-denied, unavailable, and partial-data states.

## UX Boundary

- Allowed future UX content:
  - organization-level counts and completion state;
  - per-training participation summaries;
  - score and timing summaries;
  - AI generation quota and generated-result status rollups;
  - employee-level status rows limited to identity/status/score/time fields already allowed by organization training;
  - redacted audit references.
- Blocked UX content:
  - raw employee subjective answer text;
  - raw learner AI content;
  - prompts, raw Provider output, generated content body, and task payloads;
  - export/download or external-service sharing;
  - cross-organization analytics.

## Source/UI/Browser Decision

1. Source TDD is required before UI implementation because the redacted analytics data contract and organization-scope
   authorization boundary must be testable without a browser.
2. UI implementation is required after the source contract because the value is an organization admin workflow surface,
   not only an API response.
3. Browser/e2e validation is deferred and requires a separate local-only approval after source and UI are implemented,
   because it may require dev server, seeded local accounts, or browser runtime.

## Follow-Up Task Boundaries

1. `organization-analytics-redacted-statistics-source-contract-tdd-approval-2026-06-27`
   - Source/unit-test task for redacted analytics DTOs, role/scope checks, and no raw-content fields.
2. `organization-analytics-admin-ui-implementation-local-validation-approval-2026-06-27`
   - UI implementation task for the organization admin analytics surface after source contract exists.
3. `organization-analytics-local-browser-smoke-validation-approval-2026-06-27`
   - Optional local browser smoke task after stable source/UI and local seed/fixtures exist.

## Explicit Non-Scope

- No source/test/e2e/script/package/lockfile/schema/drizzle/env file edits.
- No DB connection, DB mutation, migration, seed, Provider call, Provider credential read, Cost Calibration, dev server,
  browser/e2e, staging/prod/deploy, payment, external service, PR, force push, release readiness, or final Pass claim.

## Validation Plan

1. Scoped Prettier write/check over changed docs/state files.
2. `git diff --check`.
3. Module Run v2 pre-commit hardening.
4. `Get-TikuProjectStatus.ps1`.
5. Module Run v2 pre-push readiness.
