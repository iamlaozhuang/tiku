# Evidence: advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit`
- Task kind: readonly audit.
- Batch range: single user-approved readonly inventory task after
  `advanced-organization-training-publish-version-persistence-boundary-planning`.
- Branch: `codex/advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit`
- Baseline: `master == origin/master == b970e41cce04514b9b60a061e189e11326953de1`
- Commit: `b970e41cce04514b9b60a061e189e11326953de1` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit user approval by saying `批准执行` after the next-step recommendation.
- localFullLoopGate: scoped unit test set, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to readonly inventory plus docs/state/logs.
- nextModuleRunCandidate: `advanced-organization-training-publish-version-persistence-schema-migration`.
- Cost Calibration Gate remains blocked.
- result: pass_readonly_inventory_schema_migration_required

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-seeding.md`
- `src/db/schema/**`
- `src/server/repositories/**`
- `src/server/mappers/**`
- `src/app/api/v1/**`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## RED / GREEN

RED: not applicable for this readonly audit. No product test or implementation was introduced.

GREEN: not applicable for product behavior. The audit records a local inventory conclusion and preserves all blocked gates.

## Readiness Gate

```powershell
git switch master
git fetch --prune origin
git status --short --branch
git rev-parse HEAD; git rev-parse master; git rev-parse origin/master
git branch --list "codex/*"
git branch -r --list "origin/codex/*"
```

Result: PASS before branch creation.

- `HEAD == master == origin/master == b970e41cce04514b9b60a061e189e11326953de1`.
- Worktree was clean.
- No local or remote `codex/*` branches were present.

## Schema Inventory

Command:

```powershell
rg --files src\db\schema -g "!**/.env*"
```

Result:

- Current schema files are `auth.ts`, `ai-rag.ts`, `paper.ts`, `student-experience.ts`, `system.ts`, and tests/index.
- `src/db/schema/index.ts` exports only `auth`, `ai-rag`, `paper`, `student-experience`, and `system`.

Command:

```powershell
rg -n "export const .* = pgTable\(" src\db\schema -g "*.ts" -g "!**/.env*"
```

Result:

- Existing schema tables include auth/organization/authorization tables, formal paper/question tables, formal
  practice/mock_exam/answer_record/exam_report/mistake_book tables, AI/RAG tables, and audit_log.
- No `organization_training_*` table is defined.
- No isolated durable table for `organization_training_version`, publish scope snapshot, organization training question
  snapshot, takedown metadata, or internal `org_auth` lineage was found.

Relevant current schema facts:

- `src/db/schema/ai-rag.ts` defines `aiGenerationTaskTypeValues`, including `organization_training_generation`.
- `src/db/schema/ai-rag.ts` defines `ai_generation_task` with task metadata and authorization/owner/quota fields.
- `src/db/schema/ai-rag.ts` defines `personal_ai_generation_result`, but this is personal AI generation result storage, not
  organization training publish-version storage.
- `src/db/schema/paper.ts` defines formal `question`, `paper`, `paper_question`, and related formal content tables.
- `src/db/schema/student-experience.ts` defines formal `practice`, `mock_exam`, `answer_record`, `exam_report`, and
  `mistake_book`.

## Repository / Mapper / Route Inventory

Command:

```powershell
Test-Path src\server\repositories\organization-training-repository.ts
Test-Path src\server\mappers\organization-training-mapper.ts
Test-Path src\server\services\organization-training-route.ts
Test-Path src\app\api\v1\organization-trainings
```

Result:

- All four exact path checks returned `False`.

Command:

```powershell
rg -n "organizationTraining|organization_training|PublishedVersion|publishVersion|trainingVersion" src\server\repositories src\server\mappers src\app\api\v1 -g "!**/.env*"
```

Result:

- No organization training repository, mapper, or route adapter was found.
- Matches are limited to personal AI generation files that explicitly exclude or separate `organization_training_generation`;
  they are not organization training publish-version persistence.

Command:

```powershell
rg -n "organization-trainings|organization_training|organizationTraining|trainingVersion|publishVersion" src\app\api\v1 -g "route.ts" -g "!**/.env*"
```

Result:

- No REST route for `/api/v1/organization-trainings` exists.

## Service / Contract Boundary Inventory

- `src/server/services/organization-training-service.ts` defines `OrganizationTrainingPublishedVersionWrite` as the internal
  service-to-store write boundary.
- The write boundary carries `contentType: "organization_training_version"`, organization owner/quota owner fields,
  `authorizationSource: "org_auth"`, `authorizationPublicId`, source draft id, organization id, publish scope snapshot,
  content metadata, score summary, question type summary, lifecycle status, publish time, and takedown fields.
- `src/server/contracts/organization-training-contract.ts` defines `OrganizationTrainingPublishedVersionDto` as the public
  published-version DTO.
- The public DTO includes public version metadata and lifecycle fields, but omits `authorizationSource` and
  `authorizationPublicId`.
- Existing tests cover the service store boundary, internal lineage presence at write time, public DTO non-exposure, and
  non-leakage of raw/provider-like fields without calling provider/model or accessing DB.

## Decision

Storage changes are required before repository/mapper implementation.

Reason: the current code has a service-level injected store contract and public DTO boundary, but no isolated durable schema
table, repository, mapper, or REST route for organization training publish-version persistence. Reusing formal `question`,
`paper`, `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` storage would violate the organization
training isolation plan and formal content separation boundary.

## Recommended First Implementation Task

Recommended next task:

`advanced-organization-training-publish-version-persistence-schema-migration`

Required gate for that future task:

- Fresh user approval because schema/migration changes are high risk.
- Allowed files must name the exact `src/db/schema/**` and `drizzle/**` paths.
- Run the local schema/migration capability gate before any schema or migration edit.
- Include migration plan, rollback/recovery statement, and redacted evidence.
- Keep `.env*`, DB URL, row/private data, provider/model, package/lockfile/dependency, staging/prod/cloud/deploy/payment,
  external-service, PR, force push, formal content write, and formal target write blocked.

Minimum expected schema decision for the future task:

- Introduce isolated organization training publish-version storage before repository/mapper TDD.
- Persist internal authorization lineage internally.
- Preserve public DTO non-exposure for `authorizationSource` and `authorizationPublicId`.
- Preserve publish scope snapshot and lifecycle/takedown metadata.
- Do not write organization training content into formal learning tables.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
```

Result: pending before closeout.

Updated result: PASS on 2026-06-15.

- Vitest reported `Test Files 3 passed (3)`.
- Vitest reported `Tests 21 passed (21)`.
- Exit code: 0.

```powershell
git diff --check
```

Result: pending before closeout.

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
  `codex/advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit`.
- Reported changed tracked files were limited to the two state files before staging.
- Reported the three untracked execution-log files for this readonly audit.
- Reported no commits ahead of `origin/master`.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit
```

Result: pending before closeout.

Updated result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 5`.
- Scope scan reported `OK_SCOPE` for the two state files, task plan, evidence, and audit review.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit
```

Result: pending before closeout.

Initial result: FAIL on 2026-06-15.

- Failure findings:
  - `HARD_BLOCK_MISSING_THREAD_ROLLOVER_DECISION`
  - `HARD_BLOCK_MISSING_NEXT_MODULE_RUN_CANDIDATE`
  - `HARD_BLOCK_MISSING_BATCH_EVIDENCE`
  - `HARD_BLOCK_MISSING_BATCH_COMMIT_EVIDENCE`
- Root cause: evidence recorded validation commands and inventory findings, but missed several strict Module Run v2 evidence
  anchors required by the closeout script.
- Repair: added batch range, commit baseline, thread rollover decision, and next module run candidate anchors to this evidence
  file before rerunning closeout.

Updated result: PASS on 2026-06-15 after strict evidence anchor repair.

- `moduleCloseoutMode: hard_block`.
- Evidence and audit paths were accepted.
- Required validation commands were recorded.
- Thread rollover decision and next module run candidate were accepted.
- Module Run v2 strict evidence anchors passed.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit
```

Result: pending after local commit.

Updated result: PASS on 2026-06-15 after local closeout commit.

- `prePushMode: hard_block`.
- Git readiness passed for the short branch.
- `master`, `origin/master`, state master, and state origin master were aligned at
  `b970e41cce04514b9b60a061e189e11326953de1`.
- Evidence and audit paths were accepted.
- Exit code: 0.

## needs_recheck

- The next implementation task must define the exact isolated schema shape before any repository/mapper implementation.
- Repository/mapper TDD must remain blocked until storage exists or a future task proves an existing isolated storage surface is
  sufficient.
- Route adapter work must remain blocked until service/repository/mapper persistence is verified.

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No migration generation or execution.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, product source, route, repository, mapper, API runtime, UI,
  takedown, copy-to-new-draft, employee answer, analytics, formal content write, or formal target write changes.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
