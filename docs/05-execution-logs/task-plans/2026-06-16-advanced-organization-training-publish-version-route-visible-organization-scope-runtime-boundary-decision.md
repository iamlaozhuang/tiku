# Task Plan: advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision

## Scope

- Task kind: docs-only boundary decision.
- Goal: decide whether the current platform-admin session plus requested organization public id is an acceptable
  organization-training publish runtime boundary, or whether a real admin-visible organization scope resolver is
  required.
- Allowed changes: docs/state/task-plan/evidence/audit only.
- Readonly source review:
  - `src/server/services/organization-training-route.ts`
  - `src/server/services/session-service.ts`
  - `src/server/services/auth-service.ts`
  - `src/server/repositories/organization-training-repository.ts`
  - `src/server/repositories/auth-repository.ts`
  - `src/server/models/auth.ts`
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
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-readonly-recheck.md`

## Decision Questions

1. Does `AuthenticatedUserDto.adminPublicId` plus platform `adminRoles` prove organization-training publish authority?
2. Can `publishInput.organizationPublicId` be used as the source of `visibleOrganizationPublicIds`?
3. Does trusted `org_auth` lineage lookup alone prove the actor can publish for the requested organization?
4. What is the next implementation task if the current boundary is not acceptable?

## Decision Policy

- The requested organization public id may be used as an input to authorization checks, but not as proof of visible
  organization scope.
- Platform admin session and trusted lineage are insufficient if product rules require the target organization to be
  inside the admin's visible organization scope.
- If the current boundary is rejected, seed a narrow red-first route contract task that replaces route-local scope
  synthesis with an explicit visible organization scope resolver contract and fails closed when no trusted scope is
  available.

## Validation Plan

```powershell
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision
```
