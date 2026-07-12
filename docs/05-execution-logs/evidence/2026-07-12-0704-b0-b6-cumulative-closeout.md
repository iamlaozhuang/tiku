# 0704 B0-B6 累计收口证据

**日期：** 2026-07-12

**任务：** `0704-b0-b6-cumulative-closeout-2026-07-12`

**分支：** `codex/0704-b0-b6-cumulative-closeout`

**基线：** `10f60614773325d337f66ade65ea128c912418a2`

## Git 与环境

- 本任务起点、本地 `master` 均为 `10f60614773325d337f66ade65ea128c912418a2`；`origin/master` 保持 `fa65cbd9bb676d813e627221e23f71a7476e05d8`，本地领先 16 个提交。
- localhost 使用显式进程级 0704DB override；`.env.local` 未修改。
- 本任务未改产品源码、测试、依赖、fixture、schema、migration、seed 或私有凭证文件。
- 未执行 push、PR、staging、production、deploy、Cost Calibration 或 Provider-enabled 行为。

## A01-A30 台账

| ID  | 最终状态                       | 批次/提交        | 累计结论                                                    |
| --- | ------------------------------ | ---------------- | ----------------------------------------------------------- |
| A01 | fixed                          | B1A `677c2689d`  | 组卷选择器按真实分页 envelope 读取，题目与材料合同已覆盖。  |
| A02 | fixed                          | B1B `454277e94`  | 不完整企业训练版本行被隔离，不伪造发布范围。                |
| A03 | fixed                          | B1B `454277e94`  | 员工可见列表复用安全解析，无效版本不进入授权结果。          |
| A04 | fixed                          | B3 `6479cf45e`   | 列表完整性错误时禁止新建并保留恢复入口。                    |
| A05 | fixed                          | B1C `e2e21a833`  | 资源 publicId 按不透明值编码，历史合法标识可路由。          |
| A06 | fixed                          | B2 `adb75ce3c`   | 服务端只返回脱敏 availability 枚举，关闭时前置禁用。        |
| A07 | fixed                          | B2 `adb75ce3c`   | AI 不可用状态在提交前可见，不暴露运行环境细节。             |
| A08 | fixed                          | B4 `85677c558`   | 试卷文案与辅助名称使用业务名称和状态。                      |
| A09 | fixed                          | B4 `85677c558`   | 题目操作使用题干摘要、题型和序号，不读出标识。              |
| A10 | fixed                          | B4 `85677c558`   | 材料操作使用标题与状态，不在反馈中展示标识。                |
| A11 | fixed                          | B4 `85677c558`   | 知识点推荐展示名称与路径，缺失名称时不回退标识。            |
| A12 | fixed                          | B4 `85677c558`   | 材料、知识点、标签改为业务选择器，提交合同仍使用 publicId。 |
| A13 | fixed                          | B4 `85677c558`   | 组织上下文只展示名称、路径、范围摘要和数量。                |
| A14 | protected_deferred_decision    | B0 decision gate | 未改变手机号展示；等待独立产品决策，不伪报为修复。          |
| A15 | protected_requirement          | B4 regression    | 合资格运营角色卡密明文能力及审计保留，未削弱角色限制。      |
| A16 | fixed                          | B4 `85677c558`   | 审计动作与目标类型使用中文映射，未知值有稳定回退。          |
| A17 | fixed                          | B4 `85677c558`   | AI 审计使用“用量/输入摘要”等产品措辞，不展示内部术语。      |
| A18 | fixed                          | B3 `6479cf45e`   | 已登录角色不符进入 forbidden，未登录才进入 login。          |
| A19 | fixed                          | B3 `6479cf45e`   | 标准版不可用页保留组织后台壳与返回路径。                    |
| A20 | fixed                          | B2 `adb75ce3c`   | 四类允许角色 Provider-closed 状态一致，标准版边界未扩大。   |
| A21 | verified_acceptance_gap_closed | B6 `28dc0bcc5`   | 键盘用例与真实抽屉焦点循环、Escape、焦点恢复均通过。        |
| A22 | verified_acceptance_gap_closed | B6 `28dc0bcc5`   | 超过 20 条的分页、页大小、URL、筛选与重置合同已覆盖。       |
| A23 | verified_acceptance_gap_closed | B6 `10f606147`   | 正常产品 API 的练习、模拟考试、提交、报告与隔离闭环通过。   |
| A24 | fixed                          | B5A `b0b5c4b81`  | 0704 组织验收数据可读性修复，未改生产 UI 逻辑。             |
| A25 | fixed                          | B5A `b0b5c4b81`  | 材料验收数据可读性修复，未批量改写生产内容。                |
| A26 | fixed                          | B4 `85677c558`   | 普通运营流程统一使用名称、路径或选择器表达。                |
| A27 | fixed                          | B5B `1784bfc32`  | 卡密 filtered-empty 使用统一空态并保留筛选和分页。          |
| A28 | fixed                          | B5C `b22a7745a`  | 移动端底部操作区包含安全区与稳定导航间距。                  |
| A29 | fixed                          | B5C `b22a7745a`  | 页面级横向溢出受限，后台表格在自身容器内滚动。              |
| A30 | fixed                          | B4 `85677c558`   | 重复操作使用业务对象名称形成唯一 accessible name。          |

