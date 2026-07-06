# 2026-07-06 AI Paper Personal Route Container Contract

## 任务边界

- 任务 id：`ai-paper-personal-route-container-contract-2026-07-06`
- 短分支：`codex/ai-paper-personal-route-container-contract-2026-07-06`
- 父 Goal：`ai-generation-recontract-local-repair-goal-2026-07-06`
- 范围：为 `personal_advanced_student` 与 `org_advanced_employee` 的 AI组卷本地 route/runtime 接入“Provider 只生成组卷结构，本地正式题库选题并返回脱敏 paper assembly container”的合同。
- 不做：DB runtime、Provider call、浏览器、staging/prod/deploy、Cost Calibration、依赖变更、schema/migration/seed、AI出题行为改造、UI 交互改造。

## 已读取规范与恢复入口

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- 最新本地 AI组卷 route/source/admin 相关 task plan、evidence、audit。

## 合同目标

1. `ai_paper_generation` 且 Provider route 结果成功时，personal/employee runtime bridge 必须尝试生成 `paperAssembly`。
2. `paperAssembly` 只包含脱敏结构、计数、题源构成、匹配质量、降级/不足摘要，不包含题目正文、答案、材料、DB 原始行、内部 id、Provider payload、raw prompt、raw AI output。
3. `personal_advanced_student` 题源：授权范围内平台正式题库，不纳入个人 AI 生成题。
4. `org_advanced_employee` 题源：授权范围内平台正式题库 + 员工可见的本企业已发布训练版本题目快照，不纳入员工 AI 生成题。
5. AI出题请求不得触发组卷装配。
6. 组卷计划不可接受或题源解析失败时，不持久化草稿结果，并以本地 route result failed 状态暴露脱敏失败边界。

## TDD 计划

1. 先在 personal route/runtime 单测中添加失败测试：
   - employee AI组卷成功时返回 `runtimeBridge.paperAssembly.status = assembled`，且题源构成为平台 + 企业快照。
   - personal AI组卷成功时只返回平台题源，企业源为 not applicable。
   - AI出题不调用 paper assembly resolver。
   - resolver rejected 时不调用 result persistence。
2. 实现最小生产代码：
   - 在 personal runtime bridge DTO 增加 `paperAssembly` 脱敏容器字段。
   - route dependencies 增加可注入 resolver/repository。
   - 默认 resolver 复用 `resolveAndAssembleAiPaperFromRoute`，并接入 Postgres question/training repository 作为生产默认，但单测只用 fake repository。
   - materialization 只在 `paperAssembly` 非 rejected 时继续。
3. 运行 focused unit、相关 AI paper service unit、`git diff --check`、`typecheck`、`lint`、scoped prettier、Module Run v2 precommit hardening。

## 风险防御

- 对抗点：避免把 Provider 输出的题目内容当作正式题目；只消费结构计划。
- 对抗点：避免个人/员工自己生成题进入组卷题源；本包不引入 `ai_generated_draft` 题源。
- 对抗点：避免失败时仍持久化个人/员工草稿结果。
- 对抗点：避免泄漏敏感内容；单测和 evidence 只记录角色、阶段、状态、计数、错误类别。
- 对抗点：避免改动 AI出题闭环；测试显式覆盖 question 请求不调用组卷 resolver。

## 预期交付

- source/test/doc/state/evidence/audit 本地提交。
- 不声明 release readiness、production usability、staging 或 Cost Calibration。
- 合入、推送、分支清理需要后续 fresh approval。
