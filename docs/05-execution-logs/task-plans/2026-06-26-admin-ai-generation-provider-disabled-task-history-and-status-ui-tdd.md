# Task Plan: Admin AI Generation Provider-Disabled Task History And Status UI TDD

Task id: `admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd-2026-06-26`

Branch: `codex/admin-ai-provider-disabled-history-ui-20260626`

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
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Admin AI task status/history is allowed as redacted metadata under the AI task domain.
- Content admin AI generation must remain in an isolated review/draft boundary and must not write formal `question` or
  `paper` records.
- Organization advanced admin AI generation is organization-owned, requires advanced organization admin scope, and must
  deny or mark standard organization admins unavailable.
- The accepted Provider-disabled product closure decision selects metadata-only pending/status/history before generated
  result storage.
- Cost Calibration Gate, Provider execution, generated result storage, DB migration execution, staging/prod, payment,
  external service, deployment, release readiness, and final Pass remain blocked.

## Requirement Mapping

- AI task domain: add read-model/history surface that exposes status, timestamps, result visibility, evidence status,
  Provider-disabled state, and formal-write-blocked state without sensitive content.
- Content admin AI generation: show content-review scoped latest task and recent history for `content_admin` or
  `super_admin`.
- Organization admin AI generation: show organization-scoped latest task and recent history for `org_advanced_admin` or
  `super_admin`; keep `org_standard_admin` unavailable.
- Formal content separation: keep `resultPublicId: null`, `contentVisibility: summary_only`,
  `runtimeBridgeStatus: provider_call_blocked`, and formal `question`/`paper` writes blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- Existing focused source/test files for admin AI generation local contracts and task persistence.

## Conflict Check

No conflict found. Requirement SSOT and the latest decision package both point to Provider-disabled metadata-only
history/status closure. Execution logs are treated as evidence only and do not expand scope to Provider, generated
result storage, DB migration execution, or formal content writes.

## Allowed Scope

- Add redacted admin AI generation task history DTOs.
- Extend the existing admin task persistence repository port with a metadata-only list method.
- Add focused fake-gateway and route tests.
- Add `GET` handling for `content-ai-generation-requests` and `organization-ai-generation-requests`.
- Update the backend AI entry UI to load/show latest accepted task, recent history, loading/empty/error states, and
  Provider/Cost/formal-write blocked indicators.
- Update docs/state/evidence/audit for this task.

## Blocked Scope

- No Provider call, Provider configuration, credential read, `.env*`, raw prompt, raw output, raw provider payload, API
  key, token, cookie, Authorization header, or DB URL evidence.
- No generated result storage.
- No formal `question` or `paper` write.
- No schema, migration, migration execution, seed, account mutation, or live DB route smoke.
- No package or lockfile change.
- No dev-server, browser runtime, Playwright/e2e, staging/prod, deployment, payment, external service, release
  readiness, or final Pass claim.

## TDD Plan

1. Add RED route/repository tests for metadata-only history listing, owner scoping, redaction, and standard admin denial.
2. Add RED UI tests for initial history load, empty/error states, and refresh after POST.
3. Implement the smallest repository contract, route `GET`, API exports, and UI rendering needed to pass.
4. Run focused unit tests, lint, typecheck, scoped Prettier, `git diff --check`, and Module Run v2 hardening/readiness.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md src/server/contracts/admin-ai-generation-local-contract.ts src/server/contracts/admin-ai-generation-task-persistence-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/app/api/v1/content-ai-generation-requests/route.ts src/app/api/v1/organization-ai-generation-requests/route.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd.md src/server/contracts/admin-ai-generation-local-contract.ts src/server/contracts/admin-ai-generation-task-persistence-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-task-persistence-db-adapter.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/app/api/v1/content-ai-generation-requests/route.ts src/app/api/v1/organization-ai-generation-requests/route.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd-2026-06-26 -SkipRemoteAheadCheck`
