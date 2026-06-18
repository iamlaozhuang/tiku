# organization-analytics-summary-local-full-flow-validation

## Scope

- Validate the admin organization analytics local runtime route `/content/organization-analytics`.
- Use existing Playwright spec `e2e/organization-analytics-local-flow.spec.ts`.
- Record redacted evidence for command results only.
- Update local experience state after validation.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-organization-analytics-summary-ui-entry-contract-tdd.md`
- `e2e/organization-analytics-local-flow.spec.ts`

## Allowed Work

- Create task plan, evidence, audit review.
- Update `project-state.yaml`, `task-queue.yaml`, and `local-experience-coverage-matrix.yaml`.
- Run focused unit validation for the analytics route and entry surface.
- Run targeted local Playwright validation for `e2e/organization-analytics-local-flow.spec.ts`.
- Run e2e list discovery, local quality gates, and Module Run v2 readiness gates.

## Blocked Work

- Product source or test source changes.
- `.env*`, dependency/package/lockfile, schema/drizzle/migration changes.
- Provider/model, payment, external-service, staging/prod/cloud/deploy work.
- Full e2e suite, headed/debug e2e mode, non-localhost targets.
- PR, force-push, destructive database operations, Cost Calibration Gate.

## Validation Plan

1. `npm.cmd run test:unit -- src/server/services/organization-analytics-route.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts`
2. `npm.cmd run test:e2e -- e2e/organization-analytics-local-flow.spec.ts`
3. `npm.cmd run test:e2e -- --list`
4. Scoped Prettier check for changed docs/state files.
5. `git diff --check`
6. `npm.cmd run lint`
7. `npm.cmd run typecheck`
8. Module Run v2 pre-commit, closeout, and pre-push readiness gates.

## Risk Notes

- This task first attempted the local dev server through existing Playwright config. Because the configured server failed
  to become ready due a local Next/Turbopack font startup failure, a diagnostic rerun used the existing Next CLI with
  `--webpack` on localhost only and reused that server for the same scoped spec.
- Evidence must not include tokens, credentials, raw database rows, public id inventories, screenshots, traces, or HTML
  reports.
- Passing local full-flow evidence is not an `experience_closed` claim; closure requires a follow-up readiness audit.
- If the scoped full-flow fails with a contract/fixture issue, this validation task must stop and seed a separate repair
  task rather than widening its own allowedFiles.
