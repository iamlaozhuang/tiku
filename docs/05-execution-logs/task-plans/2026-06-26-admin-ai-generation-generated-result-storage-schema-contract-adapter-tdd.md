# Task Plan: Admin AI Generation Generated Result Storage Schema Contract Adapter TDD

Task id: `admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd-2026-06-26`

Branch: `codex/admin-ai-result-storage-tdd-20260626`

Task kind: `implementation_tdd_schema_contract_adapter`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- `2026-06-23-advanced-ai-generation-scope-clarification`: backend admin AI generated content must remain outside
  formal `question`/`paper` until governed adoption.
- `2026-06-24-role-separated-mvp-requirement-alignment`: content/org admin AI entries are role-separated advanced
  surfaces, not Provider or final acceptance approval.
- `admin-ai-generation-generated-result-storage-approval-package-2026-06-26`: approves only source/schema/migration
  file, contract, adapter, and focused unit tests using fake normalized generated result fixtures.

## Requirement Mapping

- AI task domain: generated results attach to `ai_generation_task` by public task identity and redacted evidence fields.
- Organization AI generation: organization-owned generated result drafts are scoped by workspace, owner type, owner
  public id, and optional organization public id.
- Content admin AI generation: content generated result drafts stay in the platform content review domain.
- Formal content separation: generated result storage is draft/review holding only and must not write formal
  `question` or `paper`.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md`

## Conflict Check

No conflict found. Requirement SSOT requires generated content separation, and the approval package narrows this task to
local schema/migration file plus contract/adapter TDD. Provider calls, live DB validation, migration execution, route
smoke, and formal adoption remain outside this task.

## Implementation Plan

1. RED: add schema tests for `admin_ai_generation_result` table, enum, indexes, foreign key, and forbidden raw/formal
   columns.
2. RED: add contract/repository tests for fake normalized generated result draft storage, reuse, owner/workspace
   scoping, task attachment, and redaction.
3. RED: add DB adapter tests for insert values, task attachment update values, row mapping, and unsafe row rejection.
4. GREEN: add Drizzle schema and SQL migration file for `admin_ai_generation_result`.
5. GREEN: add model/contract/repository/DB adapter files.
6. Validate focused tests, lint, typecheck, formatting, and Module Run v2 hardening.
7. Record evidence/audit and update `project-state.yaml` / `task-queue.yaml`.

## Allowed Files

- `src/db/schema/ai-rag.ts`
- `src/db/schema/ai-rag.test.ts`
- `drizzle/20260626203000_add_admin_ai_generation_result.sql`
- `src/server/models/admin-ai-generation-result.ts`
- `src/server/contracts/admin-ai-generation-result-persistence-contract.ts`
- `src/server/repositories/admin-ai-generation-result-persistence-repository.ts`
- `src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts`
- `src/server/repositories/admin-ai-generation-result-persistence-db-adapter.ts`
- `src/server/repositories/admin-ai-generation-result-persistence-db-adapter.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`

## Explicit Blocks

- Migration execution, `drizzle-kit push`, live DB connection, direct SQL, route smoke, seed, account mutation, or DB
  write outside unit-test fakes.
- Provider/model call, Provider configuration, env/secret reads, Cost Calibration.
- Raw prompt, raw Provider payload, raw generated output, raw DB rows, API key, token, cookie, Authorization header,
  database URL, public identifier list, internal numeric id, or unpublished generated content in evidence.
- Formal `question` or `paper` write/adoption.
- Browser/dev-server/e2e, staging/prod, payment, external service, deployment, release readiness, final Pass.

## Validation Commands

- `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-db-adapter.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd-2026-06-26 -SkipRemoteAheadCheck`

Cost Calibration Gate remains blocked.
