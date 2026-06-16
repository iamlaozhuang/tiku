# Task Plan: advanced-organization-training-publish-version-authorization-lineage-coverage-seeding

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-authorization-lineage-coverage-seeding`
- Branch: `codex/advanced-organization-training-publish-version-authorization-lineage-coverage-seeding`
- Baseline: `master == origin/master == 8e1e9e103ea09ab564be03e8788a453b710cc614`
- Task kind: docs-only implementation queue seeding
- Human approval: current 2026-06-15 Codex thread, user said `批准执行`.
- Closeout approval: task-scoped local commit, fast-forward merge to `master`, push `origin/master`, delete short branch, fetch prune.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-service-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service.md`

## Scope

Docs/state-only seeding:

- Convert the readonly recheck `authorizationPublicId` lineage needs_recheck into a pending narrow TDD task.
- Do not implement product behavior in this seeding task.
- Preserve all blocked gates before any repository/schema/route persistence work.

## Pending Task To Seed

- `advanced-organization-training-publish-version-authorization-lineage-coverage`

Expected later task shape:

- RED-first TDD.
- Decide and cover whether publish-version write/DTO should carry `authorizationPublicId` lineage.
- Expected allowed files should be narrow: service/test first, with contract/model/validator only if the failing test proves they are required.
- Repository, schema, route, UI, provider, DB, e2e, dependency, formal content write, and formal target write remain blocked.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-coverage-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-coverage-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-coverage-seeding`

## Risk Controls

- No `.env*` read/write/output.
- No DB access, direct row/private data access, provider/model call, provider configuration, quota/cost measurement, Cost Calibration Gate, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, schema/drizzle/scripts/package/lockfile/dependency change, product source implementation, formal content write, formal target write, PR, or force push.
- Evidence records file paths, field names, command results, and redacted conclusions only.
