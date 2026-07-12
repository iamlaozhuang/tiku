# B3 AI 任务生命周期一致性修复证据

**日期：** 2026-07-12

**任务：** `user-led-b3-ai-task-lifecycle-2026-07-12`

**分支：** `codex/user-led-b3-ai-training`

**基线：** `f1148823d6f2d59ea3cb40d430ef7cb552c969cb`

## Batch range

- B3：AI 生成结果与任务状态原子落库、历史残留读时兼容。
- 不包含 B4 页面信息架构、B5 组卷来源策略、B6 企业训练结构贯通或 B0-B2 数据库迁移。

## RED / GREEN

- RED: mapper 新用例证明 `pending + resultPublicId` 仍被错误映射为 `pending`；repository 新用例证明结果插入与任务更新仍为两个独立 gateway 操作，且事务 helper 尚不存在。
- GREEN: PostgreSQL gateway 在一个 Drizzle transaction 内插入草稿结果并把所属任务更新为 `succeeded`，同时写入结果引用、依据状态、引用数量和调用日志引用；owner、actor、task 条件未放宽。
- GREEN: 历史 `pending + resultPublicId` 在 mapper 读时显示为 `succeeded`，不批量回填数据库，也不掩盖 `failed` 等其他状态。

## 实现证据

- `createOrReuseDraftResult` 只通过 `insertDraftResultAndCompleteTask` 完成新结果写入。
- 新结果插入冲突时不更新任务，由已胜出的事务负责状态同步；外层按原幂等合同读取既有结果。
- 新结果已插入但 owner/actor/task 条件未命中时抛错，事务整体回滚。
- 既有结果复用路径保持只读；历史状态由 mapper 兼容，不修改存量业务数据。
- Provider、正式题目/试卷域、schema、migration、fixture、seed、依赖和 `.env.local` 均未修改。

## 验证

- `corepack pnpm@10.26.1 exec vitest run` focused：mapper、result repository、result service、route，4 文件 / 31 用例通过。
- transaction focused Vitest：mapper、repository，2 文件 / 13 用例通过。
- 首次默认全量：358/360 文件、1968/1970 用例通过；两个未改动后台 UI 用例分别出现 5 秒超时和异步数据未就绪。
- 两个失败用例独立复跑：8/8 与 4/4 通过。
- 降低 worker 后全量：359/360 文件、1969/1970 用例通过；唯一剩余失败仍为同一未改动分页 UI 用例越过硬编码 5 秒超时。
- 正式隔离复跑：`corepack pnpm@10.26.1 exec vitest run --maxWorkers=50% --testTimeout=10000`，360/360 文件、1970/1970 用例通过。只调整测试进程超时，不修改测试或业务行为。
- `corepack pnpm@10.26.1 run lint`：pass。
- `corepack pnpm@10.26.1 run typecheck`：pass。
- `corepack pnpm@10.26.1 run format:check`：pass。
- `corepack pnpm@10.26.1 exec next build --webpack`：pass，90/90 静态页面生成。
- `git diff --check`：pass。
- Test-ModuleRunV2PreCommitHardening：pass。首次执行因任务使用 YAML anchor 继承 blockedFiles，脚本把空数组绑定到必填参数而中止；显式核对 9 个变更文件均在 allowedFiles 后先完成其余硬化检查，再把同一 blockedFiles 列表显式物化到任务，供无参数真实 hook 完整执行范围扫描。
- 首次真实 `git commit` 被 hook 拒绝：project-state 的深层 `currentTask` 仍指向已关闭的 push-closeout 任务。已将指针切换到 B3，并把旧值保留为 `previousCurrentTaskBeforeUserLedB3AiTaskLifecycle20260712`，随后重新执行无参数真实 hook。
- Test-ModuleRunV2ModuleCloseoutReadiness：pass；严格 RED/GREEN、commit、localFullLoopGate、blocked remainder、thread rollover 和 next module run 锚点均通过。
- Test-ModuleRunV2PrePushReadiness：待本地提交和主分支复验后执行。

## 对抗式边界

- owner/actor：事务更新复用原 owner、actor、task publicId 条件；未扩大个人与企业上下文可见范围。
- 幂等：唯一冲突返回既有结果，不重复更新或创建第二份结果。
- 原子性：任务更新失败会使结果插入回滚，不再留下“有结果但任务处理中”的新残留。
- 历史兼容：只把同时具有结果引用的 `pending` 映射为成功；无结果 pending 和 failed 状态保持不变。
- Provider：未启动或调用 Provider；Provider-closed 合同不变。
- 正式域：结果仍为 `draft` 且 `isFormalAdoptionBlocked=true`，未写平台正式题目或试卷。
- 数据与敏感信息：未执行数据库写入、迁移或回填；未输出 DB URL、凭证、session、cookie、token 或原始生成内容。

## Module Run v2 锚点

- result: pass
- Commit: `f1148823d6f2d59ea3cb40d430ef7cb552c969cb`（任务起始提交；本批次提交在 closeout 后创建）。
- localFullLoopGate: pass；focused/full unit、lint、typecheck、format、webpack build 与 diff check 已通过。
- Test-ModuleRunV2ModuleCloseoutReadiness: pass。
- Cost Calibration Gate remains blocked。
- threadRolloverGate: not_required；当前批次可在本任务内完成提交、快进合入、推送与清理。
- nextModuleRunCandidate: `user-led-b4-ai-training-information-architecture-2026-07-12`，仅在 B3 完整远端收口后领取。
- blocked remainder: B0-B2 数据库迁移执行继续冻结，等待 Drizzle journal 安全基线机制的额外明确批准；Provider-enabled、staging、production、deploy、PR、force push 继续阻断。

## 结论

B3 达到本地提交与串行 closeout 条件。结论仅覆盖 localhost 代码和本地质量门禁，不代表 staging、production 或 release readiness。
