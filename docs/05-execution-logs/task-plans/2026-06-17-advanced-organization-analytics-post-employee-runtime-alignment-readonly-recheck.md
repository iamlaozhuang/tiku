# Advanced organization analytics post employee runtime alignment readonly recheck plan

## Scope

- Task: `advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck`
- Branch: `codex/organization-analytics-post-employee-runtime-recheck`
- Approved action: readonly recheck, local validation, local commit, fast-forward merge to `master`, push to `origin/master`, merged branch cleanup, fetch prune, and next-work recommendation.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- Latest employee runtime alignment evidence and audit.
- Declared readonly source files in route/service/repository/mapper/contract/App Router entrypoints.

## Local State Check

- Baseline branch: `master`
- Baseline `HEAD`, `master`, and `origin/master`: `933be862caef80179fe6ce978ad514505acd8717`
- Local/remote `codex/*` refs before branch creation: none.
- Queue pending count before claim: `1`.

## Recheck Plan

1. Claim the pending readonly recheck task in project state and task queue.
2. Read the declared requirements, prior evidence/audit, and readonly source files.
3. Verify route/service/repository boundaries remain layered after employee runtime alignment:
   - App Router entrypoints stay thin and runtime-factory based.
   - Route handlers map through service/mapper contracts and do not expose scope internals.
   - Repository source readers provide typed aggregate-only and summary-only rows.
   - Tests preserve redaction assertions and injected runtime boundaries without real database execution.
4. Run the declared local validation commands.
5. Write evidence and audit. If no concrete gap is found, close the task with no new pending task; if a gap is found, seed exactly one scoped follow-up without modifying product code.
6. Commit, fast-forward merge to `master`, run post-merge validation/evidence, push, delete the merged short branch, fetch prune, and verify final repository state.

## Risk Controls

- No product source or test changes.
- No App Router entrypoint, route/runtime/service/repository, mapper, contract, validator, UI, schema, migration, drizzle, package, lockfile, dependency, provider/model, browser/e2e/dev-server, deployment, payment, external-service, PR, force push, quota/cost, or Cost Calibration Gate work.
- No real database connection or row/private data access.
- Evidence must stay summary-level and must not include public identifier inventories or private source data.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `npm.cmd run test:unit -- "src/server/services/organization-analytics-route.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-post-employee-runtime-alignment-readonly-recheck`
