# Task Plan: advanced-organization-training-publish-version-persistence-schema-migration

## Task

- Task id: `advanced-organization-training-publish-version-persistence-schema-migration`
- Branch: `codex/advanced-organization-training-publish-version-persistence-schema-migration`
- Baseline: `master == origin/master == fafed61d93e1c15f01f21e0c5e87a97636ddbef1`
- Task kind: gated local schema migration.
- User approval: current 2026-06-15 Codex thread, explicit `批准执行` after the next-step recommendation for this
  high-risk schema task.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration-seeding.md`
- Drizzle local skill docs:
  - `C:/Users/jzzhu/.codex/skills/drizzle-orm-expert/SKILL.md`
  - `C:/Users/jzzhu/.codex/skills/drizzle-orm-expert/docs/drizzle/_index.md`

## Objective

Add isolated organization training publish-version schema support before repository/mapper work. The schema must store the
current service write boundary for published organization training versions without writing into formal `question`, `paper`,
`practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` tables.

## TDD Plan

1. Add `src/db/schema/organization-training.test.ts` first.
2. Verify RED with:

```powershell
npm.cmd run test:unit -- "src/db/schema/organization-training.test.ts"
```

Expected RED reason: `src/db/schema/organization-training.ts` and its exports do not exist yet.

3. Add the minimal schema in `src/db/schema/organization-training.ts` and export it from `src/db/schema/index.ts`.
4. Generate or author the SQL migration without reading `.env*`, without DB access, and without running migrate.
5. Verify GREEN with the same scoped schema test, then run the full task validation matrix.

## Schema Design

Create one isolated table for the current publish-version boundary:

- Table: `organization_training_version`
- Enum: `organization_training_version_status` with `published`, `taken_down`
- Internal lineage columns:
  - `organization_id` -> `organization.id`
  - `org_auth_id` -> `org_auth.id`
  - `authorization_source` default `org_auth`
  - `authorization_public_id`
  - owner/quota owner public metadata
- Public/read model metadata:
  - `public_id`
  - `draft_public_id`
  - `version_number`
  - `organization_public_id`
  - `publish_scope_snapshot`
  - `profession`, `level`, `subject`
  - `title`, `description`
  - `question_count`, `total_score`, `question_type_summary`
  - `version_status`, `published_at`, `taken_down_at`, `takedown_reason`
  - `created_at`, `updated_at`

Do not add repository, mapper, route, UI, service behavior, or formal target columns in this task.

## Migration Plan

- The default `drizzle.config.ts` reads `.env.local` when present. Because this task must not read `.env*`, do not run the
  default Drizzle config.
- Preferred local generation path:
  1. Add a temporary no-env Drizzle config under `drizzle/**`.
  2. Run `drizzle-kit generate` against that config only.
  3. Review the generated SQL and metadata.
  4. Delete the temporary config before commit.
- Fallback path if local generation is blocked: hand-author the migration SQL and Drizzle metadata, preserving the existing
  `drizzle/meta/_journal.json` pattern.
- Do not run `drizzle-kit migrate`.
- Do not run `drizzle-kit push`.
- Do not access DB or row/private data.

## Rollback / Recovery Boundary

No migration is executed in this task. If the generated migration is later applied and must be rolled back before dependent
repository code exists, the recovery path is to drop the indexes, foreign keys, `organization_training_version` table, and
`organization_training_version_status` enum in reverse order in a separately approved DB rollback task. Production and
staging rollback remain out of scope.

## Files Allowed

- `src/db/schema/organization-training.ts`
- `src/db/schema/organization-training.test.ts`
- `src/db/schema/index.ts`
- `drizzle/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration.md`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no migration execution.
- No `drizzle-kit push`.
- No destructive database operation.
- No row/private data exposure.
- No route/service/repository/mapper/API runtime/contract/model/validator/UI changes.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer.
- No dependency, package, or lockfile changes.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No formal content write or formal target write.
- No PR and no force push.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration -Capability schemaMigration -Intent use_capability
npm.cmd run test:unit -- "src/db/schema/organization-training.test.ts"
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration
```
