# Task Plan: Advanced Organization Analytics Repository Read Model Boundary Readonly Audit

## Task

- Task id: `advanced-organization-analytics-repository-read-model-boundary-readonly-audit`
- Branch: `codex/organization-analytics-repository-boundary-audit`
- Baseline: `HEAD == master == origin/master == 1a3b650d0b373efddcab4f63c81539c5d050fb51`
- Task kind: docs-only readonly audit
- User approval: current thread approval, `批准执行`

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/05-execution-logs/evidence/batch-185-organization-analytics-aggregate-only-organization-metrics.md`
- `docs/05-execution-logs/evidence/batch-186-organization-analytics-privacy-preserving-employee-statistics.md`
- `docs/05-execution-logs/evidence/batch-187-organization-analytics-export-readiness-contracts-without-object-st.md`
- `docs/05-execution-logs/evidence/batch-188-organization-analytics-audit-log-redacted-reference.md`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`
- `src/server/services/organization-analytics-service.ts`
- Existing repository, mapper, and validator patterns under `src/server/repositories/**`,
  `src/server/mappers/**`, and `src/server/validators/**`.

## Scope

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Readonly source review only:

- Current organization analytics contracts, models, and services.
- Existing repository, mapper, and validator patterns.

Blocked:

- Product source or test source edits.
- `.env*` read, output, summary, or modification.
- DB access, row/private data, schema/migration, Drizzle, provider/model calls, quota/cost measurement, dev server,
  Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, dependency changes, PR, and force push.

## Audit Questions

1. Can the organization analytics repository read-model proceed as a TDD contract task without schema changes or DB
   execution?
2. What must remain blocked until a later schema/data-source task?
3. What exact next task should be seeded if the boundary is safe?

## Expected Decision

The expected conservative decision is:

- A repository read-model contract TDD task may proceed next if it is limited to repository-owned ports, row/summary
  types, injected gateway tests, and redaction assertions.
- A real DB-backed Postgres implementation, schema inventory, migration, and row-level data-source execution remain
  blocked until a later explicit schema/data-source boundary task.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-repository-read-model-boundary-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-repository-read-model-boundary-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-repository-read-model-boundary-readonly-audit`
