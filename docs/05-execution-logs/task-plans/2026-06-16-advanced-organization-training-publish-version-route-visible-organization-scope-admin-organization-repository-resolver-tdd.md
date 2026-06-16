# Task Plan: Admin Organization Visible Scope Repository Resolver TDD

## Task

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-tdd`
- Branch: `codex/admin-organization-visible-scope-resolver`
- Task kind: red-first local implementation.
- Scope: implement repository-backed `adminPublicId -> visibleOrganizationPublicIds` resolver for the organization-training
  publish route using the landed `admin_organization` schema source.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-seeding.md`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/db/schema/auth.ts`
- `src/server/repositories/runtime-database.ts`

## Startup Gate

- `git switch master`: PASS.
- `git fetch --prune origin`: PASS.
- `git status --short --branch`: clean, `## master...origin/master`.
- `git rev-parse HEAD master origin/master`: all equal to `267c9b557ba64609642f8b443027f308a71986fa`.
- Local and remote `codex/*`: none found before branch creation.

## Implementation Plan

1. RED route test:
   - prove runtime publish route uses the repository visible-scope resolver when session admin context is present;
   - prove missing repository visible scope fails closed before trusted lineage lookup.
2. RED repository test:
   - prove `createOrganizationTrainingRepository` exposes visible-scope lookup;
   - prove it trims `adminPublicId`, expands assigned active root organizations to active descendants, and returns public ids.
3. GREEN repository implementation:
   - add gateway/source types for visible organization scope;
   - normalize blank admin public id to null/no query;
   - expand active organization hierarchy from assignment roots without real DB execution in tests.
4. GREEN Postgres wiring:
   - add Drizzle query using `admin`, `admin_organization`, and active `organization`;
   - fetch active organization rows once for descendant expansion;
   - no raw SQL, no `drizzle-kit push`, no migration generation.
5. GREEN route wiring:
   - make runtime route default visible-scope resolver call `repository.lookupVisibleOrganizationScope`;
   - keep trusted lineage lookup after actor scope check.

## Blocked Gates

- No `.env*` read, output, or edit.
- No real DB command execution and no row/private data access.
- No schema/drizzle edits, migration generation, or migration execution.
- No package/lockfile/dependency changes.
- No provider/model call or provider configuration.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No PR or force push.
- No Cost Calibration Gate.

## Validation Plan

- RED:
  `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- GREEN:
  `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-tdd`
