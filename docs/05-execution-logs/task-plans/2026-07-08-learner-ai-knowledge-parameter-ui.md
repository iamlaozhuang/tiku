# Learner AI Knowledge Parameter UI Task Plan

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`

## Branch Scope

只处理矩阵行 `learner-ai-knowledge-parameter-ui-2026-07-08`：

- 学员端 AI训练页面中的 `AI出题` / `AI组卷` 知识点参数 UI。
- 结构化提交 `knowledgeNodeMode`、`knowledgeNodePublicIds`、`includeDescendants`、`knowledgeNodeSupplement`、`sourcePreference`。
- 空态、错误态和禁用态只作为前端安全状态，不新增学生知识点 API。
- 不改变登录、角色、授权、edition 判定，不改 Provider、DB、schema、migration、seed、fixture、package/lockfile。

## Exact Baseline Items

- Batch 0 P1-5: AI page family five-zone structure.
- Batch 3 P1-3: employee AI page must show organization authorization context and quota owner.
- Batch 4 P1-3/P1-4: personal advanced AI page five-zone structure and personal authorization context before work area.
- AI recontract knowledge coverage UI: structured selection first, optional supplement second; no free-text-only field.

## Implementation Plan

1. Add learner knowledge scope UI state for mode, selected public ids, descendant inclusion, supplement text, and source preference mapping.
2. Replace the free-text-only knowledge controls with a structured knowledge scope panel that shows selectable options when available and an explicit empty state when unavailable.
3. Disable submit when the user chooses `指定知识点` but no selectable knowledge node exists or none is selected; keep `均衡覆盖` available.
4. Map UI state into the existing shared route-integrated generation parameter contract.
5. Update targeted tests for personal learner, organization employee, paper source preference, unavailable state, and exact request payload fields.

## Risk Controls

- Standard direct-route unavailable state must not render generation forms or history shells.
- Personal context remains default; organization quota is used only after explicit selection.
- No student-facing knowledge-node API is introduced in this branch because current `/api/v1/knowledge-nodes` is content-admin scoped.
- Evidence records only code symbols, test counts, and redacted conclusions.

## Validation Commands

- `npm.cmd exec -- vitest run src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-knowledge-parameter-ui-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-knowledge-parameter-ui-2026-07-08 -SkipRemoteAheadCheck`
