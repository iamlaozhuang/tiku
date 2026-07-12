# 0704 卡密筛选空态修复方案

**日期：** 2026-07-12

**任务：** `0704-redeem-filtered-empty-state-2026-07-12`

**分支：** `codex/0704-redeem-filtered-empty-state`

**基线：** `b0b5c4b81fb6395837d0111a1b084858e913625e`

## 目标与问题映射

- A27：卡密列表使用共享后台表格空态组件，不在业务页面手写空行。
- 初始空、筛选空和 error 必须可区分；空态下筛选工具栏与真实分页继续保留。
- A15：合资格运营角色的卡密明文查看/复制能力、角色限制和既有审计合同不得改变。

## 已读取基线

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- B0 完整问题台账、分批修复方案、evidence 与 audit。
- B4 A15 卡密角色和审计保护结论；B5A fixture 修复证据。

## 第一性原理与边界

1. 空结果是列表数据状态，不应由每个业务页面重复实现；共享表格空态负责语义和稳定布局，页面只提供业务文案。
2. `total=0` 不等于筛选空：仅当关键词或非默认状态筛选生效时显示 filtered-empty，否则显示 initial-empty。
3. error 必须在列表外独立失败，不能伪装成空结果；筛选空仍保留工具栏、分页和重置入口。
4. 不改卡密生成、明文查看/复制、服务端权限、审计、API、数据库、Provider、依赖或环境配置。

## RED 计划

1. 为 `AdminTableEmptyRow` 写组件 RED，锁定共享 slot、状态语义、列跨度、标题和说明。
2. 修改卡密页面测试：默认空显示 initial-empty；应用状态或关键词后显示 filtered-empty；两者均保留筛选和分页；error 继续显示失败状态。
3. 保留 A15 已有明文、掩码、复制与角色合同测试。

## 最小 GREEN

- 在 `AdminList` 导出共享 `AdminTableEmptyRow`，只提供表格内稳定布局和可访问状态容器。
- `RedeemCodeList` 接收 `isFiltered`，按业务筛选状态传入不同标题和说明。
- 删除卡密页面手写空行；不重构列表请求、分页或卡密操作。

## 对抗式验收矩阵

| 边界          | 必须通过                                                         |
| ------------- | ---------------------------------------------------------------- |
| 初始空        | 显示暂无卡密与生成提示；工具栏、生成入口和 0-0 分页保留。        |
| 筛选空        | 显示当前筛选无结果与重置提示；筛选值、重置入口和 0-0 分页保留。  |
| error         | 显示加载失败，不误报为空结果。                                   |
| A15           | 明文与复制能力不扩权、不回退；证据不包含明文。                   |
| 布局/可访问性 | 空态位于表格 body 内，正确跨列，有稳定状态语义，不制造嵌套卡片。 |
| 敏感边界      | 无凭证、会话、卡密明文、内部 ID、Provider 或数据库内容进入证据。 |

## 验证门禁

1. focused RED/GREEN：共享 AdminList 与卡密页面测试。
2. 全量 unit 固定单 worker。
3. lint、typecheck、全仓 format check、`git diff --check` 和禁止路径审计。
4. Module Run v2 pre-commit hardening。
5. 写入脱敏 evidence 与 adversarial audit 后，一个任务一个提交并按批准快进合入本地 `master`。

## 停止条件

- 卡密明文角色能力、审计、生成或服务端授权发生变化。
- error 被降级为空态，或筛选/分页在空态被移除。
- 需要依赖、schema、migration、seed、数据库、Provider 或环境变更。
- 敏感字段进入 UI、日志、测试输出或 evidence。
