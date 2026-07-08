# 2026-07-08 Organization Training Create Entry Plan

## Task

- Task id: `organization-training-create-entry-2026-07-08`
- Branch: `codex/org-training-create-entry`
- Goal: make the organization training create entry clearly separate business intent and source selection.
- User approval boundary: current user approved the four-stage organization training repair plan through merge, push, and cleanup.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`

## Adopted Baseline

- Stage 1 is adopted, not repeated:
  - draft rows expose `继续配置`;
  - published rows expose view/copy/takedown actions;
  - taken-down rows expose view/copy actions;
  - standard organization admins remain unavailable for enterprise training.
- Stage 2 is adopted, not repeated:
  - lifecycle list exposes `sourceKind` and `contentKind`;
  - backend pagination and source/content filters are present.
- Fresh adoption check:
  - current branch target set passed: organization training service, route, and admin entry tests, 3 files and 87 tests.

## Requirement Mapping

- `CT-REQ-016`: enterprise training source model and four-step wizard.
- `CT-REQ-018`: `mock_exam` is not an organization training source entry.
- `CT-REQ-024` and `CT-REQ-048`: organization AI result can only hand off to organization training draft, not formal platform content.
- Batch 2 org-admin workspace baseline: training list and creation wizard must be separated, and source selection must be clear for non-technical organization admins.

## Scope

Allowed source behavior changes:

- Change only the organization training create-entry UI and its existing unit tests.
- Put business intent first:
  - `新建题目训练`
  - `新建试卷训练`
- Make source options depend on intent:
  - question training: `AI出题结果`, `手动题组`
  - paper training: `AI组卷结果`, `平台试卷快照`
- Remove the ambiguous combined source label `企业 AI 结果`.
- Preserve the boundary copy that `模拟考试不是企业训练来源`.
- Do not require the user to manually type a source identifier in the main source selection path.

Out of scope:

- No AI page rewrite.
- No Provider execution or Provider call-chain change.
- No API write interface redesign.
- No DB, schema, migration, seed, or fixture change.
- No package or lockfile change.
- No formal question, formal paper, formal `mock_exam`, formal `exam_report`, or formal `mistake_book` write.
- No employee answer flow change.

## Files

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-08-organization-training-create-entry.md`
- `docs/05-execution-logs/evidence/2026-07-08-organization-training-create-entry-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-08-organization-training-create-entry-audit.md`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`

Blocked files include `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, migrations, seeds, raw files, e2e outputs, browser traces, and runtime artifacts.

## TDD Plan

1. Add a failing UI unit test that proves:
   - the wizard exposes intent as `新建题目训练` and `新建试卷训练`;
   - question training shows `AI出题结果` and `手动题组`, not `AI组卷结果` or `平台试卷快照`;
   - paper training shows `AI组卷结果` and `平台试卷快照`, not `AI出题结果` or `手动题组`;
   - the ambiguous `企业 AI 结果` label is gone;
   - the source chooser does not expose a manual source-identifier field in the main path;
   - `模拟考试不是企业训练来源` remains visible.
2. Confirm the new test fails for the current implementation.
3. Implement the minimal UI state and rendering change.
4. Re-run the focused tests until green.

## Validation

- `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-08-organization-training-create-entry.md src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts`
- `git diff --check`
- `npm.cmd run test:unit -- --reporter=dot`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-create-entry-2026-07-08`
- After merge to `master`: targeted tests, lint, typecheck, pre-push readiness, push, branch cleanup, clean/aligned check.

## Adversarial Review

- Verify standard organization admin still cannot access enterprise training.
- Verify organization advanced admin UI does not imply direct formal platform content writes.
- Verify no raw source id, raw JSON, prompt, Provider payload, AI raw output, full question, full paper, or material content is added to UI/evidence.
- Verify no dependency/package/lockfile/schema/migration/seed changes.
- Verify the change is local to create-entry UI and tests.
