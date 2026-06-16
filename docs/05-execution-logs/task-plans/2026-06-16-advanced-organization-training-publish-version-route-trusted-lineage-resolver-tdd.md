# Task Plan: advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd

## Scope

- Task id: `advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd`
- Branch: `codex/advanced-organization-training-trusted-lineage-resolver`
- Task kind: `implementation`
- Goal: add a route-level trusted lineage resolver contract for organization-training publish-version using the already verified organization-admin actor context.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-context-contract-tdd.md`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/repositories/organization-training-repository.ts`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd.md`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`

## Blocked Files And Work

- No `.env*` read, output, or edit.
- No DB access, schema/drizzle edit, migration generation, migration execution, repository mapper change, dependency/package/lockfile change, provider/model call, dev server, Browser, Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.
- No real database-backed lineage lookup in this task.

## TDD Steps

1. RED: add a focused route unit test proving a trusted lineage lookup can resolve internal lineage only from publish public identifiers plus verified actor context.
2. GREEN: add a minimal route-level trusted lineage lookup contract and resolver factory.
3. Add focused tests for actor visible-scope denial and lookup miss returning lineage unavailable without calling `publishVersion`.
4. Record validation results in evidence and close the queue task.

## Expected Contract

- The resolver receives `OrganizationTrainingAdminContext`, `organizationPublicId`, and `authorizationPublicId`.
- The resolver must not trust client-supplied `organizationId` or `orgAuthId`.
- If actor visible scope does not include the publish organization, return lineage unavailable before lookup.
- If lookup cannot resolve the public organization/auth pair, return lineage unavailable.
- Runtime DB wiring remains a later task.

## Validation Commands

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-resolver-tdd -SkipRemoteAheadCheck
```
