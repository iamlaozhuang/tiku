# Admin AI Generation Route Provider Disabled Focused Smoke Plan

Task ID: `admin-ai-generation-route-provider-disabled-focused-smoke-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd.md`

## Scope

This task is a docs/state plus local focused validation task. It does not modify product source, tests, DB, schema, migration, seed, package/lockfile, or env files.

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-route-provider-disabled-focused-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-provider-disabled-focused-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-route-provider-disabled-focused-smoke.md`

Blocked actions:

- Provider calls, Provider credential reads, cost calibration, live DB connections, DB writes, schema/migration changes, browser/dev-server/e2e runtime, formal question/paper writes, staging/prod, payment, external-service, deployment, and release readiness.

## Validation Plan

1. Run focused route provider-disabled tests covering content and organization admin local contract POST/GET paths.
2. Run admin runtime bridge and shared route-integrated provider primitive tests to keep adapter behavior anchored.
3. Run typecheck, lint, scoped Prettier, `git diff --check`, and Module Run v2 closeout gates.

## Validation Commands

- `npx.cmd vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npx.cmd prettier --write --ignore-unknown <changed-files>`
- `npx.cmd prettier --check --ignore-unknown <changed-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-route-provider-disabled-focused-smoke-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-route-provider-disabled-focused-smoke-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop before continuing if validation requires Provider credentials, Provider calls, env edits, live DB access, schema/migration changes, browser/dev-server/e2e runtime, formal generated content adoption, staging/prod, payment, external-service, deployment, or release readiness work.
