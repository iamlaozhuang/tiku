# P1 整改效率循环

## 目的

本 SOP 只降低重复设计、重复等待和无效复核成本，不降低 P1/Module/P0/ContentAdmin 门禁、证据红线、审批边界、WIP=1、敏感信息保护或 Git closeout 纪律。

## RC 簇开始前 preflight

每个 RC 簇或 finding 开始前，用不超过两分钟回答并记录：

1. 当前 task allowlist 是否已覆盖计划中的测试、fixture、generated source 与治理文件？
2. 是否可能需要 scope-correction？若是，产品 RED 前先停止并走独立治理热修。
3. 是否涉及 schema/migration、依赖、数据库、Provider、runtime/browser、P2、PR、force-push 或部署？若是，按现有审批门禁停止。
4. 当前基线、分支、worktree、parent SHA、远端 SHA 与前序 closeout checkpoint 是否一致？
5. 本轮验证属于开发核心矩阵还是 closeout 完整矩阵？

preflight 只允许得出 `continue_product`、`governance_hotfix_first` 或 `hard_block_request_approval`，不得用“提效”绕过失败。

## scope-correction 治理热修模板

治理热修必须独立提交，并同时固定：

- `taskId`、parent task、base SHA、branch、单 parent、精确文件集合；
- 当前用户书面授权、allowedFiles、blockedFiles、stop conditions；
- `ancestorCheckpoint: only_after_transition_only_guard_pass`；
- `otherInProgressShaDrift: hard_block`、`hookBypass: prohibited`、`qualityGateReduction: prohibited`；
- evidence 的 Reading Evidence、Root-Cause Reproduction、TDD Evidence、Validation Results；
- audit 的 Round 1、Round 2 与唯一 `Decision: APPROVE`；
- P1/Module pre-commit 与 pre-push smoke 中的正例、重放、额外提交、错误父提交、额外文件和普通 SHA 漂移负例。

治理提交只有在真实 pre-push 同时输出 `transition_only` 与 `exact_one_parent` 后，才可使用 ancestor checkpoint。其他 `in_progress` 漂移一律 hard-block。

## smoke 分层

开发核心矩阵用于快速反馈：

- 6 个 PowerShell parser；
- 直接受影响函数/fixture 的最小正负矩阵；
- 当前 staged file set 的 P1/Module pre-commit。

closeout 完整矩阵必须运行：

- P1 完整 smoke；
- Module pre-commit 完整 smoke；
- Module pre-push 完整 smoke；
- P1/P0/Module 当前任务门禁和任务声明的产品验证。

核心矩阵不得作为 commit、merge、push 或 closeout 的完整证据替代品。任何核心矩阵失败都必须先修复，不能延后到完整矩阵。

## Subagent 使用门槛

必须保留独立复核：

- 高风险安全/授权/事务/锁序/恢复设计；
- 最终产品或治理审查；
- 跨 P1/P0/Module/ContentAdmin/审批/敏感信息边界的变更。

默认不触发层层复核：

- 已有结论下的普通 fixture 适配；
- formatter、行尾、标题或报告去重；
- 机械清单整理与已验证输出摘录。

后一类仍需本地门禁和主 Agent 自审；若出现新安全属性、边界变化或非机械判断，立即升级为独立复核。

## disposable Git fixture 复用

- 优先 `git clone --shared --no-checkout` 复用对象库，并固定 base SHA；禁止复用可变工作目录。
- Windows 使用 `core.longpaths=true` 与 sparse checkout，只检出守卫实际读取的 SSOT、state/queue、evidence/audit 和脚本。
- 每个 case 使用独立 branch/index/worktree 状态；基线对象可复用，提交拓扑和工作目录不得跨 case 复用。
- fixture 清理前验证路径位于系统临时目录或仓库 `.worktrees/`；不得跟随 junction 删除主工作区依赖。
- 复用不得减少 replay、额外 commit、wrong parent、wrong branch、extra file、ordinary drift 等对抗负例。

## closeout 复核

机制小修 closeout 前必须确认：

- P1/Module/P0/ContentAdmin 守卫没有减少或改为 advisory；
- schema/database/provider/runtime/P2/deploy/PR/force-push 权限没有扩大；
- state/queue active task 没有被污染；
- evidence/audit 已脱敏，Cost Calibration Gate 保持 blocked；
- ff-only、普通 push 与隔离资源清理仍按任务 closeoutPolicy 执行。
