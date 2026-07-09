# 企业 AI 生成参数合同补齐 Evidence

## 分支

- `codex/org-ai-generation-parameter-contract`

## 变更范围

- 企业后台 AI 组卷页将“题型分布”“试卷结构”接入真实参数状态并随 DTO 提交。
- 共享参数合同新增 AI 组卷题型分布与试卷结构枚举。
- 后端 normalize 拒绝非法枚举，并为 AI 组卷补齐默认合同值。
- Provider 指令输入消费 AI 出题题型/难度/训练目标，以及 AI 组卷题源偏好/题型分布/试卷结构/难度/组卷目标。
- 结构化预览增加参数一致性校验。
- AI 组卷本地计划归一化在 Provider 计划缺题源偏好时回退到用户提交参数。

## 明确未做

- 未改 DB/schema/migration/seed/fixture。
- 未改 RAG scope resolution。
- 未改企业训练发布、草稿物化或员工端作答链路。
- 未执行真实 Provider，未读取 env/secret。
- 未改 package.json、pnpm-lock.yaml 或新增依赖。

## Requirement Mapping Result

- Mapped to advanced organization AI generation module `08-organization-ai-generation`.
- Mapped to advanced organization training module `04-organization-training` only as downstream boundary context; this phase does not modify training publish or draft materialization.
- Mapped to 2026-07-02 AI generation SSOT baseline for `org_advanced_admin` route/service contracts and role-owned draft boundary.
- Mapped to 2026-07-05 closed-loop target: enterprise AI result may later become organization training draft, but this phase only repairs parameter contract before materialization.
- Mapped to 2026-07-06 AI generation recontract: AI出题 consumes question type, quantity, difficulty and objective; AI组卷 consumes source preference, question type distribution, paper structure, quantity, difficulty and objective while remaining plan-only.
- No unresolved requirement conflict found for this parameter-contract branch.

## 验证

- `corepack pnpm@10.26.1 exec vitest run src/server/services/route-integrated-provider-instruction-service.test.ts`：4 passed。
- `corepack pnpm@10.26.1 exec vitest run src/server/services/route-integrated-provider-execution-service.test.ts`：35 passed。
- `corepack pnpm@10.26.1 exec vitest run src/server/services/ai-paper-route-assembly-service.test.ts`：6 passed。
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts`：36 passed。
- `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts`：39 passed。
- 合并 targeted rerun：5 files passed，120 tests passed。
- `corepack pnpm@10.26.1 run typecheck`：passed。
- `corepack pnpm@10.26.1 run lint`：passed。
- `git diff --check`：passed。

## 工具说明

- 直接运行当前 `pnpm` 时触发非交互式 node_modules purge 与 frozen install 配置不匹配，测试未执行。
- 使用 `corepack pnpm@10.26.1 install --frozen-lockfile --config.confirmModulesPurge=false` 按现有 lockfile 恢复本地依赖；未改 package/lockfile。

## 对抗式审查

- 角色边界：本阶段只补参数合同，不放开企业标准版管理员高级能力入口。
- 数据边界：新增字段为受控枚举，不暴露内部 id、Provider payload、raw prompt、raw AI output、完整题目/材料。
- 业务边界：AI 组卷仍是“Provider 生成组卷计划，本地正式题源选题”，未生成正式题目正文。
- 持久化边界：没有写正式题库、正式试卷、模拟考试或企业训练发布链路。
- 回归风险：共享 preview options 兼容 partial 参数；旧调用未传新参数时不强制校验新字段。
