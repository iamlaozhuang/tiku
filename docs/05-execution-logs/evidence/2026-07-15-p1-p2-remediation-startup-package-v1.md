# P1/P2 整改启动包 v1.0 Evidence

- Evidence status: pass
- Result: pass
- Result detail: 143 项一级复检、候选根因编排、一致性检查和 detached recovery 已完成；P1/P2 实现仍未授权。
- Cost Calibration Gate remains blocked.

## 范围

仅验证 governance/static planning 启动包。未修改或执行产品源码、产品测试、schema/migration、依赖、数据库、Provider、浏览器或 runtime validation。

## 基线恢复证据

恢复时执行：

```powershell
git -C D:/tiku branch --show-current
git -C D:/tiku rev-parse HEAD
git -C D:/tiku rev-parse origin/master
git -C D:/tiku ls-remote origin refs/heads/master
git -C D:/tiku status --short
git -C D:/tiku worktree list --porcelain
git -C D:/tiku diff --name-only e136ca28acde82282a17c65ccfb828a01e872c0b..0643ad4d6346453f3324d86b6e003c6726c808ef -- src tests drizzle e2e package.json pnpm-lock.yaml
git -C D:/tiku-readonly-audit branch --show-current
git -C D:/tiku-readonly-audit rev-parse HEAD
git -C D:/tiku-readonly-audit status --short
git -C D:/tiku-readonly-audit fsck --full --no-dangling
```

结果：

- root source：`master`，HEAD/origin/live 均为 `0643ad4d6346453f3324d86b6e003c6726c808ef`，clean；
- P0 产品业务静态基线：`e136ca28acde82282a17c65ccfb828a01e872c0b`；该基线到当前 master 的产品路径 diff 为 0；
- 隔离分支/worktree：`codex/p1-p2-remediation-startup-package-v1` / `D:/tiku/.worktrees/p1-p2-remediation-startup-package-v1`；
- audit：`feat/calibration`，HEAD `a84224fa12ec85b28e6acd945deba2afa28c6c02`，clean，fsck 通过；
- P0 全局 baseline guard：P0=35、P1/P2 impact=143、runtime pending=21、P0 clusters=8、cycle=0、P0 program closed；
- P0 serial guard：`passed_closed_program`。

审计材料 SHA-256：

| 文件                         | SHA-256                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| final static audit synthesis | `C3E3BEFBBD0BA55FB11B75ACD324AF566CBD343A1470495BA6F399328E0307E2` |
| nine-role reconciliation     | `748541195D4C6C6725DD8BFC803C9F029FF1D1F911B009E37A6CCBDA3338D16E` |
| finding register             | `CDB8CE059566ABEDDA3D4C723E3F048ECFA677697053FB7765D6EF46273752F2` |
| runtime backlog              | `61AC94E58CBF10F7C0A8C729096C2158AAF7567DD4982B1A957B0F57042FBCAA` |
| runtime sequencing           | `7988442B3928580A6A84E5189BF192F62457F7375792BA105644A0AF07C1C6F0` |
| completion audit             | `1A0AFA955676E95CF98E71C5FCB40C4B2CD410EEB4664A00515B29DB00D27AAA` |

## 143 项生成与一级复检

命令：

```powershell
& ./scripts/agent-system/New-P1P2RemediationStartupArtifacts.ps1
```

结果：`total=143 P1=125 P2=18`。解析校验结果：

- evidence：`baseline_changed=140`、`confirmed=2`、`runtime_evidence_required=1`；
- disposition：`pending_deep_revalidation=107`、`partially_covered_by_p0=35`、`runtime_hold=1`；
- execution：`pending=143`；
- P0 impact：`potentiallyCovered=96`、`semanticChange=35`、`revalidateAfterP0=10`、`unrelatedDeferred=2`；
- F-0013：`runtime_evidence_required + runtime_hold + pending`；
- candidate clusters：P1 9 个、P2 4 个，成员合计 143。

## 最终门禁

