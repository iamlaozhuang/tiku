# Task Plan: advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-readonly-recheck

## Scope

- Task kind: readonly recheck.
- Goal: verify the organization-training publish route visible organization scope resolver contract after the TDD
  implementation.
- Allowed changes:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - this task plan, evidence, and audit review.
- Readonly files:
  - `src/server/services/organization-training-route.ts`
  - `src/server/services/organization-training-route.test.ts`
  - prior TDD evidence and audit review.
- Blocked: product source/test edits, real DB execution, row/private data access, schema/drizzle, repository
  implementation, package/lockfile/dependencies, provider/model, dev server, Browser/Playwright/e2e,
  staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate.

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
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd.md`

## Review Questions

1. Does the runtime route still synthesize `visibleOrganizationPublicIds` from request-body `organizationPublicId`?
2. When no trusted visible organization scope resolver is supplied, does the route fail closed before trusted lineage
   lookup and publish execution?
3. Is explicit `resolveOrganizationAdminContext` override behavior preserved?
4. Is real DB-backed visible organization scope resolver implementation still outside this task?
5. Should the next implementation task be seeded after this readonly recheck?

## Validation Plan

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-readonly-recheck
```
