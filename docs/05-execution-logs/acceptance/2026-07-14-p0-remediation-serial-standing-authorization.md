# P0 Remediation Serial Standing Authorization

Date: 2026-07-14

Authorization ID: `current-user-approved-p0-remediation-serial-goal-2026-07-14`

Program: `p0-remediation-rc-01-to-rc-08-2026-07-14`

Status: `approved`

## Authorization Source

用户明确确认此前给出的 “P0 串行总控 Goal” 方案，并要求按该要求设置 Goal、立即推进，直到目标达成。
该确认覆盖 RC-01 至 RC-08 的 WIP=1 串行执行、每簇独立计划与隔离、TDD、两轮对抗式复核、evidence、
任务提交、ff-only 合入 `master`、普通推送 `origin/master`、远端同步后清理短分支/worktree，以及 RC-08
后的 P0 全局静态回归、P1/P2 影响映射重校准和 P0 新基线冻结。

## Covered Scope

- P0 整改启动包 v1.0 与串行 Program bootstrap。
- `RC-01 -> RC-02 -> RC-03 -> RC-04 -> RC-05 -> RC-06 -> RC-07 -> RC-08`。
- RC-08 后的 P0 全局静态回归、35 个 P0 整改结论对账、P1/P2 影响映射重校准和新基线冻结。
- 每个 task 范围内已经在 `allowedFiles` 物化的产品源码、产品测试、治理文档和本地静态验证。
- 每个 task 完成后的本地 commit、ff-only merge 到 `master`、普通 `git push origin master`、远端同步确认、
  已合入短分支和 worktree 清理。

## Mandatory Per-Task Preconditions

1. 从 clean 且与实时远端同步的 `master` 创建独立短分支/worktree。
2. 先读 `project-state.yaml`、`task-queue.yaml`、上一 task evidence、`AGENTS.md`、品味十诫、全部 ADR、
   当前 RC 的 requirement module/story/traceability、审计 finding 与目标源码/测试。
3. 创建独立 task plan，列出 finding、业务不变量、纳入/排除、精确 allowlist、风险和验证命令。
4. 业务缺陷按 TDD 先形成可观察 RED，再做最小 GREEN；不顺手处理 P1/P2 或下一 RC。
5. 完成 focused/impact-triggered gates、两轮不同重点的自对抗复核、evidence 和可审查提交。
6. 当前 task 实际 commit、ff-only merge、`origin/master` 同步、fresh checkout 门禁与资源清理完成后，才可
   在下一 task 投影中把前一 task 记为 `closed` 并领取后继 task。

## Fresh Approval Still Required

- 新增、删除或升级依赖，修改 `package.json` 或 lockfile。
- schema、migration、数据回填/修复、数据库读写验证、fixture/seed。
- runtime acceptance、浏览器/e2e、多实例/断网等运行时验收。
- Provider/model 调用、secret/env、外部服务、Cost Calibration。
- PR 创建或更新、`--force-with-lease`/force push、部署、staging、production、cloud、payment。
- 任何超过当前 task `allowedFiles` 或改变既定业务范围的动作。

## Explicit Exclusions

- P1/P2 实现；本 Program 只允许影响映射和 P0 后重新复验路由。
- 21 项 runtime validation；它们保持 pending，不得因静态整改被表述为业务验收通过。
- PR、部署、release readiness、production usability 或 final business acceptance。
- 修改或追加 `D:/tiku-readonly-audit`。

## Closeout Policy Template

```yaml
closeoutPolicy:
  authorizationSource: docs/05-execution-logs/acceptance/2026-07-14-p0-remediation-serial-standing-authorization.md
  localCommit:
    approved: true
  fastForwardMerge:
    approved: true
    targetBranch: master
  push:
    approved: true
    target: origin/master
  cleanup:
    deleteShortBranch: true
```

只有任务级 queue block 完整物化该模板，且 scope、validation、review、evidence、remote divergence 和 fresh
checkout 门禁通过时，才可消费授权。该模板不能推导 PR、force push 或部署权限。

## Deployment And Runtime Gates

```yaml
deployment:
  approved: false
  status: blocked_requires_fresh_user_approval
runtimeAcceptance:
  approved: false
  status: excluded_from_program
p1P2Remediation:
  approved: false
  status: impact_mapping_only
```

普通 push 不是部署；静态修复不是 21 项 runtime validation 通过。
