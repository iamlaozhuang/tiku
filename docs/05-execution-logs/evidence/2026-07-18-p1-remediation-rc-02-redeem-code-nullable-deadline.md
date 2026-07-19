# P1 RC-02 redeem_code 长期可兑换证据

日期：2026-07-18

任务：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已读取标准/高级需求入口、用户授权 module/story、edition-aware authorization requirements、ADR-007、advanced ops authorization/quota module/story、2026-07-02 redeem_code 决策与 UI/UX contract、requirement SSOT governance，以及 F-0117 ledger/post-P0 map/root-cause cluster、最新 schema/migration/snapshot、全链 contracts/services/repositories/UI/tests。

## Requirement Mapping Result

Result: pass

稳定需求明确规定兑换截止日可选；未设置时，未使用卡密长期可兑换。该语义独立于兑换后的授权 `durationDay`，也不改变 edition 或明文分发边界。

## JIT Revalidation Result

Result: pass

当前 schema 与最新 snapshot 仍为 NOT NULL；service 仍在省略输入时生成默认有限日期；DTO、repository、preview 与 UI 仍要求非空 deadline。后续提交没有 supersede F-0117，finding 在 `2807507cb5f1d2caf7b19d9174b1d687c371ab37` 基线继续成立。

## Root-Cause Reproduction

Result: pass

- `src/db/schema/auth.ts` 通过 `timestampColumn` 固化 NOT NULL；初始 migration 和最新 snapshot 同样非空。
- admin service 的 omitted 分支调用 `createDefaultRedeemDeadlineAt`；null 不可能到达 repository。
- repository 和 preview model 对 deadline 无条件比较或调用 `.toISOString()`。
- admin/student UI 对 deadline 无条件格式化，管理端空日期被拒绝。
- 现有聚焦 baseline 8 files / 66 tests passed，但没有 null deadline case，因此是覆盖缺口而非 finding 已关闭。

## Fresh Approval

Result: pass

用户于 2026-07-18 批准方案 A，并明确“仅批准 schema/migration source，不批准数据库执行”。授权已物化至 `docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-redeem-code-nullable-deadline-authorization.md`，`schemaMigration: approved_source_generation_only_no_execution`，`databaseMutation` 保持 blocked。

## Scope Freeze

Result: pass

- 设计 transition 仅 7 文件：state、queue、design task plan、evidence、audit、fresh approval、design spec。
- 产品阶段只允许精确列出的 schema/migration source、nullable contracts/repositories/model/UI 与聚焦 tests。
- package/lockfile、seed、真实 DB、Provider、browser/runtime、P2、PR、force-push、deploy 均未授权。

## Baseline Validation

Result: pass

命令：`corepack pnpm exec vitest run`，覆盖 admin generation/list/detail/concurrency、student preview/confirm、service/route 与 admin/student UI。

结果：8 files / 66 tests passed，0 failed。

## Design Review Evidence

Result: pass

第一轮从数据不变量复核 null、finite、explicit expired 三态，确认方案必须贯穿 DB/API/repository/preview/confirm/UI，远未来哨兵和 UI-only 标志均不能满足需求。

第二轮对抗 omitted/null/empty、filter/sort、canonical version、confirm race、migration drift、明文脱敏和 DB 禁止边界。规格已补入：空字符串失败、升降序 nulls last、canonical facts 显式含 null、generate 发现额外 drift 即停止、仅 source 不执行。

## Transition Evidence

Result: pass_pre_commit

- `git diff --check`：pass；设计 transition 精确 7 文件，产品、测试、schema、migration 均为零 diff。
- `Test-P1RemediationSerialProgram.ps1 -Phase pre_commit`：pass；current task F-0117、materialized task count 11。
- `Test-P0RemediationGlobalBaseline.ps1`：pass；35 P0 findings、143 P1/P2 impacts、21 runtime pending、0 dependency cycle。
- `Test-ModuleRunV2PreCommitHardening.ps1`：pass；7/7 文件均命中 allowlist，敏感证据与术语扫描通过。
- 待提交后记录 pre-push `transition_only`、ff-only merge 与 origin/master 同步结果。普通 `in_progress` SHA drift 保持 hard-block。

## 品味合规自检 Checklist

