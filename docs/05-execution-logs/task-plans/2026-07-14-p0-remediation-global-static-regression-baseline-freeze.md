# P0 全局静态回归与基线冻结方案

status: in_progress

taskId: `p0-remediation-global-static-regression-baseline-freeze-2026-07-14`

branch: `codex/p0-global-static-regression-freeze`

worktree: `D:\tiku\.worktrees\p0-global-static-regression`

## 目标与边界

- WIP=1，复核 RC-01 至 RC-08 的 35 个 P0 是否全部且仅有一个独立静态整改结论，并冻结新的 P0 静态基线。
- 对 125 个 P1、18 个 P2 只做影响映射重校准：记录潜在覆盖、语义变化、P0 后必须复验或与 P0 无关；不实施、不关闭、不降级。
- 对 21 项 runtime validation 只核对入口、依赖与 `pending/approvalRequired` 真值；不执行数据库、浏览器、Provider、worker、故障注入或 runtime acceptance。
- 不修改业务源码、schema/migration、依赖、外部配置或只读审计仓库；不创建 PR、不 force push、不部署。

## 已读取基线

- `D:\tiku\AGENTS.md`、品味十诫、ADR-001 至 ADR-007、requirements 根索引。
- `project-state.yaml`、`task-queue.yaml`、串行 Program、standing authorization、启动包与 finding ledger。
- RC-01 至 RC-08 的 plan/evidence/audit、当前 Git/远端/worktree、RC-08 fresh master closeout。
- 审计仓 final synthesis、AP-XR-002、finding register、runtime backlog/sequencing 与 final completion audit；审计仓保持只读。
- 当前源代码与测试基线；本任务仅验证跨簇合同、finding 结论、运行时边界和恢复面，不进入产品实现。

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`
- `D:\tiku-readonly-audit\reports\2026-07-14-ap-fin-001-final-static-audit-synthesis.md`
- `D:\tiku-readonly-audit\reports\2026-07-14-ap-xr-002-nine-role-state-handoff-global-reconciliation.md`
- `D:\tiku-readonly-audit\findings\finding-register.yaml`
- `D:\tiku-readonly-audit\runtime\runtime-validation-backlog.yaml`
- `D:\tiku-readonly-audit\runtime\runtime-acceptance-sequencing-ap-fin-001.yaml`
- `D:\tiku-readonly-audit\catalog\sources\final-completion-audit-ap-fin-001.yaml`

## 基线恢复

- 起点 `master` / `origin/master` / 实时远端均为 `5a23143c9559558cfdc0e2f5e028a170d60193e1`，根工作区 clean。
- RC-08 已提交、ff-only 合入、push；fresh master focused `178/178`、full unit `2386/2386`、lint/typecheck/format/build 均通过；worktree 与短分支已清理。
- 本 worktree 从同一 SHA 创建；本任务领取时把 RC-08 从 `ready_for_closeout` 校准为 `closed`，五个 closeout checkpoint 全部记录 `pass`。
- 审计仓为 `feat/calibration` / `a84224fa12ec85b28e6acd945deba2afa28c6c02` / clean / fsck pass；关键六文件 SHA-256 与启动包一致。

## 第一性原理不变量

1. 原始 35 个 P0 finding 身份永久保留；共享根因、alias 或同一修复提交不能吞并独立风险和验收义务。
2. 静态整改成立必须同时有实现锚点、focused/full regression、两轮对抗复核和未越过 runtime 边界的结论。
3. 每个 P0 恰好归属一个 RC，最终状态只能从对应 RC evidence/audit 推导，不能凭全量测试通过批量宣告。
4. P1/P2 影响映射不等于整改、关闭、降级或误报；F-0013 保持 `runtime_evidence_required`，其余原始状态不改写。
5. 21 项 runtime validation 在没有 fresh approval 和执行证据时必须保持 `pending`；静态修复不能表述为业务验收通过。
6. 新基线必须绑定可验证的源 SHA、审计 SHA、文档 hash、测试结果、未决边界和恢复入口。

## 执行顺序

1. 从只读 finding register 与本地 ledger 重算 P0/P1/P2、runtime 数量和唯一 ID。
2. 对账八份 RC evidence/audit，把 35 个 P0 逐项映射为静态整改结论、runtime 边界和 alias 关系。
3. 对抗式复核跨簇上游/下游合同：身份→organization→authorization→内容→RAG→AI→答题→组织训练。
4. 汇总各 RC 的 P1/P2 候选，形成 143 项唯一影响分类；不读取为“已修复”结论。
5. 物化 frozen baseline、P1/P2 impact map、全局 evidence/audit 与可重复验证脚本。
6. 执行脚本、格式、diff、串行 guard 与 Module Run closeout；进行中断恢复演练。
7. 合入 fresh master 后复核源/audit clean、SHA 三方一致、无短分支/worktree残留，再关闭 Program/Goal。

## 两轮对抗式复核

- Round 1：数量、唯一性、证据血缘、alias/duplicate/降级、跨簇依赖、测试与静态结论边界。
- Round 2：九角色、31 状态机、59 依赖、P1/P2 语义、runtime pending、安全/隐私、恢复面与反向破坏。
- 未批准 Subagent；两轮由当前 Agent 使用不同 checklist 自对抗，不能表述为独立审查者。

## 验证命令

- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual`
- `corepack pnpm@10.15.1 exec prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-14-p0-remediation-global-static-regression-baseline-freeze.md docs/05-execution-logs/evidence/2026-07-14-p0-remediation-global-static-regression-baseline-freeze.md docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-global-static-regression-baseline-freeze.md docs/05-execution-logs/audits-reviews/2026-07-15-p0-remediation-static-baseline-v2.yaml docs/05-execution-logs/audits-reviews/2026-07-15-p0-remediation-p1-p2-impact-map.yaml`
- Module Run v2 pre-commit/module-closeout/pre-push scripts for this task。

## 暂停条件

- 35 P0 无法逐项关联有效静态证据，或两轮复核发现新的 P0/P1 回归。
- 需求/审计/实现证据出现无法按来源层级消解的冲突。
- 需要业务源码、依赖、schema/migration、数据库、Provider、secret/env、runtime/browser/e2e、PR、force push 或部署。

本任务为 docs/governance/static verification；现有串行 Goal 与 standing authorization 已覆盖本地提交、ff-only master 合入、origin/master push 和同步后清理。
