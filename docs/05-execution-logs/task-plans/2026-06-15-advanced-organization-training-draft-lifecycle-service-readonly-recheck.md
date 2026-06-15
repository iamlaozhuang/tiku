# Task Plan: advanced-organization-training-draft-lifecycle-service-readonly-recheck

## Task

Readonly recheck of the organization training draft lifecycle service boundary after the service-only implementation
closed with `pass_with_needs_recheck`.

## Mandatory Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck-seeding.md`
- Task readonly source files listed in `task-queue.yaml`.

## Scope

Allowed:

- Readonly review of service, contract, model, validator, test, and ADR-002 layering.
- Update this task plan, evidence, audit review, `project-state.yaml`, and `task-queue.yaml`.

Blocked:

- Product implementation and product source edits.
- Route, service, repository, mapper, API runtime, UI, schema, drizzle, script, package, lockfile, or dependency changes.
- DB access, row/private data access, provider/model calls, provider configuration, provider payloads, raw prompts,
  raw answers, quota/cost work, Cost Calibration Gate, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy,
  payment, external-service, formal content writes, formal target writes, PR, or force push.

## Review Approach

1. Verify git/readiness gates on `master`.
2. Confirm task queue dependency and approval boundary.
3. Read allowed readonly source files and prior evidence/audit.
4. Check ADR-002 layering against current service boundary.
5. Check metadata-only DTO and redaction/formal target write claims.
6. Record findings and `needs_recheck` without implementing changes.
7. Run the declared local validation and Module Run v2 readiness gates.

## Expected Outcome

Close this readonly recheck with a clear decision on whether the current narrow service boundary is acceptable and what
must be rechecked before broader repository, route, UI, schema, provider, quota/cost, or formal target write work.
