# Unit B Auth Mapper Source Of Truth Alignment Review Task Plan

## Task

- Task id: `unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29`
- Branch: `codex/unit-b-auth-mapper-review-20260629`
- Scope: bounded read-only review of auth/session mapper capability projection against ADR-007 source-of-truth rules,
  with docs/state-only task split if a confirmed minimal repair candidate exists.
- Execution mode: parent-agent bounded static review, not an exhaustive Codex Security scan.

## Required Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest detail security continuation approval materialization task plan, evidence, audit, and acceptance
- Latest Unit B auth role boundary static review task plan, evidence, audit, and acceptance

## Authorization And Boundaries

This task consumes the centralized approval recorded as `detailSecurityLocalContinuationApproval20260629`, specifically
the approved category `unit_b_auth_mapper_source_of_truth_read_only_review`.

This task may read governance docs, requirements, ADRs, `src/server/mappers/auth-mapper.ts`,
`src/server/contracts/auth-contract.ts`, relevant server services, admin feature access helpers, API route handlers, and
focused tests needed to understand auth mapper source-of-truth behavior.

This task may write only the scoped docs/state files listed below. It must not change source, tests, packages,
lockfiles, DB schema, migrations, seeds, env files, scripts, browser/e2e artifacts, Provider/AI configuration,
staging/prod/cloud/deploy state, release readiness, final Pass, or Cost Calibration.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md`

## Review Focus

1. Whether `auth-mapper` preserves the difference between source authorization facts and derived `effectiveEdition`.
2. Whether fallback/session capability summaries are explicit and cannot silently become service-computed authorization.
3. Whether admin workspace role guard contracts reject fallback capability summaries for advanced organization access.
4. Whether public contracts expose only safe summaries and do not expose raw DB rows, internal ids, credentials, or
   plaintext `redeem_code`.
5. Whether any confirmed drift can be reduced to a single minimal source/test repair task.

## Static Review Outcome

The bounded review confirmed a source-of-truth drift candidate: the auth mapper projects an organization workspace
capability summary from admin role and organization public id while labeling it `service_computed` and `org_auth`. The
repository row supplied to the mapper does not include active `org_auth`, `auth_upgrade`, computed `effectiveEdition`, or
capability-source facts.

Downstream guards reject `session_fallback` summaries, but they trust summaries marked `service_computed`. Therefore the
mapper label is the smallest confirmed boundary to repair before advanced organization access can safely trust session
capability projection.

## Seeded Repair Task

- Task id: `repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29`
- Status: `pending_task_materialization_under_central_local_security_repair_authorization`
- Planned source/test files:
  - `src/server/mappers/auth-mapper.ts`
  - `src/server/mappers/auth-mapper.test.ts`
  - `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- Intended repair: make admin workspace capability projection distinguish real service-computed `org_auth` capability
  from role-derived session fallback before advanced organization access trusts it.
- Still blocked until materialized: source/test edits, DB, Provider/AI, browser/dev server/e2e, package/lockfile,
  staging/prod/deploy, release readiness, final Pass, Cost Calibration, PR, and force-push.

## Planned Validation

```powershell
rg -n effectiveEdition src/server/mappers/auth-mapper.ts src/server/contracts/auth-contract.ts src/server/services src/features/admin tests
rg -n "session_fallback|org_auth|personal_auth|auth_upgrade|capability" src/server/mappers/auth-mapper.ts src/server/contracts/auth-contract.ts src/server/services src/features/admin tests
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/task-plans/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/evidence/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/audits-reviews/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/acceptance/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/task-plans/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/evidence/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/audits-reviews/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md docs/05-execution-logs/acceptance/2026-06-29-unit-b-auth-mapper-source-of-truth-alignment-review.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e drizzle migrations seed scripts playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId unit-b-auth-mapper-source-of-truth-alignment-review-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch
cleanup are approved for this docs/state-only read-only review task.

Any source/test repair seeded by this review remains blocked until a later task explicitly materializes its own
allowedFiles, blockedFiles, boundaries, validation commands, evidence redaction, and closeoutPolicy.

This is not release readiness, not a final Pass, and not Cost Calibration.
