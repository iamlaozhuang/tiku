# Task Plan: advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding

## Task

Seed a narrow TDD follow-up task for explicit `level` mismatch coverage in the organization training manual draft service
tests.

## Mandatory Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- Readonly anchors in `src/server/services/organization-training-service.ts` and
  `src/server/services/organization-training-service.test.ts`.

## Scope

Allowed:

- Update durable project state and task queue.
- Add this task plan, evidence, and audit review.
- Seed exactly one pending TDD test coverage task.

Blocked:

- Product source implementation in this seeding task.
- Service logic changes, route, repository, mapper, schema, migration, script, package, lockfile, dependency, DB,
  provider, UI, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, formal content
  write, formal target write, PR, and force push.

## Implementation Approach

1. Confirm git/readiness gates on `master`.
2. Create a short `codex/` branch.
3. Record docs/state-only evidence for seeding the narrow TDD follow-up.
4. Append a closed seeding task and one pending TDD test coverage task to `task-queue.yaml`.
5. Update `project-state.yaml` handoff to the pending TDD follow-up.
6. Run scoped local validation and Module Run v2 readiness scripts.
7. Commit, fast-forward merge to `master`, push `origin/master`, delete the merged branch, fetch prune, and confirm a
   clean final state.

## Expected Outcome

`advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage` is present in the queue as pending,
with fresh approval required before claim.
