# Task Plan: Seed Admin Organization Repository Resolver TDD

## Task

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-seeding`
- Branch: `codex/visible-scope-repository-resolver-admin-organization-seeding`
- Task kind: docs-only implementation queue seeding.
- Scope: seed the next red-first repository resolver implementation task after the `admin_organization` schema source has landed.

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
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration.md`

## Local State Gate

- `git switch master`: passed before branch creation.
- `git fetch --prune origin`: passed.
- `git status --short --branch`: clean, `## master...origin/master`.
- `git rev-parse HEAD master origin/master`: all equal to `ba6c5eb0dc52a3dbdd3c07a897c09fc317985506`.
- Local and remote `codex/*`: none found before branch creation.

## Implementation Plan

1. Keep this task docs/state-only.
2. Mark this seeding task closed in the queue and current project state.
3. Add a new pending implementation task:
   `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-tdd`.
4. Limit the pending task to red-first unit tests and runtime/repository wiring only:
   - `src/server/repositories/organization-training-repository.ts`
   - `src/server/repositories/organization-training-repository.test.ts`
   - `src/server/services/organization-training-route.ts`
   - `src/server/services/organization-training-route.test.ts`
5. Preserve all high-risk blocked gates:
   - no `.env*`;
   - no real DB commands or row/private data;
   - no schema/drizzle changes;
   - no package/lockfile/dependency changes;
   - no provider/model calls;
   - no dev server, Browser, Playwright, or e2e;
   - no staging/prod/cloud/deploy/payment/external-service;
   - no PR or force push;
   - no Cost Calibration Gate.

## Validation Plan

- `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-seeding`
