# organization-training-experience-closure-readiness-audit

## Scope

Evaluate whether the fresh local full-flow evidence for the organization-training experience supports marking the two target use cases as `experience_closed`.

Target use cases:

- `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
- `UC-ADV-EMPLOYEE-TRAINING-ANSWER`

## Approval Boundary

- User requested executing this audit in the current 2026-06-18 prompt.
- Allowed edits: coverage matrix, project-state, task-queue, this task plan, evidence, and audit review.
- Read-only evidence inputs include the fresh passing local full-flow evidence from `organization-training-admin-source-context-ui-response-key-contract-repair`.
- Blocked: product source changes, e2e spec changes, schema/drizzle/migration, package/lockfile/dependency, `.env*`, provider/model, staging/prod/cloud/deploy/payment/external-service, PR, force-push, database migration execution, dev server or Browser/Playwright runtime, and Cost Calibration Gate.
- Closeout is not approved for merge or push. Local commit is approved by the task policy only if readiness gates pass, but this run will not commit without a clean closeout decision.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Closure Criteria

The audit may mark the two target rows `experience_closed` only if local evidence confirms:

1. Admin organization-training entry surface exists at the agreed admin path.
2. Employee organization-training entry surface exists at the agreed employee path.
3. Runtime APIs cover admin draft/source/copy/publish path and employee visible-list/draft-save/submit/readonly-summary.
4. Fresh local full-flow evidence passed after the latest blockers were repaired.
5. Evidence is local-only and redacted.
6. No unresolved blocker remains inside the local experience boundary for the two target use cases.

The audit must not treat `experience_closed` as release readiness, staging/prod readiness, provider readiness, payment readiness, or Cost Calibration Gate completion.

## Validation Plan

1. Run `npm.cmd run test:e2e -- --list` only, as declared by the task.
2. Run scoped Prettier check for docs/state files.
3. Run `npm.cmd run lint`, `npm.cmd run typecheck`, and `git diff --check`.
4. Run Module Run v2 pre-commit, module-closeout, and pre-push readiness gates and record true results.

## Risk Controls

- Keep all evidence redacted: no token, database URL, row data, public ID inventory, prompt, answer body, or provider payload.
- Do not execute Playwright runtime again; this audit consumes existing fresh evidence.
- Do not modify product source or e2e specs.
