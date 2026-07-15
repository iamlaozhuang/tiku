# P0 RC-03 Evidence

Date: 2026-07-15

Task: `p0-remediation-rc-03-authorization-object-scope-2026-07-14`

Status: `in_progress`

result: pending

## Baseline And Recovery

- claim base/master/origin/live remote: `4be7cfb8e264dd0a42def6a2e744e2cc108238d9`
- branch: `codex/p0-rc-03-authorization-object-scope`
- worktree: `D:/tiku/.worktrees/p0-rc-03`
- RC-02 remote sync、worktree cleanup、short branch cleanup 已核实通过。
- `D:/tiku-readonly-audit` 保持只读，HEAD `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- 依赖按既有 lockfile 使用 `corepack pnpm@10.15.1 install --frozen-lockfile --offline` 在隔离 worktree 恢复；未修改 package/lockfile。
- 隔离 worktree baseline：`381/381` test files、`2207/2207` tests passed。

## Reading Evidence

status: complete

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

conflictsFound: false

完整读取清单、SSOT 顺序、RC-01/02 影响和 P1/P2 影响映射见 task plan。当前分类：F-0011 confirmed after baseline change；F-0014 confirmed after baseline change；F-0016 root_cause_alias after baseline change。原 finding 独立保留。

## Requirement Mapping Result

- F-0011：enterprise training 写链必须以服务端当前 `org_auth` 事实校验 organization、profession、level、edition 和有效期。
- F-0014：personal、employee、organization admin AI 生成必须校验显式选中 authorization 与请求 scope 精确一致。
- F-0016：employee training 所有对象级读写必须把 version lineage 与全部当前 advanced 原子授权上下文求交。
- 无法被上述共因吞并的独立验收义务仍分别保留；未把静态证据不足解释为问题不存在。

## Validation Log

- branch baseline full unit: pass，381 files / 2207 tests。
- RED/GREEN、两轮复核、full gates、提交、fresh-master、push 和 cleanup 待本任务后续补写。

## Non-Actions

- 未新增 schema/migration，未执行数据库访问或变更。
- 未执行 runtime/browser/e2e/Provider/Cost Calibration。
- 未修改依赖、lockfile、env、外部配置；未创建 PR、未 force push、未部署。

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_03_closeout

nextModuleRunCandidate: `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`
