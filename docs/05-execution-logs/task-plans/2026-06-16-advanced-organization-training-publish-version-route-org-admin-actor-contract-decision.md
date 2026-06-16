# Task Plan: advanced-organization-training-publish-version-route-org-admin-actor-contract-decision

## Scope

- Task id: `advanced-organization-training-publish-version-route-org-admin-actor-contract-decision`
- Batch id: `module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary`
- Batch role: child.
- Task kind: docs-only boundary decision.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-org-admin-actor-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-org-admin-actor-boundary-readonly-audit.md`

## Readonly Code Surface

- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/auth/local-session-runtime.ts`

## Decision Work

1. Confirm whether current source exposes an organization-admin actor source for publish-version route work.
2. Confirm whether current source exposes a route-consumable visible organization scope source equivalent to `OrganizationTrainingAdminContext.visibleOrganizationPublicIds`.
3. Decide whether the trusted lineage resolver can be implemented now.
4. If not, name the follow-up seeding child as the next task.

## Risk Defense

- This task does not implement runtime behavior.
- Do not use effective authorization capability metadata as proof of organization-admin publish authority.
- Do not use platform admin roles as organization portal authority without a separate policy decision.
- Do not expose internal numeric ids, row data, private data, or public identifier value lists in evidence.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2DocsOnlyBatchReadiness.ps1 -BatchId module-run-v2-docs-only-fast-lane-trial-batch-organization-training-publish-boundary -Mode hard_block
git diff --check
npm.cmd run lint
npm.cmd run typecheck
```
