# P0 整改启动包 v1.0 Evidence

日期：2026-07-14

边界：docs-only；未修改业务代码、测试、依赖、schema、migration 或外部配置；未执行 runtime validation。

## 1. 物化文件

| 文件      | 绝对路径                                                                                                                              | SHA-256                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| task plan | `D:\tiku\.worktrees\p0-remediation-startup-v1\docs\05-execution-logs\task-plans\2026-07-14-p0-remediation-startup-package-v1.md`      | `D3651B9A9331B99AD3E4A1BE38B4995042495A7A9227782E80A541F07622F891` |
| 启动包    | `D:\tiku\.worktrees\p0-remediation-startup-v1\docs\05-execution-logs\audits-reviews\2026-07-14-p0-remediation-startup-package-v1.md`  | `F1C2A9E330C4280B1C3E5C5DC7BE07783FBE5D89760E48623EFD6F8280C3F954` |
| P0 ledger | `D:\tiku\.worktrees\p0-remediation-startup-v1\docs\05-execution-logs\audits-reviews\2026-07-14-p0-remediation-finding-ledger-v1.yaml` | `70291A41EA555F2E9A57D0672EBC14BD245747FE45CAA091C8F224C567BE2387` |
| evidence  | `D:\tiku\.worktrees\p0-remediation-startup-v1\docs\05-execution-logs\evidence\2026-07-14-p0-remediation-startup-package-v1.md`        | 不记录自引用哈希                                                   |

## 2. 双仓库基线证据

### 2.1 `D:\tiku`

执行：

```powershell
git branch --show-current
git rev-parse HEAD
git cat-file -p HEAD | Select-Object -First 1
git status --porcelain=v1
git rev-parse refs/remotes/origin/master
git rev-list --left-right --count HEAD...refs/remotes/origin/master
git ls-remote origin refs/heads/master
git worktree list --porcelain
git diff --name-only 7aac83765ca4b650b73b1612013e26a0111775ae HEAD
```

结果：

- root branch：`master`
- HEAD：`7aac83765ca4b650b73b1612013e26a0111775ae`
- tree：`a1961f75ce6fdec455be0b028e314eb39c122d33`
- root status：clean
- local `origin/master`：`7aac83765ca4b650b73b1612013e26a0111775ae`
- live remote `master`：`7aac83765ca4b650b73b1612013e26a0111775ae`
- ahead/behind：`0/0`
- 审计源基线到当前 HEAD 的 committed file diff：空
- 本任务 worktree：`D:\tiku\.worktrees\p0-remediation-startup-v1`，branch `codex/p0-remediation-startup-v1`，基于同一 HEAD
- `.gitignore:7` 已忽略 `.worktrees/`。

结论：当前源代码提交与审计源基线相同，不存在需按变更文件定向重基线的 P0。

### 2.2 `D:\tiku-readonly-audit`

执行：

```powershell
git branch --show-current
git rev-parse HEAD
git cat-file -p HEAD | Select-Object -First 1
git status --porcelain=v1
git remote -v
git fsck --full --no-dangling
Get-FileHash -Algorithm SHA256 <六项关键材料>
```

结果：

- branch：`feat/calibration`
- HEAD：`a84224fa12ec85b28e6acd945deba2afa28c6c02`
- tree：`668acf31e8579410b9969c1370f2405485b8fdd4`
- status：clean
- remote：无
- `git fsck --full --no-dangling`：exit 0，无错误输出

六项哈希：

- `C3E3BEFBBD0BA55FB11B75ACD324AF566CBD343A1470495BA6F399328E0307E2` final synthesis
- `748541195D4C6C6725DD8BFC803C9F029FF1D1F911B009E37A6CCBDA3338D16E` global reconciliation
- `CDB8CE059566ABEDDA3D4C723E3F048ECFA677697053FB7765D6EF46273752F2` finding register
- `61AC94E58CBF10F7C0A8C729096C2158AAF7567DD4982B1A957B0F57042FBCAA` runtime backlog
- `7988442B3928580A6A84E5189BF192F62457F7375792BA105644A0AF07C1C6F0` runtime sequencing
- `1A0AFA955676E95CF98E71C5FCB40C4B2CD410EEB4664A00515B29DB00D27AAA` final completion audit

结论：审计仓库未改动，原始 finding 状态未被追加、改写或重开。

## 3. 状态与队列

- `project-state.yaml` SHA-256：`C636F4D1FBEE50E88940C668E8419B16C8AAE7518859828819C132F1FB6FA6AE`
- `task-queue.yaml` SHA-256：`775A9BF2F1789735BA7F197537E8B0897614251DAFE2597E88D9558395E7A6D6`
- current task 与 active task 均为已关闭 F5 终态；没有 active pending 产品任务。
- `repositoryCheckpoint` 的 `20e396...` 是已关闭治理元数据陈旧值；实际 Git 三方基线已独立验证为 `7aac837...`。
- 现有 recovery smoke 对未知顶层任务和非 canonical 终态 fail-closed，因此本任务保持 state/queue 不变，以四个新增文件恢复。

