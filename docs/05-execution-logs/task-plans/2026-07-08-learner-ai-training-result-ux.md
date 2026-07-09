# 2026-07-08 Learner AI Training Result UX

## Task

按已批准三阶段方案的第 3 阶段，优化个人高级版学员与企业高级版员工 `AI训练` 页面结果区、历史区和学习闭环文案。

## Branch

- `codex/learner-ai-training-result-ux`

## Approval Boundary

- `current_user_approved_three_stage_ai_generation_result_ux_goal_2026_07_08`

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Scope

Allowed:

- 学员端 `AI训练` 页面可见文案、结果摘要、历史摘要、详情摘要和操作按钮层级。
- 对应单测。
- 本任务 plan/evidence/audit 与队列状态。

Blocked:

- API/DTO/service/repository/DB/schema/migration/seed/fixture。
- Provider 调用链、Prompt、Provider-enabled 验收。
- 依赖、`package.json`、lockfile。
- 内容后台、组织后台、企业训练后台代码。
- 任何凭证、session、cookie、token、localStorage、env、DB URL、raw DB row、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料输出。

## Implementation Plan

1. 先补单测，要求学员端不再出现 `草稿评审`、`正式采用`、`需审核后采用`、内容后台采纳语义或企业训练草稿语义。
2. 将结果与历史可见标签改为学习者语义：
   - `依据资料状态` 或 `生成可靠性提示`
   - `生成练习题`
   - `自测试卷预览`
   - `开始作答`
   - `查看解析`
   - `历史记录`
3. 保持个人高级版与企业高级版员工区分：
   - 个人上下文显示个人授权/个人额度。
   - 企业员工上下文显示组织授权/组织额度。
4. 保持标准版不可用边界，不展示生成表单、结果历史或重试控件。
5. 不改变数据契约；仅在前端映射层把现有安全 DTO 字段翻译为学习者可理解文案。

## Requirement Mapping Result

- Mapped to advanced learner AI generation `ADV-MOD-03` and `Epic 01 Learner AI Generation`.
- Mapped to 2026-07-02 AI generation SSOT baseline for `personal_advanced_student` and `org_advanced_employee` learner `AI训练`.
- Mapped to 2026-07-05 closed-loop target: learner AI result remains personal/employee training-domain content and can be answered/reviewed without formal writes.
- Mapped to 2026-07-06 UI/UX contract: learner AI page uses `AI训练`, `AI出题`, `AI组卷`, visible quantity/source semantics, and learner product language.
- Mapped to 2026-07-07 full-role UI/UX batch 3 and batch 4: learner AI result/history surfaces avoid content governance or organization-admin publishing wording.
- No unresolved requirement conflict found for this copy-only learner UI branch.

## Risk Controls

- TDD：先让新增断言失败，再改实现。
- 不改共享后端与 Provider，避免影响内容后台、组织后台和 AI 调用链。
- 只使用现有 Design Tokens/Tailwind 类，不新增视觉体系。
- 证据仅记录文件、命令、通过/失败状态和脱敏结论。

## Validation Plan

- `npm.cmd exec -- vitest run tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
- `npm.cmd exec -- vitest run src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx --reporter=dot`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-08-learner-ai-training-result-ux.md docs/05-execution-logs/evidence/2026-07-08-learner-ai-training-result-ux-evidence.md docs/05-execution-logs/audits-reviews/2026-07-08-learner-ai-training-result-ux-audit.md src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-training-result-ux-2026-07-08`
- 合入 `master` 后复跑必要门禁和推送前检查。