- [x] 设计保持 route/service/repository/schema 分层，不在 UI 建立授权事实。
- [x] API optional 字段使用显式 null，不使用空字符串或省略输出 key。
- [x] 未新增依赖、硬编码颜色、SQL 拼接或无意义术语。
- [x] schema 变更只走 Drizzle 可审查 migration source；数据库执行明确 blocked。
- [x] 明文 redeem_code、hash、内部 id、secret 与真实数据库信息未进入证据。
- [x] WIP=1、P1/P0/Module、closeout 与远端权限边界未降级。

## 2026-07-18 Product RED/GREEN Checkpoints

Result: pass

- Task 1 schema/migration source：RED 为 2 files failed、3 failed / 8 passed；GREEN 为 2 files / 11 tests passed。migration 仅生成 source 与 metadata，未连接或执行数据库。
- Task 2 admin contract/service：RED 先证明 omitted/null 仍被合成有限日期（4 failed / 20 passed），再证明 `durationDay` fallback 缺口（2 failed / 26 passed）；GREEN 为 2 files / 28 tests passed。
- Task 3 repository：RED 为 5 failed / 17 passed；最终 GREEN 为 2 files / 24 tests passed。独立 review 要求后，用 PostgreSQL dialect 编译真实 Drizzle condition/order expressions，锁定 filter 分组和两向 null-last。
- Task 4 preview/confirm：RED 为 2 个 nullable feature failure；GREEN 为 3 files / 29 tests passed，并以 mutation check 证明旧 null 比较会失败。
- Task 5 UI：RED 为 3 failed / 27 passed；GREEN 为 2 files / 30 tests passed。admin 长期 control、请求 null、全表面显示与 student preview 均覆盖。
- Task 1 至 Task 5 的逐任务独立审查均为 Approved；这不替代 Task 6 的两轮累计最终审查。

## Approved Smoke Scope Correction

Result: pass

首次 full unit 唯一失败来自历史 F-0116 migration smoke 把自身 migration 固定为 journal 永久末项。用户批准的精确治理热修已将
`tests/unit/p1-employee-import-command-migration-source.test.ts` 加入 F-0117 allowlist，且普通 `in_progress` SHA drift 继续 hard-block。

产品 smoke 修正仅删除永久 terminal 假设并同步测试名；migration entry 唯一性、相邻 idx、snapshot `prevId` 线性、版本、方言与完整结构断言均保留。该修正 RED 为 3 failed / 6 passed，GREEN 为 1 file / 9 tests passed，并经独立 reviewer Approved。

## Final Focused And Full Regression

Result: pass

- 最终聚焦命令：implementation plan 声明的 10-file matrix，单 worker。
- 聚焦结果：10 files / 108 tests passed，0 failed；Vitest duration 27.11s。
- Fresh full unit 命令：`npm.cmd run test:unit -- --maxWorkers=1`。
- Full unit 结果：420 files / 2701 tests passed，0 failed；Vitest duration 926.05s。
- `npm.cmd run lint`：exit 0，0 error。
- `npm.cmd run typecheck`：exit 0。
- `npm.cmd run format:check`：最终 exit 0。首次仅发现 5 个 Git-ignored `.superpowers/sdd` task brief；确认 `tracked=false`、`ignored=true` 后只对这些本地 agent brief 做 targeted Prettier，tracked status 前后不变。
- `git diff --check` 与 `git diff --cached --check`：exit 0。

## Production Build

Result: pass

- fixture：`D:/tiku/.worktrees/f0117-build-fixture`，由当前 cached + untracked non-ignored 文件复制形成，共 8958 files。
- build 命令：从 `D:/tiku` 执行 `npm.cmd run build -- .worktrees/f0117-build-fixture`。
- build 结果：exit 0；Turbopack 19.4s 编译成功；TypeScript 30.7s 完成；96/96 static pages generated；命令 wall time 87.5s。
- cleanup：删除前确认 resolved path 是 `D:/tiku/.worktrees` 的 direct child 且不是 reparse point；fixture 已删除，`FIXTURE_REMOVED=True`。
- 未遍历或删除产品 worktree 的 `node_modules` junction。

## Migration And No-Database Evidence

Result: pass

- 唯一 migration：`drizzle/20260718100413_p1_rc_02_redeem_code_nullable_deadline.sql`。
- 唯一 SQL 语句：`ALTER TABLE "redeem_code" ALTER COLUMN "redeem_deadline_at" DROP NOT NULL;`。
- snapshot/journal 保持线性；除新 id、`prevId` 与目标列 `notNull: true -> false` 外无 schema drift。
- 本产品任务只生成 migration source；未运行 migrate、push、SQL、backfill、seed，未连接或读取数据库。

