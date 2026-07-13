# Lean Module Run v3 执行方案

日期：2026-07-13

任务：`content-admin-platform-m1-lean-module-run-v3-2026-07-13`

分支：`codex/lean-module-run-v3`

基线：`master == origin/master == 7dbe50540d72c380f413f96c401c91d5175037f3`

执行方式：当前线程串行执行；用户明确禁止 Subagent。产品部署不在本任务范围内。

## 目标

在不修改产品功能、依赖、数据库或部署配置的前提下，把 Batch B–F 的执行机制升级为 Lean Module Run v3：以 R0–R3 风险画像驱动制品、验证和审查；以串行总计划作为 canonical task order 单一事实源；以 Guard 阻断降级验证、漏审查、越界、跳任务、静默重排和部署越权。

## SSOT Read List

### Always

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

### Program 与授权

- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-program-init.md`
- `docs/05-execution-logs/evidence/2026-07-13-content-admin-platform-program-init.md`
- `docs/05-execution-logs/audits-reviews/2026-07-13-content-admin-platform-program-init-audit.md`

### Module Run、closeout 与归档

- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/05-execution-logs/templates/module-run-v2-evidence-template.md`
- `docs/04-agent-system/templates/module-run-v2-execution-package-template.yaml`

## 恢复事实与冲突检查

- `master`、本地 `origin/master` 与远端 `refs/heads/master` 均为 `7dbe50540d72c380f413f96c401c91d5175037f3`；主工作区 clean。
- 既有 B0 worktree/短分支与 master 同 SHA、无改动，是 Program Init 的预领取占位；M1 将先把 B0 恢复为 pending，再安全清理该占位。
- 当前串行总计划明确 B→D→C→E→F；本次用户授权在 B0 前增加 M1、M2，不改变 B–F 内部顺序。
- 现有 Guard 只比较 state/queue 的重复 `orderedTaskIds`，因此二者可同步重排；现有 hook 还在 pre-commit 重复运行 lint/typecheck。两者均与 Lean v3 目标不符。
- 未发现 requirements、ADR、traceability 或 standing authorization 的实质冲突；部署继续需要 fresh approval。

## 文件边界

允许修改：

- `.husky/pre-commit`
- `.husky/pre-push`
- `scripts/agent-system/Test-ContentAdminPlatformSerialProgram.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformSerialProgram.Smoke.ps1`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/lean-module-run-v3-governance.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-13-lean-module-run-v3.md`
- `docs/05-execution-logs/evidence/2026-07-13-lean-module-run-v3.md`
- `docs/05-execution-logs/audits-reviews/2026-07-13-lean-module-run-v3-audit.md`

禁止修改或执行：

- `src/**`、`tests/**`、`e2e/**`、产品 API、运行时与产品测试；
- `package.json`、lockfile、依赖、测试框架；
- `.env*`、凭证值、Provider、数据库、schema、migration、fixture、seed；
- staging、production、cloud、deploy、PR、force push、Cost Calibration Gate；
- A01–A30 或任何无新鲜基线失败证据的已关闭问题。

## 设计

1. 串行总计划中的执行画像表是 canonical task order 与 B0–F5 风险画像的唯一事实源。State/queue 只保存运行指针、状态和引用；Guard 从总计划解析顺序与画像。
2. `executionProfile` 使用 `R0`、`R1`、`R2`、`R3`；每行同时物化 `focusedGates`、`buildRequired`、`fullRegressionPolicy`、`protectedDomains` 与 `reviewMode`。
3. 固定全量节点仅为 B5、D4、C6、E6、F5；其他任务只有命中共享运行时、核心 contract、authorization、AI、依赖、构建配置、测试基础设施或跨域失败触发条件时才升级全量。
4. R0 使用单份精简证据；R1 使用精简 plan/evidence 且两轮审查可写入 evidence；R2/R3 或实质发现使用独立 audit。同一事实只由计划、队列、state 或 evidence 的既定 owner 保存，其他文件只引用。
5. pre-commit 仅执行 Program Guard、Module Run pre-commit 和 staged-file 确定性检查；移除全仓 lint/typecheck。pre-push 只核验 Guard、证据与 closeout 条件，不重复产品全量测试。
6. 重型门禁由任务显式执行并串行运行；ff-only 合入相同提交后仅执行必要的主干确认，不机械重复完整全量。

## TDD 顺序

1. 扩展 Guard smoke fixture，先新增并运行负例：state/queue 同步重排但总计划未改、验证降级、缺少第二轮审查、越界文件、跳任务、部署越权；确认新增用例因 Guard 尚未实现而失败。
2. 最小实现总计划画像解析、canonical order 校验、风险画像字段校验、focused/full gate 防降级、reviewMode 审查制品校验、protectedDomains 与部署阻断。
3. 更新总计划、standing authorization、SOP、索引、hooks、state 与 queue；把 M1/M2 置于 B0 之前并将 B0 恢复为 pending。
4. 运行 smoke 正反例、真实仓库 Guard、PowerShell parser、scoped format、`git diff --check`、Module Run pre-commit/closeout/pre-push。
5. 完成两轮串行对抗式审查；发现同范围问题时修复并重新验证。

## 验收与停止条件

- Guard 正例通过，并明确阻断验证降级、漏审查、越界、跳任务、state/queue 静默重排和部署越权。
- B0–F5 每个任务都有完整 Lean v3 六字段画像；五个固定全量节点准确。
- pre-commit/pre-push 不重复重型全量门禁；产品测试基础设施未变。
- M1 evidence 与独立 audit 完整、无敏感信息；M1 只在验证通过后提交、ff-only 合入、推送和清理。
- 若需要新增依赖、修改产品运行时、执行部署、接触敏感值或发现不可消解业务冲突，立即停止。
