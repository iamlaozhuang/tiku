# Phase 73 Advanced Organization Analytics Implementation Planning

**Task id:** `phase-73-advanced-organization-analytics-implementation-planning`

**Branch:** `codex/phase-73-organization-analytics-planning`

**Task kind:** `implementation_planning`

## Approval Boundary

The user approved serial advancement of Phase 69-78 under `local_auto_candidate`.

This task is planning-only. It does not approve direct analytics implementation, export flows, employee sensitive detail visibility, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service work, or Cost Calibration Gate execution.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-72-advanced-organization-training-implementation-planning.md`

## Scope

Allowed files are limited to state, queue, this task plan, evidence, and audit review.

Blocked files and surfaces include `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, package or lockfiles, scripts, env/secret files, provider runtime files, export file generation or download paths, formal learning write paths, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution.

## Planning Output

Future implementation should be split into separately approved code-stage tasks:

1. Analytics contract/model/formula tests:
   - Dashboard, training summary, employee summary, ranking, formal learning summary, quota summary, filter, and pagination DTOs.
   - Formula tests for eligible, submitted, unfinished, completion rate, average score, min/max score, trend, and zero-count cases.
2. Read-only repository boundary:
   - Visible organization snapshots, training official submissions, employee summaries, formal learning summaries, and quota summaries.
   - Summary rows only; no answer body, question body, standard answer, `analysis`, prompt text, provider payload, plaintext `redeem_code`, or numeric ids.
3. Analytics service:
   - Require advanced `authorization`, `org_auth`, organization admin context, and `canViewOrganizationTrainingSummary`.
   - Use answer-time organization snapshots and official organization training submissions only.
4. Privacy mapper:
   - Map aggregate summaries to camelCase DTOs.
   - Keep formal `mock_exam` ranking separate from organization training ranking.
5. Optional route/Web surfaces:
   - Add REST and admin UI only after separate implementation approval.
   - Include dashboard, training summary, employee summary, ranking summary, quota summary, Loading, Empty, Error, and Permission Blocked states.

## Risk Defenses

- Organization admin may view summaries only, not employee question-level answers, item correctness, subjective original answers, full question bodies, standard answers, `analysis`, prompt text, provider payload, raw model output, or single AI task detail.
- Export route, export command, generated export file, export download, and export governance remain blocked.
- Analytics reads must not mutate `authorization`, `redeem_code`, `audit_log`, `ai_call_log`, quota ledger, formal `exam_report`, or `mistake_book`.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md docs\05-execution-logs\evidence\2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md,docs\05-execution-logs\evidence\2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-73-advanced-organization-analytics-implementation-planning.md -Pattern 'Implementation Task Proposal','authorization','org_auth','mock_exam','exam_report','mistake_book','audit_log','ai_call_log','export','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if direct implementation, export flows, sensitive employee detail visibility, dependency, schema, migration, env/secret, provider, staging/prod/cloud/deploy, payment, external-service work, Cost Calibration Gate execution, or sensitive evidence becomes necessary.
