# P1 整改机制提速方案

日期：2026-07-17

任务：`p1-remediation-efficiency-mechanism-tuning-2026-07-17`

分支：`codex/p1-remediation-efficiency-mechanism-tuning`

基线：`529ecf24c52eb25d2097cbfdbc595b05f377e6b4`

## 目标

在 F-0115 ready-for-closeout 后、F-0116 物化前，固化一份可复用的 P1 整改效率 SOP：统一 RC 簇 preflight、scope-correction 热修模板、smoke 分层、Subagent 门槛和 disposable Git fixture 复用，减少重复设计与长耗时等待，同时不降低任何质量、证据、审批、WIP=1、敏感信息、P1/Module/P0/ContentAdmin 或 closeout 门禁。

## 已读取规范

- `AGENTS.md`、品味十诫、ADR-001 至 ADR-007。
- P1 program authorization、当前 state/queue、F-0115 evidence/audit 与三次 scope-correction/guard hotfix。
- P1/Module pre-commit/pre-push 守卫及 smoke；既有 closeoutPolicy 与 ancestor checkpoint 约束。

## 实施方案

1. 新增单一 SOP，提供开始 RC 簇前 2 分钟 preflight 和固定 stop decision。
2. 固化治理热修 manifest：固定 base/branch/parent、精确文件集、一次性授权、transition-only、review contract、其他 SHA 漂移 hard-block。
3. 定义 smoke 两层：开发循环只运行解析器与直接受影响核心矩阵；closeout/pre-push 必须运行完整对抗矩阵，快速层不得成为合入证据替代品。
4. 定义 Subagent 门槛：高风险设计、最终审查、跨边界安全保留独立复核；机械 fixture/格式/重复报告不触发层层复核。
5. 定义 disposable Git fixture 基线/对象复用与 sparse checkout，禁止复用可变工作目录或跳过拓扑负例。
6. 复用当前一次性 F-0115 治理 topology 槽，将本提交限定为固定单父、精确 11 文件；不修改 state/queue 或产品任务。

## Allowed Files

- `docs/04-agent-system/sop/p1-remediation-efficiency-loop.md`
- `docs/05-execution-logs/acceptance/2026-07-17-p1-remediation-efficiency-mechanism-tuning-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md`
- `docs/05-execution-logs/evidence/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md`
- `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
- `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Blocked Files 与权限

- 禁止修改 project-state、task-queue、hook、产品源码/测试、schema/migration、依赖/lockfile、env/secret。
- 禁止数据库、Provider、runtime/browser、P2、部署、PR、force-push。
- 禁止让 core smoke 替代 closeout/full smoke，禁止减少既有负例或跳过 review/evidence。

## 验证命令

- 6 个 PowerShell 文件 parser。
- P1 完整 smoke。
- Module pre-commit 完整 smoke。
- Module pre-push 完整 smoke。
- P1 pre-commit、P0 baseline、Module pre-commit。
- `git diff --check` 与两路独立只读对抗复核。

## Stop Conditions

- 若 SOP 或 topology 会允许普通 `in_progress` SHA 漂移、降低 full smoke、扩大权限或污染 active task，立即停止。
- 若不能以固定 base、固定 branch、单 parent、精确 11 文件完成，立即停止。
- 若需要修改 state/queue、hook、产品或依赖，立即停止并请求新审批。
