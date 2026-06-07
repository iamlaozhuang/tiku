# Phase 72 Advanced Organization Training Implementation Planning

**Task id:** `phase-72-advanced-organization-training-implementation-planning`

**Branch:** `codex/phase-72-organization-training-planning`

**Task kind:** `implementation_planning`

## Approval Boundary

The user approved serial advancement of Phase 69-78 under `local_auto_candidate`.

This task is planning-only. It does not approve direct organization training implementation, formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write-path changes, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service work, or Cost Calibration Gate execution.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md`

## Scope

Allowed files are limited to state, queue, this task plan, evidence, and audit review.

Blocked files and surfaces include `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, package or lockfiles, scripts, env/secret files, provider runtime files, formal learning write paths, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution.

## Planning Output

Future implementation should be split into separately approved code-stage tasks:

1. Organization training contract/model/validation:
   - Draft, published version, takedown, copy-to-new-draft, employee answer, and summary DTOs.
   - First-release question type allowlist and publish confirmation validation.
2. Draft lifecycle service:
   - Manual draft creation and AI draft task submission through `organization_training_generation`.
   - Require advanced `authorization`, `org_auth`, capability, organization scope, and quota precheck.
3. Publish/version/takedown/copy:
   - Publish immutable version with organization scope snapshot.
   - Takedown blocks new answering but preserves summaries, quota references, and `audit_log`.
   - Copy published version to fresh draft without overwriting history.
4. Employee answer lifecycle:
   - Visible list/detail through current organization and publish scope snapshot.
   - Save draft answers and exactly one official submission per version.
   - Submitted training must not create formal `practice`, `mock_exam`, formal `answer_record`, `exam_report`, or `mistake_book`.
5. Privacy mapper:
   - Admin summary without employee question-level answers, item correctness, subjective answers, full question bodies, standard answers, `analysis`, prompt text, provider payload, or single AI task detail.
6. Optional route/Web surfaces:
   - Add REST or Web only after separate implementation approval.
   - Include Loading, Empty, Error, Permission Blocked, Takedown, Submitted, and Read-only states.

## Risk Defenses

- Keep organization training separate from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- Organization admin cannot see employee answer bodies, item-level correctness, subjective original answers, prompt text, provider payload, or single AI task detail.
- Real provider calls remain blocked.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-72-advanced-organization-training-implementation-planning.md docs\05-execution-logs\evidence\2026-06-07-phase-72-advanced-organization-training-implementation-planning.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-72-advanced-organization-training-implementation-planning.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-72-advanced-organization-training-implementation-planning.md,docs\05-execution-logs\evidence\2026-06-07-phase-72-advanced-organization-training-implementation-planning.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-72-advanced-organization-training-implementation-planning.md -Pattern 'Implementation Task Proposal','authorization','org_auth','organization_training_generation','paper','mock_exam','answer_record','audit_log','ai_call_log','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if direct implementation, formal learning write-path changes, provider execution, dependency, schema, migration, env/secret, staging/prod/cloud/deploy, payment, external-service work, Cost Calibration Gate execution, or sensitive evidence becomes necessary.
