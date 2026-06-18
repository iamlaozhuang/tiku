# Organization Training Entry Route Path Contract Repair Plan

## Task

- taskId: `organization-training-entry-route-path-contract-repair`
- executionProfile: `local_unit_tdd_plus_scoped_local_full_flow`
- branch: `codex/organization-training-local-experience-chain`
- status: blocked_validation_failure
- `experience_closed`: not claimed
- Cost Calibration Gate remains blocked.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- Existing admin/student route files and organization-training entry tests.
- `e2e/organization-training-local-full-flow.spec.ts`
- `playwright.config.ts`

## Scope

- Move the admin organization-training entry from `/organization-training` to `/content/organization-training`.
- Keep the employee organization-training entry at `/organization-training`.
- Update the admin route unit test import and add a route-path contract assertion.
- Update the local full-flow e2e admin navigation to `/content/organization-training`.
- Rerun the previously blocked local full-flow validation.
- Update task queue, project-state, coverage matrix, task plan, evidence, and audit.

## Non-Scope

- No API route, service, repository, schema, drizzle, migration, package, lockfile, dependency, provider/model,
  staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work.
- No change to the employee `/organization-training` path.
- No `experience_closed` claim; closure readiness remains a separate audit task.

## TDD Approach

1. RED: update unit/e2e route path expectations to require admin `/content/organization-training` while employee remains
   `/organization-training`; verify the focused unit/e2e list or compile path fails before moving the page.
2. GREEN: move the admin page file into the existing admin content route group and update imports/navigation.
3. Verify focused unit tests and rerun the scoped local full-flow e2e that previously failed at Next route compilation.
4. Run prettier, lint, typecheck, `git diff --check`, and Module Run v2 readiness gates.

## Risk Controls

- Keep the repair to App Router path ownership only; do not alter business APIs.
- Do not record session values, Authorization headers, passwords, database URLs, provider payloads, raw prompts, or raw
  answers in evidence.
- If the scoped e2e reaches a later runtime contract failure, record that new failure instead of expanding scope.
