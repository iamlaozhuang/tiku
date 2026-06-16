# Task Plan: advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck

## Scope

- Task id: `advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck`
- Branch: `codex/advanced-organization-training-org-admin-actor-recheck`
- Task kind: `readonly_recheck`
- Goal: recheck whether current source proves a safe organization-admin actor and visible organization scope source for organization-training publish-version trusted lineage.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-decision.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md`

## Readonly Sources

- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/auth/local-session-runtime.ts`

## Blocked Files And Work

- No `.env*` read, output, or edit.
- No product source, test, script, schema, migration, package, lockfile, e2e artifact, browser artifact, material, or paper asset change.
- No DB access, provider/model call, quota/cost measurement, dev server, Browser, Playwright, staging/prod/cloud/deploy/payment/external-service action, PR creation, or force push.

## Recheck Steps

1. Re-read the prior decision and audit records for the org-admin actor boundary.
2. Re-read the declared readonly source files and scan for publish-version actor, route context, visible organization scope, and lineage resolver entry points.
3. Decide whether direct trusted-lineage resolver TDD can safely resume.
4. If source remains insufficient, seed the next narrow TDD task for a route-consumable organization-admin actor context contract.
5. Run formatting, lint/typecheck, Git readiness, PreCommit, ModuleCloseout, and PrePush readiness before closeout.

## Decision Criteria

- Direct trusted-lineage resolver TDD may resume only if the route can consume a proven organization-admin actor and visible organization scope source.
- Capability metadata from effective authorization is not enough by itself; it must prove actor authority and route-visible scope.
- Platform admin roles are not organization portal actor proof.
- If proof is absent, the next task must first implement a narrow actor-context contract and keep DB/provider/e2e/schema/dependency gates blocked unless separately declared by that task.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md
npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck -SkipRemoteAheadCheck
```
