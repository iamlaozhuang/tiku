# Task Plan: advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd

## Scope

- Wire the organization-training publish-version runtime route to a session-backed organization-admin actor context
  resolver.
- Keep the existing trusted-lineage repository lookup wiring intact.
- Use RED/GREEN TDD in `src/server/services/organization-training-route.test.ts` before changing
  `src/server/services/organization-training-route.ts`.
- Avoid real DB commands by injecting a fake session service in unit tests and keeping repository access mocked.

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
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd.md`

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd.md`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`

## Readonly Inputs

- `src/server/services/organization-training-service.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/contracts/auth-contract.ts`
- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`

## Design Notes

- The runtime resolver should use `SessionService.getCurrentSession` and `getRequestAuthorization(request)` so
  Authorization headers and existing session cookies remain aligned with other runtime routes.
- The resolver should accept only active session responses with `code === 0`, `data !== null`, an `adminPublicId`, and
  at least one recognized admin role.
- The route-level visible organization scope for this narrow task is the normalized `publishInput.organizationPublicId`.
  The task must not add DB-backed visibility expansion or broad authorization model changes.
- Unit tests inject a fake session service and mocked repository factory; no real `.env*`, DB, provider, dev server,
  browser, or e2e path is executed.

## TDD Steps

1. RED: add a failing route unit test proving default runtime handlers can derive admin context from injected session
   service and reach the trusted-lineage lookup without passing `resolveOrganizationAdminContext`.
2. GREEN: add minimal runtime options and resolver wiring in `organization-training-route.ts`.
3. Add any narrow negative test only if needed to lock down non-admin session behavior.
4. Run focused unit, formatting, lint, typecheck, and Module Run v2 readiness gates.

## Blocked Gates

- No `.env*` read, output, or edit.
- No real DB command execution and no row/private data access.
- No schema/drizzle edits, migration generation, or migration execution.
- No repository, mapper, model, validator, app route, package, lockfile, or script edits.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload.
- No dependency, package, or lockfile changes.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No quota/cost measurement or Cost Calibration Gate.
- No PR or force push.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-tdd -SkipRemoteAheadCheck
```
