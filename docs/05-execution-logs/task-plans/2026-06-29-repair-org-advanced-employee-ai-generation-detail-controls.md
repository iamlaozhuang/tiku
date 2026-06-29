# Repair Org Advanced Employee AI Generation Detail Controls Plan

- Task id: `repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29`
- Branch: `codex/org-advanced-employee-ai-detail-controls-20260629`
- Status: claimed
- Date: `2026-06-29`

## Goal

Repair the learner `AI训练` surface so `org_advanced_employee` can reach visible `AI出题` and `AI组卷` detail-control
surfaces before any local request is submitted. The controls must cover the owner-facing checklist expectations for
`profession`, `level`, `subject`, `knowledge_node`, question type/count, difficulty, learning goal, paper distribution,
coverage, and time target where implemented.

## Authorization

This task consumes Stage C of the durable staged local execution approval:

- Source/test/docs repair is allowed only within materialized files.
- Local focused unit tests and localhost no-Provider browser verification are allowed.
- Local commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup are approved after
  validation.

This task does not consume DB, schema/migration/seed, dependency, Provider, staging/prod/deploy, PR, force-push,
release readiness, final Pass, or Cost Calibration approval.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-employee-workflow.md`
- `docs/05-execution-logs/evidence/2026-06-28-ai-generation-detail-controls-source-repair.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`

## Implementation Approach

1. Write a focused RED unit test proving an advanced organization employee sees learner AI detail-control categories
   before submission and no Provider/raw content is rendered.
2. Run the focused unit test and confirm the expected failure.
3. Update `StudentPersonalAiGenerationPage` with reusable local detail-control metadata for both `AI出题` and `AI组卷`.
   The repair should not create a separate role-specific implementation or submit generation on entry.
4. Run the focused unit test to GREEN.
5. Run scoped browser verification for `org_advanced_employee` on `/ai-generation`, counting only control/status labels.
6. Run scoped formatting, diff, Module Run v2 gates, and closeout.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- `browser_org_advanced_employee_ai_generation_detail_controls_redacted`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-repair-org-advanced-employee-ai-generation-detail-controls.md docs/05-execution-logs/task-plans/2026-06-29-repair-org-advanced-employee-ai-generation-detail-controls.md docs/05-execution-logs/evidence/2026-06-29-repair-org-advanced-employee-ai-generation-detail-controls.md docs/05-execution-logs/audits-reviews/2026-06-29-repair-org-advanced-employee-ai-generation-detail-controls.md docs/05-execution-logs/acceptance/2026-06-29-repair-org-advanced-employee-ai-generation-detail-controls.md src/app/(student)/ai-generation/page.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29 -SkipRemoteAheadCheck`
