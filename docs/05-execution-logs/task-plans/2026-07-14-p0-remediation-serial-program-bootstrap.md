# P0 Remediation Serial Program Bootstrap Plan

Date: 2026-07-14

Task ID: `p0-remediation-serial-program-bootstrap-2026-07-14`

Branch: `codex/p0-remediation-startup-v1`

Task kind: `mechanism_hardening`

## Objective

关闭已经物化但尚未提交的 “P0 整改启动包 v1.0”，并把用户已批准的
`RC-01 -> RC-08 -> P0 全局静态回归与新基线冻结` 串行目标写入可恢复、可阻断跳步、WIP=1 的仓库治理状态。

本任务只修改治理脚本、Git hooks、状态、计划和证据，不修改产品源码、产品测试、依赖、schema、migration、
外部配置或只读审计仓库。

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/lean-module-run-v3-governance.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`

## Requirement Decision Map

- 产品需求 SSOT 不在本任务中改变；`docs/01-requirements/00-index.md` 仅用于确认 P0 串行整改涉及的产品域和
  后续 RC 必须回到正式 requirement module、story、traceability 的读取入口。
- 用户在当前线程明确批准：RC-01 至 RC-08 串行、WIP=1、每簇独立计划/分支/测试/两轮复核/evidence/提交，
  ff-only 合入 `master`、普通推送 `origin/master`、清理后再领取下一簇；RC-08 后执行 P0 全局静态回归和基线冻结。
- 用户未批准 PR、force push、部署、21 项 runtime 验收，也未以该总目标批准依赖、schema/migration、数据库、
  Provider、secret/env 或外部服务动作。
- 已关闭的 Content Admin Platform B-F Program 保留为历史事实。它的 Guard 必须继续校验自身闭环，但不得永久
  占用全局 `currentTask`，否则新批准 Program 无法进入现行 Module Run 门禁。

## Requirement Mapping

- 本任务只落实执行治理：目标顺序、WIP=1、恢复入口、审批边界、scope allowlist、两轮复核和 Git closeout。
- P0 产品行为映射仍由
  `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md` 与
  `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml` 持有。
- 本任务不把任何 finding 标记为已修复，不重写只读审计仓库，不提前执行 P1/P2 整改或 runtime validation。

## Evidence-Only Sources

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`
- `D:/tiku-readonly-audit/**`：只读原始审计证据，不是需求 SSOT，不修改。

## Conflict Check

- `project-state.yaml` 和 `task-queue.yaml` 当前只记录已关闭 F5，无法承载新 Goal；这是恢复状态缺口，不是产品需求冲突。
- 现有 Content Admin Platform Guard 把其已关闭 terminal task 与全局 `currentTask` 绑定。该约束适用于 Program
  活跃期，但 Program 关闭后会阻断后继 Program。修复必须保持旧 Program 的 order、completed、checkpoint、
  deployment 等闭环验证，只解除关闭 Program 对全局活动指针的所有权。
- 用户的当前明确指令提供本 Program 的 commit、ff-only merge、`origin/master` push 和清理授权；权限只在每个
  task 的 `closeoutPolicy` 物化后生效。
- 未发现需要用户决策的需求冲突。若后续 RC 证明必须修改 schema/migration、依赖或执行 runtime/数据库/
  Provider 验证，则按用户设定的暂停条件申请 fresh approval。

## Baseline And Entry Facts

- `master`、本地 `origin/master`、实时远端 `master`：
  `7aac83765ca4b650b73b1612013e26a0111775ae`，ahead/behind `0/0`。
- 当前隔离 worktree：`D:/tiku/.worktrees/p0-remediation-startup-v1`。
- 当前分支：`codex/p0-remediation-startup-v1`。
- 启动包四个文件为本分支未跟踪且任务内文件；无产品源码改动。
- `D:/tiku-readonly-audit`：`a84224fa12ec85b28e6acd945deba2afa28c6c02`，工作区 clean。

## Allowed Files

- `.husky/pre-commit`
- `.husky/pre-push`
- `scripts/agent-system/Test-ContentAdminPlatformSerialProgram.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformSerialProgram.Smoke.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.Smoke.ps1`
- `scripts/agent-system/Test-P0RemediationSerialProgram.ps1`
- `scripts/agent-system/Test-P0RemediationSerialProgram.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-14-p0-remediation-serial-standing-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-14-p0-remediation-serial-program.md`
- `docs/05-execution-logs/task-plans/2026-07-14-p0-remediation-serial-program-bootstrap.md`
- `docs/05-execution-logs/task-plans/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-serial-program-bootstrap.md`
- `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-serial-program-bootstrap.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`

