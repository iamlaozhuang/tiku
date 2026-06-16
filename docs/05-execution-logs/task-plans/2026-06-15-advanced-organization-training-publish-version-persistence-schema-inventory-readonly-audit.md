# Advanced Organization Training Publish Version Persistence Schema Inventory Readonly Audit Plan

## Goal

Readonly inventory the current schema, repository, mapper, route, service, contract, model, and validator surfaces for
organization training publish-version persistence, then decide whether schema/migration work is required before
repository/mapper implementation.

## Required Context Re-Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`

## Scope

Allowed writes are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- this task evidence
- this task audit review

Readonly inspection is limited to queued readonly surfaces under:

- `src/db/schema/**`
- `src/server/repositories/**`
- `src/server/mappers/**`
- `src/app/api/v1/**`
- existing organization training service, contract, model, validator, and tests

## Blocked Gates

- No `.env*` read/write/output.
- No DB access, direct row/private data read, migration generation, or migration execution.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload inspection.
- No quota/cost measurement or Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, product source, route, repository, mapper, UI, formal content
  write, or formal target write changes.
- No PR and no force push.

## Audit Steps

1. Confirm repository readiness before claim: `master`, `origin/master`, clean worktree, and no `codex/*` residue.
2. Create a short branch for the docs/state closeout.
3. Re-read required governance, ADR, queue, capability, and prior evidence files from local disk.
4. Inventory schema tables and schema exports for organization training publish-version storage.
5. Inventory repository, mapper, and API route surfaces for organization training publish-version persistence.
6. Re-check service and contract boundaries for internal authorization lineage and public DTO non-exposure.
7. Write evidence and audit with a clear storage decision and first implementation recommendation.
8. Run the queued validation commands.
9. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and confirm clean state if
   all gates pass.

## Expected Decision Shape

- If a durable organization training publish-version table or equivalent isolated storage exists, recommend repository/mapper
  TDD as the next implementation task.
- If storage is absent or incomplete, recommend a fresh-approved schema/migration task before repository/mapper implementation.
- In either case, keep `authorizationSource` and `authorizationPublicId` internal and out of public published-version DTOs unless
  a separate public contract decision approves exposure.

## Validation Commands

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit
```
