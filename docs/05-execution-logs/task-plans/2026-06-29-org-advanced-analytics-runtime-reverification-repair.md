# Org Advanced Analytics Runtime Reverification Repair Plan

- Task id: `org-advanced-analytics-runtime-reverification-repair-2026-06-29`
- Branch: `codex/org-analytics-runtime-reverification-20260629`
- Status: `in_progress`
- Approval consumed: `current_user_fresh_approved_local_only_db_schema_test_owned_data_alignment_for_org_analytics_runtime_repair_2026_06_29`

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-db-alignment-repair.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-org-advanced-analytics-runtime-reverification-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-29-org-advanced-analytics-runtime-reverification-repair.md`
- `docs/05-execution-logs/evidence/2026-06-29-org-advanced-analytics-runtime-reverification-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-org-advanced-analytics-runtime-reverification-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-29-org-advanced-analytics-runtime-reverification-repair.md`
- `src/app/api/v1/organization-analytics/**`
- `src/features/admin/organization-analytics/**`
- `src/server/contracts/organization-analytics*`
- `src/server/mappers/organization-analytics*`
- `src/server/models/organization-analytics*`
- `src/server/repositories/organization-analytics*`
- `src/server/services/organization-analytics*`
- `src/server/validators/organization-analytics*`
- `src/db/schema/**`
- `src/db/seed/**`
- `drizzle/**`
- `migrations/**`
- `seed/**`
- `scripts/seed/**`
- `tests/unit/organization-analytics*`
- `tests/unit/organization-training*`
- `tests/integration/organization-analytics*`

## Blocked Files And Actions

- `.env*`
- `package.json`
- `package-lock.yaml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `playwright-report/**`
- `test-results/**`
- `.next/**`
- `docs/04-agent-system/state/archive/**`
- `docs/04-agent-system/state/task-history-index.yaml`
- `D:/tiku-local-private/**`
- `D:\tiku-local-private\**`
- Provider execution/configuration, Cost Calibration, staging/prod/cloud/deploy, PR, force-push, release readiness/final Pass, production-like data, and destructive DB drop/truncate/reset without fresh exact approval.

## DB Boundary

Only the localhost/127.0.0.1 Docker dev database may be inspected or changed. The task may inspect schema/migration state and may run non-destructive local migration/seed only if root-cause evidence shows it is required for organization analytics runtime. Evidence must use table presence, migration labels, aggregate counts, and status labels only.

## Dev Server Boundary

The existing `localhost:3000` server may be used when it renders the scoped route. If that server is stale or renders an empty shell, this task may start one worktree-local dev server on an alternate localhost/127.0.0.1 port for scoped browser verification only. Env values and connection strings must not be printed or recorded.

## AI/Provider Boundary

No Provider execution, Provider configuration, prompt payload, raw AI input/output, Provider credential, model fallback, or Cost Calibration action is allowed.

## Account/Credential Boundary

No credential, cookie, token, session, localStorage, Authorization header, env content, or connection string may be captured or recorded. Browser verification should use the existing local test-owned session if available. If a login is needed, this task may consume the already materialized Stage A approval to read only the test-owned `org_advanced_admin` login input from `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`; credential values must not be printed, committed, or recorded in evidence.

## Execution Plan

1. Reproduce the current `/organization/organization-analytics` runtime state with redacted role/route/status/count evidence.
2. Inspect local schema and migration state only enough to identify whether the analytics source table/data exists.
3. Trace the route/service/repository data flow to find the failing boundary.
4. Add a focused failing test before any source repair.
5. Implement the smallest root-cause fix, including schema/migration/test-owned seed only if proven required.
6. Run focused organization analytics tests and relevant local DB/runtime checks.
7. Record redacted evidence, audit, and acceptance notes.
8. Commit, fast-forward merge to `master`, push `origin/master`, and clean up the short branch/worktree.

## Closeout Policy

- Local commit: approved by current user approval.
- Fast-forward merge to `master`: approved by current user approval.
- Push `origin/master`: approved by current user approval.
- Cleanup short branch/worktree: approved by current user approval.
- PR, force-push, release readiness/final Pass, Cost Calibration, staging/prod/cloud/deploy remain blocked.