| 门禁                     | 结果                   | 摘要                                                                                                                                             |
| ------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| startup guard            | pass                   | 143 唯一、三维状态、13 簇、DAG、F-0013、21 runtime、state/queue、allowlist、审计完整性全部通过                                                   |
| generator determinism    | pass                   | ledger/map/clusters 重跑 SHA-256 不变                                                                                                            |
| independent YAML parse   | pass                   | PyYAML 独立解析 5 个 YAML；143 个 finding 的 14 个原始字段逐项比对，mismatch=0                                                                   |
| scoped format            | pass                   | 使用仓库既有 Prettier 检查 human-authored Markdown/state/queue；生成 YAML 使用确定性序列化和 parser gate                                         |
| `git diff --check`       | pass                   | 无 whitespace error                                                                                                                              |
| P0 global baseline guard | pass                   | P0=35、P1/P2 impact=143、runtime=21、clusters=8、cycle=0、program closed                                                                         |
| P0 serial guard          | pass                   | `pass_closed_program`                                                                                                                            |
| Module Run v2 pre-commit | pass                   | 11 个文件均在 allowlist；敏感信息与术语扫描通过                                                                                                  |
| Round 1                  | pass_after_corrections | 发现并修正一个引号列表解析偏差；把候选归并从机械 P0 影响域改为标题/横向能力优先，再以 P0 域兜底；无 finding 合并、降级或静态关闭                 |
| Round 2                  | pass                   | 9 角色均有覆盖，105 个受影响用例、29 个横向能力、17 个 finding runtime linkage 保留；P2 全部 pending，21 个 runtime 仍 pending+approvalRequired  |
| product zero-change      | pass                   | `e136ca28..HEAD` 和工作区在 `src/tests/drizzle/e2e/package/lockfile` 均无变化                                                                    |
| audit zero-change        | pass                   | audit HEAD/clean/fsck/六哈希通过                                                                                                                 |
| detached recovery drill  | pass                   | 从提交创建 detached worktree，仅凭物化文件运行 startup guard、P0 global guard 和 generator determinism；最终 amend 后重复验证，hash 在交付中记录 |
| local commit             | pass                   | 单一 governance 提交已创建；最终 hash 在交付中记录，避免文档自引用改变 commit hash                                                               |

## 两轮对抗式复核

Round 1 攻击数量、血缘、解析和根因误并：

- 独立读取原 `finding-register.yaml`，对 143 项的 risk/title/status/roles/use cases/capabilities/business impact/root cause/blast radius/runtime IDs/attack path/source baseline 共 14 类字段逐项比对；最终 mismatch=0。
- 首轮发现 F-0104 的 YAML 双引号被简单行解析保留，已修正生成器并重跑全部 143 项。
- 首轮还发现仅按 P0 impact cluster 归并会把 F-0003 注销/session 错放到 learner domain，已改为“明确失败语义 → 横向能力 → P0 影响域兜底”；F-0001/F-0003 现在进入 P1-RC-01。
- 首次提交钩子拒绝新增三个顶层 state/queue program 键；已按 recovery-surface 瘦身规则改为 `currentTask.startupPackage` + queue `activeTasks` 嵌套恢复面，未削弱任何门禁或审批边界。
- 30 项 shared API 簇、22 项 learner 簇和 18 项 AI 簇被明确标记为候选大簇，未来领取时必须按权威写路径拆分，不能直接作为单一实现任务。

Round 2 攻击跨角色、旧基线重开、P2 越界和 runtime 越界：

- 九角色均在 ledger 出现；原 use case、横向能力和 runtime linkage 完整保留。
- 已按 AI 基线恢复规则读取 2026-07-02 SSOT alignment、phase4 alignment、goal-completion audit 和 acceptance-baseline normalization；P1-RC-07 明确禁止无新鲜证据重开已 closed/superseded 的 20 类旧残留。
- P2 18 项全部 `pending` 且只属于 P2 候选簇；P1 冻结前无 P2 实现任务。
- F-0013 保持 runtime hold；全部 21 个 runtime validation ID 保持 unique/pending/approvalRequired。
- P0 global/serial guards 在启动包关闭 WIP 后通过，未反向破坏 P0 冻结结论。

## 审批边界

2026-07-16 用户已 fresh approval：允许本启动包 ff-only 合入 `master`、push `origin/master`，并在远端同步与 master 门禁通过后清理短分支/worktree。该授权不扩展到 P1/P2 实现、schema/migration、数据库、依赖、Provider、浏览器/runtime、PR、force push 或部署。

合入前对抗复核发现 startup guard 将 `origin/master` 固定为合入前 SHA，正常 push 后会误报漂移。guard 已收敛为仅接受“合入前冻结 SHA”或“当前启动包 HEAD”，同时要求 live remote 与本地 `origin/master` 完全一致；产品零漂移和文件 allowlist 门禁保持不变。

## Thread Rollover Decision

- threadRolloverGate: no rollover required；启动包已形成单一可恢复提交。
- 恢复入口：project-state、task-queue、本 task plan/evidence/audit、ledger/map/clusters 和 startup guard。

## Next Module Run

- nextModuleRunCandidate: none_current_goal_complete。
- 后续如进入 P1，必须新建并授权 P1 串行整改 Goal；不得从本启动包直接领取实现任务。
