# Task Plan: advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd

## Scope

- Task id: `advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd`
- Branch: `codex/advanced-organization-training-org-admin-actor-context`
- Task kind: `implementation`
- Goal: add a narrow route-consumable organization-admin actor context contract for organization-training publish-version before trusted lineage resolution can run.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd.md`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`

## Blocked Files And Work

- No `.env*` read, output, or edit.
- No DB access, schema/drizzle edit, migration generation, migration execution, dependency/package/lockfile change, provider/model call, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.
- No trusted-lineage persistence resolver implementation in this task.
- No broad authorization model change outside the named route actor-context contract.

## TDD Steps

1. RED: add a focused route unit test proving publish blocks before lineage resolution when organization-admin actor context is unavailable.
2. GREEN: add a minimal actor-context resolver contract to `organization-training-route.ts`, default it to unavailable, and pass the resolved context into lineage resolver input.
3. Extend existing route tests only as needed so successful publish cases provide a test actor context.
4. Record validation results in evidence and close the queue task.

## Expected Contract

- `resolveOrganizationAdminContext` is injectable on route options and returns `OrganizationTrainingAdminContext | null`.
- Missing actor context returns a standard API error envelope before `resolvePersistenceLineage` or `publishVersion` can run.
- `OrganizationTrainingPersistenceLineageResolverInput` receives the resolved actor context for later trusted-lineage work.
- Runtime default remains conservative and returns unavailable until a later task wires a real resolver.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd -SkipRemoteAheadCheck
```