## 4. 规范化与一致性机器校验

执行 Python 只读校验：

- ledger ID 集合与 `finding-register.yaml` 中 `riskLevel=P0` 集合严格相等；
- P0 数量、唯一性、原证据状态、复验分类、根因簇完整性；
- 每行必填字段、原 finding 关系和 duplicate candidate；
- 主包 P1/P2 四分类与 143 个 P1/P2 集合严格相等；
- 8 个验收契约、5 个计划 SSOT 章节、唯一 WIP 首项；
- Mermaid DAG 边提取和 Kahn 拓扑无环；
- runtime backlog 数量、状态和审批要求。

输出：

```text
PASS P0 35/35 unique; confirmed=30 root_cause_alias=5; clusters=8
PASS P1/P2 143/143 unique; categories=102/36/3/2
PASS runtime backlog 21/21 pending+approvalRequired
PASS DAG acyclic nodes=8 edges=17; WIP first=RC-01 only
PASS required plan sections and 8 acceptance contracts
```

说明：

- `root_cause_alias` 的 5 项仍是独立 confirmed finding，不是 duplicate/resolved。
- `duplicate_candidate`、`false_positive_candidate`、`baseline_changed`、P0 `runtime_evidence_required` 均为 0。
- 全局唯一 `runtime_evidence_required` 仍是 P1 F-0013；本轮未执行其 runtime validation。

## 5. P1/P2 越界防护

机器校验确认：

- 143 个 P1/P2 全部且仅登记一次；
- `potentially_covered=102`；
- `semantic_change=36`；
- `revalidate_after_p0=3`；
- `unrelated_deferred=2`；
- 没有改写只读 finding register；
- 没有把影响映射表述为复验、修复或关闭。

## 6. 治理门禁

执行：

```powershell
node D:\tiku\node_modules\prettier\bin\prettier.cjs --check <plan> <package> <ledger>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.Smoke.ps1
```

输出：

```text
All matched files use Prettier code style!
Content admin platform recovery surface smoke passed: 4 positive, 9 negative
Content admin platform serial program guard smoke passed: 2 positive, 13 negative
```

这些 smoke 只证明既有治理终态未被本任务破坏，不证明 P0 业务已修复。

## 7. 源码和审计仓库不变检查

本任务 worktree allowlist 只能包含：

- `docs/05-execution-logs/task-plans/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`
- `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-startup-package-v1.md`

最终 allowlist 校验、`git diff --check`、四文件 format check、root clean、audit clean 和哈希重算见第 9 节最终恢复输出。

## 8. 对抗式一致性检查

| 检查                                  | 结果 |
| ------------------------------------- | ---- |
| 35 个 P0 全部且仅一次                 | pass |
| 与 finding register P0 数量/集合相等  | pass |
| finding → 根因簇完整                  | pass |
| 共因未误合并为 duplicate/resolved     | pass |
| 无 P0 降级                            | pass |
| 未把静态证据不足当作不存在            | pass |
| P1/P2 只做影响映射                    | pass |
| 8 个根因簇均有验收契约                | pass |
| DAG 无循环                            | pass |
| WIP 只有 RC-01 一个首项               | pass |
| audit 仓库完全未改                    | pass |
| source 业务代码/测试/依赖/schema 未改 | pass |
| 可从物化文件恢复                      | pass |

## 9. 最终恢复演练

```text
PASS recovery files=6 planSteps=25/25 p0=35 clusters=8 currentTask=closed activePending=0 wip=RC-01
PASS source master=origin/master=remote/master=7aac83765ca4b650b73b1612013e26a0111775ae rootClean=true
PASS audit head=a84224fa12ec85b28e6acd945deba2afa28c6c02 tree=668acf31e8579410b9969c1370f2405485b8fdd4 clean=true fsck=true
PASS worktree branch=codex/p0-remediation-startup-v1 allowlist=4 businessCodeChanged=0 auditChanged=0
```

恢复输入只允许：

1. 只读 `project-state.yaml`；
2. 只读 `task-queue.yaml`；
3. 本 task plan；
4. 本启动包；
5. P0 ledger；
6. 本 evidence。

不依赖当前对话记忆，不读取或改写业务运行时。

## 10. 非声明

- 没有 P0 被声明为已修复。
- 没有业务验收或 runtime acceptance 声明。
- 21 项 runtime validation 仍全部 pending，且需要相应批准。
- 未提交、未 push、未创建 PR、未部署。
