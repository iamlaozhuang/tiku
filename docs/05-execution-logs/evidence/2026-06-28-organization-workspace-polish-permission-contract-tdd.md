# organization-workspace-polish-permission-contract-tdd-2026-06-28 Evidence

## Scope

- Task: `organization-workspace-polish-permission-contract-tdd-2026-06-28`
- Branch: `codex/org-workspace-ux-polish-serial-20260628`
- Approval: current user serial batch approval on 2026-06-28.
- Runtime boundary: permission/authorization contract and focused unit tests only; no browser, dev server, e2e, DB, Provider, Cost Calibration, staging/prod/deploy, payment/external service, release readiness, or final Pass.

## Source Changes

- `src/server/contracts/admin-workspace-role-guard-contract.ts`
  - Added structured capability source, authorization source, and required capability fields.
- `src/server/services/admin-workspace-role-guard-service.ts`
  - Populates route decisions with required advanced organization capability, required `org_auth` source, and required organization context metadata.
- `src/server/mappers/auth-mapper.ts`
  - Emits `organizationAuthorizationSource: "org_auth"` and `capabilitySource: "service_computed"` for organization admin capability summaries.
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
  - Keeps fallback summaries explicit as `session_fallback` without computing an advanced `effectiveEdition`.

## TDD Evidence

### RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot
```

Result: failed as expected before source implementation.

Summary:

- Test files: 2 failed, 1 passed.
- Tests: 3 failed, 16 passed.
- Missing contract fields: `requiredCapability`, `requiredAuthorizationSource`, `requiredOrganizationContext`, `organizationAuthorizationSource`, and `capabilitySource`.

### GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot
```

Result: passed after implementation.

Summary:

- Test files: 3 passed.
- Tests: 19 passed.

## Validation Evidence

### Focused Unit

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts
```

Result: passed.

- Test files: 3 passed.
- Tests: 19 passed.

### Static Gates

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- scoped `npx.cmd prettier --write --ignore-unknown ...`: passed, unchanged.
- scoped `npx.cmd prettier --check --ignore-unknown ...`: passed, all matched files use Prettier code style.
- `git diff --check`: passed.

### Mechanism Gates

- `Get-TikuProjectStatus.ps1`: passed as diagnostic; before closeout state update it reported `projectStatusDecision: current_task_active` and recommended finishing `organization-workspace-polish-permission-contract-tdd-2026-06-28`.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-polish-permission-contract-tdd-2026-06-28`: passed; scope scan reported 12 changed files all within task allowed files.

After task closeout state update:

- scoped Prettier write/check: passed.
- `git diff --check`: passed.
- `Get-TikuProjectStatus.ps1`: passed as diagnostic with `nextActionDecision: no_pending_task`, `activeQueueNonTerminalCount: 4`, `archiveCandidateCount: 11`, `highRiskRepairBlockedCount: 0`, `projectStatusRequiresHuman: true`, and `Cost Calibration Gate remains blocked`.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-polish-permission-contract-tdd-2026-06-28`: passed again.

## Prohibited Actions

- Browser/dev-server/e2e: not executed.
- DB/schema/migration/seed: not accessed or modified.
- Provider/configuration/model call: not executed.
- Cost Calibration: not executed.
- staging/prod/deploy/payment/external service: not executed.
- PR/force push/release readiness/final Pass: not executed or claimed.
