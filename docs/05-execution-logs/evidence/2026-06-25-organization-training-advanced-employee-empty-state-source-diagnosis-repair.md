# Organization Training Advanced Employee Empty State Source Diagnosis/Repair Evidence

Task id: `organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25`

Branch: `codex/org-training-advanced-empty-diagnosis-20260625`

Evidence timestamp: `2026-06-25T10:32:50.7116035-07:00`

## Scope Boundary

Allowed scope used:

- Local source diagnosis and repair in organization-training runtime route/repository code.
- Focused unit coverage in organization-training route/repository tests.
- Governance state, task plan, evidence, and audit-review docs.

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

## Root Cause

The focused post-repair browser rerun showed `org_advanced_employee` could see the `企业训练` home entry but direct
`/organization-training` still rendered an empty state with no start/submit answer workflow.

Source tracing found the empty state is produced when the student page receives `versions: []` from
`/api/v1/organization-trainings/visible-list`.

The service layer already checks `publishScopeSnapshot.organizationPublicIds` against
`employeeContext.visibleOrganizationPublicIds`, which is the correct behavior for organization-scoped publication.
However, the repository input and default route reader only passed `employeePublicId` and current `organizationPublicId`;
the repository gateway query then returned only versions whose publishing organization was the employee's direct
organization. That can drop versions published by a parent/root organization whose publish scope includes the employee's
organization.

## Repair

- `OrganizationTrainingEmployeeVisibleVersionListInput` now carries optional `visibleOrganizationPublicIds`.
- Repository input normalization deduplicates and preserves the current organization plus the visible organization scope.
- Default route-backed employee visible-list reader now passes `employeeContext.visibleOrganizationPublicIds`.
- The Postgres-backed visible-list query now filters published versions whose `publish_scope_snapshot.organizationPublicIds`
  intersects the employee visible organization scope, while still validating the employee belongs to the current
  organization.

No schema, seed, migration, DB mutation, or account mutation was performed.

## TDD Evidence

RED:

```text
npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts
Exit code: 1
Result: 1 failed, 19 passed.
Expected failure: gateway input lacked visibleOrganizationPublicIds.
```

GREEN:

```text
npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts
Exit code: 0
Result: 1 test file passed, 20 tests passed.
```

Focused route + repository regression:

```text
npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts src/server/services/organization-training-route.test.ts
Exit code: 0
Result: 2 test files passed, 57 tests passed.
```

## Verification Commands

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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25
Exit code: 0
Result: pre-commit hardening passed; filesToScan=9; Cost Calibration Gate remains blocked.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25 -SkipRemoteAheadCheck
Exit code: 0
Result: pre-push readiness passed; branch/master/originMaster/stateMaster/stateOriginMaster aligned at base commit before task commit.
```

## Closeout Boundary

This is a local source repair only. It does not prove browser runtime acceptance for `org_advanced_employee`, and it
does not advance the project to full 8-row role-separated real-browser acceptance.

Next required task after closeout: focused credentialed, redacted browser rerun for organization-training employee
behavior. Full 8-row rerun remains blocked until that focused rerun passes.
