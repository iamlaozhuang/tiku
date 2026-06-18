# Organization Training Admin Employee Local Full Flow Validation Plan

## Task

- taskId: `organization-training-admin-employee-local-full-flow-validation`
- executionProfile: `local_full_flow`
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
- `playwright.config.ts`
- Existing local e2e patterns under `e2e/`.
- The newly added admin and employee organization-training entry surfaces.

## Scope

- Add `e2e/organization-training-local-full-flow.spec.ts`.
- Run the scoped local Playwright flow with `npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts`.
- Update coverage matrix, project-state, task-queue, evidence, and audit.

## Non-Scope

- No product source changes outside the e2e spec.
- No `.env*`, package/lockfile/dependency, schema/drizzle/migration, server/component/hook/source changes.
- No database migration execution, staging/prod/cloud/deploy/payment/external-service, provider/model calls, PR,
  force-push, or Cost Calibration Gate work.

## Validation Approach

1. Create a serial scoped Playwright test that starts from local runtime only.
2. Exercise admin organization-training entry surface:
   - authenticate against the local session route;
   - create a manual draft;
   - attach source context metadata;
   - copy a version public id to a new draft;
   - assert public-id-only UI and standard API envelopes.
3. Exercise employee organization-training entry surface:
   - install a local employee/student session value in browser storage;
   - load visible-list;
   - save draft, submit, and load readonly summary;
   - assert no local session value or internal id is rendered.
4. If runtime data is unavailable, fail with a boundary-specific diagnostic rather than mutating product source or
   schema.
5. Validate with the task-declared scoped e2e, prettier, lint, typecheck, `git diff --check`, and Module Run v2 readiness
   gates.

## Risk Controls

- Keep evidence redacted: no Authorization header, session value, password, provider payload, raw answer, raw prompt, or
  database URL.
- Do not write `.env*` or run migration commands.
- Use stable public identifiers in assertions and avoid auto-increment ids.
- Leave `experience_closed` blocked until the separate closure readiness audit task evaluates the local full-flow
  evidence.

## Observed Blocker

- `npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts` cannot start the local Next webServer.
- Next reports that `/(admin)/organization-training` and `/(student)` both resolve to the same runtime path.
- Product route repair is outside this task because `src/app/**` is blocked.
- The closure readiness audit must remain pending; no `experience_closed` decision is supported by this evidence.
