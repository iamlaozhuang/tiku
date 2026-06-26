# Task Plan: Admin AI Generation Generated Result Storage Migration Journal Alignment Route Integration TDD Smoke Retry

Task id: `admin-ai-generation-generated-result-storage-migration-journal-alignment-route-integration-tdd-smoke-retry-2026-06-26`

Branch: `codex/admin-ai-result-storage-journal-retry-20260626`

Task kind: `implementation_tdd_local_migration_route_smoke_retry`

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

- Advanced AI generation can create trackable task/status evidence, but must not write formal `question`, `paper`,
  `practice`, `mock_exam`, `exam_report`, or `mistake_book` records.
- Content admin and organization advanced admin AI generation entries are approved as local contract workflows while
  Provider execution remains separately gated.
- Generated result storage for this task is limited to a redacted local-contract summary in
  `admin_ai_generation_result`.
- Cost Calibration Gate, Provider execution, staging/prod, payment, external service, release readiness, and final Pass
  remain blocked.

## Requirement Mapping

- `admin_ai_generation_result` records only draft generated result summaries tied to `ai_generation_task`.
- Route POST must remain `runtimeStatus: local_contract_only` and `runtimeBridgeStatus: provider_call_blocked`.
- Route response/history may expose redacted task/result summary fields, not raw prompt, raw generated output, raw DB
  rows, Provider payload, secret, token, cookie, Authorization header, or database URL.
- Formal `question`/`paper` write status must stay `blocked_without_follow_up_task`.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-generated-result-storage-migration-journal-alignment-and-route-smoke-retry-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`

## Conflict Check

No conflict found. The approved package narrows this task to an existing reviewed SQL migration, Drizzle metadata/journal
alignment, local migrate, route integration TDD, and a capped local direct route smoke retry.

## Allowed Scope

- Add missing Drizzle metadata only for `20260626203000_add_admin_ai_generation_result`:
  - `drizzle/meta/_journal.json`
  - `drizzle/meta/20260626203000_snapshot.json`
- Reapply route/service TDD integration for content and organization admin local contract POST flows to call
  `AdminAiGenerationResultPersistenceRepository`.
- Update focused route contract/test surfaces only as needed for redacted generated result summary persistence.
- Run local capability gates, focused unit tests, local `npx.cmd drizzle-kit migrate`, and at most four direct local route
  requests.
- Update task plan, evidence, audit review, project state, and task queue.

## Blocked Scope

- No SQL migration semantic change and no new SQL migration generation.
- No `drizzle-kit push`.
- No direct SQL, destructive DB operation, raw DB row dump, seed, or account mutation.
- No `.env*` file read/edit by Codex and no credential value in evidence.
- No Provider/model call, Provider configuration, or Cost Calibration.
- No formal `question` or `paper` write/adoption/publish.
- No browser, Playwright e2e, dev server, screenshots, traces, staging/prod/cloud/deploy, payment, external service,
  release readiness, or final Pass.

## TDD Plan

1. Add focused route tests that fail until the admin route calls generated result persistence after task persistence.
2. Implement the smallest route/service change:
   - inject/default `AdminAiGenerationResultPersistenceRepository`;
   - create a redacted local-contract result summary after task persistence;
   - update response `resultState`, `taskPersistence`, and a new generated-result summary without raw content;
   - preserve Provider disabled and formal content blocked fields.
3. Keep repository/adapter behavior unchanged unless tests reveal a scoped integration bug.

## Migration Plan

1. Add `_journal.json` entry for tag `20260626203000_add_admin_ai_generation_result`.
2. Add matching snapshot file that extends `20260626134500_snapshot.json` with the already reviewed
   `admin_ai_generation_result` enum/table metadata.
3. Prove by file check that the journal tag exists and the snapshot exists.
4. Run `npx.cmd drizzle-kit migrate` locally only after capability gates and metadata check pass.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId admin-ai-generation-generated-result-storage-migration-journal-alignment-route-integration-tdd-smoke-retry-2026-06-26 -Capability schemaMigration -Intent use_capability`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId admin-ai-generation-generated-result-storage-migration-journal-alignment-route-integration-tdd-smoke-retry-2026-06-26 -Capability localDockerDatabase -Intent use_capability`
- RED then GREEN: `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-result-persistence-db-adapter.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/db/schema/ai-rag.test.ts`
- file-based Drizzle metadata check for journal tag and snapshot presence
- `npx.cmd drizzle-kit migrate`
- direct local route smoke harness with maximum four route requests
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- scoped `npx.cmd prettier --write --ignore-unknown ...`
- scoped `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- Module Run v2 pre-commit hardening and pre-push readiness

## Stop Conditions

- Metadata alignment requires changing reviewed SQL, generating a new SQL migration, direct SQL, or `drizzle-kit push`.
- Capability gate fails.
- Local migrate fails.
- Focused tests fail after two repair attempts.
- Content route smoke fails; stop without organization smoke.
- Organization route smoke fails; stop without retry beyond the cap.
- Any need appears for Provider, env/secret value, formal content adoption, staging/prod, payment, external service,
  dependency, destructive DB, release readiness, or final Pass.
