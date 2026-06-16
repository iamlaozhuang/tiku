# Task Plan: Advanced Organization Analytics Repository Read Model Contract TDD

## Task

- Task id: `advanced-organization-analytics-repository-read-model-contract-tdd`
- Branch: `codex/organization-analytics-repository-contract-tdd`
- Baseline: `HEAD == master == origin/master == 4e248ec94afbf3a93fb827b0c36a5a195c306283`
- Task kind: local repository contract implementation
- User approval: current thread approval, `批准执行`

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-repository-read-model-boundary-readonly-audit.md`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`

## Scope

Allowed changes:

- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/repositories/organization-analytics-repository.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, and audit review.

Blocked:

- `.env*` read, output, summary, or modification.
- `@/db/schema`, `runtime-database`, Postgres adapters, DB commands, schema/migration, Drizzle files.
- Services, contracts, models, mappers, validators, routes, UI, scripts, dependencies, package files, lockfiles, e2e,
  provider/model calls, deploy, payment, and external services.

## TDD Plan

1. RED: create `src/server/repositories/organization-analytics-repository.test.ts` that imports the intended repository
   contract and proves the file/contract is missing.
2. GREEN: add `src/server/repositories/organization-analytics-repository.ts` with repository-owned types, injected
   gateway, and no DB/schema/runtime imports.
3. Verify repository methods:
   - trim and reject blank lookup identifiers before hitting gateway;
   - clone arrays and nested snapshots so returned summaries cannot mutate gateway rows;
   - expose summary-only rows for dashboard, employee statistics, formal learning, AI quota, and export readiness;
   - exclude numeric ids, employee answers, question bodies, standard answers, `analysis`, prompt text, provider payload,
     raw answer/model output, plaintext `redeem_code`, secret, token, DB URL, Authorization header, and generated export
     artifacts.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-repository-read-model-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-repository-read-model-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-repository-read-model-contract-tdd`
