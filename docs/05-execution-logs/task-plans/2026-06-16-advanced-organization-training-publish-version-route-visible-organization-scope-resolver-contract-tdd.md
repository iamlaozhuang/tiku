# Task Plan: advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd

## Scope

- Task kind: red-first TDD implementation.
- Goal: stop deriving `OrganizationTrainingAdminContext.visibleOrganizationPublicIds` from request body
  `publishInput.organizationPublicId` in the organization-training publish runtime route.
- Allowed source changes:
  - `src/server/services/organization-training-route.ts`
  - `src/server/services/organization-training-route.test.ts`
- Allowed governance changes:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - this task plan, evidence, and audit review.
- Blocked: `.env*`, real DB execution or row/private data, repositories, mappers, contracts, models, validators, app
  routes, schema/drizzle, package/lockfile/dependencies, scripts, provider/model, dev server, Browser/Playwright/e2e,
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
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision.md`

## Implementation Plan

1. Add a RED unit test proving the runtime route fails closed when a valid admin session exists but no trusted visible
   organization scope resolver is supplied. The test must assert no trusted lineage lookup and no publish execution.
2. Run the focused unit command and record the expected failure.
3. Add a narrow visible organization scope resolver contract to the route runtime options.
4. Change the session-backed admin context resolver to consume explicit trusted visible scope and default to an empty
   visible scope when no resolver is configured.
5. Update the existing session-backed success test to inject trusted visible scope explicitly.
6. Run the focused unit command and full declared validation commands.
7. Write evidence and audit review, then close the queued task and seed a readonly recheck if the audit surface warrants
   it.

## Risk Controls

- Do not implement a real DB-backed visible scope resolver; this task only adds the route contract and fail-closed
  behavior.
- Keep `lookupTrustedPersistenceLineage` as the trusted organization/auth pair resolver and ensure it is not called when
  visible scope is unavailable.
- Preserve ADR-002 layering: route/runtime adapter owns transport and resolver wiring; repository implementation remains
  outside this task.
- Keep evidence redacted: no Authorization header values beyond synthetic test literals, no secrets, no DB URL, no row
  data, no provider payload.

## Validation Plan

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd
```
