# 0704 localhost 验收问题台账 B0 Evidence

**日期：** 2026-07-11

**分支：** `codex/0704-acceptance-remediation-ledger`
**基线：** `fa65cbd9bb676d813e627221e23f71a7476e05d8`

## 结果

- A01-A30 已按严重度、状态、修复方向和 B0-B6 批次冻结在 task plan。
- A14 保持决策阻断，本批未改手机号展示。
- A15 保持需求保护，本批未削弱合资格运营角色的卡密查看能力。
- master 初始单测基线的 8 个稳定失败已修复。
- 默认并发下的组织树竞态和两个资源竞争超时已以局部测试等待策略稳定，不降低 worker 数，不放宽全局超时。
- AI 新路径不再接受或生成 `multiple_choice`，student practice/mock_exam 的既有 legacy compatibility 未删除。
- Provider 保持关闭；测试仅使用受控内存 runner，无外部 Provider 请求、env/secret 读取或 Cost Calibration。

## RED

未改 master 的首次全量结果：

- Test Files：350 passed，7 failed，共 357。
- Tests：1920 passed，9 failed，共 1929。
- 单 worker 复核：8 个失败稳定复现；另 1 个 UI 失败仅在默认并发全量下出现。

根因分类：nullable 查询断言陈旧、org_auth 源码证明锚点陈旧、测试遗漏新增内存依赖、AI 新路径越过 legacy alias 兼容范围、并发下异步刷新与局部 5 秒超时不稳定。

## GREEN

### Focused

- 7 个基线失败文件：53/53 tests passed。
- 3 个并发稳定性文件：33/33 tests passed。
- mistake_book runtime：7/7 tests passed。
- organization operations baseline：24/24 tests passed。

### Full Unit

最终代码默认并发复跑：

- Test Files：357/357 passed。
- Tests：1929/1929 passed。
- Duration：221.61s。

### Static Gates

- `npm.cmd run lint`：pass。
- `npm.cmd run typecheck`：pass。
- `npm.cmd run format:check`：pass。
- `git diff --check`：pass。
- Module Run v2 pre-commit hardening：pass，16 个任务范围文件完成 scope、敏感证据和术语扫描。

## 变更边界

- 无 dependency、lockfile、schema、migration、seed 或 env 变更。
- 无 staging、production、deploy 或远端操作。
- 无真实 Provider 请求、Provider 配置读取、凭证读取或 Cost Calibration。
- 无角色能力扩大、组织范围推断、正式内容直写或敏感信息进入 evidence。
- 本 evidence 不含凭证、token、cookie、DB URL、手机号、卡密、完整题目/材料、raw prompt、raw AI output、Provider payload 或内部数字主键。
