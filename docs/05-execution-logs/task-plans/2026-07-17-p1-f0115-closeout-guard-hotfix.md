# F-0115 closeout 守卫治理热修方案

日期：2026-07-17

任务：`p1-f0115-closeout-guard-hotfix-2026-07-17`

分支：`codex/p1-f0115-closeout-guard-hotfix`

基线：`66a9f526d68c2647a5843da1a9d9c2fe0933cc93`

## 目标

修复 P1 same-task closeout 投影在 `task-queue.yaml` 含合法空行时发生 PowerShell 参数绑定异常的问题；补齐 P1、Module pre-commit 与 Module pre-push 的精确单次治理拓扑及 smoke，恢复 F-0115 状态-only closeout。不得降低任何既有门禁。

## 已读取规范

- `AGENTS.md`、`docs/03-standards/code-taste-ten-commandments.md`。
- `docs/02-architecture/adr/` 全部 ADR-001 至 ADR-007。
- 当前 P1/Module 守卫、对应 smoke、F-0115 任务状态和上一治理热修拓扑。

## 根因与修复策略

`Get-NormalizedCloseoutProjection` 的 `Lines` 参数未声明 `AllowEmptyString`。`task-queue.yaml` 的合法空行会被 PowerShell 参数绑定器拒绝，守卫在比较 closeout 投影前异常退出。最小修复是在该参数上允许空字符串，并用状态-only closeout fixture 固定 RED→GREEN。

治理提交采用固定基线、固定分支、单父提交、精确文件集合与一次性授权。只有本治理提交通过 P1 transition-only 后可使用 ancestor checkpoint；其他 `in_progress` SHA 漂移继续 hard-block。Module pre-commit/pre-push 只为该精确拓扑放行，不改变普通任务 allowlist、敏感信息、术语或 closeout 校验。

## Allowed Files

- `docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-closeout-guard-hotfix-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-closeout-guard-hotfix.md`
- `docs/05-execution-logs/evidence/2026-07-17-p1-f0115-closeout-guard-hotfix.md`
- `docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-closeout-guard-hotfix.md`
- `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
- `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Blocked Files 与权限

- 禁止修改产品源码、测试、schema、migration、依赖、lockfile、env/secret、数据库、Provider、runtime/browser、P2、部署、PR 或 force-push。
- 禁止修改 `project-state.yaml`、`task-queue.yaml`、hook 文件或扩大 F-0115 产品 allowlist。
- 禁止绕过、跳过、降级 P1/P0/Module/ContentAdmin 门禁及敏感信息保护。

## TDD 与验证

1. RED：构造含合法空行的 same-task `in_progress` → `ready_for_closeout` fixture，证明旧守卫异常退出。
2. GREEN：允许 `Lines` 中的空字符串，closeout 投影仍只归一化两个目标状态值。
3. 对抗 smoke：精确文件集、固定基线、固定分支、单父拓扑、一次性授权、APPROVE 唯一性均通过；重复提交、普通 SHA 漂移、额外文件、错误父提交继续 hard-block。
4. 运行 Windows PowerShell parser、P1 smoke、Module pre-commit smoke、Module pre-push smoke、P1 manual、P0 baseline、Module pre-commit/pre-push。

## Stop Conditions

- 若修复需要修改产品任务状态、产品源码、hook、依赖或扩大权限，立即停止。
- 若任一普通 `in_progress` SHA 漂移被允许、任一既有敏感/术语/范围门禁退化，立即停止。
- 若不能以固定单父、精确文件集、一次性授权完成，立即停止并请求新审批。
