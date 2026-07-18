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
