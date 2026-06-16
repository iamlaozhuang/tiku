# Evidence: advanced-organization-training-publish-version-route-org-admin-actor-contract-decision

## Module Run V2 Anchors

- Task id: `advanced-organization-training-publish-version-route-org-admin-actor-contract-decision`
- Branch: `codex/module-run-v2-docs-only-fast-lane-trial-batch`
- Head at evidence creation: `67de8f6e2de597195a34f44a832da2827c05d921`
- Evidence created at: `2026-06-16T00:13:09-07:00`
- Task kind: boundary_decision.
- Batch range: child 1 of 2 for `module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary`.
- localFullLoopGate: L1 docs-only boundary decision with hard-block batch readiness.
- threadRolloverGate: not required; current thread has enough context for this docs-only batch.
- automationHandoffPolicy: no automation handoff; future task requires fresh approval before claim.
- nextModuleRunCandidate: advanced-organization-training-publish-version-route-org-admin-actor-contract-followup-seeding
- nextTaskPolicy: seeded
- Cost Calibration Gate remains blocked.
- RED: PASS. Initial hard-block batch readiness failed because this evidence wrapped `nextModuleRunCandidate` in backticks; the scalar was normalized to a bare task id.
- GREEN: readonly source and prior evidence review completed; decision recorded without runtime changes.
- Commit: `67de8f6e2de597195a34f44a832da2827c05d921` accepted baseline before the local docs-only trial commit.
- result: pass_docs_only_contract_decision_current_source_not_sufficient

## Decision

The current source does not yet provide a safe organization-admin actor contract for publish-version trusted lineage.

- Actor source: not approved from current runtime source. `AuthenticatedUserDto.adminRoles` covers platform admin roles, while employee/user context carries public user and organization metadata. Neither proves organization portal publish authority.
- Visible organization scope source: not approved from current runtime source. `OrganizationTrainingAdminContext.visibleOrganizationPublicIds` exists for manual draft creation, but no route-consumable resolver currently derives it for publish-version.
- Trusted lineage resolver support: not approved for TDD implementation yet. A resolver may remain the right boundary, but it needs a proven actor/scope input contract before it can safely resolve internal persistence lineage.

## Source Review Notes

- `OrganizationTrainingAdminContext` contains `adminPublicId` and `visibleOrganizationPublicIds`, but `publishVersion` does not receive this context.
- `createOrganizationTrainingRouteHandlers` keeps the App Route thin, validates request shape and path/body draft public-id equality, and delegates lineage lookup through `resolvePersistenceLineage`.
- The default runtime lineage resolver returns `null`, preserving the lineage-unavailable block.
- `EffectiveAuthorizationContextDto` exposes display-scoped authorization capability metadata and public ids. It is not an organization-admin actor proof and is not an internal lineage carrier.
- `mapAdminAccountRow` maps platform admin account roles and clears employee/organization public context. It does not establish organization portal visible scope.

## Needs Recheck

- needs_recheck: true
- nextTaskPolicy: seeded
- nextModuleRunCandidate: advanced-organization-training-publish-version-route-org-admin-actor-contract-followup-seeding

The next child should seed a readonly recheck instead of TDD implementation because this decision does not prove a safe existing actor/scope source.

## Validation

Commands to run at parent closeout:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2DocsOnlyBatchReadiness.ps1 -BatchId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -Mode hard_block
git diff --check
npm.cmd run lint
npm.cmd run typecheck
```

Results:

- `Test-ModuleRunV2DocsOnlyBatchReadiness`: PASS in hard-block mode for the parent batch.
- `git diff --check`: PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run typecheck`: PASS.

## Blocked Gates Preserved

- No product source implementation.
- No route/service/repository/mapper/contract/model/validator/UI runtime changes.
- No schema, migration, script, dependency, package, or lockfile changes.
- No DB access and no row/private data.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload.
- No quota/cost measurement or Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No formal content write or formal target write.
- No public identifier value list exposure.
- No PR or force push.

## Taste Compliance Self-Check

- Standard API response: not applicable; no API code changed.
- Naming discipline: PASS; task ids use registered project terminology.
- Public ID boundary: PASS; no public identifier values or internal numeric ids are recorded.
- Layering: PASS; ADR-002 route/service/repository boundaries remain unchanged.
- Dependency isolation: PASS; no dependency/package/lockfile change.
- Schema and migration boundary: PASS; no schema/drizzle/migration change.
- Evidence before conclusion: PASS; decision evidence precedes implementation and keeps TDD blocked.
