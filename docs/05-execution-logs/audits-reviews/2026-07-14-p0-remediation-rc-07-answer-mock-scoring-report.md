# P0 RC-07 两轮对抗式复核

status: pass_branch_closeout_ready

reviewer: 当前 Agent 自对抗复核；未经批准、未使用 Subagent，不能表述为独立审查者复核。

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_required_after_merge`

## Round 1 — 根因、Diff、安全与事务

结论：`pass`。

- 学员态 paper/question projection 在服务端剥离 standard_answer、analysis、正确选项与 scoring point；客户端缓存再次投影，缓存键绑定当前 user/session scope，登录切换、logout 和终态均清理。
- answer_record 写路径先锁 owned/in_progress mock，再以每题单调 revision 和 client operation id 收敛；旧 revision、跨题 operation id、并发 insert/update 冲突均返回确定的 409，不再覆盖新答案或泄漏数据库异常。
- submit、timeout、terminate 与 deadline task 使用同一 mock 状态边界；人工提交原子完成 task，终止原子取消 task，worker 对已 completed/cancelled task 的完成/失败重放保持幂等。
- terminal supplement 只允许服务端自动到期产生的终态、clientSavedAt 位于 attempt 窗口且 expectedRevision=0；事务只插入服务端缺失题，不更新既有答案，并原子创建所需 AI scoring task、重算 mock 聚合。
- 重复 supplement 不再递增 report revision；新增答案才重建既有报告，报告 public id 保持稳定。评分证据从 task/attempt/result 固化到 answer_record，再由报告投影消费，不回读可变当前配置。
- AI scoring task 的成功与失败都在事务内锁定同一 mock；并发 task 终态按持久 answer/task 集合聚合为 scoring、scoring_partial_failed 或 completed，retryable failure 不提前终结 answer。
- migration chain 使用线性时间戳 snapshot/journal；answer revision、operation id、deadline task 与 scoring evidence 均有约束和索引。只验证源码，未连接或修改数据库。

本轮发现并修正：

1. supplement 重建报告会清空既有 scoring evidence；改为读取并保留不可变证据。
2. answer repository 未在写入时锁 owned/in_progress mock；补最终持久层 guard。
3. 多个 AI scoring terminal write 可并发覆盖 mock 聚合；补 per-mock transaction lock。
4. 早交卷也能进入 terminal supplement；收紧为 submittedAt 不早于 serverDeadlineAt。
5. RC-07 migration 文件名早于其 prev snapshot，历史链非线性；重命名并校正 journal/snapshot。
6. 重复 supplement 无变化仍递增 report revision；新增 hasChanges replay 分支，返回既有 revision。
7. terminate 未取消 deadline task，worker 与人工终止竞态可留下 pending/running owner；改为同事务 cancelled，并使 terminal task replay 幂等。
8. 相同 operation id 跨题复用或并发 update 可触发唯一约束 500；补 owner 检查、23505 constraint 归类与 409318。
9. 新 deadline source 的 import 落在文件尾部；恢复规范 import 顺序。

## Round 2 — 跨角色、状态机、API 与回归

结论：`pass`。

- personal standard/advanced、org standard/advanced employee 共用同一 learner-safe mock/practice contract；repository 以 user ownership 隔离，跨 user/organization mock、report 与 supplement 返回不可枚举的 not-found/denied 事实。
- start/resume 返回服务端 answerRecords 和 revision；UI 重载后恢复服务端事实，再合并本用户 pending queue。修改已保存答案会产生下一 revision；旧设备晚到、相同 operation replay 与不同 operation 冲突都有回归覆盖。
- 切题、答题卡和 submit barrier 先保存当前值并冲洗队列；online 自动 flush。服务端拒绝时不伪称已保存、不继续交卷；已排队离线答案仍可导航并保留恢复事实。
- serverNow offset 驱动持续倒计时；到零刷新权威状态。completed 只使用真实 exam_report public id；scoring/partial failed 显示持久进度和重试，terminated 不生成报告，mock id 不再作为 report id fallback。
- 技能 practice 以 question_group 为页面单位，同组共享 material、展示全部子题；组内全部完成后才出现下一组/完成。理论练习仍保持逐题行为，主观题不再陷入无终态动作。
- API 保持标准 envelope、camelCase、publicId、null/[] 与既有枚举；未暴露 numeric id、teacher-only snapshot、secret ref、raw Prompt 或 Provider payload。
- P1/P2 只更新影响映射，没有关闭、降级或实现；F-0013 仍是 runtime_evidence_required。RV-0012、RV-0015、RV-0021 继续 pending。
- focused、full unit、lint、typecheck、format、build、diff、serial guard 与 Module Run v2 结果记录在 evidence；合入后仍要求 fresh master 全门禁。

本轮发现并修正：

1. 报告 supplement 路径可丢 scoring evidence；补跨 answer→report 契约测试。
2. resume 响应缺 answer revision，重载后客户端会从 0 保存；补 answerRecords contract 与 UI hydrate。
3. 已保存答案被编辑后仍可能被判 clean；改为按当前值与 server/pending snapshot 比较。
4. 成功的新保存没有清理旧 pending queue；成功 revision 成为唯一客户端事实。
5. 部分历史入口把 mock public id 当 report public id；移除 fallback，completed 时显式生成/读取报告。
6. terminal replay 的报告 revision 漂移与 operation id 异常输入未覆盖；新增对抗测试并收敛。

## Current Boundary Verdict

- F-0059、F-0060、F-0061、F-0064、F-0066、F-0136 的静态根因均有源码、测试和两轮复核证据；六项仍保留独立 finding 身份。
- branch 可进入 Module Run v2 pre-commit/closeout；合入后必须在 fresh master 重跑门禁，随后方可 push、cleanup、领取 RC-08。
- database apply/read/write/backfill/seed、真实 secret/env、Provider、worker activation、runtime/browser/e2e、PR、force push、deployment 仍未授权。

reviewResult: pass_branch_closeout_ready_fresh_master_required
