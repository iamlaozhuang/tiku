# P0 RC-07 答题、模拟考试、评分与报告闭环整改方案

## 任务边界

- taskId：`p0-remediation-rc-07-answer-mock-scoring-report-2026-07-14`
- finding：F-0059、F-0060、F-0061、F-0064、F-0066、F-0136；六项均保留独立验收义务。
- branch/worktree：`codex/p0-rc-07-answer-mock-scoring-report` / `D:\tiku\.worktrees\p0-rc-07`
- source baseline：`ccaa8f2d0f37e5e3093526a8998ec037ccff380a`
- audit baseline：`7aac83765ca4b650b73b1612013e26a0111775ae`
- WIP：仅 RC-07；不进入 RC-08、P1/P2 实现或 21 项 runtime acceptance。

## 第一性原理根因

一次考试的可信事实必须由服务端同一 attempt 身份串起：学员只能读取当前状态允许的内容；答案写入有单调版本且可幂等重放；deadline 有唯一到期命令与可恢复调度事实；提交封存答案并触发持久评分；评分结果以不可变证据保存；报告只消费该证据并使用稳定 report public id；页面完全由持久状态路由。当前实现把教师快照、学员视图、客户端缓存、答案 upsert、deadline、评分结果和报告投影分散为相互独立的临时状态。

最小内聚修复边界：

1. 建立 pre-answer 安全投影；评分事实只留服务端，合法反馈/报告终态才返回答案、解析和正确标记。
2. 为 answer_record 建立服务端单调 revision、客户端 operation id 与旧写拒绝；切题/交卷前自动保存，在线后自动冲洗。
3. 为 deadline 建立可重入到期命令与持久到期任务源码；UI 用 server offset 持续倒计时，到零刷新权威状态。
4. 终态离线补交只允许插入服务端缺失题，不允许覆盖已有题；新增题进入同一 RC-06 评分任务与报告重建链。
5. 持久化版本化 `ai_scoring` 结果证据，与 answer/task/attempt/provenance 原子关联；报告只投影已保存证据。
6. mock_exam 状态决定答题、评分、报告或终止视图；mock public id 与 report public id 永不互换。
7. 技能练习消费 RC-04 的 paper_section/question_group/material identity，以题组为页面单元，并在最终评分后提供下一组/完成动作。

## SSOT Read List

- `D:\tiku\AGENTS.md`
- `docs/03-standards/glossary.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/ADR-001` 至 `ADR-007`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- 高级版 AI task、personal AI generation 相关 module/story 与 ADR-007。
- 2026-07-02 AI generation SSOT alignment、phase4 baseline alignment、acceptance-baseline normalization、goal-completion audit、2026-07-05 closed-loop alignment、2026-07-06 recontract。
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- 2026-07-02 current-thread reconciliation ledger、2026-07-07 learner/UI source baseline 与只读设计板 manifest/page matrix。
- 九角色 catalog 中 RC-07 所列 UC、原始 finding register、runtime backlog、启动包、整改 ledger、serial plan、RC-06 evidence。

## 冲突检查

- 稳定 module/story、最新 traceability、UI source baseline 与 finding 验收方向一致；原 finding 中 `modules/02-student-experience.md` 为过期路径引用，当前有效文件是 `modules/03-student-experience.md`，语义无冲突。
- 2026-07-02 已关闭/取代的旧 AI 生成 20 类问题不重开；F-0059 只修复当前已验证的学员答题前投影与会话响应泄漏。
- 企业训练不是 formal mock_exam，也不生成 exam_report；RC-08 不提前实现。
- 当前批准允许 schema/Drizzle migration 源码、snapshot/journal、静态测试和提交；禁止数据库连接/apply/read/write/backfill/seed、真实 secret/env、Provider、worker 激活、runtime/browser/e2e。

## 当前基线重验

审计 baseline 后 RC-04、RC-05、RC-06 已修改 paper snapshot、student flow、mock/practice 与 AI task 链，因此六项均定向标记 `baseline_changed`，不是降级或解决：

- F-0059：published snapshot 与 mock/practice/AI session 相关路径已变化，但 pre-answer 响应仍携带评分事实，缓存仍无用户隔离和 logout 清理。
- F-0060：mock submit/评分任务链已变化，但 UI 仍无持续时钟，服务端仍无持久 deadline owner/扫描任务。
- F-0061：mock repository/service 已变化，但保存仍是无 revision upsert；切题、online flush、submit barrier、旧写拒绝和终态 missing-only 补交均缺失。
- F-0064：RC-06 已保存 task/provenance，但 `aiScoringSnapshot` 仍在 answer_record 持久化边界丢弃，报告不消费完整证据。
- F-0066：评分状态来源已改变，但重载仍由页面内临时状态驱动，历史行仍可能用 mock id 代替 report id。
- F-0136：RC-04 已恢复 questionGroupPublicId 上游 identity，但练习 UI 仍把 section.questions 扁平为单题数组，主观终态仍无下一组/完成动作。

## 业务不变量

