# Security Unit B Auth Role Boundary Static Review Task Plan

## Task

- Task id: `security-unit-b-auth-role-boundary-static-review-2026-06-29`
- Branch: `codex/unit-b-auth-boundary-review-20260629`
- Scope: bounded static review of permission and role boundaries plus first minimal repair task split.
- Execution mode: parent-agent bounded static review, not an exhaustive Codex Security scan.

## Required Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest Unit A task plan, evidence, audit review, and acceptance documents

## Authorization And Boundaries

The current user requested the next step: Unit B permission and role boundary static review plus first minimal repair task
split.

This task may read governance docs, requirements, ADRs, `src/server/**`, `src/app/api/**`, and tests needed to understand
permission and role boundaries. It may write only scoped governance docs and state for this Unit B review.

This task must not change source, tests, packages, lockfiles, DB schema, migrations, seeds, env files, scripts,
Provider/AI configuration, browser/e2e artifacts, staging/prod/cloud/deploy state, release readiness, final Pass, or Cost
Calibration.

## Codex Security Preflight

`security_scan` preflight returned incomplete for exhaustive scan because active multi-agent worker-slot status is
unknown. Therefore this task explicitly does not claim exhaustive scan coverage. It proceeds only as a bounded static
review focused on high-value authorization and role boundaries.

## Review Focus

1. Admin session and role mapping.
2. Organization workspace capability source.
3. Content admin versus organization admin boundaries.
4. Super admin privileged paths.
5. Student/admin separation.
6. Route handler, service, repository authorization placement.

## Method

1. Build a route/service/repository inventory for auth role boundaries using read-only searches.
2. Identify concrete boundary surfaces and classify each as pass, candidate risk, deferred, or out of scope.
3. Validate candidate risks using code inspection only, with no runtime, DB, Provider, browser, or env access.
4. Produce a phased Unit B matrix.
5. Seed the first minimal repair task in `task-queue.yaml` with status blocked pending fresh source/test approval.

## Static Review Outcome

The bounded static review confirmed that the shared organization workspace guard, organization analytics runtime route,
and organization AI generation local-contract route already require service-computed `org_auth` organization capability
metadata for advanced organization access.

The first minimal candidate risk is the organization training runtime admin context resolver. It currently gates admin
training management by `super_admin` or `org_advanced_admin` role plus visible organization scope, but it does not mirror
the analytics and AI generation route-level requirement for service-computed organization workspace capability metadata.

This review does not claim exploitability or exhaustive scan coverage. It records a concrete boundary drift candidate
and splits a minimal source/test repair task for later approval.

## Seeded First Repair Task

- Task id: `repair-organization-training-capability-source-boundary-2026-06-29`
- Status: `blocked_pending_fresh_source_test_approval`
- Planned source/test files:
  - `src/server/services/organization-training-route.ts`
  - `src/server/services/organization-training-route.test.ts`
- Intended repair: add a service-computed organization capability guard to organization training runtime admin context
  resolution, with focused route tests proving missing or false capability metadata is rejected before repository-backed
  training management operations.
- Still blocked: source/test edits, DB, Provider/AI, browser/dev server/e2e, package/lockfile, staging/prod/deploy,
  release readiness, final Pass, Cost Calibration, PR, and force-push.

## Planned Validation

```powershell
corepack pnpm exec prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/task-plans/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/evidence/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/acceptance/2026-06-29-security-unit-b-auth-role-boundary-static-review.md
corepack pnpm exec prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/task-plans/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/evidence/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-b-auth-role-boundary-static-review.md docs/05-execution-logs/acceptance/2026-06-29-security-unit-b-auth-role-boundary-static-review.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e drizzle migrations seed scripts playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-unit-b-auth-role-boundary-static-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-unit-b-auth-role-boundary-static-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-unit-b-auth-role-boundary-static-review-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are
approved for this docs/state-only Unit B review. Any source/test repair task seeded by this review remains blocked until
fresh user approval materializes its own allowed files, blocked files, validation commands, and closeout policy.
