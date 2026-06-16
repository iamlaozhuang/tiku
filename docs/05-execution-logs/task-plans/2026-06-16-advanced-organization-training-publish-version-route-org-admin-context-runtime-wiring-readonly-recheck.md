# Task Plan: advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-readonly-recheck

## Scope

- Task kind: readonly recheck.
- Goal: verify the default organization-training publish route runtime flow after the session-backed
  organization-admin actor context wiring.
- Allowed changes: docs/state/task-plan/evidence/audit only.
- Readonly source review:
  - `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`
  - `src/server/services/organization-training-route.ts`
  - `src/server/services/organization-training-route.test.ts`
  - `src/server/services/session-service.ts`
  - `src/server/services/auth-service.ts`
  - `src/server/auth/local-session-runtime.ts`
  - `src/server/auth/session-cookie.ts`
  - `src/server/contracts/auth-contract.ts`
  - `src/server/mappers/auth-mapper.ts`
  - `src/server/repositories/organization-training-repository.ts`
- Blocked changes: product source, tests, scripts, schema/drizzle, package/lockfile, dependency, env/secret, DB,
  provider/model, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, PR,
  force-push, and Cost Calibration Gate.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd.md`

## Recheck Questions

1. Does the App Router publish entrypoint still use the default runtime handler factory?
2. Does the default runtime handler derive organization-admin actor context from session runtime rather than requiring a
   test-only injected resolver?
3. Does authorization input flow through the existing request Authorization/header-or-cookie helper without recording
   token values in evidence?
4. Does trusted lineage lookup still run through the repository-owned lookup and service boundary?
5. Is there any remaining authorization or visibility boundary that must be decided before expanding implementation?

## Expected Finding Policy

- A runtime wiring PASS is acceptable if the default route reaches the session-backed actor context resolver and trusted
  lineage repository lookup.
- A needs-recheck finding must be recorded if the visible organization scope source is still a route-local assumption
  rather than a proven organization-admin visibility source.
- If needs-recheck is recorded, seed a queued boundary decision task before closeout.

## Validation Plan

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-readonly-recheck -SkipRemoteAheadCheck
```
