# Task Plan: advanced-organization-training-publish-version-authorization-lineage-readonly-recheck

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-authorization-lineage-readonly-recheck`
- Branch: `codex/advanced-organization-training-publish-version-authorization-lineage-readonly-recheck`
- Baseline: `master == origin/master == cd8698aede1b94d8254ae35adf2042df8d548286`
- Task kind: readonly audit
- Human approval: current 2026-06-15 Codex thread, user approved execution.
- Closeout approval: task-scoped local commit, fast-forward merge to `master`, push `origin/master`, delete short branch, fetch prune.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-authorization-lineage-coverage.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-authorization-lineage-coverage.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Scope

Readonly recheck only:

- Confirm service-local publish-version authorization lineage coverage after the TDD implementation.
- Confirm `OrganizationTrainingPublishedVersionWrite` carries internal `org_auth` lineage.
- Confirm public `OrganizationTrainingPublishedVersionDto` still does not expose authorization lineage.
- Confirm ADR-002 layering remains intact.
- Confirm route, repository, schema, UI, provider, DB, dependency, and formal target write gates remain blocked.
- Record whether repository/schema/route persistence can be seeded next.

## Implementation Plan

No product implementation.

Allowed edits are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- the matching evidence file
- the matching audit review file

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-readonly-recheck`

## Risk Controls

- No `.env*` read/write/output.
- No DB access, direct row/private data access, provider/model call, provider configuration, quota/cost measurement, Cost Calibration Gate, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, schema/drizzle/scripts/package/lockfile/dependency change, formal content write, formal target write, PR, or force push.
- Evidence records file paths, field names, command names, and redacted conclusions only.
