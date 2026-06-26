# Admin AI Generation Route Runtime Bridge Provider Disabled Integration TDD Plan

Task ID: `admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-shared-runtime-bridge-contract-tdd.md`

## Requirement Mapping

- Content admin and organization advanced admin AI generation routes must continue to return local contract results while Provider execution is disabled.
- The route must now consume the admin runtime bridge adapter instead of the personal Provider bridge default outcome.
- Runtime bridge context must include route/workflow identity anchors: request, task, result, workspace, generation kind, owner, and organization context.
- Formal `question` and `paper` writes remain blocked.
- Provider calls, credential reads, cost calibration, staging/prod, payment, external-service, deployment, and release readiness remain blocked.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd.md`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`

Read-only references:

- `src/server/contracts/admin-ai-generation-runtime-bridge-contract.ts`
- `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/contracts/admin-ai-generation-task-persistence-contract.ts`
- `src/server/contracts/admin-ai-generation-result-persistence-contract.ts`
- `src/server/services/route-integrated-provider-execution-service.ts`

Blocked files and actions:

- `.env*`, package/lockfile files, DB schema, migrations, seed files, scripts, e2e/browser artifacts, staging/prod configs.
- Provider credential reads, Provider calls, cost calibration, live DB connections, route smoke, browser/dev-server/e2e runtime, formal content writes, deployment/release readiness.

## TDD Plan

1. RED: assert the admin route's default runtime bridge exposes the admin provider-disabled blocked reasons, including provider configuration read blocked.
2. RED: assert injected provider-disabled diagnostics receive admin runtime bridge route context: `requestPublicId`, `taskPublicId`, `resultPublicId`, `ownerType`, `ownerPublicId`, `organizationPublicId`, `workspace`, and `generationKind`.
3. GREEN: wire `admin-ai-generation-local-contract-route` to `buildAdminAiGenerationRuntimeBridgeReadModel`, keeping route output contract unchanged and provider-disabled.
4. GREEN: compute the request/result IDs before runtime bridge resolution so the bridge context and persistence share the same anchors.
5. REFACTOR: keep the adapter narrow; do not expose Provider execution, credentials, or formal content writes.

## Validation Commands

- RED focused command: `npx.cmd vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts -t "runtime bridge"`
- GREEN focused command: `npx.cmd vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npx.cmd prettier --write --ignore-unknown <changed-files>`
- `npx.cmd prettier --check --ignore-unknown <changed-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop before continuing if the work requires Provider credentials, real Provider execution, env edits, schema/migration changes, live DB access, browser/dev-server/e2e runtime, formal generated content adoption, staging/prod, payment, external-service, deployment, or release readiness work.
