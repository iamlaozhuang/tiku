# organization-portal-admin-local-full-flow-validation

## Scope

- Validate the admin organization portal local runtime route `/content/organization-portal`.
- Use the existing Playwright spec `e2e/organization-portal-local-flow.spec.ts`.
- Record redacted evidence for command results only.
- Update local experience state after validation.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `e2e/organization-portal-local-flow.spec.ts`

## Allowed Work

- Create task plan, evidence, audit review.
- Update `project-state.yaml`, `task-queue.yaml`, and `local-experience-coverage-matrix.yaml`.
- Run focused unit validation for the portal entry surface.
- Run targeted local Playwright validation for `e2e/organization-portal-local-flow.spec.ts`.
- Run e2e list discovery, local quality gates, and Module Run v2 readiness gates.

## Blocked Work

- Product source or test source changes.
- `.env*`, dependency/package/lockfile, schema/drizzle/migration changes.
- Provider/model, payment, external-service, staging/prod/cloud/deploy work.
- Full e2e suite, headed/debug e2e mode, non-localhost targets.
- PR, force-push, destructive database operations, Cost Calibration Gate.

## Validation Plan

1. `npm.cmd run test:unit -- tests/unit/organization-portal-admin-entry-surface.test.ts`
2. `npm.cmd run test:e2e -- e2e/organization-portal-local-flow.spec.ts`
3. `npm.cmd run test:e2e -- --list`
4. Scoped Prettier check for changed docs/state files.
5. `git diff --check`
6. `npm.cmd run lint`
7. `npm.cmd run typecheck`
8. Module Run v2 pre-commit, closeout, and pre-push readiness gates.

## Risk Notes

- This task may start the local dev server through existing Playwright config only.
- Evidence must not include tokens, credentials, raw database rows, public id inventories, screenshots, traces, or HTML reports.
- Passing local full-flow evidence is not an `experience_closed` claim; closure requires a follow-up readiness audit.
