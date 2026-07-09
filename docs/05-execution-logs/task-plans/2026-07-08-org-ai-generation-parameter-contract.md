# 企业 AI 生成参数合同补齐执行方案

## 范围

- 分支：`codex/org-ai-generation-parameter-contract`
- 只处理企业高级版管理员 AI 出题/AI 组卷的参数合同。
- 允许改动：前端参数状态、API DTO/normalize、Provider 指令输入、本地结构化校验、对应单测。
- 禁止改动：DB/schema/migration/seed/fixture、Provider 执行、RAG scope、企业训练发布、草稿物化、package/lockfile。

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`

## Requirement Mapping Result

- Mapped to advanced organization AI generation module `08-organization-ai-generation`.
- Mapped to advanced organization training module `04-organization-training` only as downstream boundary context; this phase does not modify training publish or draft materialization.
- Mapped to 2026-07-02 AI generation SSOT baseline for `org_advanced_admin` route/service contracts and role-owned draft boundary.
- Mapped to 2026-07-05 closed-loop target: enterprise AI result may later become organization training draft, but this phase only repairs parameter contract before materialization.
- Mapped to 2026-07-06 AI generation recontract: AI出题 consumes question type, quantity, difficulty and objective; AI组卷 consumes source preference, question type distribution, paper structure, quantity, difficulty and objective while remaining plan-only.
- No unresolved requirement conflict found for this parameter-contract branch.

## 实施思路

1. 为 AI 组卷补充 `questionTypeDistribution` 与 `paperStructure` 参数枚举和 normalize。
2. 将企业后台 AI 组卷页的“题型分布”“试卷结构”从静态展示改为真实参数状态，并随请求 DTO 提交。
3. 在 Provider 指令构造中消费 AI 出题的题型、难度、训练目标，以及 AI 组卷的题源偏好、题型分布、试卷结构、难度和训练目标。
4. 在结构化预览校验中补充参数一致性校验：AI 出题校验题型/难度，AI 组卷校验题源偏好/题型分布/试卷结构。
5. 在 AI 组卷计划归一化时优先保留用户题源偏好，避免 Provider 结果缺字段时丢失合同。

## 风险防御

- 不执行真实 Provider，不输出 raw prompt、raw output 或完整题目。
- 不新增依赖，不修改 package/lockfile。
- 新枚举值只在 DTO/read model 范围内增加，不改数据库结构。
- 校验失败只阻断结构化预览采纳，不触碰正式题库、正式试卷、模拟考试或企业训练发布。
- 单测覆盖参数透传、normalize、指令消费、结构化校验与组卷计划兜底。

## 验证计划

- `pnpm exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts`
- `pnpm exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `pnpm exec vitest run src/server/services/route-integrated-provider-instruction-service.test.ts`
- `pnpm exec vitest run src/server/services/route-integrated-provider-execution-service.test.ts`
- `pnpm exec vitest run src/server/services/ai-paper-route-assembly-service.test.ts`
- `pnpm typecheck`
- `pnpm lint`

## 对抗式审查点

- 企业标准版管理员不能获得高级 AI 能力。
- 参数合同不写 DB、不触发 Provider、不进入正式题库/试卷库。
- 响应与 evidence 不暴露内部 id、Provider payload、raw prompt、raw output、完整题目/材料。
- AI 出题与 AI 组卷保持不同边界：出题生成题目草稿，组卷生成计划并由本地选题。
