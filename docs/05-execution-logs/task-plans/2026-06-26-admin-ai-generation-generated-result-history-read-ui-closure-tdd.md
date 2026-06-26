# Task Plan: Admin AI Generation Generated Result History Read UI Closure TDD

Task id: `admin-ai-generation-generated-result-history-read-ui-closure-tdd-2026-06-26`

Branch: `codex/admin-ai-generated-result-history-ui-20260626`

Task kind: `implementation_tdd`

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

## Requirement Decision Map

- Admin generated results may be surfaced only as redacted draft summaries tied to existing admin AI generation tasks.
- Content admin history remains scoped to the platform content review pool.
- Organization advanced admin history remains scoped to the current organization.
- Organization standard admin remains unavailable/denied.
- Formal `question` and `paper` writes remain blocked.
- Provider, Provider configuration, credentials, Cost Calibration, staging/prod, deployment, payment, external services,
  release readiness, and final Pass remain outside this task.

## Current Gap

The previous local route integration task persisted redacted generated-result draft summaries on admin AI generation
POST flows. The GET history/read contract and backend admin UI still expose task metadata only, so content/org admins
cannot see that a persisted redacted generated result summary exists.

## Allowed Scope

- Extend admin AI generation history DTOs with an optional redacted generated-result summary per task item.
- Update the admin local contract GET route to read `AdminAiGenerationResultPersistenceRepository.listDraftResults` and
  join results by `taskPublicId`.
- Update focused route unit tests for content and organization history readback.
- Update backend admin AI generation UI and component/unit tests to render persisted redacted generated result summaries.
- Update docs/state/evidence/audit for this task.

## Blocked Scope

- No Provider call, Provider configuration, credential/env read, `.env*`, raw prompt, raw output, raw provider payload,
  API key, token, cookie, Authorization header, or raw provider payload evidence.
- No schema, migration file, Drizzle metadata, migration execution, live DB connection, DB seed, account mutation, direct
  SQL, or raw DB row dump.
- No formal `question` or `paper` write/adoption.
- No package or lockfile change.
- No dev-server, browser runtime, Playwright/e2e, staging/prod, deployment, payment, external service, release
  readiness, or final Pass claim.

## TDD Plan

1. RED: add route tests proving content/org GET history returns only redacted generated-result summary fields and omits
   raw/sensitive fields.
2. RED: add UI tests proving content/org admin history renders persisted redacted generated-result summaries while not
   showing public id lists or raw content.
3. GREEN: add minimal DTO mapping and route join from result persistence to task history.
4. GREEN: render generated-result summary in `AdminAiGenerationEntryPage` history cards.
5. Validate with focused unit tests, typecheck, lint, scoped Prettier, `git diff --check`, and Module Run v2 hardening.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md src/server/contracts/admin-ai-generation-local-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md src/server/contracts/admin-ai-generation-local-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-generated-result-history-read-ui-closure-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-generated-result-history-read-ui-closure-tdd-2026-06-26 -SkipRemoteAheadCheck`
