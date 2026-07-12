# B5 AI 组卷题源策略修复证据

**日期：** 2026-07-12

**任务：** `user-led-b5-ai-paper-source-strategy-2026-07-12`

**分支：** `codex/user-led-b5-ai-paper-source`

**基线：** `295a1a7c4afcf3e91730ea6ec3612b0fc4ad53b7`

## Batch range

- B5：修复 AI 组卷 `balanced` 题源策略，并回归其他来源偏好与角色边界。
- 不包含 UI、route、repository、schema、migration、fixture、Provider 调用或 B6 企业训练结构贯通。

## RED / GREEN

- RED：新增 4 个大题、两侧同质量且题量充足的 `balanced` 用例；原实现实际选择平台题 4、企业题 0，期望 2/2。
- GREEN：在每个匹配层级内逐题选择；全卷累计来源数量相等时先取平台题，随后取企业题追平。
- HARDEN：覆盖奇数 3 题的 2/1 确定性分配、单侧不足回退、两种优先策略，以及更高匹配质量不为均衡让位。

## 实现证据

- 匹配质量仍严格遵循 `exact -> nearby_knowledge -> same_scope`，来源偏好只处理同一匹配层级内的候选题。
- `balanced` 使用单次组卷调用内的全卷累计计数；无跨请求共享状态。
- `prefer_platform` 和 `prefer_enterprise` 先取首选题源，首选侧不足时由另一侧补足。
- 企业题仍仅允许企业高级版管理员/员工、当前企业、`published` 快照；个人和内容角色仍仅使用平台正式题。
- API、DTO、route、repository、schema、migration、fixture、依赖、`.env*` 与 Provider 配置均未修改。

## 验证

- focused Vitest：2 文件 / 16 用例通过。
- 首次全量 Vitest 使用 50% workers、10 秒单测超时；一个既有员工管理 UI 用例未及时找到目标文本，随后外层运行超时并出现 EPIPE。
- 对首次失败的精确用例独立复跑：1 passed、3 skipped，目标用例 1124ms；未改动相关产品代码或测试。
- 正式全量复跑使用 25% workers、15 秒单测超时：360/360 文件、1977/1977 用例通过，380.40s。
- `corepack pnpm@10.26.1 run lint`：pass。
- `corepack pnpm@10.26.1 run typecheck`：pass。
- `corepack pnpm@10.26.1 run format:check`：pass。
- `corepack pnpm@10.26.1 exec next build --webpack`：pass，90/90 静态页面生成。
- `git diff --check`：pass。

## 两轮对抗式复核

- 第一轮：核对匹配质量、奇数分配、单侧不足、全卷多大题累计、重复 publicId 和单次调用状态隔离；未发现缺口。
- 第二轮：核对个人/内容角色、跨企业、下架快照、AI 草稿、Provider 零调用、敏感信息、allowedFiles/blockedFiles 和测试波动归因；未发现新增风险。

## Module Run v2 锚点

- result: local_verified_ready_for_commit
- Commit: pending
- localFullLoopGate: pass
- Test-ModuleRunV2PreCommitHardening: pass；7 个变更文件的 scope、敏感信息与术语扫描通过。
- Test-ModuleRunV2ModuleCloseoutReadiness: pending
- masterPostMergeVerification: pending
- Test-ModuleRunV2PrePushReadiness: pending
- Provider execution: blocked_not_executed
- database mutation: blocked_not_executed
- Cost Calibration Gate remains blocked
- threadRolloverGate: not_required；本批按用户批准的串行实施方案继续。
- nextModuleRunCandidate: `user-led-b6-ai-paper-organization-training-handoff-2026-07-12`
- blocked remainder: B0-B2 数据库安全迁移机制仍需独立批准；Provider-enabled、staging、production、deploy、PR 与 force push remain blocked。

## 结论

B5 本地实现和全量质量门禁通过，等待 Module Run v2 提交、合入、主分支复验和远端同步。结论仅覆盖 localhost 代码，不代表 staging、production 或 release readiness。
