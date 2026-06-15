# Task Plan: advanced-organization-training-draft-lifecycle-service-readonly-recheck-seeding

## Task

Seed a narrow readonly recheck task after `advanced-organization-training-draft-lifecycle-service` closed with
`pass_with_needs_recheck`.

## Mandatory Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- Readonly code anchors for organization training draft lifecycle service and effective authorization contracts.

## Scope

Allowed:

- Update durable project state and task queue.
- Add this task plan, evidence, and audit review.
- Seed exactly one pending readonly recheck task for the organization training draft lifecycle service boundary.

Blocked:

- Product source implementation.
- Route, repository, mapper, schema, migration, script, package, lockfile, or dependency changes.
- DB access, row/private data access, provider/model calls, provider configuration, quota/cost work, Cost Calibration Gate,
  dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, PR, or force push.
- Formal content write or formal target write.
- Secret/token/cookie/Authorization header/DB URL/provider payload/raw prompt/raw answer/public identifier value list
  exposure.

## Implementation Approach

1. Confirm local git readiness on `master`.
2. Create a short `codex/` branch.
3. Record docs/state-only evidence for the current service closeout gap.
4. Append a closed seeding task and one pending readonly recheck task to `task-queue.yaml`.
5. Update `project-state.yaml` to point the handoff at the new readonly recheck.
6. Run scoped validation and Module Run v2 readiness scripts.
7. Commit, fast-forward merge to `master`, push `origin/master`, delete the merged short branch, fetch prune, and confirm a
   clean final state.

## Risk Controls

- Keep allowed file changes limited to docs/state/evidence.
- Preserve ADR-002 layering: the seeded follow-up is readonly and does not introduce route/service/repository changes.
- Preserve the known `subject` authorization gap as a recheck item instead of converting it into implementation scope.

## Expected Outcome

`advanced-organization-training-draft-lifecycle-service-readonly-recheck` is present in the queue as pending, with fresh
approval required before claim.
