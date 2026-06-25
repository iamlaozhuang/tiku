# Organization Training Employee Effective Authorization Context Repair Evidence

Task id: `organization-training-employee-effective-authorization-context-repair-2026-06-25`

Branch: `codex/org-training-employee-workflow-20260625`

Base commit: `2e907f3ec05946ce6455c51e8b1492dc0e535757`

Evidence timestamp: `2026-06-25T10:16:07.0367636-07:00`

## Scope Boundary

Allowed scope used:

- Local source repair in `src/server/services/organization-training-route.ts`
- Focused unit coverage in `src/server/services/organization-training-route.test.ts`
- Governance state, task plan, evidence, and audit-review docs

Blocked scope not used:

- Browser/runtime rerun
- Credential read/input
- DB/seed/schema/migration/account mutation
- `.env*`
- Provider/Cost
- staging/prod
- payment/external service
- package or lockfile changes
- final MVP Pass claim

## Requirement Mapping

The prior browser rerun for `learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun-2026-06-25` left
`org_advanced_employee` organization-training workflow unproven because `/organization-training` rendered an empty state.

Static route inspection found the employee runtime path used a synthetic advanced `org_auth` context with fixed
`profession=logistics` and `level=4`. That could hide assigned organization training whose real organization
authorization uses a different `profession` or `level`, and it did not enforce standard employee denial through the
effective authorization source.

This repair changes organization-training employee runtime context resolution so employee visible-list/detail/write
routes use the logged-in employee's service-computed effective `org_auth` context for the current organization.

## Implementation Evidence

Changed source behavior:

- Added optional `effectiveAuthorizationService` injection to organization-training runtime route handlers.
- Employee context resolver now calls `listEffectiveAuthorizations` for the logged-in user's public id.
- Employee context selection now requires same-organization `org_auth` context.
- Employee visible-list, draft-save, submit, and readonly-summary handlers now reject unavailable or non-advanced
  employee answer contexts before repository access.
- The previous synthetic fixed advanced `logistics` level `4` employee answer context was removed.

Focused unit coverage added:

- Standard organization employee effective context blocks visible-list before repository visible-list access.
- Advanced organization employee visible-list uses the real effective organization authorization `profession` and
  `level` scope when filtering assigned training.

## TDD Evidence

RED phase:

- Command: `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts`
- Result: failed as expected before production route repair.
- Observed failure: standard organization employee visible-list received successful version data instead of
  `organizationTrainingEmployeeAnswerBlockedMessage` / blocked status, proving the old synthetic advanced context was
  still active.

GREEN phase:

```text
> tiku-scaffold@0.1.0 test:unit
> vitest run src/server/services/organization-training-route.test.ts

Test Files  1 passed (1)
Tests  37 passed (37)
Duration  7.63s
```

## Verification Commands

```text
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
Exit code: 0
Result: 1 test file passed, 37 tests passed.
```

```text
npm.cmd run lint
Exit code: 0
Result: eslint completed without reported errors.
```

```text
npm.cmd run typecheck
Exit code: 0
Result: tsc --noEmit completed without reported errors.
```

Formatting, diff hygiene, Module Run v2 pre-commit hardening, and pre-push readiness are recorded in the closeout
section after evidence/audit files are written.

## Closeout Gate Results

```text
npx.cmd prettier --check --ignore-unknown ...
Exit code: 0
Result: All matched files use Prettier code style.
```

```text
git diff --check
Exit code: 0
Result: no whitespace errors reported.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-employee-effective-authorization-context-repair-2026-06-25
Exit code: 0
Result: pre-commit hardening passed; filesToScan=7; Cost Calibration Gate remains blocked.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-employee-effective-authorization-context-repair-2026-06-25 -SkipRemoteAheadCheck
Exit code: 0
Result: pre-push readiness passed; branch/master/originMaster/stateMaster/stateOriginMaster aligned at base commit before task commit.
```

## Closeout Boundary

This is a local source repair only. It does not prove browser runtime acceptance for `org_advanced_employee`, and it
does not advance the project to full 8-row role-separated real-browser acceptance.

Next required task after closeout: credentialed, redacted real-browser post-repair rerun for organization-training
employee behavior. Full 8-row rerun remains blocked until the focused post-repair rerun shows the organization-training
employee workflow is available for advanced employees and unavailable for standard employees.
