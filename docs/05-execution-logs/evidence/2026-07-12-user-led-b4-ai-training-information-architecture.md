# B4 AI 训练信息架构与 Provider-closed 体验修复证据

**日期：** 2026-07-12

**任务：** `user-led-b4-ai-training-information-architecture-2026-07-12`

**分支：** `codex/user-led-b4-ai-training-ux`

**基线：** `86610c400f6db101ffefc08d179c0ad1de5ce641`

## Batch range

- B4：学员 AI 训练上下文、本地化、Provider-closed 浏览与信息架构。
- 不包含 B0-B2 数据库修复、B5 组卷来源策略、B6 企业训练结构贯通或其他学员页面。

## RED / GREEN

- RED: 新增企业员工标题、中文专业/日期、关闭状态可切换授权/任务类型、历史先于折叠生成设置的用例；初次运行 4 个预期失败。
- GREEN: 标题按有效企业授权上下文区分；专业与学习者时间显示中文化；浏览导航和生成提交禁用条件拆分；关闭/异常状态历史前置且生成设置默认收起。
- HARDEN: 关闭状态切换企业授权和 AI组卷后，显式断言未发出任何生成 POST。

## 实现证据

- 企业员工账号显示“企业员工 AI 训练”，纯个人授权账号保留“个人 AI 训练”。
- `monopoly`、`marketing`、`logistics` 仅作为内部枚举参与合同，页面显示“专卖”“营销”“物流”。
- 授权到期日和请求/结果时间使用中国时区的中文日期；空值与非法值不回显原始技术字符串。
- Provider-closed 与状态异常仅阻止生成参数和提交；授权上下文、AI出题/AI组卷切换、请求历史和结果历史保持可用。
- Provider-closed 下历史区域先于原生 `details` 生成设置；可用状态仍默认展开原工作流。
- API、repository、schema、migration、fixture、seed、依赖、`.env*` 和 Provider 配置均未修改。

## 验证

- TDD RED：focused 运行出现 4 个与新增验收点一致的失败。
- focused Vitest：2 文件 / 54 用例通过。
- 全量 Vitest：`--maxWorkers=50% --testTimeout=10000`，360/360 文件、1972/1972 用例通过。
- 全量后只追加“关闭状态零 POST”测试断言并修正文档，未改变产品代码；focused 2 文件 / 54 用例再次通过。
- `corepack pnpm@10.26.1 run lint`：pass。
- `corepack pnpm@10.26.1 run typecheck`：首次发现 `expiresAt` 可缺省类型边界，修正 formatter 入参后 pass。
- `corepack pnpm@10.26.1 run format:check`：首次发现任务方案格式问题，格式化后 pass。
- `corepack pnpm@10.26.1 exec next build --webpack`：pass，90/90 静态页面生成。
- `git diff --check`：pass。
- ff-only 合入本地 `master` 后复验：focused 2 文件 / 54 用例、lint、typecheck 与 `git diff --check` 通过。
- Test-ModuleRunV2PrePushReadiness：pass；真实 push hook 再次通过，远端无领先、本地仅包含本批 2 个提交。
- 普通推送 `origin/master`：pass，产品与治理提交同步至 `72c432995bc0d94e2408e9ac9ad5020cb737b8fd`。
- 推送后比较：`origin/master...master` 为 0 behind / 0 ahead，工作区 clean。

## 两轮对抗式复核

- 第一轮：核对关闭状态不生成、授权/任务切换不越权、历史重排不因 availability loading 产生瞬时卸载；修复 loading 到 available 时的历史节点重排竞态。
- 第二轮：核对用户文案、时间与专业枚举、直接 URL、标准版 fail-closed、敏感信息、allowedFiles/blockedFiles、webpack 命令和治理记录一致性；补充零 POST 断言并修正文档实现依据。

## Module Run v2 锚点

- result: pass
- Commit: `8b1b8f567fe436d795dd6463227f48716eb91490`
- localFullLoopGate: pass
- Test-ModuleRunV2PreCommitHardening: pass；真实 commit hook 的 scope、敏感信息、术语、lint-staged、lint、typecheck 与 post-commit advisory 均通过。
- Test-ModuleRunV2ModuleCloseoutReadiness: pass；严格 RED/GREEN、commit、localFullLoopGate、blocked remainder、thread rollover 和 next module run 锚点均通过。
- masterPostMergeVerification: pass_2_files_54_tests_lint_typecheck_diff_check。
- Test-ModuleRunV2PrePushReadiness: pass_real_push_hook。
- remotePush: pass_origin_master_72c432995。
- localRemoteComparison: pass_0_behind_0_ahead。
- Provider execution: blocked_not_executed
- database mutation: blocked_not_executed
- Cost Calibration Gate remains blocked
- threadRolloverGate: not_required；本批可在当前任务内完成串行 closeout。
- nextModuleRunCandidate: `user-led-b5-ai-paper-source-strategy-2026-07-12`
- blocked remainder: B0-B2 数据库迁移执行仍等待额外机制批准；Provider-enabled、staging、production、deploy、PR 与 force push remain blocked。

## 结论

B4 产品实现、真实提交、ff-only 合入、主分支复验和远端同步均通过。结论仅覆盖 localhost 代码，不代表 staging、production 或 release readiness。
