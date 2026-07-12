# 0704 AI 生成关闭状态合同修复方案

## 任务信息

- taskId：`0704-ai-provider-closed-state-contract-2026-07-12`
- 批次：B2 / A06、A07、A20
- 分支：`codex/0704-ai-provider-closed-state-contract`
- 基线：`608db98941dec06dc8e5ee443df79d31f5cea0b6`
- 目标：用认证后的脱敏 `generationAvailability` 合同，让四类允许角色在生成服务关闭时提交前明确不可用，并保证零生成 POST。

## 已读取约束

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`，含 ADR-007
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- 最新 AI generation baseline evidence、goal-completion audit
- 2026-07-11 内容后台 AI 收敛 plan、evidence 与 audit

## 第一性原理与边界

- 用户在提交前需要知道生成能力是否可用；事后 Provider 错误不能替代首屏可用性状态。
- 客户端不能读取环境配置，也不能猜测 Provider 状态；服务端只返回 `available` 或 `closed`，不返回供应商、配置、凭证或失败细节。
- 状态失败必须 fail-closed；按钮禁用与提交函数双重阻断，避免通过事件或代码路径绕过。
- content admin、advanced org admin、personal advanced student、advanced org employee 复用两个共享页面；标准版继续走既有 unavailable 边界，不请求状态接口，不扩大权限。
- 本批不执行 Provider，不读取凭证或秘密环境值，不检查 payload/raw prompt/raw output，不写正式内容，不连接数据库，不改 schema/migration/seed/依赖。

## TDD 步骤

1. 增加状态路由测试：认证、脱敏 closed/available 映射、未登录拒绝、响应字段白名单。
2. 增加管理员与学习者组件 RED：关闭提示首屏可见、生成按钮禁用、点击不产生 POST；覆盖四类允许角色与标准版不扩权。
3. 最小实现共享合同、认证 GET 路由和两个页面 fail-closed 状态机，不改生成 POST 合同。
4. 运行 focused、AI 受影响回归、B1+B2 累计回归、全量 unit、lint、typecheck、format check、diff check、build 与 Module Run v2。
5. 串行执行 localhost 脱敏验收；仅在当前数据可登录对应角色时验证，不输出凭证、会话、内部 ID 或完整内容，不触发生成。
6. 写 evidence/audit，单提交、`--ff-only` 合入本地 master 并清理；禁止 push。

## 验收标准

- 认证 GET 只返回 `{ generationAvailability: "available" | "closed" }`，无 Provider、env、credential 或运行配置字段。
- 关闭时两个共享页面显示“AI 生成服务当前未开放”，所有生成按钮提交前禁用，提交函数直接返回，零生成 POST。
- content admin、advanced org admin、personal advanced student、advanced org employee 状态一致。
- 标准个人与标准组织上下文仍显示原有 unavailable，不因状态接口获得高级能力。
- availability 请求失败时仍禁用生成，并显示通用状态不可用文案。
- 历史、结果、评审与正式内容边界不回退；AI 结果不能直接写入正式内容，AI 组卷题源约束不变。

## 允许文件

- 状态与本任务 plan/evidence/audit
- `src/server/contracts/ai-generation-availability-contract.ts`
- `src/server/services/ai-generation-availability-route.ts`
- `src/app/api/v1/ai-generation/availability/route.ts`
- `tests/unit/ai-generation-availability-route.test.ts`
- 管理员与学习者共享 AI 页面、各自组件测试及既有 surface 回归夹具
