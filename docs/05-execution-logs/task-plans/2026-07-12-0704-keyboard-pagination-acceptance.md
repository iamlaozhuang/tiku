# 0704 键盘与确定性分页验收方案

**日期：** 2026-07-12

**任务：** `0704-keyboard-pagination-acceptance-2026-07-12`

**分支：** `codex/0704-keyboard-pagination-acceptance`

**基线：** `b22a7745a2bbeda8d5d23e493bc77e021eee2dc2`

## 目标与问题映射

- A21：为后台详情抽屉和组卷确认对话框补齐真实键盘验收，覆盖 Tab、Shift+Tab、Escape、焦点不落到 BODY、关闭后恢复。
- A21 新鲜缺口：组卷确认对话框关闭时未显式恢复触发按钮焦点；先写 RED，再做最小 cleanup 修复。
- A22：用超过 20 条测试记录证明真实 page 2 返回不同服务器记录，并复核 20/50/100、总数、URL、筛选与重置合同。
- A23 不在本分支修改源码；A21/A22 合入后，以现有 0704DB 产品 API 单独执行练习/模拟考试闭环，不直接写 DB。

## 已读取基线

- `AGENTS.md`
- project state、task queue、十诫、ADR、基础与高级版需求入口、全角色 UI/UX traceability。
- B0 问题台账与 B1-B5 evidence/audit。
- Playwright、浏览器控制、frontend testing/debugging 与 TDD skill。
- `AdminDetailDrawer`、`PaperComposerConfirmationDialog`、共享列表交互 hook、试卷/题目/材料/资源分页测试及现有本地 E2E。

## 环境门禁

- localhost 已通过显式进程级 0704DB override 恢复，并用已就绪角色登录验证；`.env.local` 未修改。
- 每次真实角色验收前必须重新确认该门禁，不以端口健康代替数据库目标健康。
- Playwright 键盘用例复用现有 localhost，并用脱敏 route fixture 隔离角色与列表数据；不读取 DB、不写 DB、不输出凭证或 session。
- Provider 保持关闭；禁止 staging、production、deploy、Cost Calibration 和截图/raw DOM 证据。

## RED

1. 组卷确认对话框：从触发按钮打开，Escape 关闭后焦点必须回到触发按钮；当前实现预期失败。
2. 试卷列表：构造 45 条记录，page 1 与 page 2 必须显示不同名称；当前 mock 不按 page/pageSize 切片，预期失败。

## 最小 GREEN

- 在确认对话框 effect 中捕获打开前焦点，并在 cleanup 时恢复；不改动作语义、按钮顺序或权限。
- 只增强试卷测试 fixture 的服务端分页行为，不改生产分页实现。
- 新增 Playwright 键盘 spec：真实 Tab/Shift+Tab/Escape 验证共享详情抽屉，断言打开、循环、关闭和焦点恢复；不截图、不保存内容。

## 验收矩阵

| 边界             | 必须通过                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| 抽屉初始焦点     | 打开后焦点位于关闭按钮，不在 BODY。                                     |
| 抽屉循环         | Tab 与 Shift+Tab 均保持焦点在 drawer 可聚焦集合内。                     |
| 抽屉关闭         | Escape 关闭，焦点恢复到业务名称可辨识的触发按钮。                       |
| 确认对话框       | 初始焦点在取消；Tab/Shift+Tab 双向循环；Escape 恢复触发按钮。           |
| 真实分页 fixture | 45 条记录下 page 2 与 page 1 不同；总数和页码稳定。                     |
| 页大小           | 20/50/100 请求合同正确，变化后回到 page 1。                             |
| 筛选与重置       | 筛选回到 page 1；重置恢复默认 page/pageSize/sort/filter。               |
| 安全边界         | 无真实凭证、session、cookie、内部 ID、raw DOM、截图或完整内容进入证据。 |

## 验证门禁

1. focused RED/GREEN：组卷确认与试卷分页测试。
2. 单个 Playwright keyboard spec，复用现有 0704DB localhost；route fixture 不执行 DB 行为。
3. 全量 unit 单 worker。
4. lint、typecheck、全仓 format、diff、允许路径与 Module Run v2。
5. 一个任务一个提交，按批准快进合入本地 `master`；不 push。

## 停止条件

- 需要直接 DB 连接/写入、修改 env、猜测凭证或扩大角色能力。
- 焦点通过脚本强制跳过真实键盘顺序，或关闭后落到 BODY。
- page 2 仍返回 page 1 记录，或通过客户端切片掩盖服务端合同。
- 出现 Provider、依赖、schema、migration、seed、staging/prod/deploy 或敏感输出。
