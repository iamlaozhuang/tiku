# P1 F-0117 Smoke Scope-Correction Closeout Lifecycle Hotfix Audit

## Round 1

Result: pass

- 第一性原理核对：一次性 special path 的授权事实不是“identity 永久存在”，而是“identity 在批准 base 之上首次物化且 origin 尚未同步”。
- RED 在真实 synced identity 状态直接复现，排除产品文件、fixture 构造或网络因素。
- 修复仅改变 old candidate 生命周期，不删除 old topology、authorization、file-set、transition-only 或 replay 检查。

## Round 2

Result: pass

- 对抗式检查检出首轮 generic F-0117 fallback 过宽：普通 `in_progress` unrelated drift 曾错误通过 transition ancestry。
- 最终 fallback 增加 closeout 状态约束；`in_progress` 仍由原专属 transition 或 hard-block 处理。
- 本 follow-up exact contract 不含 state/queue，且十文件外的 missing/extra、wrong base/branch/task/status、standard mode、多父与 replay 全部保持 hard-block。

## Round 3

Result: pass

- 独立的 focused 与 full pre-push 均证明：旧 identity 同步后不再选择旧 special topology；首次 follow-up 仍必须 exact-one-parent + origin-at-base + transition-only。
- P1 full `15 positive / 81 negative` 与 Module pre-commit/pre-push full smoke 全部 exit 0，未发现既有 F-0115/F-0116/F-0117 transition 回归。
- 真实 staged candidate 精确 10 文件通过；缺失 audit 的对抗负例由 P1/Module 双守卫专属 hard-block。
- 最终 diff 不含 state/queue、产品、schema/migration、依赖、Provider/runtime/P2 或远端动作。

## Round 4 - Independent Review Remediation

Result: pass

- 接受 Important：共享 generic predicate 已恢复为仅 `in_progress`，没有改变其他 P1 task 的 closeout transition 授权。
- F-0117 closeout ancestry 现在由独立 predicate 持有，且只在 `TaskId` 与 `stateCurrentTaskId` 均精确等于 F-0117 parent、无 smoke/spec special candidate、task 为 closeout status 时参与 fallback。
- 对抗 fixture 同时投影 state `currentTask.id`、program `currentTaskId` 与 active task id，避免因残留 F-0117 context 产生假 GREEN。
- 非 F-0117 closeout transition-only、F-0117 ordinary `in_progress` drift 均得到 `HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID`；F-0117 synced closeout 正例保持 GREEN。

## Round 5 - Split-Identity Review Remediation

Result: pass

- 接受 Important：OR context 不能证明 CLI task identity 与 state projection 一致；ancestor checkpoint 必须要求两者同时精确匹配批准的 F-0117 parent。
- RED 证明 `TaskId=F-0117 / stateCurrentTaskId=非 F-0117` 会被旧谓词错误放行；修复后反向组合 `TaskId=非 F-0117 / stateCurrentTaskId=F-0117` 也由 focused fixture 对抗覆盖。
- 生产谓词仅把一项 OR context 替换为两项精确相等条件；branch、head、state SHA、origin ancestry、closeout status 与 special-candidate 排除条件均保持不变。
- 两个 split-identity mismatch 与普通 F-0117 `in_progress` drift 均 hard-block；同步后的合法 F-0117 closeout 正例仍通过。

## Round 6 - Final Independent Review

Result: pass

- 独立 reviewer 最终 Approved；Critical 0、Important 0、Minor 0。
- 共享 generic 保持仅 `in_progress`；F-0117 专用 closeout predicate 同时精确绑定 CLI `TaskId` 与 state `currentTaskId`，并只在 no-special-candidate fallback 使用。
- 最终 Module pre-push full smoke fresh rerun 360.2 秒、exit 0；旧 scope、新 lifecycle 与 Module readiness marker 全部通过。

## Taste Compliance Checklist

- [x] 1-4 前端/UI：无 UI、字体、颜色、交互或 Tailwind 变更。
- [x] 5 数据访问：无 ORM、查询或 N+1 风险。
- [x] 6 Schema：无 schema、SQL、migration 或数据库执行。
- [x] 7 API：无 API 契约变更。
- [x] 8 注释：fixture 注释只表达安全边界与测试意图。
- [x] 9 命名：使用完整 F-0117 smoke scope closeout lifecycle 术语，无自造缩写。
- [x] 10 不可变性：无应用状态对象或数组修改。

## Decision

Decision: APPROVE

Disposition：允许进入精确十文件验证与主线程独立复核；本子任务禁止 commit、merge、push 或 cleanup。
