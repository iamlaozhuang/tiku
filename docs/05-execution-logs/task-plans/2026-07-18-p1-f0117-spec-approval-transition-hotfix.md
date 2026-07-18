# P1 F-0117 Spec Approval Transition Hotfix Plan

日期：2026-07-18

任务：`p1-f0117-spec-approval-transition-hotfix-2026-07-18`

父任务：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`

基线：`366f17446e9fc75a777ebfe5977ad72db1062eb7`

分支：`codex/p1-f0117-spec-approval-transition-hotfix`

## Goal

以一个单父、一次性、可审计治理提交，将 F-0117 已获当前用户书面批准的 `currentExecutionGate` 从 `waiting_for_spec_review` 精确物化为 `satisfied`；不修改产品、schema、migration source，不执行或连接数据库，并保持所有普通 `in_progress` SHA drift hard-block。

## Architecture

沿用 F-0116 exact-hotfix 模式，在 P1 pre-commit/pre-push、Module pre-commit/pre-push 中增加固定父任务、固定 base、固定分支、精确 12 文件、精确 state/queue projection、未物化授权和两轮审查合同。P1 仅在 exact candidate 成立时输出 `transition_only`；Module pre-push 仅在 `transition_only` 且提交为 base 的唯一直接子提交时接受 ancestor checkpoint。`.husky/pre-push` 继续复用既有编排，不修改。

## 已读取规范与先例

- `D:/tiku/AGENTS.md`、`docs/03-standards/code-taste-ten-commandments.md`、ADR-001 至 ADR-007。
- 标准/高级版需求索引、edition-aware authorization requirements、相关授权 module/story、2026-07-02 redeem-code 决策。
- 当前 project state、task queue、F-0117 authorization/spec/design plan 与独立产品 implementation plan。
- F-0116 designPath、scope-correction 热修的 authorization/plan/evidence/audit、P1/Module guards 与 smoke。

## Authorization Provenance

- 当前用户已批准 F-0117 方案 A、仅 schema/migration source、书面规格和执行，并明确要求本独立治理热修物化 gate。
- 既有 standing authorization：`docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md`。
- 本热修授权：`docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-spec-approval-transition-hotfix-authorization.md`。
- ancestor checkpoint 仅在 P1/Module exact `transition_only` 守卫成功后使用；普通 `in_progress` SHA drift、generic fallback、standard mode 均继续 hard-block。

## Allowed Files

1. `docs/04-agent-system/state/project-state.yaml`
2. `docs/04-agent-system/state/task-queue.yaml`
3. `docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-spec-approval-transition-hotfix-authorization.md`
4. `docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md`
5. `docs/05-execution-logs/evidence/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md`
6. `docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md`
7. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
8. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
11. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Blocked Files And Actions

- `.husky/pre-push`（除非新的 RED 证明既有编排无法传递 `transition_only`；当前预期不修改）。
- `src/**`、`tests/**`、`drizzle/**`、`migrations/**`、`seed/**`、package/lockfile、env、Provider、browser/runtime、P2、PR、force-push、deploy。
- 任何数据库连接、读取、写入、SQL、`migrate`、`push`、backfill、seed。
- wildcard allowlist、普通 `in_progress` ancestor fallback、多个 parent、多个提交、重放、未授权 state/queue 自修改。
- 主产品 worktree 及其唯一未跟踪 implementation plan。

## Exact Projection

state 与 queue 中父任务的 `currentExecutionGate` 必须且只能改为：

```yaml
currentExecutionGate:
  status: satisfied
  reason: current_user_approved_written_f0117_spec_2026_07_18
  approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md
  resumeAction: execute_f0117_redeem_code_nullable_deadline_plan_red_to_green
```

state 的三个 repository checkpoint 仅从 `f6b14825f41a83b3f9dd3994ec9c1936876b12ff` 精确同步为本热修 base `366f17446e9fc75a777ebfe5977ad72db1062eb7`，不得改变 task status、WIP、产品 allowlist 或 capabilities。

## TDD Steps

1. 在三套 smoke 加入 F-0117 exact markers 和 disposable fixture，先运行并捕获生产 guard 缺失导致的 RED。
2. RED 必须覆盖 exact positive path，以及 wrong branch/base/task/gate projection、缺失/篡改授权、extra file、产品/source file、partial stage、standard mode、replay/multi-commit 和普通无关 `in_progress` SHA drift。
3. 最小 GREEN：只复制并重命名 F-0116 exact one-time pattern，加入 state/queue exact projection 和更具体诊断；不改 generic gate。
4. 运行 focused smoke、三套完整 smoke、P1 manual、P0、Module pre-commit 和 synthetic Module pre-push `transition_only` topology。
5. 写脱敏 evidence 与两轮对抗审查，复查完整 diff、secret/placeholder、scope/status；全部 GREEN 后创建恰好一个治理提交。

## Validation Commands

- PowerShell parser：六个受影响 guard/smoke 文件。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-f0117-spec-approval-transition-hotfix-2026-07-18`
- synthetic committed master fixture：Module pre-push `standard` 必须 hard-block，`transition_only` 必须通过且输出 exact-one-parent；额外提交和 unrelated in-progress drift 必须 hard-block。
- `git diff --check`
- `npm.cmd run format:check`
- 对 exact 12 文件执行 secret/placeholder scan、`git diff --name-status`、`git status --short`、branch/base/parent/scope 检查。
- 再次检查主产品 worktree 仍只有 `docs/superpowers/plans/2026-07-18-redeem-code-nullable-deadline.md` 一个未跟踪文件。

## Stop Conditions

- exact 12-file、single-parent、single-commit、fixed-base path 无法表达，必须 wildcard 或 generic bypass；
- 普通 `in_progress` SHA drift、standard mode、wrong authorization、extra/product file 中任一可通过；
- 需要修改 `.husky/pre-push`、产品/schema/migration source、package/lockfile 或执行数据库；
- state/queue 无法通过唯一 anchor 精确投影，或需要改变 task status、WIP、产品 allowlist/capabilities；
- 主产品 worktree 出现额外变化。
