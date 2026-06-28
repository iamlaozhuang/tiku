# organization-workspace-polish-permission-contract-tdd-2026-06-28 Task Plan

## Status

- Task id: `organization-workspace-polish-permission-contract-tdd-2026-06-28`
- Branch: `codex/org-workspace-ux-polish-serial-20260628`
- Approval: current user serial batch approval on 2026-06-28.
- Execution order: task 2 after `organization-workspace-state-polish-source-only-2026-06-28` closed and committed.
- Scope: permission/authorization contract and focused unit tests only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`

## Requirement Mapping

- Direct advanced organization routes must be guarded by service-side `AdminWorkspaceCapabilitySummary`, not menu visibility.
- Standard organization admins receive `standard_unavailable` for advanced organization surfaces.
- Missing `organizationPublicId` is a context failure and must not become an advanced fallback.
- Contract output should expose enough structured reason fields for UI to display states without computing `effectiveEdition`.
- No DB rows, Provider calls, browser runtime, e2e, schema/migration/seed, package/lockfile, `.env*`, staging/prod/deploy, payment/external-service, Cost Calibration, release readiness, or final Pass work is in scope.

## TDD Plan

1. Add focused RED tests for route decision metadata:
   - advanced-only organization route returns `requiredCapability` and `requiredAuthorizationSource`.
   - missing organization context returns a structured context-required decision.
   - session capability summary carries org-auth capability source metadata from the service-side mapper.
2. Implement minimal contract/service/mapper updates:
   - add structured fields to `AdminWorkspaceCapabilitySummary` and `AdminWorkspaceRouteAccessDecision`.
   - populate those fields in the route guard service and auth mapper.
   - preserve existing page access adapter behavior.
3. Run GREEN focused unit tests, then full task gates.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/contracts/admin-workspace-role-guard-contract.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/mappers/auth-mapper.ts`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- task plan/evidence/audit/acceptance for this task.

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/server/contracts/admin-workspace-role-guard-contract.ts src/server/services/admin-workspace-role-guard-service.ts src/features/admin/organization-workspace/admin-organization-workspace-access.ts src/server/contracts/auth-contract.ts src/server/mappers/auth-mapper.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-polish-permission-contract-tdd.md docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-permission-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-polish-permission-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-polish-permission-contract-tdd.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-polish-permission-contract-tdd-2026-06-28
```

## Stop Conditions

- Any need for DB/schema/migration/seed, Provider, browser/e2e/dev-server, package/lockfile, `.env*`, staging/prod/deploy, payment/external-service, Cost Calibration, PR, force push, release readiness, or final Pass.
- Any test requires raw credentials, tokens, cookies, localStorage dumps, raw DOM, screenshots, traces, DB rows, Provider payloads, prompts, raw AI output, plaintext `redeem_code`, or full `question`/`paper` content.
- Task 2 gates fail in a way that cannot be fixed within allowed files.