- in_progress 响应不得包含 `standard_answer`、`analysis`、正确选项、fill blank 标准答案或 AI 评分证据。
- 缓存键必须绑定稳定用户范围；缓存内容最小化；logout、提交/终止和账号切换必须清理。
- deadline 由服务端决定；同一 mock 的到期/提交只发生一次，重复调度与请求返回同一终态。
- 同题较旧 revision 永不覆盖较新答案；重复 operation id 返回同一事实；并发写只接受一个确定顺序。
- submit 前必须冲洗当前答案和队列；失败不得伪称已保存或继续交卷。
- 终态补交只能插入服务器缺失题，不能更新既有题；新增主观题必须进入同一持久评分链，报告可幂等重建。
- 评分成功必须绑定 answer/task/attempt/model/prompt/citation 证据；历史报告不读取可变当前配置或当前题库。
- completed 只导航真实 report public id；scoring/partial 显示进度与重试；terminated 只读且无报告。
- 技能题组共享 material，按 question_group 一组一页；最终状态有下一组或完成，不死锁。

## 实现步骤（TDD）

1. RED：添加 RC-07 schema/migration source 契约测试，证明 answer revision、评分结果、deadline task、稳定索引和约束缺失。
2. GREEN：新增必要 schema/migration source；只生成源码、snapshot/journal 与静态测试，不触碰数据库。
3. RED/GREEN：建立 learner-safe paper/question projection，覆盖 paper detail、practice、mock 和 personal AI learning session 的 pre/post state。
4. RED/GREEN：实现版本化 save、operation id、旧写拒绝、missing-only terminal supplement 与事务性 submit/timeout command。
5. RED/GREEN：实现 deadline task repository/runtime 源码、可重入 claim/lease/retry；不激活 worker。
6. RED/GREEN：持久 ai_scoring result evidence，报告完整投影 scoring points/reasons/overall/improvement/model/prompt/citations。
7. RED/GREEN：UI 用户范围缓存、自动保存/online flush/submit barrier、持续倒计时、持久状态路由和稳定 report link。
8. RED/GREEN：技能 question_group 页面模型、组内多题进度、最终下一组/完成。
9. focused → full unit → lint/typecheck/format/build/diff/guard；两轮不同重点的对抗式复核。
10. 独立提交，fresh master ff-only 合入后全门禁，push origin/master，写 closeout evidence，清理 worktree/短分支后领取 RC-08。

## 对抗测试矩阵

- 正常：start/resume、切题保存、submit、scoring、completed report、skill group next/complete。
- 授权：跨用户 mock/report/cache、跨 organization、不同 authorization context、他人 terminal supplement。
- 状态：非法 save/submit/retry、completed 重载、terminated、partial failed、历史 incomplete report。
- 并发/幂等：重复 save/submit/timeout/supplement/report create、旧设备晚到、相同/不同 operation id、lease expiry。
- 事务失败：answer 写入、submit、enqueue、score result、report rebuild 任一步失败必须回滚或可安全重试。
- 输入：null/空答案、空题组、最后一秒、空 citation/scoring point、异常 revision、未知 question public id。
- 契约：camelCase、标准 envelope、publicId、null/[]、枚举一致；不暴露 internal id、教师态字段、secret/raw Provider IO。
- 回归：personal standard/advanced、org standard/advanced employee；content snapshot 只读；不混入 organization training。

## 数据兼容与爆炸半径

- 新列/表对历史记录采用显式 incomplete/legacy 语义，不伪造历史评分证据，不静默重算成绩。
- migration 使用单数 snake_case、规范索引/唯一索引、BIGINT FK；外部 URL 仅 public id。
- terminal supplement 和 report rebuild 是高风险写路径，必须以 mock/answer 行锁、唯一约束和幂等键收敛。
- UI 修改限制在学员 practice/mock/report 与共享 student runtime；不顺手整改 RC-08 或 P1/P2 的广泛 UI shell。

## P1/P2 影响映射（只记录）

- 可能覆盖：F-0013、F-0018、F-0020、F-0026、F-0027、F-0034、F-0065、F-0067、F-0079、F-0135、F-0137、F-0142、F-0152、F-0162、F-0164、F-0169、F-0172、F-0175、F-0176。
- 可能语义变化：F-0003、F-0019、F-0108、F-0132、F-0133、F-0138、F-0141、F-0161、F-0163、F-0165、F-0168、F-0173。
- P0 后必须重验：F-0023、F-0139、F-0159。
- 本任务不关闭、不降级、不实现任何 P1/P2。

## 验证命令

```text
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual
corepack pnpm@10.15.1 exec vitest run tests/unit/p0-rc-07-answer-mock-scoring-report.test.ts tests/unit/p0-rc-07-schema-migration-source.test.ts --reporter=dot
corepack pnpm@10.15.1 run test:unit
corepack pnpm@10.15.1 run lint
corepack pnpm@10.15.1 run typecheck
corepack pnpm@10.15.1 run format:check
corepack pnpm@10.15.1 run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-07-answer-mock-scoring-report-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-07-answer-mock-scoring-report-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-07-answer-mock-scoring-report-2026-07-14 -SkipRemoteAheadCheck
```

## 暂停与排除

- 暂停：需要数据库 apply/read/write/backfill/seed、真实 secret/env、Provider/模型请求、worker 激活、依赖、runtime/browser/e2e、PR、force push 或部署。
- 排除：RC-08 企业训练、P1/P2 修复、21 项运行时验收、历史数据清理/重算。
- standing authorization 仅覆盖门禁通过后的 local commit、ff-only master merge、origin/master push 与 cleanup。
