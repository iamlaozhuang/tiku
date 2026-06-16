# Evidence: advanced-organization-training-publish-version-persistence-schema-migration

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-persistence-schema-migration`
- Task kind: gated local schema migration.
- Batch range: single fresh-approved schema/migration task after
  `advanced-organization-training-publish-version-persistence-schema-migration-seeding`.
- Branch: `codex/advanced-organization-training-publish-version-persistence-schema-migration`
- Baseline: `master == origin/master == fafed61d93e1c15f01f21e0c5e87a97636ddbef1`
- Commit: `fafed61d93e1c15f01f21e0c5e87a97636ddbef1` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit user approval by saying `批准执行` after the next-step recommendation.
- localFullLoopGate: local capability gate, schema RED/GREEN test, scoped organization training service tests, diff check,
  lint, typecheck, GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to schema/migration files plus docs/state/logs.
- nextModuleRunCandidate: `advanced-organization-training-publish-version-persistence-repository-mapper-tdd-seeding`.
- Cost Calibration Gate remains blocked.
- result: pass_gated_schema_migration_generated_no_db_execution

## Scope Reviewed

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
- `src/db/schema/ai-rag.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/paper.ts`
- `src/db/schema/student-experience.ts`
- `src/db/schema/index.ts`
- `src/db/schema/ai-rag.test.ts`
- `src/db/schema/auth.test.ts`
- `drizzle/20260613074823_add_personal_ai_generation_result.sql`
- `drizzle/20260613081008_harden_personal_ai_generation_result_fk_name.sql`
- `drizzle/meta/_journal.json`
- `drizzle.config.ts`

## Readiness Gate

```powershell
git switch master
git fetch --prune origin
git status --short --branch
git rev-parse HEAD
git rev-parse master
git rev-parse origin/master
git branch --list "codex/*"
git branch -r --list "origin/codex/*"
```

Result: PASS before branch creation.

- `HEAD == master == origin/master == fafed61d93e1c15f01f21e0c5e87a97636ddbef1`.
- Worktree was clean.
- No local or remote `codex/*` branches were present.

## Migration Plan

- Add `organization_training_version_status` enum.
- Add isolated `organization_training_version` table.
- Store internal `org_auth` lineage with `org_auth_id`, `authorization_source`, and `authorization_public_id`.
- Store public metadata and snapshots needed by the current service write boundary.
- Keep formal learning tables untouched.
- Do not run default `drizzle.config.ts` because it reads `.env.local` when present.
- Do not run migrate, push, DB access, or row reads.

## Migration Evidence

Command:

```powershell
npm.cmd exec drizzle-kit generate -- --config drizzle/no-env-generate.config.ts --name add_organization_training_publish_version
```

Result: PASS on 2026-06-15.

- Used a temporary no-env config under `drizzle/**` to avoid the default `drizzle.config.ts` `.env.local` read path.
- Generated SQL migration:
  `drizzle/20260615193737_add_organization_training_publish_version.sql`.
- Generated metadata snapshot:
  `drizzle/meta/20260615193737_snapshot.json`.
- Updated `drizzle/meta/_journal.json`.
- Removed the temporary no-env config before closeout.
- No DB connection, migration execution, `drizzle-kit push`, row read, DB URL, or `.env*` read was performed.

Generated SQL summary:

- Creates `organization_training_version_status` enum with `published` and `taken_down`.
- Creates `organization_training_version`.
- Adds named FKs:
  - `fk_organization_training_version_organization`
  - `fk_organization_training_version_org_auth`
- Adds named public-id, lineage, lifecycle, and scope indexes.
- Adds no formal learning target columns and no provider/raw prompt/raw answer columns.

## Rollback / Recovery Boundary

No migration is executed in this task. If a later approved local DB task applies the migration and needs rollback before
dependent repository code exists, recovery is a separately approved reverse migration that drops indexes, foreign keys,
`organization_training_version`, and `organization_training_version_status` in reverse order. Staging/prod rollback is out
of scope.

## RED / GREEN

RED: PASS on 2026-06-15.

```powershell
npm.cmd run test:unit -- "src/db/schema/organization-training.test.ts"
```

Expected RED result: the schema test failed before implementation because `organizationTrainingVersionStatusValues` and
`organizationTrainingVersion` were not exported from `src/db/schema/index.ts`.

- Vitest reported `Test Files 1 failed (1)`.
- Vitest reported `Tests 4 failed (4)`.
- First failure: expected `organizationTrainingVersionStatusValues` to equal `["published", "taken_down"]`, received
  `undefined`.
- Subsequent failures: expected `organizationTrainingVersion` to be defined.
- Exit code: 1.

GREEN: PASS on 2026-06-15.

```powershell
npm.cmd run test:unit -- "src/db/schema/organization-training.test.ts"
```

- Vitest reported `Test Files 1 passed (1)`.
- Vitest reported `Tests 4 passed (4)`.
- Exit code: 0.

## Validation

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration -Capability schemaMigration -Intent use_capability
```

Result: pending before schema edits.

Updated result: PASS on 2026-06-15 before schema edits.

- `capabilityState: approved_migration_plan`.
- `localCapabilityDecision: capability_ready`.
- `adapterAction: schema_migration_plan_ready_no_execution`.
- Blocked adapter actions remained `drizzle_push`, `destructive_data_operation`, and `staging_prod_connection`.
- Cost Calibration Gate remains blocked.
- Exit code: 0.

```powershell
npm.cmd run test:unit -- "src/db/schema/organization-training.test.ts"
```

RED result: PASS on 2026-06-15 before implementation.

- Vitest reported `Test Files 1 failed (1)`.
- Vitest reported `Tests 4 failed (4)`.
- Failure reason matched missing schema exports.
- Exit code: 1.

Updated GREEN result: PASS on 2026-06-15.

- Vitest reported `Test Files 1 passed (1)`.
- Vitest reported `Tests 4 passed (4)`.
- Exit code: 0.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
```

Result: pending before closeout.

Updated result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 11`.
- Scope scan accepted docs/state/log files, `src/db/schema/**`, and `drizzle/**` files.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

Updated result: PASS on 2026-06-15.

- Vitest reported `Test Files 3 passed (3)`.
- Vitest reported `Tests 21 passed (21)`.
- Exit code: 0.

```powershell
git diff --check
```

Result: pending before closeout.

Updated result: PASS on 2026-06-15.

- `moduleCloseoutMode: hard_block`.
- Evidence and audit paths were accepted.
- Required validation commands were recorded.
- Thread rollover decision and next module run candidate were accepted.
- Module Run v2 strict evidence anchors passed.
- Exit code: 0.

Updated result: PASS on 2026-06-15. No whitespace errors were reported.

- Exit code: 0.

```powershell
npm.cmd run lint
```

Result: pending before closeout.

Updated result: PASS on 2026-06-15.

- `eslint` completed without reported errors.
- Exit code: 0.

```powershell
npm.cmd run typecheck
```

Result: pending before closeout.

Updated result: PASS on 2026-06-15.

- `tsc --noEmit` completed without reported errors.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pending before closeout.

Updated result: PASS on 2026-06-15.

- Reported current branch:
  `codex/advanced-organization-training-publish-version-persistence-schema-migration`.
- Reported tracked changes in docs/state, `drizzle/meta/_journal.json`, and `src/db/schema/index.ts`.
- Reported untracked task logs, schema files, migration SQL, and migration snapshot.
- Reported no commits ahead of `origin/master`.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration
```

Result: pending before closeout.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration
```

Result: pending before closeout.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-migration
```

Updated result: PASS on 2026-06-15 after local commit.

- `prePushMode: hard_block`.
- Evidence and audit paths were accepted.
- Git readiness reported `master`, `origin/master`, `stateMaster`, and `stateOriginMaster` aligned at
  `fafed61d93e1c15f01f21e0c5e87a97636ddbef1`.
- Remote-ahead check was skipped because the short branch has no upstream before merge.
- Pre-push readiness passed.
- Exit code: 0.

## needs_recheck

- Repository/mapper TDD remains blocked until this schema task closes.
- Route/UI/service behavior remains blocked.
- DB migration execution remains blocked.

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No migration execution.
- No `drizzle-kit push`.
- No destructive database operation.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No route, service, repository, mapper, API runtime, contract, model, validator, UI, package, lockfile, dependency, formal
  content write, or formal target write changes.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