B1D `608db9894` 同期修复 Next.js 16 卡密路由上下文构建问题；登录运行目标诊断 `d99fb89e7` 固化了“0704DB 必须进程级显式 override、不得修改 `.env.local`”的恢复门禁。B4 等待稳定性补证为 `785a72a24`，B4 合入复核为 `71f658fab`。

## 累计验证

### 单测

- 首次无 `CI` 全量运行被 600 秒外层超时终止；当时无失败输出，精确清理该工作树遗留的 2 个 Vitest 进程，不将其记为通过。
- 第二次为缩短输出临时设置 `CI=1`，得到 359/360 文件、1966/1967 用例通过；唯一失败是本地 Playwright worker 默认值测试在 CI 分支按设计为 `undefined`。移除 `CI` 后聚焦复跑 1/1 通过，确认是调用语义不匹配而非产品回归。
- 正式本地语义复跑：360/360 文件、1967/1967 用例通过，耗时 810.68 秒。

### 静态与构建

- `npm.cmd run lint`：pass。
- `npm.cmd run typecheck`：pass。
- `npm.cmd run format:check`：pass，全仓文件符合 Prettier。
- `npm.cmd exec -- next build --webpack`：pass，Next.js 16.2.6 编译完成并生成 90/90 静态页面。

### 0704DB 角色与 Provider 关闭矩阵

- 9 个核心角色通过正常 session API 登录：9/9 pass。
- `content_admin`、个人高级版学员、组织高级版管理员、组织高级版员工：4/4 返回脱敏 `generationAvailability=closed`。
- 凭证和 cookie 仅在进程内使用并随即清空；输出不含账号、密码、session、token、内部标识或业务内容。

### 真实浏览器

- `content_admin`，题库管理，390x844：列表非空且加载成功。
- `documentElement.scrollWidth == clientWidth`；`AdminTableFrame` 存在并承担表格内部滚动。
- 题目详情抽屉初始焦点在对话框内；Tab、Shift+Tab 焦点循环通过；关闭操作唯一可识别；Escape 关闭后焦点恢复到触发按钮。
- 最终页面监控窗口：console error 0、page error 0、request failure 0、generation POST 0。
- 浏览器脚本首次使用错误模块入口，在启动前失败；后续一次异常路径未关闭浏览器导致外层超时，精确清理 4 个子进程。增加 `finally` 和阶段标记后定位为未限定对话框范围的关闭按钮 locator；限定到详情对话框后通过。两次登录跳转取消请求在最终页面监控窗口重置后为 0，均未作为产品缺陷或通过证据。

## 禁止项复核

- 未直接连接或操作数据库；本累计任务无业务数据写入。
- 未修改 `.env.local`、私有凭证、产品源码、测试、依赖或 lockfile。
- 未截图、未保存 raw DOM、trace、Playwright report 或 test-results。
- 未执行 Provider、AI 生成、正式内容直写、角色能力扩大、组织范围推断或远端行为。

## Module Run v2 锚点

- result: pass
- Batch range: B0-B6，覆盖 A01-A30。
- RED: 首次正式基线复核发现运行时目标错误、台账中的合同/边界问题与验收缺口；各批次保留独立 RED，累计任务另记录超时和 `CI=1` 参数语义反证。
- GREEN: A01-A30 均归入可追溯最终状态，正式 localhost 语义全量回归、静态门禁、构建、九角色、Provider-closed、键盘和 390px 验收通过。
- Commit: `10f60614773325d337f66ade65ea128c912418a2`（累计验证基线；本任务文档提交尚未创建）。
- localFullLoopGate: pass；全量单测、lint、typecheck、全仓格式、webpack build、真实 0704 角色与浏览器闭环均通过。
- Test-ModuleRunV2PreCommitHardening: pass；5 个允许范围文件通过 scope、敏感证据与术语扫描。
- Test-ModuleRunV2ModuleCloseoutReadiness: pass；evidence、audit、验证命令与严格锚点均通过。
- Cost Calibration Gate remains blocked。
- threadRolloverGate: not_required；当前任务可在本会话完成本地提交、快进合入和清理。
- nextModuleRunCandidate: none；B0-B6 目标完成后不自动领取新实现任务。
- blocked remainder: A14 继续保持产品决策保护；push、Provider、staging、production、deploy 与 release readiness 继续阻断。

## 结论

A01-A30 均已归入 fixed、verified acceptance gap、protected deferred decision 或 protected requirement，B0-B6 累计门禁通过。该结论仅适用于当前 localhost 0704DB 基线，不代表 staging、production 或 release readiness。
