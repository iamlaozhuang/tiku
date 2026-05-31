# Phase 21 Tail AI Scoring Retry Persistence Design Evidence

**Task id:** `phase-21-tail-ai-scoring-retry-persistence-design`

**Branch:** `codex/phase-21-tail-ai-scoring-retry-persistence-design`

## Summary

- Result: pass, pending merge and push closeout.
- Scope: docs_only.
- Changed surfaces: Phase 21 contract, task plan, evidence, project state, and task queue.
- Gates: readiness pass, git inventory pass, naming pass, diff check pass, prettier check pass, quality gate pass.
- Forbidden scope (`forbiddenScope`): no env, dependency, schema, migration, source, tests, e2e, scripts, staging, prod, cloud, deploy, real provider, destructive data, or force-push work.
- Residual gaps (`residualGaps`): implementation remains blocked until explicit `database_migration` approval.

## Startup Recovery

- Current branch before task branch: `master`.
- `master` status before task branch: clean and aligned with `origin/master`.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- `master` and `origin/master` SHA before task branch: `c38f36c4004a8e31fb542aef8bda7d16ea010148`.
- Local short-lived branches before task branch: none.
- Worktrees before task branch: only `D:/tiku`.
- Phase 20 status count: `50 closed + 2 blocked`.
- Current eligible task: `phase-21-tail-ai-scoring-retry-persistence-design`, because it is `pending` and depends only on closed `phase-20-closeout-phase-21-seeding`.

## Claim Evidence

| Command                                                                                                                                                                | Result | Notes                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git switch -c codex/phase-21-tail-ai-scoring-retry-persistence-design`                                                                                                | pass   | Created short-lived branch from clean `master`.                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-21-tail-ai-scoring-retry-persistence-design` | pass   | Script passed. It did not expand YAML anchors for allowed files or validation commands, so manual allowed-scope enforcement follows `phase21_tail_docs_allowed_files`. |

## Design Summary

The Phase 21 contract now records two storage candidates:

- Candidate A: additive `answer_record` fields for current retry state.
- Candidate B: dedicated `ai_scoring_attempt` structure for attempt-level retry history.

Recommendation: prefer Candidate B for implementation because durable retry persistence needs auditability and concurrency proof. Candidate A remains acceptable only if the human owner explicitly chooses a smaller MVP surface and accepts losing attempt-level history.

## Approval Checklist For Future Implementation

Implementation remains blocked until evidence records:

- explicit human approval for `database_migration`;
- selected storage design and exact table/field names;
- migration generation command and secret-safe environment handling plan;
- data preservation and backfill rule for existing `answer_record` rows;
- rollback plan for dev, staging, and prod boundaries;
- validation commands;
- explicit statement that destructive migration, force schema push, staging/prod work, real provider work, source/test/e2e changes outside the approved implementation task, and force push remain forbidden.

## Data Retention And Redaction

- Persist only redaction-safe retry metadata.
- Do not store raw prompts, raw student answers, raw model responses, raw provider payloads, Authorization headers, API keys, database URLs, full papers, or customer/customer-like private data.
- Retry metadata follows the related `answer_record` and `exam_report` retention boundary unless a later approved retention task changes it.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                                                                                                                     | Result | Notes                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                                                                                                                              | pass   | Required files, npm scripts, and skill paths present.                                                                                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                                                                                                                                         | pass   | Inventory showed only allowed docs/state/task-plan/evidence changes. Base compare used `origin/master`; no commits ahead before local commit.                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                                                                                                                                                                                 | pass   | Banned terms absent; route and DTO naming scans passed.                                                                                                         |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                          | pass   | No whitespace errors.                                                                                                                                           |
| `node .\node_modules\prettier\bin\prettier.cjs --check docs\02-architecture\interfaces\phase-21-high-risk-tail-contract.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-phase-21-tail-ai-scoring-retry-persistence-design.md docs\05-execution-logs\evidence\phase-21-tail-ai-scoring-retry-persistence-design.md` | pass   | Initial sandbox run failed with `EPERM` reading local `node_modules`; escalated rerun passed with all matched files formatted.                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                                                                                                                                                                                                                     | pass   | Ran `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit`, and `npm.cmd run format:check`. Unit result: 149 test files passed, 615 tests passed. |

## Skipped Gates

| Gate                   | Result  | Reason                                                                                  |
| ---------------------- | ------- | --------------------------------------------------------------------------------------- |
| `npm.cmd run build`    | skipped | Docs-only task; no frontend, route, build-system, runtime, or browser behavior changed. |
| `npm.cmd run test:e2e` | skipped | Docs-only task; no frontend, route, build-system, runtime, or browser behavior changed. |

## Closeout Status

- Branch validation: pass.
- Commit: pending.
- Merge into `master`: pending.
- `master` validation: pending.
- Push `origin master`: pending.
- Short-lived branch cleanup: pending.
