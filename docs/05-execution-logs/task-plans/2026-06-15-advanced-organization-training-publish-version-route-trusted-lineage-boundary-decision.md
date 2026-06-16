# Task Plan: advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision

## Scope

Decide the trusted lineage boundary for the organization training publish-version route. This is a docs-only boundary
decision. It must not implement runtime route, service, repository, mapper, schema, UI, dependency, provider, DB,
or formal target behavior.

## Governance Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- Prior route-flow evidence and audit for
  `advanced-organization-training-publish-version-route-flow-readonly-recheck`

## Readonly Surfaces

- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- Existing session/user resolver patterns under `src/server/auth` and `src/server/services`
- Existing organization/auth repository patterns that map public identifiers to internal lineage

## Decision Work

1. Confirm the publish route is still intentionally blocked by default when no trusted lineage resolver is wired.
2. Decide whether trusted lineage belongs in a route helper, service collaborator, or dedicated auth boundary.
3. Decide what may be authoritative input for `organizationId` and `orgAuthId`.
4. Record whether the available session/admin/auth runtime boundary is narrow enough for a follow-up TDD implementation.
5. Update state, queue, evidence, and audit only.

## Expected Boundary

- Route remains a thin transport/envelope layer.
- Client input may carry only public metadata and capability hints already covered by validators/service checks.
- Internal persistence lineage must be resolved server-side from authenticated session plus repository-verified
  organization/auth records.
- The resolver must return only `OrganizationTrainingPersistenceLineage` to the service and must never expose internal
  numeric ids in the API contract, UI, logs, or evidence.
- If organization-admin actor scope is not yet provable from current runtime contracts, implementation must stay blocked
  and a narrower actor-boundary audit should be queued before TDD implementation.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-training-route.test.ts"`
- `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/repositories/organization-training-repository.test.ts" "src/server/mappers/organization-training-mapper.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts" "src/db/schema/organization-training.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision`

## Risk Controls

- No product source changes.
- No DB access or row/private data inspection.
- No provider/model, quota/cost, browser/e2e/dev-server, staging/prod/cloud/deploy/payment/external service work.
- No schema/drizzle/scripts/package/lockfile/dependency changes.
- No formal content write or formal target write.
- No public identifier value lists in evidence.
