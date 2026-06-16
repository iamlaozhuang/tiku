# Task Plan: Advanced Organization Analytics Repository Service Wiring Boundary Readonly Audit

## Task

- Task id: `advanced-organization-analytics-repository-service-wiring-boundary-readonly-audit`
- Branch: `codex/organization-analytics-service-boundary-audit`
- Baseline: `HEAD == master == origin/master == fb9ba9248c5f8dcc39424be487385f976f8b8b17`
- Scope: readonly boundary audit only. Decide whether `organization-analytics-service` can consume the injected-gateway repository contract without mapper/validator/schema/DB/runtime wiring, or whether a schema/data-source boundary task must come first.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Prior evidence and audit for `advanced-organization-analytics-repository-read-model-contract-readonly-recheck`

## Readonly Review Inputs

- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-repository-read-model-contract-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-repository-read-model-contract-readonly-recheck.md`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/repositories/organization-analytics-repository.test.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`
- `src/server/services/organization-analytics-service.ts`

## Approach

1. Confirm prior repository contract recheck findings.
2. Review service command inputs, access checks, output DTO construction, and model calls without editing product source.
3. Compare service command inputs against repository output methods and DTO/model shapes.
4. Decide whether the next task can be service-level injected repository consumption only, or whether schema/data-source boundary work must precede it.
5. Run only declared local validation commands and record redacted evidence.

## Command Safety

- Use only explicit file paths for reads and any text searches.
- Do not run repository-wide `rg`, `Select-String`, `Get-ChildItem -Recurse`, or wildcard scans for this task.
- Do not use PowerShell unescaped pipe patterns in search commands.

## Blocked Gates

- No `.env*` read/output/summary/modification.
- No implementation or product source/test source changes.
- No DB access, row/private data, schema/migration, Drizzle runtime adapter, `runtime-database`, mapper/validator/route/UI/runtime wiring, provider/model call, dependency change, e2e/browser/dev-server, quota/cost measurement, staging/prod/cloud/deploy/payment/external-service, PR, or force push.
- No exposure of real public id lists, employee answer bodies, question text, standard answers, `analysis`, item correctness, subjective answers, mistake details, raw prompts, provider payloads, raw answers, secrets, tokens, DB URLs, Authorization headers, generated export files, or download URLs.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-boundary-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-boundary-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-repository-service-wiring-boundary-readonly-audit`
