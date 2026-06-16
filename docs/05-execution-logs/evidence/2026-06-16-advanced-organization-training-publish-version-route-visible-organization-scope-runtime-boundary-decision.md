# Evidence: advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision

## Module Run V2 Anchors

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision`
- Branch: `codex/advanced-organization-training-visible-org-scope-decision`
- Head at evidence creation: `c62415e34273c02b304cef0474330e9c24c79dec`
- Evidence created at: `2026-06-16T03:06:26-07:00`
- Task kind: boundary decision.
- Batch range: single docs-only boundary decision task.
- localFullLoopGate: docs-only boundary decision without real DB execution.
- threadRolloverGate: not required; current thread has enough context for this bounded docs-only decision.
- automationHandoffPolicy: standing autonomy is recorded in repository state and materialized in this queued task;
  high-risk gates remain blocked.
- nextModuleRunCandidate:
  advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd
- nextTaskPolicy: seeded
- Cost Calibration Gate remains blocked.
- RED: PASS not applicable; this is a docs-only boundary decision with no product code or test edits.
- GREEN: PASS. Boundary decision and next TDD seed are recorded, formatting/static gates pass, GitCompletion inventory
  is clean, and Module Run v2 closeout readiness gates pass for the scoped docs/state change set.
- Commit: `c62415e34273c02b304cef0474330e9c24c79dec` accepted baseline before this docs-only task.
- result: pass_docs_only_boundary_decision_real_visible_scope_resolver_required

## Decision

Do not accept the current platform-admin session plus requested organization public id as the final organization-training
publish runtime authorization boundary.

The route may continue to use the requested `organizationPublicId` as an input to server-side checks, but it must not
use that same request value as proof of `OrganizationTrainingAdminContext.visibleOrganizationPublicIds`.

## Rationale

1. Product rules require the target organization to be inside the admin's visible organization scope and require visible
   organization scope to be snapshotted at publish time.
2. `AuthenticatedUserDto.adminPublicId` and `adminRoles` prove a platform admin session shape. They do not carry the
   organization portal bound organization or descendant visible scope.
3. Existing `AuthUserAccessRow` exposes platform admin roles and ordinary user/employee organization metadata, but no
   reviewed source exposes a route-consumable organization-admin visible organization scope resolver.
4. `lookupTrustedPersistenceLineage` validates the requested public organization and `org_auth` pair server-side, but it
   does not prove that the current actor can see or publish for that organization.
5. Treating `publishInput.organizationPublicId` as `visibleOrganizationPublicIds` is fail-open for the scope check
   because the value comes from the same request being authorized.

## Boundary Rule

- `publishInput.organizationPublicId`: allowed as requested target organization input.
- `authorizationPublicId`: allowed as requested `org_auth` lineage input.
- `adminPublicId` and platform `adminRoles`: allowed as session-authenticated platform admin facts.
- `visibleOrganizationPublicIds`: must come from an explicit trusted resolver or repository-backed policy source, not
  from the request body.
- Missing trusted visible organization scope must fail closed before trusted lineage lookup or publish execution.

## Seeded Next Task

- Seeded task:
  `advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-tdd`
- Purpose: add a red-first route runtime contract so organization-training publish no longer synthesizes visible
  organization scope from `publishInput.organizationPublicId`; it must consume an explicit visible organization scope
  resolver and fail closed when no trusted scope is available.
- Scope: `src/server/services/organization-training-route.ts` and
  `src/server/services/organization-training-route.test.ts` only, plus docs/state/evidence/audit.
- Still blocked: real DB execution, schema/drizzle, repository implementation, dependency changes, provider/model,
  dev server, Browser/Playwright/e2e, deploy/payment/external-service, PR, force-push, and Cost Calibration Gate.

## Validation

Commands:

```powershell
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision
```

Results:

- `npm.cmd exec -- prettier --check ...`: PASS; all matched files use Prettier code style.
- `git diff --check`: PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run typecheck`: PASS.
- `Test-GitCompletionReadiness`: PASS.
- `Test-ModuleRunV2PreCommitHardening`: PASS.
- `Test-ModuleRunV2ModuleCloseoutReadiness`: PASS.
- `Test-ModuleRunV2PrePushReadiness -SkipRemoteAheadCheck`: PASS.

## Blocked Gates Preserved

- No `.env*` read, output, or edit by the agent.
- No real DB command execution and no row/private data access.
- No product source, test, script, schema/drizzle, migration, package, lockfile, or dependency changes.
- No provider/model call, provider configuration, raw prompt, raw answer, provider payload, quota/cost measurement, or
  Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No public identifier value list exposure.
- No PR or force push.

## Taste Compliance Self-Check

- Standard API response: not applicable; no API/runtime code changed.
- Naming discipline: PASS; docs use existing organization-training, organization-admin, organization, and org_auth
  terminology.
- Public ID boundary: PASS; no real public identifier lists are recorded.
- Layering: PASS; decision preserves App Router -> service -> repository ownership and seeds a route contract before
  repository work.
- Dependency isolation: PASS; no dependency/package/lockfile change.
- Schema and migration boundary: PASS; no schema/drizzle/migration file was changed.
- Evidence before conclusion: PASS; decision, seeded next task, validation commands, and blocked gates are recorded
  before closeout.