## Blocked Files And Actions

- `src/**`、`tests/**`、`e2e/**`、`src/db/schema/**`、`drizzle/**`、`migrations/**`、`seed/**`
- `package.json`、所有 lockfile、`.env*`、外部配置
- `D:/tiku-readonly-audit/**`
- PR、force push、部署、runtime acceptance、数据库/Provider/外部服务动作
- P1/P2 整改和 RC-01 产品实现

## Implementation Plan

1. 先为“已关闭历史 Program 可与新活动 Program 共存”增加 recovery/serial smoke 负转正用例，运行并记录 RED。
2. 新建 P0 Program Guard smoke，覆盖正例，以及重排、跳任务、WIP>1、未完成 closeout、scope 越界、审批越界、
   deployment 自动授权、制品缺失等负例；先记录缺失实现的 RED。
3. 最小修改旧 Content Admin Platform Guard：关闭 Program 继续完整校验自身状态，但不再要求全局
   `currentTask`/`activeTasks` 归属旧 terminal task。
4. 新建 P0 Program Guard；从 serial plan 读取 canonical order，校验 state/queue 投影、WIP=1、顺序、前置任务
   checkpoint、制品、closeoutPolicy、allowed/blocked files 和 deployment/blocked capabilities。
5. 在 pre-commit/pre-push hooks 挂载 P0 Guard；保留旧 Content Admin Platform Guard 和 recovery checks。
6. 物化 P0 standing authorization、serial plan、state/queue Program 与 bootstrap task；旧 Content Program 原样保留 closed。
7. 完成 focused smoke、Module Run、格式、diff、安全扫描和恢复演练；写 evidence 与两轮对抗式 audit。
8. 只在全部门禁通过后提交，ff-only 合入 `master`，在 fresh checkout 验证，普通推送 `origin/master`，确认远端
   同步后清理 worktree/短分支；随后领取 RC-01。

## TDD Contract

- RED-A：当 Content Admin Platform Program 为 `closed` 且全局 `currentTask` 指向另一 Program 时，旧 Guard 当前错误阻断。
- GREEN-A：旧 Program 自身闭环仍完整验证，同时不占用全局活动指针；对旧 Program 内部 order/checkpoint/deployment
  的负例继续阻断。
- RED-B：P0 Guard 尚不存在，P0 串行状态无法被机器验证。
- GREEN-B：P0 Guard 正例通过，至少覆盖重排、跳任务、多 WIP、checkpoint 不完整、scope 越界、审批越界、部署
  越权和制品缺失负例。

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformSerialProgram.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationSerialProgram.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.ps1 -RepositoryRoot .`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-serial-program-bootstrap-2026-07-14`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-serial-program-bootstrap-2026-07-14`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-serial-program-bootstrap-2026-07-14 -SkipRemoteAheadCheck`
- `npm.cmd exec -- prettier --write <changed governance/doc files>`
- `npm.cmd exec -- prettier --check <changed governance/doc files>`
- `git diff --check`
- `git status --short --branch`
- `git diff --name-only 7aac83765ca4b650b73b1612013e26a0111775ae -- src tests e2e package.json package-lock.json pnpm-lock.yaml src/db/schema drizzle migrations`
- 对 `D:/tiku-readonly-audit` 重跑 HEAD/tree/status/hash 完整性检查。

## Adversarial Review Plan

- Round 1：攻击 Program 根因、状态机、WIP=1、canonical order、checkpoint、allowlist、关闭历史 Program 共存逻辑，
  并验证没有通过同步篡改 state/queue 静默重排。
- Round 2：攻击审批扩大、Git closeout、远端目标、hook 覆盖、敏感信息、恢复演练、产品源码污染和只读审计仓库污染。
- 两轮由当前 Agent 自对抗执行；未经批准不使用 Subagent，也不声称独立审查者复核。

## Stop Conditions

- 需求/ADR/traceability 出现无法消解冲突。
- 需要修改产品源码、产品测试、依赖、schema/migration、数据库、Provider、secret/env、部署或 runtime acceptance。
- scope、远端或审计基线发生未解释漂移。
- focused smoke、Module Run、fresh checkout 或恢复门禁无法在本任务范围内修复。
- evidence 需要暴露敏感数据。
