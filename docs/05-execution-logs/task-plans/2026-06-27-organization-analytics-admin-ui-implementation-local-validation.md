# Organization analytics admin UI implementation local validation plan

Task ID: `organization-analytics-admin-ui-implementation-local-validation-approval-2026-06-27`

## Scope

- Implement the organization admin analytics UI boundary after the redacted statistics source contract exists.
- Expose the redacted statistics boundary through local route DTOs as policy metadata only.
- Render the boundary in the organization analytics admin page with focused component/unit coverage.
- Keep browser/e2e/dev server, DB connection/mutation, Provider, publish, staging/prod, external service, PR, release readiness, and final Pass blocked.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/05-execution-logs/acceptance/2026-06-27-organization-analytics-ux-design-first-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-organization-analytics-redacted-statistics-source-contract-tdd.md`

## TDD Plan

1. Add RED assertions proving route DTOs expose `redactedStatisticsBoundary` while still omitting `scopeOrganizationPublicIds`.
2. Add RED UI assertions proving the organization analytics page renders the redacted statistics boundary and does not expose hidden child organizations, raw answers, raw AI generated content, prompt/provider payload policy details beyond blocked policy text, internal ids, or tokens.
3. Implement the smallest route DTO and UI change.
4. Run focused tests, scoped Prettier, lint, typecheck, `git diff --check`, and Module Run v2 gates.

## Risk Controls

- Do not connect to any database or execute any mutation.
- Do not run browser/e2e/dev server.
- Do not introduce dependencies, package changes, schema/drizzle/migration/seed changes, Provider calls, credentials, publish, or student-visible runtime.
- Keep evidence redacted and limited to command results, filenames, and policy enum strings.