## Security And Scope Negative Evidence

Result: pass

- `null` 未被空字符串或远未来哨兵替代；DTO 保留 `redeemDeadlineAt` key。
- 明文 `redeem_code`、卡密 hash、真实手机号、凭据、token、连接字符串、内部自增 id 与数据库 payload 未写入本 evidence/audit。
- package/lockfile、env、dependency、Provider、browser/runtime、P2、PR、force-push 与 deploy 均无 diff 或动作。
- 当前产品累计路径限定为 queue allowlist；state/queue transition 不属于本产品候选。

## Final Review And Governance Status

Result: governance_pass_two_reviews_approved_ready_for_product_commit

- Task 6 cumulative Round 1：Approved；Critical 0、Important 0、Minor 1。review package 与实时 staged diff patch-id 一致；nullable 三态、DTO null key、filter/status/null-last、preview version、confirm JIT、migration exactness、no-DB、脱敏与审批边界均通过。
- Round 1 唯一非阻断 Minor：F-0117 新 migration smoke 仍包含当前 migration 必须为 journal 末项的假设。该假设不影响本任务 migration source 的唯一性、相邻 idx、snapshot `prevId` 或 schema exactness，但会给后续合法 migration 制造重复摩擦；按既定边界递延至 F-0117 closeout 后的窄口径机制评估，不在当前产品提交扩修。
- Task 6 cumulative Round 2：Approved；Critical 0、Important 0、Minor 1。独立 reviewer 确认最新 synthetic 为单父、tree 与 index 一致、stable patch-id 一致，并未能推翻 null/explicit expired/finite past/filter/null-last/version/JIT/duration/edition/plaintext/concurrency/migration/no-DB/F-0116 smoke 不变量。
- Round 2 认可 Round 1 Minor 不阻断本次 closeout；当前扩修 F-0117 自身 terminal smoke 会超出一次性 F-0116 smoke scope-correction，故保持递延。
- 主线程逐项复核：pass；核心实现、范围、验证报告、两轮 review disposition 与 staged diff 一致。
- P1 manual：pass；`p1ProgramGuardResult: pass`，current task F-0117，materialized task count 11，scope mode standard。
- P0 global：pass；35 P0 findings、143 P1/P2 impacts、21 runtime pending、8 root-cause clusters、0 dependency cycle。
- Module pre-commit：pass；27/27 files 命中 F-0117 allowlist，sensitive evidence 与 terminology scan 均无 finding。
- Module 首次运行正确 hard-block implementation plan 中的数据库连接变量名/占位值。只在允许的 plan 文档中将该历史命令改为不记录变量名/值的 source-generation 说明后复跑通过；未改 guard、产品或测试语义。
- `schemaMigration` 仍为 source-only approval；`databaseMutation`、Provider、runtime/browser、P2、PR、force-push 与 deploy 继续 blocked。
- 当前允许进入唯一产品 commit；尚未执行 `ready_for_closeout` transition、merge、push 或 cleanup。

## Validation Results

Result: pass

Focused/full unit、lint、typecheck、format、build、P1、P0 与 Module pre-commit 均已通过；27 个文件全部命中 F-0117 allowlist，数据库执行边界保持 blocked。

## Round 1 Review Result

Result: pass

独立累计审查 Approved；Critical 0、Important 0、Minor 1。唯一 Minor 为后续 migration 会触发的 terminal-smoke 机制摩擦，不影响当前产品不变量。

## Round 2 Review Result

Result: pass

独立对抗审查 Approved；Critical 0、Important 0、Minor 1。未能推翻 nullable、过期、筛选、排序、version、JIT、migration exactness 与 no-DB 结论。

## Closeout Readiness Evidence

Result: pass

- Cost Calibration Gate remains blocked。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`：首次正确 hard-block 缺失的标准 closeout evidence 投影；补齐本节后 fresh retry pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18 -SkipRemoteAheadCheck`：首次在 evidence 修正与 ready transition 同时存在的中间态正确 hard-block 非纯 transition-only 候选；产品 amend 后仅以 state/queue 两文件重新创建 transition 并 fresh retry。
- `threadRolloverGate: continue_current_thread_after_f0117_closeout_for_narrow_mechanism_efficiency_assessment`。
- `nextModuleRunCandidate: narrow_governance_efficiency_assessment_before_next_p1_product_task`；只处理声明式 transition/smoke 复用与 terminal-smoke 摩擦，不提前领取下一个产品 finding，不降低任何门禁。
