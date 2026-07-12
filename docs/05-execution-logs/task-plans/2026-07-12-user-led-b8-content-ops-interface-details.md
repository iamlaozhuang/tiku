# User-led B8 Content And Operations Interface Details Plan

## 基线与任务

- Task id: `user-led-b8-content-ops-interface-details-2026-07-12`
- Branch: `codex/user-led-b8-content-ops-details`
- Start SHA: `5cbbc1849006188ef6b979674bd0183b941050df`
- 批准来源：用户批准按既定分批方案串行实施、测试、对抗式审查、提交、ff-only 合入、普通推送和清理。

## 已读取基线

- `AGENTS.md`、agent state/queue、代码品味十诫、ADR-001 至 ADR-007。
- 标准/高级版需求索引、edition-aware authorization、运营授权与日志治理 module/story。
- 2026-07-02 AI requirements SSOT、phase4 baseline、acceptance baseline normalization、goal-completion audit。
- 2026-07-02 ops authorization/content resource UI 合同、redeem_code 明文运营决策。
- 2026-07-07 full-role UI/UX source implementation entry、运营/内容后台批次。
- 2026-07-12 B0-B6 cumulative/push closeout 及本线程既有标注截图。
- 相关源码、测试、共享 `AdminTableFrame` 与局部表格实现。

## 问题登记

| roleLabel  | route label         | 状态类别        | 问题类别         | 严重程度              | 实际表现                                          | 期望表现                                                    | 复现步骤                    | 建议方案                                             | 疑似同根因                                          |
| ---------- | ------------------- | --------------- | ---------------- | --------------------- | ------------------------------------------------- | ----------------------------------------------------------- | --------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| 内容管理员 | 知识点树            | ready           | 内部验收文案泄漏 | P2                    | 页面展示“内容运营本地验收/体验安排”等实施阶段说明 | 最终用户只看到业务上下文和可执行操作                        | 登录内容后台并打开知识点树  | 删除生产页面中的内部验收组件，不替换为另一段内部说明 | `ContentOpsStagingRoleArrangement` 被运行时页面复用 |
| 运营管理员 | 企业管理 / 企业授权 | ready           | 表格间距         | P3                    | 表头和首列内容贴近容器边框                        | 单元格使用既有 spacing token，表格继续在自身容器滚动        | 打开企业管理并切换企业授权  | 仅给该表增加 `px-4 py-3` 单元格间距                  | 两张局部表直接使用无 cell padding 的基础表格类      |
| 运营管理员 | 企业管理 / 员工运营 | ready           | 表格间距         | P3                    | 表头和首列内容贴近容器边框                        | 与企业授权表保持一致的扫描节奏                              | 切换员工运营                | 复用同一个局部表格 spacing class                     | 同上                                                |
| 内容管理员 | AI出题 / AI组卷     | provider-closed | 状态说明         | protected requirement | 关闭时显示状态提示                                | 保留面向用户的关闭说明、历史记录入口和 fail-closed 提交边界 | Provider 关闭时进入 AI 页面 | 以回归测试确认现有提示，不删除、不触发 Provider      | 不是缺陷；是禁用操作的必要解释                      |

## 实施思路

1. 先写失败测试：内部验收文案不得出现在内容总览或知识点树；企业授权和员工表必须具有局部 cell padding contract。
2. 删除 `ContentOpsStagingRoleArrangement` 定义和两个生产用法，不新增替代性验收说明。
3. 在 `AdminOrgAuthRedeemPage` 内定义局部表格 class，组合既有 `adminDataTableClassName` 与 Tailwind spacing token；不修改全局表格原语。
4. 保留 AI Provider-closed 状态文案、历史任务可见性、禁用提交逻辑；保留 A15 合资格运营角色卡密明文查看/复制与脱敏审计。

## 风险防御

- 不修改角色授权、API、server、数据库、schema、migration、fixture、seed、依赖、lockfile 或 `.env*`。
- 不操作浏览器、不截图、不抓 raw DOM；既有截图只作为问题定位证据，B9 再执行累计角色/viewport 验收。
- 表格间距只作用于企业授权和员工账号两张表，`AdminTableFrame` 横向滚动边界不变。
- Provider 保持关闭，不调用、不新增启用路径；A14 继续 deferred，A15 继续 protected requirement。
- 不重新打开已关闭的 A01-A30。

## 验证与对抗式审查

- RED/GREEN 定向 Vitest：内容后台、运营授权/员工表、A15 卡密、Provider-closed。
- 全量 unit、lint、typecheck、format:check、webpack build、`git diff --check`。
- 两轮对抗式审查：内部文案残留、样式作用域、表格 containment、角色越权、Provider 误调用、A15 削弱、敏感信息、直接 URL、窄屏回归。
- 写 evidence/audit 和品味合规自检，执行 Module Run v2 pre-commit/module-closeout/pre-push。
- 单批产品提交与治理 closeout；ff-only 合入 `master`，主线复验后普通 push，确认 0/0 再清理短分支/worktree。

## 阻断边界

- staging、production、deploy、Cost Calibration、Provider-enabled、PR、force push 均阻断。
- 若需要扩大到全局表格原语、授权服务、卡密能力、数据库或未知页面族，停止并重新物化范围。
