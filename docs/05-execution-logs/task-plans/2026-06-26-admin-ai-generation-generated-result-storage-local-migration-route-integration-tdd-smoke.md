# Task Plan: Admin AI Generation Generated Result Storage Local Migration Route Integration TDD Smoke

Task id: `admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke-2026-06-26`

Branch: `codex/admin-ai-result-storage-route-smoke-20260626`

Task kind: `implementation_tdd_local_migration_route_smoke`

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
- `docs/01-requirements/modules/06-admin-ops.md`
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

- Advanced AI generation scope requires content admin and advanced organization admin AI question and AI `paper`
  entries to remain discoverable and governed.
- AI task domain requires trackable task state and redacted evidence without exposing raw AI input, output, Provider
  payload, secret, token, or raw task content.
- Formal content separation requires generated output to remain outside formal `question`, `paper`, `practice`,
  `mock_exam`, `exam_report`, and `mistake_book` unless a later adoption task is approved.
- Content admin AI scope selects isolated reviewable draft/suggestion storage before any formal adoption.
- The previous local migration and route integration approval package approves this task only for local dev migration
  execution, route/service integration, focused tests, and capped local route smoke.

## Requirement Mapping

- Content admin route: persist a redacted generated result draft summary for content AI question or AI `paper` local
  contract requests.
- Organization admin route: persist a redacted generated result draft summary for organization-owned AI question or AI
  `paper` local contract requests.
- AI task/result persistence: keep `ai_generation_task` as task identity/status/result summary anchor and use
  `admin_ai_generation_result` as the isolated generated-result companion table.
- Provider boundary: preserve `runtimeStatus: local_contract_only` and `runtimeBridgeStatus: provider_call_blocked`.
- Formal content boundary: keep `questionWriteStatus` and `paperWriteStatus` as
  `blocked_without_follow_up_task`.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-local-migration-and-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-schema-contract-adapter-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-local-db-read-history-route-smoke-execution.md`

## Conflict Check

No conflict found. The requirement SSOT allows isolated draft/result storage and forbids formal content writes. The
approval package narrows this task to local migration execution, route integration, focused unit tests, and capped local
route smoke. Provider/Cost, staging/prod, payment, external service, deployment, release readiness, and final Pass
remain outside this task.

## Allowed Scope

- Apply only `drizzle/20260626203000_add_admin_ai_generation_result.sql` through the reviewed local Drizzle migrate
  path.
- Do not generate new migrations and do not run `drizzle-kit push`.
- Add injected generated result persistence to the admin AI generation local contract route/service.
- Keep content and organization route handlers on the existing handler factory.
- Add focused unit tests for generated result persistence wiring and redaction.
- Run a direct local route smoke with at most four route requests total: content POST plus optional GET, organization
  POST plus optional GET.

## Blocked Scope

- No Provider/model call, Provider configuration, env/secret file read by Codex, raw prompt, raw generated output, raw
  Provider payload, raw DB row dump, token, cookie, Authorization header, database URL, or credential evidence.
- No formal `question` or `paper` write, adoption, publish, or draft conversion.
- No seed, account mutation, direct SQL, destructive DB operation, browser runtime, Playwright e2e, dev-server
  interaction, dependency/package/lockfile change, staging/prod/cloud/deploy, payment, external service, PR, force push,
  release readiness, or final Pass.

## TDD Plan

1. RED: add route unit test proving successful content/org POST calls invoke an injected generated result persistence
   repository with a redacted local-contract draft summary and return only safe summary fields.
2. GREEN: add the smallest route/service integration and response contract extension needed to pass the test.
3. Run focused unit tests.
4. Run schema/local DB capability gates, then `npx.cmd drizzle-kit migrate`.
5. Run capped direct route smoke only if migration and focused tests pass.
6. Record redacted evidence and self-audit.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke-2026-06-26 -Capability schemaMigration -Intent use_capability`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke-2026-06-26 -Capability localDockerDatabase -Intent use_capability`
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-result-persistence-db-adapter.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/db/schema/ai-rag.test.ts`
- `npx.cmd drizzle-kit migrate`
- `node_modules\.bin\tsx.cmd - < redacted inline direct route smoke harness`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-generated-result-storage-local-migration-route-integration-tdd-smoke-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if local capability gates fail.
- Stop if Drizzle migration needs a new migration, `drizzle-kit push`, direct SQL, destructive operation, staging/prod,
  or raw DB evidence.
- Stop if focused unit tests fail after three repair attempts.
- Stop if local route smoke needs credentials/session material not provided through safe in-memory test harness.
- Stop if Provider, formal adoption, dependency, e2e/browser, env/secret, payment, external-service, deployment, or
  release readiness work becomes necessary.
