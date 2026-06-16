# Task Plan: advanced-organization-training-publish-version-route-flow-readonly-recheck-seeding

## Goal

Seed one follow-up readonly recheck task for the organization training publish-version route flow after the route TDD task is closed on `master`.

The seeded recheck must verify the durable route/service/repository flow, ADR-002 layering, public-id route semantics, trusted lineage boundary, metadata-only DTO exposure, formal target write blocking, and non-leakage assertions. This seed task itself is docs/state/queue only.

## Read First

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-tdd.md`

## Allowed Edits

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck-seeding.md`

## Blocked Work

- No `.env*` read/write/output.
- No product source, route runtime, service, repository, mapper, contract, model, validator, UI, schema, drizzle, script, package, lockfile, or dependency edits.
- No DB access, direct row/private data read, migration generation, or migration execution.
- No provider/model call, provider configuration, quota/cost measurement, or Cost Calibration Gate work.
- No dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, PR, or force push.
- No formal content write, formal target write, public identifier value list exposure, provider payload, raw prompt, raw answer, secret, token, cookie, Authorization header, database URL, row data, or private data.

## Implementation Steps

1. Confirm readiness from local git state before edits.
2. Verify no existing `advanced-organization-training-publish-version-route-flow-readonly-recheck` task exists.
3. Append this seed task as closed and append one pending readonly recheck task.
4. Update `project-state.yaml` to record this seed closeout and next recommended task.
5. Run scoped route/service tests and Module Run V2 closeout gates.
6. Record evidence and audit approval.
7. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean state.

## Risk Controls

- The future recheck is pending only and requires fresh approval before claim.
- The future recheck is readonly; allowed files are restricted to state/queue/task-plan/evidence/audit for that task.
- Route/service/repository files are listed as readonly evidence sources only.
- Formal target write and direct formal content adoption remain blocked.
